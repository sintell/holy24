const cli = require("./cli");
const server = require("./server");
const fs = require("fs");

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

async function main() {
  const { host, port, time, rules, challenge } = await cli.getAppSettings();
  console.log({ host, port, time, rules, challenge });

  const { onStatsChange, stop } = server.run({ host, port });

  const source = await cacheSource(challenge.source);

  while (true) {
    console.clear();
    const { name, email } = await cli.getChallengeSettings();

    const readyState = await cli.getReadyState(name);
    if (readyState) {
      const game = require("./game");
      const score = await game.run(time, challenge, rules, onStatsChange);
      await cli.getScoreConfirm(score);
      console.clear();
    }
    fs.writeFile(challenge.source, source, () => {});
  }
}

main();
