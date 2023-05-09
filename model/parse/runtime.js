const _ = require("lodash");
const moment = require("moment");
const { Schema, model } = require("mongoose");

const Logger = require("../../library/logger");

const RuntimeErrorSchema = new Schema({
  pid: { type: String, required: true },
  error_name: { type: String },
  url: { type: String },
  desc: { type: String },
  stack: { type: String },
  log_at: { type: Number, required: true },
  create_time: { type: Number, default: Date.now() },
  update_time: { type: Number, default: Date.now() },
});

const RuntimeErrorModel = model("Runtime", RuntimeErrorSchema);

/**
 * 入库
 * @param {object} datas
 */
async function insertInto(infos) {
  try {
    const record = new RuntimeErrorModel(infos);
    await record.save();
    return record;
  } catch (e) {
    Logger.error("入库失败", e);
    return null;
  }
}

async function getRuntimeErrorListInRange(pid, startAt, endAt, pageInfo) {
  try {
    const { pageSize, page } = pageInfo;
    const total = await RuntimeErrorModel.countDocuments({
      pid,
      log_at: { $gte: startAt, $lte: endAt },
    });
    const list = await RuntimeErrorModel.find({
      pid,
      log_at: { $gte: startAt, $lte: endAt },
    })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const pageCount = Math.ceil(total / pageSize);
    return { list, total, page, pageCount };
  } catch (e) {
    return [];
  }
}

async function getRuntimeErrorIntervalCountInRange(pid, startAt, endAt) {
  const startDate = moment(new Date(startAt)).startOf("day");
  const endDate = moment(new Date(endAt)).endOf("day");

  // 构造日期范围
  const dateRange = [];
  let currentDate = moment(startDate);
  while (currentDate <= endDate) {
    dateRange.push(currentDate.format("YYYY-MM-DD"));
    currentDate = moment(currentDate).add(1, "days");
  }

  const result = await RuntimeErrorModel.aggregate([
    {
      $match: {
        pid,
        log_at: {
          $gte: startAt,
          $lte: endAt,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: {
              $toDate: {
                $multiply: ["$log_at", 1],
              },
            },
          },
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        count: 1,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ]);

  const countByDate = {};
  result.forEach(({ date, count }) => {
    countByDate[moment(date).format("YYYY-MM-DD")] = count;
  });

  const dateMap = {};

  dateRange.forEach((date) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    dateMap[dateString] = countByDate[dateString] || 0;
  });
  return dateMap;
}

module.exports = {
  insertInto,
  getRuntimeErrorListInRange,
  getRuntimeErrorIntervalCountInRange,
};
