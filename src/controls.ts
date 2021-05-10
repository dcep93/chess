class Controls {
  auto_reply = document.getElementById("auto_reply") as HTMLInputElement;

  constructor() {
    // todo
    // Show/hide next move preview that looks like lichess
    document.getElementById("new_game").onclick = this.new_game;
    document.getElementById("different_move").onclick = this.different_move;
    document.getElementById("undo").onclick = navigate.undo;
    document.getElementById("redo").onclick = navigate.redo;
  }

  new_game() {
    navigate.reset();
    board.board.flip();
    board.chess.reset();
    board.rerender();
    board.maybe_reply();
  }

  different_move() {
    navigate.undo();
    board.reply().then(board.maybe_reply);
  }
}

const controls = new Controls();
