import json
import random
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from ai_talents import get_random_talents_from_ai
from game_mock import get_random_talents
from graph import game_engine
from minimax_stream import stream_minimax_text
from models import Choice, GameStartRequest, MakeChoiceRequest, Talent, TurnData
from state import create_initial_state
from turn_generator import JSON_MARKER, SYSTEM_PROMPT, build_single_pass_prompt, split_story_and_json



app = FastAPI(title="人生模拟器 API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




MILESTONE_AGES = [6, 12, 18, 22, 30, 35, 40, 50, 60, 75]


def pick_next_age(current_age: int) -> int:
    """
    默认年龄推进逻辑：
    - 普通情况下随机 +1~3 岁
    - 如果未来 1~3 岁内恰好能撞上重大节点，则优先命中重大节点
    """
    candidates = [current_age + 1, current_age + 2, current_age + 3]
    milestone_hits = [age for age in candidates if age in MILESTONE_AGES]
    if milestone_hits:
        return milestone_hits[0]
    return current_age + random.randint(1, 3)


def resolve_next_age(current_age: int, time_skip: int, raw_next_age) -> int:
    if raw_next_age is None:
        return current_age if time_skip > 0 else pick_next_age(current_age)

    try:
        next_age = int(raw_next_age)
    except (TypeError, ValueError):
        return pick_next_age(current_age)

    if time_skip <= 0 and next_age <= current_age:
        return pick_next_age(current_age)

    return next_age



def state_to_turn_data(result_state: dict) -> TurnData:
    return TurnData(
        age=result_state.get("age", 0),
        story=result_state.get("story", ""),
        choices=[Choice(**c) for c in result_state.get("choices", [])],
        attribute_changes=result_state.get("attribute_changes", {}),
        is_dead=result_state.get("is_dead", False),
        time_skip=result_state.get("time_skip", 0),
        death_reason=result_state.get("death_reason"),
    )



def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@app.get("/")
def read_root():
    return {"message": "欢迎来到人生模拟器 API (LangGraph + SSE)"}


@app.get("/api/talents", response_model=List[Talent])
def get_talents(count: int = 10):
    return get_random_talents(count)


@app.get("/api/talents/ai", response_model=List[Talent])
def get_ai_talents():
    return get_random_talents_from_ai()


@app.post("/api/game/start", response_model=TurnData)
async def start_game(request: GameStartRequest):
    initial_state = create_initial_state(
        talents=[t.model_dump() for t in request.selected_talents],
        attributes=request.allocated_points.model_dump(),
    )
    result = await game_engine.ainvoke(initial_state, config={"configurable": {"thread_id": request.session_id}})
    return state_to_turn_data(result)


@app.post("/api/game/choice/stream")
async def make_choice_stream(request: MakeChoiceRequest):
    async def event_generator():
        config = {"configurable": {"thread_id": request.session_id}}
        snapshot = await game_engine.aget_state(config)
        current_state = snapshot.values if snapshot else {}
        state = {
            **current_state,
            "action": "choice",
            "last_choice_id": request.choice_id,
            "last_choice_text": request.choice_text or request.choice_id,
            "attributes": request.current_attributes.model_dump(),
        }

        yield sse("start", {"message": "因果律开始震荡"})
        raw_text = ""
        streamed_story = ""
        marker_emitted = False

        async for event in stream_minimax_text(build_single_pass_prompt(state), system_prompt=SYSTEM_PROMPT):
            if event["type"] == "error":
                yield sse("error", {"message": event["message"]})
                return
            if event["type"] != "delta":
                continue

            raw_text += event["text"]
            if not marker_emitted:
                if JSON_MARKER in raw_text:
                    story_part, _ = raw_text.split(JSON_MARKER, 1)
                    new_text = story_part[len(streamed_story):]
                    if new_text:
                        streamed_story += new_text
                        yield sse("delta", {"text": new_text})
                    marker_emitted = True
                else:
                    streamed_story = raw_text
                    yield sse("delta", {"text": event["text"]})

        story_text, turn_json = split_story_and_json(raw_text)
        changes = turn_json.get("attribute_changes", {})
        time_skip = int(turn_json.get("time_skip", 0) or 0)

        new_attributes = dict(state["attributes"])
        for k, v in changes.items():
            new_attributes[k] = new_attributes.get(k, 0) + v

        current_age = int(state.get("age", 0))
        current_world_age = int(state.get("world_age", current_age))
        next_age = resolve_next_age(current_age, time_skip, turn_json.get("age"))

        next_world_age = current_world_age + (time_skip if time_skip > 0 else max(1, int(next_age) - current_age))



        final_state = {
            "story": story_text,
            "choices": turn_json.get("choices", []),
            "attribute_changes": changes,
            "attributes": new_attributes,
            "age": int(next_age),
            "world_age": int(next_world_age),
            "time_skip": time_skip,
            "turn_count": state.get("turn_count", 0) + 1,
            "is_dead": turn_json.get("is_dead", False) or new_attributes.get("phy", 0) <= 0,
            "death_reason": turn_json.get("death_reason"),
            "action": "choice",
        }
        await game_engine.aupdate_state(config, final_state)
        yield sse("done", state_to_turn_data(final_state).model_dump())

    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


