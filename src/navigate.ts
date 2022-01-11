class Navigate {
  index: number;
  history: { fen: string; move: string }[];

  constructor() {
    this.reset();
  }

  reset() {
    this.index = -1;
    this.history = [];
  }

  record(choice: { move: string; moves: Move[] } | null) {
    const fen = board.fen();
    this.history.splice(++this.index);
    this.history.push({ fen, move: choice?.move });

    if (!choice) return;

    return log.log(fen, choice);
  }

  undo(): boolean {
    if (this.index <= 0) return false;
    controls.auto_reply.checked = true;
    const undid = this.history[--this.index];
    board.load(undid.fen);
    log.maybe_unlog();
    return true;
  }

  redo() {
    if (this.index >= this.history.length - 1) return;
    const redid = this.history[++this.index];
    board.load(redid.fen);
  }
}

const navigate = new Navigate();
