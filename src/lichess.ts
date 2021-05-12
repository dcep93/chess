class Lichess {
  async get_moves(): Promise<Move[]> {
    const fen = board.fen();
    const url = `https://explorer.lichess.ovh/lichess?variant=standard&speeds[]=classical&ratings[]=1800&ratings[]=2000&fen=${fen}`;
    const str = localStorage.getItem(url);
    if (str !== null) return JSON.parse(str);
    console.log(url);
    const response = await fetch(url);
    const json = await response.json();
    const moves = json.moves.map((m: any) => ({
      total: m.black + m.white + m.draws,
      move: m.san,
      ...m,
    }));
    localStorage.setItem(url, JSON.stringify(moves));
    return moves;
  }
}

const lichess = new Lichess();
