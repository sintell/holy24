module.exports = {
  // string, host to run http server
  host: "localhost",
  // number, port to run http server
  port: 3001,
  // number, time in minutes
  taskTimeMinutes: 5,
  // number, index of the ruleset; see configure.js
  ruleSet: 0,
  // string, filename for the challenge to run will be auto-converted to full path
  // challengeSourceFilename: "stack_challenge.js",
  challengeSourceFilename: "quicksort_challenge.js",
};
