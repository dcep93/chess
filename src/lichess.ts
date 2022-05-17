const ratings = {
  "1600": 1600,
  "1800": 1800,
  "2000": 2000,
  "2200": 2200,
  "2500": 2500,
};

class Lichess {
  chess = new Chess();
  async get_moves(
    fen: string = null,
    ratings: [number, number] = [1800, 2200],
    attempt: number = 1,
    is_original: boolean = true
  ): Promise<Move[]> {
    if (!fen) fen = board.fen();
    const url = `https://explorer.lichess.ovh/lichess?variant=standard&speeds=rapid,classical&ratings=${ratings.join(
      ","
    )}&fen=${fen}`;
    var moves = storage_w.get_lichess(url);
    if (!moves) {
      console.log("fetching", attempt, url);
      const response = await fetch(url);
      if (!response.ok)
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            lichess
              .get_moves(fen, ratings, attempt + 1)
              .then((moves) => resolve(moves));
          }, 1000)
        );
      const json = await response.json();
      moves = json.moves.map((m: any) => ({
        total: m.black + m.white + m.draws,
        move: m.san,
        ...m,
      }));
      storage_w.set_lichess(url, moves);
    }
    if (is_original)
      moves.map((move) => {
        this.chess.load(fen);
        this.chess.move(move);
        const new_fen = this.chess.fen();
        lichess.get_moves(new_fen, ratings, attempt + 1, false);
      });
    lichess.chess;
    return Promise.resolve(moves);
  }
}

const lichess = new Lichess();
