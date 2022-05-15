const percentage = 0.01;

class Memorize {
  run() {
    console.log("memorize", percentage);
    this.helper()
      .then((moves_arr) => moves_arr.map((moves) => moves).join("\n"))
      .then(console.log);
  }

  helper(): Promise<any[]> {
    return Promise.resolve([]);
  }
}

const memorize = new Memorize();
