import { ChevronLeft, ChevronRight, MessageSquare, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewState = "loading" | "instructions" | "practice" | "practice-passed" | "practice-failed" | "phase1" | "ai-analysis" | "intervention" | "phase2" | "complete";

interface PsyCogSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  promptHistory: string[];
  viewState: ViewState;
  isAttentionCheckClicked: boolean;
  onAttentionCheckClick: () => void;
  onStartPhase2?: () => void;
  onStartPractice?: () => void;
  userFirstMessage?: string;
}

const INTERVENTION_TEXT = `Veri sonuçları kaliteli. İkinci test aşamasında verimlilik artışı ve doğruluk oranında artış bekleniyor. Lütfen bu mesajı okuduysanız sol üstte ki PsyCog yazısının solunda bulunan logoya tıklayın. İşaretledikten sonra hazır iseniz ikinci test aşamasını başlatmak için aşağıda ki Başlat butonuna basınız.`;

const INSTRUCTION_INTRO = `Bu bölümde, problem çözme ve soyut muhakeme yeteneklerinizi ölçen bir dizi görsel bulmaca ile karşılaşacaksınız. Her soruda, 3x3'lük bir ızgara (matris) göreceksiniz. Bu ızgaradaki kutucuklardan 8 tanesi, belirli bir kurala veya örüntüye göre yerleştirilmiş şekiller içermektedir. Sağ alt köşedeki kutucuk ise boştur.

Göreviniz: Şekillerin hem satırlardaki (soldan sağa) hem de sütunlardaki (yukarıdan aşağıya) değişim kurallarını keşfetmek ve bu kurala göre boş kutucuğa gelmesi gereken en uygun şekli, aşağıda verilen 4 seçenek arasından bulup işaretlemektir.`;

const INSTRUCTION_ITEMS = [
  { title: "Süre", description: "Her bir soruyu çözmek için 30 saniyeniz olacaktır." },
  { title: "Geri Sayım", description: "Sürenin bitimine 5 saniye kala ekranda bir geri sayım sayacı belirecektir." },
  { title: "Tahmin", description: "Eğer kuralı süreniz dolmadan bulamazsanız, en mantıklı gelen seçeneği işaretleyerek şansınızı deneyiniz. Boş bırakmak yerine tahmin yürütmeniz önerilir." },
  { title: "İlerleme", description: "Cevabı işaretlediğinizde veya süre dolduğunda otomatik olarak bir sonraki soruya geçilecektir. Geriye dönüp cevabınızı değiştirme şansınız yoktur." },
];

const INSTRUCTION_FOOTER = `Gerçek testten önce alıştırma sorularına ile başlayacaksınız.`;

const PsyCogSidebar = ({ 
  isCollapsed, 
  onToggle, 
  promptHistory, 
  viewState, 
  isAttentionCheckClicked, 
  onAttentionCheckClick,
  onStartPhase2,
  onStartPractice,
  userFirstMessage
}: PsyCogSidebarProps) => {
  const isIntervention = viewState === "intervention";
  const isInstructions = viewState === "instructions";
  const isFullscreenChat = isIntervention || isInstructions;
  
  // Determine if we should show instructions in history (after instructions phase)
  const showInstructionsInHistory = !isInstructions && viewState !== "loading" && !isCollapsed;
  
  // Determine if we should show intervention in history (after intervention, during phase2 or complete)
  const showInterventionInHistory = (viewState === "phase2" || viewState === "complete") && !isCollapsed;

  return (
    <aside
      className={`
        h-screen bg-sidebar border-r border-sidebar-border
        transition-all duration-500 ease-in-out
        flex flex-col relative
        ${isFullscreenChat ? "w-full" : isCollapsed ? "w-16" : "w-72"}
      `}
    >
      {/* Toggle Button - hide during fullscreen chat states */}
      {!isFullscreenChat && (
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

      {/* Header with Logo - show clickable logo during intervention */}
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
              ${isCollapsed ? "hidden" : "text-xl"}
            `}
          >
            PsyCog
          </h1>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Show full chat during fullscreen states */}
        {isFullscreenChat ? (
          <div className="max-w-3xl mx-auto p-4 space-y-6">
            {/* User's First Message */}
            {userFirstMessage && (
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 max-w-[80%]">
                  <p className="text-foreground text-sm leading-relaxed">
                    {userFirstMessage}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}
            
            {/* AI Message Bubble */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 bg-card border border-border rounded-xl p-4 max-w-[80%]">
                {isIntervention ? (
                  <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                    {INTERVENTION_TEXT}
                  </p>
                ) : (
                  <div className="text-foreground text-sm leading-relaxed space-y-4">
                    <p className="whitespace-pre-line">{INSTRUCTION_INTRO}</p>
                    
                    <div>
                      <p className="font-semibold mb-2">Dikkat Etmeniz Gerekenler:</p>
                      <ul className="space-y-2 ml-1">
                        {INSTRUCTION_ITEMS.map((item, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span><strong>{item.title}:</strong> {item.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <p>{INSTRUCTION_FOOTER}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={isIntervention ? onStartPhase2 : onStartPractice}
                className="px-8 py-3"
              >
                {isIntervention ? "Başlat" : "Devam Et"}
              </Button>
            </div>
          </div>
        ) : (
          /* Chat history with instructions and intervention */
          <div className="space-y-4 p-2">
            {/* User's First Message in History */}
            {userFirstMessage && !isCollapsed && (
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                <p className="text-xs text-muted-foreground line-clamp-2">{userFirstMessage}</p>
              </div>
            )}
            
            {/* Instructions in History */}
            {showInstructionsInHistory && (
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-1" />
                <div className="text-xs text-muted-foreground">
                  <p className="line-clamp-2 mb-1">{INSTRUCTION_INTRO.slice(0, 100)}...</p>
                  <span className="text-primary/70 text-[10px]">Devam Et ✓</span>
                </div>
              </div>
            )}
            
            {/* Intervention in History */}
            {showInterventionInHistory && (
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-1" />
                <div className="text-xs text-muted-foreground">
                  <p className="line-clamp-2 mb-1">{INTERVENTION_TEXT.slice(0, 80)}...</p>
                  <span className="text-primary/70 text-[10px]">Başlat ✓</span>
                </div>
              </div>
            )}
            
            {/* Regular prompt history */}
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
        )}
      </div>

      {/* Footer - hide during fullscreen chat states */}
      {!isCollapsed && !isFullscreenChat && (
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