"use client";

import { useState } from "react";

// Aria — the in-app assistant slot. The animated icon and chat shell are real;
// the replies are a placeholder until this is wired to an actual AI backend
// (needs a server-side API route + a model API key — see README "Aria" section).
export default function AriaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "aria"; text: string }[]>([
    { from: "aria", text: "Hi, I'm Aria 👋 Ask me about a song, a chord, or how to use Chord Bank." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((m) => [
      ...m,
      { from: "user", text: userText },
      {
        from: "aria",
        text:
          "I'm not connected to a real AI yet — my creator needs to wire up a backend for that. For now, try the Songs search or the Repositories tab!",
      },
    ]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Aria chat"
        className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo to-magenta shadow-lg shadow-indigo/30 -mt-6 border-4 border-cream dark:border-ink"
      >
        <span className="absolute inset-0 rounded-full border-2 border-indigo/40 animate-[spin_3s_linear_infinite]" />
        <AriaBotIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-white dark:bg-ink w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col h-[70vh] sm:h-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo to-magenta flex items-center justify-center">
                <AriaBotIcon small />
              </div>
              <p className="font-semibold text-indigo dark:text-magenta">Aria</p>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    m.from === "aria"
                      ? "bg-indigo/10 text-ink dark:text-cream self-start"
                      : "bg-magenta text-white self-end"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-black/5 dark:border-white/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask Aria..."
                className="flex-1 rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-sm"
              />
              <button onClick={send} className="px-3 py-2 rounded-xl bg-indigo text-white text-sm font-medium">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AriaBotIcon({ small = false }: { small?: boolean }) {
  const s = small ? 16 : 22;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="animate-[spin_6s_linear_infinite]">
      <circle cx="12" cy="12" r="3.2" fill="white" />
      <circle cx="12" cy="3.2" r="1.6" fill="white" />
      <circle cx="12" cy="20.8" r="1.6" fill="white" />
      <circle cx="3.2" cy="12" r="1.6" fill="white" />
      <circle cx="20.8" cy="12" r="1.6" fill="white" />
      <circle cx="6" cy="6" r="1.3" fill="white" fillOpacity="0.7" />
      <circle cx="18" cy="18" r="1.3" fill="white" fillOpacity="0.7" />
      <circle cx="18" cy="6" r="1.3" fill="white" fillOpacity="0.7" />
      <circle cx="6" cy="18" r="1.3" fill="white" fillOpacity="0.7" />
    </svg>
  );
}
