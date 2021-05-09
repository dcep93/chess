class MoveHistory {
  index = -1;
  history: { position: string }[] = [];
  reset() {
    move_history.index = -1;
    move_history.history = [];
  }

  do(position: string) {
    move_history.history.splice(++move_history.index);
    move_history.history.push({ position });
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
