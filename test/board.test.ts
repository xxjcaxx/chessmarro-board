import { describe, expect, it } from "vitest";

import * as Board from "../src/board";

describe("generateArrayBoard ", () => {
  it("generateArrayBoard should generate a 8x8 board", () => {
    expect(Board.generateArrayBoard().length).toEqual(8);
    expect(Board.generateArrayBoard().every(row => row.length === 8)).toBe(
      true
    );
  });
});

describe("setFen ", () => {
  const result = Board.setFen(
    "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R"
  );
  // console.log(result);

  it("setFen should return a 8x8 board with fen position just board", () => {
    expect(result.length).toEqual(8);
    expect(result.every(row => row.length === 8)).toBe(true);
    expect(result.flat().join("")).toBe(
      "r0bqkbnrpppp0ppp00n000000B00p0000000P00000000N00PPPP0PPPRNBQK00R"
    );
  });

  const result2 = Board.setFen(
    "4R3/1k6/1p2P1p1/p7/4r3/1P1r4/1K6/2R5 w - - 0 0"
  );
  it("setFen should return a 8x8 board with fen position full", () => {
    expect(result2.flat().join("")).toBe(
      "0000R0000k0000000p00P0p0p00000000000r0000P0r00000K00000000R00000"
    );
  });
});

describe("setStartPosition ", () => {
  const initialBoard = Board.generateArrayBoard();
  const result = Board.setStartPosition(initialBoard);
  it("setStartPosition should return a 8x8 board copy to start position", () => {
    expect(Board.setStartPosition(initialBoard).length).toEqual(8);
    expect(
      Board.setStartPosition(initialBoard).every(row => row.length === 8)
    ).toBe(true);
    expect(result[0].join("")).toBe("rnbqkbnr");
    expect(result[1].join("")).toBe("pppppppp");
    expect(result[6].join("")).toBe("PPPPPPPP");
    expect(result[7].join("")).toBe("RNBQKBNR");
    expect(
      [...result[2], ...result[3], ...result[4], ...result[5]].join("")
    ).toBe("00000000000000000000000000000000");
    expect(initialBoard).not.toBe(result);
  });
});

describe("getFen ", () => {
  const initialBoard = Board.generateArrayBoard();
  const board = Board.setStartPosition(initialBoard);
  const result = Board.getFen(board);
  const board2 = Board.setFen(
    "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R"
  );
  const result2 = Board.getFen(board2);
  it("getFen should return string", () => {
    expect(typeof result).toBe("string");
  });
  it("getFen should return fen1", () => {
    expect(result).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  });
  it("getFen should return fen2", () => {
    expect(result2).toBe(
      "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R"
    );
  });
});

describe("movePiece ", () => {
  const board = Board.setFen(
    "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R"
  );
  const result = Board.movePiece(board)([0, 0], [3, 0]);
  it("movePiece should return a Board", () => {
    expect(result.length).toEqual(8);
    expect(result.every(row => row.length === 8)).toBe(true);
  });
  it("movePiece should move the piece", () => {
    expect(result[0][0]).toBe(0);
    expect(result[3][0]).toBe("r");
  });
  it("movePiece should eat a piece", () => {
    const result2 = Board.movePiece(board)([0, 2], [6, 0]);
    expect(result2[2][0]).toBe(0);
    expect(result2[6][0]).toBe("b");
  });
  it("movePiece should return a valid board", () => {
    expect(result.flat().join("")).toBe(
      "00bqkbnrpppp0ppp00n00000rB00p0000000P00000000N00PPPP0PPPRNBQK00R"
    );
  });
});
