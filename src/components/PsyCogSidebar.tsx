import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";

interface PsyCogSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  promptHistory: string[];
}

const PsyCogSidebar = ({ isCollapsed, onToggle, promptHistory }: PsyCogSidebarProps) => {
  return (
    <aside
      className={`
        h-screen bg-sidebar border-r border-sidebar-border
        transition-all duration-500 ease-in-out
        flex flex-col relative
        ${isCollapsed ? "w-16" : "w-72"}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-foreground" />
        )}
      </button>

      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h1
          className={`
            font-semibold text-foreground transition-all duration-300
            ${isCollapsed ? "text-center text-sm" : "text-xl"}
          `}
        >
          {isCollapsed ? "P" : "PsyCog"}
        </h1>
      </div>

      {/* Prompt History */}
      <div className="flex-1 overflow-y-auto p-2">
        {promptHistory.map((prompt, index) => (
          <div
            key={index}
            className={`
              flex items-start gap-3 p-3 rounded-lg
              hover:bg-sidebar-accent transition-colors cursor-pointer
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <MessageSquare className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            {!isCollapsed && (
              <span className="text-sm text-foreground line-clamp-2">
                {prompt}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            Geçmiş sorgularınız burada görünür
          </p>
        </div>
      )}
    </aside>
  );
};

export default PsyCogSidebar;
