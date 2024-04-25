const { ESLint } = require("eslint");
const Mocha = require("mocha");
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");

const {
  ConsoleManager,
  CustomPopup,
  Progress,
  PageBuilder,
  ButtonPopup,
} = require("console-gui-tools");

const oddEvenLinesPlugin = require("eslint-plugin-odd-even-lines");
const secureVariablesPlugin = require("eslint-plugin-secure-names");
const disableOddLinesPlugin = require("eslint-plugin-disable-variables-odd-lines");
const noIfUseSwitchPlugin = require("eslint-plugin-no-if-use-switch");
const binaryVariablesPlugin = require("eslint-rule");
const sortVariablesPlugin = require("eslint-plugin-sort-vars-alphabetical");
const maxVariablesPlugin = require("eslint-plugin-max-variables");

let STATS = {
  eslint: {},
  mocha: {},
  totalTime: 0,
  timeLeft: 0,
  sources: "",
  user: "",
};

let TECH_STATS = { eslint: {}, mocha: {}, globalError: null };

async function main(challenge, rules) {
  TECH_STATS.globalError = null;
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      plugins: {
        "odd-even-lines": oddEvenLinesPlugin,
        "secure-names": secureVariablesPlugin,
        "disable-variables-odd-lines": disableOddLinesPlugin,
        "no-if-use-switch": noIfUseSwitchPlugin,
        "oi10-name-plugin": binaryVariablesPlugin,
        "sort-vars-alphabetical": sortVariablesPlugin,
        "max-variables": maxVariablesPlugin,
      },
      rules: rules,
    },
  });

  const eslinted = await eslint.lintFiles([challenge.source]);
  try {
    const mocha = new Mocha({ timeout: 1000, reporter: "min" });

    mocha.addFile(challenge.test);
    mocha.addFile(challenge.source);

    const testsResult = await new Promise((resolve, reject) => {
      const tests = [];
      const errors = [];

      const runner = mocha.run(() => resolve({ tests, errors }));
      runner.on("test", (stat) => {
        tests.push(stat);
      });

      runner.on("fail", (test, err) => {
        errors.push({ test, err });
      });
    });
    mocha.dispose();
    TECH_STATS.mocha = testsResult;
    STATS.mocha = {
      total: testsResult.tests.length,
      failed: testsResult.errors.length,
    };
  } catch (e) {
    TECH_STATS.globalError = e;
    return;
  }

  TECH_STATS.eslint = eslinted;

  STATS.eslint = { failed: eslinted[0].errorCount, source: eslinted[0].source };
}

function drawGUI(GUI, PROGRESS) {
  const PAGE = new PageBuilder({ title: "Stats" });
  PAGE.addSpacer(1);
  PAGE.addRow(
    PROGRESS,
    { text: " " },
    { text: "ESLint:", color: "white" },
    { text: " " },
    {
      text: `${STATS.eslint.failed > 0 ? `❌ ${STATS.eslint.failed}` : "✅ 0"} errors`,
      color: STATS.eslint.failed > 0 ? "red" : "green",
    },
    { text: "\t\t" },
    { text: "Unit tests:", color: "white" },
    { text: " " },
    {
      text: `${STATS.mocha.failed > 0 ? `❌ ${STATS.mocha.total - STATS.mocha.failed}` : `✅ ${STATS.mocha.total}`}/${
        STATS.mocha.total
      } tests passes`,
      color: STATS.mocha.failed > 0 ? "red" : "green",
    },
  );

  PAGE.addSpacer(2);
  TECH_STATS.eslint[0]?.messages?.forEach((m) => {
    PAGE.addRow(
      { text: `${m.line}:${m.column}`, color: "red", bold: true },
      { text: " " },
      { text: m.message, color: "white" },
    );
  });

  PAGE.addSpacer(2);
  if (STATS.mocha.failed > 0) {
    TECH_STATS.mocha.errors.forEach(({ test, err }) => {
      PAGE.addRow({
        text: `❌ ${test.parent.title} ${test.title}`,
        color: "redBright",
      });
      PAGE.addRow(
        { text: `\tОшибка assert: `, color: "white" },
        { text: err.message, color: "white" },
      );
      test.body.split(/\n+/).forEach((l) => {
        PAGE.addRow({
          text: `\t${l}`,
          color: "grey",
        });
      });
      PAGE.addSpacer(1);
    });
  }
  GUI.setPage(PAGE);
}

