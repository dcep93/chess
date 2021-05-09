const title = document.title;
document.title = "Loading...";

Promise.all(
  ["move_history.ts", "board.ts", "controls.ts", "cache.ts", "lichess.ts"].map(
    (fileName) =>
      fetch(`./src/${fileName}`)
        .then((response) => response.text())
        .then((code) => window.ts.transpile(code))
  )
)
  .then((codes) => codes.map(eval))
  .then(() => main())
  .catch((err) => {
    alert(err);
    throw err;
  })
  .then(() => (document.title = title));

function main() {
  move_history.record();
}
