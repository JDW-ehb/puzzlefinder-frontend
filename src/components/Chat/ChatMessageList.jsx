import { useEffect, useRef } from "react";

function ChatBubble({ message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-[1.5rem] px-4 py-3 text-sm leading-relaxed shadow-lg ${
          isUser
            ? "rounded-br-md bg-cyan-400 text-slate-950 shadow-cyan-500/10"
            : "rounded-bl-md border border-white/10 bg-slate-900/90 text-slate-100"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

export default function ChatMessageList({ messages, isTyping }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}

      {isTyping ? (
        <div className="flex justify-start">
          <div className="rounded-[1.5rem] rounded-bl-md border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-400 shadow-lg">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
              AI guide is typing
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
