const ratings = {
  "1600": 1600,
  "1800": 1800,
  "2000": 2000,
  "2200": 2200,
  "2500": 2500,
};

class Lichess {
  async get_moves(
    fen: string = null,
    ratings: number[] = [1800, 2000, 2200]
  ): Promise<Move[]> {
    if (!fen) fen = board.fen();
    const ratings_str = ratings.map((r) => `&ratings[]=${r}`).join("");
    const url = `https://explorer.lichess.ovh/lichess?variant=standard&speeds[]=rapid&speeds[]=classical${ratings_str}&fen=${fen}`;
    var moves = storage_w.get_lichess(url);
    moves = null;
    if (!moves) {
      console.log(url);
      const response = await fetch(url);
      const json = await response.json();
      moves = json.moves.map((m: any) => ({
        total: m.black + m.white + m.draws,
        move: m.san,
        ...m,
      }));
      storage_w.set_lichess(url, moves);
    }
    return Promise.resolve(moves);
  }
}

const lichess = new Lichess();
