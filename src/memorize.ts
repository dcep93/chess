const percentage = 0.5;

class Memorize {
  form = document.getElementById("memorize_form");
  input: HTMLInputElement = document.getElementById(
    "memorize_input"
  ) as HTMLInputElement;

  run() {
    console.log("memorize", percentage);
    const fen = board.fen();
    const chess = new Chess();
    this.find_moves([{ fen, percentage: 1, moves: [] }], [], {}, chess)
      .then((objs) => {
        return [`chess / ${openings.get(fen) || ""} / ${percentage * 100}%`]
          .concat(
            ...objs
              .map((obj) => this.to_parts(fen, obj, chess))
              .map((parts) => parts.join("\t"))
          )
          .join("\n");
      })
      .then((str) => {
        console.log(str);
        alert(str);
      });
  }

  async find_moves(
    to_explore: { fen: string; percentage: number; moves: string[] }[],
    found: { moves: string[]; percentage: number }[],
    seen: { [fen: string]: number },
    chess: ChessType
  ): Promise<{ moves: string[]; percentage: number }[]> {
    if (to_explore.length === 0) return Promise.resolve(found);
    const next_to_explore = [];
    for (let i = 0; i < to_explore.length; i++) {
      const exploring = to_explore[i];
      console.log(
        exploring.percentage,
        exploring.moves,
        openings.get(exploring.fen)
      );
      board.load(exploring.fen);
      await new Promise((resolve, reject) => {
        this.form.onsubmit = () => {
          // todo: I dont know button
          board.move(this.input.value);
          this.input.value = "";
          const next_fen = board.fen();
          if (next_fen === exploring.fen) {
            alert("invalid move");
          } else {
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
                    moves: exploring.moves.concat(move.move),
                    fen: this.get_fen(next_fen, move.move, chess),
                  }))
                  .map((obj) =>
                    Object.assign(obj, {
                      short_fen: obj.fen.split(" ")[0],
                    })
                  )
                  .map((obj) =>
                    Object.assign(obj, {
                      percentage: obj.percentage + (seen[obj.short_fen] || 0),
                    })
                  )
                  .map((obj) => {
                    seen[obj.short_fen] = percentage;
                    return obj;
                  })
                  .filter((obj) => obj.percentage > percentage)
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
    return this.find_moves(next_to_explore, found, seen, chess);
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
    // todo
    return ["term", "definition"];
  }
}

const memorize = new Memorize();
