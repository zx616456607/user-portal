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
    create: '创建',
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
    createConfigGroup: '创建配置组',
    createConfig: '创建配置',
    createSucc: '创建成功',
    delConfigGroup: '删除',
    searchPlaceHolder: '按配置组名称搜索',
    searchClassPlaceHolder: '请输入分类名搜索',
    delConfigFailed: '删除配置文件失败!',
    delConfigSucc: '删除配置文件成功',
    noConfigs: '未添加配置文件',
    onVolumeMounts: '暂无挂载',
    appTitle: '应用：',
    serviceTitle: '，服务：',
    projectName: '仓库：',
    branchName: '分支：',
    associatedService: '关联服务 ',
    mountPath: '挂载路径',
    serviceName: '服务名称',
    configFile: '配置文件',
    configFileWithCount: '配置文件 {count} 个',
    delConfigTitle: '删除配置文件操作',
    delConfigContent: '您是否确定要删除配置文件 {name} ?',
    loadMore: '查看更多',
    deleteConfigGroup: '删除配置组',
    editConfigGroupClass: '修改分类',
    createTime: '创建时间',
    needClassifyMsg: '请选择分类',
    classifyPlaceholder: '输入内容查找或创建分类',
    checkouting: '校验中...',
    defaultErrorMessage: '缺少参数或格式错误',
    error403Message: '未授权修改配置分类',
    error409Message: '配置组已存在',
    error500Message: '网络异常',
    editClassSucc: '修改分类成功',
    errorK8sMessage: '由小写字母、数字和连字符（-）组成',
    checkConfigGroupNameErrorMsg01: '请输入配置组名称',
    checkConfigGroupNameErrorMsg02: '名称长度为 3-63 个字符',
    checkConfigGroupNameErrorMsg03: '名称须以小写字母开头',
    checkConfigGroupNameErrorMsg04: '名称须以小写字母或数字结尾',
    checkConfigGroupNameErrorMsg05: '由小写字母、数字和连字符（-）组成',
    checkConfigGroupNameErrorMsg06: '配置组名称重复',
    return: '返回'
  }
}

export default defineIntlMessages(mapData)