const express = require("express");
const morgan = require("morgan");
const cors = require("cors")

const router = require("./router");
const { main } = require("./library/mongodb");
const { PORT } = require("./config");
const Logger = require("./library/logger")
const { addCodeToResponse } = require("./middleware/addCodeToResponse");
const { authenticateToken } = require("./middleware/privilege")
function startup() {
  const app = express();

  app.use(cors())
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json())
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  );

  app.use(addCodeToResponse);
  app.use(authenticateToken)
  app.get("/", (_req, res) => {
    res.status(200).json({ msg: "success" });
  });

  router(app);

  app.listen(PORT, async () => {
    await main()
      .then(() => console.log("数据库连接成功"))
      .catch((err) => console.log(`连接失败,${err}`));
    console.log(`Server started on http://127.0.0.1:${PORT}`);
  });
}

startup()

process.on('uncaughtException', function (err) {
  Logger.error(err + ':服务器重新启动，启动时间：' + (new Date()).toString())
  // Alert.sendMessage(WatchIdList.WATCH_UCID_LIST_DEFAULT, `[fee-rd]服务器重新启动, 原因: ${err}, 启动时间：${(new Date()).toString()}`)
  startup()
})
