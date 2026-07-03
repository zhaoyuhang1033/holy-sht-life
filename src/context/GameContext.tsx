import React, { createContext, useContext, useState, useCallback } from 'react';


import { GameContextType, GameStep, Talent, Attribute, TurnData } from '../types';
import { fetchAITalents, startGame, makeChoiceStream } from '../api/gameApi';


import { useVibrate } from '../hooks/useVibrate';

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

const initialAttributes: Attribute = {
  iq: 5,
  eq: 5,
  phy: 5,
  money: 5,
  magic: 0,
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<GameStep>('WELCOME');
  const [talents, setTalents] = useState<Talent[]>([]);
  const [selectedTalents, setSelectedTalents] = useState<Talent[]>([]);
  const [attributes, setAttributes] = useState<Attribute>(initialAttributes);
  const [allocatedPoints, setAllocatedPoints] = useState<Attribute>({ iq: 0, eq: 0, phy: 0, money: 0, magic: 0 });
  const [historyLog, setHistoryLog] = useState<string[]>([]);
  const [currentTurnData, setCurrentTurnData] = useState<TurnData | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStory, setStreamingStory] = useState('');
  const [lastTurnWasStreamed, setLastTurnWasStreamed] = useState(false);


  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());


  const { vibrateLight, vibrateMedium, vibrateHeavy } = useVibrate();

  // AI抽卡（动态生成）
  const rerollAITalents = useCallback(async () => {
    setIsLoading(true);
    try {
      const talents = await fetchAITalents();
      setTalents(talents);
      setSelectedTalents([]);
      vibrateMedium();
    } catch (error) {
      console.error('AI生成天赋失败:', error);
      alert('AI生成失败，请检查后端服务或API配置');
    } finally {
      setIsLoading(false);
    }
  }, [vibrateMedium]);

  // 移除自动初始化，改为用户手动触发

  // 选择/取消天赋
  const toggleSelectTalent = useCallback((talent: Talent) => {
    setSelectedTalents(prev => {
      const isSelected = prev.find(t => t.id === talent.id);
      if (isSelected) {
        return prev.filter(t => t.id !== talent.id);
      } else if (prev.length < 3) {
        vibrateLight();
        return [...prev, talent];
      }
      return prev;
    });
  }, [vibrateLight]);

  // 确认天赋，进入配点页
  const confirmTalents = useCallback(() => {
    if (selectedTalents.length === 3) {
      setCurrentStep('ALLOCATE');
      vibrateMedium();
    }
  }, [selectedTalents.length, vibrateMedium]);

  // 属性配点
  const allocateAttributePoint = useCallback((type: keyof Attribute, amount: number) => {
    setAllocatedPoints(prev => {
      const newValue = prev[type] + amount;
      if (newValue < 0) return prev;

      const totalAllocated = Object.values({ ...prev, [type]: newValue }).reduce((a, b) => a + b, 0);
      if (totalAllocated > 15) return prev;

      vibrateLight();
      return { ...prev, [type]: newValue };
    });
  }, [vibrateLight]);

  // 随机分配属性点（看天意）
  const randomAllocate = useCallback(() => {
    vibrateMedium();
    const newAllocated: Attribute = { iq: 0, eq: 0, phy: 0, money: 0, magic: 0 };
    const keys: (keyof Attribute)[] = ['iq', 'eq', 'phy', 'money'];
    let remaining = 15;

    // 随机分配15点
    while (remaining > 0) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const maxAdd = Math.min(remaining, 15 - newAllocated[randomKey]); // 单属性最多分配15点
      if (maxAdd > 0) {
        const addAmount = Math.floor(Math.random() * maxAdd) + 1;
        newAllocated[randomKey] += addAmount;
        remaining -= addAmount;
      }
    }

    setAllocatedPoints(newAllocated);
  }, [vibrateMedium]);

  // 开始游戏循环
  const startGameLoop = useCallback(async () => {
    const totalPoints = Object.values(allocatedPoints).reduce((a, b) => a + b, 0);
    if (totalPoints !== 15) return;

    vibrateMedium();
    setIsLoading(true);

    try {
      // 计算最终初始属性
      const finalAttributes = { ...initialAttributes };
      Object.keys(allocatedPoints).forEach(key => {
        finalAttributes[key as keyof Attribute] += allocatedPoints[key as keyof Attribute];
      });

      setAttributes(finalAttributes);

      // 调用后端API开始游戏
      const startData = await startGame(selectedTalents, finalAttributes, sessionId);



      setCurrentTurnData(startData);
      setHistoryLog([startData.story]);
      setLastTurnWasStreamed(false);
      setCurrentStep('PLAYING');




    } catch (error) {
      console.error('开始游戏失败:', error);
      alert('开始游戏失败，请检查后端服务');
    } finally {
      setIsLoading(false);
    }
  }, [allocatedPoints, selectedTalents, sessionId, vibrateMedium]);


  // 玩家做出选择（流式剧情）
  const makeChoiceHandler = useCallback(async (choiceId: string) => {
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingStory('');
    vibrateLight();

    try {
      const choiceText = currentTurnData?.choices.find(choice => choice.id === choiceId)?.text || choiceId;
      await makeChoiceStream(choiceId, attributes, sessionId, choiceText, {
        onStart: () => {
          setStreamingStory('');
        },
        onDelta: ({ text }) => {
          setStreamingStory(prev => prev + text);
        },
        onDone: (nextData) => {
          setAttributes(prev => {
            const newAttrs = { ...prev };
            Object.keys(nextData.attribute_changes).forEach(key => {
              const change = nextData.attribute_changes[key as keyof Attribute] || 0;
              newAttrs[key as keyof Attribute] += change;
              if (newAttrs[key as keyof Attribute] < 3 && change < 0) {
                vibrateLight();
              }
            });
            return newAttrs;
          });

          setLastTurnWasStreamed(true);

          setCurrentTurnData(nextData);
          setHistoryLog(prev => [...prev, nextData.story]);
          setStreamingStory('');
          setIsStreaming(false);

          if (nextData.is_dead) {
            setTimeout(() => {
              vibrateHeavy();
              setCurrentStep('SUMMARY');
            }, 2000);
          }
        },
        onError: ({ message }) => {
          console.error('流式提交选择失败:', message);
          alert('流式生成失败，请稍后重试');
          setLastTurnWasStreamed(false);
          setIsStreaming(false);
          setStreamingStory('');
        },


      });
    } catch (error) {
      console.error('提交选择失败:', error);
      alert('提交选择失败，请检查后端服务');
      setIsStreaming(false);
      setLastTurnWasStreamed(false);

      setStreamingStory('');
    } finally {
      setIsLoading(false);
    }
  }, [attributes, currentTurnData?.choices, sessionId, vibrateLight, vibrateHeavy]);




  // 重新开始
  const restartGame = useCallback(() => {
    vibrateMedium();
    setCurrentStep('WELCOME');
    setTalents([]);
    setSelectedTalents([]);
    setAttributes(initialAttributes);
    setAllocatedPoints({ iq: 0, eq: 0, phy: 0, money: 0, magic: 0 });
    setLastTurnWasStreamed(false);

    setHistoryLog([]);
    setCurrentTurnData(null);
    setSessionId(crypto.randomUUID());
    setIsStreaming(false);
    setStreamingStory('');


    setIsLoading(false);
  }, [vibrateMedium]);

  const value: GameContextType = {
    currentStep,
    talents,
    lastTurnWasStreamed,

    selectedTalents,
    attributes,
    allocatedPoints,
    isStreaming,
    streamingStory,

    historyLog,
    currentTurnData,
    isLoading,
    rerollAITalents,
    toggleSelectTalent,
    confirmTalents,
    allocateAttributePoint,
    randomAllocate,
    startGameLoop,
    makeChoice: makeChoiceHandler,
    restartGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
