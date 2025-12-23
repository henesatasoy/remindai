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
export const PRACTICE_QUESTIONS: Question[] = [
  {
    id: "practice-1",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+1",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 2,
  },
  {
    id: "practice-2",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+2",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 0,
  },
  {
    id: "practice-3",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+3",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 1,
  },
  {
    id: "practice-4",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+4",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 3,
  },
  {
    id: "practice-5",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+5",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 2,
  },
  {
    id: "practice-6",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+6",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 1,
  },
  {
    id: "practice-7",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+7",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 0,
  },
  {
    id: "practice-8",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+8",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 3,
  },
  {
    id: "practice-9",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+9",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 2,
  },
  {
    id: "practice-10",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+10",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 1,
  },
];

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
