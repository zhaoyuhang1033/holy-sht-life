from typing import Dict, List, Optional

from pydantic import BaseModel


class Talent(BaseModel):
    id: str
    name: str
    desc: str
    quality: str


class Attribute(BaseModel):
    iq: int = 5
    eq: int = 5
    phy: int = 5
    money: int = 5
    magic: int = 0


class Choice(BaseModel):
    id: str
    text: str


class TurnData(BaseModel):
    age: int
    story: str
    choices: List[Choice]
    attribute_changes: Dict[str, int]
    is_dead: bool
    time_skip: int = 0
    death_reason: Optional[str] = None


class GameStartRequest(BaseModel):
    selected_talents: List[Talent]
    allocated_points: Attribute
    session_id: str


class MakeChoiceRequest(BaseModel):
    choice_id: str
    current_attributes: Attribute
    choice_text: Optional[str] = None
    session_id: str

