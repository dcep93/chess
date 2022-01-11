class Navigate {
  index: number;
  history: { fen: string; move: string; moves: Move[] }[];

  reset() {
    this.index = 0;
    this.history = [{ fen: board.fen(), move: "", moves: [] }];
  }

  record(choice: { move: string; moves: Move[] }) {
    const fen = board.fen();
    this.history.splice(++this.index);
    this.history.push({ fen, ...choice });

    return log.log(fen, choice);
  }

  undo(): boolean {
    if (this.index <= 0) return false;
    const undid = this.history[--this.index];
    board.load(undid.fen);
    log.unlog();
    return true;
  }

  redo() {
    if (this.index >= this.history.length - 1) return;
    const redid = this.history[++this.index];
    board.load(redid.fen);
    log.log(redid.fen, redid);
  }
}

const navigate = new Navigate();
