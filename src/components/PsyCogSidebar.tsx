import { ChevronLeft, ChevronRight, MessageSquare, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

type ViewState = "loading" | "instructions" | "practice" | "practice-passed" | "practice-failed" | "phase1" | "ai-analysis" | "intervention" | "phase2" | "complete";

interface PsyCogSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  promptHistory: string[];
  viewState: ViewState;
  isAttentionCheckClicked: boolean;
  onAttentionCheckClick: () => void;
  onStartPhase2?: () => void;
}

const INTERVENTION_TEXT = `Veri sonuçları kaliteli. İkinci test aşamasında verimlilik artışı ve doğruluk oranında artış bekleniyor. Lütfen bu mesajı okuduysanız sol üstte ki PsyCog yazısının solunda bulunan logoya tıklayın. İşaretledikten sonra hazır iseniz ikinci test aşamasını başlatmak için aşağıda ki Başlat butonuna basınız.`;

const useTypewriter = (text: string, speed: number = 20, enabled: boolean = true) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
};

const PsyCogSidebar = ({ 
  isCollapsed, 
  onToggle, 
  promptHistory, 
  viewState, 
  isAttentionCheckClicked, 
  onAttentionCheckClick,
  onStartPhase2
}: PsyCogSidebarProps) => {
  const isIntervention = viewState === "intervention";
  const { displayedText, isComplete } = useTypewriter(INTERVENTION_TEXT, 50, isIntervention);

  return (
    <aside
      className={`
        h-screen bg-sidebar border-r border-sidebar-border
        transition-all duration-500 ease-in-out
        flex flex-col relative
        ${isIntervention ? "flex-1" : isCollapsed ? "w-16" : "w-72"}
      `}
    >
      {/* Toggle Button - hide during intervention */}
      {!isIntervention && (
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
      )}

      {/* Header with Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          {/* Clickable Logo - only clickable during intervention */}
          {isIntervention ? (
            <button
              onClick={onAttentionCheckClick}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 shrink-0"
            >
              <Sparkles className={`w-5 h-5 transition-colors duration-300 ${
                isAttentionCheckClicked ? "text-green-500" : "text-primary"
              }`} />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          )}
          <h1
            className={`
              font-semibold text-foreground transition-all duration-300
              ${isCollapsed && !isIntervention ? "hidden" : "text-xl"}
            `}
          >
            PsyCog
          </h1>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Show intervention message as chat during intervention state */}
        {isIntervention ? (
          <div className="p-3 flex flex-col items-center justify-center h-full">
            {/* AI Message Bubble */}
            <div className="flex items-start gap-3 max-w-2xl w-full">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 bg-card border border-border rounded-xl p-4">
                <p className="text-foreground text-sm leading-relaxed">
                  {displayedText}
                  {!isComplete && <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse" />}
                </p>
              </div>
            </div>

            {/* Start Phase 2 Button */}
            <button 
              onClick={onStartPhase2}
              className="mt-8 w-full max-w-md py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            >
              Başlat
            </button>
          </div>
        ) : (
          /* Regular prompt history */
          promptHistory.map((prompt, index) => (
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
          ))
        )}
      </div>

      {/* Footer */}
      {(!isCollapsed || isIntervention) && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            {isIntervention ? "Mesajı okuyup logoyu işaretleyin" : "Geçmiş sorgularınız burada görünür"}
          </p>
        </div>
      )}
    </aside>
  );
};

export default PsyCogSidebar;