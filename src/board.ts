const Chessboard = (window as any).Chessboard;
const Chess = (window as any).Chess;

type Position = {};

// todo modularize
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
    history(): string[];
  };
  board: {
    flip(): void;
    position(fen: string, useAnimation: boolean): void;
    orientation(): string;
    fen(): string;
  };

  constructor() {
    const [orientation, position] = (
      location.hash.substr(1).replace(/_/g, " ") || "white//"
    ).split("//");
    this.chess = new Chess();
    if (position) this.chess.load(position);
    this.board = Chessboard("board", {
      position: position.split(" ")[0] || "start",
      draggable: true,
      onDrop: this.onDrop.bind(this),
      onChange: this.onChange.bind(this),
      orientation,
      pieceTheme:
        "./vendor/chessboardjs.com/chessboardjs-1.0.0/img/chesspieces/wikipedia/{piece}.png",
    });
  }

  onDrop(from: string, to: string, piece: string): "snapback" | undefined {
    const promotion = this.get_promotion(to, piece);

    const hash = this.get_hash();

    const moves_promise = lichess.get_moves(this.chess.fen());

    const v_move = this.chess.move({ from, to, promotion });

    if (v_move === null) return "snapback";

    const c_history = this.chess.history();
    const move = c_history[c_history.length - 1];

    moves_promise
      .then((moves) => ({ moves, move }))
      .then((choice) => {
        if (controls.is_shift)
          localStorage.setItem(hash, JSON.stringify(choice));
        return choice;
      })
      .then(navigate.record.bind(navigate))
      .then(this.maybe_reply.bind(this));
  }

  onChange(old_position: Position, new_position: Position) {
    const fen = this.chess.fen().split(" ")[0];
    const hash = this.get_hash();
    location.hash = hash;
    controls.set_clear_novelty();
    if (Chessboard.objToFen(new_position) !== fen) this.rerender();
  }

  get_hash(): string {
    return `${this.board.orientation()}//${this.chess.fen()}`.replace(
      / /g,
      "_"
    );
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
    return this.reply("");
  }

  async best(): Promise<void> {
    var choice_str = localStorage.getItem(this.get_hash());
    var choice;
    if (choice_str) {
      choice = JSON.parse(choice_str);
    } else {
      const moves = await lichess.get_moves();
      if (moves.length === 0) return;
      const move = moves.sort((a, b) => b.total - a.total)[0].move;
      choice = { move, moves };
    }
    this.apply_reply(choice);
    this.maybe_reply();
  }

  async reply(different: string): Promise<void> {
    try {
      const choice = await this.pick_reply(different);
      this.apply_reply(choice);
      this.maybe_reply();
    } catch (err) {
      alert(err);
      throw err;
    }
  }

  async pick_reply(
    different: string
  ): Promise<{ move: string; moves: Move[] }> {
    const moves = await lichess.get_moves();
    const weights = moves.map(
      (m) => m.total / (m.move === different ? 100 : 1)
    );
    var choice = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < weights.length; i++) {
      choice -= weights[i];
      if (choice <= 0) return { move: moves[i].move, moves };
    }
    throw Error("pick_reply");
  }

  apply_reply(choice: { move: string; moves: Move[] }) {
    if (!choice) return;
    this.chess.move(choice.move);
    this.rerender();
    navigate.record(choice);
  }
}

const board = new Board();
