import { useState, useEffect } from 'react';

// Function to calculate the winner (already provided in the original code)
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// Minimax algorithm to evaluate the best move
function minimax(board, depth, isMaximizing) {
  const winner = calculateWinner(board);
  if (winner) {
    return winner === 'X' ? 1 : -1; // Return 1 for X win, -1 for O win
  }
  if (board.every(cell => cell !== null)) {
    return 0; // Draw if board is full
  }

  let bestScore = isMaximizing ? -Infinity : Infinity;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = isMaximizing ? 'X' : 'O'; // Make a move
      const score = minimax(board, depth + 1, !isMaximizing); // Recursively evaluate the next move
      board[i] = null; // Undo the move (backtrack)

      if (isMaximizing) {
        bestScore = Math.max(score, bestScore); // Maximizing for 'X'
      } else {
        bestScore = Math.min(score, bestScore); // Minimizing for 'O'
      }
    }
  }
  return bestScore;
}

// Function to find the best move using the minimax algorithm
function findBestMove(squares, isMaximizing) {
  const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7]; // Move priority order: center, corners, edges
  let bestMove = -1;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Step 1: Check for a winning move for O (if isMaximizing is false) or blocking move for X (if isMaximizing is true)
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      squares[i] = isMaximizing ? 'X' : 'O'; // Try the move
      if (calculateWinner(squares) === (isMaximizing ? 'X' : 'O')) {
        squares[i] = null; // Undo the move
        return i; // If the move wins, return immediately
      }
      squares[i] = null; // Undo the move
    }
  }

  // Step 2: Use minimax to evaluate the best move
  for (let i = 0; i < moveOrder.length; i++) {
    const idx = moveOrder[i];
    if (squares[idx] === null) {
      squares[idx] = isMaximizing ? 'X' : 'O'; // Try the move
      const score = minimax(squares, 0, !isMaximizing); // Evaluate the move with minimax
      squares[idx] = null; // Undo the move

      if (isMaximizing && score > bestScore) {
        bestScore = score;
        bestMove = idx;
      } else if (!isMaximizing && score < bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }
  }

  return bestMove; // Return the index of the best move
}

// Function to render a single square
function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

// Board component to render the Tic-Tac-Toe grid
function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

// Main Game component
export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [score, setScore] = useState(null); // Score state
  const [bestScore, setBestScore] = useState(null); // Best score state
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  useEffect(() => {
    const winner = calculateWinner(currentSquares);
    if (winner) {
      setScore(winner === 'X' ? 1 : -1); // Display score when the game ends
      setBestScore(winner === 'X' ? 1 : -1); // Update bestScore based on winner
    } else if (currentSquares.every(cell => cell !== null)) {
      setScore(0); // Draw condition
      setBestScore(0); // Set bestScore to 0 for a draw
    }
  }, [currentSquares]); // Update score only when the squares change

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // AI logic to automatically make a move
  if (!xIsNext) { // Assume AI is 'O'
    const bestMove = findBestMove(currentSquares, false); // 'false' because it's 'O' turn
    const nextSquares = currentSquares.slice();
    nextSquares[bestMove] = 'O';
    handlePlay(nextSquares);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
        <div className="score">
          <p>Score: {score !== null && score}</p> {/* Only show score if game has ended */}
          <p>Best Score: {bestScore !== null && bestScore}</p> {/* Only show best score if game has ended */}
        </div>
      </div>
    </div>
  );
}