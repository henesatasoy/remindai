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

const INSTRUCTION_TEXT = `Bu bölümde, problem çözme ve soyut muhakeme yeteneklerinizi ölçen bir dizi görsel bulmaca ile karşılaşacaksınız. Her soruda, 3x3'lük bir ızgara (matris) göreceksiniz. Bu ızgaradaki kutucuklardan 8 tanesi, belirli bir kurala veya örüntüye göre yerleştirilmiş şekiller içermektedir. Sağ alt köşedeki kutucuk ise boştur. Göreviniz: Şekillerin hem satırlardaki (soldan sağa) hem de sütunlardaki (yukarıdan aşağıya) değişim kurallarını keşfetmek ve bu kurala göre boş kutucuğa gelmesi gereken en uygun şekli, aşağıda verilen 4 seçenek arasından bulup işaretlemektir. Dikkat Etmeniz Gerekenler: Süre: Her bir soruyu çözmek için 30 saniyeniz olacaktır. Geri Sayım: Sürenin bitimine 5 saniye kala ekranda bir geri sayım sayacı belirecektir. Tahmin: Eğer kuralı süreniz dolmadan bulamazsanız, en mantıklı gelen seçeneği işaretleyerek şansınızı deneyiniz. Boş bırakmak yerine tahmin yürütmeniz önerilir. İlerleme: Cevabı işaretlediğinizde veya süre dolduğunda otomatik olarak bir sonraki soruya geçilecektir. Geriye dönüp cevabınızı değiştirme şansınız yoktur. Gerçek testten önce alıştırma sorularına ile başlayacaksınız.`;

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
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                  {isIntervention ? INTERVENTION_TEXT : INSTRUCTION_TEXT}
                </p>
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