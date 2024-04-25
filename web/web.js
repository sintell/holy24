let prevSources = "";
let popup = null;
function popupOpen() {
  popup.classList.remove("popup_closed");
}
function popupClose() {
  popup.classList.add("popup_closed");
}

function setScorePopupContent(name, score) {
  popup.querySelector(".popup-content").innerHTML = `
    <div class="popup-title">Игра завершена</div>
    <div class="popup-score">${score}</div>
    <div class="popup-text">счет ${name}</div>
  `;
}

function setRulesetPopupContent(ruleset) {
  console.log(ruleset);
  popup.querySelector(".popup-content").innerHTML = `
    <div class="popup-title">Правила</div>
    <div class="popup-text"><ul class="popup-text-rules">${ruleset
      .map((rule) => `<li>${rule}</li>`)
      .join("\n")}</ul></div>
  `;
}

function requestStats() {
  fetch("/stats")
    .then((response) => response.json())
    .then((data) => {
      switch (true) {
        case !!data.prepare:
          STATS = data.prepare;
          setRulesetPopupContent(STATS.rules);
          popupOpen();
          break;

        case !!data.game: {
          popupClose();
          STATS = data.game;
          document.getElementById("eslint").innerHTML =
            STATS.eslint.failed || 0;
          if (STATS.eslint.failed > 0) {
            document
              .querySelector(".stats-box-value-eslint")
              .classList.replace("success", "failed");
          } else {
            document
              .querySelector(".stats-box-value-eslint")
              .classList.replace("failed", "success");
          }

          document.getElementById("units-failed").innerHTML =
            STATS.mocha.total - STATS.mocha.failed || 0;
          document.getElementById("units-total").innerHTML =
            STATS.mocha.total || 0;
          if (STATS.mocha.failed > 0) {
            document
              .querySelector(".stats-box-value-tests")
              .classList.replace("success", "failed");
          } else {
            document
              .querySelector(".stats-box-value-tests")
              .classList.replace("failed", "success");
          }

          if (prevSources !== STATS.sources) {
            document.getElementById("source").innerHTML = hljs.highlight(
              STATS.sources,
              { language: "javascript" },
            ).value;
            prevSources = STATS.sources;
          }

          document.getElementById("time-left").innerHTML = `${Math.trunc(
            STATS.timeLeft / 60,
          )
            .toString()
            .padStart(
              2,
              "0",
            )}:${(STATS.timeLeft % 60).toString().padStart(2, "0")}`;
          document.getElementById("user").innerHTML = STATS.user;
          break;
        }

        case !!data.final: {
          STATS = data.final;
          setScorePopupContent(STATS.user, STATS.score);
          popupOpen();
          break;
        }
        default:
          console.log(data);
      }
    });
}

document.addEventListener("DOMContentLoaded", (event) => {
  popup = document.querySelector(".popup");
  requestStats();
  setInterval(requestStats, 1000);
});
