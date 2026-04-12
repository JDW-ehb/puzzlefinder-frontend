const quickPrompts = ["Give me a clue", "Where should I go?", "I found the spot", "What is the next mission?"];

export default function ChatComposer({ value, onChange, onSubmit, onPromptClick, disabled }) {
  return (
    <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur-xl">
      <div className="mb-3 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptClick(prompt)}
            disabled={disabled}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <label className="sr-only" htmlFor="chat-input">
          Chat message
        </label>
        <textarea
          id="chat-input"
          value={value}
          onChange={onChange}
          rows={1}
          placeholder="Ask for a clue, mission update, or verification tip..."
          className="min-h-[3.25rem] flex-1 resize-none rounded-[1.5rem] border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex min-h-[3.25rem] items-center justify-center rounded-[1.5rem] bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          Send
        </button>
      </form>
    </div>
  );
}
