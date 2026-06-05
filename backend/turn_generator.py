import json
from typing import Dict, Tuple

JSON_MARKER = "<<<TURN_JSON>>>"

SYSTEM_PROMPT = """
你不是普通的事件生成器，你是《人生模拟器》的首席命运编剧。

你要写的不是“年龄+1的小学生日记”，而是一段可能被时代、灾难、赛博科技、魔幻事故、资本洪流、克苏鲁低语、意识上传、冬眠仓故障所撕裂的人生。

你的叙事原则：
1. 人生必须有阶段感：童年、青春期、成年、社会化、崩坏、中年断层、暮年，都可以出现，也可以被直接跳过。
2. 年龄不是线性增加：允许突然长大、停滞、衰老、冻结、返老还童、时间错位。
3. 允许“世界时间”和“肉身年龄”错位：
   - 例如冬眠60年，世界变了，但身体只老1岁；
   - 或闭关50年，世界没怎么变，但你自己老了很多；
   - 或穿越回来时你20岁，外部文明已经迭代三轮。
4. 重大节点要有戏剧性：6岁、12岁、18岁、22岁、30岁、35岁、60岁等节点值得重点塑造，但不必机械经过每一个。
5. 风格必须荒诞、黑色幽默、带互联网/赛博/现实讽刺气息，但逻辑上仍要自洽。
6. 剧情要像“命运突然拐弯”，而不是流水账。

特别机制：
- age: 生理年龄 / 肉身年龄，给玩家看到。
- time_skip: 世界时间额外跳过了多少年。可以为0，也可以很大。
- 当发生“冬眠、穿越、沧海桑田、闭关、意识上传、异世界副本、精神病院时间畸变、资本冷冻、宇宙航行”等事件时，允许大幅操纵 time_skip 与 age。

请始终输出：
- 前半段：剧情正文（给玩家看）
- 后半段：严格JSON（给系统解析）
""".strip()


def build_single_pass_prompt(state: Dict) -> str:
    return f"""
玩家天赋：{json.dumps(state.get('talents', []), ensure_ascii=False)}
当前属性：{json.dumps(state.get('attributes', {}), ensure_ascii=False)}
当前生理年龄：{state.get('age', 0)}
当前世界时间刻度：{state.get('world_age', state.get('age', 0))}
已进行回合：{state.get('turn_count', 0)}
玩家本轮选择：{state.get('last_choice_text', '')}
历史剧情：{state.get('story', '')}

你必须完成两件事，并按以下顺序输出：
1. 先输出“给玩家看的下一回合剧情正文”，控制在120~260字。
2. 然后单独换行输出标记：<<<TURN_JSON>>>
3. 然后紧跟一个严格JSON对象，格式如下：
{{
  "age": 生理年龄数字,
  "time_skip": 世界额外跳过的年份数字,
  "choices": [
    {{"id": "AUTO_A", "text": "选项1"}},
    {{"id": "AUTO_B", "text": "选项2"}},
    {{"id": "AUTO_C", "text": "选项3"}}
  ],
  "attribute_changes": {{"iq": 0, "eq": 0, "phy": 0, "money": 0, "magic": 0}},
  "is_dead": false,
  "death_reason": null
}}

规则：
- JSON之前只能有剧情正文和标记，不要解释。
- 如果角色死亡，choices 返回空数组，is_dead=true。
- age 可以不按 +1 增长；可以小幅增长、大幅增长、停滞，甚至在魔幻事件中异常变化。
- time_skip 用来表示世界额外流逝的时间；若无时空跳跃则为0。
- 允许 age=20 但 time_skip=60 这种“冬眠/冻结/失落时代”效果。
- attribute_changes 只保留变化字段即可。
- 如果体质会降到0或以下，应判定死亡。
- 标记必须精确输出为：<<<TURN_JSON>>>
""".strip()


def split_story_and_json(full_text: str) -> Tuple[str, Dict]:
    if JSON_MARKER not in full_text:
        raise ValueError("模型输出中缺少 TURN_JSON 标记")
    story, json_part = full_text.split(JSON_MARKER, 1)
    story = story.strip()
    json_text = json_part.strip()
    if json_text.startswith("```json"):
        json_text = json_text[7:]
    if json_text.startswith("```"):
        json_text = json_text[3:]
    if json_text.endswith("```"):
        json_text = json_text[:-3]
    return story, json.loads(json_text.strip())


