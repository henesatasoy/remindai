import { useState, useEffect, useRef } from "react";
import { Brain, Cpu, Activity, Paperclip, Mic, ArrowUp, Sparkles } from "lucide-react";
import { logSidebarInteraction } from "@/lib/experimentService";
import { usePromptInputLogger } from "@/hooks/usePromptInputLogger";
interface AIAnalysisProps {
  onComplete: () => void;
  sessionId?: string;
}
const TERMINAL_MESSAGES = [
  "Bağlantı kuruluyor...",
  "Nöral ağ başlatılıyor...",
  "Bilişsel harita çıkarılıyor...",
  "Dikkat profili hesaplanıyor...",
  "Yanıt süreleri değerlendiriliyor...",
  "Hata örüntüleri taranıyor...",
  "Doğruluk metrikleri hesaplanıyor...",
  "Performans modeli oluşturuluyor..."
];

// Fixed intervals for each message (in seconds) - total = 180 seconds (3 minutes)
const MESSAGE_INTERVALS = [
  3,   // Bağlantı kuruluyor...
  14,  // Nöral ağ başlatılıyor...
  25,  // Bilişsel harita çıkarılıyor...
  21,  // Dikkat profili hesaplanıyor...
  23,  // Yanıt süreleri değerlendiriliyor...
  31,  // Hata örüntüleri taranıyor...
  32,  // Doğruluk metrikleri hesaplanıyor...
  31   // Performans modeli oluşturuluyor...
];

const AIAnalysis = ({
  onComplete,
  sessionId
}: AIAnalysisProps) => {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalPromptInput = usePromptInputLogger(sessionId, "ai-analysis", "ai_terminal_prompt_input");

  // Timer countdown — when it reaches 0, show a brief completion screen, then transition.
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinishing(true);
          // Hold the completion screen for a moment so the transition feels intentional.
          setTimeout(() => onComplete(), 2800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onComplete]);

  // Terminal message with fixed intervals
  useEffect(() => {
    if (currentMessageIndex >= TERMINAL_MESSAGES.length) return;

    const intervalSeconds = MESSAGE_INTERVALS[currentMessageIndex];
    
    const timeout = setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString("tr-TR");
      const message = TERMINAL_MESSAGES[currentMessageIndex];
      setTerminalLines(prev => [...prev, `[${timestamp}] ${message}`]);
      setCurrentMessageIndex(prev => prev + 1);
    }, intervalSeconds * 1000);

    return () => clearTimeout(timeout);
  }, [currentMessageIndex]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  if (isFinishing) {
    return (
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center gap-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-scale-in">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
        </div>
        <div className="text-center space-y-3 max-w-xl px-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground">Analiz tamamlandı</h2>
          <p className="text-muted-foreground leading-relaxed">
            ​Harikasın! Bilişsel haritanı çıkardım ve sonuçlarını seninle paylaşmaya hazırım. Bir saniye içinde devam ediyoruz...
          </p>
        </div>
      </div>
    );
  }

  return <div className="relative min-h-[80vh] flex flex-col items-center justify-center gap-8 animate-fade-in">
      {/* Hidden skip button for dev testing */}
      <button onClick={onComplete} className="absolute top-0 right-0 w-12 h-12 opacity-0 hover:opacity-10 transition-opacity" aria-label="Skip (Dev Only)" />

      {/* (X exit button removed — replaced by a labeled button below the terminal) */}

      {/* AI Message Bubble — same style as previous AI messages in the sidebar */}
      <div className="w-full max-w-2xl self-start flex items-start gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 bg-card border border-border rounded-xl p-4">
          <p className="text-foreground text-sm leading-relaxed">
            ​İlk aşama verilerini aldım! Bilişsel haritanı çıkarmak ve etkileşim dinamiklerini analiz etmek için yaklaşık 3 dakikalık bir işlem süresine ihtiyacım var. Lütfen analiz tamamlanana kadar bu sekmeden ayrılma.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Yapay Zeka Analizi</h2>
          <p className="text-muted-foreground">Verileriniz işleniyor...</p>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">İşlemci Aktif</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Analiz Devam Ediyor</span>
        </div>
      </div>

      {/* Info text */}
      <p className="text-muted-foreground text-sm">Bu işlem yaklaşık 3 dakika sürecektir.</p>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{
          width: `${(180 - timeLeft) / 180 * 100}%`
        }} />
        </div>
      </div>

      {/* Terminal */}
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-2 text-xs text-muted-foreground font-mono">ReMind AI Terminal</span>
        </div>
        <div ref={terminalRef} className="h-64 p-4 font-mono text-sm overflow-y-auto">
          {terminalLines.map((line, index) => <div key={index} className="text-primary/80 mb-1 animate-fade-in" style={{
          animationDelay: `${index * 50}ms`
        }}>
              {line}
              {index === terminalLines.length - 1 && <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />}
            </div>)}
          {terminalLines.length === 0 && <div className="text-muted-foreground">
              Sistem başlatılıyor...
              <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
            </div>}
        </div>
      </div>

      {/* Exit Button - placed below the terminal */}
      <button
        onClick={() => {
          if (window.confirm("Testten çıkmak istediğinize emin misiniz? İlerlemeniz kaybolacaktır.")) {
            window.location.href = "/";
          }
        }}
        className="px-6 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted opacity-60 hover:opacity-100 transition-all"
      >
        Testten Çık
      </button>


      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => <div key={i} className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse" style={{
        left: `${20 + i * 12}%`,
        top: `${30 + i % 3 * 20}%`,
        animationDelay: `${i * 0.5}s`
      }} />)}
      </div>
    </div>;
};
export default AIAnalysis;