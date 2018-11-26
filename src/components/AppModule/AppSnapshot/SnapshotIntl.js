/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 *  for Storage Snapshot
 *
 * @author Lvjunfeng
 * @date 2018-10-15
 *
*/

import { defineIntlMessages } from "../../../common/tools"

export const mapData = {
  prefix: 'SnapShot',
  data: {
    refresh: '刷新',
    delete: '删除',
    placeholder: '按快照名称搜索',
    listTotal: '共计',
    slip: '条',
    exclusiveStorageShot: '独享存储快照',
    snapshotName: '快照名称',
    status: '状态',
    type: '格式',
    size: '大小',
    relatedVolume: '关联卷',
    volumeType: '卷类型',
    createTime: '创建时间',
    operate: '操作',
    rollBacking: '回滚中',
    creating: '创建中',
    normal: '正常',
    storageServer: '块存储',
    create: '创建',
    rollBack: '回滚',
    rollBackSnapshot: '回滚快照',
    EnterRollBack: '确定风险，并立即回滚',
    snapshotStatus: '快照状态',
    currentStatus: '当前状态',
    storage: "存储卷",
    willRollbackTo: "即将回滚至",
    willClearPrompt: "此刻之后的数据将被清除，请谨慎操作",
    promptBackup: "数据回滚有一定风险，建议将当前存储卷内容提前做好备份",
    delSnapshot: "删除快照",
    enterDelete: "确定风险，并立即删除",
    snapshotType: "快照格式",
    willDeletePrompt: "删除该快照后，数据将立即被清除，请谨慎操作！",
    prompt: "提示",
    knowed: "知道了",
    forbidRollBack: "快照状态非正常，不可回滚快照",
    isUsingForbidRollBack: "存储卷正在使用中，不可回滚快照！",
    forbidRollBack: "快照状态非正常，不可回滚快照",
    isUsingForbidRollBack: "存储卷正在使用中，不可回滚快照！",
    createStorage: "创建存储卷",
    needConfigCluster: "尚未配置块存储集群，暂不能创建",
    rollBackSucccess: "回滚成功",
    close: "关闭",
    watchComputeLog: "查看审计日志",
    operateSuccess: "操作成功",
    isRollBacking: "正在回滚，请在审计日志查看回滚进度",
    storageListFail: "获取独享型存储列表失败，不能进行{message}操作，请重试。",
    delSnapShotSuccess: "快照删除成功！",
    delStorageFail: "存储删除失败，请稍后重试!",
    delSnapShotFail: "快照删除失败！",
    currentIsRollBacking: "当前快照正在 回滚 中，请稍后再试。",
    currentIsCloneing: "当前快照正在 克隆 中，请稍后再试。",
    rollBackFail: "快照回滚失败！",
  }
}

export default defineIntlMessages(mapData)
