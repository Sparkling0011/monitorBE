const { Schema, model } = require("mongoose");
const moment = require("moment");
const { script, style, image, video } = require("../../constants/monitor_type");

const ResourceErrorSchema = new Schema({
  pid: { type: String, required: true },
  type: { type: Number, required: true },
  errorName: { type: String },
  url: { type: String, default: "" },
  statusCode: { type: Number },
  pageType: { type: String },
  md5: { type: String },
  count: { type: Number },
  log_at: { type: Number, required: true },
  create_time: { type: Number, default: Date.now() },
  update_time: { type: Number, default: Date.now() },
});

const ResourceErrorModel = model("resource", ResourceErrorSchema);

/**
 * 入库
 * @param {object} datas
 */
async function insertInto(infos) {
  try {
    const same = await ResourceErrorModel.findOne({ md5: infos.md5 });
    if (same) {
      same.count++;
      await same.save();
      return same;
    } else {
      const error = new ResourceErrorModel({ ...infos, count: 1 });
      await error.save();
      return error;
    }
  } catch (e) {
    return null;
  }
}

async function getResourceErrorListInRange(pid, startAt, endAt, pageInfo) {
  try {
    const { pageSize, page } = pageInfo;
    const total = await ResourceErrorModel.countDocuments({
      pid,
      log_at: { $gte: startAt, $lte: endAt },
    });
    const list = await ResourceErrorModel.find({
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

async function getResourceTypeCountInRange(pid, startAt, endAt) {
  const startDate = moment(new Date(startAt)).startOf("day");
  const endDate = moment(new Date(endAt)).endOf("day");

  // 构造日期范围
  const dateRange = [];
  let currentDate = moment(startDate);
  while (currentDate <= endDate) {
    dateRange.push(currentDate.format("YYYY-MM-DD"));
    currentDate = moment(currentDate).add(1, "days");
  }

  const result = await ResourceErrorModel.aggregate([
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
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $toDate: {
                  $multiply: ["$log_at", 1],
                },
              },
            },
          },
          type: "$type",
        },
        count: {
          $sum: "$count",
        },
      },
    },
    {
      $group: {
        _id: {
          date: "$_id.date",
        },
        categories: {
          $push: {
            k: { $toString: "$_id.type" },
            v: "$count",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        category: {
          $arrayToObject: "$categories",
        },
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ]);

  const countByDate = {};

  result.forEach(({ date, category }) => {
    let handled = {};
    for (let key in category) {
      switch (parseInt(key)) {
        case script:
          handled.script = category[key];
          break;
        case style:
          handled.style = category[key];
          break;
        case image:
          handled.image = category[key];
          break;
        case script:
          handled.video = category[key];
          break;
      }
    }
    countByDate[moment(date).format("YYYY-MM-DD")] = handled;
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
  getResourceErrorListInRange,
  getResourceTypeCountInRange,
};
