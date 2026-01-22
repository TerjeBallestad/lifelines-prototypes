import { observer } from 'mobx-react-lite';
import { Toaster } from 'sonner';
import { ActivityPanel } from './components/ActivityPanel';
import { CharacterPanel } from './components/CharacterPanel';
import { SimulationControls } from './components/SimulationControls';
import { SkillTreePanel } from './components/SkillTreePanel';
import { TalentSelectionModal } from './components/TalentSelectionModal';
import { useCharacterStore } from './stores/RootStore';

const App = observer(function App() {
  const characterStore = useCharacterStore();

  // Create a character on first render if none exists
  if (!characterStore.hasCharacter) {
    characterStore.createCharacter('Test Character');
  }

  return (
    <div className="flex min-h-screen bg-base-100">
      <Toaster position="bottom-right" richColors />
      <TalentSelectionModal />
      {/* Sidebar */}
      <CharacterPanel />

      {/* Main content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Lifelines Prototype</h1>
        <SimulationControls />
        <div className="mt-6">
          <SkillTreePanel />
        </div>
        <div className="mt-6">
          <ActivityPanel />
        </div>
      </main>
    </div>
  );
});

export default App;
