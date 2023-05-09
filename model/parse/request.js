const { Schema, model } = require("mongoose");
const Moment = require("moment");
const MomentRange = require("moment-range");
const moment = MomentRange.extendMoment(Moment);

const RequestErrorSchema = new Schema({
  pid: { type: String, required: true },
  error_name: { type: String },
  requestUrl: { type: String },
  method: { type: String },
  body: { type: Object },
  headers: { type: Object },
  status: { type: Number },
  statusText: { type: String },
  url: { type: String, default: "" },
  log_at: { type: Number, required: true },
  create_time: { type: Number, default: Date.now() },
  update_time: { type: Number, default: Date.now() },
});

const RequestErrorModel = model("request", RequestErrorSchema);

/**
 * 入库
 * @param {object} datas
 */
async function insertInto(infos) {
  try {
    const error = new RequestErrorModel(infos);
    await error.save();
    return error;
  } catch (e) {
    return null;
  }
}

async function getRequestErrorListInRange(pid, startAt, endAt, pageInfo) {
  try {
    const { pageSize, page } = pageInfo;
    const total = await RequestErrorModel.countDocuments({
      pid,
      log_at: { $gte: startAt, $lte: endAt },
    });
    const list = await RequestErrorModel.find({
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

async function getRequestDataInRangeHous(pid, startAt, endAt) {
  // let result = await RequestErrorModel.aggregate([
  //   {
  //     $match: {
  //       pid,
  //       log_at: {
  //         $gte: startAt,
  //         $lte: endAt
  //       }
  //     }
  //   },
  //   {
  //     $project: {
  //       date: {
  //         $dateToString: {
  //           date: { $toDate: "$log_at" },
  //           format: "%Y-%m-%d"
  //         }
  //       },
  //       hour: {
  //         $hour: { $toDate: "$log_at" }
  //       }
  //     }
  //   },
  //   {
  //     $group: {
  //       _id: {
  //         date: "$date",
  //         hour: { $floor: { $divide: ["$hour", 6] } }
  //       },
  //       count: { $sum: 1 }
  //     }
  //   },
  //   {
  //     $sort: {
  //       "_id.date": 1,
  //       "_id.hour": 1
  //     }
  //   },
  //   {
  //     $group: {
  //       _id: "$_id.date",
  //       counts: { $push: "$count" }
  //     }
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       date: "$_id",
  //       counts: {
  //         $map: {
  //           input: { $range: [0, 24, 6] },
  //           as: "hour",
  //           in: {
  //             $cond: {
  //               if: { $lte: ["$$hour", { $subtract: [{ $size: "$counts" }, 1] }] },
  //               then: { $arrayElemAt: ["$counts", "$$hour"] },
  //               else: 0
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // ]);
  // console.log(result)

  // return result

  // 将日期转化为6小时为一组的时间戳
  function getGroupKey(date) {
    const hour = moment(date).hours();
    const diff = hour % 6;
    const key = moment(date).subtract(diff, "hours").format("YYYY-MM-DD HH:00");
    return key;
  }

  const result = {};
  const startTime = moment(startAt);
  const endTime = moment(endAt);

  startTime.startOf("hour").subtract(startTime.hour() % 6, "hours");

  // 生成所需的时间点
  while (startTime.isBefore(endTime)) {
    result[startTime.format("YYYY-MM-DD HH:mm")] = 0;
    startTime.add(6, "hours");
  }

  const logs = await RequestErrorModel.find({
    pid: pid,
    log_at: { $gte: startAt, $lte: endAt },
  });
  logs.forEach(function (log) {
    const key = getGroupKey(log.log_at);
    if (result.hasOwnProperty(key)) {
      result[key] += 1;
    }
  });
  return result;
}

module.exports = {
  insertInto,
  getRequestErrorListInRange,
  getRequestDataInRangeHous,
};
