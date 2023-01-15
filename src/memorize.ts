type MemorizeMove = {
  fen: string;
  percentage: number;
  moves: string[];
  move_choices: Move[];
  previous_fen: string;
};

// 0.1 -> 2 moves, 500
// 0.01 -> 4 moves -> 1500
// 0.001 -> 6 moves -> 2000

class Memorize {
  elo_input = document.getElementById("memorize_elo_input") as HTMLInputElement;
  button = document.getElementById("memorize") as HTMLButtonElement;
  chess = new Chess();
  resolve = null;

  on_brain_maybe_reply(from_drop: boolean) {
    if (this.resolve === null) return false;
    this.resolve(from_drop);
    return true;
  }

  elo_to_percentage(elo: number) {
    const num_moves = 4 + (elo - 1500) / 250;
    return 100 / Math.pow(3, num_moves);
  }

  run() {
    const minimum_percentage = this.elo_to_percentage(
      parseFloat(this.elo_input.value)
    );
    console.log("memorize", "minimum_percentage", minimum_percentage);
    // this.button.disabled = true;
    const fen = board.fen();
    const obj = {
      fen,
      previous_fen: "",
      percentage: 100,
      moves: [],
      move_choices: [],
    };
    Promise.resolve()
      .then(() =>
        board.is_my_turn()
          ? [obj]
          : this.get_opponent_moves(obj, minimum_percentage)
      )
      .then((to_explore) => this.find_moves(to_explore, {}, minimum_percentage))
      .then((objs) => ({
        title: [
          "chess",
          openings.get(fen) || "unknown_opening",
          board.orientation(),
          `${minimum_percentage}%`,
          objs.length,
        ].join(" / "),
        data: objs.map((obj) => this.to_parts(fen, obj)),
      }))
      .then((obj) => console.log(JSON.stringify(obj)))
      .then(() => board.load(fen));
  }

  async find_moves(
    to_explore: MemorizeMove[],
    found: {
      [fen: string]: MemorizeMove & { from_drop: boolean };
    },
    minimum_percentage: number
  ): Promise<MemorizeMove[]> {
    for (let i = 0; i < to_explore.length; i++) {
      const exploring = to_explore[i];
      this.load_to_board(
        exploring.fen,
        exploring.moves.slice().reverse()[0],
        exploring.move_choices
      );
      document.title = `${exploring.percentage.toFixed(
        2
      )}% / ${minimum_percentage.toFixed(2)}%`;
      const move_choices = await lichess.get_moves();
      await new Promise((resolve) => {
        this.resolve = resolve;
        this.button.onclick = () => {
          board.load(exploring.previous_fen);
          brain.best();
        };
      })
        .then((from_drop) => {
          this.resolve = null;
          return from_drop;
        })
        .then((from_drop: boolean) => {
          const my_move = board.last_move();
          const next_fen = this.get_fen(exploring.fen, my_move);
          const short_fen = next_fen.split(" ")[0];
          const moved = {
            percentage:
              exploring.percentage +
              (found[short_fen] || { percentage: 0 }).percentage,
            moves: exploring.moves.concat(my_move),
            fen: next_fen,
            previous_fen: exploring.fen,
            from_drop,
            move_choices,
          };
          found[short_fen] = moved;
          if (!from_drop)
            return new Promise((resolve) => {
              // this.button.disabled = false;
              this.button.onclick = resolve;
            }).then(() => {
              // this.button.disabled = true;
              return null;
            });
          return this.get_opponent_moves(moved, minimum_percentage).then(
            (next_to_explore) =>
              this.find_moves(next_to_explore, found, minimum_percentage)
          );
        });
    }
    return Promise.resolve(
      Object.values(found).filter((obj) => !obj.from_drop)
    );
  }

  async get_opponent_moves(
    moved: MemorizeMove,
    minimum_percentage: number
  ): Promise<MemorizeMove[]> {
    return lichess
      .get_moves(moved.fen)
      .then((moves) => ({
        moves,
        total: moves.map((move) => move.total).reduce((a, b) => a + b, 0),
      }))
      .then((obj) =>
        obj.moves
          .sort((a, b) => b.total - a.total)
          .map((move) => ({
            percentage: (moved.percentage * move.total) / obj.total,
            moves: moved.moves.concat(move.move),
            fen: this.get_fen(moved.fen, move.move),
            previous_fen: moved.previous_fen,
            move_choices: obj.moves,
            total: obj.total,
          }))
          .filter(
            (obj, i) =>
              (i === 0 && obj.total > brain.uncommon_total) ||
              obj.percentage > minimum_percentage
          )
      );
  }

  get_fen(starting_fen: string, move: string): string {
    this.chess.load(starting_fen);
    this.chess.move(move);
    return this.chess.fen();
  }

  load_to_board(fen: string, move: string, moves: Move[]) {
    board.load(fen);
    if (move !== undefined) log.log(fen, { move, moves });
  }

  to_parts(
    fen: string,
    obj: { moves: string[]; percentage: number; move_choices: Move[] }
  ): { prompt: string; answer: string; img_url: string } {
    const moves = obj.moves.slice();
    const answer_parts = [moves.pop()];
    const chosen_move = obj.move_choices.find(
      (m) => m.move === answer_parts[0]
    );

    const parts = [];
    this.chess.load(fen);
    var is_white = this.chess.turn() === "w";
    if (!is_white) parts.unshift(["..."]);

    answer_parts.push(
      `(${
        chosen_move === undefined
          ? "unknown"
          : log.move_to_text(
              is_white ? "white" : "black",
              chosen_move,
              obj.move_choices
            )
      })`
    );

    var iterate_fen = fen;
    var last_opening = { i: null, opening: "" };
    moves.map((move, i) => {
      iterate_fen = this.get_fen(iterate_fen, move);
      const opening = openings.get(iterate_fen);
      if (opening) {
        last_opening = { i, opening };
      }
    });

    for (let i = 0; i < moves.length; i++) {
      if (is_white) parts.unshift([]);
      parts[0].push(moves[i]);
      if (last_opening.i === i) {
        parts.unshift([last_opening.opening]);
        if (is_white && i !== moves.length - 1) parts.unshift(["..."]);
      }
      is_white = !is_white;
    }

    parts.unshift([`${obj.percentage.toFixed(2)}%`]);

    var image_fen = iterate_fen.split(" ")[0];
    if (!is_white) image_fen = image_fen.split("/").reverse().join("/");

    const img_url = `http://fen-to-image.com/image/${image_fen}`;
    return {
      prompt: parts
        .reverse()
        .map((p) => p.join(" "))
        .join("\n"),
      answer: answer_parts.join("\n"),
      img_url,
    };
  }
}

const memorize = new Memorize();
