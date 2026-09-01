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
        className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg -mt-2 border-[3px] border-cream dark:border-ink"
        style={{ background: "linear-gradient(155deg, #A78BFA, #6D28D9)" }}
      >
        <AriaBotIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-white dark:bg-ink w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col h-[70vh] sm:h-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5 dark:border-white/10">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(155deg, #A78BFA, #6D28D9)" }}
              >
                <AriaBotIcon small />
              </div>
              <p className="font-semibold" style={{ color: "#7C3AED" }}>Aria</p>
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

// A fixed AI "spark" glyph (the shape used across AI-assistant products) with
// one small satellite dot that genuinely orbits it — a circular-motion cue
// that reads as "an agent is here" rather than a spinning pinwheel.
function AriaBotIcon({ small = false }: { small?: boolean }) {
  const s = small ? 18 : 24;
  return (
    <span className="relative inline-block" style={{ width: s, height: s }}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="white">
        <path d="M12 2.5c.4 3.4 1.1 5.7 2.3 6.9 1.2 1.2 3.5 1.9 6.9 2.3-3.4.4-5.7 1.1-6.9 2.3-1.2 1.2-1.9 3.5-2.3 6.9-.4-3.4-1.1-5.7-2.3-6.9-1.2-1.2-3.5-1.9-6.9-2.3 3.4-.4 5.7-1.1 6.9-2.3 1.2-1.2 1.9-3.5 2.3-6.9Z" />
      </svg>
      <span className="absolute inset-0 animate-[spin_2.4s_linear_infinite]">
        <span
          className="absolute rounded-full bg-white"
          style={{ width: s * 0.16, height: s * 0.16, top: -1, left: "50%", transform: "translateX(-50%)" }}
        />
      </span>
    </span>
  );
}
