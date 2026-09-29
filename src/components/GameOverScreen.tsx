import type { GameState } from '../game/types';
interface P { state: GameState; onRestart: () => void; onMainMenu: () => void; }
export function GameOverScreen({ state, onRestart, onMainMenu }: P) {
  if (!state.winner) return null;
  const red = state.winner === 'RED';
  const rs = state.redPlayer.stats;
  const bs = state.bluePlayer.stats;
  return (
    <div className="cc-ov">
      <div className={`cc-win ${red ? 'red' : 'blue'}`}>
        <h1>{state.winner} TEAM WINS</h1>
        <h2>{state.winReason ?? (red ? 'SENSITIVE DATA EXFILTRATED' : 'THREAT NEUTRALIZED — NETWORK HELD')}</h2>
        <div className="cc-stats">
          <div className="cc-stat"><b style={{ color: '#ff8ba0' }}>{state.redPlayer.dataTokens}/3</b><span>DATA TOKENS</span></div>
          <div className="cc-stat"><b>{rs.successfulAttacks}</b><span>RED ATTACKS</span></div>
          <div className="cc-stat"><b>{rs.systemsCompromised}</b><span>SYS COMPROMISED</span></div>
          <div className="cc-stat"><b>{bs.attacksBlocked}</b><span>ATTACKS BLOCKED</span></div>
          <div className="cc-stat"><b>{bs.systemsSecured}</b><span>SYS SECURED</span></div>
          <div className="cc-stat"><b>{bs.exfilBlocked}</b><span>EXFIL BLOCKED</span></div>
          <div className="cc-stat"><b>{state.redPlayer.hp}/{state.redPlayer.maxHp}</b><span>RED HP</span></div>
          <div className="cc-stat"><b>{state.bluePlayer.hp}/{state.bluePlayer.maxHp}</b><span>BLUE HP</span></div>
        </div>
        <button className="cc-bigbtn" onClick={onRestart}>PLAY AGAIN</button>
        <button className="cc-ghost" onClick={onMainMenu}>MAIN MENU</button>
      </div>
    </div>
  );
}
