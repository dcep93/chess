class Lichess {
  async get_moves(): Promise<Move[]> {
    const fen = board.fen();
    const url = `https://explorer.lichess.ovh/lichess?variant=standard&speeds[]=classical&ratings[]=1800&ratings[]=2000&fen=${fen}`;
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
    return moves;
  }
}

const lichess = new Lichess();
