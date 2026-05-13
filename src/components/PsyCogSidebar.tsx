import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Sparkles, User, X, Plus, Paperclip, Mic, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TypewriterText from "./TypewriterText";
import { ParticipantAssignment, getInterventionMessage } from "@/lib/assignmentService";
import { logSidebarInteraction } from "@/lib/experimentService";
import { usePromptInputLogger } from "@/hooks/usePromptInputLogger";
type ViewState = "loading" | "instructions" | "practice" | "practice-passed" | "practice-failed" | "phase1" | "ai-analysis" | "intervention" | "phase2" | "complete" | "experiment-full";
interface PsyCogSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  promptHistory: string[];
  viewState: ViewState;
  isAttentionCheckClicked: boolean;
  onAttentionCheckClick: () => void;
  onStartPhase2?: () => void;
  onStartPractice?: () => void;
  onStartPhase1?: () => void;
  practiceScore?: number;
  userFirstMessage?: string;
  assignment?: ParticipantAssignment | null;
  sessionId?: string;
}
// Default to the control (neutral) message until the assignment resolves.
// This way an observer cannot infer the group from any visual cue.
const DEFAULT_INTERVENTION_TEXT = getInterventionMessage("control");
const INTERVENTION_TEXT_2 = `Lütfen bu mesajı okuduysanız sol üstte ki ReMind yazısının solunda bulunan logoya tıklayın. İşaretledikten sonra hazır iseniz ikinci test aşamasını başlatmak için aşağıda ki Başlat butonuna basınız.`;
const INSTRUCTION_INTRO = `Bu bölümde, problem çözme ve soyut muhakeme yeteneklerinizi ölçen bir dizi görsel bulmaca ile karşılaşacaksınız. Her soruda, 3x3'lük bir ızgara (matris) göreceksiniz. Bu ızgaradaki kutucuklardan 8 tanesi, belirli bir kurala veya örüntüye göre yerleştirilmiş şekiller içermektedir. Sağ alt köşedeki kutucuk ise boştur.

Göreviniz: Şekillerin hem satırlardaki (soldan sağa) hem de sütunlardaki (yukarıdan aşağıya) değişim kurallarını keşfetmek ve bu kurala göre boş kutucuğa gelmesi gereken en uygun şekli, aşağıda verilen 4 seçenek arasından bulup işaretlemektir.

Akış: Test toplamda 10 alıştırma ve her birinde 12 soru olan 2 aşamadan oluşmaktadır.  10 alıştırma sorusundan 3 tanesini doğru bildiğinizde otomatik olarak testin ilk aşamasına devam edeceksiniz. Ardından testin ilk aşamasının verilerinin analizinden sonra ikinci aşamaya devam edeceksiniz.`;
const INSTRUCTION_ITEMS = [{
  title: "Süre",
  description: "Her bir soruyu çözmek için 30 saniyeniz olacaktır."
}, {
  title: "Geri Sayım",
  description: "Sürenin bitimine 5 saniye kala ekranda bir uyarı belirecektir."
}, {
  title: "Tahmin",
  description: "Eğer kuralı süreniz dolmadan bulamazsanız, en mantıklı gelen seçeneği işaretleyerek şansınızı deneyiniz. Boş bırakmak yerine tahmin yürütmeniz önerilir."
}, {
  title: "İlerleme",
  description: "Cevabı işaretlediğinizde veya süre dolduğunda otomatik olarak bir sonraki soruya geçilecektir. Geriye dönüp cevabınızı değiştirme şansınız yoktur."
}];
const INSTRUCTION_FOOTER = `Alıştırma sorularına başlamak için lütfen Devam Et butonuna bas. (Son olarak, merak etme! Alıştırma sorularına verdiğin cevaplar, test sonucuna herhangi bir etkisi olmayacak!)`;
const PsyCogSidebar = ({
  isCollapsed,
  onToggle,
  promptHistory,
  viewState,
  isAttentionCheckClicked,
  onAttentionCheckClick,
  onStartPhase2,
  onStartPractice,
  onStartPhase1,
  practiceScore = 0,
  userFirstMessage,
  assignment,
  sessionId
}: PsyCogSidebarProps) => {
  // Resolve the intervention text from the participant's assigned group.
  // Falls back to the neutral control message if assignment hasn't resolved yet.
  const interventionText1 = assignment
    ? getInterventionMessage(assignment.assigned_group)
    : DEFAULT_INTERVENTION_TEXT;
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: React.ReactNode;
  } | null>(null);
  const [interventionStep, setInterventionStep] = useState(1);
  const [isTyping1Complete, setIsTyping1Complete] = useState(false);
  const [isTyping2Complete, setIsTyping2Complete] = useState(false);
  const sidebarPromptInput = usePromptInputLogger(sessionId, viewState, "sidebar_prompt_input");
  const isIntervention = viewState === "intervention";
  const isInstructions = viewState === "instructions";
  const isPracticePassed = viewState === "practice-passed";
  const isPracticeFailed = viewState === "practice-failed";
  const isFullscreenChat = isIntervention || isInstructions || isPracticePassed || isPracticeFailed;

  // Determine if we should show instructions in history (after instructions phase)
  const showInstructionsInHistory = !isInstructions && viewState !== "loading" && !isCollapsed;

  // Determine if we should show practice result in history
  const showPracticeResultInHistory = !isPracticePassed && !isPracticeFailed && (viewState === "phase1" || viewState === "ai-analysis" || viewState === "intervention" || viewState === "phase2" || viewState === "complete") && !isCollapsed;

  // Determine if we should show intervention in history (after intervention, during phase2 or complete)
  const showInterventionInHistory = (viewState === "phase2" || viewState === "complete") && !isCollapsed;
  const openInstructionsModal = () => {
    setModalContent({
      title: "Test Talimatları",
      content: <div className="space-y-4">
          <p className="whitespace-pre-line">{INSTRUCTION_INTRO}</p>
          <div>
            <p className="font-semibold mb-2">Dikkat Etmeniz Gerekenler:</p>
            <ul className="space-y-2 ml-1">
              {INSTRUCTION_ITEMS.map((item, index) => <li key={index} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>{item.title}:</strong> {item.description}</span>
                </li>)}
            </ul>
          </div>
          <p>{INSTRUCTION_FOOTER}</p>
        </div>
    });
  };
  const openPracticeResultModal = () => {
    setModalContent({
      title: "Alıştırma Sonucu",
      content: <div className="space-y-3">
          <p className="text-lg font-semibold">Alıştırma Tamamlandı!</p>
          
          <p>​Alıştırma aşamasını tamamladık! Sisteme uyum sağladığına göre asıl değerlendirmeye geçebiliriz. Toplam 24 sorudan oluşan sürecin ilk 12 soruluk aşaması için ben hazırım. Sen de hazırsan süreci başlatabilirsin.</p>
        </div>
    });
  };
  const openInterventionModal = () => {
    setModalContent({
      title: "AI Analiz Sonucu",
      content: <div className="space-y-4">
          <p className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: interventionText1 }} />
          <p className="whitespace-pre-line">{INTERVENTION_TEXT_2}</p>
        </div>
    });
  };
  // Fake chat history shown in the decorative left rail during fullscreen chat
  const fakeChatHistory = ["Plot-test 3", "ReMind AI'ın veri analiz süreci", "Test veri analiz sonuçları", "MaRs-IB kısa form testi", "Plot-test 2", "Plot-test 1"];

  return <aside className={`
        h-screen bg-sidebar border-r border-sidebar-border
        transition-all duration-500 ease-in-out
        flex relative
        ${isFullscreenChat ? "w-full flex-row" : `flex-col ${isCollapsed ? "w-16" : "w-72"}`}
      `}>
      {/* Decorative left rail during fullscreen chat — keeps the LLM feel */}
      {isFullscreenChat && <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
          {/* New Chat Button */}
          <div className="p-3 border-b border-sidebar-border">
            <button
              onClick={() => sessionId && logSidebarInteraction(sessionId, viewState, "new_chat")}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-foreground"
            >
              <Plus className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm font-medium">Yeni Sohbet</span>
            </button>
          </div>
          {/* Fake chat history */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="mb-2">
              <span className="text-xs text-muted-foreground px-3">Son 7 gün</span>
            </div>
            {/* Current active chat (user's first message) */}
            {userFirstMessage && <div
                onClick={() => sessionId && logSidebarInteraction(sessionId, viewState, `chat_history:active`)}
                className="flex items-start gap-3 p-3 rounded-lg bg-sidebar-accent cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground line-clamp-1 font-medium">{userFirstMessage}</span>
              </div>}
            {fakeChatHistory.map((chat, index) => <div
                key={index}
                onClick={() => sessionId && logSidebarInteraction(sessionId, viewState, `chat_history:${chat}`)}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-foreground line-clamp-1">{chat}</span>
              </div>)}
          </div>
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground text-center">ReMind v2.4.1</p>
          </div>
        </div>}

      {/* Inner column wrapping the existing header + chat area */}
      <div className={`flex flex-col ${isFullscreenChat ? "flex-1 min-w-0" : "w-full h-full"}`}>
      {/* Toggle Button - hide during fullscreen chat states */}
      {!isFullscreenChat && <button onClick={onToggle} className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors">
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-foreground" /> : <ChevronLeft className="w-4 h-4 text-foreground" />}
        </button>}

      {/* Header with Logo - show clickable logo during intervention */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          {/* Clickable Logo - only clickable during intervention */}
          {isIntervention ? <button onClick={onAttentionCheckClick} className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 shrink-0">
              <Sparkles className={`w-5 h-5 transition-colors duration-300 ${isAttentionCheckClicked ? "text-green-500" : "text-primary"}`} />
            </button> : <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>}
          <h1 className={`
              font-semibold text-foreground transition-all duration-300
              ${isCollapsed ? "hidden" : "text-xl"}
            `}>
            ReMind
          </h1>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Show full chat during fullscreen states */}
        {isFullscreenChat ? <div className="max-w-5xl mx-auto p-4 space-y-6">
            {/* User's First Message */}
            {userFirstMessage && <div className="flex items-start gap-3 justify-end">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 max-w-[80%]">
                  <p className="text-foreground text-sm leading-relaxed">
                    {userFirstMessage}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>}

            {/* Instructions History - show on practice results and intervention */}
            {(isPracticePassed || isPracticeFailed || isIntervention) && <button onClick={openInstructionsModal} className="flex items-start gap-3 w-full text-left hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 bg-muted/50 border border-border/50 rounded-xl p-3 max-w-[80%]">
                  <p className="text-muted-foreground text-xs line-clamp-3">{INSTRUCTION_INTRO.slice(0, 150)}...</p>
                  <span className="text-primary/70 text-[10px] mt-1 block">Devam Et ✓</span>
                </div>
              </button>}

            {/* Practice Result History - show on intervention */}
            {isIntervention && <button onClick={openPracticeResultModal} className="flex items-start gap-3 w-full text-left hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 bg-muted/50 border border-border/50 rounded-xl p-3 max-w-[80%]">
                  <p className="text-muted-foreground text-xs">Alıştırma Tamamlandı!</p>
                  <span className="text-primary/70 text-[10px] mt-1 block">Başlat ✓</span>
                </div>
              </button>}
            
            {/* AI Message Bubble */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 bg-card border border-border rounded-xl p-4 max-w-[80%]">
                {isIntervention ? <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                    <TypewriterText text={interventionText1} speed={10} onComplete={() => setIsTyping1Complete(true)} html={true} />
                  </p> : isPracticePassed ? <div className="text-foreground text-sm leading-relaxed space-y-3">
                    <p className="font-semibold text-base">Alıştırma Tamamlandı!</p>
                    
                    <p>​Alıştırma aşamasını tamamladık! Sisteme uyum sağladığına göre asıl değerlendirmeye geçebiliriz. Toplam 24 sorudan oluşan sürecin ilk 12 soruluk aşaması için ben hazırım. Sen de hazırsan süreci başlatabilirsin.</p>
                  </div> : isPracticeFailed ? <div className="text-foreground text-sm leading-relaxed space-y-3">
                    <p className="font-semibold text-base">Alıştırma Tamamlandı!</p>
                    <p className="text-lg">Lütfen deney yürütücüsüne haber ediniz.</p>
                  </div> : <div className="text-foreground text-sm leading-relaxed space-y-4">
                    <p>Merhaba! Araştırma sürecimize hoş geldiniz. Ben ReMind-4! Bugün sizinle görsel yapbozlar üzerinden soyut muhakeme ve örüntü tanıma kapasitenizi analiz edeceğiz. Sürecin sorunsuz ilerlemesi için aşağıda testin nasıl işleyeceğine dair talimatları derledim:</p>
                    <p className="font-semibold text-base">MaRs-IB Test Talimatları</p>
                    <div className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                      <p>Bu bölümde, problem çözme ve soyut muhakeme yeteneklerinizi ölçen bir dizi görsel bulmaca ile karşılaşacaksınız. Her soruda, 3x3'lük bir ızgara (matris) göreceksiniz. Bu ızgaradaki kutucuklardan 8 tanesi, belirli bir kurala veya örüntüye göre yerleştirilmiş şekiller içermektedir. Sağ alt köşedeki kutucuk ise boştur.</p>
                      <p className="mt-4"><strong>Göreviniz:</strong> Şekillerin hem satırlardaki (soldan sağa) hem de sütunlardaki (yukarıdan aşağıya) değişim kurallarını keşfetmek ve bu kurala göre boş kutucuğa gelmesi gereken en uygun şekli, aşağıda verilen 4 seçenek arasından bulup işaretlemektir.</p>
                      <p className="mt-4"><strong>Akış:</strong> Test toplamda 10 alıştırma ve her birinde 12 soru olan 2 aşamadan oluşmaktadır. 10 alıştırma sorusundan 3 tanesini doğru bildiğinizde otomatik olarak testin ilk aşamasına devam edeceksiniz. Ardından testin ilk aşamasının verilerinin analizinden sonra ikinci aşamaya devam edeceksiniz.</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-2">Dikkat Etmeniz Gerekenler:</p>
                      <ul className="space-y-2 ml-1">
                        {INSTRUCTION_ITEMS.map((item, index) => <li key={index} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span><strong>{item.title}:</strong> {item.description}</span>
                          </li>)}
                      </ul>
                    </div>
                    
                    <p>{INSTRUCTION_FOOTER}</p>
                  </div>}
              </div>
            </div>

            {/* Devam Et button after first intervention message - show only when typing is complete */}
            {isIntervention && interventionStep === 1 && isTyping1Complete && <div className="flex justify-center items-center gap-3 pt-6 animate-fade-in">
                <Button onClick={() => setInterventionStep(2)} className="px-8 py-3">
                  Devam Et
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm("Testten çıkmak istediğinize emin misiniz? İlerlemeniz kaybolacaktır.")) {
                      window.location.href = "/";
                    }
                  }}
                  className="px-6 py-3 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                >
                  Testten Çık
                </Button>
              </div>}

            {/* Second AI Message for Intervention - only show after clicking Devam Et */}
            {isIntervention && interventionStep === 2 && <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 bg-card border border-border rounded-xl p-4 max-w-[80%]">
                  <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                    {INTERVENTION_TEXT_2}
                  </p>
                </div>
              </div>}

            {/* Action Button - hide for practice-failed, and for intervention until step 2 */}
            {!isPracticeFailed && !(isIntervention && interventionStep === 1) && <div className="flex justify-center items-center gap-3 pt-6 animate-fade-in">
                <Button onClick={isIntervention ? onStartPhase2 : isPracticePassed ? onStartPhase1 : onStartPractice} className="px-8 py-3">
                  {isIntervention ? "Başlat" : isPracticePassed ? "Başlat" : "Devam Et"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm("Testten çıkmak istediğinize emin misiniz? İlerlemeniz kaybolacaktır.")) {
                      window.location.href = "/";
                    }
                  }}
                  className="px-6 py-3 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                >
                  Testten Çık
                </Button>
              </div>}
          </div> : (/* Chat history with instructions and intervention */
      <div className="space-y-4 p-2">
            {/* User's First Message in History */}
            {userFirstMessage && !isCollapsed && <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                <p className="text-xs text-muted-foreground line-clamp-2">{userFirstMessage}</p>
              </div>}
            
            {/* Instructions in History */}
            {showInstructionsInHistory && <button onClick={openInstructionsModal} className="flex items-start gap-2 w-full text-left hover:bg-sidebar-accent rounded-lg p-2 transition-colors">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-1" />
                <div className="text-xs text-muted-foreground">
                  <p className="line-clamp-2 mb-1">{INSTRUCTION_INTRO.slice(0, 100)}...</p>
                  <span className="text-primary/70 text-[10px]">Devam Et ✓</span>
                </div>
              </button>}
            
            {/* Practice Result in History */}
            {showPracticeResultInHistory && <button onClick={openPracticeResultModal} className="flex items-start gap-2 w-full text-left hover:bg-sidebar-accent rounded-lg p-2 transition-colors">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-1" />
                <div className="text-xs text-muted-foreground">
                  <p className="line-clamp-2 mb-1">Alıştırma Tamamlandı!</p>
                  <span className="text-primary/70 text-[10px]">Başlat ✓</span>
                </div>
              </button>}
            
            {showInterventionInHistory && <button onClick={openInterventionModal} className="flex items-start gap-2 w-full text-left hover:bg-sidebar-accent rounded-lg p-2 transition-colors">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-1" />
                <div className="text-xs text-muted-foreground">
                  <p className="line-clamp-2 mb-1">{interventionText1.replace(/<[^>]+>/g, "").slice(0, 80)}...</p>
                  <span className="text-primary/70 text-[10px]">Başlat ✓</span>
                </div>
              </button>}
            
            
          </div>)}
      </div>

      {/* Footer - hide during fullscreen chat states */}
      {!isCollapsed && !isFullscreenChat && <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            Geçmiş sorgularınız burada görünür
          </p>
        </div>}

      {/* Decorative prompt input bar during fullscreen chat — pure visual, non-functional */}
      {isFullscreenChat && <div className="px-4 pb-6 pt-2 bg-background">
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl bg-card border border-border">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm text-foreground">
                  <span className="font-medium">ReMind-4</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="Bir şeyler sorun..."
                value={sidebarPromptInput.value}
                onChange={sidebarPromptInput.onChange}
                className="w-full pl-32 pr-36 py-4 bg-transparent text-foreground text-base placeholder:text-muted-foreground focus:outline-none rounded-2xl"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => sessionId && logSidebarInteraction(sessionId, viewState, "sidebar_prompt_attach_click")}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => sessionId && logSidebarInteraction(sessionId, viewState, "sidebar_prompt_mic_click")}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button type="button" className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>}
      </div>{/* /inner column */}
      {/* Message Detail Modal */}
      <Dialog open={modalContent !== null} onOpenChange={() => setModalContent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="text-foreground text-sm leading-relaxed">
            {modalContent?.content}
          </div>
        </DialogContent>
      </Dialog>
    </aside>;
};
export default PsyCogSidebar;