const minimum_probability = 0.01;

type MemorizeMove = {
  fen: string;
  percentage: number;
  moves: string[];
};

class Memorize {
  chess = new Chess();
  resolve = null;

  callback(from_drop: boolean) {
    if (this.resolve === null) return false;
    this.resolve(from_drop);
    return true;
  }

  run() {
    console.log("memorize", minimum_probability);
    const button: HTMLButtonElement = document.getElementById(
      "memorize"
    ) as HTMLButtonElement;
    button.disabled = true;
    const fen = board.fen();
    const obj = { fen, percentage: 1, moves: [] };
    Promise.resolve()
      .then(() => (board.is_my_turn() ? [obj] : this.get_opponent_moves(obj)))
      .then((to_explore) => this.find_moves(to_explore, {}))
      .then((objs) =>
        [
          `chess / ${openings.get(fen) || ""} / ${
            minimum_probability * 100
          }% / ${objs.length}`,
        ]
          .concat(
            ...objs
              .map((obj) => this.to_parts(fen, obj))
              .map((parts) =>
                [parts.prompt, parts.answer, parts.img_url].join("\t")
              )
          )
          .join("\n")
      )
      .then((str) => {
        board.load(fen);
        console.log(str);
        setTimeout(() => alert(str.split("\t").join(" //// ")), 500);
      });
  }

  async find_moves(
    to_explore: MemorizeMove[],
    found: {
      [fen: string]: MemorizeMove & { from_drop: boolean };
    }
  ): Promise<MemorizeMove[]> {
    for (let i = 0; i < to_explore.length; i++) {
      const exploring = to_explore[i];
      this.load_to_board(exploring.fen);
      await new Promise((resolve) => {
        this.resolve = resolve;
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
            from_drop,
          };
          found[short_fen] = moved;
          if (!from_drop)
            return new Promise((resolve) => setTimeout(resolve, 1000));
          return this.get_opponent_moves(moved).then((next_to_explore) =>
            this.find_moves(next_to_explore, found)
          );
        });
    }
    return Promise.resolve(
      Object.values(found).filter((obj) => !obj.from_drop)
    );
  }

  async get_opponent_moves(moved: MemorizeMove): Promise<MemorizeMove[]> {
    return lichess
      .get_moves(moved.fen)
      .then((moves) => ({
        moves,
        total: moves.map((move) => move.total).reduce((a, b) => a + b, 0),
      }))
      .then((obj) =>
        obj.moves
          .map((move) => ({
            percentage: (moved.percentage * move.total) / obj.total,
            moves: moved.moves.concat(move.move),
            fen: this.get_fen(moved.fen, move.move),
          }))
          .filter((obj) => obj.percentage > minimum_probability)
      );
  }

  get_fen(starting_fen: string, move: string): string {
    this.chess.load(starting_fen);
    this.chess.move(move);
    return this.chess.fen();
  }

  load_to_board(fen: string) {
    const hash = location.hash;
    // todo update log
    board.load(fen);
    location.hash = hash;
  }

  to_parts(
    fen: string,
    obj: { moves: string[]; percentage: number }
  ): { prompt: string; answer: string; img_url: string } {
    const moves = obj.moves.slice();
    const answer = moves.pop();

    const parts = [];
    this.chess.load(fen);
    var is_white = this.chess.turn() === "w";
    if (!is_white) parts.unshift(["..."]);

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

    parts.unshift([obj.percentage.toFixed(2)]);

    const img_url = `http://fen-to-image.com/image/${
      iterate_fen.split(" ")[0]
    }`;
    return {
      prompt: parts
        .reverse()
        .map((p) => p.join(" "))
        .join("\n"),
      answer,
      img_url,
    };
  }
}

const memorize = new Memorize();
