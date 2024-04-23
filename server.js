const fs = require("fs");
const Handlebars = require("handlebars");

module.exports = {
  run: ({ host, port }) => {
    let STATS = {};

    const html = fs.readFileSync("web/index.html");
    const styles = fs.readFileSync("web/style.css");
    const script = fs.readFileSync("web/web.js");

    const server = require("http").createServer().listen(port, host);
    server.on("request", (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Request-Method", "*");
      res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
      res.setHeader("Access-Control-Allow-Headers", "*");

      switch (req.url) {
        case "/":
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(html, "utf8");
          break;

        case "/web/style.css":
          res.writeHead(200, { "Content-Type": "text/css" });
          res.end(styles, "utf8");
          break;

        case "/web/web.js":
          res.writeHead(200, { "Content-Type": "application/javascript" });
          res.end(script, "utf8");
          break;

        case "/stats":
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(STATS));
          break;

        default:
          break;
      }
    });

    return {
      onStatsChange: (stats) => {
        STATS = stats;
      },
      stop: async () => {
        return new Promise((resolve) => server.close(resolve));
      },
    };
  },
};
