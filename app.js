const config = require("./configure");
const server = require("./server");
const fs = require("fs");
const game = require("./game");
const path = require("path");

async function cacheSource(sourcePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(sourcePath, "utf8", (err, source) => {
      if (err) {
        reject(err);
      } else {
        resolve(source);
      }
    });
  });
}

async function app() {
  let forceRuleset = null;
  if (process.argv.length > 2) {
    forceRuleset = process.argv[2];
  }
  const { host, port, time, ruleset, challenge } =
    await config.getAppSettings(forceRuleset);
  console.log({ host, port, time, ruleset, challenge });

  const { onStatsChange, stop } = server.run({ host, port });
  onStatsChange({ prepare: { rules: ruleset.description } });

  const source = await cacheSource(challenge.source);

  console.clear();
  const { name, email } = await config.getChallengeSettings();
  console.log("Правила:");
  ruleset.description.forEach((rule) => console.log("-", rule));

  const readyState = await config.getReadyState(name);
  if (readyState) {
    const score = await game.run({
      time,
      challenge,
      rules: ruleset.rules,
      onStatsChange,
      name,
    });

    try {
      fs.appendFileSync(
        path.join(__dirname, "results.csv"),
        `${name},${email},${score}\n`,
      );
      fs.writeFileSync(challenge.source, source);
    } catch (err) {
      console.error(err);
      fs.writeFileSync("error.txt", err.message);
    }
  }
  stop();
  // console.clear();
  process.exit(0);
}

app();
