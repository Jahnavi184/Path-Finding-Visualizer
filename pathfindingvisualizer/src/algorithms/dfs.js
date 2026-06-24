/*
  dfs.js — Depth First Search algorithm implementation.
  Pure function: returns traversal order but does not guarantee shortest path.
*/

export default function dfs(grid, startNode, endNode) {
  const visitedNodesInOrder = []
  const rows = grid.length
  const cols = grid[0].length
  const visited = new Set()

  const getNeighbors = (node) => {
    const { row, col } = node
    const deltas = [[-1,0],[1,0],[0,-1],[0,1]]
    const neighbors = []
    for (const [dr, dc] of deltas) {
      const r = row + dr, c = col + dc
      if (r>=0 && r<rows && c>=0 && c<cols) neighbors.push(grid[r][c])
    }
    return neighbors
  }

  function visit(node) {
    const key = `${node.row},${node.col}`
    if (visited.has(key) || node.isWall) return false
    visited.add(key)
    visitedNodesInOrder.push(node)
    if (node.row === endNode.row && node.col === endNode.col) return true
    for (const neigh of getNeighbors(node)) {
      neigh.previousNode = node
      const found = visit(neigh)
      if (found) return true
    }
    return false
  }

  const found = visit(startNode)
  const shortestPath = []
  if (found) {
    let curr = grid[endNode.row][endNode.col]
    while (curr) {
      shortestPath.unshift(curr)
      curr = curr.previousNode
    }
  }
  return { visitedNodesInOrder, shortestPath }
}
