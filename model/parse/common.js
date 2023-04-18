const moment = require('moment')
const _ = require('lodash')
const { getModel, getExtraModel } = require('./getModel')


const SPLIT_BY = {
  PROJECT: 'project',
  MONTH: 'month'
}

function getTableName(tableName, splitBy, projectId) {
  const yearMonth = moment().format('YYYYMM')
  if (splitBy === 'project') {
    return `${tableName}_${projectId}`
  } else if (splitBy === 'month') {
    return `${tableName}_${projectId}_${yearMonth}`
  }
  return tableName
}

/**
 * 入库
 * @param {object} datas
 */
async function insertInto(infos) {
  const { projectId, tableName, splitBy, datas } = infos
  let updateAt = moment().unix()
  if (!datas['create_time']) {
    datas['create_time'] = updateAt
  }
  if (!datas['update_time']) {
    datas['update_time'] = updateAt
  }
  const TableName = getTableName(tableName, splitBy, projectId)
  const ExtraModel = getExtraModel(TableName)
  try {
    const extra = new ExtraModel(datas)
    const record = await extra.save()
    return record
  } catch (e) {
    return {}
  }
}

async function getRecordList(infos) {
  const { projectId, tableName, select, where, splitBy } = infos
  const TableName = getTableName(tableName, splitBy, projectId)
  return Knex(TableName)
    .select(select)
    .where(where)
    .catch(() => { return [] })
}

async function updateInto(params) {
  const { projectId, tableName, where, splitBy, datas } = params
  let updateAt = moment().unix()
  datas['update_time'] = updateAt
  const TableName = getTableName(tableName, splitBy, projectId)
  return Knex(TableName)
    .where(where)
    .update(datas)
    .catch(() => { return 0 })
}

/**
 * 封装knex，按照指定条件查询，有数据更新，无数据添加
 * @param {object} params
 */
async function replaceInto(params) {
  const { tableName, where, datas, splitBy, projectId } = params
  const table = getTableName(tableName, splitBy, projectId)
  const Model = getModel(table)
  const res = await Model.find(where)//findOne

  let id = _.get(res, [0, '_id'], 0)
  let updateAt = moment().unix()
  let isSuccess = false
  if (id > 0) {
    datas['update_time'] = updateAt
    try {
      const affectRows = await Model.updateOne({ _id: id }, datas)
    } catch (e) {
      return 0
    }
    isSuccess = affectRows > 0
  } else {
    datas['create_time'] = updateAt
    datas['update_time'] = updateAt
    const insertId = 1
    try {
      const record = new Model(datas)
      const _record = await record.save()

    } catch (e) {
      return 0
    }
    isSuccess = insertId > 0
  }
  return isSuccess
}

module.exports = {
  SPLIT_BY,
  insertInto,
  updateInto,
  replaceInto,
  getTableName,
  getRecordList
}
