const spawn = require("child_process").spawn;
const confirm = require("@inquirer/confirm").default;

async function main() {
  let ruleset = 0;
  while (await confirm({ message: "Начать заного?" })) {
    // ruleset will cycle through 0, 1, 2
    const child = spawn("node", ["app.js", ruleset++ % 3], {
      stdio: "inherit",
    });
    await new Promise((resolve) => child.on("exit", resolve));
  }
}

main();
