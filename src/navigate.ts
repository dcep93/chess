class Navigate {
  index: number;
  history: { position: string }[];

  constructor() {
    this.reset();
  }

  reset() {
    this.index = -1;
    this.history = [];
  }

  record() {
    const position = board.chess.fen();
    this.history.splice(++this.index);
    this.history.push({ position });

    // todo
    // if I make a brand new move, auto play is disabled and we display of move ...66 we have a brand new game
    // displays weight, stockfish for all game history (can hide)
  }

  undo() {
    if (this.index <= 0) return;
    const undid = this.history[--this.index];
    board.chess.load(undid.position);
    board.rerender();
  }

  redo() {
    if (this.index >= this.history.length - 1) return;
    const redid = this.history[++this.index];
    board.chess.load(redid.position);
    board.rerender();
  }
}

const navigate = new Navigate();
