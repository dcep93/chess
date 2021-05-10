type Move = { move: string; white: number; black: number; draws: number };

class Log {
  div = document.getElementById("log");
  logs = [];
  // todo
  // if I make a brand new move, auto play is disabled and we display of move ...66 we have a brand new game
  // displays weight, stockfish for all game history (can hide)
  log(fen: string, choice: { move: string; moves: Move[] }): void {
    const player = fen.split(" ")[1];
    const move = choice.move;
    const turn = parseInt(fen.split(" ")[5]);
    this._append_cell(player, move, turn);
    console.log("log", fen);
  }

  _append_cell(player: string, move: string, turn: number): void {
    var row: HTMLDivElement;
    if (player === "b") {
      row = document
        .getElementById("log_template")
        .cloneNode(true) as HTMLDivElement;
      row.hidden = false;
      delete row.id;
      this.div.appendChild(row);
      this.logs.unshift(row);
      this._write_cell("turn", row, `${turn}.`);
    } else {
      if (this.logs.length === 0) this._append_cell("b", "...", turn);
      row = this.logs[0];
    }
    this._write_cell(player, row, move);
  }

  _write_cell(className: string, row: HTMLDivElement, move: string): void {
    row.getElementsByClassName(className)[0].innerHTML = move;
  }
}

const log = new Log();
