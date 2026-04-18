import PhotoVerifier from "../components/Upload/PhotoVerifier";
import ProgressSummary from "../components/Progress/ProgressSummary";
import { useGameStore } from "../store/useGameStore";

export default function ProgressPage() {
  const progress = useGameStore((state) => state.progress);
  const unlockedLocations = useGameStore((state) => state.unlockedLocations);
  const currentMission = useGameStore((state) => state.currentMission);
  const locations = useGameStore((state) => state.locations);

  return (
    <div className="h-full overflow-y-auto">
      <div className="lg:grid lg:grid-cols-[1.25fr_0.9fr] lg:items-start lg:gap-1 lg:px-2 lg:py-2">
        <ProgressSummary
          progress={progress}
          unlockedLocations={unlockedLocations}
          currentMission={currentMission}
          locations={locations}
        />

        <div className="px-4 pb-4 pt-0 lg:pt-4">
          <PhotoVerifier />
        </div>
      </div>
    </div>
  );
}
