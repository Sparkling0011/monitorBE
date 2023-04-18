const userRouter = require("./user");
const projectRouter = require("./project")
const logRouter = require("./log")
const RuntimeRouter = require("./runtime")
const RequestRouter = require("./request")
const ResourceRouter = require("./resource")

module.exports = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/project", projectRouter)
  app.use("/api/log", logRouter)
  // app.use("/api/error", ErrorRouter)
  app.use("/api/request", RequestRouter)
  // app.use("/api/resource", ResourceRouter)
};
