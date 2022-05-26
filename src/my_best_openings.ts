// https://openingtree.com/
// my_best_openings.run("dcep93")

class MyBestOpenings {
  MIN_PROBABILITY = 0.001;
  MAX_MS_OLD = 365 * 24 * 60 * 60 * 1000;
  NUM_MOVES_PER_GAME = 10;
  NUM_POSITIONS = 25;
  rval: any;
  run(userName: string, reverse: boolean) {
    return Promise.all(
      [true, false].map((is_white) => this.runHelper(userName, is_white))
    )
      .then((objs) =>
        objs
          .flatMap((i) => i)
          .filter((obj) => !isNaN(obj.score))
          .map((obj) =>
            Object.assign(obj, { score: obj.score * (reverse ? -1 : 1) })
          )
          .sort((a, b) => a.score - b.score)
      )
      .then((objs) => this.filterFirst(objs, (obj) => obj.o))
      .then((objs) =>
        objs
          .map((obj) => Object.assign(obj, { score: this.num(obj.score) }))
          .slice(0, this.NUM_POSITIONS)
      )
      .then((rval) => {
        this.rval = rval;
        console.log(rval);
      });
  }

  runHelper(
    userName: string,
    is_white: boolean
  ): Promise<{ score: number; o: string }[]> {
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
        Object.entries(positions).map(([fen, obj]) => ({
          c: is_white ? "w" : "b",
          o: this.mostCommon(obj.openings),
          p: this.num(obj.wins / obj.count),
          score: this.getScore(obj, length),
          count: obj.count,
          wins: obj.wins,
          moves: obj.moves,
          fen,
        }))
      );
  }

  pgnToGames(
    text: string,
    userName: string
  ): { moves: string[]; did_win: boolean }[] {
    const games = [];
    // @ts-ignore
    const game: { ms_old: number; moves: string[]; did_win: boolean } = {};
    const now = Date.now();
    text.split(/\n/g).forEach((line) => {
      if (line.trim().length === 0) return;
      if (line.startsWith("[Termination")) {
        game.did_win = line.includes(userName);
      } else if (line.startsWith("[UTCDate")) {
        game.ms_old = now - Date.parse(line.split('"')[1]);
      } else if (line.startsWith("1.")) {
        game.moves = line
          .split(/ +/g)
          .filter((i) => !i.includes("."))
          .map((i) => i.trim());
        games.push({ ...game });
      }
    });

    return games.filter((game) => game.ms_old < this.MAX_MS_OLD);
  }

  gamesToPositions(games: { moves: string[]; did_win: boolean }[]): {
    [fen: string]: {
      count: number;
      wins: number;
      openings: string[];
      moves: string[];
    };
  } {
    const chess = new Chess();
    const positions = {};
    games.forEach((game) => {
      chess.reset();
      let opening = "default";
      game.moves
        .concat("")
        .slice(0, this.NUM_MOVES_PER_GAME)
        .forEach((move, i) => {
          const fen = chess.fen();
          if (positions[fen] === undefined)
            positions[fen] = {
              count: 0,
              wins: 0,
              openings: [],
              moves: game.moves.slice(0, i),
            };
          if (game.did_win) positions[fen].wins++;
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
      openings: string[];
    },
    length: number
  ): number {
    if (position.count < this.MIN_PROBABILITY * length) return NaN;
    const p = position.wins / position.count;
    return (p - 0.5) * Math.sqrt(position.count);
  }

  mostCommon(os: string[]): string {
    const od: { [key: string]: number } = {};
    os.forEach((o) => {
      if (od[o] === undefined) od[o] = 0;
      od[o]++;
    });
    return Object.entries(od)
      .map(([key, val]) => ({ key, val }))
      .sort((a, b) => b.val - a.val)[0].key;
  }

  num(n: number): number {
    return parseFloat(n.toFixed(2));
  }

  filterFirst<T>(objs: T[], f: (T) => any): T[] {
    const keys = new Set();
    return objs.filter((obj) => {
      const key = f(obj);
      if (keys.has(key)) return false;
      keys.add(key);
      return true;
    });
  }
}

const my_best_openings = new MyBestOpenings();
