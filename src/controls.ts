class Controls {
  auto_reply = document.getElementById("auto_reply") as HTMLInputElement;

  constructor() {
    // todo
    // Show/hide next move preview that looks like lichess
    document.getElementById("new_game").onclick = this.new_game.bind(this);
    document.getElementById(
      "different_move"
    ).onclick = this.different_move.bind(this);
    document.getElementById("undo").onclick = navigate.undo.bind(navigate);
    document.getElementById("redo").onclick = navigate.redo.bind(navigate);
    document.getElementById("reply").onclick = board.reply.bind(board);
  }

  new_game() {
    navigate.reset();
    board.board.flip();
    board.chess.reset();
    navigate.record(null);
    board.rerender();
    board.maybe_reply();
  }

  different_move() {
    navigate.undo();
    board.reply();
  }
}

const controls = new Controls();
