class MoveHistory {
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
    move_history.history.splice(++move_history.index);
    move_history.history.push({ position });

    // todo
    // if I make a brand new move,  auto play is disabled and we display of move ...66 we have a brand new game
    // displays weight, stockfish for all game history (can hide)
  }

  undo() {
    if (move_history.index <= 0) return;
    const undid = move_history.history[--move_history.index];
    board.chess.load(undid.position);
    board.rerender();
  }

  redo() {
    if (move_history.index >= move_history.history.length - 1) return;
    const redid = move_history.history[++move_history.index];
    board.chess.load(redid.position);
    board.rerender();
  }
}

const move_history = new MoveHistory();
