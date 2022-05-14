class StorageW {
  version = "0.1.0";

  constructor() {
    if (localStorage.getItem("version") !== this.version) {
      localStorage.clear();
      localStorage.setItem("version", this.version);
    }
  }

  set_novelty(hash: string, choice: { move: string; moves: Move[] }) {
    localStorage.setItem(`novelty:${hash}`, JSON.stringify(choice));
  }

  get_novelty(hash: string): { move: string; moves: Move[] } | null {
    const str = localStorage.getItem(`novelty:${hash}`);
    if (!str) return null;
    return JSON.parse(str);
  }

  clear_novelty(hash: string) {
    localStorage.removeItem(`novelty:${hash}`);
  }

  get_lichess(url: string): Move[] | null {
    const str = localStorage.getItem(`lichess:${url}`);
    if (!str) return null;
    return JSON.parse(str);
  }

  set_lichess(url: string, moves: Move[]) {
    localStorage.setItem(`lichess:${url}`, JSON.stringify(moves));
  }
}

const storage_w = new StorageW();
