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
    memorize.button.onclick = this.queue(memorize.run.bind(memorize));
    document.getElementById("undo").onclick = this.queue(
      navigate.undo.bind(navigate)
    );
    document.getElementById("redo").onclick = this.queue(
      navigate.redo.bind(navigate)
    );
    document.getElementById("reply").onclick = this.queue(
      brain.reply.bind(brain)
    );
    document.getElementById("best").onclick = this.queue(
      brain.best.bind(brain)
    );
    this.clear_novelty.onclick = this.queue(this.do_clear_novelty.bind(this));
    document.body.onkeydown = (ev) =>
      ({
        Enter: this.different_move.bind(this),
        ArrowLeft: navigate.undo.bind(navigate),
        ArrowRight: navigate.redo.bind(navigate),
        ArrowUp: brain.best.bind(brain),
        ArrowDown: this.new_game.bind(this),
        Space: this.do_clear_novelty.bind(this),
        Shift: () => (this.is_shift = true),
      }[ev.key]?.());
    document.body.onkeyup = (ev) =>
      ev.key === "Shift" && (this.is_shift = false);
    this.set_clear_novelty();
  }

  do_clear_novelty() {
    storage_w.clear_novelty(brain.get_hash());
    this.clear_novelty.disabled = true;
  }

  set_clear_novelty() {
    this.clear_novelty.disabled = !storage_w.get_novelty(brain.get_hash());
  }

  queue(f: () => void) {
    return () => {
      if (this.is_active) return;
      try {
        this.is_active = true;
        f();
      } finally {
        setTimeout(() => (this.is_active = false), 500);
      }
    };
  }

  new_game() {
    log.clear();
    navigate.reset();
    board.flip();
    board.reset();
    navigate.reset();
    brain.maybe_reply(false);
    this.auto_reply.checked = true;
  }

  different_move() {
    const move = board.last_move();
    if (!navigate.undo()) return;
    brain.reply(move);
  }
}

const controls = new Controls();
