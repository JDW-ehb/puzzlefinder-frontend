import { useState } from "react";
import ChatComposer from "../components/Chat/ChatComposer";
import ChatMessageList from "../components/Chat/ChatMessageList";
import { useGameStore } from "../store/useGameStore";

export default function ChatPage() {
  const chatMessages = useGameStore((state) => state.chatMessages);
  const isChatSending = useGameStore((state) => state.isChatSending);
  const currentMission = useGameStore((state) => state.currentMission);
  const currentTargetId = useGameStore((state) => state.currentTargetId);
  const locations = useGameStore((state) => state.locations);
  const unlockedLocations = useGameStore((state) => state.unlockedLocations);
  const userLocation = useGameStore((state) => state.userLocation);
  const sendChatMessage = useGameStore((state) => state.sendChatMessage);
  const [draft, setDraft] = useState("");

  const visibleLocations = locations.length > 12 ? locations.slice(0, 12) : locations;
  const extraLocationCount = Math.max(locations.length - visibleLocations.length, 0);

  async function handleSubmit(event) {
    event.preventDefault();

    const response = await sendChatMessage(draft);
    if (response?.reply) {
      setDraft("");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-white/10 px-4 py-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Mission board</p>
              <h2 className="mt-1 text-lg font-semibold text-white">All loaded locations from the webhook</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-300">
              {locations.length} missions
            </span>
          </div>

          <div className="mt-4 grid max-h-[26rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
            {visibleLocations.map((location, index) => {
              const isActive = location.id === currentTargetId;
              const isUnlocked = unlockedLocations.includes(location.id) || isActive;

              return (
                <div
                  key={location.id}
                  className={`rounded-[1.25rem] border px-4 py-4 transition ${
                    isActive ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-slate-950/70"
                  }`}
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Stop {index + 1}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{location.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{location.hint}</p>
                  <p className={`mt-3 text-xs font-semibold uppercase tracking-[0.2em] ${isActive ? "text-cyan-200" : "text-slate-500"}`}>
                    {isActive ? "Current target" : isUnlocked ? "Unlocked" : "Upcoming"}
                  </p>
                </div>
              );
            })}
          </div>

          {extraLocationCount > 0 ? (
            <p className="mt-3 text-xs text-slate-400">
              Showing the first {visibleLocations.length} stops. The remaining {extraLocationCount} locations are loaded too and can be reached through the map or progress flow.
            </p>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Guide status</p>
          <p className="mt-2 text-sm text-slate-200">{currentMission}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Location</p>
            <p className="mt-1 text-sm font-medium text-white">
              {userLocation ? `GPS ${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}` : "Location not shared"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mode</p>
            <p className="mt-1 text-sm font-medium text-white">{isChatSending ? "AI answering" : "Ready"}</p>
          </div>
        </div>
      </div>

      <ChatMessageList messages={chatMessages} isTyping={isChatSending} />

      <ChatComposer
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onSubmit={handleSubmit}
        onPromptClick={(prompt) => setDraft(prompt)}
        disabled={isChatSending}
      />
    </div>
  );
}
