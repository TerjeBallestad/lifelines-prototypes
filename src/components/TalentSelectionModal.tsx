import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useSimulationStore, useTalentStore } from '../stores/RootStore';
import { TalentCard } from './TalentCard';

/**
 * Modal for picking 1 of 3 offered talents.
 * Uses native dialog element for accessibility.
 * Cannot be dismissed without making a selection.
 */
export const TalentSelectionModal = observer(function TalentSelectionModal() {
  const talentStore = useTalentStore();
  const simulationStore = useSimulationStore();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [previousSimulationPlayState, setPreviousSimulationPlayState] =
    useState(false);

  // Auto-open when offer becomes available
  useEffect(() => {
    if (
      talentStore.currentOffer &&
      dialogRef.current &&
      !dialogRef.current.open
    ) {
      dialogRef.current.showModal();
      setPreviousSimulationPlayState(simulationStore.isRunning);
      simulationStore.stop();
    }
  }, [simulationStore, talentStore.currentOffer]);

  const handleSelect = (talentId: string) => {
    talentStore.selectTalent(talentId);
    if (previousSimulationPlayState) {
      simulationStore.start();
    } else {
      simulationStore.stop();
    }
    dialogRef.current?.close();
  };

  // Prevent ESC key from closing modal
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  if (!talentStore.currentOffer) return null;

  return (
    <dialog ref={dialogRef} className="modal" onCancel={handleCancel}>
      <div className="modal-box max-w-2xl">
        {/* Header */}
        <h3 className="mb-2 text-xl font-bold">Choose a Talent</h3>

        {/* Pending picks indicator */}
        {talentStore.pendingPicks > 1 && (
          <div className="alert alert-info mb-4">
            <span>
              You have {talentStore.pendingPicks} talent picks available!
            </span>
          </div>
        )}

        {/* Vertical stacked cards per CONTEXT.md decision */}
        <div className="flex flex-col gap-4">
          {talentStore.currentOffer.map((talent) => (
            <TalentCard
              key={talent.id}
              talent={talent}
              onSelect={() => handleSelect(talent.id)}
            />
          ))}
        </div>

        {/* Info text */}
        <p className="mt-4 text-center text-sm opacity-60">
          Talents are permanent. Choose wisely!
        </p>
      </div>

      {/* Modal backdrop - clicking doesn't close (must select) */}
      <div className="modal-backdrop bg-black/50" />
    </dialog>
  );
});
