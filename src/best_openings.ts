const cutoff = 0.2;
const max_depth = 5;

class BestOpenings {
  run() {
    const chess = new Chess();
    const promise = Promise.resolve()
      .then(() => best_openings.run_helper(true, chess))
      .then(() => best_openings.run_helper(false, chess));
    return null;
  }

  run_helper(is_white: boolean, chess) {
    return best_openings
      .get_popular_fens(is_white, chess)
      .then((popular_fens) => Object.entries(popular_fens))
      .then((popular_fens) => {
        console.log(
          `searching ${popular_fens.length} popular openings for ${
            is_white ? "white" : "black"
          }`
        );
        return popular_fens;
      })
      .then((popular_fens) => best_openings.get_objs(popular_fens, is_white))
      .then((objs) => objs.sort((a, b) => b.score - a.score))
      .then((objs) => objs.filter((obj) => obj.score > 0.5))
      .then((objs) =>
        objs
          .flatMap((obj) => [
            [
              obj.score,
              obj.percentage,
              openings.fen_to_name[obj.fen.split(" ")[0]],
              obj.moves.join(" "),
            ],
            [obj],
            ["\n"],
          ])
          .concat([["\n\n\n\n"]])
      )
      .then((objs) => objs.forEach((obj) => console.log(...obj)));
  }

  get_popular_fens(
    is_white: boolean,
    chess
  ): Promise<{ [fen: string]: { percentage: number; moves: string[] } }> {
    const fen = board.fen();
    return best_openings.get_fens_helper(
      [{ fen, percentage: 1, moves: [] }],
      {},
      1,
      is_white,
      chess
    );
  }

  get_fens_helper(
    fens_to_find: { fen: string; percentage: number; moves: string[] }[],
    found_fens: { [fen: string]: { percentage: number; moves: string[] } },
    move_number: number,
    is_white: boolean,
    chess: ChessType
  ): Promise<{ [fen: string]: { percentage: number; moves: string[] } }> {
    if (fens_to_find.length === 0 || move_number > max_depth)
      return Promise.resolve(found_fens);
    const next_fens_to_find: {
      fen: string;
      percentage: number;
      moves: string[];
    }[] = [];
    return Promise.all(
      fens_to_find.map(({ fen, percentage, moves }) =>
        lichess.get_moves(fen).then((next_moves) => ({
          next_moves: next_moves.sort((a, b) => b.total - a.total),
          total: next_moves
            .map((move) => move.total)
            .reduce((a, b) => a + b, 0),
          fen,
          percentage,
          moves,
        }))
      )
    )
      .then((objs) =>
        objs.map((obj) =>
          obj.next_moves
            .map((move) => ({
              move,
              percentage:
                Boolean(move_number % 2) === is_white
                  ? obj.percentage
                  : parseFloat(
                      ((obj.percentage * move.total) / obj.total).toFixed(2)
                    ),
              fen: best_openings.get_next_fen(obj.fen, move.move, chess),
            }))
            .map((move) => ({
              ...move,
              moves: obj.moves.concat(
                Boolean(move_number % 2) === is_white
                  ? move.move.move
                  : `${move.move.move}:${move.percentage}`
              ),
            }))
            .filter(
              (next_obj) =>
                (is_white ? next_obj.move.white : next_obj.move.black) >
                0.4 * next_obj.move.total
            )
            .filter((next_obj) => next_obj.percentage > cutoff)
            .filter((next_obj) => !found_fens[next_obj.fen]) // small bug if games transpose
            .map((next_obj) => {
              next_fens_to_find.push(next_obj);
              found_fens[next_obj.fen] = next_obj;
            })
        )
      )
      .then(() =>
        best_openings.get_fens_helper(
          next_fens_to_find.sort((a, b) => b.percentage - a.percentage),
          found_fens,
          move_number + 1,
          is_white,
          chess
        )
      );
  }

  get_next_fen(fen: string, move: string, chess: ChessType): string {
    chess.load(fen);
    chess.move(move);
    return chess.fen();
  }

  async get_objs(
    popular_fens: [string, { percentage: number; moves: string[] }][],
    is_white: boolean
  ): Promise<
    {
      fen: string;
      moves: string[];
      diff: number;
      percentage: number;
      score: number;
    }[]
  > {
    const rval = [];
    for (let i = 0; i < popular_fens.length; i++) {
      const [fen, { percentage, moves }] = popular_fens[i];

      await lichess
        .get_moves(fen)
        .then((moves) => ({
          wins: moves
            .map((move) => (is_white ? move.white : move.black))
            .reduce((a, b) => a + b, 0),
          total: moves.map((move) => move.total).reduce((a, b) => a + b, 0),
        }))
        .then((obj) => ({
          ...obj,
          score: parseFloat((obj.wins / obj.total).toFixed(2)),
        }))
        .then((obj) => ({
          ...obj,
          fen,
          moves,
          percentage,
        }))
        .then((obj) => rval.push(obj));
    }
    return rval;
  }
}

const best_openings = new BestOpenings();
