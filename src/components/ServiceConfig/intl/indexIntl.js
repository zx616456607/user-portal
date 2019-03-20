/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for ServiceConfig default
 *
 * @author rensiwei
 *
 */
import { defineIntlMessages } from "../../../common/tools"

export const mapData = {
  prefix: 'ServiceConfig.Index',
  data: {
    tabName1: '普通配置',
    tabName2: '加密配置',
    serviceConfig: '服务配置',
    filePathHint1: '请上传文件或直接输入内容',
    filePathHint2: '目前仅支持 properties/xml/json/conf/config/data/ini/txt/yaml/yml/cfg 格式',
    checkConfigNameErrorMsg1: '请输入配置文件名称',
    checkConfigNameErrorMsg2: '配置文件名称长度为 3-63 个字符',
    checkConfigNameErrorMsg3: '名称由英文、数字、点、下\中划线组成，且名称和后缀以英文或数字开头和结尾',
    checkConfigNameErrorMsg4: '名称由英文、数字、点、下\中划线组成，且名称和后缀以英文或数字开头和结尾',
    checkConfigNameErrorMsg5: '该名称已存在',
    checkConfigDescErrorMsg: '内容不能为空，请重新输入内容',
    createConfigSucc: '创建配置文件成功',
    createConfig403Error: '添加配置文件过多',
    createConfig409Error: '配置已存在',
    createConfig500Error: '网络异常',
    createConfigErrorTitle: '添加配置文件失败',
    create: '创建',
    secretAlert: '即将保存一个加密对象，您可以在创建应用→添加服务时，配置管理或环境变量使用该对象',
    serviceAlert: '即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置',
    configName: '名称',
    configNamePlaceHolder: '如 {name}',
    configDesc: '内容',
    importFileFailed: '导入失败, 请检查目录结构',
    noVolumeMounts: '暂无挂载',
    appTitle: '应用：',
    serviceTitle: '服务：',
    projectName: '仓库：',
    branchName: '分支：',
    associatedService: '关联服务 ',
    loadMore: '查看更多',
    mapMode: '映射方式',
    serviceName: '服务名称',
    checkNameErrorMsg01: '请输入配置组名称',
    checkNameErrorMsg02: '名称长度为 3-63 个字符',
    checkNameErrorMsg03: '名称须以小写字母开头',
    checkNameErrorMsg04: '名称须以小写字母或数字结尾',
    checkNameErrorMsg05: '由小写字母、数字和连字符（-）组成',
    checkNameErrorMsg06: '配置组名称重复',
    configGroupName: '配置组名称',
    createGroup: '创建配置组',
    deleteGroup: '删除配置组',
    createTime: '创建时间',
    serectObj: '加密对象',
    configFile: '配置文件',
    fileNameHint: '上传文件为 {name}',
    loadFileSpin: '读取文件内容中，请稍后',
    loadFileFailed: '读取文件内容失败',
    loadFileSucc: '文件内容读取完成',
    wrongFilePathHint: '请输入正确的文件路径, 以./开头',
    importFileorEnter: '导入或直接输入配置文件',
    importFileRadio: '本地文件导入',
    gitFileRadio: 'Git仓库导入',
    upload: '读取文件内容',
    noGitLabHint: '请先关联 GitLab 代码仓库',
    autoUpdateCheck: '提交代码自动更新',
    editorTitle: '配置文件内容',
    updateConfigSucc: '修改配置文件成功',
    update: '修改',
    projectPlaceholder: '请选择代码仓库',
    branchPlaceholder: '请选择代码分支',
    pathPlaceholder: '请输入配置文件路径，以“./”开头',
    searchPlaceHolder: '按配置组名称搜索',
    import: '导入',
    importSucc: '导入成功',
  }
}

export default defineIntlMessages(mapData)