const percentage = 0.9;

class Memorize {
  form = document.getElementById("memorize_form");
  input: HTMLInputElement = document.getElementById(
    "memorize_input"
  ) as HTMLInputElement;

  run() {
    console.log("memorize", percentage);
    const fen = board.fen();
    const chess = new Chess();
    this.find_moves([{ fen, percentage: 1, moves: [] }], {}, chess)
      .then((objs) =>
        [
          `chess / ${openings.get(fen) || ""} / ${percentage * 100}% / ${
            objs.length
          }`,
        ]
          .concat(
            ...objs
              .map((obj) => this.to_parts(fen, obj, chess))
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

  // todo depth first
  // todo my_move last
  async find_moves(
    to_explore: { fen: string; percentage: number; moves: string[] }[],
    found: {
      [fen: string]: { fen: string; moves: string[]; percentage: number };
    },
    chess: ChessType
  ): Promise<{ moves: string[]; percentage: number }[]> {
    if (to_explore.length === 0) return Promise.resolve(Object.values(found));
    const next_to_explore = [];
    for (let i = 0; i < to_explore.length; i++) {
      const exploring = to_explore[i];
      console.log(
        exploring.percentage,
        exploring.moves,
        openings.get(exploring.fen)
      );
      found[exploring.fen] = exploring;
      board.load(exploring.fen);
      setTimeout(() => this.input.focus());
      await new Promise((resolve, reject) => {
        this.form.onsubmit = () => {
          // todo: I dont know button
          const my_move = this.input.value;
          board.move(my_move);
          this.input.value = "";
          const next_fen = board.fen();
          if (next_fen === exploring.fen) {
            alert("invalid move");
          } else {
            // todo print move stats
            this.input.hidden = true;
            lichess
              .get_moves(next_fen)
              .then((moves) => ({
                moves,
                total: moves
                  .map((move) => move.total)
                  .reduce((a, b) => a + b, 0),
              }))
              .then((obj) =>
                obj.moves
                  .map((move) => ({
                    percentage: (exploring.percentage * move.total) / obj.total,
                    moves: exploring.moves.concat(my_move, move.move),
                    fen: this.get_fen(next_fen, move.move, chess),
                  }))
                  .map((obj) =>
                    Object.assign(obj, {
                      short_fen: obj.fen.split(" ")[0],
                    })
                  )
                  .map((obj) =>
                    Object.assign(obj, {
                      percentage:
                        obj.percentage +
                        (found[obj.short_fen] || { percentage: 0 }).percentage,
                    })
                  )
                  .filter((obj) => obj.percentage > 1 - percentage)
              )
              .then((append_to_explore) =>
                next_to_explore.push(...append_to_explore)
              )
              .then(resolve);
          }
          return false;
        };
        this.input.hidden = false;
      });
    }
    return this.find_moves(next_to_explore, found, chess);
  }

  get_fen(starting_fen: string, move: string, chess: ChessType): string {
    chess.load(starting_fen);
    chess.move(move);
    return chess.fen();
  }

  to_parts(
    fen: string,
    obj: { moves: string[]; percentage: number },
    chess: any
  ): [string, string] {
    // todo with opening
    const moves = obj.moves.slice();
    const last_move = moves.pop();
    moves.push(obj.percentage.toFixed(2));
    return [moves.join(" "), last_move];
  }
}

const memorize = new Memorize();
