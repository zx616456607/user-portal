/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for ServiceConfig/Service
 *
 * @author rensiwei
 *
 */
import { defineIntlMessages } from "../../../common/tools"

export const mapData = {
  prefix: 'ServiceConfig.Service',
  data: {
    noConfigGroupMsg: '您还没有配置组，创建一个吧！',
    noConfigGroupNotify: '未选择要操作配置组',
    deleteConfigGroupFailed: '删除配置组失败!',
    deleteConfigGroupSucc: '删除成功!',
    serviceConfigGroupDelTitle: '删除配置组操作',
    serviceConfigGroupDelContent: '您是否确定要删除配置组 {names} ?',
    groupClassify: '配置分类',
    configGroup: '配置组',
    groupLength: '共找到 {length} 个分类',
    allGroups: '全部配置组',
    groupsWithoutClass: '未分类配置组',
    createConfig: '创建配置',
    createSucc: '创建成功',
    delConfigGroup: '删除',
    searchClassPlaceHolder: '请输入分类名搜索',
    delConfigFailed: '删除配置文件失败!',
    delConfigSucc: '删除配置文件成功',
    noConfigs: '未添加配置文件',
    mountPath: '挂载路径',
    configFile: '配置文件',
    configFileWithCount: '配置文件 {count} 个',
    delConfigTitle: '删除配置文件操作',
    delConfigContent: '您是否确定要删除配置文件 {name} ?',
    editConfigGroupClass: '修改分类',
    needClassifyMsg: '请选择分类',
    classifyPlaceholder: '输入内容查找或创建分类',
    checkouting: '校验中...',
    defaultErrorMessage: '缺少参数或格式错误',
    error403Message: '未授权修改配置分类',
    error409Message: '配置组已存在',
    error500Message: '网络异常',
    editClassSucc: '修改分类成功',
    errorK8sMessage: '由小写字母、数字和连字符（-）组成',
    return: '返回',
  }
}

export default defineIntlMessages(mapData)