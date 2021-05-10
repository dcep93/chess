class Controls {
  auto_reply = document.getElementById("auto_reply") as HTMLInputElement;
  is_active = false;

  constructor() {
    document.getElementById("new_game").onclick = this.queue(
      this.new_game.bind(this)
    );
    document.getElementById("different_move").onclick = this.queue(
      this.different_move.bind(this)
    );
    document.getElementById("undo").onclick = this.queue(
      navigate.undo.bind(navigate)
    );
    document.getElementById("redo").onclick = this.queue(
      navigate.redo.bind(navigate)
    );
    document.getElementById("reply").onclick = this.queue(
      board.reply.bind(board)
    );
    document.getElementById("best").onclick = this.queue(
      board.best.bind(board)
    );
  }

  queue(f: () => void) {
    return () => {
      if (this.is_active) return;
      try {
        this.is_active = true;
        f();
      } finally {
        this.is_active = false;
      }
    };
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
