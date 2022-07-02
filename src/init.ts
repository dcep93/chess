function init() {
  console.log("version 1.1.0");
  Promise.resolve()
    .then(() => openings.init())
    .then(() => navigate.reset())
    .then(() => brain.on_change())
    .then(() => (document.body.hidden = false));
}
