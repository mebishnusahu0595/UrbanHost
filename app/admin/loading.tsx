export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)] w-full">
      {/* Clean 3 Animated Dots perfectly centered */}
      <div className="flex items-center justify-center gap-3">
        <span className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-3.5 h-3.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 animate-bounce"></span>
      </div>
    </div>
  );
}
