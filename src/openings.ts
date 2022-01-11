class Openings {
  fen_to_name = {};

  init(): Promise<void> {
    return Promise.all(
      ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"].map((f) =>
        fetch(`./vendor/eco/dist/${f}`)
          .then((response) => response.text())
          .then((text) =>
            text
              .split("\n")
              .slice(1)
              .filter((l) => l)
              .map((l) => l.split("\t"))
              .forEach((parts) => {
                const fen = parts[4].split(" ")[0];
                this.fen_to_name[fen] = `${parts[0]} ${parts[1]}`;
              })
          )
      )
    ).then(() => null);
  }
}

const openings = new Openings();
