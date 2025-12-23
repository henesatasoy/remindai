import { useEffect, useState } from "react";
import { Loader2, Brain } from "lucide-react";

interface MainPanelProps {
  isLoading: boolean;
}

const MainPanel = ({ isLoading }: MainPanelProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [isLoading]);

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-background animate-slide-in-right">
      <div className="max-w-4xl mx-auto p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-glow" />
              <Loader2 className="w-16 h-16 text-primary animate-spin-slow relative z-10" />
            </div>
            <p className="text-xl text-muted-foreground animate-pulse">
              Test yükleniyor...
            </p>
          </div>
        ) : (
          <div className={`space-y-8 ${showContent ? "animate-fade-in" : "opacity-0"}`}>
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
                  Test, bir dizi soru ve senaryo içermektedir. Her bir soru, 
                  belirli bilişsel ve duygusal yetkinlikleri ölçmek için 
                  özenle hazırlanmıştır. Yanıtlarınız, gelişmiş algoritmalar 
                  kullanılarak analiz edilir ve size kişiselleştirilmiş bir 
                  değerlendirme raporu sunulur.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Süre ve Format
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Testin tamamlanması yaklaşık 15-20 dakika sürmektedir. 
                  Sorular çoktan seçmeli ve açık uçlu formatlardan oluşur. 
                  Lütfen her soruyu dikkatli bir şekilde okuyun ve size en 
                  uygun yanıtı seçin.
                </p>
              </section>

              {/* Start Button Placeholder */}
              <div className="pt-6">
                <button className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25">
                  Teste Başla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainPanel;
