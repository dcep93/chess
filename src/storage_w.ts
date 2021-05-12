class StorageW {
  set_novelty(hash: string, choice: { move: string; moves: Move[] }) {
    localStorage.setItem(`novelty:${hash}`, JSON.stringify(choice));
  }

  get_novelty(hash: string): { move: string; moves: Move[] } | undefined {
    const str = localStorage.getItem(`novelty:${hash}`);
    if (!str) return undefined;
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
