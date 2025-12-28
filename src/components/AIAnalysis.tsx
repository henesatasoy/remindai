import { useState, useEffect, useRef } from "react";
import { Brain, Cpu, Activity } from "lucide-react";
interface AIAnalysisProps {
  onComplete: () => void;
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

// Fixed intervals for each message (in seconds) - total = 300 seconds (5 minutes)
const MESSAGE_INTERVALS = [
  5,   // Bağlantı kuruluyor... (appears after 5 sec)
  23,  // Nöral ağ başlatılıyor...
  41,  // Bilişsel harita çıkarılıyor...
  35,  // Dikkat profili hesaplanıyor...
  38,  // Yanıt süreleri değerlendiriliyor...
  52,  // Hata örüntüleri taranıyor...
  54,  // Doğruluk metrikleri hesaplanıyor...
  52   // Performans modeli oluşturuluyor...
];

const AIAnalysis = ({
  onComplete
}: AIAnalysisProps) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
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
  return <div className="relative min-h-[80vh] flex flex-col items-center justify-center gap-8 animate-fade-in">
      {/* Hidden skip button for dev testing */}
      <button onClick={onComplete} className="absolute top-0 right-0 w-12 h-12 opacity-0 hover:opacity-10 transition-opacity" aria-label="Skip (Dev Only)" />

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
      <p className="text-muted-foreground text-sm">Bu işlem yaklaşık 5 dakika sürecektir.</p>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{
          width: `${(300 - timeLeft) / 300 * 100}%`
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