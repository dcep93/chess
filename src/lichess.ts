class Lichess {
  async get_moves(): Promise<Move[]> {
    const fen = board.chess.fen();
    return cache_w.load(`lichess:${fen}`, async () => {
      console.log("lichess", fen);
      const response = await fetch(
        `https://explorer.lichess.ovh/master?fen=${fen}`
      );
      const json = await response.json();
      return json.moves.map((m: any) => ({
        total: m.black + m.white + m.draws,
        move: m.san,
        ...m,
      }));
    });
  }
}

const lichess = new Lichess();
