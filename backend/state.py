"""
LangGraph 游戏状态机的核心状态定义。
"""
from typing import Annotated, Dict, List, Optional, TypedDict

from langgraph.graph.message import add_messages


class GameState(TypedDict):
    messages: Annotated[list, add_messages]
    talents: List[Dict]
    attributes: Dict[str, int]
    attribute_changes: Dict[str, int]
    age: int
    world_age: int
    time_skip: int
    turn_count: int
    story: str
    choices: List[Dict]
    last_choice_text: Optional[str]
    is_dead: bool
    death_reason: Optional[str]


def create_initial_state(talents: List[Dict], attributes: Dict[str, int]) -> GameState:
    return GameState(
        messages=[],
        talents=talents,
        attributes=attributes,
        attribute_changes={},
        age=0,
        world_age=0,
        time_skip=0,
        turn_count=0,
        story="",
        choices=[],
        last_choice_text=None,
        is_dead=False,
        death_reason=None,
    )

