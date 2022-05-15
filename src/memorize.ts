const percentage = 0.01;

class Memorize {
  run() {
    console.log("memorize", percentage);
    const fen = board.fen();
    this.find_moves([{ fen, percentage: 1, moves: [] }], [])
      .then((objs) => {
        const chess = new Chess();
        return [`chess / ${openings.get(fen) || ""} / ${percentage * 100}%`]
          .concat(
            ...objs
              .map((obj) => this.to_parts(obj, chess))
              .map((parts) => parts.join("\t"))
          )
          .join("\n");
      })
      .then(console.log);
  }

  async find_moves(
    to_explore: { fen: string; percentage: number; moves: string[] }[],
    found: { moves: string[]; percentage: number }[]
  ): Promise<{ moves: string[]; percentage: number }[]> {
    if (to_explore.length === 0) return Promise.resolve(found);
    const next_to_explore = [];
    for (let i = 0; i < to_explore.length; i++) {
      const obj = to_explore[i];
      console.log(obj.percentage, obj.moves, openings.get(obj.fen));
    }
    return this.find_moves(next_to_explore, found);
  }

  to_parts(
    obj: { moves: string[]; percentage: number },
    chess: any
  ): [string, string] {
    return ["term", "definition"];
  }
}

const memorize = new Memorize();
