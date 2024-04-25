const config = require("./configure");
const server = require("./server");
const fs = require("fs");
const confirm = require("@inquirer/confirm").default;
const game = require("./game");

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
  const { host, port, time, rules, challenge } = await config.getAppSettings();
  console.log({ host, port, time, rules, challenge });

  const { onStatsChange, stop } = server.run({ host, port });

  const source = await cacheSource(challenge.source);

  console.clear();
  const { name, email } = await config.getChallengeSettings();

  const readyState = await config.getReadyState(name);
  if (readyState) {
    const score = await game.run(time, challenge, rules, onStatsChange);
  }
  try {
    fs.writeFileSync(challenge.source, source);
  } catch (err) {
    console.error(err);
  }
  stop();
  console.clear();
  process.exit(0);
}

app();
