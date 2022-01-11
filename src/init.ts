function init() {
  openings
    .init()
    .then(() => navigate.record(null))
    .then(() => brain.on_change())
    .then(() => (document.body.hidden = false));
}
