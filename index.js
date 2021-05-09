const title = document.title;
document.title = "Loading...";

Promise.all(
  ["index.ts"].map((fileName) =>
    fetch(`./src/${fileName}`)
      .then((response) => response.text())
      .then((code) => window.ts.transpile(code))
      .then(eval)
  )
)
  .then(() => main())
  .catch(alert)
  .then(() => (document.title = title));
