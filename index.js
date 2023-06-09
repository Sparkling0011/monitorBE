const express = require("express");
const morgan = require("morgan");
const cors = require("cors")
const fs = require("fs")
const https = require("https")
const bodyParser = require('body-parser');

const router = require("./router");
const { main } = require("./library/mongodb");
const config = require("./config/app");
const env = require("./config/env")
const Logger = require("./library/logger")
const { addCodeToResponse, errorHandler } = require("./middleware/util");
const { authenticateToken, appendProjectInfo } = require("./middleware/privilege")

function startup(env) {
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
  app.use(appendProjectInfo)
  router(app);
  app.use(errorHandler)

  if (env === "production") {
    const options = {
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/www.nebulanimble.site/fullchain.pem"
      ),
      key: fs.readFileSync(
        "/etc/letsencrypt/live/www.nebulanimble.site/privkey.pem"
      ),
    };
    https.createServer(options, app).listen(config.port, async () => {
      await main()
        .then(() => Logger.log("数据库连接成功"))
        .catch((err) => Logger.error(`连接失败,${err}`));
      Logger.log(`${config.name} listening on port ${config.port}`)
    });
  } else if (env === "development") {
    app.listen(config.port, async () => {
      await main()
        .then(() => Logger.log("数据库连接成功"))
        .catch((err) => Logger.error(`连接失败,${err}`));
      Logger.log(`${config.name} listening on port ${config.port}`)
    })
  }
}

startup(env)

// process.on('uncaughtException', function (err) {
//   Logger.error(err + ':服务器重新启动，启动时间：' + (new Date()).toString())
//   startup()
// })
