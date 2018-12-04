/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for ServiceConfig/Secrets
 *
 * @author rensiwei
 *
 */
import { defineIntlMessages } from "../../../common/tools";

export const mapData = {
  prefix: 'ServiceConfig.Secrets',
  data: {
    createSecretGroupSucc: '创建成功',
    createSecretGroupFailedMsg1: '添加的配置过多',
    createSecretGroupFailedMsg2: '配置组 {name} 已存在',
    createSecretGroupFailedMsg3: '网络异常',
    createSecretGroupFailedMsg4: '创建失败',
    delSecretGroupFailed: '删除配置组失败!',
    delSecretGroupFailedDesc: '：配置组正在使用中',
    delSecretGroupSucc: '删除成功',
    createSecretSucc: '添加成功',
    createSecretFailed: '添加失败',
    updateSecretSucc: '更新成功',
    updateSecretFailed: '更新失败',
    delSecretFailedTitle: '移除加密对象失败!',
    delSecretFailedContent: '{name}：加密对象正在使用中',
    delSecretSucc: '移除成功',
    deleteSecretGroup: '删除',
    searchFailedHint: '未找到相关配置组',
    noSecretGroupHint: '您还没有配置组，创建一个吧！',
    delSecretGroupModalTitle: '删除配置组操作',
    delSecretGroupModalContent: '您是否确定要删除配置组 {names} ?',
    delSecretModalTitle: '移除加密对象操作',
    delSecretModalContent: '您是否确定要移除加密对象 {names} ?',
    noSecretHint: '未添加加密对象',
    mountPathContent: '{path}（挂载路径）',
    mountPath: '挂载路径',
    EnvContent: '{env}（环境变量）',
    viewMoreModalTitle: '加密对象 {key}',
    secretCount: '加密对象 {count} 个',
    headTitle: '加密配置',
    secretExist: "名称已存在",
    secretExist: "创建加密配置失败",
  }
};

export default defineIntlMessages(mapData);
