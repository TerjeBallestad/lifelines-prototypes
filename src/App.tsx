import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { ActivityPanel } from './components/ActivityPanel';
import { CharacterPanel } from './components/CharacterPanel';
import { CharacterSelector } from './components/CharacterSelector';
import { SimulationControls } from './components/SimulationControls';
import { SkillTreePanel } from './components/SkillTreePanel';
import { TalentSelectionModal } from './components/TalentSelectionModal';
import { TalentsPanel } from './components/TalentsPanel';
import { DevToolsPanel } from './components/DevToolsPanel';
import { ComparisonView } from './components/ComparisonView';
import { FloatingNumbersOverlay } from './components/FloatingNumbersOverlay';
import { SimulationRunnerPanel } from './components/SimulationRunnerPanel';
import { TelemetryChartsPanel } from './components/TelemetryChartsPanel';
import { useCharacterStore } from './stores/RootStore';

const App = observer(function App() {
  const characterStore = useCharacterStore();
  const [comparisonMode, setComparisonMode] = useState(false);

  // Create a character on first render if none exists (only in single mode)
  if (!characterStore.hasCharacter && !comparisonMode) {
    characterStore.createCharacter('Test Character');
  }

  return (
    <div className="bg-base-100 flex min-h-screen">
      <Toaster position="bottom-right" richColors />
      <TalentSelectionModal />
      <FloatingNumbersOverlay />

      {comparisonMode ? (
        <ComparisonView onExitComparison={() => setComparisonMode(false)} />
      ) : (
        <>
          {/* Sidebar */}
          <CharacterPanel />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4">
            <div className="mb-6 flex items-center gap-4">
              <h1 className="text-2xl font-bold">Lifelines Prototype</h1>
              <CharacterSelector />
              <button
                onClick={() => setComparisonMode(true)}
                className="btn btn-sm btn-outline"
              >
                Compare Mode
              </button>
            </div>
            <SimulationControls />
            <div className="mt-6">
              <SkillTreePanel />
            </div>
            <div className="mt-6">
              <ActivityPanel />
            </div>
            <div className="mt-6">
              <TalentsPanel />
            </div>
            <div className="mt-6">
              <DevToolsPanel />
            </div>

            {/* Balance Testing Tools - needs more space than sidebar */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Balance Testing</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SimulationRunnerPanel />
                <TelemetryChartsPanel />
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
});

export default App;
