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
    const chosen = choice.moves.find((i) => i.move === choice.move) || {
      total: 0,
      draws: 0,
      white: 0,
      black: 0,
      move,
    };
    if (chosen.total === 0) controls.auto_reply.checked = false;
    this._append_cell(
      player,
      this.move_to_text(chosen, choice.moves),
      turn,
      choice.moves
    );
  }

  clear(): void {
    this.logs.forEach((l) => this.div.removeChild(l));
    this.logs = [];
  }

  _append_cell(
    player: string,
    text: string,
    turn: number,
    moves: Move[]
  ): void {
    var row: HTMLDivElement;
    if (player === "b") {
      row = document
        .getElementById("log_template")
        .cloneNode(true) as HTMLDivElement;
      row.hidden = false;
      row.id = "";
      this.div.appendChild(row);
      this.logs.unshift(row);
      this._write_cell("turn", row, `${turn}.`, moves);
    } else {
      if (this.logs.length === 0) this._append_cell("b", "...", turn, moves);
      row = this.logs[0];
    }
    this._write_cell(player, row, text, moves);
  }

  _write_cell(
    className: string,
    row: HTMLDivElement,
    text: string,
    moves: Move[]
  ): void {
    // todo color if I blunder
    const cell = row.getElementsByClassName(className)[0] as HTMLElement;
    const orientation = board.board.orientation();
    const fen = board.chess.fen();
    cell.onclick = () => {
      board.chess.load(fen);
      if (orientation !== board.board.orientation()) board.board.flip();
      board.rerender();
    };
    cell.title = moves
      .sort((a, b) => b.total - a.total)
      .map((move) => this.move_to_text(move, moves))
      .join("\n");
    cell.innerHTML = text;
  }

  move_to_text(move: Move, moves: Move[]): string {
    const total = moves.map((i) => i.total).reduce((a, b) => a + b, 0);
    const pick = (100 * move.total) / total;
    const best_non =
      (100 * move.total) /
      moves.filter((m) => m !== move).sort((a, b) => b.total - a.total)[0]
        ?.total;
    return [
      this.to_chars(move.move, 5),
      this.to_chars(Math.min(best_non, 420).toFixed(1), 4),
      this.to_chars(`p/${pick.toFixed(1)}`, 6),
      this.to_chars(
        `ww/${((100 * move.white) / (move.white + move.black)).toFixed(1)}`,
        7
      ),
      this.to_chars(`d/${((100 * move.draws) / move.total).toFixed(1)}`, 7),
      this.to_chars(`t/${move.total}`, 8),
    ].join(" ");
  }

  to_chars(text: string, num: number): string {
    return text + " ".repeat(Math.max(num - text.length, 0));
  }
}

const log = new Log();
