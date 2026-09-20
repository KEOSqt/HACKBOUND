import type { GameState } from '../game/types';
interface P { state: GameState; onRestart: () => void; onMainMenu: () => void; }
export function GameOverScreen({ state, onRestart, onMainMenu }: P) {
  if (!state.winner) return null;
  const red = state.winner === 'RED';
  const attacks = state.redPlayer.discard.length + state.redPlayer.activeCards.length;
  const defs = state.bluePlayer.discard.length + state.bluePlayer.activeCards.length;
  return (
    <div className="cc-ov">
      <div className={`cc-win ${red ? 'red' : 'blue'}`}>
        <h1>{state.winner} TEAM WINS</h1>
        <h2>{red ? 'SENSITIVE DATA EXFILTRATED' : 'THREAT NEUTRALIZED — NETWORK HELD'}</h2>
        <div className="cc-stats">
          <div className="cc-stat"><b>{state.redPlayer.networkIntegrity}%</b><span>INTEGRITY</span></div>
          <div className="cc-stat"><b>{state.turnNumber}</b><span>TURNS</span></div>
          <div className="cc-stat"><b style={{ color: '#ff8ba0' }}>{attacks}</b><span>ATTACKS</span></div>
          <div className="cc-stat"><b style={{ color: '#7fd8f7' }}>{defs}</b><span>DEFENSES</span></div>
        </div>
        <button className="cc-bigbtn" onClick={onRestart}>PLAY AGAIN</button>
        <button className="cc-ghost" onClick={onMainMenu}>MAIN MENU</button>
      </div>
    </div>
  );
}
