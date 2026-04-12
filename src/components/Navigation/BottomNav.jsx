import { useGameStore } from "../../store/useGameStore";

const tabs = [
  { id: "map", label: "Map", icon: "🗺️" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "progress", label: "Progress", icon: "🏆" },
];

export function BottomNav({ className = "" }) {
  const activeTab = useGameStore((state) => state.activeTab);
  const setActiveTab = useGameStore((state) => state.setActiveTab);

  return (
    <nav className={`z-20 px-4 pb-4 ${className}`}>
      <div className="mx-auto flex max-w-md rounded-[1.75rem] border border-slate-300/80 bg-white/90 p-2 shadow-2xl shadow-slate-300/35 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:shadow-black/35 lg:max-w-none lg:bg-white/70 dark:lg:bg-slate-950/65 lg:shadow-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-3 text-xs font-semibold transition ${
                isActive
                  ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                  : "text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              } lg:flex-row lg:justify-center lg:gap-2 lg:text-sm`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
