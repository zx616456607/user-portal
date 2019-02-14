/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * define Intl Msg for ClusterModule
 *
 * @author Songsz
 * @date 2018-08-23
 *
*/

import { defineIntlMessages } from "../../../../common/tools"

export const mapData = {
  prefix: 'AppModule.QuickCreateApp.AdvanceSetting',
  data: {
    envVar: '环境变量',
    uEditEnvVar: '您可以在这里修改环境变量配置',
    cryptographicVar: '加密变量',
    cryptographicVarTip: '加密变量将通过读取加密配置 Secret 的方式，将需要加密的变量映射至对应键，如：变量键为 DB_PASSWD 值选择加密变量 Token/passwd 则映射结果为 DB_PASSWD:[Token/passwd 的值]',
    key: '键',
    value: '值',
    act: '操作',
    addEnvVar: '添加环境变量',
    plsIptKey: '请填写键',
    normalVar: '普通变量',
    plsIptValue: '请填写值',
    plsSlcCryptoObj: '请选择加密对象',
    delete: '删除',
    keyExist: '键 {value} 已存在',
    noCryptoObj: '无加密对象',
    envValueReg: '由字母、数字、中划线-、下划线_、/或空格组成'
  }
}

export default defineIntlMessages(mapData)
