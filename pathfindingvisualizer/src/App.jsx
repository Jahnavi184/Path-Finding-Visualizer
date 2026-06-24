/*
  App.jsx — Top-level application state and orchestration for the
  Pathfinding Visualizer. Lifts state for the grid, start/end nodes,
  running status, and coordinates interactions between UI and algorithms.
*/
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Grid from './components/Grid'
import Navbar from './components/Navbar'
import StatsPanel from './components/StatsPanel'
import bfs from './algorithms/bfs'
import dfs from './algorithms/dfs'
import dijkstra from './algorithms/dijkstra'
import useGeminiAI from './hooks/useGeminiAI'
import './styles/App.css'

const ROWS = 20
const COLS = 50
const DEFAULT_START = { row: 10, col: 5 }
const DEFAULT_END = { row: 10, col: 45 }

function createNode(row, col) {
  return {
    row,
    col,
    isStart: row === DEFAULT_START.row && col === DEFAULT_START.col,
    isEnd: row === DEFAULT_END.row && col === DEFAULT_END.col,
    isWall: false,
    visited: false,
    weight: 1,
    previousNode: null,
  }
}

function buildGrid() {
  const grid = []
  for (let r = 0; r < ROWS; r++) {
    const row = []
    for (let c = 0; c < COLS; c++) row.push(createNode(r, c))
    grid.push(row)
  }
  return grid
}

export default function App() {
  const [grid, setGrid] = useState(() => buildGrid())
  const [start, setStart] = useState(DEFAULT_START)
  const [end, setEnd] = useState(DEFAULT_END)
  const [running, setRunning] = useState(false)
  const [activeAlgo, setActiveAlgo] = useState(null)
  const [stats, setStats] = useState(null)
  const { generateMaze, explainAlgorithm, isLoading: aiLoading, explanation, clearExplanation } = useGeminiAI()

  const nodeRefs = useRef([]) // 2D array of DOM node refs populated by Grid

  const registerNodeRef = useCallback((r, c, ref) => {
    if (!nodeRefs.current[r]) nodeRefs.current[r] = []
    nodeRefs.current[r][c] = ref
  }, [])

  const clearClasses = useCallback(() => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const el = nodeRefs.current?.[r]?.[c]
        if (el) {
          el.classList.remove('node-visited')
          el.classList.remove('node-path')
        }
      }
    }
  }, [])

  const clearPath = useCallback(() => {
    clearClasses()
    setStats(null)
    clearExplanation()
  }, [clearClasses, clearExplanation])

  const clearBoard = useCallback(() => {
    clearClasses()
    setStats(null)
    clearExplanation()
    setGrid(buildGrid())
    setStart(DEFAULT_START)
    setEnd(DEFAULT_END)
  }, [clearClasses, clearExplanation])

  const runAlgorithm = useCallback(async (name) => {
    if (running || aiLoading) return
    setRunning(true)
    setActiveAlgo(name)
    clearClasses()
    clearExplanation()

    const gridCopy = grid.map(row => row.map(n => ({ ...n, previousNode: null })))
    const startNode = gridCopy[start.row][start.col]
    const endNode = gridCopy[end.row][end.col]

    const algMap = { BFS: bfs, DFS: dfs, Dijkstra: dijkstra }
    const alg = algMap[name]
    if (!alg) {
      setRunning(false)
      return
    }

    const t0 = performance.now()
    const { visitedNodesInOrder, shortestPath } = alg(gridCopy, startNode, endNode)
    const t1 = performance.now()
    const execTime = Math.round(t1 - t0)

    const visitedDelay = 20
    const pathDelay = 50
    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      const node = visitedNodesInOrder[i]
      const el = nodeRefs.current?.[node.row]?.[node.col]
      if (el) {
        setTimeout(() => {
          el.className = 'node node-visited'
          if (node.isStart) el.classList.add('node-start')
          if (node.isEnd) el.classList.add('node-end')
          if (node.isWall) el.classList.add('node-wall')
        }, visitedDelay * i)
      }
    }

    const afterVisitDelay = visitedNodesInOrder.length * visitedDelay + 30
    for (let i = 0; i < shortestPath.length; i++) {
      const node = shortestPath[i]
      const el = nodeRefs.current?.[node.row]?.[node.col]
      if (el) {
        setTimeout(() => {
          el.className = 'node node-path'
          if (node.isStart) el.classList.add('node-start')
          if (node.isEnd) el.classList.add('node-end')
          if (node.isWall) el.classList.add('node-wall')
        }, afterVisitDelay + pathDelay * i)
      }
    }

    const finalizeDelay = afterVisitDelay + shortestPath.length * pathDelay + 80
    setTimeout(() => {
      setStats({ algorithm: name, visitedCount: visitedNodesInOrder.length, pathLength: shortestPath.length, executionTime: execTime })
      setRunning(false)
      setActiveAlgo(null)
      explainAlgorithm({ algorithmName: name, visitedCount: visitedNodesInOrder.length, pathLength: shortestPath.length, executionTime: execTime })
    }, finalizeDelay)
  }, [running, aiLoading, grid, start, end, clearExplanation, explainAlgorithm])

  const applyWalls = useCallback((wallCoords) => {
    setGrid(prev => {
      const copy = prev.map(r => r.map(n => ({ ...n, isWall: false })))
      for (const [r, c] of wallCoords) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) copy[r][c].isWall = true
      }
      copy[start.row][start.col].isWall = false
      copy[end.row][end.col].isWall = false
      return copy
    })
  }, [start, end])

  const handleGenerateMaze = useCallback(async () => {
    if (running || aiLoading) return
    try {
      const coords = await generateMaze()
      if (!Array.isArray(coords)) throw new Error('Invalid JSON')
      applyWalls(coords)
      // run silent BFS to verify solvable
      const gridCopy = grid.map(row => row.map(n => ({ ...n, isWall: false })))
      for (const [r, c] of coords) gridCopy[r][c].isWall = true
      const res = bfs(gridCopy, gridCopy[start.row][start.col], gridCopy[end.row][end.col])
      if (!res.shortestPath || res.shortestPath.length === 0) {
        alert('AI generated an unsolvable maze — try again')
      }
    } catch (err) {
      console.error(err)
      alert('Maze generation failed — check your API key')
    }
  }, [running, aiLoading, generateMaze, applyWalls, grid, start, end])

  useEffect(() => {
    // reset nodeRefs when grid shape changes
    nodeRefs.current = Array.from({ length: ROWS }, () => Array(COLS))
  }, [grid])

  return (
    <div className="app-root">
      <Navbar
        onVisualize={(algo) => runAlgorithm(algo)}
        onClearPath={clearPath}
        onClearBoard={clearBoard}
        onGenerateMaze={handleGenerateMaze}
        disabled={running || aiLoading}
        activeAlgo={activeAlgo}
      />
      <main className="main-area">
        <Grid
          grid={grid}
          registerNodeRef={registerNodeRef}
          setGrid={setGrid}
          start={start}
          end={end}
          setStart={setStart}
          setEnd={setEnd}
          running={running || aiLoading}
        />
        <StatsPanel stats={stats} explanation={explanation} streaming={aiLoading} modelBadgeShown={!aiLoading && explanation?.length > 0} />
      </main>
    </div>
  )
}
