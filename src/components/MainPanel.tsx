import { useEffect, useState } from "react";
import { Loader2, Brain, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";
import TestEngine from "./TestEngine";
import AIAnalysis from "./AIAnalysis";
import { Answer, PRACTICE_QUESTIONS, PHASE1_QUESTIONS, PHASE2_QUESTIONS } from "@/data/questions";
import { saveExperimentResult } from "@/lib/experimentService";
type ViewState = "loading" | "instructions" | "practice" | "practice-passed" | "practice-failed" | "phase1" | "ai-analysis" | "intervention" | "phase2" | "complete";
interface MainPanelProps {
  isLoading: boolean;
  viewState: ViewState;
  onViewStateChange: (state: ViewState) => void;
  isAttentionCheckClicked: boolean;
  sessionId: string;
  onPracticeScoreChange?: (score: number) => void;
}
const INSTRUCTION_TEXT = `Bu bölümde, problem çözme ve soyut muhakeme yeteneklerinizi ölçen bir dizi görsel bulmaca ile karşılaşacaksınız. Her soruda, 3x3'lük bir ızgara (matris) göreceksiniz. Bu ızgaradaki kutucuklardan 8 tanesi, belirli bir kurala veya örüntüye göre yerleştirilmiş şekiller içermektedir. Sağ alt köşedeki kutucuk ise boştur. Göreviniz: Şekillerin hem satırlardaki (soldan sağa) hem de sütunlardaki (yukarıdan aşağıya) değişim kurallarını keşfetmek ve bu kurala göre boş kutucuğa gelmesi gereken en uygun şekli, aşağıda verilen 4 seçenek arasından bulup işaretlemektir. Dikkat Etmeniz Gerekenler: Süre: Her bir soruyu çözmek için 30 saniyeniz olacaktır. Geri Sayım: Sürenin bitimine 5 saniye kala ekranda bir geri sayım sayacı belirecektir. Tahmin: Eğer kuralı süreniz dolmadan bulamazsanız, en mantıklı gelen seçeneği işaretleyerek şansınızı deneyiniz. Boş bırakmak yerine tahmin yürütmeniz önerilir. İlerleme: Cevabı işaretlediğinizde veya süre dolduğunda otomatik olarak bir sonraki soruya geçilecektir. Geriye dönüp cevabınızı değiştirme şansınız yoktur. Gerçek testten önce alıştırma sorularına ile başlayacaksınız.`;
const MainPanel = ({
  isLoading,
  viewState,
  onViewStateChange,
  isAttentionCheckClicked,
  sessionId,
  onPracticeScoreChange
}: MainPanelProps) => {
  const [practiceScore, setPracticeScore] = useState(0);
  useEffect(() => {
    if (!isLoading && viewState === "loading") {
      onViewStateChange("instructions");
    }
  }, [isLoading, viewState, onViewStateChange]);
  const handleStartPractice = () => {
    onViewStateChange("practice");
  };
  const handlePracticeComplete = (answers: Answer[]) => {
    const score = answers.filter(a => a.isCorrect).length;
    setPracticeScore(score);
    onPracticeScoreChange?.(score);
    if (score >= 3) {
      onViewStateChange("practice-passed");
    } else {
      onViewStateChange("practice-failed");
    }
  };
  const handleStartPhase1 = () => {
    onViewStateChange("phase1");
  };
  const handlePhase1Complete = (answers: Answer[]) => {
    console.log("Phase 1 completed:", answers);
    onViewStateChange("ai-analysis");
  };
  const handleAIAnalysisComplete = () => {
    onViewStateChange("intervention");
  };
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
    onViewStateChange("phase2");
  };
  const handlePhase2Complete = (answers: Answer[]) => {
    console.log("Phase 2 completed:", answers);
    onViewStateChange("complete");
  };
  return <main className="flex-1 h-screen overflow-y-auto bg-background animate-slide-in-right">
      <div className="max-w-4xl mx-auto p-8">
        {/* Loading State */}
        {viewState === "loading" && <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-glow" />
              <Loader2 className="w-16 h-16 text-primary animate-spin-slow relative z-10" />
            </div>
            <p className="text-xl text-muted-foreground animate-pulse">
              Test yükleniyor...
            </p>
          </div>}

        {/* Instructions State */}
        {viewState === "instructions" && <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  MaRs-IB Testi
                </h1>
                <p className="text-muted-foreground">
                  Test Talimatları
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-foreground leading-relaxed whitespace-pre-line font-sans text-left">
                {INSTRUCTION_TEXT}
              </p>
            </div>

            <div className="pt-4">
              <button onClick={handleStartPractice} className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25">
                Devam Et
              </button>
            </div>
          </div>}

        {/* Practice Test State */}
        {viewState === "practice" && <div>
            
            <TestEngine questions={PRACTICE_QUESTIONS} onComplete={handlePracticeComplete} sessionId={sessionId} phase="practice" />
          </div>}

        {/* Practice Passed State */}
        {viewState === "practice-passed" && <div className="flex flex-col items-center justify-center h-[80vh] gap-8 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground">
                Alıştırma Tamamlandı
              </h2>
              <p className="text-lg text-muted-foreground">
                Puan: <span className="text-primary font-semibold">{practiceScore}/10</span>
              </p>
              <p className="text-foreground leading-relaxed">
                Alıştırma soruları bitti. Hazır iseniz 24 soruluk gerçek testin 12 soruluk ilk aşamasına başlamak için lütfen aşağıda ki Başlat butonuna basınız.
              </p>
            </div>

            <button onClick={handleStartPhase1} className="w-full max-w-md py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25">
              Başlat
            </button>
          </div>}

        {/* Practice Failed State */}
        {viewState === "practice-failed" && <div className="flex flex-col items-center justify-center h-[80vh] gap-8 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground">
                Alıştırma Tamamlandı
              </h2>
              <p className="text-lg text-muted-foreground">
                Puan: <span className="text-destructive font-semibold">{practiceScore}/10</span>
              </p>
              <p className="text-foreground leading-relaxed text-lg">
                Lütfen deney yürütücüsüne haber ediniz.
              </p>
            </div>
          </div>}

        {/* Phase 1 Test State */}
        {viewState === "phase1" && <div>
            <TestEngine questions={PHASE1_QUESTIONS} onComplete={handlePhase1Complete} sessionId={sessionId} phase="phase1" />
          </div>}

        {/* AI Analysis State */}
        {viewState === "ai-analysis" && <AIAnalysis onComplete={handleAIAnalysisComplete} />}

        {/* Intervention State - Only show the button, message is in sidebar */}
        {viewState === "intervention" && <div className="flex flex-col items-center justify-center h-[80vh] gap-8 animate-fade-in">
            <div className="text-center space-y-4 max-w-2xl">
              
              
            </div>

            {/* Start Phase 2 Button */}
            <button onClick={handleStartPhase2} className="w-full max-w-md py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25">
              Başlat
            </button>
          </div>}

        {/* Phase 2 Test State */}
        {viewState === "phase2" && <div>
            
            <TestEngine questions={PHASE2_QUESTIONS} onComplete={handlePhase2Complete} sessionId={sessionId} phase="phase2" />
          </div>}

        {/* Complete State */}
        {viewState === "complete" && <div className="flex flex-col items-center justify-center h-[80vh] gap-8 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                Test bitti. Teşekkürler!
              </h1>
            </div>
          </div>}
      </div>
    </main>;
};
export default MainPanel;