const select = require("@inquirer/select").default;
const input = require("@inquirer/input").default;
const confirm = require("@inquirer/confirm").default;
const fs = require("fs");
const path = require("path");

const RULES = {
  "odd-even-lines/odd-even-lines": "error",
  "secure-names/secure-names": ["error", { minLength: 5 }],
  "disable-variables-odd-lines/disable-variables-odd-lines": "error",
  "no-if-use-switch/no-if-use-switch": "error",
  "oi10-name-plugin/oi10-name-plugin": "error",
  "sort-vars-alphabetical/sort-vars-alphabetical": "error",
  "max-variables/max-variables": "error",
};

module.exports = {
  getAppSettings: async () => {
    const host = await input({
      message: "Enter hostname / ip address",
      default: "localhost",
    });
    const port = await input({ message: "Enter port", default: 3001 });
    const time = await input({
      message: "Enter task time in minutes",
      default: 1,
    });
    const rules = await select({
      message: "Select challenge set",
      choices: [
        {
          name: "Set 1",
          value: {
            "max-variables/max-variables": "error",
            "no-if-use-switch/no-if-use-switch": "error",
            "secure-names/secure-names": ["error", { minLength: 5 }],
            "odd-even-lines/odd-even-lines": "error",
          },
          description:
            "Even-odd lines, password-variables, no-ifs, limit on vars",
        },
        {
          name: "Set 2",
          value: {
            "sort-vars-alphabetical/sort-vars-alphabetical": "error",
            "no-if-use-switch/no-if-use-switch": "error",
            "oi10-name-plugin/oi10-name-plugin": "error",
            "max-variables/max-variables": "error",
          },
          description:
            "Even-odd lines, binary-like variables, no-ifs, sort vars alphabetically",
        },
        {
          name: "Set 3",
          value: {
            "odd-even-lines/odd-even-lines": "error",
            "disable-variables-odd-lines/disable-variables-odd-lines": "error",
            "no-if-use-switch/no-if-use-switch": "error",
            "sort-vars-alphabetical/sort-vars-alphabetical": "error",
            "max-variables/max-variables": "error",
          },
          description: "All except binary-like vars",
        },
        {
          name: "Set 4",
          value: {
            "odd-even-lines/odd-even-lines": "error",
            "disable-variables-odd-lines/disable-variables-odd-lines": "error",
            "no-if-use-switch/no-if-use-switch": "error",
            "sort-vars-alphabetical/sort-vars-alphabetical": "error",
            "max-variables/max-variables": "error",
          },
          description: "All except password vars",
        },
      ],
    });

    const challenge = await select({
      message: "Select challenge",
      choices: fs.readdirSync("challenges").map((file) => ({
        name: file.replace(".js", ""),
        value: {
          source: path.join(__dirname, "challenges", file),
          test: path.join(__dirname, "test", file.replace(".js", ".test.js")),
        },
      })),
    });

    return { host, port, time, rules, challenge };
  },

  getChallengeSettings: async () => {
    const email = await input({
      message: "Введи свой email-адрес",
      validate: (email) =>
        email.includes("@") ? true : "Введи корректный email",
    });

    const name = await input({
      message: "Введи свое имя / никнейм",
      validate: (name) => (name.length > 0 ? true : "Введи корректное имя"),
    });

    return { name, email };
  },

  getReadyState: async (name) => {
    return await confirm({ message: `${name}, нажимай Y, и мы начинаем!` });
  },
  getScoreConfirm: async (score) => {
    return await confirm({ message: `Твой счёт: ${score}` });
  },
};
