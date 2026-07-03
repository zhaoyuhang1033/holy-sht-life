import random
from typing import List, Dict
from models import Talent, TurnData, Choice

# 天赋库
TALENT_POOL: List[Talent] = [
    Talent(id='t1', name='社恐体质', desc='你天生害怕人群，情商-2，但智商+3', quality='blue'),
    Talent(id='t2', name='富二代', desc='投胎技术过硬，家境+5', quality='gold'),
    Talent(id='t3', name='学霸光环', desc='智商+4，但体质-1', quality='purple'),
    Talent(id='t4', name='网瘾少年', desc='沉迷网络，智商-1，情商-2，魔幻度+3', quality='black'),
    Talent(id='t5', name='天生神力', desc='体质+3，智商-1', quality='blue'),
    Talent(id='t6', name='社交牛逼症', desc='情商+4，到哪都是人群焦点', quality='purple'),
    Talent(id='t7', name='克苏鲁之子', desc='魔幻度+5，智商+2，但容易遭遇怪事', quality='gold'),
    Talent(id='t8', name='倒霉蛋', desc='运气极差，所有属性-1，但魔幻度+4', quality='black'),
    Talent(id='t9', name='中产阶级', desc='家境+3，情商+1', quality='blue'),
    Talent(id='t10', name='迟钝福星', desc='反应慢半拍，少受即时打击，体质+2，魔幻度+1，情商-1', quality='blue'),
    Talent(id='t11', name='艺术家气质', desc='情商+3，魔幻度+2，但家境-1', quality='purple'),
    Talent(id='t12', name='雨神转世', desc='出门必下雨，魔幻度+3，情商+1，体质-1', quality='purple'),
    Talent(id='t13', name='孤儿', desc='家境-3，但体质+2，智商+2', quality='black'),
    Talent(id='t14', name='天生废物', desc='所有属性-2，但魔幻度+6', quality='black'),
    Talent(id='t15', name='命运之子', desc='所有属性+2', quality='gold'),
    Talent(id='t16', name='时间旅行者', desc='你似乎经历过这一切，魔幻度+4', quality='gold'),
    Talent(id='t17', name='梦里剧透', desc='偶尔梦见未来片段，智商+1，魔幻度+3，但情商-1', quality='blue'),
    Talent(id='t18', name='二次元', desc='沉迷动漫，智商+1，魔幻度+2，情商-2', quality='purple'),
    Talent(id='t19', name='吃货', desc='对美食有执念，体质+2，家境-1', quality='blue'),
    Talent(id='t20', name='夜猫子', desc='昼伏夜出，智商+2，体质-1，魔幻度+1', quality='purple'),
]

