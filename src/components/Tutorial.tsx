import type { GameState } from '../game/types';
interface P { state: GameState; onNext: () => void; onSkip: () => void; }
const STEPS = [
  { n: '01', t: 'DISCOVER', d: 'Scan the network and identify targets. SECURE → SCANNED → VULNERABLE.', icon: '🔍' },
  { n: '02', t: 'ATTACK', d: 'Exploit vulnerabilities and move through the network toward the data.', icon: '💉' },
  { n: '03', t: 'DEFEND', d: 'Block attacks, isolate hosts and protect sensitive systems.', icon: '🛡️' },
];
export function Tutorial({ state, onNext, onSkip }: P) {
  const i = Math.min(state.tutorialStep, 2);
  return (
    <div className="cc-ov">
      <div className="cc-tut">
        <div className="cc-sub">HOW TO PLAY — 3 SIMPLE STEPS</div>
        <div className="cc-steps">
          {STEPS.map((s, k) => (
            <div key={s.n} className={`cc-step ${k === i ? 'on' : ''}`}>
              <div className="n">{s.n}</div><div style={{ fontSize: 30 }}>{s.icon}</div>
              <h4>{s.t}</h4><p style={{ fontSize: 12, color: '#8aa0c2' }}>{s.d}</p>
            </div>
          ))}
        </div>
        <button className="cc-bigbtn" onClick={onNext}>{i === 2 ? 'START BATTLE' : 'NEXT'}</button>
        <div><button className="cc-ghost" onClick={onSkip}>SKIP TUTORIAL</button></div>
      </div>
    </div>
  );
}
