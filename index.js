const express = require("express");
const morgan = require("morgan");
const router = require("./router");
const { main } = require("./utils/connect");

const { PORT } = require("./config");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.get("/", (res) => {
  res.send("success");
});

router(app);

app.listen(PORT, async () => {
  await main()
    .then(() => console.log("数据库连接成功"))
    .catch((err) => console.log(`连接失败,${err}`));
  console.log(`Server started on http://127.0.0.1:${PORT}`);
});
