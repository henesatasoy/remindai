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

// Practice Question 3 images
import q3Grid from "@/assets/questions/practice/q3-grid.jpeg";
import q3Opt1 from "@/assets/questions/practice/q3-opt1.jpeg";
import q3Opt2 from "@/assets/questions/practice/q3-opt2.jpeg";
import q3Opt3 from "@/assets/questions/practice/q3-opt3.jpeg";
import q3Opt4 from "@/assets/questions/practice/q3-opt4.jpeg";

// Practice Question 4 images
import q4Grid from "@/assets/questions/practice/q4-grid.jpeg";
import q4Opt1 from "@/assets/questions/practice/q4-opt1.jpeg";
import q4Opt2 from "@/assets/questions/practice/q4-opt2.jpeg";
import q4Opt3 from "@/assets/questions/practice/q4-opt3.jpeg";
import q4Opt4 from "@/assets/questions/practice/q4-opt4.jpeg";

// Practice Question 5 images
import q5Grid from "@/assets/questions/practice/q5-grid.jpeg";
import q5Opt1 from "@/assets/questions/practice/q5-opt1.jpeg";
import q5Opt2 from "@/assets/questions/practice/q5-opt2.jpeg";
import q5Opt3 from "@/assets/questions/practice/q5-opt3.jpeg";
import q5Opt4 from "@/assets/questions/practice/q5-opt4.jpeg";

// Practice Question 6 images
import q6Grid from "@/assets/questions/practice/q6-grid.jpeg";
import q6Opt1 from "@/assets/questions/practice/q6-opt1.jpeg";
import q6Opt2 from "@/assets/questions/practice/q6-opt2.jpeg";
import q6Opt3 from "@/assets/questions/practice/q6-opt3.jpeg";
import q6Opt4 from "@/assets/questions/practice/q6-opt4.jpeg";

// Practice Question 7 images
import q7Grid from "@/assets/questions/practice/q7-grid.jpeg";
import q7Opt1 from "@/assets/questions/practice/q7-opt1.jpeg";
import q7Opt2 from "@/assets/questions/practice/q7-opt2.jpeg";
import q7Opt3 from "@/assets/questions/practice/q7-opt3.jpeg";
import q7Opt4 from "@/assets/questions/practice/q7-opt4.jpeg";

// Practice Question 8 images
import q8Grid from "@/assets/questions/practice/q8-grid.jpeg";
import q8Opt1 from "@/assets/questions/practice/q8-opt1.jpeg";
import q8Opt2 from "@/assets/questions/practice/q8-opt2.jpeg";
import q8Opt3 from "@/assets/questions/practice/q8-opt3.jpeg";
import q8Opt4 from "@/assets/questions/practice/q8-opt4.jpeg";

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

// 10 Practice questions - first 8 with real images, rest with placeholders
export const PRACTICE_QUESTIONS: Question[] = [
  {
    id: "practice-1",
    gridImage: q1Grid,
    options: [q1Opt1, q1Opt2, q1Opt3, q1Opt4],
    correctOptionIndex: 0,
  },
  {
    id: "practice-2",
    gridImage: q2Grid,
    options: [q2Opt1, q2Opt2, q2Opt3, q2Opt4],
    correctOptionIndex: 0,
  },
  {
    id: "practice-3",
    gridImage: q3Grid,
    options: [q3Opt1, q3Opt2, q3Opt3, q3Opt4],
    correctOptionIndex: 0,
  },
  {
    id: "practice-4",
    gridImage: q4Grid,
    options: [q4Opt1, q4Opt2, q4Opt3, q4Opt4],
    correctOptionIndex: 0,
  },
  {
    id: "practice-5",
    gridImage: q5Grid,
    options: [q5Opt1, q5Opt2, q5Opt3, q5Opt4],
    correctOptionIndex: 0,
  },
  {
    id: "practice-6",
    gridImage: q6Grid,
    options: [q6Opt1, q6Opt2, q6Opt3, q6Opt4],
    correctOptionIndex: 0,
  },
  {
    id: "practice-7",
    gridImage: q7Grid,
    options: [q7Opt1, q7Opt2, q7Opt3, q7Opt4],
    correctOptionIndex: 0,
  },
  {
    id: "practice-8",
    gridImage: q8Grid,
    options: [q8Opt1, q8Opt2, q8Opt3, q8Opt4],
    correctOptionIndex: 0,
  },
  // Remaining practice questions with placeholders
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `practice-${i + 9}`,
    gridImage: `https://placehold.co/400x300/1a1a1a/666666?text=Alıştırma+${i + 9}`,
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
