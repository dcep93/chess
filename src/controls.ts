class Controls {
  auto_reply = document.getElementById("auto_reply") as HTMLInputElement;

  constructor() {
    document.getElementById("new_game").onclick = this.new_game.bind(this);
    document.getElementById(
      "different_move"
    ).onclick = this.different_move.bind(this);
    document.getElementById("undo").onclick = navigate.undo.bind(navigate);
    document.getElementById("redo").onclick = navigate.redo.bind(navigate);
    document.getElementById("reply").onclick = board.reply.bind(board);
    document.getElementById("best").onclick = board.best.bind(board);
  }

  new_game() {
    log.clear();
    navigate.reset();
    board.board.flip();
    board.chess.reset();
    navigate.record(null);
    board.rerender();
    board.maybe_reply();
    this.auto_reply.checked = true;
  }

  different_move() {
    const c_history = board.chess.history();
    const move = c_history[c_history.length - 1];
    if (!navigate.undo()) return;
    board.reply(move);
  }
}

const controls = new Controls();
