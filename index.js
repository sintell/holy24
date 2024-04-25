const spawn = require("child_process").spawn;
const confirm = require("@inquirer/confirm").default;

async function main() {
  while (await confirm({ message: "Начать заного?" })) {
    const child = spawn("node", ["app.js"], { stdio: "inherit" });
    await new Promise((resolve) => child.on("exit", resolve));
  }
}

main();
