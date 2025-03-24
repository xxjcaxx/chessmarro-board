import { initChessmarroBoard, setStartPosition } from "chessmarro-board";

document.addEventListener("DOMContentLoaded", () => {
  const board = setStartPosition();
  console.log(board);
  initChessmarroBoard();

  const divApp = document.querySelector("#javascript");
  const boardComponent = document.createElement("chessmarro-board");
  boardComponent.board = board;
  divApp.innerHTML = `<h2>Javascript Chessmarro Board</h2>`;
  divApp.append(boardComponent);
  document.addEventListener("chessmarro-move", event => {
    console.log(event);
  });
  document.querySelector("#buttonMoveTest").addEventListener("click", () => {
    document.querySelector("#htmlboard").movePiece([4, 7], [4, 5], 1);
  });
});
