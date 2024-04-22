const { ESLint } = require("eslint");
const Mocha = require("mocha");
const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");

const oddEvenLinesPlugin = require("eslint-plugin-odd-even-lines");
const secureVariablesPlugin = require("eslint-plugin-secure-names");
const disableOddLinesPlugin = require("eslint-plugin-disable-variables-odd-lines");
const noIfUseSwitchPlugin = require("eslint-plugin-no-if-use-switch");
const binaryVariablesPlugin = require("eslint-rule");
const sortVariablesPlugin = require("eslint-plugin-sort-vars-alphabetical");
const maxVariablesPlugin = require("eslint-plugin-max-variables");

let STATS = { eslint: {}, mocha: {} };

const mocha = new Mocha({ timeout: 1000, reporter: "list" });
mocha.cleanReferencesAfterRun(false);

const testPath = path.join(__dirname, "test", "ch01.test.js");
mocha.addFile(testPath);

async function main() {
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
      rules: {
        "odd-even-lines/odd-even-lines": "error",
        "secure-names/secure-names": ["error", { minLength: 5 }],
        "disable-variables-odd-lines/disable-variables-odd-lines": "error",
        "no-if-use-switch/no-if-use-switch": "error",
        "oi10-name-plugin/oi10-name-plugin": "error",
        "sort-vars-alphabetical/sort-vars-alphabetical": "error",
        "max-variables/max-variables": "error",
      },
    },
  });

  // 2. Lint files.
  const eslinted = await eslint.lintFiles(["challenges/**/*0[1-9].js"]);
  const formatter = await eslint.loadFormatter("stylish");
  const eslintReult = formatter.format(eslinted);

  const testsResult = await new Promise((resolve, reject) => {
    // collect all test run results in array and pass to resolve
    const tests = [];

    const runner = mocha.run(() => resolve(tests));
    runner.on("test", (stat) => {
      tests.push(stat);
    });
  });
  mocha.dispose();

  STATS.eslint = { failed: eslinted[0].errorCount };
  STATS.mocha = {
    total: testsResult.length,
    failed: testsResult.filter((t) => t.state === "failed").length,
  };

  //write all results to global object
  console.log(eslintReult);
}

// run http server and start serving global object on port 3000
const server = require("http").createServer().listen(3001);
server.on("request", (req, res) => {
  console.log(req.url);
  switch (req.url) {
    case "/":
      res.writeHead(200, { "Content-Type": "text/html" });
      fs.readFile("web/index.html", (err, data) => {
        if (err) throw err;
        res.end(data, "utf8");
      });
      break;

    case "/web/style.css":
      res.writeHead(200, { "Content-Type": "text/css" });
      fs.readFile("web/style.css", (err, data) => {
        if (err) throw err;
        res.end(data, "utf8");
      });
      break;

    case "/web/web.js":
      res.writeHead(200, { "Content-Type": "application/javascript" });
      fs.readFile("web/web.js", (err, data) => {
        if (err) throw err;
        res.end(data, "utf8");
      });
      break;

    case "/stats":
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(STATS));
      break;

    default:
      break;
  }
});

chokidar.watch("challenges/**/*0[1-9].js").on("change", async () => {
  await main().catch(console.log);
});
