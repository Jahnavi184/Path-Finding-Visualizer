/*
  Navbar.jsx — top controls for running algorithms and AI maze generation.
*/
import React from 'react'
import '../styles/Navbar.css'

export default function Navbar({ onVisualize, onClearPath, onClearBoard, onGenerateMaze, disabled, activeAlgo }) {
  return (
    <nav className="navbar">
      <div className="controls">
        <button onClick={() => onVisualize('BFS')} disabled={disabled}>Visualize BFS</button>
        <button onClick={() => onVisualize('DFS')} disabled={disabled}>Visualize DFS</button>
        <button onClick={() => onVisualize('Dijkstra')} disabled={disabled}>Visualize Dijkstra</button>
        <button onClick={onClearPath} disabled={disabled}>Clear Path</button>
        <button onClick={onClearBoard} disabled={disabled}>Clear Board</button>
        <button onClick={onGenerateMaze} disabled={disabled} className="ai-btn">Generate AI Maze</button>
      </div>
      <div className="status">{activeAlgo ? `Running: ${activeAlgo}` : 'Idle'}</div>
    </nav>
  )
}
