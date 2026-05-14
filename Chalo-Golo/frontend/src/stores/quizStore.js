import { create } from 'zustand';

export const useQuizStore = create((set) => ({
  questions: [],
  index: 0,
  answers: {},
  scorePercent: null,
  timeLeft: 0,
  timerTotal: 0,
  reset: (questions = [], secondsPerQuestion = 22) =>
    set({
      questions,
      index: 0,
      answers: {},
      scorePercent: null,
      timeLeft: questions.length ? secondsPerQuestion : 0,
      timerTotal: questions.length ? secondsPerQuestion : 0,
    }),
  tick: () => set((s) => ({ timeLeft: Math.max(0, s.timeLeft - 1) })),
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  answerCurrent: (optionIndex) =>
    set((s) => ({
      answers: { ...s.answers, [s.index]: optionIndex },
    })),
  next: () =>
    set((s) => {
      const nextIndex = s.index + 1;
      if (nextIndex >= s.questions.length) return s;
      return {
        index: nextIndex,
        timeLeft: s.timerTotal || 22,
      };
    }),
  finish: (scorePercent) => set({ scorePercent }),
}));
