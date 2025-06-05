import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Settings } from 'lucide-react';

interface MiniGameProps {
  gameType: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const DIFFICULTY_LEVELS = {
  easy: { pairs: 4, timeLimit: 3000 },
  medium: { pairs: 6, timeLimit: 2000 },
  hard: { pairs: 8, timeLimit: 1000 }
};

const MemoryGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      const emojis = ['🧠', '🎮', '🎯', '⭐', '🎨', '🎪', '🎭', '🎪'];
      const selectedEmojis = emojis.slice(0, DIFFICULTY_LEVELS[difficulty].pairs);
      const initialCards = [...selectedEmojis, ...selectedEmojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({
          id: index,
          value: emoji,
          isFlipped: false,
          isMatched: false,
        }));
      setCards(initialCards);
      setMatchedPairs(0);
      setFlippedCards([]);
    }
  }, [difficulty, isPlaying]);

  useEffect(() => {
    if (matchedPairs === DIFFICULTY_LEVELS[difficulty].pairs) {
      setTimeout(onWin, 500);
    }
  }, [matchedPairs, onWin, difficulty]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    
    const newCards = cards.map(card =>
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    
    setFlippedCards([...flippedCards, id]);

    if (flippedCards.length === 1) {
      const firstCard = cards.find(card => card.id === flippedCards[0]);
      const secondCard = cards.find(card => card.id === id);

      if (firstCard?.value === secondCard?.value) {
        setMatchedPairs(prev => prev + 1);
        setCards(cards.map(card =>
          card.id === flippedCards[0] || card.id === id
            ? { ...card, isMatched: true }
            : card
        ));
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(cards.map(card =>
            card.id === flippedCards[0] || card.id === id
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, DIFFICULTY_LEVELS[difficulty].timeLimit);
      }
    }
  };

  if (!isPlaying) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">Select Difficulty</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setDifficulty('easy');
              setIsPlaying(true);
            }}
            className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            Easy
          </button>
          <button
            onClick={() => {
              setDifficulty('medium');
              setIsPlaying(true);
            }}
            className="p-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
          >
            Medium
          </button>
          <button
            onClick={() => {
              setDifficulty('hard');
              setIsPlaying(true);
            }}
            className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Hard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
        <button
          onClick={() => setIsPlaying(false)}
          className="text-gray-600 hover:text-gray-800"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map(card => (
          <motion.button
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !card.isFlipped && !card.isMatched && handleCardClick(card.id)}
            className={`w-16 h-16 flex items-center justify-center text-2xl rounded-lg transition-all duration-300 ${
              card.isFlipped || card.isMatched
                ? 'bg-purple-100 rotate-0'
                : 'bg-gray-200 rotate-180'
            }`}
            disabled={card.isFlipped || card.isMatched}
          >
            {(card.isFlipped || card.isMatched) && card.value}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const Game2048: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [board, setBoard] = useState<number[][]>([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isPlaying, setIsPlaying] = useState(false);

  const difficultyConfig = {
    easy: { target: 16, spawnChance: 0.8 },
    medium: { target: 32, spawnChance: 0.9 },
    hard: { target: 64, spawnChance: 0.95 }
  };

  const getEmptyTiles = (currentBoard: number[][]) => {
    const empty: [number, number][] = [];
    currentBoard.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === 0) empty.push([i, j]);
      });
    });
    return empty;
  };

  const addNewTile = useCallback((currentBoard: number[][]) => {
    const empty = getEmptyTiles(currentBoard);
    if (empty.length === 0) return currentBoard;

    const [row, col] = empty[Math.floor(Math.random() * empty.length)];
    const newBoard = currentBoard.map(r => [...r]);
    newBoard[row][col] = Math.random() < difficultyConfig[difficulty].spawnChance ? 2 : 4;
    return newBoard;
  }, [difficulty]);

  const initializeBoard = useCallback(() => {
    let newBoard = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    newBoard = addNewTile(newBoard);
    newBoard = addNewTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameWon(false);
  }, [addNewTile]);

  useEffect(() => {
    if (isPlaying) {
      initializeBoard();
    }
  }, [isPlaying, initializeBoard]);

  const compress = (board: number[][]) => {
    const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      let pos = 0;
      for (let j = 0; j < 4; j++) {
        if (board[i][j] !== 0) {
          newBoard[i][pos] = board[i][j];
          pos++;
        }
      }
    }
    return newBoard;
  };

  const merge = (board: number[][], updateScore = true) => {
    let newScore = score;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] !== 0 && board[i][j] === board[i][j + 1]) {
          board[i][j] *= 2;
          if (updateScore) newScore += board[i][j];
          if (board[i][j] >= difficultyConfig[difficulty].target) setGameWon(true);
          board[i][j + 1] = 0;
        }
      }
    }
    if (updateScore) setScore(newScore);
    return board;
  };

  const moveLeft = (currentBoard: number[][]) => {
    let newBoard = currentBoard.map(row => [...row]);
    newBoard = compress(newBoard);
    newBoard = merge(newBoard);
    newBoard = compress(newBoard);
    return newBoard;
  };

  const moveRight = (currentBoard: number[][]) => {
    let newBoard = currentBoard.map(row => [...row].reverse());
    newBoard = compress(newBoard);
    newBoard = merge(newBoard);
    newBoard = compress(newBoard);
    newBoard = newBoard.map(row => [...row].reverse());
    return newBoard;
  };

  const moveUp = (currentBoard: number[][]) => {
    let rotated = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        rotated[i][j] = currentBoard[j][i];
      }
    }
    rotated = moveLeft(rotated);
    let newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        newBoard[j][i] = rotated[i][j];
      }
    }
    return newBoard;
  };

  const moveDown = (currentBoard: number[][]) => {
    let rotated = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        rotated[i][j] = currentBoard[j][i];
      }
    }
    rotated = moveRight(rotated);
    let newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        newBoard[j][i] = rotated[i][j];
      }
    }
    return newBoard;
  };

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    const oldBoard = JSON.stringify(board);
    let newBoard = board.map(row => [...row]);

    switch (direction) {
      case 'left':
        newBoard = moveLeft(newBoard);
        break;
      case 'right':
        newBoard = moveRight(newBoard);
        break;
      case 'up':
        newBoard = moveUp(newBoard);
        break;
      case 'down':
        newBoard = moveDown(newBoard);
        break;
    }

    if (oldBoard !== JSON.stringify(newBoard)) {
      newBoard = addNewTile(newBoard);
      setBoard(newBoard);
    }
  };

  useEffect(() => {
    if (gameWon) {
      setTimeout(onWin, 500);
    }
  }, [gameWon, onWin]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowUp':
          move('up');
          break;
        case 'ArrowDown':
          move('down');
          break;
        case 'ArrowLeft':
          move('left');
          break;
        case 'ArrowRight':
          move('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [board, isPlaying]);

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      2: 'bg-blue-100 text-blue-800',
      4: 'bg-blue-200 text-blue-800',
      8: 'bg-purple-200 text-purple-800',
      16: 'bg-purple-300 text-purple-800',
      32: 'bg-purple-500 text-white',
      64: 'bg-purple-600 text-white',
      128: 'bg-purple-700 text-white',
      256: 'bg-purple-800 text-white',
      512: 'bg-purple-900 text-white',
      1024: 'bg-indigo-700 text-white',
      2048: 'bg-indigo-900 text-white'
    };
    return colors[value] || 'bg-gray-100';
  };

  if (!isPlaying) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">Select Difficulty</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setDifficulty('easy');
              setIsPlaying(true);
            }}
            className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            Easy (16)
          </button>
          <button
            onClick={() => {
              setDifficulty('medium');
              setIsPlaying(true);
            }}
            className="p-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
          >
            Medium (32)
          </button>
          <button
            onClick={() => {
              setDifficulty('hard');
              setIsPlaying(true);
            }}
            className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Hard (64)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-bold">Score: {score}</div>
        <div className="flex gap-2">
          <button
            onClick={initializeBoard}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Reset
          </button>
          <button
            onClick={() => setIsPlaying(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="grid grid-cols-4 gap-2">
          {board.map((row, i) => 
            row.map((cell, j) => (
              <motion.div
                key={`${i}-${j}`}
                initial={{ scale: cell ? 0 : 1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold text-lg
                  ${cell ? getTileColor(cell) : 'bg-gray-50'}`}
              >
                {cell || ''}
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 max-w-[150px] mx-auto">
        <div />
        <button
          onClick={() => move('up')}
          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex justify-center"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />
        <button
          onClick={() => move('left')}
          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex justify-center"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div />
        <button
          onClick={() => move('right')}
          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex justify-center"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div />
        <button
          onClick={() => move('down')}
          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex justify-center"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <div />
      </div>
    </div>
  );
};

const ReactionGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'clicked'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isPlaying, setIsPlaying] = useState(false);

  const difficultyConfig = {
    easy: { targetTime: 1500 },
    medium: { targetTime: 1000 },
    hard: { targetTime: 500 }
  };

  useEffect(() => {
    if (isPlaying && gameState === 'waiting') {
      const timeout = setTimeout(() => {
        setGameState('ready');
        setStartTime(Date.now());
      }, Math.random() * 2000 + 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameState, isPlaying]);

  const handleClick = () => {
    if (gameState === 'ready') {
      const endTime = Date.now();
      const reaction = endTime - startTime;
      setReactionTime(reaction);
      setGameState('clicked');
      if (reaction < difficultyConfig[difficulty].targetTime) {
        setTimeout(onWin, 1000);
      } else {
        setTimeout(() => setGameState('waiting'), 1000);
      }
    } else if (gameState === 'waiting') {
      setGameState('waiting');
    }
  };

  if (!isPlaying) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">Select Difficulty</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setDifficulty('easy');
              setIsPlaying(true);
            }}
            className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            Easy
          </button>
          <button
            onClick={() => {
              setDifficulty('medium');
              setIsPlaying(true);
            }}
            className="p-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
          >
            Medium
          </button>
          <button
            onClick={() => {
              setDifficulty('hard');
              setIsPlaying(true);
            }}
            className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Hard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
        <button
          onClick={() => setIsPlaying(false)}
          className="text-gray-600 hover:text-gray-800"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`w-full h-32 rounded-lg transition-colors ${
          gameState === 'ready'
            ? 'bg-green-500 text-white'
            : gameState === 'clicked'
            ? 'bg-purple-100'
            : 'bg-gray-200'
        }`}
      >
        {gameState === 'waiting' && 'Wait for green...'}
        {gameState === 'ready' && 'Click now!'}
        {gameState === 'clicked' && `${reactionTime}ms`}
      </motion.button>
      
      <p className="text-sm text-gray-600">
        {gameState === 'clicked' && reactionTime < difficultyConfig[difficulty].targetTime
          ? 'Great reaction time!'
          : `Target: ${difficultyConfig[difficulty].targetTime}ms`}
      </p>
    </div>
  );
};

export const MiniGame: React.FC<MiniGameProps> = ({ gameType, onComplete, onCancel }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Complete the Challenge</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-center">
        {gameType === 'memory' && <MemoryGame onWin={onComplete} />}
        {gameType === '2048' && <Game2048 onWin={onComplete} />}
        {gameType === 'reaction' && <ReactionGame onWin={onComplete} />}
      </div>
    </div>
  );
};