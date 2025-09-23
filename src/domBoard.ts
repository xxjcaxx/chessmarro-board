export { initChessmarroBoard };

import { setFen, movePiece } from "./board";
import styles from "./style.css?inline";
const chessImages = import.meta.glob<{ default: string }>("./pieces/*", {
  eager: true,
});

type Board = number[][];
type Move = number[]; // oy ox dy dx
const letters = [" ", "a", "b", "c", "d", "e", "f", "g", "h", " "];

const uciToMove = (uci: string): Move => {
  const [oy, ox, dy, dx] = uci.split("");
  return [
    letters.indexOf(oy) - 1,
    8 - parseInt(ox),
    letters.indexOf(dy) - 1,
    8 - parseInt(dx),
  ];
};

class BoardElement extends HTMLElement {
  board: Board;
  divBoard: HTMLElement;
  chessImages = Object.fromEntries(
    Object.entries(chessImages).map(([key, value]) => [
      `${key}`.split("/")[2].split(".")[0],
      value.default,
    ])
  );
  blackColor: string = "#b58863";
  whiteColor: string = "#f0d9b5";
  numbers: boolean = false;
  numbersColor: string = "black";
  legalMoves: Move[] = [];

  constructor() {
    super();
    this.board = Array(8)
      .fill(0)
      .map(() => Array(8).fill(0));

    this.divBoard = document.createElement("div");
  }

  connectedCallback() {
    if (this.dataset.fen) {
      this.board = setFen(this.dataset.fen);
    }
    if (this.dataset.blackColor) {
      this.blackColor = this.dataset.blackColor;
    }
    if (this.dataset.whiteColor) {
      this.whiteColor = this.dataset.whiteColor;
    }
    if (this.dataset.numbers) {
      this.numbers = this.dataset.numbers === "true";
    }
    if (this.dataset.numbersColor) {
      this.numbersColor = this.dataset.numbersColor;
    }
    if (this.dataset.legalMoves) {
      this.legalMoves = JSON.parse(this.dataset.legalMoves).map(uciToMove);
      //console.log(this.legalMoves);
    }

    this.render();
  }

  disconnectedCallback() {
    // console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    //  console.log("Custom element moved to new page.");
  }

  refresh() {
    const divBoard = this.divBoard;

    divBoard.innerHTML = this.board
      ? // Top Letters
        `${
          this.numbers
            ? letters
                .map(
                  letter =>
                    `<div class="piece letters ${letter != " " ? "" : "numbers"}">${letter}</div>`
                )
                .join("")
            : ""
        }` +
        this.board
          .map(
            (row, idRow) =>
              //left numbers
              `${
                this.numbers
                  ? `
          <div class="piece numbers">${8 - idRow}</div>
          `
                  : ""
              }` +
              // Pieces
              row
                .map(
                  (piece, idCol) => `
            <div class="piece
            ${(idRow + idCol) % 2 === 1 ? "black" : ""}
            ${(idRow + idCol) % 2 === 0 ? "white" : ""}
            "
            data-position="${letters[idCol + 1]}${8 - idRow}"
            data-letter="${letters[idCol + 1]}"
            data-number="${7 - idRow}"
            data-matrix_position="[${idCol},${idRow}]"
            >${
              piece != 0
                ? `<img data-piece="${piece}" data-position="${letters[idCol + 1]}${8 - idRow}"
            data-letter="${letters[idCol + 1]}"
            data-number="${8 - idRow}"
            data-matrix_position="[${idCol},${idRow}]"  src="${this.chessImages[piece]}">`
                : ""
            }</div>
            `
                )
                .join("") +
              // right numbers
              `${
                this.numbers
                  ? `
          <div class="piece numbers">${8 - idRow}</div>
          `
                  : ""
              }`
          )
          .join("") +
        // Bottom Letters
        `${this.numbers ? letters.map(letter => `<div class="piece letters ${letter != " " ? "" : "numbers"}">${letter}</div>`).join("") : ""}`
      : "";

    // Events

    divBoard.querySelectorAll("div.piece").forEach(divPiece => {
      const pieceElement = divPiece as HTMLElement;

      pieceElement.addEventListener("drop", (event: DragEvent) => {
        event.preventDefault();
        const eventJSON = event.dataTransfer?.getData("application/json") || "";
        const eventData = JSON.parse(eventJSON);
        //console.log(event.dataTransfer?.getData("application/json"));
        this.dispatchEvent(
          new CustomEvent("chessmarro-move", {
            bubbles: true,
            composed: true,
            detail: {
              origin: { ...eventData },
              destiny: {
                position: pieceElement.dataset.position,
                matrix_position: pieceElement.dataset.matrix_position,
              },
              uci: eventData.position + pieceElement.dataset.position,
            },
          })
        );
      });
      pieceElement.addEventListener("dragover", event => {
        event.preventDefault();
        //console.log(event);
      });
    });
    divBoard.querySelectorAll("img").forEach(img => {
      img.addEventListener("dragstart", event => {
        if (event.dataTransfer && event.target instanceof HTMLImageElement) {
          event.dataTransfer.setData("text/plain", event.target.dataset.piece!);
          event.dataTransfer.setData(
            "application/json",
            JSON.stringify({
              piece: event.target.dataset.piece!,
              position: event.target.dataset.position,
              matrix_position: event.target.dataset.matrix_position,
            })
          );
          console.log(img);

          //const [oy,ox] = JSON.parse(event.target.dataset.matrix_position!)
          //const legalMovesFromImg = this.legalMoves.filter(m => m[0]==parseInt(oy) && m[1]==parseInt(ox))
          //console.log(this.legalMoves,legalMovesFromImg,oy,ox);
          /* legalMovesFromImg.forEach(move=>{

          });*/
        }
      });
    });
  }

