const Chessboard = (window as any).Chessboard;
const Chess = (window as any).Chess;

type Position = {};

class Board {
  chess: {
    reset(): void;
    load(fen: string): void;
    move(
      args: string | { from: string; to: string; promotion: string | null }
    ): string | null;
    fen(): string;
    moves(): string[];
    turn(): string;
  };
  board: {
    flip(): void;
    position(fen: string, useAnimation: boolean): void;
    orientation(): string;
    fen(): string;
  };

  constructor() {
    const [orientation, position] = (
      decodeURIComponent(location.hash.substr(1)) || "white//"
    ).split("//");
    this.chess = new Chess(position);
    this.board = Chessboard("board", {
      position: position.split(" ")[0] || "start",
      draggable: true,
      onDrop: this.onDrop,
      onChange: this.onChange,
      orientation,
      pieceTheme:
        "./vendor/chessboardjs.com/chessboardjs-1.0.0/img/chesspieces/wikipedia/{piece}.png",
    });
  }

  onDrop(from: string, to: string, piece: string): "snapback" | undefined {
    const promotion = this.get_promotion(to, piece);

    const move = this.chess.move({ from, to, promotion });

    if (move === null) return "snapback";

    Promise.resolve().then(navigate.record).then(this.maybe_reply);
  }

  onChange(old_position: Position, new_position: Position) {
    const fen = this.chess.fen().split(" ")[0];
    location.hash = `${this.board.orientation()}//${this.chess.fen()}`;
    if (Chessboard.objToFen(new_position) !== fen) this.rerender();
  }

  rerender() {
    const fen = this.chess.fen().split(" ")[0];
    setTimeout(() => this.board.position(fen, true));
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

  maybe_reply() {
    if (!controls.auto_reply.checked) return;
    if (this.chess.turn() === this.board.orientation().charAt(0)) return;
    return this.reply();
  }

  async reply(): Promise<void> {
    try {
      await Promise.resolve();
      const move = await this.pick_reply();
      return this.apply_reply(move);
    } catch (err) {
      alert(err);
      throw err;
    }
  }

  async pick_reply(): Promise<string> {
    const loaded = await cache_w.load(this.board.fen(), () =>
      lichess.get_moves(this.chess.fen())
    );
    const moves = loaded.rval;
    if (moves.length === 0) {
      // we have a brand new move
      return "";
    }
    const weights = moves.map((i) => i.black + i.white + i.draws);
    var choice = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i_1 = 0; i_1 < weights.length; i_1++) {
      choice -= weights[i_1];
      if (choice <= 0) return moves[i_1].move;
    }
    throw Error("pick_reply");
  }

  apply_reply(move: string) {
    if (!move) return;
    this.chess.move(move);
    this.rerender();
    navigate.record();
  }
}

const board = new Board();
