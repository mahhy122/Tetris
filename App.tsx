import React, { useState, useEffect } from "react";
import "./App.css";

const ROWS = 20;
const COLS = 10;

//block list
const BLOCKS = {
  I: [
    [1, 1, 1, 1]
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
};
//typeは方宣言
type Block = number[][];
type Field = number[][];

const createField = (): Field =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

//rotate block
const rotateBlock = (block: Block): Block =>
  block[0].map((_, index) => block.map((row) => row[index]).reverse());

const App: React.FC = () => {
  // 状態管理
  const [field, setField] = useState<Field>(createField());
  const [currentBlock, setCurrentBlock] = useState<Block>(BLOCKS.T); // 初期ブロック
  const [blockPos, setBlockPos] = useState({ row: 0, col: Math.floor(COLS / 2) - 1 });
  const [isGameOver, setIsGameOver] = useState(false);

  // 衝突判定
  const isColliding = (block: Block, pos: typeof blockPos, field: Field): boolean => {
    for (let r = 0; r < block.length; r++) {
      for (let c = 0; c < block[r].length; c++) {
        if (block[r][c] !== 0) {
          const newRow = pos.row + r;
          const newCol = pos.col + c;

          if (
            newRow >= ROWS || newCol < 0 || newCol >= COLS || (newRow >= 0 && field[newRow][newCol] !== 0) // ブロック同士の衝突
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // ブロックを固定
  const fixBlock = () => {
    const newField = [...field];
    currentBlock.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== 0 && blockPos.row + r >= 0) {
          newField[blockPos.row + r][blockPos.col + c] = cell;
        }
      });
    });
    setField(newField);
  };

  // ライン削除
  const clearLines = (field: Field): Field => {
    const clearedField = field.filter((row) => row.some((cell) => cell === 0));
    const linesCleared = ROWS - clearedField.length;
    const newRows = Array.from({ length: linesCleared }, () => Array(COLS).fill(0));
    return [...newRows, ...clearedField];
  };

  // 新しいブロックを生成
  const generateNewBlock = () => {
    const blockKeys = Object.keys(BLOCKS) as (keyof typeof BLOCKS)[];
    const randomKey = blockKeys[Math.floor(Math.random() * blockKeys.length)];
    setCurrentBlock(BLOCKS[randomKey]);
    setBlockPos({ row: 0, col: Math.floor(COLS / 2) - 1 });
  };

  // ゲームの進行（タイマー）
  useEffect(() => {
    if (isGameOver) return;

    const drop = () => {
      const newPos = { row: blockPos.row + 1, col: blockPos.col };

      if (isColliding(currentBlock, newPos, field)) {
        fixBlock();
        setField((prevField) => clearLines(prevField));
        generateNewBlock();

        if (isColliding(currentBlock, { row: 0, col: Math.floor(COLS / 2) - 1 }, field)) {
          setIsGameOver(true);
        }
      } else {
        setBlockPos(newPos);
      }
    };

    const timer = setInterval(drop, 500);
    return () => clearInterval(timer);
  }, [field, blockPos, currentBlock, isGameOver]);

  // キーボード入力
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isGameOver) return;

      if (e.key === "KeyA") moveBlock(0, -1);
      if (e.key === "KeyD") moveBlock(0, 1);
      if (e.key === "KeyS") moveBlock(1, 0);
      if (e.key === "KeyW") {
        const rotatedBlock = rotateBlock(currentBlock);
        if (!isColliding(rotatedBlock, blockPos, field)) {
          setCurrentBlock(rotatedBlock);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isGameOver, currentBlock, blockPos, field]);

  const moveBlock = (rowOffset: number, colOffset: number) => {
    const newPos = { row: blockPos.row + rowOffset, col: blockPos.col + colOffset };
    if (!isColliding(currentBlock, newPos, field)) {
      setBlockPos(newPos);
    }
  };

  return (
    <div className="game">
      <h1>Tetris</h1>
      <div className="field">
        {field.map((row, r) =>
          row.map((cell, c) => (
            <div key={`${r}-${c}`} className={`cell ${cell !== 0 ? "filled" : ""}`}></div>
          ))
        )}
        {currentBlock.map((row, r) =>
          row.map((cell, c) =>
            cell !== 0 ? (
              <div
                key={`block-${r}-${c}`}
                className="cell filled block"
                style={{
                  transform: `translate(${(blockPos.col + c) * 20}px, ${(blockPos.row + r) * 20}px)`,
                }}
              ></div>
            ) : null
          )
        )}
      </div>
      {isGameOver && <h2>Failed</h2>}
    </div>
  );
};

export default App;
