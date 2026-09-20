import { useEffect } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { NetworkVisualization } from './components/NetworkVisualization';
import { MainMenu } from './components/MainMenu';
import { Tutorial } from './components/Tutorial';
import { ResponseChain } from './components/ResponseChain';
import { GameOverScreen } from './components/GameOverScreen';
import type { Card } from './game/types';
import './styles/App.css';

const CAT = (c: string) => c.replace(/_/g, ' ');

function Hud({ team, energy, max, integrity, deck, discard }: { team: 'RED' | 'BLUE'; energy: number; max: number; integrity: number; deck: number; discard: number }) {
  const hp = Math.max(0, Math.round(integrity * 80));
  const red = team === 'RED';
  return (
    <div className={`cc-hud ${red ? 'red' : 'blue'}`}>
      <div className="avatar">{red ? '🥷' : '🪖'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2>{team} TEAM</h2>
        <small>{red ? 'ATTACKER' : 'DEFENDER'}</small>
        <div className="cc-bar"><i style={{ width: `${integrity}%` }} /></div>
        <div className="cc-energy">HP {hp} &nbsp;·&nbsp; CYBER ENERGY ⚡ <b>{energy}/{max}</b> &nbsp;·&nbsp; DECK {deck} DISC {discard}</div>
      </div>
    </div>
  );
}

function HandCol({ team, cards, energy, active, selectedId, onPick }: {
  team: 'RED' | 'BLUE'; cards: Card[]; energy: number; active: boolean; selectedId?: string | null; onPick: (c: Card) => void;
}) {
  const red = team === 'RED';
  return (
    <div className={`cc-side ${red ? 'red' : 'blue'}`}>
      <div className="cc-tabs">
        <span className="cc-tab on">HAND ({cards.length})</span>
        <span className="cc-tab">DECK</span>
        <span className="cc-tab">DISCARD</span>
      </div>
      <div className="cc-hand">
        {cards.length === 0 && <div className="cc-waittag">NO CARDS</div>}
        {cards.map(c => {
          const playable = active && energy >= c.cost;
          const sel = selectedId === c.id;
          return (
            <button key={c.id} onClick={() => playable && onPick(c)}
              className={`cc-cardrow ${sel ? 'sel' : ''} ${playable ? '' : 'off'}`}>
              <span className="cc-ico">{c.icon}</span>
              <span>
                <h4>{c.name}</h4>
                <small>◉ {CAT(c.category)}</small>
              </span>
              <span className="cc-cost">⚡{c.cost}</span>
            </button>
          );
        })}
        {!active && <div className="cc-waittag">{red ? 'RED' : 'BLUE'} STANDBY — WAIT FOR TURN</div>}
      </div>
    </div>
  );
}

export default function App() {
  const { state, startGame, startTutorial, skipTutorial, playCard, respondWithCard, passResponse, endTurn, selectCard, restartGame, toggleSound } = useGameEngine();
  const sel = state.selectedCard;
  const isRed = state.currentTurn === 'RED';

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sel) selectCard(null);
      if (e.key === ' ' && (state.phase === 'RED_TURN' || state.phase === 'BLUE_TURN')) { e.preventDefault(); endTurn(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [sel, state.phase, selectCard, endTurn]);

  if (state.phase === 'MAIN_MENU') return <div className="cc-app"><MainMenu onStartGame={startGame} onStartTutorial={startTutorial} /></div>;
  if (state.phase === 'TUTORIAL') return <div className="cc-app"><Tutorial state={state} onNext={skipTutorial} onSkip={skipTutorial} /></div>;

  const onPick = (c: Card) => {
    if (sel?.id === c.id) { selectCard(null); return; }
    selectCard(c);
    if (c.targetType === 'NONE') playCard(c, 'self');
  };
  const onNode = (nodeId: string) => {
    if (sel && state.validTargets.includes(nodeId)) { playCard(sel, nodeId); selectCard(null); }
  };
  const confirmSelf = () => { if (sel) { playCard(sel, sel.targetType === 'PLAYER' ? (isRed ? 'BLUE' : 'RED') : 'self'); selectCard(null); } };

  const chain = [...state.redPlayer.activeCards, ...state.bluePlayer.activeCards].slice(-6);
  const logs = state.log.slice(-5).reverse();
  const sysRows = [
    ['Web Server', 'web_server'], ['Application Server', 'app_server'],
    ['Database', 'database'], ['Endpoints', 'endpoint'],
  ].map(([label, id]) => {
    const n = state.network.find(x => x.id === id);
    return { label, st: n?.status || 'SECURE' };
  });
  const stColor = (s: string) => s === 'SECURE' ? '#00f0a0' : s === 'COMPROMISED' ? '#ff2d55' : s === 'VULNERABLE' ? '#ffb02e' : s === 'SCANNED' ? '#22c8ff' : s === 'ISOLATED' ? '#b06bff' : '#5b6b82';

  return (
    <div className="cc-app">
      <header className="cc-top">
        <div className="cc-logo"><h1><span className="cy">CYBER</span><span className="cl">CLASH</span></h1><span>ATTACK. DEFEND. ADAPT.</span></div>
        <Hud team="RED" energy={state.redPlayer.energy} max={state.redPlayer.maxEnergy} integrity={state.redPlayer.networkIntegrity} deck={state.redPlayer.deck.length} discard={state.redPlayer.discard.length} />
        <div className={`cc-turn ${isRed ? 'red' : 'blue'}`}>
          <h3>TURN {state.turnNumber}</h3>
          <p>{isRed ? 'RED TEAM’S TURN' : 'BLUE TEAM’S TURN'}</p>
          <div className="tick"><i /></div>
        </div>
        <Hud team="BLUE" energy={state.bluePlayer.energy} max={state.bluePlayer.maxEnergy} integrity={state.bluePlayer.networkIntegrity} deck={state.bluePlayer.deck.length} discard={state.bluePlayer.discard.length} />
        <div className="cc-sys">
          <button className="cc-icobtn" onClick={toggleSound}>{state.soundEnabled ? '🔊 SOUND ON' : '🔇 MUTED'}</button>
          <button className="cc-icobtn" onClick={() => restartGame()}>⚙</button>
        </div>
      </header>

      <main className="cc-main">
        <HandCol team="RED" cards={state.redPlayer.hand} energy={state.redPlayer.energy}
          active={isRed && !state.responseWindowActive} selectedId={sel?.id} onPick={onPick} />

        <div className="cc-bf">
          {sel && state.validTargets.length > 0 && <div className="bf-hint">◉ {sel.name.toUpperCase()} — SELECT HIGHLIGHTED TARGET</div>}
          <div className={`bf-turnflag ${isRed ? 'red' : 'blue'}`}>{isRed ? '🔴 RED ACTING' : '🔵 BLUE ACTING'}</div>
          <NetworkVisualization network={state.network} currentTurn={state.currentTurn}
            validTargets={state.validTargets} selectedCard={sel} responseChain={state.responseChain} onNodeClick={onNode} />
          {sel && (sel.targetType === 'NONE' || sel.targetType === 'PLAYER') && (
            <div className={`cc-detail ${isRed ? 'red' : 'blue'}`}>
              <div className="cat">{CAT(sel.category)} · ⚡{sel.cost}</div>
              <h3>{sel.icon} {sel.name}</h3>
              <p>{sel.effect.description}</p>
              <div className="edu">REAL-WORLD: {sel.educationalDescription}</div>
              <div className="row">
                <button className="cc-btn go" onClick={confirmSelf}>CONFIRM {isRed ? 'ATTACK' : 'DEFENSE'}</button>
                <button className="cc-btn no" onClick={() => selectCard(null)}>CANCEL</button>
              </div>
            </div>
          )}
          {sel && sel.targetType === 'NODE' && (
            <div className={`cc-detail ${isRed ? 'red' : 'blue'}`}>
              <div className="cat">{CAT(sel.category)} · ⚡{sel.cost}</div>
              <h3>{sel.icon} {sel.name}</h3>
              <p>{sel.description}</p>
              <div className="edu">REAL-WORLD: {sel.educationalDescription}</div>
              <div className="req">EFFECT: {sel.effect.description}</div>
              <div className="row"><button className="cc-btn no" onClick={() => selectCard(null)}>CANCEL</button></div>
            </div>
          )}
        </div>

        <HandCol team="BLUE" cards={state.bluePlayer.hand} energy={state.bluePlayer.energy}
          active={!isRed && !state.responseWindowActive} selectedId={sel?.id} onPick={onPick} />

        <div className="cc-log">
          <h5>GAME LOG</h5>
          <ul>{logs.map(l => (
            <li key={l.id}><span className="cc-dot" style={{ background: l.team === 'RED' ? '#ff2d55' : '#22c8ff' }} />
              <span style={{ color: '#5a6d8f' }}>{new Date(l.timestamp).toLocaleTimeString([], { hour12: false })}</span>
              <b style={{ color: l.team === 'RED' ? '#ff8ba0' : '#7fd8f7' }}>[{l.team}]</b>
              <span>{l.message}</span></li>
          ))}</ul>
        </div>

        <div className="cc-chain">
          <div className="cc-chaincards">
            {chain.length === 0 && <div className="cc-waittag" style={{ flex: 1 }}>PLAY RECON TO BEGIN THE ATTACK CHAIN</div>}
            {chain.map(c => (
              <div key={c.id} className={`cc-mincard ${c.team.toLowerCase()} ${sel?.id === c.id ? 'sel' : ''}`}>
                <h6>{c.name}</h6><div className="mi">{c.icon}</div><small>{CAT(c.category)}</small>
              </div>
            ))}
          </div>
          <button className={`cc-endbtn ${isRed ? 'red' : 'blue'}`} onClick={endTurn}
            disabled={state.responseWindowActive}>END TURN</button>
        </div>

        <div className="cc-int">
          <h5>🛡 NETWORK INTEGRITY</h5>
          <div className="cc-intbar"><i style={{ width: `${state.redPlayer.networkIntegrity}%` }} /></div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, textAlign: 'right', marginBottom: 6 }}>{state.redPlayer.networkIntegrity}%</div>
          <h5>SYSTEM STATUS</h5>
          <ul>{sysRows.map(r => (
            <li key={r.label}><span>{r.label}</span><span className="st" style={{ color: stColor(r.st) }}>● {r.st}</span></li>
          ))}</ul>
        </div>
      </main>

      {state.responseWindowActive && <ResponseChain state={state} onRespond={respondWithCard} onPass={passResponse} />}
      {state.phase === 'GAME_OVER' && <GameOverScreen state={state} onRestart={restartGame} onMainMenu={restartGame} />}
    </div>
  );
}
