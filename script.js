class TicTacToe {
    constructor() {
        this.currentPlayer = 'X';
        this.gameBoard = Array(9).fill('');
        this.gameActive = true;
        this.gameMode = 'computer';
        this.difficulty = 'medium';
        this.soundEnabled = true;
        
        // Statistics
        this.stats = this.loadStats();
        this.currentStreak = 0;
        
        this.initializeDOM();
        this.initializeGame();
        this.createParticles();
    }

    loadStats() {
        const defaultStats = {
            scoreX: 0,
            scoreO: 0,
            scoreDraw: 0,
            totalGames: 0,
            bestStreak: 0
        };
        
        try {
            const saved = JSON.parse(localStorage.getItem('ticTacToeStats') || '{}');
            return { ...defaultStats, ...saved };
        } catch {
            return defaultStats;
        }
    }

    saveStats() {
        try {
            localStorage.setItem('ticTacToeStats', JSON.stringify(this.stats));
        } catch (e) {
            // Fallback if localStorage is not available
            console.log('Stats not saved - localStorage unavailable');
        }
    }

    initializeDOM() {
        this.board = document.getElementById('board');
        this.status = document.getElementById('status');
        this.gameModeSelect = document.getElementById('gameMode');
        this.difficultySelect = document.getElementById('difficulty');
        this.newGameBtn = document.getElementById('newGame');
        this.resetStatsBtn = document.getElementById('resetStats');
        this.soundToggle = document.getElementById('soundToggle');

        // Score elements
        this.scoreXEl = document.getElementById('scoreX');
        this.scoreOEl = document.getElementById('scoreO');
        this.scoreDrawEl = document.getElementById('scoreDraw');
        this.totalGamesEl = document.getElementById('totalGames');
        this.winRateEl = document.getElementById('winRate');
        this.bestStreakEl = document.getElementById('bestStreak');

        // Event listeners
        this.gameModeSelect.addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.initializeGame();
        });

        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });

        this.newGameBtn.addEventListener('click', () => this.initializeGame());
        this.resetStatsBtn.addEventListener('click', () => this.resetStats());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 6}s`;
            particle.style.animationDuration = `${6 + Math.random() * 4}s`;

            particlesContainer.appendChild(particle);
        }
    }

    initializeGame() {
        this.currentPlayer = 'X';
        this.gameBoard = Array(9).fill('');
        this.gameActive = true;

        this.createBoard();
        this.updateStatus('Player X\'s Turn');
        this.updateDisplay();
    }

    createBoard() {
        this.board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.addEventListener('click', (e) => this.handleCellClick(e));
            this.board.appendChild(cell);
        }
    }

    handleCellClick(e) {
        const cellIndex = parseInt(e.target.dataset.index);
        
        if (this.gameBoard[cellIndex] !== '' || !this.gameActive) {
            return;
        }

        if (this.gameMode === 'computer' && this.currentPlayer === 'O') {
            return;
        }

        this.makeMove(cellIndex, this.currentPlayer);
    }

    makeMove(index, player) {
        this.gameBoard[index] = player;
        const cell = this.board.children[index];
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        
        this.playSound('move');

        if (this.checkWin()) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.switchPlayer();
            
            if (this.gameMode === 'computer' && this.currentPlayer === 'O' && this.gameActive) {
                setTimeout(() => this.computerMove(), 500);
            }
        }
    }

    computerMove() {
        if (!this.gameActive) return;

        let move;
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getHardMove();
                break;
            case 'impossible':
                move = this.getMinimaxMove();
                break;
        }

        if (move !== null) {
            this.makeMove(move, 'O');
        }
    }

    getRandomMove() {
        const availableMoves = this.gameBoard
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : null;
    }

    getMediumMove() {
        // Try to win
        let move = this.findWinningMove('O');
        if (move !== null) return move;

        // Try to block
        move = this.findWinningMove('X');
        if (move !== null) return move;

        // Random move
        return this.getRandomMove();
    }

    getHardMove() {
        // Try to win
        let move = this.findWinningMove('O');
        if (move !== null) return move;

        // Try to block
        move = this.findWinningMove('X');
        if (move !== null) return move;

        // Strategic moves
        const center = 4;
        if (this.gameBoard[center] === '') return center;

        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.gameBoard[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        return this.getRandomMove();
    }

    getMinimaxMove() {
        const bestMove = this.minimax(this.gameBoard, 'O');
        return bestMove.index;
    }

    minimax(board, player) {
        const availableMoves = board.map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);

        // Terminal states
        if (this.checkWinForBoard(board, 'X')) return { score: -10 };
        if (this.checkWinForBoard(board, 'O')) return { score: 10 };
        if (availableMoves.length === 0) return { score: 0 };

        const moves = [];

        for (let i = 0; i < availableMoves.length; i++) {
            const move = {};
            move.index = availableMoves[i];

            board[availableMoves[i]] = player;

            if (player === 'O') {
                const result = this.minimax(board, 'X');
                move.score = result.score;
            } else {
                const result = this.minimax(board, 'O');
                move.score = result.score;
            }

            board[availableMoves[i]] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === 'O') {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    findWinningMove(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.gameBoard[a] === player && this.gameBoard[b] === player && this.gameBoard[c] === '') return c;
            if (this.gameBoard[a] === player && this.gameBoard[c] === player && this.gameBoard[b] === '') return b;
            if (this.gameBoard[b] === player && this.gameBoard[c] === player && this.gameBoard[a] === '') return a;
        }
        return null;
    }

    checkWin() {
        return this.checkWinForBoard(this.gameBoard, this.currentPlayer);
    }

    checkWinForBoard(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        return winPatterns.some(pattern => {
            return pattern.every(index => board[index] === player);
        });
    }

    checkDraw() {
        return !this.gameBoard.includes('');
    }

    handleWin() {
        this.gameActive = false;
        
        // Update statistics
        if (this.currentPlayer === 'X') {
            this.stats.scoreX++;
            this.currentStreak++;
            this.stats.bestStreak = Math.max(this.stats.bestStreak, this.currentStreak);
        } else {
            this.stats.scoreO++;
            this.currentStreak = 0;
        }
        this.stats.totalGames++;

        this.highlightWinningCells();
        this.updateStatus(`Player ${this.currentPlayer} Wins! 🎉`, 'winner');
        this.updateDisplay();
        this.saveStats();
        this.playSound('win');
    }

    handleDraw() {
        this.gameActive = false;
        this.stats.scoreDraw++;
        this.stats.totalGames++;
        this.currentStreak = 0;
        
        this.updateStatus('It\'s a Draw! 🤝', 'draw');
        this.updateDisplay();
        this.saveStats();
        this.playSound('draw');
    }

    highlightWinningCells() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (let pattern of winPatterns) {
            if (pattern.every(index => this.gameBoard[index] === this.currentPlayer)) {
                pattern.forEach(index => {
                    this.board.children[index].classList.add('winning');
                });
                break;
            }
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        
        if (this.gameMode === 'computer') {
            this.updateStatus(this.currentPlayer === 'X' ? 'Your Turn' : 'Computer Thinking...');
        } else {
            this.updateStatus(`Player ${this.currentPlayer}'s Turn`);
        }
    }

    updateStatus(message, className = '') {
        this.status.textContent = message;
        this.status.className = `status ${className}`;
    }

    updateDisplay() {
        this.scoreXEl.textContent = this.stats.scoreX;
        this.scoreOEl.textContent = this.stats.scoreO;
        this.scoreDrawEl.textContent = this.stats.scoreDraw;
        this.totalGamesEl.textContent = this.stats.totalGames;
        
        const winRate = this.stats.totalGames > 0 
            ? Math.round((this.stats.scoreX / this.stats.totalGames) * 100)
            : 0;
        this.winRateEl.textContent = `${winRate}%`;
        this.bestStreakEl.textContent = this.stats.bestStreak;
    }

    resetStats() {
        this.stats = {
            scoreX: 0,
            scoreO: 0,
            scoreDraw: 0,
            totalGames: 0,
            bestStreak: 0
        };
        this.currentStreak = 0;
        this.updateDisplay();
        this.saveStats();
        this.playSound('reset');
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        this.soundToggle.classList.toggle('sound-off', !this.soundEnabled);
    }

    playSound(type) {
        if (!this.soundEnabled) return;

        // Create audio context and play simple tones
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            let frequency, duration;
            switch (type) {
                case 'move':
                    frequency = 800;
                    duration = 0.1;
                    break;
                case 'win':
                    frequency = 1200;
                    duration = 0.3;
                    break;
                case 'draw':
                    frequency = 600;
                    duration = 0.2;
                    break;
                case 'reset':
                    frequency = 400;
                    duration = 0.1;
                    break;
                default:
                    return;
            }

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Fallback if Web Audio API is not supported
            console.log('Sound not supported');
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
