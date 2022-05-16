const percentage = 0.7;

type MemorizeMove = {
  fen: string;
  percentage: number;
  moves: string[];
};

class Memorize {
  chess = new Chess();
  resolve = null;
  reject = null;

  callback(from_drop: boolean) {
    if (this.resolve === null) return false;
    this.resolve(from_drop);
    return true;
  }

  run() {
    console.log("memorize", percentage);
    if (this.reject) this.reject();
    const fen = board.fen();
    Promise.resolve()
      .then(() =>
        board.is_my_turn()
          ? [{ fen, percentage: 1, moves: [] }]
          : this.get_opponent_moves({ fen, percentage: 1, moves: [] })
      )
      .then((to_explore) => this.find_moves(to_explore, {}))
      .then((objs) =>
        [
          `chess / ${openings.get(fen) || ""} / ${percentage * 100}% / ${
            objs.length
          }`,
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
      [fen: string]: MemorizeMove;
    }
  ): Promise<MemorizeMove[]> {
    for (let i = 0; i < to_explore.length; i++) {
      const exploring = to_explore[i];
      this.load_to_board(exploring.fen);
      await new Promise((resolve, reject) => {
        [this.resolve, this.reject] = [resolve, reject];
      })
        .then((from_drop) => {
          [this.resolve, this.reject] = [null, null];
          return from_drop;
        })
        .then((from_drop) => {
          const my_move = board.last_move();
          const next_fen = this.get_fen(exploring.fen, my_move);
          const short_fen = next_fen.split(" ")[0];
          const moved = {
            percentage:
              exploring.percentage +
              (found[short_fen] || { percentage: 0 }).percentage,
            moves: exploring.moves.concat(my_move),
            fen: next_fen,
          };
          found[short_fen] = moved;
          if (from_drop)
            return this.get_opponent_moves(moved).then((next_to_explore) =>
              this.find_moves(next_to_explore, found)
            );
        });
    }
    return Promise.resolve(Object.values(found));
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
          .filter((obj) => obj.percentage > 1 - percentage)
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
