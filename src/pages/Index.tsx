import { useState, useEffect, useRef, useMemo } from "react";
import { Send, Sparkles, MessageSquare, Plus, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import PsyCogSidebar from "@/components/PsyCogSidebar";
import MainPanel from "@/components/MainPanel";
import { generateSessionId, saveExperimentResult } from "@/lib/experimentService";

const fakeChatHistory = ["IQ testim hakkında bilgi ver", "Raven testinin sonuçları nasıl yorumlanır?", "Bilişsel becerilerimi nasıl geliştirebilirim?", "Dikkat eksikliği testi yap", "Hafıza güçlendirme teknikleri", "Görsel-uzamsal zeka nedir?"];
const fakeModels = [{
  id: "psycog-4",
  name: "PsyCog-4",
  description: "En gelişmiş model"
}, {
  id: "psycog-4-mini",
  name: "PsyCog-4 Mini",
  description: "Hızlı ve verimli"
}, {
  id: "psycog-3.5",
  name: "PsyCog-3.5",
  description: "Dengeli performans"
}];

type ViewState = "loading" | "instructions" | "practice" | "practice-passed" | "practice-failed" | "phase1" | "ai-analysis" | "intervention" | "phase2" | "complete";

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const [isTransformed, setIsTransformed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [isAttentionCheckClicked, setIsAttentionCheckClicked] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate a unique session ID for this experiment session
  const sessionId = useMemo(() => generateSessionId(), []);

  // When intervention state is active, expand sidebar
  useEffect(() => {
    if (viewState === "intervention") {
      setIsSidebarCollapsed(false);
    }
  }, [viewState]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setPromptHistory(prev => [inputValue, ...prev]);
    setIsTransformed(true);
    setIsLoading(true);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isTransformed && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTransformed]);

  const [isHomeSidebarCollapsed, setIsHomeSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState(fakeModels[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Initial centered view with decorative sidebar
  if (!isTransformed) {
    return <div className="min-h-screen bg-background flex w-full">
        {/* Decorative LLM-style Sidebar */}
        <aside className={`
            h-screen bg-sidebar border-r border-sidebar-border
            transition-all duration-500 ease-in-out
            flex flex-col relative shrink-0
            ${isHomeSidebarCollapsed ? "w-16" : "w-64"}
          `}>
          {/* Toggle Button */}
          <button onClick={() => setIsHomeSidebarCollapsed(!isHomeSidebarCollapsed)} className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors">
            {isHomeSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-foreground" /> : <ChevronLeft className="w-4 h-4 text-foreground" />}
          </button>

          {/* New Chat Button */}
          <div className="p-3 border-b border-sidebar-border">
            <button className={`
                w-full flex items-center gap-3 p-3 rounded-lg
                bg-primary/10 hover:bg-primary/20 transition-colors
                text-foreground
                ${isHomeSidebarCollapsed ? "justify-center" : ""}
              `}>
              <Plus className="w-5 h-5 text-primary shrink-0" />
              {!isHomeSidebarCollapsed && <span className="text-sm font-medium">Yeni Sohbet</span>}
            </button>
          </div>

          {/* Fake Chat History */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className={`mb-2 ${isHomeSidebarCollapsed ? "hidden" : ""}`}>
              <span className="text-xs text-muted-foreground px-3">Son 7 gün</span>
            </div>
            {fakeChatHistory.map((chat, index) => <div key={index} className={`
                  flex items-start gap-3 p-3 rounded-lg
                  hover:bg-sidebar-accent transition-colors cursor-pointer
                  ${isHomeSidebarCollapsed ? "justify-center" : ""}
                `}>
                <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                {!isHomeSidebarCollapsed && <span className="text-sm text-foreground line-clamp-1">
                    {chat}
                  </span>}
              </div>)}
          </div>

          {/* Footer */}
          {!isHomeSidebarCollapsed && <div className="p-4 border-t border-sidebar-border">
              <p className="text-xs text-muted-foreground text-center">
                PsyCog v2.4.1
              </p>
            </div>}
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {/* Logo */}
          <div className="mb-16 text-center animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
              <h1 className="text-5xl font-bold text-foreground tracking-tight">
                PsyCog
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Psikoloji için tasarlanmış bir dil modeli</p>
          </div>

          {/* Input Area */}
          <div className="w-full max-w-2xl animate-fade-in" style={{
          animationDelay: "0.1s"
        }}>
            <div className="relative glow-input rounded-2xl bg-card border border-border transition-all duration-300">
              {/* Model Selector */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20">
                <button onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground">
                  <span className="font-medium">{selectedModel.name}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isModelDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isModelDropdownOpen && <div className="absolute top-full left-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    {fakeModels.map(model => <button key={model.id} onClick={() => {
                  setSelectedModel(model);
                  setIsModelDropdownOpen(false);
                }} className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${selectedModel.id === model.id ? "bg-muted/50" : ""}`}>
                        <div className="text-sm font-medium text-foreground">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </button>)}
                  </div>}
              </div>

              <input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Bir şeyler sorun..." className="w-full pl-36 pr-14 py-5 bg-transparent text-foreground text-lg placeholder:text-muted-foreground focus:outline-none rounded-2xl" />
              <button onClick={handleSubmit} disabled={!inputValue.trim()} className={`
                  absolute right-3 top-1/2 -translate-y-1/2
                  w-10 h-10 rounded-xl flex items-center justify-center
                  transition-all duration-300
                  ${inputValue.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}
                `}>
                <Send className="w-5 h-5" />
              </button>
            </div>
            
          </div>
        </div>
      </div>;
  }

  const handleStartPhase2 = () => {
    // Save the attention check result
    saveExperimentResult({
      session_id: sessionId,
      phase: 'phase2',
      question_index: -1,
      is_correct: true,
      reaction_time_ms: 0,
      timed_out: false,
      attention_check_click: isAttentionCheckClicked
    });
    setIsSidebarCollapsed(true);
    setViewState("phase2");
  };

  const handleStartPractice = () => {
    setViewState("practice");
  };

  const handleStartPhase1 = () => {
    setIsSidebarCollapsed(true);
    setViewState("phase1");
  };

  // Transformed view with sidebar and main panel
  // During intervention, instructions, or practice results, sidebar takes full screen
  const isFullscreenChat = viewState === "intervention" || viewState === "instructions" || viewState === "practice-passed" || viewState === "practice-failed";

  return <div className="min-h-screen bg-background flex w-full">
      <PsyCogSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        promptHistory={promptHistory}
        viewState={viewState}
        isAttentionCheckClicked={isAttentionCheckClicked}
        onAttentionCheckClick={() => setIsAttentionCheckClicked(!isAttentionCheckClicked)}
        onStartPhase2={handleStartPhase2}
        onStartPractice={handleStartPractice}
        onStartPhase1={handleStartPhase1}
        practiceScore={practiceScore}
        userFirstMessage={promptHistory[promptHistory.length - 1] || ""}
      />
      {!isFullscreenChat && (
        <MainPanel 
          isLoading={isLoading} 
          viewState={viewState}
          onViewStateChange={setViewState}
          isAttentionCheckClicked={isAttentionCheckClicked}
          sessionId={sessionId}
          onPracticeScoreChange={setPracticeScore}
        />
      )}
    </div>;
};
export default Index;