/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for IndexPage
 * v0.1 - 2018-08-28
 *
 * @author zhangpc
 *
 */

import { defineIntlMessages } from '../../../../src/common/tools'

export const mapData = {
  prefix: 'AppModule.AppServiceDetail.ContainerHeader',
  data: {
    fixedInstanceIP: '固定实例 IP',
    viewConfiguredIP: '查看配置的 IP',
    scaling: '水平扩展',
    autoScaling: '自动伸缩',
    refresh: '刷新',
    fixedIPTips: '已开启固定实例 IP，无法继续操作',
    fixIPConfig: '配置固定 IP',
    fixIPCandle: '取消',
    fixIPEnter: '重启服务，应用更改',
    stopedServer: '停止中的服务不支持固定 IP',
    fixOnePrompt: '目前仅支持一个实例固定 IP，且功能开启后，将不支持服务自动伸缩',
    instanceNum: '容器实例数量',
    ipPodPlaceholder: '请填写实例 IP(需属于 {NetSegment} )',
    releaseIP: '不再固定实例 IP',
    enterReleaseIP: '确认释放 IP',
    releaseIPPrompt: '容器实例 IP 将不再固定，重新创建容器 IP 可能发生变化，且已配置的固定 IP 将被释放！',
    askReleaseIP: '继续将不再固定实例 IP，确认继续?',
    netSegmentUnknow: '未获取到指定网段',
    inputRange: '请输入属于 {NetSegment} 的 IP',
    checkIPFail: '校验 IP 是否被占用失败',
    isUsedIP: '当前 IP 已经被占用, 请重新填写',
    releasing: '当前 IP 已经被占用, 请重新填写',
    releaseSuccess: '释放 IP 成功',
    releaseFail: '释放 IP 失败',
    fixIPing: '更改中...',
    scaleFail: '固定 IP 操作失败, 水平扩展失败',
    fixIPSuccess: '已固定 IP',
    fixIPFail: '固定 IP 操作失败',
    getAutoScaleFail: '获取自动伸缩数据失败',
    getPodDataFail: '获取 Pod 网段数据失败',
  },
}

export default defineIntlMessages(mapData)
