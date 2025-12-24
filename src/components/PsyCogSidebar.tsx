import { ChevronLeft, ChevronRight, MessageSquare, Plus, Clock, MoreHorizontal } from "lucide-react";

interface PsyCogSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  promptHistory: string[];
}

// Mock chat history data for LLM-like appearance
const mockChatHistory = [
  { id: 1, title: "MaRs-IB Testi - Oturum 1", date: "Bugün", isActive: true },
  { id: 2, title: "Bilişsel Değerlendirme", date: "Bugün", isActive: false },
  { id: 3, title: "Dikkat Testi Sonuçları", date: "Dün", isActive: false },
  { id: 4, title: "Problem Çözme Analizi", date: "Dün", isActive: false },
  { id: 5, title: "Hafıza Değerlendirmesi", date: "Bu Hafta", isActive: false },
  { id: 6, title: "Mantık Testi - Deneme", date: "Bu Hafta", isActive: false },
];

const PsyCogSidebar = ({ isCollapsed, onToggle, promptHistory }: PsyCogSidebarProps) => {
  // Group chats by date
  const groupedChats = mockChatHistory.reduce((acc, chat) => {
    if (!acc[chat.date]) {
      acc[chat.date] = [];
    }
    acc[chat.date].push(chat);
    return acc;
  }, {} as Record<string, typeof mockChatHistory>);

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

      {/* Header with New Chat Button */}
      <div className="p-3 border-b border-sidebar-border">
        {isCollapsed ? (
          <button className="w-10 h-10 rounded-lg bg-sidebar-accent hover:bg-muted flex items-center justify-center transition-colors mx-auto">
            <Plus className="w-5 h-5 text-foreground" />
          </button>
        ) : (
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-sidebar-accent transition-colors group">
            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm font-medium text-foreground">Yeni Oturum</span>
          </button>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {isCollapsed ? (
          // Collapsed view - just icons
          <div className="space-y-1">
            {mockChatHistory.slice(0, 6).map((chat) => (
              <button
                key={chat.id}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-colors
                  ${chat.isActive 
                    ? "bg-sidebar-accent text-foreground" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }
                `}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            ))}
          </div>
        ) : (
          // Expanded view - grouped by date
          <div className="space-y-4">
            {Object.entries(groupedChats).map(([date, chats]) => (
              <div key={date}>
                <div className="flex items-center gap-2 px-2 mb-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {date}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      className={`
                        w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg transition-all group
                        ${chat.isActive 
                          ? "bg-sidebar-accent text-foreground" 
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span className="text-sm truncate">{chat.title}</span>
                      </div>
                      <MoreHorizontal className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Show recent prompts if any */}
            {promptHistory.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-2 mb-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Son Sorgular
                  </span>
                </div>
                <div className="space-y-0.5">
                  {promptHistory.slice(0, 5).map((prompt, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all group"
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span className="text-sm truncate">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">K</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Kullanıcı</p>
              <p className="text-xs text-muted-foreground">Ücretsiz Plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default PsyCogSidebar;
