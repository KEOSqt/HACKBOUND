interface P { onStartGame: () => void; onStartTutorial: () => void; }
export function MainMenu({ onStartGame, onStartTutorial }: P) {
  return (
    <div className="cc-ov">
      <div className="cc-menu">
        <h1><span className="a">CYBER</span><span className="b">CLASH</span></h1>
        <div className="cc-sub">ATTACK. DEFEND. ADAPT.</div>
        <div className="cc-vs">
          <div className="cc-vscard red"><div style={{ fontSize: 34 }}>🥷</div><h4 style={{ color: '#ff8ba0' }}>RED TEAM</h4><p>ATTACK THE NETWORK</p></div>
          <b>VS</b>
          <div className="cc-vscard blue"><div style={{ fontSize: 34 }}>🪖</div><h4 style={{ color: '#7fd8f7' }}>BLUE TEAM</h4><p>DEFEND THE SYSTEM</p></div>
        </div>
        <div>
          <button className="cc-bigbtn" onClick={onStartGame}>START GAME</button>
          <button className="cc-ghost" onClick={onStartTutorial}>HOW TO PLAY</button>
        </div>
        <div className="cc-how">
          🔴 <b>RED</b>: Scan → Exploit → Escalate → Exfiltrate &nbsp;·&nbsp;
          🔵 <b>BLUE</b>: Prevent → Detect → Respond &nbsp;·&nbsp;
          ⚡ 3 energy/turn &nbsp;·&nbsp; 🎯 click a card, then a glowing target
        </div>
        <div className="cc-meta"><span>◉ 2 PLAYERS</span><span>◉ 5–10 MIN</span><span>◉ CYBERSECURITY BATTLE</span></div>
      </div>
    </div>
  );
}
