export interface Question {
  id: string;
  gridImage: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Answer {
  questionId: string;
  selectedOptionIndex: number | null;
  responseTimeMs: number;
  isCorrect: boolean;
}

// 10 Practice questions with placeholder images
export const PRACTICE_QUESTIONS: Question[] = Array.from({ length: 10 }, (_, i) => ({
  id: `practice-${i + 1}`,
  gridImage: `https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+${i + 1}`,
  options: [
    "https://placehold.co/150x100/1a1a1a/666666?text=A",
    "https://placehold.co/150x100/1a1a1a/666666?text=B",
    "https://placehold.co/150x100/1a1a1a/666666?text=C",
    "https://placehold.co/150x100/1a1a1a/666666?text=D",
  ],
  correctOptionIndex: i % 4,
}));

// 12 Phase 1 questions (first half of actual test)
export const PHASE1_QUESTIONS: Question[] = Array.from({ length: 12 }, (_, i) => ({
  id: `phase1-${i + 1}`,
  gridImage: `https://placehold.co/400x300/1a1a1a/666666?text=Faz1+Soru+${i + 1}`,
  options: [
    "https://placehold.co/150x100/1a1a1a/666666?text=A",
    "https://placehold.co/150x100/1a1a1a/666666?text=B",
    "https://placehold.co/150x100/1a1a1a/666666?text=C",
    "https://placehold.co/150x100/1a1a1a/666666?text=D",
  ],
  correctOptionIndex: i % 4,
}));

// 12 Phase 2 questions (second half of actual test)
export const PHASE2_QUESTIONS: Question[] = Array.from({ length: 12 }, (_, i) => ({
  id: `phase2-${i + 1}`,
  gridImage: `https://placehold.co/400x300/1a1a1a/666666?text=Faz2+Soru+${i + 1}`,
  options: [
    "https://placehold.co/150x100/1a1a1a/666666?text=A",
    "https://placehold.co/150x100/1a1a1a/666666?text=B",
    "https://placehold.co/150x100/1a1a1a/666666?text=C",
    "https://placehold.co/150x100/1a1a1a/666666?text=D",
  ],
  correctOptionIndex: (i + 2) % 4,
}));