function ErrorPopup() {
  const p = new PageBuilder();

  const popup = new CustomPopup({
    title: "Невалидный код",
    id: "source-error-popup",
    content: p,
    width: 32,
    visible: false,
  });

  return {
    popup,
    show: (error) => {
      if (popup.isVisible()) {
        return;
      }

      p.addRow({ text: error.message, color: "red" });
      error.stack.split("\n").forEach((l) => {
        p.addRow({ text: l, color: "white" });
      });
      popup.show();
    },
    hide: () => {
      popup.hide();
    },
  };
}

function calculateScore(stats) {
  const score = 100 - stats.eslint.failed * 5 - stats.mocha.failed * 10;
  return Math.trunc(
    score + (100 * stats.timeLeft * 100) / stats.totalTime / 100.0,
  );
}

function ScorePopup(score, resolve) {
  const popup = new ButtonPopup({
    title: "Игра завершена",
    id: "score-popup",
    message: `Твой счёт: ${score}\n\n  Нажми "Ok", чтобы перезапустить игру  `,
    buttons: ["Ok"],
  })
    .show()
    .on("confirm", () => {
      popup.hide();
      resolve(score);
    });
}

const readSource = (sourcePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(sourcePath, "utf8", (err, source) => {
      if (err) {
        reject(err);
      } else {
        resolve(source);
      }
    });
  });
};

module.exports = {
  run: async ({ time, challenge, rules, onStatsChange, name }) => {
    const GUI = new ConsoleManager({
      title: "Headhunter HolyJS 2024 Challenge",
      overrideConsole: true,
      logPageSize: 10,
      logLocation: "popup",
      layoutOptions: {
        fitHeight: true,
        type: "single",
        showTitle: true,
        boxed: true,
      },
    });
    const PROGRESS = new Progress({
      id: "time-progress",
      thickness: 1,
      x: GUI.Terminal.columns / 2,
      y: 2,
      length: 32,
      units: "sec",
      theme: "dart",
      label: "∞ seconds left ",
      max: 0,

      style: {
        showPercentage: false,
        showMinMax: false,
        boxed: true,
        showBorder: true,
        showTitle: true,
        theme: "precision",
        color: "blue",
        showValue: false,
      },
    });

    GUI.on("exit", () => {
      process.exit(0);
    });

    STATS.user = name;
    STATS.totalTime = time;
    STATS.sources = await readSource(challenge.source);

    const nowSec = Date.now() / 1000;
    const maxSec = nowSec + time;

    PROGRESS.setMax(time);
    PROGRESS.setMin(0);

    const errorPopup = ErrorPopup();
    const lock = new Promise((resolve) => {
      const guiInterval = setInterval(() => {
        const now = Date.now() / 1000;
        const timeLeft = Math.trunc(maxSec - now);

        STATS.timeLeft = timeLeft;

        PROGRESS.setValue(timeLeft);
        PROGRESS.setLabel(`${timeLeft} seconds left `);
        onStatsChange({ game: STATS });
        if (TECH_STATS.globalError) {
          errorPopup.show(TECH_STATS.globalError);
        } else {
          errorPopup.hide();
        }

        if (
          (STATS.eslint.failed === 0 && STATS.mocha.failed === 0) ||
          timeLeft <= 0
        ) {
          clearInterval(guiInterval);
          watcher.unwatch("challenge/*.js");
          watcher.close();
          const score = calculateScore(STATS);
          onStatsChange({ final: { user: name, score } });
          GUI.unregisterPopup("source-error-popup");
          GUI.unregisterControl("time-progress");
          ScorePopup(score, resolve);
        }
      }, 1000);
    });
    await main(challenge, rules).catch(console.error);
    drawGUI(GUI, PROGRESS);

    const watcher = chokidar
      .watch("challenges/*.js")
      .on("change", async (path) => {
        await main(challenge, rules).catch(console.error);
        drawGUI(GUI, PROGRESS);
        STATS.sources = await readSource(challenge.source);
        onStatsChange({ game: STATS });
      });
    return lock;
  },
};
