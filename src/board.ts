const Chessboard = (window as any).Chessboard;
const Chess = (window as any).Chess;

type Position = {};

type ChessType = {
  reset(): void;
  load(fen: string): void;
  move(
    args: string | { from: string; to: string; promotion: string | null }
  ): string | null;
  fen(): string;
  moves(): string[];
  turn(): string;
  history(): string[];
};

class Board {
  chess: ChessType;
  board: {
    flip(): void;
    position(fen: string, useAnimation: boolean): void;
    orientation(): string;
    fen(): string;
  };

  constructor() {
    const [orientation, fen] = brain.get_orientation_fen();
    this.chess = new Chess();
    if (fen) this.chess.load(fen);
    this.board = Chessboard("board", {
      position: fen.split(" ")[0] || "start",
      draggable: true,
      onDrop: this.onDrop.bind(this),
      onChange: this.onChange.bind(this),
      orientation,
      pieceTheme:
        "./vendor/chessboardjs.com/chessboardjs-1.0.0/img/chesspieces/wikipedia/{piece}.png",
    });
  }

  last_move(): string {
    return this.chess.history()[this.chess.history().length - 1];
  }

  move(move: string): void {
    this.chess.move(move);
    this.rerender();
  }

  fen(): string {
    return this.chess.fen();
  }

  load(fen: string) {
    this.chess.load(fen);
    this.rerender();
  }

  orientation(): string {
    return this.board.orientation();
  }

  flip(): void {
    this.board.flip();
  }

  reset(): void {
    this.chess.reset();
    this.rerender();
  }

  onDrop(from: string, to: string, piece: string): "snapback" | undefined {
    const hash = brain.get_hash();
    const moves_promise = lichess.get_moves();

    const promotion = this.get_promotion(to, piece);
    const v_move = this.chess.move({ from, to, promotion });
    if (v_move === null) return "snapback";

    brain.on_drop(hash, moves_promise);
  }

  onChange(old_position: Position, new_position: Position) {
    brain.on_change();
    const fen = this.fen().split(" ")[0];
    if (Chessboard.objToFen(new_position) !== fen) this.rerender();
  }

  rerender() {
    const fen = this.fen().split(" ")[0];
    this.board.position(fen, true);
  }

  get_promotion(to: string, piece: string): string | null {
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
}

const board = new Board();
