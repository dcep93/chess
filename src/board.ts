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
  };
  board: {
    flip(): void;
    position(fen: string, useAnimation: boolean);
    orientation(): string;
    fen(): string;
  };

  constructor() {
    const position = decodeURIComponent(location.hash.substr(1).split(" ")[0]);
    this.chess = new Chess(position);
    this.board = Chessboard("board", {
      position: position || "start",
      draggable: true,
      onDrop: Board.onDrop,
      onChange: Board.onChange,
      orientation: "white",
      pieceTheme:
        "./vendor/chessboardjs.com/chessboardjs-1.0.0/img/chesspieces/wikipedia/{piece}.png",
    });
  }

  static onDrop(from: string, to: string, piece: string) {
    const promotion = board.get_promotion(to, piece);

    const move = board.chess.move({ from, to, promotion });

    if (move === null) return "snapback";

    move_history.record();

    board.maybe_reply();
  }

  static onChange(old_position: Position, new_position: Position) {
    const fen = board.chess.fen().split(" ")[0];
    location.hash = board.chess.fen();
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
    return Promise.resolve()
      .then(board.pick_reply)
      .then(board.apply_reply)
      .catch((err) => {
        alert(err);
        throw err;
      });
  }

  pick_reply() {
    return cache
      .load(board.board.fen(), () => lichess.get_moves(board.chess.fen()))
      .then((loaded) => loaded.rval)
      .then((moves) => {
        if (moves.length === 0) {
          // we have a brand new move
          return "";
        }
        const weights = moves.map((i) => i.black + i.white + i.draws);
        var choice = Math.random() * weights.reduce((a, b) => a + b, 0);
        for (let i = 0; i < weights.length; i++) {
          choice -= weights[i];
          if (choice <= 0) return moves[i].move;
        }
        throw Error("pick_reply");
      });
  }

  apply_reply(move: string) {
    if (!move) return;
    board.chess.move(move);
    board.rerender();
    move_history.record();
  }
}

const board = new Board();
