"use strict";
const express = require("express");
const httpErrors = require("http-errors");
const path = require("path");
const ejs = require("ejs");
const pino = require("pino");
const cors = require("cors");
const pinoHttp = require("pino-http");

module.exports = function main(options, cb) {
  const ready = cb || function () {};
  const opts = Object.assign({}, options);

  const logger = pino();

  let server;
  let serverStarted = false;
  let serverClosing = false;

  function unhandledError(err) {
    logger.error(err);
    if (serverClosing) {
      return;
    }
    serverClosing = true;
    if (serverStarted) {
      server.close(function () {
        process.exit(1);
      });
    }
  }
  process.on("uncaughtException", unhandledError);
  process.on("unhandledRejection", unhandledError);

  const app = express();

  app.engine("html", ejs.renderFile);
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "html");
  app.use(cors({ origin: "*" }));
  app.use(pinoHttp({ logger }));
  app.use(express.json());
  require("./routes")(app, opts);
  app.use(function fourOhFourHandler(req, res, next) {
    next(httpErrors(404, `Route not found: ${req.url}`));
  });
  app.use(function fiveHundredHandler(err, req, res, next) {
    if (err.status >= 500) {
      logger.error(err);
    }
    res.locals.name = ".";
    res.locals.error = err;
    res.status(err.status || 500).render("error");
  });
  server = app.listen(opts.port, opts.host, function (err) {
    if (err) {
      return ready(err, app, server);
    }
    if (serverClosing) {
      return ready(new Error("Server was closed before it could start"));
    }

    serverStarted = true;
    const addr = server.address();
    logger.info(
      `Started at ${opts.host || addr.host || "localhost"}:${addr.port}`
    );
    ready(err, app, server);
  });
};
