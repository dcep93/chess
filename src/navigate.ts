class Navigate {
  index: number;
  history: { fen: string }[];

  constructor() {
    this.reset();
  }

  reset() {
    this.index = -1;
    this.history = [];
  }

  init() {
    this.record(null);
  }

  record(choice: { move: string; moves: Move[] } | null) {
    const fen = board.chess.fen();
    this.history.splice(++this.index);
    this.history.push({ fen });

    if (!choice) return;

    return log.log(fen, choice);
  }

  undo(): boolean {
    if (this.index <= 0) return false;
    controls.auto_reply.checked = true;
    const undid = this.history[--this.index];
    board.chess.load(undid.fen);
    board.rerender();
    log.maybe_unlog();
    return true;
  }

  redo() {
    if (this.index >= this.history.length - 1) return;
    const redid = this.history[++this.index];
    board.chess.load(redid.fen);
    board.rerender();
  }
}

const navigate = new Navigate();
