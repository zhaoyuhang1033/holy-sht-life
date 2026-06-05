import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Attribute } from '../types';

const attributeLabels: Record<keyof Attribute, string> = {
  iq: '智商',
  eq: '情商',
  phy: '体质',
  money: '家境',
  magic: '魔幻度',
};

export function AllocateScreen() {
  const { selectedTalents, allocatedPoints, allocateAttributePoint, randomAllocate, startGameLoop } = useGame();

  const totalAllocated = Object.values(allocatedPoints).reduce((a, b) => a + b, 0);
  const remainingPoints = 15 - totalAllocated;
  const canStart = remainingPoints === 0;

  const attributeKeys: (keyof Attribute)[] = ['iq', 'eq', 'phy', 'money'];

  return (
    <div className="h-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <h1 className="text-2xl font-bold text-purple-400 mb-2">疯狂配点</h1>
        <p className="text-sm text-slate-400">剩余点数: <span className="text-2xl font-bold text-amber-400">{remainingPoints}</span></p>
      </motion.div>

      <div className="flex-1 overflow-y-auto space-y-6 py-4">
        {/* 已选天赋 */}
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 mb-2">你的天赋:</h3>
          {selectedTalents.map((talent) => (
            <div key={talent.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3">
              <p className="font-bold text-amber-400">{talent.name}</p>
              <p className="text-xs text-slate-300">{talent.desc}</p>
            </div>
          ))}
        </div>

        {/* 属性配点 */}
        <div className="space-y-4">
          <h3 className="text-sm text-slate-400 mb-2">属性配点 (初始各5点):</h3>
          {attributeKeys.map((key) => {
            const baseValue = 5;
            const allocated = allocatedPoints[key];
            const finalValue = baseValue + allocated;
            
            return (
              <div key={key} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold">{attributeLabels[key]}</span>
                  <span className="text-2xl font-bold text-emerald-400">{finalValue}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => allocateAttributePoint(key, -1)}
                    disabled={allocated <= 0}
                    className={`
                      w-12 h-12 rounded-lg font-bold text-2xl
                      ${allocated > 0
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }
                    `}
                  >
                    -
                  </motion.button>
                  
                  <div className="flex-1 text-center">
                    <span className="text-slate-400">已分配: </span>
                    <span className="text-lg font-bold text-amber-400">{allocated}</span>
                  </div>
                  
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => allocateAttributePoint(key, 1)}
                    disabled={remainingPoints <= 0 || finalValue >= 20}
                    className={`
                      w-12 h-12 rounded-lg font-bold text-2xl
                      ${remainingPoints > 0 && finalValue < 20
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }
                    `}
                  >
                    +
                  </motion.button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 pt-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={randomAllocate}
          className="w-full py-3 bg-slate-800 text-emerald-400 rounded-lg border-2 border-emerald-400 font-bold shadow-lg shadow-emerald-400/30"
        >
          🎰 看天意（随机分配）
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={startGameLoop}
          disabled={!canStart}
          className={`
            w-full py-4 rounded-lg font-bold text-lg transition-all
            ${canStart
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }
          `}
        >
          {canStart ? '🎲 投胎（赌一把命）' : `还剩 ${remainingPoints} 点未分配`}
        </motion.button>
      </div>
    </div>
  );
}
