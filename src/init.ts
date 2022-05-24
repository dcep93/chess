function init() {
  openings
    .init()
    .then(() => navigate.reset())
    .then(() => brain.on_change())
    .then(() => my_best_openings.run("dcep93"))
    .then(() => (document.body.hidden = false));
}
