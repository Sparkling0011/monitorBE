const userRouter = require("./user");

module.exports = (app) => {
  app.use("/api/user", userRouter);
};
