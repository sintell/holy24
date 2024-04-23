const { ESLint } = require("eslint");
const Mocha = require("mocha");
const chokidar = require("chokidar");
const path = require("path");
const { inspect } = require("util");

const {
  ConsoleManager,
  CustomPopup,
  Progress,
  PageBuilder,
} = require("console-gui-tools");

const oddEvenLinesPlugin = require("eslint-plugin-odd-even-lines");
const secureVariablesPlugin = require("eslint-plugin-secure-names");
const disableOddLinesPlugin = require("eslint-plugin-disable-variables-odd-lines");
const noIfUseSwitchPlugin = require("eslint-plugin-no-if-use-switch");
const binaryVariablesPlugin = require("eslint-rule");
const sortVariablesPlugin = require("eslint-plugin-sort-vars-alphabetical");
const maxVariablesPlugin = require("eslint-plugin-max-variables");
const { title } = require("process");

let STATS = { eslint: {}, mocha: {} };

const GUI = new ConsoleManager({
  title: "Headhunter HolyJS 2024 Challenge",
  overrideConsole: true,
  logPageSize: 10,
  layoutOptions: {
    fitHeight: false,
    type: "single",
    showTitle: true,
    boxed: true,
  },
});
const PROGRESS = new Progress({
  id: "time-progress",
  x: 1,
  y: 1,
  units: "seconds",
  theme: "dart",
  label: "∞ seconds left ",
  style: {
    showPercentage: true,
    showMinMax: false,
  },
});

GUI.on("exit", () => {
  process.exit(0);
});

let TECH_STATS = { eslint: {}, mocha: {} };

async function main(challenge, rules) {
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

  const mocha = new Mocha({ timeout: 1000, reporter: "min" });

  try {
    mocha.addFile(challenge.test);
    mocha.addFile(challenge.source);
  } catch (e) {
    console.log(e);
  }
  const eslinted = await eslint.lintFiles([challenge.source]);
  console.log("done eslint");

  const testsResult = await new Promise((resolve, reject) => {
    const tests = [];

    const runner = mocha.run(() => resolve(tests));
    runner.on("test", (stat) => {
      tests.push(stat);
    });
  });
  mocha.dispose();
  console.log("done mocha");

  TECH_STATS.eslint = eslinted;
  TECH_STATS.mocha = testsResult;

  STATS.eslint = { failed: eslinted[0].errorCount, source: eslinted[0].source };
  STATS.mocha = {
    total: testsResult.length,
    failed: testsResult.filter((t) => t.state === "failed").length,
  };
}

function drawGUI() {
  console.clear();
  const PAGE = new PageBuilder({ title: "Stats" });
  PAGE.addRow(PROGRESS);
  PAGE.addSpacer(2);

  PAGE.addRow(
    { text: "ESLint:", color: "white" },
    { text: " " },
    {
      text: `${STATS.eslint.failed > 0 ? `❌ ${STATS.eslint.failed}` : "✅ 0"} errors`,
      color: STATS.eslint.failed > 0 ? "red" : "green",
    },
    { text: "\t\t" },
    { text: "Mocha:", color: "white" },
    { text: " " },
    {
      text: `${STATS.mocha.failed > 0 ? `❌ ${STATS.mocha.total - STATS.mocha.failed}` : `✅ ${STATS.mocha.total}`}/${
        STATS.mocha.total
      }`,
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
    TECH_STATS.mocha
      .filter((t) => t.state === "failed")
      .forEach((m) => {
        PAGE.addRow({
          text: `❌ ${m.parent.title} ${m.title}`,
          color: "redBright",
        });
        m.body.split(/\n+/).forEach((l) => {
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

module.exports = {
  run: async (time, challenge, rules, onStatsChange) => {
    const nowSec = Date.now() / 1000;
    const maxSec = nowSec + time * 60;
    PROGRESS.setMax(time * 60);
    console.log("before lock");

    const lock = new Promise((resolve) => {
      const guiInterval = setInterval(() => {
        const now = Date.now() / 1000;
        const timeLeft = maxSec - now;

        PROGRESS.setValue(Math.trunc(now - nowSec));
        PROGRESS.setLabel(`${Math.trunc(timeLeft)} seconds left `);

        if (
          (STATS.eslint.failed === 0 && STATS.mocha.failed === 0) ||
          timeLeft <= 0
        ) {
          clearInterval(guiInterval);
          watcher.unwatch(challenge.source);
          drawGUI();
          resolve();
        }
      }, 1000);
    });
    console.log("after lock");
    await main(challenge, rules).catch(console.error);
    console.log("after first main");
    drawGUI();
    console.log("after first draw");

    const watcher = chokidar.watch("challenges/*.js").on("change", async () => {
      await main(challenge, rules).catch(console.error);
      drawGUI();
      onStatsChange(STATS);
    });

    await lock;
  },
};
