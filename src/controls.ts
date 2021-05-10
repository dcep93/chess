class Controls {
  auto_reply = document.getElementById("auto_reply") as HTMLInputElement;

  constructor() {
    // todo
    // Show/hide next move preview that looks like lichess
    document.getElementById("new_game").onclick = this.new_game;
    document.getElementById("different_move").onclick = this.different_move;
    document.getElementById("undo").onclick = move_history.undo;
    document.getElementById("redo").onclick = move_history.redo;
  }

  new_game() {
    move_history.reset();
    board.board.flip();
    board.chess.reset();
    board.rerender();
    board.maybe_reply();
  }

  different_move() {
    move_history.undo();
    board.reply().then(board.maybe_reply);
  }
}

const controls = new Controls();
