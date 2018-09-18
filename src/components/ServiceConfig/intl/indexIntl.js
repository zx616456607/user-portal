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
    filePathHint2: '目前仅支持 properties/xml/json/conf/config/data/ini/txt/yaml/yml 格式',
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
    createConfigModalTitle: '添加 {name}',
    secretAlert: '即将保存一个加密对象，您可以在创建应用→添加服务时，配置管理或环境变量使用该对象',
    serviceAlert: '即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置',
    configName: '名称',
    configNamePlaceHolder: '如 {name}',
    configDesc: '内容',
  }
}

export default defineIntlMessages(mapData)