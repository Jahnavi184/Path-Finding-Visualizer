/*
  Node.jsx — renders a single cell node. Exposes its DOM element via
  a callback `registerRef(row,col,el)` to allow direct DOM class toggling.
*/
import React, { forwardRef, useEffect, useRef } from 'react'
import '../styles/Node.css'

const Node = forwardRef(function Node({ node, registerRef, onMouseDown, onMouseEnter, onMouseUp }, ref) {
  const localRef = useRef(null)

  useEffect(() => {
    const el = localRef.current
    if (!el) return
    registerRef(node.row, node.col, el)
    el.classList.add('node')
    el.classList.remove('node-start', 'node-end', 'node-wall')
    if (node.isStart) el.classList.add('node-start')
    if (node.isEnd) el.classList.add('node-end')
    if (node.isWall) el.classList.add('node-wall')
  }, [node, registerRef])

  return (
    <div
      ref={localRef}
      role="button"
      tabIndex={0}
      data-row={node.row}
      data-col={node.col}
      className="node"
      onMouseDown={(e) => onMouseDown(e, node)}
      onMouseEnter={(e) => onMouseEnter(e, node)}
      onMouseUp={(e) => onMouseUp(e, node)}
    />
  )
})

export default React.memo(Node)
