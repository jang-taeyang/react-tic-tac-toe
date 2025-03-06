import { useState, useEffect } from 'react';

// Function to render a single square
function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

// Function to calculate winner based on the generalized grid
function calculateWinner(squares, numRows, numCols) {
  const winningLength = Math.min(numRows, numCols);

  // Check rows and columns
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols - winningLength + 1; col++) {
      const line = squares.slice(row * numCols + col, row * numCols + col + winningLength);
      if (line.every((val) => val === line[0] && val !== null)) {
        return line[0]; // Winner found in row
      }
    }
  }

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows - winningLength + 1; row++) {
      const line = [];
      for (let i = 0; i < winningLength; i++) {
        line.push(squares[(row + i) * numCols + col]);
      }
      if (line.every((val) => val === line[0] && val !== null)) {
        return line[0]; // Winner found in column
      }
    }
  }

  // Check diagonals
  for (let row = 0; row < numRows - winningLength + 1; row++) {
    for (let col = 0; col < numCols - winningLength + 1; col++) {
      const line = [];
      for (let i = 0; i < winningLength; i++) {
        line.push(squares[(row + i) * numCols + (col + i)]);
      }
      if (line.every((val) => val === line[0] && val !== null)) {
        return line[0]; // Winner found in diagonal
      }
    }
  }

  // Check reverse diagonals
  for (let row = winningLength - 1; row < numRows; row++) {
    for (let col = 0; col < numCols - winningLength + 1; col++) {
      const line = [];
      for (let i = 0; i < winningLength; i++) {
        line.push(squares[(row - i) * numCols + (col + i)]);
      }
      if (line.every((val) => val === line[0] && val !== null)) {
        return line[0]; // Winner found in reverse diagonal
      }
    }
  }

  return null; // No winner
}

function Board({ xIsNext, squares, numRows, numCols, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares, numRows, numCols) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares, numRows, numCols);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const boardRows = [];
  for (let row = 0; row < numRows; row++) {
    const rowSquares = [];
    for (let col = 0; col < numCols; col++) {
      const index = row * numCols + col;
      rowSquares.push(<Square key={index} value={squares[index]} onSquareClick={() => handleClick(index)} />);
    }
    boardRows.push(
      <div key={row} className="board-row">
        {rowSquares}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [numRows, setNumRows] = useState(3); // Default to 3x3 board
  const [numCols, setNumCols] = useState(3); // Default to 3x3 board
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  // Map the previous board to the new board size when the size changes
  function mapBoardSize(newRows, newCols) {
    const newBoard = Array(newRows * newCols).fill(null);

    // Copy values from the old board to the new board
    for (let row = 0; row < Math.min(numRows, newRows); row++) {
      for (let col = 0; col < Math.min(numCols, newCols); col++) {
        const oldIndex = row * numCols + col;
        const newIndex = row * newCols + col;
        newBoard[newIndex] = currentSquares[oldIndex];
      }
    }

    return newBoard;
  }

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function handleBoardSizeChange(rows, cols) {
    setNumRows(rows);
    setNumCols(cols);
    // Reset history for new board size and map the previous board state
    setHistory([mapBoardSize(rows, cols)]);
    setCurrentMove(0);
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
      <div className="game-info">
        <div>
          <label>Rows:</label>
          <input
            type="number"
            value={numRows}
            onChange={(e) => handleBoardSizeChange(Number(e.target.value), numCols)}
            min="3"
          />
          <label>Columns:</label>
          <input
            type="number"
            value={numCols}
            onChange={(e) => handleBoardSizeChange(numRows, Number(e.target.value))}
            min="3"
          />
        </div>
        <ol>{moves}</ol>
      </div>
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} numRows={numRows} numCols={numCols} onPlay={handlePlay} />
      </div>
    </div>
  );
}