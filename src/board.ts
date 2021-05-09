// if I make a brand new move, opponent auto play is disabled and we display "brand new move" somehow as of move 66 we have a brand new game

// if I undo opponent's move, I can move for them
// can disable auto play for opponent

// if I make a move, opponent makes a weighted random move
// displays weight, stockfish for all game history (can hide)

const Chessboard = (window as any).Chessboard;
const Chess = (window as any).Chess;

type Position = {};

class Board {
  chess: {
    reset(): void;
    load(fen: string): void;
    move(args): string | null;
    fen(): string;
    moves(): string[];
    turn(): string;
  } = new Chess();
  board: {
    flip(): void;
    position(fen: string, useAnimation: boolean);
    orientation(): string;
  } = Chessboard("board", {
    position: "start",
    draggable: true,
    onDrop: Board.onDrop,
    onChange: Board.onChange,
    orientation: "white",
    pieceTheme:
      "./vendor/chessboardjs.com/chessboardjs-1.0.0/img/chesspieces/wikipedia/{piece}.png",
  });

  init() {}

  static onDrop(from: string, to: string, piece: string) {
    const promotion = board.get_promotion(to, piece);

    const move = board.chess.move({ from, to, promotion });

    // illegal move
    if (move === null) return "snapback";

    move_history.do(board.chess.fen());

    board.maybe_reply();
  }

  static onChange(old_position: Position, new_position: Position) {
    const fen = board.chess.fen().split(" ")[0];
    if (Chessboard.objToFen(new_position) !== fen) board.rerender();
  }

  rerender() {
    const fen = board.chess.fen().split(" ")[0];
    setTimeout(() => board.board.position(fen, true));
  }

  get_promotion(to: string, piece: string) {
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

  maybe_reply() {
    if (!controls.auto_reply.checked) return;
    if (board.chess.turn() === board.board.orientation().charAt(0)) return;
    return board.reply();
  }

  reply() {
    return Promise.resolve().then(board.pick_reply).then(board.apply_reply);
  }

  pick_reply() {
    const moves = board.chess.moves();
    return moves[Math.floor(Math.random() * moves.length)];
  }

  apply_reply(move: string) {
    board.chess.move(move);
    board.rerender();
    move_history.do(board.chess.fen());
  }
}

const board = new Board();
