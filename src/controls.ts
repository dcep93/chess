class Controls {
  auto_reply = document.getElementById("auto_reply") as HTMLInputElement;
  init() {
    document.getElementById("new_game").onclick = controls.new_game;
    document.getElementById("different_move").onclick = controls.different_move;
    document.getElementById("undo").onclick = move_history.undo;
    document.getElementById("redo").onclick = move_history.redo;
  }

  new_game() {
    move_history.reset();
    board.board.flip();
    board.chess.reset();
    board.rerender();
    board.maybe_reply();
  }

  different_move() {
    move_history.undo();
    board.reply().then(board.maybe_reply);
  }
}

const controls = new Controls();
