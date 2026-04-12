import { useState } from "react";
import ChatComposer from "../components/Chat/ChatComposer";
import ChatMessageList from "../components/Chat/ChatMessageList";
import { useGameStore } from "../store/useGameStore";

export default function ChatPage() {
  const chatMessages = useGameStore((state) => state.chatMessages);
  const isChatSending = useGameStore((state) => state.isChatSending);
  const currentMission = useGameStore((state) => state.currentMission);
  const userLocation = useGameStore((state) => state.userLocation);
  const sendChatMessage = useGameStore((state) => state.sendChatMessage);
  const [draft, setDraft] = useState("");

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
