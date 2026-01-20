import { CharacterCard } from './components/CharacterCard';

function App() {
  return (
    <div className="min-h-screen bg-base-100 p-8">
      <h1 className="text-2xl font-bold text-base-content mb-6">
        Lifelines Prototype
      </h1>

      <CharacterCard />
    </div>
  );
}

export default App;
