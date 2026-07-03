import os
import json
import requests
from typing import List
from models import Talent
from pydantic import BaseModel, Field

# MiniMax API 配置
MINIMAX_API_KEY = "YOUR_MINIMAX_API_KEY"
MINIMAX_API_URL = "https://api.minimaxi.com/anthropic/v1/messages"

# 用于严格解析的 Pydantic 模型
class AITalentSchema(BaseModel):
    id: str = Field(..., description="ID, 格式如 t_gen_1")
    name: str = Field(..., description="天赋名称")
    desc: str = Field(..., description="荒诞搞笑的描述，并注明属性影响")
    quality: str = Field(..., description="品质，只能是 gold, purple, blue, black")

class TalentListSchema(BaseModel):
    talents: List[AITalentSchema]


def load_system_prompt() -> str:
    """
    加载本地提示词文件，若失败则使用兜底提示词
    """
    prompt_path = os.path.join(os.path.dirname(__file__), "prompt.md")
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"加载prompt失败: {e}")
        return """你是《人生模拟器》游戏的天赋生成器。
请生成10个荒诞、搞笑、充满黑色幽默的转生天赋。
每个天赋必须包含: id(t_gen_xxx格式), name, desc(包含属性影响), quality(gold/purple/blue/black)。
输出纯JSON格式，不要markdown标记。"""


def get_random_talents_from_ai() -> List[Talent]:
    """
    通过 MiniMax 大模型动态生成 10 个绝不重样的操蛋天赋
    """
    try:
        system_prompt = load_system_prompt()
        
        # 1. 构造符合 MiniMax (Anthropic 兼容) 规格的 payload 结构
        payload = {
            "model": "MiniMax-M3",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"{system_prompt}\n\n现在请立刻为我生成 10 个全新的、充满互联网梗和职场地狱笑话的奇葩转生天赋。直接输出JSON，不要任何markdown标记。"
                        }
                    ]
                }
            ],
            "temperature": 0.95,  # 高随机性，让AI更有创意
            "top_p": 0.9,
            "stream": False,      # 必须是 Python 布尔值 False
            "thinking": {"type": "disabled"}
        }
        
        headers = {
            "Authorization": f"Bearer {MINIMAX_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # ======= 调试语句：打印请求入参 =======
        print("\n==================== [调试] MiniMax API 请求入参 ====================")
        print(f"请求 URL: {MINIMAX_API_URL}")
        print(f"请求头: {json.dumps({k: v if k != 'Authorization' else 'Bearer ******' for k, v in headers.items()}, indent=2)}")
        print(f"请求体 Payload:\n{json.dumps(payload, ensure_ascii=False, indent=2)}")
        print("====================================================================\n")
        
        print("正在调用 MiniMax API 生成天赋...")
        response = requests.post(MINIMAX_API_URL, json=payload, headers=headers, timeout=60)
        
        # ======= 调试语句：打印响应出参 =======
        print("\n==================== [调试] MiniMax API 原始响应 ====================")
        print(f"HTTP 状态码: {response.status_code}")
        print(f"返回文本内容:\n{response.text}")
        print("====================================================================\n")
        
        if response.status_code != 200:
            print(f"MiniMax API 错误: {response.status_code}")
            raise Exception(f"API返回错误: {response.status_code}")
        
        result = response.json()

        # 2. 检查 MiniMax 特有的 base_resp 业务错误
        if "base_resp" in result:
            base_resp = result["base_resp"]
            if base_resp.get("status_code") != 0 and base_resp.get("status_code") != 1000:
                error_msg = base_resp.get("status_msg", "未知错误")
                status_code = base_resp.get("status_code")
                print(f"MiniMax API 业务错误: [{status_code}] {error_msg}")
                raise Exception(f"API业务错误 [{status_code}]: {error_msg}")

        # 3. 解析逻辑：按照 MiniMax / Anthropic 真实格式提取 content
        if "content" not in result or not result["content"]:
            raise Exception("API返回格式异常：缺少 content 字段或 content 为空")
        
        ai_content = result["content"][0].get("text")
        if not ai_content:
            raise Exception("API返回格式异常：content[0] 中未找到 text 内容")

        # 4. 强壮的文本清洗与去 Markdown 标记
        # 替换掉可能导致 json.loads 崩溃的网页全角空格 (\u00a0)
        ai_content = ai_content.replace('\u00a0', ' ').strip()
        
        if ai_content.startswith("```json"):
            ai_content = ai_content[7:]
        elif ai_content.startswith("```"):
            ai_content = ai_content[3:]
        if ai_content.endswith("```"):
            ai_content = ai_content[:-3]
        ai_content = ai_content.strip()
        
        # 5. 反序列化为 JSON 对象
        try:
            ai_data = json.loads(ai_content)
        except json.JSONDecodeError as je:
            print(f"[数据灾难] JSON 解析失败！清洗后的文本为:\n{ai_content}")
            raise Exception(f"大模型返回的不是合法的 JSON 格式: {je}")
        
        # 6. 转换为本地的 Talent 实体对象列表
        final_talents = []
        talents_data = ai_data.get("talents", [])
        
        if not talents_data:
            raise Exception("AI返回的 JSON 中未包含 talents 数组")
        
        for t in talents_data:
            final_talents.append(Talent(
                id=t.get("id", f"t_gen_{len(final_talents)}"),
                name=t.get("name", "未知天赋"),
                desc=t.get("desc", "神秘的天赋"),
                quality=t.get("quality", "blue")
            ))
        
        print(f"🎉 成功生成并解析了 {len(final_talents)} 个AI纯正操蛋天赋！")
        return final_talents[:10]  # 确保最多返回10个

    except Exception as e:
        print(f"\n[错误] AI 生成或后处理失败: {e}")
        print("触发因果律崩溃防御机制，将自动降级使用本地静态天赋库")
        
        # 降级方案：使用本地静态天赋
        try:
            from game_mock import get_random_talents as get_static_talents
            return get_static_talents(10)
        except ImportError:
            print("[警告] 未找到 game_mock 模块，降级失败，返回空列表")
            return []


# 独立运行测试
if __name__ == "__main__":
    print("开始运行测试：MiniMax AI 天赋生成器...")
    talents = get_random_talents_from_ai()
    print(f"\n==================== 最终生成的 {len(talents)} 个天赋结果 ====================")
    for t in talents:
        print(f"  [{t.quality.upper()}] {t.name}: {t.desc}")
    print("=========================================================================")