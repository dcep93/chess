const title = document.title;
document.title = "Loading...";

Promise.all(
        [
            "storage_w.ts",
            "brain.ts",
            "navigate.ts",
            "board.ts",
            "memorize.ts",
            "controls.ts",
            "lichess.ts",
            "log.ts",
            "openings.ts",
            "init.ts",
            "best_openings.ts",
        ].map((fileName) =>
            fetch(`./src/${fileName}`)
            .then((response) => response.text())
            .then((code) => window.ts.transpile(code))
        )
    )
    .then((codes) => codes.map(eval))
    .then(() => init())
    .catch((err) => {
        alert(err);
        throw err;
    })
    .then(() => (document.title = title));