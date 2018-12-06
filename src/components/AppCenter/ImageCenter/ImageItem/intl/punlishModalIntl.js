/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for PublishModal
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.Publish',
  data: {
    title: '发布',
    publishType: '发布类型',
    publishToStore: '发布到商店',
    publishToRepoGroup: '发布到仓库组',
    targetCluster: '目标集群',
    targetClusterPlaceholder: '请选择集群',
    imageName: '镜像名称',
    publishName: '发布名称',
    imageVersion: '镜像版本',
    className: '分类名称',
    description: '描述',
    uploadIcon: '上传Icon',
    submitInfo: '提交信息',
    noVersionToPublish: '无可发布版本',
    fetchVersionFailed: '获取版本失败',
    imageNameHasExist: '该镜像名称已存在',
    publishNameValidate1: '请输入发布名称',
    publishNameValidate2: '发布名称需在3-20个字符之间',
    publishNameHasExist: '该发布名称已存在',
    selectVersionOfImage: '请选择镜像版本',
    version: '选择版本',
    selectVersion: '请选择版本',
    targetRepoGroup: '目标仓库组',
    selectTargetRepoGroup: '请选择目标仓库组',
    selectOrInputClass: '请选择或输入分类',
    onlyOneClass: '只能选择一个分类',
    descriptionRequired: '请输入描述信息',
    descriptionValidate: '描述信息需在3-80个字符之间',
    submitInfoRequired: '请输入提交信息',
    submitInfoValidate: '提交信息需在3-20个字符之间',
    targetClusterRequired: '请选择目标集群',
    inSubmit: '提交审核中',
    submitSuccess: '提交审核成功',
    submitFailed1: '提交审核失败，该镜像与{name}内容完全相同，不能发布',
    submitFailed2: '提交审核失败',
    okText: '提交审核',
    cancelText: '取消',
    imageErr: '镜像错误',
    fetchVersionFailure: '获取版本失败',
    formatError: '上传文件格式错误, 支持：{formats}文件格式',
    sizeLimit: '请上传10M以内的图片',
    uploadSuccess: '上传成功',
    uploadFailure: '上传失败',
    uploadIconTip: '上传icon支持（jpg/jpeg/png图片格式，建议尺寸100px*100px）',
    submitInfoPlaceholder: '请输入提交信息，便于系统管理员快速了解发布内容',
    validating: '校验中...',
    submitSuccessText: '提交成功',
    waitingAdminCheck: '等待系统管理员审核...',
    afterSubmit: '提交审核后可以到',
    publishRecord: '发布记录',
    checkAuditStatus: '查看审核状态',
    tip: '审核通过系统将会复制一个新的镜像，与原镜像无关',
    close: '关闭',
    checkPublishRecord: '查看发布记录',
    classifyNameNotEmpty: '分类名称不能为空',
    existImageTips: '目标仓库组已有镜像 {image}，覆盖原镜像版本',
    readOnlyForbid: '在只读模式下发布、推送镜像是被禁止的',
  },
}
export default defineIntlMessages(mapData)
