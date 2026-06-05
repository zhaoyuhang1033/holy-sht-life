import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export function SummaryScreen() {
  const { currentTurnData, restartGame, attributes, selectedTalents } = useGame();

  const handleShare = () => {
    const shareText = `我在《人生模拟器》中活到了${currentTurnData?.age}岁！\n${currentTurnData?.death_reason}`;
    
    if (navigator.share) {
      navigator.share({
        title: '人生模拟器',
        text: shareText,
      }).catch(() => {
        // 分享失败，复制到剪贴板
        navigator.clipboard.writeText(shareText);
        alert('已复制到剪贴板');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('已复制到剪贴板');
    }
  };

  return (
    <div className="h-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col justify-center items-center"
      >
        {/* 墓碑效果 */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900 border-4 border-slate-700 rounded-lg p-6 max-w-md w-full shadow-2xl"
        >
          <div className="text-center mb-6">
            <h1 className="text-5xl mb-4">⚰️</h1>
            <h2 className="text-3xl font-bold text-rose-500 mb-2">Game Over</h2>
            <p className="text-slate-400">你的操蛋人生结束了</p>
          </div>

          <div className="border-t border-b border-slate-700 py-4 mb-4">
            <div className="text-center mb-4">
              <span className="text-6xl font-bold text-amber-400">{currentTurnData?.age}</span>
              <span className="text-xl text-slate-400 ml-2">岁</span>
            </div>
            
            <div className="bg-slate-800 rounded p-4 mb-4">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {currentTurnData?.story}
              </p>
            </div>

            <div className="bg-rose-950/30 border border-rose-800 rounded p-4">
              <p className="text-rose-300 font-bold text-center">
                {currentTurnData?.death_reason}
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-400 space-y-2">
            <p>天赋: {selectedTalents.map(t => t.name).join(', ')}</p>
            <div className="grid grid-cols-2 gap-2">
              <p>智商: {attributes.iq}</p>
              <p>情商: {attributes.eq}</p>
              <p>体质: {attributes.phy}</p>
              <p>家境: {attributes.money}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 按钮区 */}
      <div className="space-y-3" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleShare}
          className="w-full py-4 bg-slate-800 border-2 border-purple-400 text-purple-400 rounded-lg font-bold shadow-lg shadow-purple-400/30"
        >
          📤 分享这操蛋的一生
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.96 }}
          onClick={restartGame}
          className="w-full py-4 bg-amber-500 text-slate-950 rounded-lg font-bold shadow-lg shadow-amber-500/50"
        >
          🔄 不服，再来一世
        </motion.button>
      </div>
    </div>
  );
}
