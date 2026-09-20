import React from 'react';
import type { NetworkNode, NetworkNodeType, ChainLink } from '../game/types';

interface Props {
  network: NetworkNode[];
  currentTurn: 'RED' | 'BLUE';
  validTargets: string[];
  selectedCard: any;
  responseChain: ChainLink[];
  onNodeClick?: (nodeId: string) => void;
}

const POS: Record<string, { x: number; y: number }> = {
  internet: { x: 50, y: 9 },
  firewall: { x: 50, y: 24 },
  web_server: { x: 24, y: 46 },
  app_server: { x: 50, y: 46 },
  database: { x: 76, y: 46 },
  endpoint: { x: 24, y: 74 },
  monitoring: { x: 50, y: 74 },
  auth_server: { x: 76, y: 74 },
  sensitive_data: { x: 50, y: 90 },
};

const EDGES: Array<[string, string]> = [
  ['internet', 'firewall'],
  ['firewall', 'web_server'],
  ['firewall', 'app_server'],
  ['firewall', 'database'],
  ['web_server', 'app_server'],
  ['app_server', 'database'],
  ['web_server', 'endpoint'],
  ['app_server', 'monitoring'],
  ['database', 'auth_server'],
  ['monitoring', 'sensitive_data'],
  ['endpoint', 'monitoring'],
  ['monitoring', 'auth_server'],
  ['app_server', 'sensitive_data'],
];

const ICONS: Record<NetworkNodeType, string> = {
  INTERNET: '🌐', FIREWALL: '🛡️', WEB_SERVER: '🖥️', APP_SERVER: '⚙️',
  AUTH_SERVER: '🔐', DATABASE: '🗄️', SENSITIVE_DATA: '💎', MONITORING: '📡', ENDPOINT: '💻',
};
const LABELS: Record<NetworkNodeType, string> = {
  INTERNET: 'INTERNET', FIREWALL: 'FIREWALL', WEB_SERVER: 'WEB SERVER', APP_SERVER: 'APPLICATION SERVER',
  AUTH_SERVER: 'AUTH SERVER', DATABASE: 'DATABASE', SENSITIVE_DATA: 'SENSITIVE DATA', MONITORING: 'INTERNAL SERVER', ENDPOINT: 'ENDPOINTS',
};
const COLORS: Record<string, string> = {
  SECURE: '#00f0a0', SCANNED: '#22c8ff', VULNERABLE: '#ffb02e',
  COMPROMISED: '#ff2d55', ISOLATED: '#b06bff', OFFLINE: '#5b6b82',
};

export function NetworkVisualization({ network, validTargets, responseChain, onNodeClick }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [dim, setDim] = React.useState({ w: 900, h: 560 });
  const [flash, setFlash] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ro = new ResizeObserver(es => {
      for (const e of es) setDim({ w: e.contentRect.width, h: e.contentRect.height });
    });
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    if (responseChain.length > 0) {
      const last = responseChain[responseChain.length - 1];
      if (last.targetId) {
        setFlash(last.targetId);
        const t = setTimeout(() => setFlash(null), 600);
        return () => clearTimeout(t);
      }
    }
  }, [responseChain.length]);

  const P = (id: string) => {
    const p = POS[id] || { x: 50, y: 50 };
    return { x: (p.x / 100) * dim.w, y: (p.y / 100) * dim.h };
  };
  const byId = (id: string) => network.find(n => n.id === id);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={dim.w} height={dim.h} style={{ display: 'block' }}>
        {EDGES.map(([a, b], i) => {
          const A = byId(a); const B = byId(b);
          if (!A || !B) return null;
          const p1 = P(a); const p2 = P(b);
          const hot = responseChain.some(l => (l.targetId === a || l.targetId === b));
          const cold = A.defenses.some(d => d.includes('block')) || B.defenses.some(d => d.includes('block'));
          const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2 - 14;
          return (
            <g key={i}>
              <path d={`M${p1.x},${p1.y} Q${mx},${my} ${p2.x},${p2.y}`}
                fill="none" className={`bf-edge flow ${hot ? 'hot' : ''} ${cold ? 'cold' : ''}`} />
            </g>
          );
        })}
        {network.map(node => {
          const p = P(node.id);
          const c = COLORS[node.status] || '#22c8ff';
          const isT = validTargets.includes(node.id);
          const R = node.type === 'SENSITIVE_DATA' ? 30 : 34;
          return (
            <g key={node.id}
              className={`bf-node ${isT ? 'target' : ''} ${flash === node.id ? 'hit' : ''}`}
              onClick={() => { if (isT && onNodeClick) onNodeClick(node.id); }}
              style={{ cursor: isT ? 'pointer' : 'default' }}>
              {isT && <circle cx={p.x} cy={p.y} r={R + 10} className="bf-pulse" stroke="#ffb02e" strokeDasharray="6 5" />}
              <circle cx={p.x} cy={p.y} r={R + 6} fill="none" stroke={c} strokeOpacity=".25" strokeWidth={5} />
              <circle cx={p.x} cy={p.y} r={R} className="bf-ring" stroke={c} style={{ filter: `drop-shadow(0 0 10px ${c})` }} />
              <circle cx={p.x} cy={p.y} r={R - 7} className="bf-core" />
              <text x={p.x} y={p.y + 1} className="bf-ico" dominantBaseline="middle">{ICONS[node.type]}</text>
              {node.status === 'COMPROMISED' && (
                <circle cx={p.x + R - 8} cy={p.y - R + 8} r={8} fill="#ff2d55" stroke="#fff" strokeWidth={1.5} />
              )}
              <text x={p.x} y={p.y + R + 15} className="bf-lbl" fill={c}>{LABELS[node.type]}</text>
              <text x={p.x} y={p.y + R + 26} className="bf-sub" fill={c} opacity={.75}>
                {node.status === 'COMPROMISED' ? `◆ ${node.compromiseLevel}/${node.maxCompromise}` : `○ ${node.status}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
