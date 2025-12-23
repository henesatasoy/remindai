import { useState, useEffect, useCallback, useRef } from "react";
import { Clock } from "lucide-react";
import { Question, Answer, PRACTICE_QUESTIONS } from "@/data/questions";

type TestPhase = "fixation" | "blank" | "question" | "complete";

interface TestEngineProps {
  questions?: Question[];
  onComplete?: (answers: Answer[]) => void;
}

const TestEngine = ({ 
  questions = PRACTICE_QUESTIONS, 
  onComplete 
}: TestEngineProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<TestPhase>("fixation");
  const [timeLeft, setTimeLeft] = useState(30);
  const [showWarning, setShowWarning] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  
  const questionStartTime = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];

  // Handle answer submission
  const submitAnswer = useCallback((selectedIndex: number | null) => {
    const responseTime = Date.now() - questionStartTime.current;
    
    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOptionIndex: selectedIndex,
      responseTimeMs: responseTime,
      isCorrect: selectedIndex === currentQuestion.correctOptionIndex,
    };

    setAnswers((prev) => [...prev, answer]);

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Move to next question or complete
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPhase("fixation");
      setTimeLeft(30);
      setShowWarning(false);
    } else {
      setPhase("complete");
    }
  }, [currentIndex, currentQuestion, questions.length]);

  // Psychometric timing sequence: fixation (500ms) -> blank (100ms) -> question
  useEffect(() => {
    if (phase === "fixation") {
      const timer = setTimeout(() => setPhase("blank"), 500);
      return () => clearTimeout(timer);
    }
    
    if (phase === "blank") {
      const timer = setTimeout(() => {
        setPhase("question");
        questionStartTime.current = Date.now();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [phase, currentIndex]);

  // Question timer (30 seconds)
  useEffect(() => {
    if (phase !== "question") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto-advance
          submitAnswer(null);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [phase, submitAnswer]);

  // 5-second warning
  useEffect(() => {
    if (timeLeft === 5 && phase === "question") {
      setShowWarning(true);
      const timer = setTimeout(() => setShowWarning(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, phase]);

  // Handle test completion
  useEffect(() => {
    if (phase === "complete" && onComplete) {
      onComplete(answers);
    }
  }, [phase, answers, onComplete]);

  // Render Fixation Cross
  if (phase === "fixation") {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <span className="text-7xl font-light text-foreground select-none">+</span>
      </div>
    );
  }

  // Render Blank Screen
  if (phase === "blank") {
    return <div className="h-[70vh]" />;
  }

  // Render Complete Screen
  if (phase === "complete") {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const avgTime = Math.round(
      answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / answers.length / 1000
    );

    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <h2 className="text-3xl font-bold text-foreground">Test Tamamlandı!</h2>
        <div className="text-center space-y-2">
          <p className="text-xl text-muted-foreground">
            Doğru Cevaplar: <span className="text-primary font-semibold">{correctCount}/{questions.length}</span>
          </p>
          <p className="text-xl text-muted-foreground">
            Ortalama Süre: <span className="text-primary font-semibold">{avgTime} saniye</span>
          </p>
        </div>
      </div>
    );
  }

  // Render Question
  return (
    <div className="relative">
      {/* Timer */}
      <div className="absolute top-0 left-0 flex items-center gap-2 text-lg">
        <Clock className={`w-5 h-5 ${timeLeft <= 5 ? "text-destructive" : "text-muted-foreground"}`} />
        <span className={`font-mono font-medium ${timeLeft <= 5 ? "text-destructive" : "text-foreground"}`}>
          {timeLeft}s
        </span>
      </div>

      {/* Question Counter */}
      <div className="absolute top-0 right-0 text-lg text-muted-foreground">
        Soru {currentIndex + 1}/{questions.length}
      </div>

      {/* Warning Flash */}
      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-4xl font-bold text-destructive animate-pulse bg-background/80 px-8 py-4 rounded-xl">
            Son 5 Saniye!
          </div>
        </div>
      )}

      {/* Question Content */}
      <div className="pt-12 flex flex-col items-center gap-8">
        {/* Grid Image */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <img
            src={currentQuestion.gridImage}
            alt="Soru görseli"
            className="w-full max-w-md h-auto"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => submitAnswer(index)}
              className="group relative border border-border rounded-xl overflow-hidden bg-card hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all duration-200"
            >
              <img
                src={option}
                alt={`Seçenek ${String.fromCharCode(65 + index)}`}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 py-1 text-center">
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {String.fromCharCode(65 + index)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <p className="text-sm text-muted-foreground text-center">
          Doğru cevabı seçmek için bir seçeneğe tıklayın
        </p>
      </div>
    </div>
  );
};

export default TestEngine;
