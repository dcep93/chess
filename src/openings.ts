class Openings {
  fen_to_name = {};

  constructor() {
    ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"].forEach((f) =>
      fetch(`./eco/${f}`)
        .then((response) => response.text())
        .then((text) =>
          text
            .split("\n")
            .slice(1)
            .filter((l) => l)
            .forEach((l) => {
              const parts = l.split("\t");
              const fen = parts[2].split(" ")[0];
              this.fen_to_name[fen] = `${parts[0]} ${parts[1]}`;
            })
        )
    );
  }
}

const openings = new Openings();
