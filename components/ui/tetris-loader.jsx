'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

// UK Brand Lover Theme Luxury Tetris Pieces
const TETRIS_PIECES = [
  // I-piece (Straight 4) - Brand Plum
  { shape: [[1, 1, 1, 1]], color: 'bg-[#6C306E]' },
  // O-piece (Square 2x2) - Royal Gold
  { shape: [[1, 1], [1, 1]], color: 'bg-[#D8B56D]' },
  // T-piece - Deep Velvet Plum
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-[#3A0C38]' },
  // L-piece - Radiant Orchid
  { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-[#8E448A]' },
  // S-piece - Warm Amber Gold
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-[#C69A45]' },
  // Z-piece - Imperial UK Black-Plum
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-[#241224]' },
  // J-piece - Elegant Berry Rose
  { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-[#B35688]' },
]

export default function TetrisLoading({
  size = 'sm',
  speed = 'fast',
  showLoadingText = true,
  loadingText = 'Curating Authentic UK Beauty...',
  message,
  compact = false
}) {
  const displayText = message || loadingText

  // Size configurations
  const sizeConfig = {
    sm: { cellSize: 'w-2 h-2', gridWidth: 8, gridHeight: 14, padding: 'p-1' },
    md: { cellSize: 'w-2.5 h-2.5', gridWidth: 10, gridHeight: 18, padding: 'p-1.5' },
    lg: { cellSize: 'w-3.5 h-3.5', gridWidth: 10, gridHeight: 20, padding: 'p-2' }
  }

  // Speed configurations (in milliseconds)
  const speedConfig = {
    slow: 140,
    normal: 75,
    fast: 42
  }

  const effectiveSize = compact ? 'sm' : size
  const config = sizeConfig[effectiveSize] || sizeConfig.sm
  const fallSpeed = speedConfig[speed] || speedConfig.fast

  const [grid, setGrid] = useState(() =>
    Array(config.gridHeight).fill(null).map(() => 
      Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' }))
    )
  )
  const [fallingPiece, setFallingPiece] = useState(null)
  const [isClearing, setIsClearing] = useState(false)
  const frameRef = useRef()
  const lastUpdateRef = useRef(0)

  // Rotate a shape 90 degrees clockwise
  const rotateShape = useCallback((shape) => {
    const rows = shape.length
    const cols = shape[0].length
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = shape[i][j]
      }
    }

    return rotated
  }, [])

  // Create a new random piece with website theme color
  const createNewPiece = useCallback(() => {
    const pieceData = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)]
    let shape = pieceData.shape
    
    // Random rotations
    const rotations = Math.floor(Math.random() * 4)
    for (let i = 0; i < rotations; i++) {
      shape = rotateShape(shape)
    }

    const maxX = config.gridWidth - shape[0].length
    const x = Math.floor(Math.random() * (maxX + 1))

    return {
      shape,
      color: pieceData.color,
      x,
      y: -shape.length,
      id: Math.random().toString(36).substr(2, 9),
    }
  }, [rotateShape, config.gridWidth])

  // Check if a piece can be placed at a position
  const canPlacePiece = useCallback((piece, newX, newY) => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const gridX = newX + col
          const gridY = newY + row

          // Check boundaries
          if (gridX < 0 || gridX >= config.gridWidth || gridY >= config.gridHeight) {
            return false
          }

          // Check collision with placed pieces
          if (gridY >= 0 && grid[gridY] && grid[gridY][gridX]?.filled) {
            return false
          }
        }
      }
    }
    return true
  }, [grid, config.gridWidth, config.gridHeight])

  // Place a piece on the grid
  const placePiece = useCallback((piece) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })))

      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const gridX = piece.x + col
            const gridY = piece.y + row

            if (gridY >= 0 && gridY < config.gridHeight && gridX >= 0 && gridX < config.gridWidth) {
              newGrid[gridY][gridX] = { filled: true, color: piece.color }
            }
          }
        }
      }

      return newGrid
    })
  }, [config.gridHeight, config.gridWidth])

  // Clear completed lines with gold-pulse animation
  const clearFullLines = useCallback(() => {
    setGrid(prevGrid => {
      const linesToClear = []
      
      // Find full lines
      prevGrid.forEach((row, index) => {
        if (row.every(cell => cell.filled)) {
          linesToClear.push(index)
        }
      })

      if (linesToClear.length > 0) {
        setIsClearing(true)
        
        // Mark lines for golden clearing animation
        const newGrid = prevGrid.map((row, rowIndex) => {
          if (linesToClear.includes(rowIndex)) {
            return row.map(cell => ({ ...cell, color: 'bg-[#D8B56D] animate-pulse opacity-90' }))
          }
          return row
        })

        // Actually clear lines after animation
        setTimeout(() => {
          setGrid(currentGrid => {
            const filteredGrid = currentGrid.filter((_, index) => !linesToClear.includes(index))
            const emptyRows = Array(linesToClear.length).fill(null).map(() => 
              Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' }))
            )
            setIsClearing(false)
            return [...emptyRows, ...filteredGrid]
          })
        }, 180)

        return newGrid
      }

      return prevGrid
    })
  }, [config.gridWidth])

  // Check if we need to reset (grid getting too full)
  const checkAndReset = useCallback(() => {
    const topRows = grid.slice(0, 3)
    const needsReset = topRows.some(row => row.filter(cell => cell.filled).length > config.gridWidth * 0.6)

    if (needsReset) {
      setIsClearing(true)
      setTimeout(() => {
        setGrid(Array(config.gridHeight).fill(null).map(() => 
          Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' }))
        ))
        setFallingPiece(null)
        setIsClearing(false)
      }, 350)
      return true
    }
    return false
  }, [grid, config.gridWidth, config.gridHeight])

  // Game loop using requestAnimationFrame
  useEffect(() => {
    let active = true

    const gameLoop = (timestamp) => {
      if (!active) return

      if (timestamp - lastUpdateRef.current >= fallSpeed) {
        lastUpdateRef.current = timestamp

        if (!isClearing && !checkAndReset()) {
          setFallingPiece(prevPiece => {
            if (!prevPiece) {
              return createNewPiece()
            }

            const newY = prevPiece.y + 1

            if (canPlacePiece(prevPiece, prevPiece.x, newY)) {
              return { ...prevPiece, y: newY }
            } else {
              // Place piece and create new one
              placePiece(prevPiece)
              setTimeout(clearFullLines, 40)
              return createNewPiece()
            }
          })
        }
      }

      frameRef.current = requestAnimationFrame(gameLoop)
    }

    frameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      active = false
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [canPlacePiece, createNewPiece, placePiece, clearFullLines, checkAndReset, isClearing, fallSpeed])

  // Render the grid
  const renderGrid = () => {
    const displayGrid = grid.map(row => row.map(cell => ({ ...cell })))

    // Add falling piece to display
    if (fallingPiece && !isClearing) {
      for (let row = 0; row < fallingPiece.shape.length; row++) {
        for (let col = 0; col < fallingPiece.shape[row].length; col++) {
          if (fallingPiece.shape[row][col]) {
            const gridX = fallingPiece.x + col
            const gridY = fallingPiece.y + row

            if (gridY >= 0 && gridY < config.gridHeight && gridX >= 0 && gridX < config.gridWidth) {
              displayGrid[gridY][gridX] = { filled: true, color: fallingPiece.color }
            }
          }
        }
      }
    }

    return displayGrid.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`${config.cellSize} border border-[#EFE0EF]/70 transition-all duration-75 rounded-[1.5px] ${
              cell.filled 
                ? `${cell.color} scale-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]` 
                : 'bg-[#FAF6FA]/80 scale-95'
            } ${isClearing && rowIndex < 3 ? 'animate-pulse' : ''}`}
          />
        ))}
      </div>
    ))
  }

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Luxury Brand Tetris Frame */}
      <div className="relative">
        {/* Soft Luxury Glow Backdrop */}
        <div className="absolute -inset-2 bg-gradient-to-r from-[#6C306E]/20 via-[#D8B56D]/20 to-[#6C306E]/20 rounded-2xl blur-md opacity-60 pointer-events-none" />

        <div className={`relative border-2 border-[#6C306E] bg-white rounded-xl shadow-[0_8px_30px_rgba(108,48,110,0.12)] ${config.padding} transition-colors`}>
          {renderGrid()}
        </div>
      </div>

      {showLoadingText && (
        <div className="text-center mt-3 space-y-0.5">
          <p className="text-[10px] font-black tracking-[0.22em] text-[#6C306E] uppercase">
            UK Brand Lover
          </p>
          <p className="text-xs font-semibold text-[#241224] tracking-wide">
            {displayText}
          </p>
        </div>
      )}
    </div>
  )
}
