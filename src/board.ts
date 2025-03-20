export {generateArrayBoard, setStartPosition, setFen, getFen, movePiece}

type Board = number[][];


const generateArrayBoard = (): Board => {
    return Array(8).fill(0).map(()=>Array(8).fill(0));
}

const setFen = (fen:string): Board =>
    fen.split('').map(piece =>
        isNaN(parseInt(piece)) ? piece : Array(parseInt(piece)).fill(0)
    ).flat()
    .filter(piece => piece != '/')
    .reduce((p,c,i)=>{
        i < 64 && p[Math.floor(i/8)].push(c); 
        return p;
    },
        [[],[],[],[],[],[],[],[]])



const setStartPosition = ():Board => setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

const getFen = (board:Board): string => {
    let fenArray = [];
    for(let row of board){
        let cellcount = 0;
        for(let cell of row){
            if(cell != 0 && cellcount > 0){
                fenArray.push(cellcount);
                cellcount = 0;
            } 
            if(cell != 0){
                fenArray.push(cell);
            }
            
            if(cell === 0) cellcount++;
        }
        if(cellcount > 0) fenArray.push(cellcount);
        fenArray.push('/');
    }
    fenArray.pop();
    return fenArray.join('');
}

const movePiece =(board: Board) => ([ox, oy]: number[], [dx,dy]: number[]): Board => {
    const boardCopy = structuredClone(board);
    const piece = boardCopy[ox][oy];
    boardCopy[ox][oy] = 0;
    boardCopy[dx][dy] = piece;
    return boardCopy;
}