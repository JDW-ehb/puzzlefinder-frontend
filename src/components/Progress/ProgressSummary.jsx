const achievementCatalog = [
  {
    id: "first-step",
    title: "First Step",
    description: "Complete your first location verification.",
    unlocksAt: 1,
  },
  {
    id: "urban-detective",
    title: "Urban Detective",
    description: "Unlock two locations and keep moving.",
    unlocksAt: 2,
  },
  {
    id: "brussels-legend",
    title: "Brussels Legend",
    description: "Clear the whole route.",
    unlocksAt: Infinity,
  },
  {
    id: "guide-reader",
    title: "Guide Reader",
    description: "Use the AI chat to request mission tips.",
    unlocksAt: 0,
  },
];

export default function ProgressSummary({ progress, unlockedLocations, currentMission, locations = [] }) {
  const totalLocations = locations.length || progress.total || 1;
  const completionPercent = Math.round((progress.completed / totalLocations) * 100);
  const dynamicAchievements = achievementCatalog.map((achievement) =>
    achievement.id === "brussels-legend"
      ? {
          ...achievement,
          unlocksAt: totalLocations,
        }
      : achievement
  );

  return (
    <section className="space-y-4 p-4">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Journey</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Progress tracker</h2>
          </div>
          <div className="rounded-2xl bg-slate-950/80 px-3 py-2 text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Complete</p>
            <p className="text-lg font-semibold text-white">{completionPercent}%</p>
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-300 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-slate-950/70 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Found</p>
            <p className="mt-1 text-lg font-semibold text-white">{progress.completed}</p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
            <p className="mt-1 text-lg font-semibold text-white">{progress.total}</p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Unlocked</p>
            <p className="mt-1 text-lg font-semibold text-white">{unlockedLocations.length}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Current mission</p>
        <p className="mt-2 text-base leading-relaxed text-white">{currentMission}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {dynamicAchievements.map((achievement) => {
          const isUnlocked = achievement.unlocksAt === 0 || progress.completed >= achievement.unlocksAt;

          return (
            <div
              key={achievement.id}
              className={`rounded-[1.5rem] border px-4 py-4 ${
                isUnlocked
                  ? "border-cyan-300/20 bg-cyan-300/10"
                  : "border-white/10 bg-white/5 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{achievement.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{achievement.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${isUnlocked ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                  {isUnlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Unlocked locations</p>
        <div className="mt-3 space-y-3">
          {unlockedLocations.length ? (
            unlockedLocations.map((locationId) => {
              const location = locations.find((entry) => entry.id === locationId);

              if (!location) {
                return null;
              }

              return (
                <div key={location.id} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                  <p className="font-semibold text-white">{location.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{location.hint}</p>
                </div>
              );
            })
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 px-4 py-4 text-sm text-slate-400">
              No locations unlocked yet. Verify your first stop to start filling this list.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
