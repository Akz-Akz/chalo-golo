import { useCallback, useMemo, useState } from 'react';
import { attentionScoreToLevel } from '../services/rewards.js';

const COLORS = [
  { id: 'c0', hex: '#a855f7', label: 'Violet' },
  { id: 'c1', hex: '#f97316', label: 'Solar' },
  { id: 'c2', hex: '#22d3ee', label: 'Neon' },
];

function randomSequence(len, round) {
  const out = [];
  for (let i = 0; i < len; i += 1) {
    const idx = Math.floor(Math.random() * COLORS.length);
    const shape = round >= 4 ? ['◇', '○', '△'][idx] : '';
    out.push({ ...COLORS[idx], shape });
  }
  return out;
}

export function useAttention() {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState('idle');
  const [sequence, setSequence] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [score, setScore] = useState(100);
  const [wrong, setWrong] = useState(0);
  const [flashIndex, setFlashIndex] = useState(-1);

  const seqLen = useMemo(() => Math.min(3 + Math.floor(round / 2), 8), [round]);

  const startRound = useCallback(() => {
    const decoy = round >= 7;
    const seq = randomSequence(seqLen, round);
    setSequence(seq);
    setPlayerIndex(0);
    setPhase('show');
    let i = 0;
    const delayBase = round >= 7 ? 520 : 340;
    const showNext = () => {
      if (i >= seq.length) {
        setFlashIndex(-1);
        setPhase('input');
        return;
      }
      setFlashIndex(i);
      const d = delayBase + (round >= 7 ? Math.random() * 400 : 0);
      setTimeout(() => {
        setFlashIndex(-1);
        setTimeout(() => {
          i += 1;
          showNext();
        }, decoy ? 180 : 120);
      }, d);
    };
    showNext();
  }, [round, seqLen]);

  const resetGame = useCallback(() => {
    setRound(1);
    setPhase('idle');
    setSequence([]);
    setPlayerIndex(0);
    setScore(100);
    setWrong(0);
    setFlashIndex(-1);
  }, []);

  const submitColor = useCallback(
    (colorId) => {
      if (phase !== 'input') return;
      const expected = sequence[playerIndex];
      if (!expected) return;
      if (expected.id !== colorId) {
        setWrong((w) => w + 1);
        setScore((s) => Math.max(0, s - 12));
        return;
      }
      const next = playerIndex + 1;
      if (next >= sequence.length) {
        setPhase('roundComplete');
      } else {
        setPlayerIndex(next);
      }
    },
    [phase, sequence, playerIndex],
  );

  const hitTrap = useCallback(() => {
    if (phase !== 'input') return;
    setScore((s) => Math.max(0, s - 18));
  }, [phase]);

  const advanceRound = useCallback(() => {
    setRound((r) => r + 1);
    setPhase('idle');
  }, []);

  const finalLevel = useMemo(() => attentionScoreToLevel(score), [score]);

  return {
    round,
    phase,
    sequence,
    playerIndex,
    score,
    wrong,
    flashIndex,
    colors: COLORS,
    startRound,
    resetGame,
    submitColor,
    hitTrap,
    advanceRound,
    finalLevel,
    decoyMode: round >= 7,
  };
}
