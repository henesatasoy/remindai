import { useState, useEffect, useCallback, useRef } from "react";
import { Clock } from "lucide-react";
import { Question, Answer, PRACTICE_QUESTIONS } from "@/data/questions";
import { saveExperimentResult } from "@/lib/experimentService";

type TestPhase = "fixation" | "blank" | "question" | "complete";

interface TestEngineProps {
  questions?: Question[];
  onComplete?: (answers: Answer[]) => void;
  sessionId: string;
  phase: 'practice' | 'phase1' | 'phase2';
}

// Image preloader hook - preloads current + next 2 questions
const useImagePreloader = (questions: Question[], currentIndex: number) => {
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const [allCurrentLoaded, setAllCurrentLoaded] = useState(false);
  
  useEffect(() => {
    setAllCurrentLoaded(false);
    
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    
    const currentImages = [currentQ.gridImage, ...currentQ.options];
    let loadedCount = 0;
    const totalToLoad = currentImages.filter(src => !loadedImagesRef.current.has(src)).length;
    
    if (totalToLoad === 0) {
      setAllCurrentLoaded(true);
    }
    
    // Preload current question images
    currentImages.forEach(src => {
      if (!loadedImagesRef.current.has(src)) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedImagesRef.current.add(src);
          loadedCount++;
          if (loadedCount >= totalToLoad) {
            setAllCurrentLoaded(true);
          }
        };
      }
    });
    
    // Preload next 2 questions in background
    [1, 2].forEach(offset => {
      const nextQ = questions[currentIndex + offset];
      if (nextQ) {
        [nextQ.gridImage, ...nextQ.options].forEach(src => {
          if (!loadedImagesRef.current.has(src)) {
            const img = new Image();
            img.src = src;
            img.onload = () => loadedImagesRef.current.add(src);
          }
        });
      }
    });
  }, [questions, currentIndex]);
  
  return { loadedImagesRef, allCurrentLoaded };
};

// Optimized image component with fixed dimensions to prevent layout shift
const OptimizedImage = ({ 
  src, 
  alt, 
  className,
  aspectRatio = "1/1"
}: { 
  src: string; 
  alt: string; 
  className?: string;
  aspectRatio?: string;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div 
      className={`relative bg-muted ${className || ''}`}
      style={{ aspectRatio }}
    >
      <img 
        src={src} 
        alt={alt} 
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-150 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="eager"
        decoding="sync"
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
};

const TestEngine = ({
  questions = PRACTICE_QUESTIONS,
  onComplete,
  sessionId,
  phase
}: TestEngineProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testPhase, setTestPhase] = useState<TestPhase>("fixation");
  const [timeLeft, setTimeLeft] = useState(30);
  const [showWarning, setShowWarning] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const questionStartTime = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQuestion = questions[currentIndex];
  
  // Use image preloader
  const { allCurrentLoaded } = useImagePreloader(questions, currentIndex);

  // Handle answer submission
  const submitAnswer = useCallback((selectedIndex: number | null) => {
    const responseTime = Date.now() - questionStartTime.current;
    const isTimedOut = selectedIndex === null;
    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOptionIndex: selectedIndex,
      responseTimeMs: responseTime,
      isCorrect: selectedIndex === currentQuestion.correctOptionIndex
    };

    // Save to database asynchronously (non-blocking)
    saveExperimentResult({
      session_id: sessionId,
      phase: phase,
      question_index: currentIndex,
      is_correct: answer.isCorrect,
      reaction_time_ms: responseTime,
      timed_out: isTimedOut
    });
    
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    // Track correct count for practice
    const newCorrectCount = answer.isCorrect ? correctCount + 1 : correctCount;
    if (answer.isCorrect) {
      setCorrectCount(newCorrectCount);
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Practice-specific logic: pass with 3 correct answers
    if (phase === 'practice' && newCorrectCount >= 3) {
      setTestPhase("complete");
      return;
    }

    // Move to next question or complete
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTestPhase("fixation");
      setTimeLeft(30);
      setShowWarning(false);
    } else {
      setTestPhase("complete");
    }
  }, [currentIndex, currentQuestion, questions.length, sessionId, phase, answers, correctCount]);

  // Psychometric timing sequence: fixation (500ms) -> blank (100ms) -> question
  useEffect(() => {
    if (testPhase === "fixation") {
      const timer = setTimeout(() => setTestPhase("blank"), 500);
      return () => clearTimeout(timer);
    }
    if (testPhase === "blank") {
      const timer = setTimeout(() => {
        setTestPhase("question");
        questionStartTime.current = Date.now();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [testPhase, currentIndex]);

  // Question timer (30 seconds)
  useEffect(() => {
    if (testPhase !== "question") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
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
  }, [testPhase, submitAnswer]);

  // 5-second warning
  useEffect(() => {
    if (timeLeft === 5 && testPhase === "question") {
      setShowWarning(true);
      const timer = setTimeout(() => setShowWarning(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, testPhase]);

  // Handle test completion
  useEffect(() => {
    if (testPhase === "complete" && onComplete) {
      onComplete(answers);
    }
  }, [testPhase, answers, onComplete]);

  // Render Fixation Cross
  if (testPhase === "fixation") {
    return <div className="flex items-center justify-center h-[70vh]">
        <span className="text-7xl font-light text-foreground select-none">+</span>
      </div>;
  }

  // Render Blank Screen (white)
  if (testPhase === "blank") {
    return <div className="h-[70vh] bg-white" />;
  }

  // Render Complete Screen - hidden, immediately transitions to next phase via onComplete
  if (testPhase === "complete") {
    return <div className="h-[70vh] bg-background" />;
  }

  // Render Question
  return <div className="relative">
      {/* Timer */}
      <div className="absolute top-0 left-0 flex items-center gap-2 text-lg">
        <Clock className={`w-5 h-5 ${timeLeft <= 5 ? "text-destructive" : "text-muted-foreground"}`} />
        <span className={`font-mono font-medium ${timeLeft <= 5 ? "text-destructive" : "text-foreground"}`}>
          {timeLeft}s
        </span>
      </div>

      {/* Question Content */}
      <div className="pt-12 flex flex-col items-center gap-8">
        {/* Warning Flash - above question image */}
        {showWarning && (
          <div className="text-2xl font-bold text-destructive animate-pulse">
            Son 5 Saniye!
          </div>
        )}

        {/* Grid Image */}
        <div className="border border-border rounded-none overflow-hidden bg-card w-full max-w-md">
          <OptimizedImage 
            src={currentQuestion.gridImage} 
            alt="Soru görseli" 
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          {currentQuestion.options.map((option, index) => (
            <button 
              key={index} 
              onClick={() => submitAnswer(index)} 
              className="group relative border border-border rounded-none overflow-hidden bg-card hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all duration-200"
            >
              <OptimizedImage 
                src={option} 
                alt={`Seçenek ${String.fromCharCode(65 + index)}`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>;
};

export default TestEngine;