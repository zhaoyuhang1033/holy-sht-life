# 人生模拟器 - 前后端集成指南

## 项目结构

```
Holy-Sht-Life/
├── backend/              # FastAPI 后端
│   ├── main.py          # 主入口
│   ├── models.py        # 数据模型
│   ├── game_mock.py     # 游戏数据
│   └── requirements.txt # Python依赖
├── src/                 # React 前端
│   ├── api/
│   │   └── gameApi.ts   # API调用层
│   ├── components/      # UI组件
│   ├── context/         # 状态管理
│   └── mock/            # 旧的Mock数据（已废弃）
└── package.json
```

## 后端部署步骤

### 1. 安装Python依赖

由于网络问题，请手动安装依赖：

```bash
cd backend

# 方式1：使用国内镜像（推荐）
pip install -i https://mirrors.aliyun.com/pypi/simple/ fastapi uvicorn[standard] pydantic python-multipart

# 方式2：如果有代理问题，先取消代理
set HTTP_PROXY=
set HTTPS_PROXY=
pip install fastapi uvicorn[standard] pydantic python-multipart

# 方式3：离线安装（需要先下载whl文件）
pip install fastapi-0.109.0-py3-none-any.whl
```

### 2. 启动后端服务

```bash
cd backend
python main.py
```

或者：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

启动成功后，访问 http://localhost:8000/docs 查看API文档

### 3. 测试后端接口

```bash
# 测试根路径
curl http://localhost:8000/

# 测试获取天赋
curl http://localhost:8000/api/talents?count=10
```

## 前端启动步骤

前端已经配置完成，直接启动即可：

```bash
npm run dev
```

访问 http://localhost:3000

## API接口说明

### 1. 获取随机天赋
```
GET /api/talents?count=10

Response:
[
  {
    "id": "t1",
    "name": "社恐体质",
    "desc": "你天生害怕人群，情商-2，但智商+3",
    "quality": "blue"
  },
  ...
]
```

### 2. 开始游戏
```
POST /api/game/start

Request:
{
  "selected_talents": [...],
  "allocated_points": {
    "iq": 2,
    "eq": 3,
    "phy": 5,
    "money": 5,
    "magic": 0
  }
}

Response: TurnData
{
  "age": 0,
  "story": "你降生在这个操蛋的世界...",
  "choices": [...],
  "attribute_changes": {},
  "is_dead": false
}
```

### 3. 提交选择
```
POST /api/game/choice

Request:
{
  "choice_id": "C1_A",
  "current_attributes": {...}
}

Response: TurnData (下一回合数据)
```

## 前后端通信流程

```
用户打开游戏
    ↓
前端调用 GET /api/talents
    ↓
用户选择3个天赋
    ↓
用户分配属性点
    ↓
前端调用 POST /api/game/start
    ↓
显示剧情和选项
    ↓
用户点击选项
    ↓
前端调用 POST /api/game/choice
    ↓
显示下一回合剧情
    ↓
循环直到死亡
    ↓
显示墓志铭
```

## 故障排查

### 问题1：前端无法连接后端
- 检查后端是否启动：访问 http://localhost:8000
- 检查CORS配置：确认main.py中的CORS中间件已配置
- 检查防火墙：确认8000端口未被阻止

### 问题2：后端启动失败
- 检查Python版本：需要Python 3.7+
- 检查依赖安装：`pip list | grep fastapi`
- 查看错误日志

### 问题3：API返回500错误
- 查看后端控制台日志
- 检查game_mock.py中的数据格式
- 使用 /docs 页面测试单个接口

## 下一步优化

1. **添加更多剧情分支**：在game_mock.py中扩展STORY_DATABASE
2. **天赋效果实现**：根据选择的天赋动态调整剧情
3. **属性判定**：根据当前属性触发特殊剧情
4. **数据持久化**：使用数据库保存游戏记录
5. **AI生成剧情**：集成大模型动态生成故事

## 当前状态

✅ 前端React项目已搭建完成
✅ 后端FastAPI代码已完成
✅ API接口层已实现
✅ 前端已改造为调用真实API
⏳ 需要手动安装后端Python依赖并启动服务

启动后端后，刷新前端页面即可体验完整的前后端联调！
