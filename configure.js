const input = require("@inquirer/input").default;
const confirm = require("@inquirer/confirm").default;
const path = require("path");

module.exports = {
  getAppSettings: async () => {
    const ruleset = [
      {
        rules: {
          "max-variables/max-variables": ["error", 3],
          "no-if-use-switch/no-if-use-switch": "error",
          "secure-names/secure-names": ["error", { minLength: 5 }],
          "sort-vars-alphabetical/sort-vars-alphabetical": "error",
        },
        description: [
          "Можно использовать максимум 3 переменные",
          "Нельзя использовать конструкции if/else или тернарный оператор",
          "Имена переменных должны быть безопасными",
          "Переменные должны быть объявлены в алфавитном порядке",
        ],
      },
      {
        rules: {
          "sort-vars-alphabetical/sort-vars-alphabetical": "error",
          "no-if-use-switch/no-if-use-switch": "error",
          "oi10-name-plugin/oi10-name-plugin": "error",
          "max-variables/max-variables": ["error", 3],
        },
        description: [],
      },
      {
        rules: {
          "odd-even-lines/odd-even-lines": "error",
          "disable-variables-odd-lines/disable-variables-odd-lines": "error",
          "no-if-use-switch/no-if-use-switch": "error",
          "sort-vars-alphabetical/sort-vars-alphabetical": "error",
          "max-variables/max-variables": ["error", 3],
        },
        description: [],
      },
      {
        rules: {
          "odd-even-lines/odd-even-lines": "error",
          "disable-variables-odd-lines/disable-variables-odd-lines": "error",
          "no-if-use-switch/no-if-use-switch": "error",
          "sort-vars-alphabetical/sort-vars-alphabetical": "error",
          "max-variables/max-variables": ["error", 3],
        },
        description: [],
      },
    ];

    const config = require("./game.conf.js");

    return {
      host: config.host,
      port: config.port,
      time: config.taskTimeMinutes * 60,
      ruleset: ruleset[config.ruleSet],
      challenge: {
        source: path.join(
          __dirname,
          "challenges",
          config.challengeSourceFilename,
        ),
        test: path.join(
          __dirname,
          "test",
          config.challengeSourceFilename.replace(".js", ".test.js"),
        ),
      },
    };
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
