class Lichess {
  async get_moves(fen: string = ""): Promise<Move[]> {
    if (!fen) fen = board.chess.fen();
    const url = `https://explorer.lichess.ovh/lichess?variant=standard&speeds[]=classical&ratings[]=1800&ratings[]=2000&fen=${fen}`;
    const str = localStorage.getItem(url);
    if (str !== null) return JSON.parse(str);
    console.log(url);
    const response = await fetch(url);
    const json = await response.json();
    return json.moves.map((m: any) => ({
      total: m.black + m.white + m.draws,
      move: m.san,
      ...m,
    }));
  }
}

const lichess = new Lichess();
