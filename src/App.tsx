import { observer } from 'mobx-react-lite';
import { useCharacterStore } from './stores';

const App = observer(function App() {
  const characterStore = useCharacterStore();

  return (
    <div className="min-h-screen bg-base-100 p-8">
      <h1 className="text-2xl font-bold text-base-content mb-4">
        Lifelines Prototype
      </h1>

      <div className="card bg-base-200 shadow-xl max-w-md">
        <div className="card-body">
          <h2 className="card-title">Store Status</h2>
          <p>
            Character Store:{' '}
            <span className={characterStore.isReady ? 'text-success' : 'text-warning'}>
              {characterStore.isReady ? 'Ready' : 'Not initialized'}
            </span>
          </p>
          <div className="card-actions justify-end">
            <button
              className="btn btn-primary"
              onClick={() => characterStore.markInitialized()}
              disabled={characterStore.isReady}
            >
              Initialize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default App;
