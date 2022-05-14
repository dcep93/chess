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
    ratings: [number, number] = [1800, 2200]
  ): Promise<Move[]> {
    if (!fen) fen = board.fen();
    const url = `https://explorer.lichess.ovh/lichess?variant=standard&speeds=rapid,classical&ratings=${ratings.join(
      ","
    )}&fen=${fen}`;
    var moves = storage_w.get_lichess(url);
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
