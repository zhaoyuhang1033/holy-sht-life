# 后端 FastAPI 服务

## 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

## 启动服务

```bash
python main.py
```

或者使用uvicorn：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API文档

启动后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 接口说明

### 1. 获取随机天赋
```
GET /api/talents?count=10
```

### 2. 开始游戏
```
POST /api/game/start
Body: {
  "selected_talents": [...],
  "allocated_points": {...}
}
```

### 3. 提交选择
```
POST /api/game/choice
Body: {
  "choice_id": "C1_A",
  "current_attributes": {...}
}
```
