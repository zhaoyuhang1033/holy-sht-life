import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Talent } from '../types';

const qualityColors = {
  gold: 'border-amber-400 shadow-amber-400/50',
  purple: 'border-purple-400 shadow-purple-400/50',
  blue: 'border-blue-400 shadow-blue-400/50',
  black: 'border-slate-600 shadow-slate-600/50',
};

export function WelcomeScreen() {
  const { talents, selectedTalents, rerollAITalents, toggleSelectTalent, confirmTalents, isLoading } = useGame();

  const isSelected = (talent: Talent) => selectedTalents.some(t => t.id === talent.id);
  const canConfirm = selectedTalents.length === 3;
  const hasNoTalents = talents.length === 0;

  // 初始空状态 - 大按钮引导
  if (hasNoTalents && !isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-slate-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-amber-400 mb-4">人生模拟器</h1>
          <p className="text-lg text-slate-400 mb-8">命运的齿轮即将转动...</p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={rerollAITalents}
            className="relative px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl font-bold text-2xl shadow-2xl overflow-hidden"
          >
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ backgroundSize: '200% 100%' }}
            />
            <span className="relative z-10 flex items-center justify-center gap-3">
              🔮 AI 命运摇号
            </span>
          </motion.button>

          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-6 text-sm text-purple-400"
          >
            让大模型为你编织荒诞的命运
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Loading状态 - 炫酷动效
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-slate-100 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-purple-400 mb-8">因果律计算中...</h2>

          {/* 旋转的赛博圆环 */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-pink-500 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 border-4 border-transparent border-b-amber-500 border-l-emerald-500 rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center text-6xl"
            >
              🔮
            </motion.div>
          </div>

          {/* 跳动的文字 */}
          <div className="flex justify-center gap-2 mb-4">
            {['AI', '正在', '编织', '你的', '命运'].map((char, i) => (
              <motion.span
                key={i}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                className="text-lg text-slate-400"
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* 闪烁的提示 */}
          <motion.p
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm text-purple-300"
          >
            预计需要 30-60 秒
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // 有天赋后显示正常列表
  return (
    <div className="h-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <h1 className="text-3xl font-bold text-amber-400 mb-2">人生模拟器</h1>
        <p className="text-sm text-slate-400">选择你的天赋 ({selectedTalents.length}/3)</p>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-3">
        {talents.map((talent, index) => {
          const selected = isSelected(talent);
          return (
            <motion.div
              key={talent.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleSelectTalent(talent)}
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all
                ${qualityColors[talent.quality]}
                ${selected ? 'bg-slate-800 shadow-lg scale-105' : 'bg-slate-900/50'}
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg mb-1">{talent.name}</h3>
                  <p className="text-sm text-slate-300">{talent.desc}</p>
                </div>
                {selected && (
                  <span className="text-2xl">✓</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-3 pt-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={rerollAITalents}
          disabled={isLoading}
          className="w-full py-3 bg-slate-800 text-purple-400 rounded-lg border border-purple-400 font-bold shadow-lg shadow-purple-400/30 disabled:opacity-50"
        >
          🔮 命运不公，再摇一次
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={confirmTalents}
          disabled={!canConfirm}
          className={`
            w-full py-4 rounded-lg font-bold text-lg transition-all
            ${canConfirm
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }
          `}
        >
          {canConfirm ? '认命，进入下一步' : '请选择3个天赋'}
        </motion.button>
      </div>
    </div>
  );
}
