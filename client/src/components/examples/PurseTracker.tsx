import PurseTracker from '../PurseTracker';

export default function PurseTrackerExample() {
  return (
    <div className="p-8">
      <PurseTracker 
        totalPurse={100000000}
        usedPurse={45000000}
        teamName="Mumbai Indians"
      />
    </div>
  );
}
