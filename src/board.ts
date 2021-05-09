// if I make a brand new move, opponent auto play is disabled and we display "brand new move" somehow as of move 66 we have a brand new game

// if I undo opponent's move, I can move for them
// can disable auto play for opponent

// if I make a move, opponent makes a weighted random move
// displays weight, stockfish for all game history (can hide)

const Chessboard = (window as any).Chessboard;
const Chess = (window as any).Chess;

type Position = {};

class board {
  static chess = new Chess();
  static board = Chessboard("board", {
    position: "start",
    draggable: true,
    onDrop: board.onDrop,
    onChange: board.onChange,
    orientation: "white",
    pieceTheme:
      "./vendor/chessboardjs.com/chessboardjs-1.0.0/img/chesspieces/wikipedia/{piece}.png",
  });

  static init() {}

  static onDrop(from: string, to: string, piece: string) {
    const promotion = board.get_promotion(to, piece);
    console.log(promotion);

    const move = board.chess.move({ from, to, promotion });

    // illegal move
    if (move === null) return "snapback";
  }

  static get_promotion(to: string, piece: string) {
    const promotions = ["q", "n", "r", "b"];
    if (piece.charAt(1) !== "P" || !["1", "8"].includes(to.charAt(1)))
      return null;
    while (true) {
      for (let i = 0; i < promotions.length; i++) {
        let p = promotions[i];
        if (confirm(`Promote to ${p}?`)) return p;
      }
    }
  }

  static onChange(old_position: Position, new_position: Position) {
    console.log(Chessboard.objToFen(new_position), board.chess.fen());
    // if (Chessboard.objToFen(new_position) !== board.chess.fen())
    //   return board.board.position(board.chess.fen());
    console.log(new_position);
  }
}
