import json
from typing import AsyncGenerator, Dict, Optional

import httpx

MINIMAX_API_KEY = ""
MINIMAX_API_URL = "https://api.minimaxi.com/anthropic/v1/messages"
MODEL_NAME = "MiniMax-M3"


async def stream_minimax_text(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.9,
) -> AsyncGenerator[Dict, None]:
    """
    将 MiniMax 流式响应统一为内部事件格式。

    yield 结构：
    - {"type": "delta", "text": "..."}
    - {"type": "done", "full_text": "..."}
    - {"type": "error", "message": "..."}
    """
    payload = {
        "model": MODEL_NAME,
        "max_tokens": 2048,
        "temperature": temperature,
        "stream": True,
        "thinking": {"type": "disabled"},
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
    }
    if system_prompt:
        payload["system"] = system_prompt

    headers = {
        "Authorization": f"Bearer {MINIMAX_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    full_text = ""
    async with httpx.AsyncClient(timeout=90.0) as client:
        try:
            async with client.stream("POST", MINIMAX_API_URL, json=payload, headers=headers) as response:
                if response.status_code != 200:
                    text = await response.aread()
                    yield {
                        "type": "error",
                        "message": f"MiniMax HTTP {response.status_code}: {text.decode('utf-8', errors='ignore')}",
                    }
                    return

                async for line in response.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    raw = line[5:].strip()
                    if raw == "[DONE]":
                        break
                    try:
                        data = json.loads(raw)
                    except Exception:
                        continue

                    event_type = data.get("type", "")
                    if event_type == "content_block_delta":
                        delta = data.get("delta", {})
                        text = delta.get("text", "")
                        if text:
                            full_text += text
                            yield {"type": "delta", "text": text}
                    elif event_type == "message_delta":
                        continue
                    elif event_type == "message_stop":
                        break
                    elif "error" in data:
                        yield {"type": "error", "message": str(data["error"])}
                        return

                yield {"type": "done", "full_text": full_text}
        except Exception as e:
            yield {"type": "error", "message": f"MiniMax 流式调用失败: {e}"}
