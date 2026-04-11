export type QuizQuestion = {
  id: number;
  question: string;
  answer: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  question: `Question ${i + 1}: What is the significance of this question?`,
  answer: `This is the hidden answer for question ${i + 1}.`,
}));
