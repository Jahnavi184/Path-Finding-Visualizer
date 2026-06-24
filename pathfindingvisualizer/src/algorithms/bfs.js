/*
  bfs.js — Breadth First Search algorithm implementation.
  Pure function: receives grid and start/end node references and
  returns { visitedNodesInOrder, shortestPath }.
*/

export default function bfs(grid, startNode, endNode) {
  const visitedNodesInOrder = []
  const queue = []
  const rows = grid.length
  const cols = grid[0].length

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

  queue.push(startNode)
  const visited = new Set()
  visited.add(`${startNode.row},${startNode.col}`)

  while (queue.length) {
    const node = queue.shift()
    visitedNodesInOrder.push(node)
    if (node.row === endNode.row && node.col === endNode.col) break
    for (const neigh of getNeighbors(node)) {
      if (neigh.isWall) continue
      const key = `${neigh.row},${neigh.col}`
      if (!visited.has(key)) {
        visited.add(key)
        neigh.previousNode = node
        queue.push(neigh)
      }
    }
  }

  // reconstruct shortest path
  const shortestPath = []
  let curr = grid[endNode.row][endNode.col]
  if (visited.has(`${curr.row},${curr.col}`)) {
    while (curr) {
      shortestPath.unshift(curr)
      curr = curr.previousNode
    }
  }

  return { visitedNodesInOrder, shortestPath }
}
