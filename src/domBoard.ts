export { initChessmarroBoard }

import { setFen } from "./board";
import styles from "./style.css?inline";
const chessImages = import.meta.glob<{ default: string }>('./pieces/*', { eager: true });

type Board = number[][];


class BoardElement extends HTMLElement {

  board: Board | null;
  chessImages = Object.fromEntries(Object.entries(chessImages).map(([key, value]) => [`${key}`.split('/')[2].split('.')[0], value.default]));
  blackColor: string = "#b58863";
  whiteColor: string = "#f0d9b5";
  numbers: boolean = false;
  numbersColor: string = "black";


  constructor() {
    super();
    this.board = null;
  }

  connectedCallback() {
    console.log("Board Added to page");
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
      this.numbers = this.dataset.numbers === 'true';
    }
    if (this.dataset.numbersColor) {
      this.numbersColor = this.dataset.numbersColor;
    }

    this.render();

  }

  disconnectedCallback() {
   // console.log("Custom element removed from page.");
  }

  adoptedCallback() {
  //  console.log("Custom element moved to new page.");
  }

  /* attributeChangedCallback(name, oldValue, newValue) {
     console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`);
   }*/

  render() {
    const shadow = this.attachShadow({ mode: "open" });
    const divBoard = document.createElement('div');
    divBoard.id = 'divBoard';
    shadow.append(divBoard);

    const styleSheets = new CSSStyleSheet();
    styleSheets.replace(styles).then(() => {
      styleSheets.insertRule(`.black{background-color: ${this.blackColor};}`);
      styleSheets.insertRule(`.white{background-color: ${this.whiteColor};}`);
      styleSheets.insertRule(`#divBoard {
                                        grid-template-columns: repeat(${this.numbers ? 26 : 24}, 1fr);
                                        grid-template-rows: repeat(${this.numbers ? 26 : 24}, 1fr);
                                      }`);
      styleSheets.insertRule(`.piece.numbers, .piece.letters { background-color: ${this.numbersColor};}`);


    });

    shadow.adoptedStyleSheets = [styleSheets];
    const letters = [" ", "a", "b", "c", "d", "e", "f", "g", "h", " "];
    divBoard.innerHTML = this.board ?
    // Top Letters
      `${this.numbers ? letters
        .map(letter => `<div class="piece letters ${letter != " " ? '' : 'numbers'}">${letter}</div>`).join('') : ''}` +

      this.board.map((row, idRow) => 
        //left numbers
        `${this.numbers ? `
          <div class="piece numbers">${8-idRow}</div>
          `: ''}` + 
          // Pieces
          row.map((piece, idCol) => `
            <div class="piece
            ${(idRow + idCol) % 2 === 1 ? 'black' : ''}
            ${(idRow + idCol) % 2 === 0 ? 'white' : ''}
            "
            data-position="${letters[idCol+1]}${8-idRow}"
            data-letter="${letters[idCol+1]}"
            data-number="${7-idRow}"
            data-matrix_position="[${idCol},${idRow}]"
            >${piece != 0 ? `<img data-piece="${piece}" data-position="${letters[idCol+1]}${8-idRow}"
            data-letter="${letters[idCol+1]}"
            data-number="${8-idRow}"
            data-matrix_position="[${idCol},${idRow}]"  src="${this.chessImages[piece]}">` : ''}</div>
            `).join('') 

            // right numbers
            + `${this.numbers ? `
          <div class="piece numbers">${8-idRow}</div>
          `: ''}`
      ).join('') 

      // Bottom Letters
      + `${this.numbers ? letters.map(letter => `<div class="piece letters ${letter != " " ? '' : 'numbers'}">${letter}</div>`).join('') : ''}` : '';

      // Events

      divBoard.querySelectorAll('div.piece').forEach(divPiece =>{
 
        const pieceElement = divPiece as HTMLElement;
        
        pieceElement.addEventListener("drop",(event: DragEvent)=>{
          event.preventDefault();
          const eventJSON = event.dataTransfer?.getData("application/json") || ''
          const eventData = JSON.parse(eventJSON);
          //console.log(event.dataTransfer?.getData("application/json"));
          this.dispatchEvent(new CustomEvent('chessmarro-move',{
            bubbles: true,
            composed: true,
            detail:{
              origin: {...eventData},
              destiny: {position: pieceElement.dataset.position, matrix_position: pieceElement.dataset.matrix_position},
              uci: eventData.position+pieceElement.dataset.position
            }
          }))
        });
        pieceElement.addEventListener("dragover",(event)=>{
          event.preventDefault();
          //console.log(event);
        });
      });
      divBoard.querySelectorAll('img').forEach(img =>{
        img.addEventListener("dragstart",(event)=>{
          if (event.dataTransfer && event.target instanceof HTMLImageElement) {
            event.dataTransfer.setData("text/plain", event.target.dataset.piece!);
            event.dataTransfer.setData("application/json", JSON.stringify({
              piece: event.target.dataset.piece!, 
              position: event.target.dataset.position,
              matrix_position: event.target.dataset.matrix_position
            }));
            //event.dataTransfer.setDragImage(img, 10, 10);
          
        }
          
        });
        
      });
  }
}

const initChessmarroBoard = (name="chessmarro-board") => {
  customElements.define(name, BoardElement);
}


/*

TODO

Esquema de colores
Imagenes de las piezas
Números en los márgenes
Drag and Drop
Flechas y demás
 
*/