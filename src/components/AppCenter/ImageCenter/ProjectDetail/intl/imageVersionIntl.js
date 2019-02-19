/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for src/components/AppCenter/ImageCenter/ProjectDetail/ImageVersion.js
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.ImageVersion',
  data: {
    versionNotExist: '镜像版本不存在',
    objectNotExist: '对象不存在, 请求无法完成',
    deleteInBatchesSuccess: '批量删除成功',
    deleteSuccess: '删除 {name} 成功',
    prohibitDelMsg: "在只读模式下删除版本 Tag 是被禁止的",
    deleteInBatchesFailure: '批量删除失败',
    deleteFailure: '删除 {name} 失败',
    delSuccess: '删除成功',
    delFailure: '删除失败',
    lockSuccess: '锁定成功',
    lockFailure: '锁定失败',
    unLockSuccess: '解锁成功',
    unLockFailure: '解锁失败',
    addTagSuccess: '添加标签成功',
    addTagFailure: '添加标签失败',
    removeTagSuccess: '删除标签成功',
    removeTagFailure: '删除标签失败',
    editSuccess: '修改成功',
    editFailure: '修改失败',
    editWarnning: '版本最多个数，需不小于（≥）当前版本数，当前版本数为：{total}',
    version: '版本',
    pushTime: '推送时间',
    labels: '标签',
    noLabel: '无标签',
    operation: '操作',
    lock: '锁定',
    confirmLock: '确认锁定（不被清理)',
    unlock: '解锁',
    confirmUnlock: '确认解锁（允许清理)',
    remove: '下架（删除）',
    del: '删除',
    configTags: '配置标签',
    viewDetails: '查看详情',
    deployImage: '部署镜像',
    allVersions: '全部版本',
    nameInBranchs: '以代码分支名命名',
    nameInTimestamp: '以时间数命名',
    nameInCustomVersion: '自定义版本名',
    delText: '删除',
    refresh: '刷新',
    keepVersion: '保留版本最多 {total} 个',
    noLimit: '无上限',
    autoClear: '自动清理旧版本',
    helpTxt: '最旧版本，即时间按照（推送时间）倒序排列，最早推送的未锁定版本',
    edit: '编辑',
    cancelText: '取消',
    okText: '保存',
    totalItems: '共{total}条',
    imageVersionDetail: '镜像版本详情',
    gotIt: '知道了',
    deleteVersion: '删除版本',
    deleteAllAlert: '该仓库中仅剩最后一个镜像版本，删除后整个{name}镜像仓库将被删除。',
    deleteThis: '确认要删除镜像版本{name}?',
    lockTips1: '锁定版本后，将不受自动清理旧版本功能影响！一般为版本为稳定、常用版本时，保留备份使用！',
    lockTips2: '注：锁定版本的推送更新、手动删除不受锁定限制',
    lockTips3: '确定锁定该版本，不被清理？',
    unlockTips1: '解锁版本后，将受自动清理旧版本功能影响！若超镜像版本数量上限，且该版本为最旧，其将被优先清理！',
    unlockTips2: '确定解锁该版本？',
    noDataTxt: '暂无数据',
    os: '操作系统',
    architecture: '架构',
    appStackNumber: '已创建工作负载',
  }
}

export default defineIntlMessages(mapData)
