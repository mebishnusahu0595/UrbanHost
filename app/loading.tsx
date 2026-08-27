export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[2px] pointer-events-none transition-all duration-200">
      {/* Clean 3 Animated Dots */}
      <div className="flex items-center justify-center gap-2.5">
        <span className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-3.5 h-3.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 animate-bounce"></span>
      </div>
    </div>
  );
}
