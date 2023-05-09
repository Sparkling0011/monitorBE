const { Schema, model } = require("mongoose");

const PerfSchema = new Schema({
  pid: { type: String, required: true },
  startTime: Number,
  unloadEventStart: Number,
  unloadEventEnd: Number,
  redirectStart: Number,
  redirectEnd: Number,
  workerStart: Number,
  fetchStart: Number,
  domainLookupStart: Number,
  domainLookupEnd: Number,
  connectStart: Number,
  connectEnd: Number,
  requestStart: Number,
  responseStart: Number,
  responseEnd: Number,
  domInteractive: Number,
  domContentLoadedEventStart: Number,
  domContentLoadedEventEnd: Number,
  domComplete: Number,
  loadEventStart: Number,
  loadEventEnd: Number,
  log_at: { type: Number, required: true },
  create_time: { type: Number, default: Date.now() },
  update_time: { type: Number, default: Date.now() },
});

const PerfModel = model("Performance", PerfSchema);

const LoadingSchema = new Schema({
  pid: { type: String, required: true },
  domainLookupStart: Number,
  dnsTime: { type: Number },
  connectStart: Number,
  tcpTime: { type: Number },
  requestStart: Number,
  responseStart: Number,
  requestTime: { type: Number },
  ttfb: { type: Number },
  responseTime: { type: Number },
  domInteractive: Number,
  domContentLoadedEventStart: Number,
  domParseTime: { type: Number },
  resourceLoadTime: { type: Number },
  log_at: { type: Number, required: true },
  create_time: { type: Number, default: Date.now() },
  update_time: { type: Number, default: Date.now() },
});

const LoadingModel = model("Loading", LoadingSchema);
/**
 * 入库
 * @param {object} datas
 */
async function insertInto(infos) {
  try {
    const perf = new PerfModel(infos);
    await perf.save();
    await insertLoadingData(infos);
    return perf;
  } catch (e) {
    return null;
  }
}

async function insertLoadingData(records) {
  try {
    let {
      pid,
      log_at,
      domainLookupStart,
      domainLookupEnd,
      connectStart,
      connectEnd,
      requestStart,
      responseStart,
      responseEnd,
      domInteractive,
      domContentLoadedEventStart,
      domContentLoadedEventEnd,
      domComplete,
    } = records;
    let extra = {
      dnsTime: domainLookupEnd - domainLookupStart,
      tcpTime: connectEnd - connectStart,
      requestTime: responseStart - requestStart,
      ttfb: responseStart - 0,
      responseTime: responseEnd - responseStart,
      domParseTime: domContentLoadedEventStart - domInteractive,
      resourceLoadTime: domComplete - domContentLoadedEventEnd,
    };

    let loadingData = {
      domainLookupStart,
      connectStart,
      requestStart,
      responseStart,
      domInteractive,
      domContentLoadedEventStart,
    };
    for (let key in loadingData) {
      loadingData[key] = loadingData[key] - domainLookupStart;
    }

    const record = new LoadingModel({ ...loadingData, ...extra, pid, log_at });
    await record.save();
    return record;
  } catch (e) {
    throw new Error(e);
  }
}

async function getLoadingData(pid, startAt, endAt) {
  try {
    const pipeline = [
      {
        $match: {
          pid,
          log_at: { $gte: startAt, $lte: endAt },
        },
      },
      {
        $group: {
          _id: null,
          domainLookupTime: { $avg: "$domainLookupStart" },
          dnsTime: { $avg: "$dnsTime" },
          connectStart: { $avg: "$connectStart" },
          tcpTime: { $avg: "$tcpTime" },
          requestStart: { $avg: "$requestStart" },
          requestTime: { $avg: "$requestTime" },
          ttfb: { $avg: "$ttfb" },
          responseStart: { $avg: "$responseStart" },
          responseTime: { $avg: "$responseTime" },
          domInteractive: { $avg: "$domInteractive" },
          domParseTime: { $avg: "$domParseTime" },
          domContentLoadedEventEnd: { $avg: "$domContentLoadedEventEnd" },
          resourceLoadTime: { $avg: "$resourceLoadTime" },
        },
      },
      {
        $project: {
          _id: 0,
          domainLookupTime: { $round: ["$domainLookupTime", 2] },
          connectStart: { $round: ["$connectStart", 2] },
          requestStart: { $round: ["$requestStart", 2] },
          responseStart: { $round: ["$responseStart", 2] },
          domInteractive: { $round: ["$domInteractive", 2] },
          domContentLoadedEventEnd: {
            $round: ["$domContentLoadedEventEnd", 2],
          },
          dnsTime: { $round: ["$dnsTime", 2] },
          tcpTime: { $round: ["$tcpTime", 2] },
          requestTime: { $round: ["$requestTime", 2] },
          ttfb: { $round: ["$ttfb", 2] },
          responseTime: { $round: ["$responseTime", 2] },
          domParseTime: { $round: ["$domParseTime", 2] },
          resourceLoadTime: { $round: ["$resourceLoadTime", 2] },
        },
      },
    ];

    const list = await LoadingModel.aggregate(pipeline);
    if (!list.length) return []
    const [{ _id, ...result }] = list
    const info = Object.values(result);
    info.splice(3, 0, 0);
    return [info.slice(0, 7), info.slice(7)];
  } catch (e) {
    return null;
  }
}

module.exports = {
  insertInto,
  getLoadingData,
};
