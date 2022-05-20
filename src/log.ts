type Move = {
  move: string;
  total: number;
  white: number;
  black: number;
  draws: number;
  averageRating: number;
};

class Log {
  div = document.getElementById("log");
  logs: HTMLDivElement[] = [];
  async log(
    fen: string,
    choice: { move: string; moves: Move[] }
  ): Promise<void> {
    const playerToMove = fen.split(" ")[1];
    const player = playerToMove === "w" ? "b" : "w";
    const move = choice.move;
    const turn = parseInt(fen.split(" ")[5]);
    const chosen = choice.moves.find((i) => i.move === choice.move) || {
      total: 0,
      draws: 0,
      white: 0,
      black: 0,
      averageRating: 0,
      move,
    };
    if (chosen.total === 0) controls.auto_reply.checked = false;
    this.append_cell(
      player,
      this.move_to_text(player, chosen, choice.moves),
      turn,
      choice.moves
    );
  }

  unlog(): void {
    if (board.fen().split(" ")[1] === "w") {
      this.div.removeChild(this.logs.shift());
    } else {
      this.logs[0].getElementsByClassName("b")[0].innerHTML = "";
    }
  }

  clear(): void {
    this.logs.forEach((l) => this.div.removeChild(l));
    this.logs = [];
  }

  append_cell(player: string, text: string, turn: number, moves: Move[]): void {
    var row: HTMLDivElement;
    if (player === "w") {
      row = document
        .getElementById("log_template")
        .cloneNode(true) as HTMLDivElement;
      row.hidden = false;
      row.id = "";
      row.setAttribute("turn", turn.toString());
      this.div.appendChild(row);
      this.logs.unshift(row);
      row.getElementsByClassName("turn")[0].innerHTML = `${turn}.`;
    } else {
      if (this.logs.length === 0) this.append_cell("w", "...", turn - 1, moves);
      row = this.logs[0];
    }
    this.write_cell(player, row, text, moves);
  }

  write_cell(
    player: string,
    row: HTMLDivElement,
    text: string,
    moves: Move[]
  ): void {
    // todo color if I blunder
    const cell = row.getElementsByClassName(player)[0] as HTMLElement;
    const orientation = board.orientation();
    const fen = board.fen();
    cell.onclick = () => {
      board.load(fen);
      if (orientation !== board.orientation()) board.flip();
    };
    cell.title = moves
      .sort((a, b) => b.total - a.total)
      .map((move) => this.move_to_text(player, move, moves))
      .join("\n");
    cell.innerHTML = text;
  }

  move_to_text(player: string, move: Move, moves: Move[]): string {
    const color = player == "w" ? "white" : "black";
    const total = moves.map((i) => i.total).reduce((a, b) => a + b, 0);
    const pick = (100 * move.total) / total;
    const best_non =
      (100 * brain.getScore(move, color)) /
      (moves
        .filter((m) => m !== move)
        .map((m) => brain.getScore(m, color))
        .sort((a, b) => b - a)[0] || 1);
    return [
      this.to_chars(move.move, 5),
      `s/${this.to_chars(Math.min(best_non, 420).toFixed(1), 5)}`,
      this.to_chars(`p/${pick.toFixed(1)}`, 6),
      this.to_chars(
        `ww/${((100 * move.white) / (move.white + move.black)).toFixed(1)}`,
        7
      ),
      this.to_chars(`d/${((100 * move.draws) / move.total).toFixed(1)}`, 7),
      this.to_chars(`t/${move.total}`, 8),
      this.to_chars(`elo/${move.averageRating}`, 9),
    ]
      .filter(Boolean)
      .join(" ");
  }

  to_chars(text: string, num: number): string {
    return text + " ".repeat(Math.max(num - text.length, 0));
  }
}

const log = new Log();
