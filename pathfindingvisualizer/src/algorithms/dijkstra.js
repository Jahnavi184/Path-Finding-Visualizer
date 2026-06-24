/*
  dijkstra.js — Dijkstra's algorithm implementation for weighted grids.
  Pure function: returns visited order and shortest weighted path.
*/

export default function dijkstra(grid, startNode, endNode) {
  const visitedNodesInOrder = []
  const rows = grid.length
  const cols = grid[0].length

  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity))
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false))

  dist[startNode.row][startNode.col] = 0

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

  while (true) {
    // find unvisited node with smallest dist
    let min = Infinity
    let minNode = null
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!visited[r][c] && dist[r][c] < min) {
          min = dist[r][c]
          minNode = grid[r][c]
        }
      }
    }
    if (!minNode) break
    const { row, col } = minNode
    if (minNode.isWall) { visited[row][col] = true; continue }
    visited[row][col] = true
    visitedNodesInOrder.push(minNode)
    if (row === endNode.row && col === endNode.col) break

    for (const neigh of getNeighbors(minNode)) {
      if (neigh.isWall) continue
      const alt = dist[row][col] + (neigh.weight ?? 1)
      if (alt < dist[neigh.row][neigh.col]) {
        dist[neigh.row][neigh.col] = alt
        neigh.previousNode = minNode
      }
    }
  }

  const shortestPath = []
  let curr = grid[endNode.row][endNode.col]
  if (isFinite(dist[curr.row][curr.col])) {
    while (curr) {
      shortestPath.unshift(curr)
      curr = curr.previousNode
    }
  }

  return { visitedNodesInOrder, shortestPath }
}
