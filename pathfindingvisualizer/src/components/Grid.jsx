/*
  Grid.jsx — renders the grid of nodes and handles user interactions
  for drawing walls and moving start/end nodes. Uses DOM refs for nodes.
*/
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Node from './Node'
import '../styles/Grid.css'

export default function Grid({ grid, registerNodeRef, setGrid, start, end, setStart, setEnd, running }) {
  const [mouseDown, setMouseDown] = useState(false)
  const [dragging, setDragging] = useState(null) // 'start' | 'end' | null

  useEffect(() => {
    const onUp = () => setMouseDown(false)
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [])

  const toggleWall = useCallback((r, c) => {
    setGrid(prev => {
      const copy = prev.map(row => row.map(n => ({ ...n })))
      const node = copy[r][c]
      if (node.isStart || node.isEnd) return prev
      node.isWall = !node.isWall
      return copy
    })
  }, [setGrid])

  const handleMouseDown = (e, node) => {
    if (running) return
    setMouseDown(true)
    if (node.isStart) setDragging('start')
    else if (node.isEnd) setDragging('end')
    else toggleWall(node.row, node.col)
  }

  const handleMouseEnter = (e, node) => {
    if (running) return
    if (!mouseDown) return
    if (dragging === 'start') {
      setGrid(prev => {
        const copy = prev.map(row => row.map(n => ({ ...n, isStart: false })))
        copy[node.row][node.col].isStart = true
        return copy
      })
      setStart({ row: node.row, col: node.col })
    } else if (dragging === 'end') {
      setGrid(prev => {
        const copy = prev.map(row => row.map(n => ({ ...n, isEnd: false })))
        copy[node.row][node.col].isEnd = true
        return copy
      })
      setEnd({ row: node.row, col: node.col })
    } else {
      toggleWall(node.row, node.col)
    }
  }

  const handleMouseUp = (e, node) => {
    setMouseDown(false)
    setDragging(null)
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 1fr)` }}>
      {grid.map((row, r) => row.map((node, c) => (
        <Node
          key={`${r}-${c}`}
          node={node}
          registerRef={registerNodeRef}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseUp={handleMouseUp}
        />
      )))}
    </div>
  )
}
