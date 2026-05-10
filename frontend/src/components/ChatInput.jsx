import { useState, useRef } from "react";
import { SendHorizonal, Mic } from "lucide-react";

export default function ChatInput({ onSend, placeholder, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
    textareaRef.current.style.height = "auto";
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex items-end gap-2 bg-white/5 border border-white/15 rounded-2xl px-4 py-3 focus-within:border-amber-400/50 transition-all">
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder={placeholder || "Type your message..."}
        className="flex-1 bg-transparent text-white text-sm placeholder-white/30 resize-none outline-none leading-relaxed max-h-40 disabled:opacity-40"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-black hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
      >
        <SendHorizonal size={16} />
      </button>
    </div>
  );
}
