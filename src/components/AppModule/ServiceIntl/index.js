import {defineIntlMessages} from '../../../common/tools'
import AllServiceListIntl from './AllServiceListIntl'
import {mapData as AllServiceListIntlmapData} from './AllServiceListIntl'
import AppServiceDetailIntl from './AppServiceDetailIntl'
import { mapData as AppServiceDetailIntlmapData } from './AppServiceDetailIntl'

export { AllServiceListIntl, AppServiceDetailIntl }
const mapData = {
  prefix: 'ServiceCommon',
  data: {
    start: '启动',
    stop: '停止',
    refresh: '刷新',
    delete: '删除',
    reboot: '重启',
    common: '共',
    page: '条',
    moreOperation: '更多操作',
    status: '状态',
    operation: '操作',
    cancel: '取消',
    save: '保存',
    confirm: '确定',
    memory: '内存',
    userDefined: '自定义',
    core: '核',
    cases: '颗',
    requestError: '请求错误',
    name: '名称',
    type: '类型',
    nextStep: '下一步',
    lastStep: '上一步',
    fiveMinutes: '5分钟',
    thirtyMinutes: '30分钟',
    oneHour: '一小时',
    units: '个',
    yes: '是',
    no: '否',
    submit: '提交',
    image: '镜像',
    address: '地址',
    edit: '编辑',
    loading: '加载中',
    content: '内容',
  }
}

const mapIntlDataToJson = mapDatList => {
  const d = {}
  mapDatList.map(({ data, prefix }) => {
    // l.prefix l.data
    for (let [ k,v ] of Object.entries(data)) {
      d[`${prefix}.${k}`] = v
    }
  })
  return JSON.stringify(d, null, 2)
}

export function printJson() {
  console.log(
    mapIntlDataToJson([ AllServiceListIntlmapData, AppServiceDetailIntlmapData, mapData ])
  )
}


export default defineIntlMessages(mapData)