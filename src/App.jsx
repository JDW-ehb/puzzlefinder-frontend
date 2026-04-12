import { useEffect } from "react";
import { BottomNav } from "./components/Navigation/BottomNav";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import ProgressPage from "./pages/ProgressPage";
import { useGameStore } from "./store/useGameStore";

const pages = {
  chat: ChatPage,
  map: MapPage,
  progress: ProgressPage,
};

function App() {
  const activeTab = useGameStore((state) => state.activeTab);
  const currentMission = useGameStore((state) => state.currentMission);
  const progress = useGameStore((state) => state.progress);
  const theme = useGameStore((state) => state.theme);
  const toggleTheme = useGameStore((state) => state.toggleTheme);
  const userId = useGameStore((state) => state.userId);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const ActivePage = pages[activeTab] ?? ChatPage;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.12),_transparent_30%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(226,232,240,1))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(2,6,23,1))]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
        <header className="mb-4 rounded-[2rem] border border-slate-300/70 bg-white/70 px-4 py-4 shadow-2xl shadow-slate-300/30 backdrop-blur-xl dark:border-white/10 dark:bg-black dark:shadow-slate-950/40 lg:px-6 lg:py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">PuzzleFinder</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white lg:text-3xl">Brussels quest board</h1>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 lg:text-base">AI guide, live map clues, and photo verification in one flow.</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-2xl border border-slate-300 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-300/40 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:text-cyan-200"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-100/95 px-3 py-3 dark:bg-slate-900/70">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">Mission</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{currentMission}</p>
            </div>
            <div className="rounded-2xl bg-slate-100/95 px-3 py-3 dark:bg-slate-900/70">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">Progress</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                {progress.completed}/{progress.total} found
              </p>
              <p className="mt-1 text-xs text-slate-400 break-all">{userId}</p>
            </div>
          </div>

          <BottomNav className="mt-4 hidden lg:block" />
        </header>

        <main className="relative flex-1 overflow-hidden rounded-[2rem] border border-slate-300/70 bg-white/75 shadow-2xl shadow-slate-300/30 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/30 lg:min-h-[70vh]">
          <ActivePage />
        </main>

        <BottomNav className="fixed bottom-0 left-0 right-0 lg:hidden" />
      </div>
    </div>
  );
}

export default App;