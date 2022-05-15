const percentage = 0.01;

class Memorize {
  run() {
    console.log("memorize", percentage);
    const fen = board.fen();
    this.helper([{ fen, percentage: 1, moves: [] }], [])
      .then((objs) => {
        const chess = new Chess();
        return objs
          .map((obj) => this.to_parts(obj, chess))
          .map((parts) => parts.join("\t"))
          .join("\n");
      })
      .then(console.log);
  }

  helper(
    to_explore: { fen: string; percentage: number; moves: string[] }[],
    found: { moves: string[]; percentage: number }[]
  ): Promise<{ moves: string[]; percentage: number }[]> {
    if (to_explore.length === 0) return Promise.resolve(found);
    throw Exception("not implemented");
  }

  to_parts(
    obj: { moves: string[]; percentage: number },
    chess: any
  ): [string, string] {
    return ["term", "definition"];
  }
}

const memorize = new Memorize();
