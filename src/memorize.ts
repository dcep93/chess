const percentage = 0.9;

class Memorize {
  form = document.getElementById("memorize_form");
  input: HTMLInputElement = document.getElementById(
    "memorize_input"
  ) as HTMLInputElement;
  chess = new Chess();

  run() {
    console.log("memorize", percentage);
    const fen = board.fen();
    this.find_moves([{ fen, percentage: 1, moves: [] }], {})
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

  // todo depth first
  // todo my_move last
  async find_moves(
    to_explore: { fen: string; percentage: number; moves: string[] }[],
    found: {
      [fen: string]: { fen: string; moves: string[]; percentage: number };
    }
  ): Promise<{ moves: string[]; percentage: number }[]> {
    for (let i = 0; i < to_explore.length; i++) {
      const exploring = to_explore[i];
      console.log(
        exploring.percentage,
        exploring.moves,
        openings.get(exploring.fen)
      );
      found[exploring.fen] = exploring;
      this.load_to_board(exploring.fen);
      setTimeout(() => this.input.focus());
      await new Promise((resolve) => {
        this.form.onsubmit = () => {
          // todo: I dont know button
          const my_move = this.input.value;
          this.input.value = "";
          const next_fen = this.get_fen(exploring.fen, my_move);
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
                    fen: this.get_fen(next_fen, move.move),
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
              .then((next_to_explore) =>
                this.find_moves(next_to_explore, found)
              )
              .then(resolve);
          }
          return false;
        };
        this.input.hidden = false;
      });
    }
    return Promise.resolve(Object.values(found));
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
    // todo with opening
    const moves = obj.moves.slice();
    const last_move = moves.pop();
    moves.push(obj.percentage.toFixed(2));
    return [moves.join(" "), last_move];
  }
}

const memorize = new Memorize();
