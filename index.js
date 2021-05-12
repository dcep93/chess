const title = document.title;
document.title = "Loading...";

Promise.all(
  [
    "storage_w.ts",
    "brain.ts",
    "navigate.ts",
    "board.ts",
    "controls.ts",
    "lichess.ts",
    "log.ts",
    "openings.ts",
  ].map((fileName) =>
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
  navigate.init();
}
