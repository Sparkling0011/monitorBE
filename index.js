const express = require("express");
const morgan = require("morgan");
const cors = require("cors")
const bodyParser = require('body-parser');

const router = require("./router");
const { main } = require("./library/mongodb");
const config = require("./config/app");
const Logger = require("./library/logger")
const { addCodeToResponse, errorHandler } = require("./middleware/util");
const { authenticateToken } = require("./middleware/privilege")
function startup() {
  const app = express();

  app.use(cors())
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json())
  app.use(bodyParser.raw({ type: 'application/octet-stream' }));
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  );

  app.use(addCodeToResponse);
  app.use(authenticateToken)
  app.get("/", (_req, res) => {
    res.status(200).json({ msg: "success" });
  });

  router(app);
  app.use(errorHandler)

  app.listen(config.port, async () => {
    await main()
      .then(() => Logger.log("数据库连接成功"))
      .catch((err) => Logger.error(`连接失败,${err}`));
    Logger.log(`${config.name} listening on port ${config.port}`)
  });
}

startup()

// process.on('uncaughtException', function (err) {
//   Logger.error(err + ':服务器重新启动，启动时间：' + (new Date()).toString())
//   startup()
// })
