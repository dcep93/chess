function init() {
  openings
    .init()
    .then(() => navigate.reset())
    .then(() => brain.on_change())
    .then(() => (document.body.hidden = false));
}
