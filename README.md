Markdown
# 🚀 项目技术规格与架构设计书：【人生模拟器】(H5)

## 1. 核心愿景与世界观
- **项目名称**：人生模拟器 (What a F**ked Up Life)
- **游戏类型**：移动端 H5 文字 Roguelike 动态 AI 游戏
- **核心调性**：荒诞、黑色幽默、命运捉弄、赛博与怪诞融合。
- **开发策略**：当前阶段为**前端纯 Mock 驱动阶段**。所有前后端数据交互通过本地 `mockData.ts` 门面进行流转，严禁调用任何真实后端 API。必须保证前端逻辑闭环、交互极度丝滑后，再迁移至 FastAPI。

---

## 2. 移动端 (H5) UI/UX 刚性约束 (AI 编码必须严格遵守)

1. **首屏即全貌 (No Scroll)**：
   - 整体容器必须使用 `h-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 p-4`。
   - 严禁屏幕出现全局滚动条。所有内容（属性栏、剧情沙盒、选项区）必须通过弹性伸缩（Flex/Grid）完美塞进单屏内。
2. **安全区域适配 (Safe Area)**：
   - 底部操作区必须考虑全面屏（如 iPhone 刘海/底条）的适配，容器底部必须加上 `pb-[env(safe-area-inset-bottom)]`。
3. **大拇指盲操原则**：
   - 所有可点击的选项卡片（Choices）必须集中在屏幕下三分之一。
   - 每个选项卡片高度不低于 `48px`，点击热区明确，适配单手大拇指快速点击。
4. **故障与霓虹视觉**：
   - 背景：深色系 `bg-slate-950`、`bg-slate-900`。
   - 文本与边框：善用霓虹色（金色 `amber-400`、紫色 `purple-400`、绿色 `emerald-400`、毁灭红 `rose-500`）。
   - 动效：使用 `framer-motion` 实现组件渐现、切换，按钮点击必须有明显的缩放反馈 (`whileTap={{ scale: 0.96 }}`)。

---

## 3. 全局状态机驱动 (GameContext.tsx)
游戏由一个全局的 React Context 控制，通过 `currentStep` 状态切换视图：

[WELCOME: 天赋抽卡] ──(选定3个天赋)──> [ALLOCATE: 属性配点] ──(确认投胎)──> [PLAYING: 局内循环] ──(死亡判定)──> [SUMMARY: 墓志铭]


