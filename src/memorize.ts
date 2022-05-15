const percentage = 0.9;

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
    console.log("memorize", percentage);
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
              .map((parts) => parts.join("\t"))
          )
          .join("\n")
      )
      .then((str) => {
        board.load(fen);
        console.log(str);
        setTimeout(() => alert(str.split("\t").join(" //// ")), 1000);
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
      console.log(
        exploring.percentage,
        exploring.moves,
        openings.get(exploring.fen)
      );
      this.load_to_board(exploring.fen);
      await new Promise((resolve) => {
        this.resolve = resolve;
      })
        .then((from_drop) => {
          this.resolve = null;
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
    board.load(fen);
    location.hash = hash;
  }

  to_parts(
    fen: string,
    obj: { moves: string[]; percentage: number }
  ): [string, string] {
    // todo with opening and image
    const moves = obj.moves.slice();
    const last_move = moves.pop();
    moves.push(obj.percentage.toFixed(2));
    return [moves.join(" "), last_move];
  }
}

const memorize = new Memorize();
