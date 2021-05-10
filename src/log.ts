class Log {
  log(fen: string, choice: { move: string; moves: Move[] }): void {
    console.log("log", choice);
  }
}

const log = new Log();
