import type { GameState, Card } from '../game/types';
import { isValidResponse } from '../game/rules';
interface P { state: GameState; onRespond: (c: Card, t: string) => void; onPass: () => void; }
export function ResponseChain({ state, onRespond, onPass }: P) {
  const defending = state.currentTurn === 'RED' ? 'BLUE' : 'RED';
  const hand = defending === 'RED' ? state.redPlayer.hand : state.bluePlayer.hand;
  const original = state.responseChain[state.responseChain.length - 1];
  const opts = original ? hand.filter(c => isValidResponse(c, original.card)) : [];
  const secs = Math.max(0, Math.ceil(state.responseWindowTimer / 1000));
  return (
    <div className="cc-ov" onClick={onPass}>
      <div className="cc-resp" onClick={e => e.stopPropagation()}>
        <h2>⚡ RESPONSE WINDOW</h2>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: 2, color: '#ffd9a0' }}>{defending} TEAM — RESPOND OR LET IT RESOLVE</div>
        <div className="tm">{secs}</div>
        <div className="cc-rchain">
          {state.responseChain.map((l, i) => (
            <div key={l.id} className="cc-rlink" style={{ borderColor: l.player === 'RED' ? '#ff2d55' : '#22c8ff' }}>
              {i > 0 ? '↓ ' : ''}{l.card.icon} {l.card.name} <b style={{ color: l.player === 'RED' ? '#ff8ba0' : '#7fd8f7' }}>· {l.player}</b>
            </div>
          ))}
        </div>
        <div className="cc-ropts">
          {opts.map(c => (
            <button key={c.id} className="cc-ropt" onClick={() => onRespond(c, 'self')}>{c.icon} {c.name} · ⚡{c.cost}</button>
          ))}
        </div>
        {opts.length === 0 && <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#8aa0c2', marginBottom: 8 }}>NO COUNTER IN HAND</div>}
        <button className="cc-ghost" onClick={onPass}>PASS — LET IT RESOLVE</button>
      </div>
    </div>
  );
}
