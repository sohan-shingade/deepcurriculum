import { create } from "zustand";

interface LessonStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;

  exerciseCode: Record<string, string>;
  setExerciseCode: (exerciseId: string, code: string) => void;

  quizAnswers: Record<string, number | string>;
  setQuizAnswer: (questionId: string, answer: number | string) => void;
  clearQuizAnswers: () => void;

  outputHistory: string[];
  addOutput: (output: string) => void;
  clearOutput: () => void;

  revealedHints: Record<string, number>;
  revealNextHint: (exerciseId: string) => void;

  completedExercises: Set<string>;
  markExerciseComplete: (exerciseId: string) => void;
}

export const useLessonStore = create<LessonStore>((set) => ({
  activeTab: "exercise-0",
  setActiveTab: (tab) => set({ activeTab: tab }),

  exerciseCode: {},
  setExerciseCode: (exerciseId, code) =>
    set((state) => ({
      exerciseCode: { ...state.exerciseCode, [exerciseId]: code },
    })),

  quizAnswers: {},
  setQuizAnswer: (questionId, answer) =>
    set((state) => ({
      quizAnswers: { ...state.quizAnswers, [questionId]: answer },
    })),
  clearQuizAnswers: () => set({ quizAnswers: {} }),

  outputHistory: [],
  addOutput: (output) =>
    set((state) => ({
      outputHistory: [...state.outputHistory.slice(-50), output],
    })),
  clearOutput: () => set({ outputHistory: [] }),

  revealedHints: {},
  revealNextHint: (exerciseId) =>
    set((state) => ({
      revealedHints: {
        ...state.revealedHints,
        [exerciseId]: (state.revealedHints[exerciseId] ?? 0) + 1,
      },
    })),

  completedExercises: new Set<string>(),
  markExerciseComplete: (exerciseId) =>
    set((state) => {
      const newSet = new Set(state.completedExercises);
      newSet.add(exerciseId);
      return { completedExercises: newSet };
    }),
}));
