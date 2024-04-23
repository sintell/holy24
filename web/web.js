function requestStats() {
  fetch("/stats")
    .then((response) => response.json())
    .then((data) => {
      STATS = data;
      document.getElementById("eslint").innerHTML = STATS.eslint.failed;
      document.getElementById("units").innerHTML = STATS.mocha.failed;
      document.getElementById("source").innerHTML = STATS.eslint.source;
    });
}

document.addEventListener("DOMContentLoaded", (event) => {
  requestStats();
  setInterval(requestStats, 1000);
});