  render() {
    const shadow = this.shadowRoot
      ? this.shadowRoot
      : this.attachShadow({ mode: "open" });

    const fragment = document.createDocumentFragment();
    //this.divBoard = document.createElement("div");
    const divBoard = this.divBoard;
    divBoard.id = "divBoard";
    divBoard.style.opacity = "0";

    const styleSheets = new CSSStyleSheet();
    styleSheets.replace(styles).then(() => {
      styleSheets.insertRule(`.black{background-color: ${this.blackColor};}`);
      styleSheets.insertRule(`.white{background-color: ${this.whiteColor};}`);
      styleSheets.insertRule(`#divBoard {
                                        grid-template-columns: repeat(${this.numbers ? 26 : 24}, 1fr);
                                        grid-template-rows: repeat(${this.numbers ? 26 : 24}, 1fr);
                                      }`);
      styleSheets.insertRule(
        `.piece.numbers, .piece.letters { background-color: ${this.numbersColor};}`
      );
    });

    shadow.adoptedStyleSheets = [styleSheets];

    this.refresh();

    fragment.appendChild(divBoard);
    shadow.replaceChildren(fragment);
    requestAnimationFrame(() => {
      divBoard.style.opacity = "1"; // Mostramos el tablero suavemente
    });
  }

  movePiece([ox, oy]: number[], [dx, dy]: number[], speed: number = 0.5) {
    //const piece = this.board[oy][ox];
    //const pieceDestiny = this.board[dy][dx];

    const pieceImg = this.shadowRoot!.querySelector(
      `img[data-position="${letters[ox + 1]}${8 - oy}"]`
    ) as HTMLElement;
    const destinyDiv = this.shadowRoot!.querySelector(
      `div[data-position="${letters[dx + 1]}${8 - dy}"]`
    ) as HTMLElement;

    if (pieceImg && destinyDiv) {
      const imgRect = pieceImg!.getBoundingClientRect();
      const targetRect = destinyDiv!.getBoundingClientRect();
      const deltaX = targetRect.left - imgRect.left;
      const deltaY = targetRect.top - imgRect.top;
      pieceImg!.style.transition = `transform ${speed}s ease-in-out`;
      pieceImg!.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      pieceImg!.addEventListener(
        "transitionend",
        () => {
          this.board = movePiece(this.board)([ox, oy], [dx, dy]);
          this.render();
        },
        { once: true }
      );
    }
  }
}

const initChessmarroBoard = (name = "chessmarro-board") => {
  customElements.define(name, BoardElement);
};

/*

TODO


Drag and Drop
Flechas y demás
movimientos animados
movimientos legales 

*/
