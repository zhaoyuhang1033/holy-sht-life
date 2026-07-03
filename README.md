# 🚀 项目设计与系统架构说明书：【人生模拟器】(H5)

## 1. 项目定位
- **项目名称**：人生模拟器（What a F**ked Up Life）
- **类型**：移动端 H5 文字 Roguelike + 动态 AI 人生叙事游戏
- **核心气质**：荒诞、黑色幽默、命运捉弄、赛博怪诞、互联网地狱笑话
- **核心体验**：玩家不是在“看故事”，而是在“经历一段被命运疯狂篡改的人生”

---

## 2. 游戏设计概览
游戏流程分为四个阶段：
`WELCOME 天赋抽卡 -> ALLOCATE 属性配点 -> PLAYING 人生推进 -> SUMMARY 墓志铭结算`

### 2.1 天赋系统
- 天赋由后端 AI 动态生成（MiniMax）
- 玩家每次抽取 10 个候选天赋，最多选择 3 个
- 天赋品质：`gold / purple / blue / black`
- 天赋风格：职场、互联网、赛博朋克、克苏鲁、元宇宙、AI 时代讽刺

### 2.2 属性系统
- `iq`：智商 / 学习与推理能力
- `eq`：情商 / 社交与处世能力
- `phy`：体质 / 健康与生存能力
- `money`：家境 / 资源与阶层条件
- `magic`：魔幻度 / 怪事、超自然与时间错乱概率

### 2.3 时间系统（重点机制）
本项目不是“每回合 +1 岁”的线性人生，而是支持：
- **默认年龄推进**：通常为 `+1 ~ +3 岁`
- **重大节点优先命中**：6、12、18、22、30、35、40、50、60、75 岁等更容易被命中
- **时空跳跃**：允许出现冬眠、穿越、意识上传、闭关、宇宙航行、精神时间错位等事件

系统拆分两个时间概念：
- `age`：**生理年龄 / 肉身年龄**（前端主要展示）
- `world_age`：**世界流逝年龄 / 年代刻度**（后端状态）
- `time_skip`：**本回合世界额外跳过的时间**

示例：
- `age = 20, time_skip = 60`：你 20 岁，但世界已经快进 60 年
- `age = 70, time_skip = 50`：你闭关 50 年，世界与肉身一起老去

---

## 3. 前端设计（React H5）
### 3.1 设计原则
- 单屏沉浸：`h-screen flex flex-col overflow-hidden`
- 深色霓虹：`slate-950 / amber / purple / emerald / rose`
- 大拇指操作：关键选项集中在底部三分之一，按钮高度 >= 48px
- 安全区适配：`pb-[env(safe-area-inset-bottom)]`

### 3.2 核心页面
#### WELCOME
- 首屏不是默认抽卡，而是一个巨大且搞怪的 `AI 命运摇号` 按钮
- 点击后触发 AI 生成天赋
- 摇号时有专门的赛博 loading 动效

#### ALLOCATE
- 玩家分配自由属性点
- 支持手动配点与“看天意（随机分配）”
- 点数分配完成后投胎进入人生

#### PLAYING
- 顶部：4 个属性条，支持属性变化飘字动画
- 中部：剧情区，支持普通打字机与 **SSE 流式缓冲打字**
- 底部：选项区，玩家推动命运分支

#### SUMMARY
- 展示死亡结局与墓志铭
- 支持“再来一世”与分享

---

## 4. 后端系统设计（FastAPI + LangGraph + MiniMax）
### 4.1 技术栈
- **FastAPI**：HTTP API / SSE 流接口
- **LangGraph**：多轮因果状态机
- **MemorySaver**：线程级存档 / 断点续玩
- **MiniMax**：动态天赋生成 + 动态剧情生成

### 4.2 状态机设计
后端通过 `GameState` 持有整局人生状态，关键字段包括：
- `messages`：大模型上下文消息队列（`add_messages`）
- `talents`
- `attributes`
- `age`
- `world_age`
- `time_skip`
- `turn_count`
- `story`
- `choices`
- `is_dead`
- `death_reason`

### 4.3 LangGraph 节点
- `intro_node`：出生与人生起点
- `next_turn_node`：选择后的因果推进
- `game_over_node`：死亡结算与墓志铭

并通过 `add_conditional_edges` 判断：
- 是否继续人生
- 是否进入死亡结算

### 4.4 存档机制
使用 `MemorySaver` 作为 checkpointer：
- `thread_id = session_id`
- 同一个玩家 session 可断点续玩
- 后续可扩展为数据库持久化存档

---

## 5. SSE 流式输出设计
### 5.1 为什么使用 SSE
人生剧情是典型的“服务端持续单向推送文本”场景，因此选择：
- **SSE (Server-Sent Events)**
- 相比 WebSocket 更轻、更适合文本叙事推送

### 5.2 当前协议
后端接口：`POST /api/game/choice/stream`

事件类型：
- `start`：开始生成
- `delta`：剧情正文增量
- `done`：结构化回合结果（age / choices / attribute_changes / is_dead / time_skip）
- `error`：错误信息

### 5.3 单次请求双阶段协议
当前不是“两次模型调用”，而是**单次请求**输出：
1. 先流式输出给玩家看的剧情正文
2. 后半段输出 `<<<TURN_JSON>>>` + 严格 JSON

后端只把 `<<<TURN_JSON>>>` 前的正文通过 SSE 推给前端，随后在服务端解析：
- `age`
- `time_skip`
- `choices`
- `attribute_changes`
- `is_dead`
- `death_reason`

### 5.4 前端缓冲打字效果
由于后端是“按段推送”，前端额外做了一层**缓冲区**：
- 先接收 chunk
- 存入本地 queue
- 再按固定节奏逐字/逐小段吐到屏幕上

这样用户看到的是：
- 不是整段跳出
- 而是更自然的“流式打字”体验

---

## 6. MiniMax 提示词策略
### 天赋生成
- 使用独立 Prompt 生成 10 个高离谱度天赋
- 强调黑色幽默、互联网梗、AI 时代、赛博怪诞

### 剧情生成
系统提示词明确要求：
- 不要写流水账人生
- 可以发生时间错位、冬眠、穿越、闭关、文明迭代
- 允许肉身年龄和世界时间分离
- 重大年龄节点要更有戏剧性

---

## 7. 关键接口
- `GET /api/talents`：静态天赋库
- `GET /api/talents/ai`：AI 动态天赋
- `POST /api/game/start`：开始人生
- `POST /api/game/choice/stream`：流式推进人生

---

## 8. 启动项目

### 8.1 启动后端
PowerShell / Windows:
```powershell
cd backend
.\venv313\Scripts\python.exe -m pip install -r requirements.txt
.\venv313\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

如果是在 macOS / Linux 环境中使用 `python3`：
```bash
cd backend
python3 -m venv venv313
source venv313/bin/activate
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端接口文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 8.2 启动前端
```bash
npm install
npm run dev
```

前端默认访问地址：
- http://localhost:3000

### 8.3 构建前端
```bash
npm run build
```
---

## 9. 当前方向与后续扩展
### 已实现
- React H5 单屏体验
- AI 天赋生成
- LangGraph 状态机
- SSE 流式剧情输出
- 非线性年龄推进
- 时空跳跃 / time_skip 机制

### 可继续扩展
- `/api/game/start/stream` 出生剧情流式化
- 世界时间前端可视化（如：`世界已流逝 60 年`）
- 更强的墓志铭生成器
- 真正的数据库存档系统
- 更复杂的人生阶段导演逻辑
