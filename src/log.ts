type Move = {
  move: string;
  total: number;
  white: number;
  black: number;
  draws: number;
};

class Log {
  div = document.getElementById("log");
  logs = [];
  async log(
    fen: string,
    choice: { move: string; moves: Move[] }
  ): Promise<void> {
    const player = fen.split(" ")[1];
    const move = choice.move;
    const turn = parseInt(fen.split(" ")[5]);
    const chosen = choice.moves.find((i) => i.move === choice.move)?.total || 0;
    if (chosen === 0) controls.auto_reply.checked = false;
    const pick =
      (100 * chosen) /
      choice.moves.map((i) => i.total).reduce((a, b) => a + b, 0);
    const sf = await this.stockfish(fen);
    const text = `${move} - sf/${sf.toFixed(1)} p/${pick.toFixed(
      1
    )} t/${chosen}`;
    this._append_cell(player, text, turn);
  }

  async stockfish(fen: string): Promise<number> {
    // todo
    return cache_w.load(`stockfish:${fen}`, async () => 0);
  }

  _append_cell(player: string, text: string, turn: number): void {
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
    this._write_cell(player, row, text);
  }

  _write_cell(className: string, row: HTMLDivElement, text: string): void {
    row.getElementsByClassName(className)[0].innerHTML = text;
  }
}

const log = new Log();
