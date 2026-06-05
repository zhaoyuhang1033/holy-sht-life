import { GameProvider, useGame } from './context/GameContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AllocateScreen } from './components/AllocateScreen';
import { PlayScreen } from './components/PlayScreen';
import { SummaryScreen } from './components/SummaryScreen';

function GameContent() {
  const { currentStep } = useGame();

  switch (currentStep) {
    case 'WELCOME':
      return <WelcomeScreen />;
    case 'ALLOCATE':
      return <AllocateScreen />;
    case 'PLAYING':
      return <PlayScreen />;
    case 'SUMMARY':
      return <SummaryScreen />;
    default:
      return <WelcomeScreen />;
  }
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
