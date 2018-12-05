/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * ContainerListIntl.js page
 *
 * @author zhangtao
 * @date Thursday August 30th 2018
 */
import {defineIntlMessages} from '../../common/tools'

const mapData = {
  prefix: 'ContainerList',
  data: {
    exportImageFailure: '导出镜像失败！当前平台镜像仓库不完整',
    exportImageTimeOut: '导出镜像超时，请重试！',
    exportImageFailure: '导出镜像失败！',
    nameAlreadyExistCoverImage: '名称已存在，使用会覆盖已有镜像',
    imageName: '镜像名称',
    pleaseInputImageAddress: '请输入镜像名称',
    consistOfLowercaseAndNum: '由小写字母或数字组成',
    atMost128Character: '最多只能为128个字符',
    pleaseInputImageVersion: '请输入镜像版本',
    noData: '暂无数据',
    exportImage: '导出镜像',
    forceDelete: '强制删除',
    reDistribution: '重新分配',
    Terminal: '终端',
    pleaseChoiceHarbor: '请选择仓库组',
    pleaseChoiceContainer: "请选择容器",
    exportImageToHarbor: '导出镜像到仓库',
    cancel: '取消',
    exportToImageHarbor: '导出到镜像仓库',
    choiceHarborAndInputImageAddress: '选择仓库组并输入镜像名称，导出的镜像将推送到相应的镜像仓库中',
    choiceHarborGroup: '选择仓库组',
    choiceContainer: "选择容器",
    visitor: '（访客）',
    verifying: '校验中...',
    inputImageName: '请填写镜像名称',
    pleaseInputTag: '请填写标签',
    preview: '预览',
    HarborGroupName: '仓库组名称',
    currentContainerMapVolume: '当前容器有映射 Volume 目录，此次导出的镜像',
    excludeVolumeStorage: '不包含 Volume 的存储目录',
    checkImageHarbor: '查看镜像仓库',
    close: '关闭',
    operationSuccess: '操作成功',
    pushingToImage: '正在推送 { exportImageName } 到镜像仓库',
    maybeSpentSomeTime: '可能会花一些时间，请稍后至',
    deliveryCenter: '交付中心',
    imageHarbor: '镜像仓库',
    check: '查看',
    prompt: '提示',
    gotIt: '知道了',
    containerNoExportImage: '容器为非运行中状态，不能导出镜像',
    containList: '容器列表',
    refresh: '刷新',
    searchByContainerName: '按容器名称搜索',
    totals: '共 { total } 条',
    reDistributionOperation: '重新分配操作',
    makeSureDistribution: '您是否确定要重新分配',
    containerName: '容器 { name }?',
    thisNumContainer: '这 { length } 个容器',
    forceDeleteOperation: '强制删除操作',
    makeSureForceDelete: '您是否确定要强制删除',
    container: '容器名称',
    state: '状态',
    belongApp:  '所属应用',
    image: '镜像',
    visitAddress: '访问地址',
    createTime: '创建时间',
    operation: '操作',
  }
}


const mapIntlDataToJson = mapDatList => {
  const d = {}
  mapDatList.map(({ data, prefix }) => {
    // l.prefix l.data
    for (let [ k,v ] of Object.entries(data)) {
      d[`${prefix}.${k}`] = v
    }
  })
  return JSON.stringify(d, null, 2)
}

export function printJson() {
  console.log(
    mapIntlDataToJson([mapData])
  )
}

export default defineIntlMessages(mapData)