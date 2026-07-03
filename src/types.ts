export type GameStep = 'WELCOME' | 'ALLOCATE' | 'PLAYING' | 'SUMMARY';

export interface Attribute {
  iq: number;     // 智商
  eq: number;     // 情商
  phy: number;    // 体质
  money: number;  // 家境
  magic: number;  // 魔幻度
}

export interface Talent {
  id: string;
  name: string;
  desc: string;
  quality: 'gold' | 'purple' | 'blue' | 'black';
}

export interface Choice {
  id: string;
  text: string;
}

export interface TurnData {
  age: number;
  story: string;
  choices: Choice[];
  attribute_changes: Partial<Attribute>;
  is_dead: boolean;
  death_reason?: string;
}

export interface GameContextType {
  currentStep: GameStep;
  talents: Talent[];
  selectedTalents: Talent[];
  attributes: Attribute;
  allocatedPoints: Attribute;
  historyLog: string[];
  currentTurnData: TurnData | null;
  isLoading: boolean;

  lastTurnWasStreamed: boolean;
  isStreaming: boolean;
  streamingStory: string;


  rerollAITalents: () => void;
  toggleSelectTalent: (talent: Talent) => void;
  confirmTalents: () => void;
  allocateAttributePoint: (type: keyof Attribute, amount: number) => void;
  randomAllocate: () => void;
  startGameLoop: () => void;
  makeChoice: (choiceId: string) => Promise<void>;
  restartGame: () => void;
}
