// Practice Question 1 images
import q1Grid from "@/assets/questions/practice/q1-grid.jpeg";
import q1Opt1 from "@/assets/questions/practice/q1-opt1.jpeg";
import q1Opt2 from "@/assets/questions/practice/q1-opt2.jpeg";
import q1Opt3 from "@/assets/questions/practice/q1-opt3.jpeg";
import q1Opt4 from "@/assets/questions/practice/q1-opt4.jpeg";

// Practice Question 2 images
import q2Grid from "@/assets/questions/practice/q2-grid.jpeg";
import q2Opt1 from "@/assets/questions/practice/q2-opt1.jpeg";
import q2Opt2 from "@/assets/questions/practice/q2-opt2.jpeg";
import q2Opt3 from "@/assets/questions/practice/q2-opt3.jpeg";
import q2Opt4 from "@/assets/questions/practice/q2-opt4.jpeg";

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

// 10 Practice questions - first 2 with real images, rest with placeholders
export const PRACTICE_QUESTIONS: Question[] = [
  {
    id: "practice-1",
    gridImage: q1Grid,
    options: [q1Opt1, q1Opt2, q1Opt3, q1Opt4],
    correctOptionIndex: 0, // Small purple circle - update if different
  },
  {
    id: "practice-2",
    gridImage: q2Grid,
    options: [q2Opt1, q2Opt2, q2Opt3, q2Opt4],
    correctOptionIndex: 0, // Star with purple square - update if different
  },
  // Remaining practice questions with placeholders
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `practice-${i + 3}`,
    gridImage: `https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+${i + 3}`,
    options: [
      "https://placehold.co/150x100/1a1a1a/666666?text=A",
      "https://placehold.co/150x100/1a1a1a/666666?text=B",
      "https://placehold.co/150x100/1a1a1a/666666?text=C",
      "https://placehold.co/150x100/1a1a1a/666666?text=D",
    ],
    correctOptionIndex: i % 4,
  })),
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
