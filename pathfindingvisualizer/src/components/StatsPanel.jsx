/*
  StatsPanel.jsx — displays algorithm stats and AI explanation stream.
*/
import React from 'react'
import '../styles/StatsPanel.css'

export default function StatsPanel({ stats, explanation, streaming, modelBadgeShown }) {
  return (
    <aside className="stats-panel">
      <h3>Stats</h3>
      {stats ? (
        <ul>
          <li><strong>Algorithm:</strong> <span>{stats.algorithm}</span></li>
          <li><strong>Nodes visited:</strong> <span>{stats.visitedCount}</span></li>
          <li><strong>Path length:</strong> <span>{stats.pathLength}</span></li>
          <li><strong>Execution time:</strong> <span>{stats.executionTime}ms</span></li>
        </ul>
      ) : (
        <p>No run yet</p>
      )}

      <div className="explain">
        <h4>AI Explanation</h4>
        {streaming ? <div className="streaming">... ✦</div> : (
          <div className={`explanation ${explanation ? 'visible' : ''}`}>{explanation || 'Explanation will appear here.'}</div>
        )}
        {modelBadgeShown ? <div className="gemini-badge">✦ Gemini</div> : null}
      </div>
    </aside>
  )
}
