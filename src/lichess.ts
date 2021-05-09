class Lichess {
  get_moves(
    fen: string
  ): Promise<{ move: string; white: number; black: number; draws: number }[]> {
    console.log("lichess", fen);
    return fetch(`https://explorer.lichess.ovh/master?fen=${fen}`)
      .then((response) => response.json())
      .then((json) => json.moves.map((m) => ({ move: m.san, ...m })));
  }
}

const lichess = new Lichess();
