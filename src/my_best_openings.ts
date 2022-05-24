class MyBestOpenings {
  MIN_PROBABILITY = 0.001;
  rval: any;
  run(userName: string) {
    return Promise.all(
      [true, false].map((is_white) => this.runHelper(userName, is_white))
    ).then((rval) => {
      this.rval = rval;
      console.log(rval);
    });
  }

  runHelper(userName: string, is_white: boolean): Promise<any> {
    const color = is_white ? "white" : "black";
    return fetch(`./src/pgns/${userName}-${color}.pgn`)
      .then((resp) => resp.text())
      .then((text) => this.pgnToGames(text, userName))
      .then((games) => this.gamesToPositions(games))
      .then((positions) => ({
        positions,
        length: Object.keys(positions).length,
      }))
      .then(({ positions, length }) =>
        Object.entries(positions)
          .map(([fen, obj]) => ({
            fen,
            score: this.getScore(obj, length),
            ...obj,
            openings: this.countOpenings(obj.openings),
          }))
          .filter((obj) => !isNaN(obj.score))
          .sort((a, b) => b.score - a.score)
      );
  }

  pgnToGames(
    text: string,
    userName: string
  ): { moves: string[]; did_win: boolean }[] {
    const games = [];
    // @ts-ignore
    const game: { moves: string[]; did_win: boolean } = {};
    text.split(/\n/g).forEach((line) => {
      if (line.trim().length === 0) return;
      if (line.startsWith("[Termination")) {
        game.did_win = line.includes(userName);
      } else if (line.startsWith("1.")) {
        game.moves = line
          .split(/ +/g)
          .filter((i) => !i.includes("."))
          .map((i) => i.trim());
        games.push({ ...game });
      }
    });

    return games;
  }

  gamesToPositions(games: { moves: string[]; did_win: boolean }[]): {
    [fen: string]: {
      count: number;
      wins: number;
      losses: number;
      openings: string[];
    };
  } {
    const chess = new Chess();
    const positions = {};
    games.forEach((game) => {
      chess.reset();
      let opening = "default";
      game.moves.concat("").forEach((move) => {
        const fen = chess.fen();
        if (positions[fen] === undefined)
          positions[fen] = { count: 0, wins: 0, losses: 0, openings: [] };
        positions[fen][game.did_win ? "wins" : "losses"]++;
        positions[fen].count++;
        const o = openings.get(fen);
        if (o) opening = o;
        positions[fen].openings.push(opening);
        if (move === "") return;
        chess.move(move);
      });
    });
    return positions;
  }

  getScore(
    position: {
      count: number;
      wins: number;
      losses: number;
      openings: string[];
    },
    length: number
  ): number {
    if (position.count < this.MIN_PROBABILITY * length) return NaN;
    const p = position.wins / position.count;
    return (p - 0.5) * Math.sqrt(position.count);
  }

  countOpenings(os: string[]): { [o: string]: number } {
    const od = {};
    os.forEach((o) => {
      if (od[o] === undefined) od[o] = 0;
      od[o]++;
    });
    return od;
  }
}

const my_best_openings = new MyBestOpenings();
