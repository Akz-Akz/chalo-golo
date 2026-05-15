import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bot, Crown, Flame, Swords } from 'lucide-react';
import AvatarCard from './AvatarCard.jsx';
import { audioManager } from '../services/audioManager.js';

const QUESTIONS = [
  {
    question: 'What is the safest first move when starting a difficult new skill?',
    options: ['Build a tiny daily loop', 'Buy every advanced tool', 'Wait for motivation', 'Skip foundations'],
    answer: 0,
  },
  {
    question: 'Which habit protects a roadmap from burnout?',
    options: ['No breaks ever', 'Reality checked weekly hours', 'Only watching videos', 'Changing goals daily'],
    answer: 1,
  },
  {
    question: 'What makes a project portfolio stronger?',
    options: ['Private notes only', 'A shipped demo with learnings', 'Random screenshots', 'Unfinished clones'],
    answer: 1,
  },
  {
    question: 'When stuck on a module, what should you do first?',
    options: ['Quit the whole roadmap', 'Ask a peer or split the task', 'Open social apps', 'Delete progress'],
    answer: 1,
  },
  {
    question: 'What should XP reward in Chalo Golo?',
    options: ['Consistent learning action', 'Leaving the flow', 'Skipping quizzes', 'Ignoring resources'],
    answer: 0,
  },
];

export default function VersusBattlePage({ userProfile, onBack, onComplete }) {
  const [phase, setPhase] = useState('intro');
  const [countdown, setCountdown] = useState(3);
  const [index, setIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiLast, setAiLast] = useState('');
  const [locked, setLocked] = useState(false);
  const completedRef = useRef(false);

  const current = QUESTIONS[index];
  const winner = playerScore >= aiScore ? 'player' : 'ai';

  const aiPlan = useMemo(() => QUESTIONS.map((q, i) => ({
    delay: 1300 + Math.random() * 2200 + i * 80,
    correct: Math.random() > 0.24,
    answer: Math.random() > 0.24 ? q.answer : (q.answer + 1 + Math.floor(Math.random() * 3)) % q.options.length,
  })), []);

  useEffect(() => {
    if (phase !== 'intro') return undefined;
    const id = setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          setPhase('battle');
          return 0;
        }
        return value - 1;
      });
    }, 850);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'battle' || !current) return undefined;
    setLocked(false);
    setAiThinking(true);
    setAiLast('Thinking...');
    const plan = aiPlan[index];
    const timer = setTimeout(() => {
      setAiThinking(false);
      const gained = plan.correct ? 90 + Math.floor(Math.random() * 45) : 20;
      setAiScore((score) => score + gained);
      setAiLast(plan.correct ? `AI locked correct +${gained}` : `AI missed +${gained}`);
      audioManager.play(plan.correct ? 'win' : 'lose');
    }, plan.delay);
    return () => clearTimeout(timer);
  }, [phase, current, index, aiPlan]);

  useEffect(() => {
    if (phase !== 'battle') return undefined;
    if (index < QUESTIONS.length) return undefined;
    setPhase('result');
  }, [index, phase]);

  useEffect(() => {
    if (phase !== 'result' || completedRef.current) return;
    completedRef.current = true;
    const won = playerScore >= aiScore;
    audioManager.play(won ? 'win' : 'lose');
    onComplete?.(won);
  }, [phase, playerScore, aiScore, onComplete]);

  const answer = (optionIndex) => {
    if (locked || !current) return;
    setLocked(true);
    const correct = optionIndex === current.answer;
    const streak = correct ? combo + 1 : 0;
    setCombo(streak);
    const gained = correct ? 110 + streak * 25 : 10;
    setPlayerScore((score) => score + gained);
    audioManager.play(correct ? 'win' : 'lose');
    setTimeout(() => setIndex((i) => i + 1), 850);
  };

  return (
    <div className="cg-galaxy cg-battle-screen">
      <div className="cg-battle-shell">
        <button className="cg-ghost-button" type="button" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <div className="cg-battle-header">
          <div>
            <div className="cg-kicker"><Swords size={14} /> VERSUS MODE</div>
            <h1>Neural Sprint Battle</h1>
          </div>
          <div className="cg-live-pill">Realtime simulation</div>
        </div>

        {phase === 'intro' ? (
          <div className="cg-versus-intro">
            <AvatarCard profile={userProfile} compact />
            <motion.div className="cg-countdown" key={countdown} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              {countdown || 'GO'}
            </motion.div>
            <div className="cg-ai-card">
              <div className="cg-ai-orb"><Bot size={42} /></div>
              <strong>ByteBoss AI</strong>
              <span>Adaptive rival</span>
            </div>
          </div>
        ) : null}

        {phase === 'battle' && current ? (
          <div className="cg-battle-grid">
            <div className="cg-score-panel">
              <AvatarCard profile={userProfile} compact />
              <div className="cg-score-number">{playerScore}</div>
              <div className="cg-score-label">Your score</div>
              {combo > 1 ? <div className="cg-combo"><Flame size={14} /> {combo}x combo</div> : null}
            </div>
            <div className="cg-question-panel">
              <div className="cg-kicker">Question {index + 1} / {QUESTIONS.length}</div>
              <h2>{current.question}</h2>
              <div className="cg-battle-options">
                {current.options.map((option, optionIndex) => (
                  <motion.button
                    key={option}
                    type="button"
                    disabled={locked}
                    onClick={() => answer(optionIndex)}
                    whileHover={{ scale: locked ? 1 : 1.015 }}
                    whileTap={{ scale: locked ? 1 : 0.98 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="cg-score-panel ai">
              <div className="cg-ai-orb"><Bot size={42} /></div>
              <div className="cg-score-number">{aiScore}</div>
              <div className="cg-score-label">ByteBoss AI</div>
              <div className="cg-ai-status">{aiThinking ? 'Simulated thinking...' : aiLast}</div>
            </div>
          </div>
        ) : null}

        <AnimatePresence>
          {phase === 'result' ? (
            <motion.div className="cg-result-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <Crown size={44} />
              <div className="cg-kicker">Winner reveal</div>
              <h2>{winner === 'player' ? 'You won the sprint' : 'ByteBoss edged ahead'}</h2>
              <p>{playerScore} vs {aiScore}</p>
              <button type="button" className="btn-primary" onClick={onBack}>Return to dashboard</button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
