const my_elo = 1600;
const better_elo = 2000;

const cutoff = 0.1;
const max_depth = 1;

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
      .then((popular_fens) => popular_fens.filter((obj, i) => i < 5))
      .then((popular_fens) => {
        console.log(
          `searching ${popular_fens.length} popular openings for ${
            is_white ? "white" : "black"
          }`
        );
        return popular_fens;
      })
      .then((popular_fens) =>
        Promise.all(
          popular_fens.map((fen) =>
            Promise.all([
              lichess.get_moves(fen, [my_elo]),
              lichess.get_moves(fen, [better_elo]),
            ])
              .then((nested_moves) =>
                nested_moves
                  .map((moves) => ({
                    wins: moves
                      .map((move) => (is_white ? move.white : move.black))
                      .reduce((a, b) => a + b, 0),
                    total: moves
                      .map((move) => move.total)
                      .reduce((a, b) => a + b, 0),
                  }))
                  .map((obj) => ({ ...obj, score: obj.wins / obj.total }))
              )
              .then(([my_score, better_score]) => ({
                my_score,
                better_score,
                diff: my_score.score - better_score.score,
                fen,
              }))
          )
        )
      )
      .then((objs) => objs.sort((a, b) => b.diff - a.diff))
      .then((objs) =>
        objs.map((obj) => [
          obj.diff,
          openings.fen_to_name[obj.fen.split(" ")[0]],
          obj,
        ])
      )
      .then((objs) => objs.forEach((obj) => console.log(...obj)));
  }

  get_popular_fens(is_white: boolean, chess): Promise<string[]> {
    const fen = board.fen();
    return best_openings.get_fens_helper(
      [{ fen, percentage: 1 }],
      new Set(),
      1,
      is_white,
      chess
    );
  }

  get_fens_helper(
    fens_to_find: { fen: string; percentage: number }[],
    found_fens: Set<string>,
    move_number: number,
    is_white: boolean,
    chess: ChessType
  ): Promise<string[]> {
    if (fens_to_find.length === 0 || move_number > max_depth)
      return Promise.resolve(Array.from(found_fens));
    const next_fens_to_find: { fen: string; percentage: number }[] = [];
    return Promise.all(
      fens_to_find.map(({ fen, percentage }) =>
        lichess.get_moves(fen).then((moves) => ({
          moves: moves.sort((a, b) => b.total - a.total),
          total: moves.map((move) => move.total).reduce((a, b) => a + b, 0),
          fen,
          percentage,
        }))
      )
    )
      .then((objs) =>
        objs.map((obj) =>
          obj.moves
            .map((move) => ({
              percentage:
                Boolean(move_number % 2) === is_white
                  ? obj.percentage
                  : (obj.percentage * move.total) / obj.total,
              fen: best_openings.get_next_fen(obj.fen, move.move, chess),
            }))
            .filter((next_obj) => !found_fens.has(next_obj.fen)) // small bug if games transpose
            .map((next_obj) => {
              next_fens_to_find.push(next_obj);
              found_fens.add(next_obj.fen);
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
}

const best_openings = new BestOpenings();