### 全局状态接口定义
```typescript
export type GameStep = 'WELCOME' | 'ALLOCATE' | 'PLAYING' | 'SUMMARY';

export interface Attribute {
  iq: number;     // 智商
  eq: number;     // 情商
  phy: number;    // 体质
  money: number;  // 家境
  magic: number;  // 魔幻度 (隐藏/显示均可)
}

export interface Talent {
  id: string;
  name: string;
  desc: string;
  quality: 'gold' | 'purple' | 'blue' | 'black'; // 决定卡片霓虹颜色
}

export interface GameContextType {
  currentStep: GameStep;
  talents: Talent[];          // 当前随机出的10个天赋
  selectedTalents: Talent[];  // 玩家选中的3个天赋
  attributes: Attribute;      // 玩家当前的实时属性
  allocatedPoints: Attribute; // 玩家在 ALLOCATE 阶段手动分配的点数
  historyLog: string[];       // 经历过的剧情历史文本（Memory备用）
  currentTurnData: any;       // 当前回合的后端/Mock JSON 数据
  isLoading: boolean;
  
  // 核心控制方法
  rerollTalents: () => void;                      // 天赋重置抽卡
  toggleSelectTalent: (talent: Talent) => void;   // 选择/取消选择天赋 (最多3个)
  confirmTalents: () => void;                     // 确认天赋，去配点页
  allocateAttributePoint: (type: keyof Attribute, amount: number) => void; // 加减属性点
  startGameLoop: () => void;                      // 确认配点，正式投胎，加载"START"剧情
  makeChoice: (choiceId: string) => Promise<void>; // 玩家点击选项，驱动下一回合
  restartGame: () => void;                        // 清空状态，一键重开
}
4. 前端四大业务模块核心逻辑
🟢 模块一：【WELCOME】天赋十连抽页面
逻辑流程：

进入页面，系统调用 rerollTalents，从静态天赋库中随机抓取 10 个天赋。

界面渲染 10 张精美的卡片，品质（gold/purple/blue/black）对应不同的边框流光。

玩家点击卡片进行多选，最多只能选 3 个。选中时卡片产生震动并保持高亮。

当 selectedTalents.length === 3 时，底部的【认命，进入下一步】按钮解除禁用。

🟡 模块二：【ALLOCATE】疯狂配点页面
逻辑流程：

承接选中的 3 个天赋。展示基础属性栏，系统赠送 15 点“自由属性点”。

玩家可以通过 + 和 - 按钮调整【智商、情商、体质、家境】。初始各属性最低为 1，最高不超过 20。

配点逻辑：剩余点数归 0 时，加号变灰。只有剩余点数刚好为 0 时，底部的【投胎（赌一把命）】按钮激活。

点击【投胎】，触发 startGameLoop，将状态切至 PLAYING，同时触发手机物理震动（模拟灵魂穿越）。

🔴 模块三：【PLAYING】操蛋人生主沙盒页面
界面自上而下分为三级：

Top 栏：4 个紧凑的属性条（AttributeBar）。如果本回合属性发生变动（例如：attribute_changes.phy = -3），该属性条上方必须使用 AnimatePresence 飘出一个红色的 -3 并向上渐隐。

Middle 栏：剧情滚动沙盒。当前的年龄大字高亮（如 🎈 18 岁）。文本必须使用 Typewriter 组件实现逐字打字机效果。打字机未播完时，下方选项不可点击。

Bottom 栏：3 个巨大的选项按钮。点击其中一个（如 C1_A），触发 makeChoice('C1_A')，页面进入 isLoading 状态（显示“因果律计算中...”），等待 0.6 秒模拟大模型延迟，随后加载并渲染下一回合的 Mock 数据。

死亡判定：

如果 Mock 返回的 is_dead: true 或者最新属性中 phy <= 0，则在当前打字机文本播完 1 秒后，自动将 currentStep 切换至 SUMMARY。

⚫ 模块四：【SUMMARY】墓志铭结算页面
逻辑流程：

展现一个带有“赛博墓碑”或“老旧档案袋”质感的全屏组件。

居中展示 AI/Mock 生成的最终故事结尾和荒诞墓志铭（如：“享年18岁，死于高考试卷上的克苏鲁低语”）。

底部提供两个按钮：【不服，再来一世】（调用 restartGame 清空所有状态回到 WELCOME 页）和 【分享这操蛋的一生】（调用 H5 原生分享或弹窗提示）。

5. 原子级特色交互组件实现要求
💥 组件 A：AttributeBar.tsx (带动态飘字进度条)
输入参数：label（标签）, value（当前数值）, change（变动数值）, color（进度条颜色类名）。

动效约束：

进度条宽度变化必须有平滑的过渡效果 (transition-all duration-500)。

只要检测到 change 从 0 变为非 0，必须立刻触发一个从下往上飘动、透明度递减的动画数字。正数显绿色，负数显红色。

⌨️ 组件 B：Typewriter.tsx (打字机特效)
输入参数：text（纯文本）, speed（打字速度, 默认 30ms/字）, onComplete（播放完毕回调）。

特殊处理：由于是多轮游戏，每次传入新的 text 时，组件必须重置内部索引，从第一个字重新开始闪烁打字。

📳 组件 C：useVibrate.ts (触觉物理反馈 Hook)
功能描述：封装 window.navigator.vibrate。

触发节点：

属性被扣减至危险线（< 3）时，短震动一次 [50]。

点击“投胎/重开”按钮时，中度震动一次 [150]。

触发死亡判定进入结算页时，发生连续故障感震动 [200, 100, 200]。

6. 开发任务启动指令
现在，请根据这份规格说明书：

先在 src/mock/mockData.ts 中建立包含至少 4 个相互关联回合的、充满荒诞梗的剧情链数据。

编写全局 GameContext.tsx，完美实现 4 个 Step 的流转切换和状态存取。

按照 H5 适配约束，依次实现 StartScreen、PlaySandbox 和 GameOver 页面。