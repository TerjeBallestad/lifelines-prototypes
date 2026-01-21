import { observer } from 'mobx-react-lite';
import { CharacterPanel } from './components/CharacterPanel';
import { SimulationControls } from './components/SimulationControls';
import { useCharacterStore } from './stores/RootStore';

const App = observer(function App() {
  const characterStore = useCharacterStore();

  // Create a character on first render if none exists
  if (!characterStore.hasCharacter) {
    characterStore.createCharacter('Test Character');
  }

  return (
    <div className="flex min-h-screen bg-base-100">
      {/* Sidebar */}
      <CharacterPanel />

      {/* Main content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Lifelines Prototype</h1>
        <SimulationControls />

        <div className="mt-8 prose">
          <p>
            Start the simulation to watch resources drain based on personality.
            Adjust personality sliders in the sidebar to see how traits affect
            rates.
          </p>
        </div>
      </div>
    </div>
  );
});

export default App;
