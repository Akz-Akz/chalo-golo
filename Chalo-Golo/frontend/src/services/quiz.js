/** @param {Array<{question:string,options:string[],answer:string,xp?:number}>} questions */
export function scoreMcqAnswers(questions, selectedByIndex) {
  if (!Array.isArray(questions) || !questions.length) return { correct: 0, total: 0, percent: 0 };
  let correct = 0;
  questions.forEach((q, i) => {
    const pick = selectedByIndex[i];
    if (pick != null && q.options?.[pick] === q.answer) correct += 1;
  });
  const total = questions.length;
  return { correct, total, percent: Math.round((correct / total) * 100) };
}

export function defaultQuizForTopic(topic) {
  const t = String(topic || 'this topic').slice(0, 80);
  return [
    {
      question: `What is the main purpose of a learning roadmap for "${t}"?`,
      options: ['Sequence skills safely', 'Replace practice', 'Skip fundamentals', 'Avoid projects'],
      answer: 'Sequence skills safely',
      xp: 12,
    },
    {
      question: 'Best next step after watching an intro video?',
      options: ['Take notes + mini quiz', 'Only bookmark', 'Switch topics', 'Wait a week'],
      answer: 'Take notes + mini quiz',
      xp: 10,
    },
    {
      question: 'Spaced repetition helps because it…',
      options: ['Fights forgetting', 'Removes need for sleep', 'Deletes mistakes', 'Avoids focus'],
      answer: 'Fights forgetting',
      xp: 10,
    },
  ];
}
