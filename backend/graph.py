from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from nodes import game_over_node, intro_node, next_turn_node
from state import GameState


def route_by_action(state: GameState) -> str:
    return "intro" if state.get("action") == "start" else "next_turn"


def route_life_or_death(state: GameState) -> str:
    return "game_over" if state.get("is_dead") else "end"


builder = StateGraph(GameState)

builder.add_node("intro", intro_node)
builder.add_node("next_turn", next_turn_node)
builder.add_node("game_over", game_over_node)

builder.add_conditional_edges(
    START,
    route_by_action,
    {
        "intro": "intro",
        "next_turn": "next_turn",
    },
)

builder.add_conditional_edges(
    "intro",
    route_life_or_death,
    {
        "game_over": "game_over",
        "end": END,
    },
)

builder.add_conditional_edges(
    "next_turn",
    route_life_or_death,
    {
        "game_over": "game_over",
        "end": END,
    },
)

builder.add_edge("game_over", END)

checkpointer = MemorySaver()
game_engine = builder.compile(checkpointer=checkpointer)
