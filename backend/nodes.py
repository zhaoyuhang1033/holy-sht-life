from typing import Dict, List

from langchain_core.messages import AIMessage, HumanMessage

from game_mock import get_story_data
from state import GameState


def _apply_attribute_changes(attributes: Dict[str, int], changes: Dict[str, int]) -> Dict[str, int]:
    new_attrs = dict(attributes)
    for key, value in changes.items():
        new_attrs[key] = new_attrs.get(key, 0) + value
    return new_attrs


def _choices_to_dicts(choices: List) -> List[Dict]:
    return [{"id": c.id, "text": c.text} for c in choices]


def intro_node(state: GameState) -> GameState:
    turn = get_story_data("START")
    return {
        "messages": [
            HumanMessage(content="玩家完成投胎，人生从0岁开始。"),
            AIMessage(content=turn.story),
        ],
        "story": turn.story,
        "choices": _choices_to_dicts(turn.choices),
        "attribute_changes": turn.attribute_changes,
        "age": turn.age,
        "turn_count": 1,
        "is_dead": turn.is_dead or state["attributes"].get("phy", 0) <= 0,
        "death_reason": turn.death_reason,
        "action": "choice",
    }


def next_turn_node(state: GameState) -> GameState:
    choice_id = state.get("last_choice_id") or "START"
    turn = get_story_data(choice_id)
    new_attrs = _apply_attribute_changes(state["attributes"], turn.attribute_changes)
    is_dead = turn.is_dead or new_attrs.get("phy", 0) <= 0

    selected_text = state.get("last_choice_text") or choice_id
    return {
        "messages": [
            HumanMessage(content=f"玩家选择了：{selected_text}"),
            AIMessage(content=turn.story),
        ],
        "story": turn.story,
        "choices": _choices_to_dicts(turn.choices),
        "attribute_changes": turn.attribute_changes,
        "attributes": new_attrs,
        "age": turn.age,
        "turn_count": state.get("turn_count", 0) + 1,
        "is_dead": is_dead,
        "death_reason": turn.death_reason,
        "action": "choice",
    }


def game_over_node(state: GameState) -> GameState:
    age = state.get("age", 0)
    death_reason = state.get("death_reason") or f"享年{age}岁，死于命运连续暴击。"
    summary = f"{state.get('story', '')}\n\n墓志铭：{death_reason}"
    return {
        "messages": [AIMessage(content=summary)],
        "story": summary,
        "choices": [],
        "is_dead": True,
        "death_reason": death_reason,
        "action": "finished",
    }

