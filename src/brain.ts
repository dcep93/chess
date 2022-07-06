class Brain {
  uncommon_total = 1000;
  get_orientation_fen() {
    const [orientation, fen] = (
      location.hash.substring(1).replace(/_/g, " ") || "white//"
    ).split("//");
    return [orientation, fen];
  }

  async on_drop(hash: string, moves_promise: Promise<Move[]>) {
    const moves = await moves_promise;
    const move = board.last_move();

    const choice = { moves, move };
    if (controls.is_shift) storage_w.set_novelty(hash, choice);

    navigate.record(choice);
    this.maybe_reply(true);
  }

  on_change() {
    const fen = board.fen().split(" ")[0];
    const name = openings.fen_to_name[fen];
    if (name) controls.opening.innerText = name;
    const hash = this.get_hash();
    location.hash = hash;
    controls.set_clear_novelty();
  }

  get_hash(): string {
    return `${board.orientation()}//${board.fen()}`.replace(/ /g, "_");
  }

  maybe_reply(from_drop: boolean) {
    if (!board.is_my_turn())
      lichess
        .get_moves()
        .then(
          (moves) =>
            (document.body.style.backgroundColor =
              moves.map((m) => m.total).reduce((a, b) => a + b, 0) >
              this.uncommon_total
                ? "grey"
                : "lightgrey")
        );
    if (memorize.callback(from_drop)) return;
    if (!controls.auto_reply.checked) return;
    if (board.is_my_turn()) return;
    const choice = storage_w.get_novelty(this.get_hash());
    if (choice) return this.apply_reply(choice);
    return this.reply("");
  }

  async best(): Promise<void> {
    var choice = storage_w.get_novelty(this.get_hash());
    if (!choice) {
      const moves = await lichess.get_moves();
      if (moves.length === 0) return;
      const color = board.orientation();
      const move = moves
        .map((m) => ({ move: m.move, score: this.getScore(m, color) }))
        .sort((a, b) => b.score - a.score)[0].move;
      choice = { move, moves };
    }
    this.apply_reply(choice);
    this.maybe_reply(false);
  }

  getScore(m: Move, color: string): number {
    const p = m[color] / (100 + m.black + m.white - m[color]);
    return Math.pow(p, 3) * Math.pow(m.total, 0.69);
  }

  async reply(different: string): Promise<void> {
    try {
      const choice = await this.pick_reply(different);
      this.apply_reply(choice);
      this.maybe_reply(false);
    } catch (err) {
      alert(err);
      throw err;
    }
  }

  async pick_reply(
    different: string
  ): Promise<{ move: string; moves: Move[] }> {
    const moves = await lichess.get_moves();
    const weights = moves.map(
      (m) => m.total / (m.move === different ? 100 : 1)
    );
    var choice = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < weights.length; i++) {
      choice -= weights[i];
      if (choice <= 0) return { move: moves[i].move, moves };
    }
    throw Error("pick_reply");
  }

  apply_reply(choice: { move: string; moves: Move[] }) {
    if (!choice) return;
    board.move(choice.move);
    navigate.record(choice);
  }
}

const brain = new Brain();
