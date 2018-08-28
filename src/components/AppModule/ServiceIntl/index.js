import {defineIntlMessages} from '../../../common/tools'
import AllServiceListIntl from './AllServiceListIntl'
import AppServiceDetailIntl from './AppServiceDetailIntl'

export { AllServiceListIntl, AppServiceDetailIntl }
export const mapData = {
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
  }
}

export default defineIntlMessages(mapData)