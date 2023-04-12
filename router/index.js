const userRouter = require("./user");
const projectRouter = require("./project")

module.exports = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/project", projectRouter)
};
