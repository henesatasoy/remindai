import { useEffect, useState } from "react";
import { Loader2, Brain } from "lucide-react";
import TestEngine from "./TestEngine";
import { Answer } from "@/data/questions";

interface MainPanelProps {
  isLoading: boolean;
}

type ViewState = "loading" | "intro" | "test" | "results";

const MainPanel = ({ isLoading }: MainPanelProps) => {
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [testResults, setTestResults] = useState<Answer[]>([]);

  useEffect(() => {
    if (!isLoading && viewState === "loading") {
      setViewState("intro");
    }
  }, [isLoading, viewState]);

  const handleStartTest = () => {
    setViewState("test");
  };

  const handleTestComplete = (answers: Answer[]) => {
    setTestResults(answers);
    setViewState("results");
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-background animate-slide-in-right">
      <div className="max-w-4xl mx-auto p-8">
        {/* Loading State */}
        {viewState === "loading" && (
          <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-glow" />
              <Loader2 className="w-16 h-16 text-primary animate-spin-slow relative z-10" />
            </div>
            <p className="text-xl text-muted-foreground animate-pulse">
              Test yükleniyor...
            </p>
          </div>
        )}

        {/* Intro State */}
        {viewState === "intro" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  MaRs-IB Testi
                </h1>
                <p className="text-muted-foreground">
                  Psikolojik değerlendirme aracı
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Test Hakkında
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  MaRs-IB Testi, bireylerin bilişsel ve duygusal süreçlerini 
                  değerlendirmek için tasarlanmış kapsamlı bir psikolojik 
                  değerlendirme aracıdır. Bu test, kişilik özelliklerini, 
                  problem çözme becerilerini ve duygusal zeka düzeyini ölçmek 
                  amacıyla geliştirilmiştir.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Nasıl Çalışır?
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Her soru için 30 saniye süreniz vardır. Sorular arasında 
                  kısa bir odaklanma ekranı göreceksiniz. Doğru cevabı 
                  seçtikten sonra otomatik olarak bir sonraki soruya geçilir. 
                  Geri dönüş yapılamaz.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Önemli Bilgiler
                </h2>
                <ul className="text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
                  <li>Her soru için 30 saniye süre verilir</li>
                  <li>Son 5 saniyede uyarı gösterilir</li>
                  <li>Süre dolduğunda otomatik olarak sonraki soruya geçilir</li>
                  <li>Cevap verdikten sonra geri dönülemez</li>
                </ul>
              </section>

              {/* Start Button */}
              <div className="pt-6">
                <button 
                  onClick={handleStartTest}
                  className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                >
                  Teste Başla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test State */}
        {viewState === "test" && (
          <TestEngine onComplete={handleTestComplete} />
        )}

        {/* Results State */}
        {viewState === "results" && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Test Sonuçları
                </h1>
                <p className="text-muted-foreground">
                  Değerlendirme tamamlandı
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground text-sm mb-2">Toplam Soru</p>
                <p className="text-3xl font-bold text-foreground">{testResults.length}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground text-sm mb-2">Doğru Cevap</p>
                <p className="text-3xl font-bold text-primary">
                  {testResults.filter((a) => a.isCorrect).length}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground text-sm mb-2">Ort. Süre</p>
                <p className="text-3xl font-bold text-foreground">
                  {Math.round(
                    testResults.reduce((sum, a) => sum + a.responseTimeMs, 0) / 
                    testResults.length / 1000
                  )}s
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => setViewState("intro")}
                className="w-full py-4 px-6 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-medium text-lg transition-all duration-300"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainPanel;
