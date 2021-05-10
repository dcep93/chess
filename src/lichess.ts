type Move = { move: string; white: number; black: number; draws: number };

class Lichess {
  async _get_moves(fen: string): Promise<Move[]> {
    console.log("lichess", fen);
    const response = await fetch(
      `https://explorer.lichess.ovh/master?fen=${fen}`
    );
    const json = await response.json();
    return json.moves.map((m: any) => ({ move: m.san, ...m }));
  }

  async get_moves(): Promise<Move[]> {
    const fen = board.chess.fen();
    return (await cache_w.load(fen, () => this._get_moves(fen))).rval;
  }
}

const lichess = new Lichess();
