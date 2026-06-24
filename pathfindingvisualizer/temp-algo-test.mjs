import bfs from './src/algorithms/bfs.js'
import dfs from './src/algorithms/dfs.js'
import dijkstra from './src/algorithms/dijkstra.js'
const ROWS=20, COLS=50
const start={row:10,col:5}, end={row:10,col:45}
const grid=[]
for(let r=0;r<ROWS;r++){
  const row=[]
  for(let c=0;c<COLS;c++) row.push({row:r,col:c,isWall:false,weight:1,previousNode:null})
  grid.push(row)
}
const s=grid[start.row][start.col]
const e=grid[end.row][end.col]
const res1=bfs(grid,s,e)
const res2=dijkstra(grid,s,e)
const res3=dfs(grid,s,e)
console.log('BFS path', res1.shortestPath.length, 'visited', res1.visitedNodesInOrder.length)
console.log('Dijkstra path', res2.shortestPath.length, 'visited', res2.visitedNodesInOrder.length)
console.log('DFS path', res3.shortestPath.length, 'visited', res3.visitedNodesInOrder.length)
