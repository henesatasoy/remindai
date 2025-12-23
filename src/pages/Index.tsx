import { useState, useEffect, useRef } from "react";
import { Send, Sparkles } from "lucide-react";
import PsyCogSidebar from "@/components/PsyCogSidebar";
import MainPanel from "@/components/MainPanel";

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const [isTransformed, setIsTransformed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    setPromptHistory((prev) => [inputValue, ...prev]);
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

  // Initial centered view
  if (!isTransformed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="mb-16 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              PsyCog
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Yapay zeka destekli psikolojik değerlendirme
          </p>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-2xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="relative glow-input rounded-2xl bg-card border border-border transition-all duration-300">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bir şeyler sorun..."
              className="w-full px-6 py-5 pr-14 bg-transparent text-foreground text-lg placeholder:text-muted-foreground focus:outline-none rounded-2xl"
            />
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className={`
                absolute right-3 top-1/2 -translate-y-1/2
                w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-300
                ${
                  inputValue.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Sorgunuzu yazın ve Enter tuşuna basın
          </p>
        </div>
      </div>
    );
  }

  // Transformed view with sidebar and main panel
  return (
    <div className="min-h-screen bg-background flex w-full">
      <PsyCogSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        promptHistory={promptHistory}
      />
      <MainPanel isLoading={isLoading} />
    </div>
  );
};

export default Index;
