// Game state variables
let currentPlayer = 'X'; // Human is X, Computer is O
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let againstComputer = true; // Set to false for 2-player game

// DOM elements
const board = document.getElementById('board');
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restart');

// Winning conditions
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

// Initialize the game
function initializeGame() {
    // Create cells for the board
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }
    
    // Reset game state
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    statusDisplay.textContent = 'Your turn (X)';
    statusDisplay.classList.remove('winner');
    
    // Remove any existing winning highlights
    document.querySelectorAll('.winning-cell').forEach(cell => {
        cell.classList.remove('winning-cell');
    });
}

// Handle cell click
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
    
    // If cell is already filled or game is not active, ignore the click
    if (gameBoard[clickedCellIndex] !== '' || !gameActive || currentPlayer !== 'X') {
        return;
    }
    
    // Update game state and UI
    gameBoard[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    
    // Check for win or draw
    checkResult();
    
    // If playing against computer and game is still active, computer makes move
    if (againstComputer && gameActive && currentPlayer === 'O') {
        setTimeout(computerMove, 500); // Delay for better UX
    }
}

// Computer's move (simple AI)
function computerMove() {
    if (!gameActive) return;
    
    // Simple AI: Try to win, then block, then random move
    let move = findWinningMove('O') || // Try to win
               findWinningMove('X') || // Block player
               findRandomMove();       // Random move
    
    if (move !== null) {
        gameBoard[move] = 'O';
        const cells = document.querySelectorAll('.cell');
        cells[move].textContent = 'O';
        checkResult();
    }
}

// Helper function to find a winning move
function findWinningMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        // Check if two in a row and third is empty
        if (gameBoard[a] === player && gameBoard[b] === player && gameBoard[c] === '') return c;
        if (gameBoard[a] === player && gameBoard[c] === player && gameBoard[b] === '') return b;
        if (gameBoard[b] === player && gameBoard[c] === player && gameBoard[a] === '') return a;
    }
    return null;
}

// Helper function to find a random valid move
function findRandomMove() {
    const availableMoves = gameBoard
        .map((cell, index) => cell === '' ? index : null)
        .filter(val => val !== null);
    
    return availableMoves.length > 0 
        ? availableMoves[Math.floor(Math.random() * availableMoves.length)] 
        : null;
}

// Check for win or draw
function checkResult() {
    let roundWon = false;
    let winningCombo = null;
    
    // Check all winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        
        if (gameBoard[a] === '' || gameBoard[b] === '' || gameBoard[c] === '') {
            continue;
        }
        
        if (gameBoard[a] === gameBoard[b] && gameBoard[b] === gameBoard[c]) {
            roundWon = true;
            winningCombo = winningConditions[i];
            break;
        }
    }
    
    // If there's a winner
    if (roundWon) {
        // Highlight winning cells
        const cells = document.querySelectorAll('.cell');
        winningCombo.forEach(index => cells[index].classList.add('winning-cell'));
        
        // Add winner class to status display
        statusDisplay.classList.add('winner');
        statusDisplay.textContent = `${currentPlayer === 'X' ? 'You win!' : 'Computer wins!'}`;
        gameActive = false;
        return;
    }
    
    // If it's a draw
    if (!gameBoard.includes('')) {
        statusDisplay.textContent = `Game ended in a draw!`;
        gameActive = false;
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = currentPlayer === 'X' ? 'Your turn (X)' : 'Computer thinking...';
}

// Event listener for restart button
restartButton.addEventListener('click', initializeGame);

// Initialize the game when the page loads
window.addEventListener('load', initializeGame);