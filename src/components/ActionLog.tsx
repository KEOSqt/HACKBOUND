import type { GameState, LogEntry } from '../game/types';

interface ActionLogProps {
  state: GameState;
}

export function ActionLog({ state }: ActionLogProps) {
  const logs = state.log.slice(-20).reverse();
  
  return (
    <div className="action-log panel">
      <div className="log-header">
        <div className="panel-title">BATTLE LOG</div>
        <div className="log-count">{state.log.length} entries</div>
      </div>
      <div className="log-entries scrollbar-thin">
        {logs.map((entry: LogEntry) => (
          <div key={entry.id} className={`log-entry ${entry.type}`}>
            <span className="log-time">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span className={`log-team ${entry.team.toLowerCase()}`}>
              [{entry.team}]
            </span>
            <span className="log-message">{entry.message}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="log-empty">No activity yet...</div>
        )}
      </div>
    </div>
  );
}