# 剧情数据库
STORY_DATABASE: Dict[str, TurnData] = {
    "START": TurnData(
        age=0,
        story='你降生在这个操蛋的世界。产房的霓虹灯闪烁着不祥的紫光，护士的眼睛似乎在发光。你感觉到命运的齿轮开始转动...',
        choices=[
            Choice(id='C1_A', text='大声哭闹，宣示存在'),
            Choice(id='C1_B', text='安静观察，先苟一波'),
            Choice(id='C1_C', text='尝试和护士对视'),
        ],
        attribute_changes={},
        is_dead=False,
    ),
    "C1_A": TurnData(
        age=3,
        story='你的哭声震碎了产房的玻璃。三年后，你已经是幼儿园里最能闹腾的孩子。老师说你"精力过剩"，其实你只是想引起注意。',
        choices=[
            Choice(id='C2_A', text='继续当孩子王'),
            Choice(id='C2_B', text='开始学习装乖'),
            Choice(id='C2_C', text='独自玩耍，研究蚂蚁'),
        ],
        attribute_changes={'eq': 1, 'phy': 1},
        is_dead=False,
    ),
    "C1_B": TurnData(
        age=3,
        story='你选择了沉默。三年过去，你成为了幼儿园最安静的孩子。其他小朋友在疯玩时，你总在角落里观察一切。老师夸你"懂事"，但你只是在思考。',
        choices=[
            Choice(id='C2_A', text='继续当孩子王'),
            Choice(id='C2_B', text='开始学习装乖'),
            Choice(id='C2_C', text='独自玩耍，研究蚂蚁'),
        ],
        attribute_changes={'iq': 2, 'eq': -1},
        is_dead=False,
    ),
    "C1_C": TurnData(
        age=3,
        story='护士的眼睛突然发出幽绿的光。你感觉自己似乎看到了什么不该看的东西...三年后，你经常做一些奇怪的梦，梦里有触手和星空。',
        choices=[
            Choice(id='C2_A', text='继续当孩子王'),
            Choice(id='C2_B', text='开始学习装乖'),
            Choice(id='C2_C', text='独自玩耍，研究蚂蚁'),
        ],
        attribute_changes={'magic': 3, 'iq': 1, 'phy': -1},
        is_dead=False,
    ),
    "C2_A": TurnData(
        age=7,
        story='小学一年级，你组建了自己的"帮派"。课间时，一群小弟围着你转。但班主任找了家长，你妈给了你一顿"爱的教育"。',
        choices=[
            Choice(id='C3_A', text='忍辱负重，暗中发展'),
            Choice(id='C3_B', text='金盆洗手，专心学习'),
            Choice(id='C3_C', text='不服，继续刚'),
        ],
        attribute_changes={'eq': 2, 'phy': -1},
        is_dead=False,
    ),
    "C2_B": TurnData(
        age=7,
        story='你成为了老师眼中的"三好学生"。每次发言都举手，作业都工整。但你知道，这只是伪装。你在等待时机...',
        choices=[
            Choice(id='C3_A', text='忍辱负重，暗中发展'),
            Choice(id='C3_B', text='金盆洗手，专心学习'),
            Choice(id='C3_C', text='不服，继续刚'),
        ],
        attribute_changes={'iq': 2, 'eq': 1},
        is_dead=False,
    ),
    "C2_C": TurnData(
        age=7,
        story='你发现蚂蚁的行为模式遵循某种神秘的几何规律。小学时，你因为在课堂上研究昆虫被老师没收了放大镜。但你的观察日记已经写满了三本。',
        choices=[
            Choice(id='C3_A', text='忍辱负重，暗中发展'),
            Choice(id='C3_B', text='金盆洗手，专心学习'),
            Choice(id='C3_C', text='不服，继续刚'),
        ],
        attribute_changes={'iq': 3, 'eq': -2, 'magic': 2},
        is_dead=False,
    ),
    "C3_A": TurnData(
        age=12,
        story='初中了。你在暗中建立了自己的"情报网"，知道每个老师的弱点，每个同学的秘密。你成为了学校的"地下老大"。',
        choices=[
            Choice(id='C4_A', text='继续扩张势力'),
            Choice(id='C4_B', text='适可而止，准备中考'),
            Choice(id='C4_C', text='利用情报搞点小生意'),
        ],
        attribute_changes={'eq': 3, 'money': 1},
        is_dead=False,
    ),
    "C3_B": TurnData(
        age=12,
        story='你真的爱上了学习。数学的美妙、物理的逻辑、化学的神奇...知识让你着迷。你的成绩冲进了年级前十。',
        choices=[
            Choice(id='C4_A', text='继续扩张势力'),
            Choice(id='C4_B', text='适可而止，准备中考'),
            Choice(id='C4_C', text='利用情报搞点小生意'),
        ],
        attribute_changes={'iq': 4, 'phy': -2},
        is_dead=False,
    ),
    "C3_C": TurnData(
        age=12,
        story='你和班主任正面刚了起来。结果可想而知，你被叫了家长、写了检讨、罚站了一周。但你的"硬汉"形象在学校传开了。',
        choices=[
            Choice(id='C4_A', text='继续扩张势力'),
            Choice(id='C4_B', text='适可而止，准备中考'),
            Choice(id='C4_C', text='利用情报搞点小生意'),
        ],
        attribute_changes={'phy': 1, 'eq': -2, 'iq': -1},
        is_dead=False,
    ),
    "C4_A": TurnData(
        age=15,
        story='你的"生意"越做越大。从帮同学代购零食，到组织校外活动，甚至还有人找你"解决问题"。但有一天，教导主任盯上了你...',
        choices=[
            Choice(id='DEATH_1', text='硬刚到底'),
            Choice(id='C5_A', text='见好就收'),
            Choice(id='C5_B', text='转移阵地，去校外发展'),
        ],
        attribute_changes={'money': 3, 'eq': 2},
        is_dead=False,
    ),
    "C4_B": TurnData(
        age=15,
        story='中考结束了。你考上了市重点高中。新的环境，新的挑战。你发现高中的竞争比想象中激烈得多。',
        choices=[
            Choice(id='C5_A', text='见好就收'),
            Choice(id='C5_B', text='转移阵地，去校外发展'),
            Choice(id='C5_C', text='加入学生会'),
        ],
        attribute_changes={'iq': 3},
        is_dead=False,
    ),
    "C4_C": TurnData(
        age=15,
        story='你的小生意做得风生水起。倒卖考试资料、代写作业、甚至还搞起了"恋爱咨询"。你赚到了人生第一桶金：3000块。',
        choices=[
            Choice(id='C5_A', text='见好就收'),
            Choice(id='C5_B', text='转移阵地，去校外发展'),
            Choice(id='C5_C', text='加入学生会'),
        ],
        attribute_changes={'money': 4, 'eq': 2, 'iq': 1},
        is_dead=False,
    ),
    "C5_A": TurnData(
        age=18,
        story='高考结束了。你考上了一所还不错的大学。大学生活自由而迷茫，你站在人生的十字路口...',
        choices=[
            Choice(id='END_1', text='好好学习，准备考研'),
            Choice(id='END_2', text='创业，实现财富自由'),
            Choice(id='END_3', text='躺平，享受生活'),
        ],
        attribute_changes={'iq': 2},
        is_dead=False,
    ),
    "C5_B": TurnData(
        age=18,
        story='你辍学了，在社会上摸爬滚打。你见识了真正的江湖，也明白了生活的残酷。你现在在一家夜店当保安。',
        choices=[
            Choice(id='END_1', text='好好学习，准备考研'),
            Choice(id='END_2', text='创业，实现财富自由'),
            Choice(id='END_3', text='躺平，享受生活'),
        ],
        attribute_changes={'phy': 3, 'money': -2, 'iq': -2},
        is_dead=False,
    ),
    "C5_C": TurnData(
        age=18,
        story='你在学生会如鱼得水，从干事做到了副主席。你学会了如何与人打交道，如何在体制内生存。高考后，你收到了多所名校的offer。',
        choices=[
            Choice(id='END_1', text='好好学习，准备考研'),
            Choice(id='END_2', text='创业，实现财富自由'),
            Choice(id='END_3', text='躺平，享受生活'),
        ],
        attribute_changes={'eq': 4, 'iq': 1},
        is_dead=False,
    ),
    "DEATH_1": TurnData(
        age=15,
        story='你和教导主任硬刚了。结果你被开除了，档案上留下了污点。你爸妈气得把你赶出了家门。你流落街头，某天夜里被醉汉打成重伤...',
        choices=[],
        attribute_changes={'phy': -10},
        is_dead=True,
        death_reason='死于街头斗殴，年仅15岁。墓志铭：他活得很刚，死得很惨。',
    ),
    "END_1": TurnData(
        age=25,
        story='你考上了研究生，又读了博。25岁博士毕业，你成为了某985高校的青年教师。生活稳定但平淡。某天你在实验室通宵加班时，心脏病突发...',
        choices=[],
        attribute_changes={'phy': -8},
        is_dead=True,
        death_reason='死于过劳，年仅25岁。墓志铭：他把青春献给了学术，学术回赠了他一张死亡证明。',
    ),
    "END_2": TurnData(
        age=22,
        story='你的创业项目黄了，投资人撤资，团队散伙，你背上了巨额债务。22岁的你站在天台上，看着这座霓虹闪烁的城市...',
        choices=[],
        attribute_changes={'phy': -15, 'money': -10},
        is_dead=True,
        death_reason='死于坠楼，年仅22岁。墓志铭：他追逐梦想，梦想把他推下了楼。',
    ),
    "END_3": TurnData(
        age=28,
        story='你躺平了十年。28岁的你还住在父母家，每天打游戏、刷视频。某天你突然胸口剧痛，救护车还没到你就没了呼吸...',
        choices=[],
        attribute_changes={'phy': -12},
        is_dead=True,
        death_reason='死于猝死，年仅28岁。墓志铭：他躺得很平，死得也很平。',
    ),
}


def get_random_talents(count: int = 10) -> List[Talent]:
    """随机获取指定数量的天赋"""
    return random.sample(TALENT_POOL, min(count, len(TALENT_POOL)))


def get_story_data(story_id: str) -> TurnData:
    """获取剧情数据"""
    return STORY_DATABASE.get(story_id, STORY_DATABASE["START"])

