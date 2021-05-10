class Lichess {
  async get_moves(
    fen: string
  ): Promise<{ move: string; white: number; black: number; draws: number }[]> {
    console.log("lichess", fen);
    const response = await fetch(
      `https://explorer.lichess.ovh/master?fen=${fen}`
    );
    const json = await response.json();
    return json.moves.map((m: any) => ({ move: m.san, ...m }));
  }
}

const lichess = new Lichess();
