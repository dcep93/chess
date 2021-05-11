class Controls {
  auto_reply = document.getElementById("auto_reply") as HTMLInputElement;
  opening = document.getElementById("opening") as HTMLDivElement;
  is_active = false;
  is_shift = false;
  clear_novelty = document.getElementById("clear_novelty") as HTMLButtonElement;

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
    this.clear_novelty.onclick = this.queue(() => {
      localStorage.removeItem(board.get_hash());
      this.clear_novelty.disabled = true;
    });
    document.body.onkeydown = (ev) =>
      ({
        ArrowLeft: navigate.undo.bind(navigate),
        ArrowRight: navigate.redo.bind(navigate),
        ArrowUp: board.best.bind(board),
        ArrowDown: this.new_game.bind(this),
        Shift: () => (this.is_shift = true),
      }[ev.key]?.());
    document.body.onkeyup = (ev) =>
      ev.key === "Shift" && (this.is_shift = false);
    this.set_clear_novelty();
  }

  set_clear_novelty() {
    this.clear_novelty.disabled =
      localStorage.getItem(board.get_hash()) === null;
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
