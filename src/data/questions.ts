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

// Mock practice questions with placeholder images
export const PRACTICE_QUESTIONS: Question[] = [
  {
    id: "practice-1",
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Grid+1",
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
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Grid+2",
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
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Grid+3",
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
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Grid+4",
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
    gridImage: "https://placehold.co/400x300/1a1a1a/666666?text=Grid+5",
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: 2,
  },
];
