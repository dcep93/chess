class Lichess {
  async get_moves(): Promise<Move[]> {
    const fen = board.chess.fen();
    return (
      await cache_w.load(fen, async () => {
        console.log("lichess", fen);
        const response = await fetch(
          `https://explorer.lichess.ovh/master?fen=${fen}`
        );
        const json = await response.json();
        return json.moves.map((m: any) => ({ move: m.san, ...m }));
      })
    ).rval;
  }
}

const lichess = new Lichess();
