import { useCallback, useEffect } from 'react';
import { useQuizStore } from '../stores/quizStore.js';
import { scoreMcqAnswers } from '../services/quiz.js';

export function useQuiz() {
  const questions = useQuizStore((s) => s.questions);
  const index = useQuizStore((s) => s.index);
  const answers = useQuizStore((s) => s.answers);
  const timeLeft = useQuizStore((s) => s.timeLeft);
  const timerTotal = useQuizStore((s) => s.timerTotal);
  const scorePercent = useQuizStore((s) => s.scorePercent);
  const reset = useQuizStore((s) => s.reset);
  const tick = useQuizStore((s) => s.tick);
  const answerCurrent = useQuizStore((s) => s.answerCurrent);
  const next = useQuizStore((s) => s.next);
  const finish = useQuizStore((s) => s.finish);

  useEffect(() => {
    if (!questions.length || scorePercent != null) return undefined;
    if (timeLeft > 0) return undefined;
    const t = setInterval(() => tick(), 1000);
    return () => clearInterval(t);
  }, [questions.length, timeLeft, tick, scorePercent]);

  useEffect(() => {
    if (scorePercent != null) return;
    if (!questions.length) return;
    if (timeLeft !== 0) return;
    const isLast = index >= questions.length - 1;
    if (isLast) {
      const merged = { ...answers, [index]: undefined };
      const arr = questions.map((_, i) => merged[i]);
      const { percent } = scoreMcqAnswers(questions, arr);
      finish(percent);
    } else {
      next();
    }
  }, [timeLeft, questions, index, answers, finish, next, scorePercent]);

  const current = questions[index] || null;

  const pickOption = useCallback(
    (optionIndex) => {
      if (scorePercent != null || !current) return;
      const isLast = index >= questions.length - 1;
      const merged = { ...answers, [index]: optionIndex };
      answerCurrent(optionIndex);
      if (isLast) {
        const arr = questions.map((_, i) => merged[i]);
        const { percent } = scoreMcqAnswers(questions, arr);
        finish(percent);
      } else {
        next();
      }
    },
    [answerCurrent, answers, current, finish, index, next, questions, scorePercent],
  );

  const summary = scorePercent != null ? scoreMcqAnswers(questions, answers) : null;

  return {
    questions,
    index,
    current,
    timeLeft,
    timerTotal,
    scorePercent,
    answers,
    reset,
    pickOption,
    summary,
  };
}
