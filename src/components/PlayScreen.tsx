import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { AttributeBar } from './AttributeBar';
import { Typewriter } from './Typewriter';

export function PlayScreen() {
  const { attributes, currentTurnData, isLoading, isStreaming, streamingStory, lastTurnWasStreamed, makeChoice } = useGame() as any;
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [attributeChanges, setAttributeChanges] = useState<Record<string, number>>({});

  useEffect(() => {
    if (currentTurnData) {
      setTypewriterComplete(lastTurnWasStreamed);
      setAttributeChanges(currentTurnData.attribute_changes as Record<string, number>);
      const timer = setTimeout(() => setAttributeChanges({}), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentTurnData, lastTurnWasStreamed]);

  if (!currentTurnData) {
    return <div className="h-screen flex items-center justify-center bg-slate-950 text-slate-100"><p className="text-xl">加载中...</p></div>;
  }

  const choicesDisabled = !typewriterComplete || isStreaming || isLoading;

  return (
    <div className="h-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 p-4">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <AttributeBar label="智商" value={attributes.iq} change={attributeChanges.iq || 0} color="bg-blue-500" />
        <AttributeBar label="情商" value={attributes.eq} change={attributeChanges.eq || 0} color="bg-purple-500" />
        <AttributeBar label="体质" value={attributes.phy} change={attributeChanges.phy || 0} color="bg-emerald-500" />
        <AttributeBar label="家境" value={attributes.money} change={attributeChanges.money || 0} color="bg-amber-500" />
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <h2 className="text-4xl font-bold text-amber-400 mb-2">🎈 {currentTurnData.age} 岁</h2>
        </motion.div>

        {isStreaming ? (
          <div>
            <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">{streamingStory}</p>
            <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block mt-2 text-purple-400">
              ▋ 因果律正在书写...
            </motion.span>
          </div>
        ) : (
          <Typewriter text={currentTurnData.story} speed={30} onComplete={() => setTypewriterComplete(true)} />
        )}
      </div>

      <div className="space-y-3" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {isLoading && isStreaming ? <div className="text-center py-2 text-purple-400">命运正在缓冲并逐字吐出...</div> : null}
        {currentTurnData.choices.map((choice, index) => (
          <motion.button
            key={choice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: choicesDisabled ? 0.5 : 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: choicesDisabled ? 1 : 0.96 }}
            onClick={() => !choicesDisabled && makeChoice(choice.id)}
            disabled={choicesDisabled}
            className={`w-full py-4 px-4 rounded-lg border-2 font-bold text-left transition-all min-h-[48px] ${choicesDisabled ? 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed' : 'bg-slate-800 border-emerald-400 text-slate-100 shadow-lg shadow-emerald-400/30 hover:bg-slate-700'}`}
          >
            {choice.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

