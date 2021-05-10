type Move = { move: string; white: number; black: number; draws: number };

class Log {
  // todo
  // if I make a brand new move, auto play is disabled and we display of move ...66 we have a brand new game
  // displays weight, stockfish for all game history (can hide)
  log(fen: string, choice: { move: string; moves: Move[] }): void {
    console.log("log", choice);
  }
}

const log = new Log();
