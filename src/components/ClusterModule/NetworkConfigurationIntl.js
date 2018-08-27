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

import { defineIntlMessages } from "../../common/tools"
import React from "react";
// data for index, clusterTabList
export const mapData = {
  prefix: 'NetworkConfiguration',
  data: {
    networkConfig: '网络配置',
    cancel: '取消',
    save: '保存',
    inputProxyOut: '请填入一组代理出口',
    updatingProxyOut: '更新代理出口中',
    updateProxyOutSuccess: '代理出口更新成功',
    updateProxyOutFail: '代理出口更新失败，请重试',
    plsSelectNode: '请选择节点',
    proxyNodeRepeat: '代理节点重复',
    selectServiceNode: '选择服务节点',
    inputNetworkCardIp: '请填写网卡 IP',
    inputRightNetworkIp: '请填写正确的网卡 IP',
    nodeNetworkCardRepeat: '节点网卡重复',
    inputServiceOutIp: '输入服务出口 IP',
    publicNet: '公网',
    intranet: '内网',
    noOutForNow: '暂无出口',
    defaultNetOutNotNull: '默认网络出口不能为空',
    setDefaultNetOutSuccess: '设置默认网络出口成功',
    setDefaultNetOutFail: '设置默认网络出口失败',
    inputRightDomain: '请输入正确的域名',
    clearDomainHttpError: '若清空域名，使用该网络出口的服务的 http 协议将无法正常使用',
    noProxyForNow: '暂无代理',
    noConfigPlsAdd: '暂无配置，请添加',
    netProxyNotNull: '网络代理不能为空',
    netProxyRepeat: '网络代理重复',
    serviceOutNotNull: '服务出口不能为空',
    inputRightIp: '请输入正确的ip地址',
    defaultStr: '默认',
    proxyNode: '代理节点',
    nodeNetIpConfirm: '节点的网卡IP(多网卡时请确认)',
    addIntranetProxy: '新增一条内网代理',
    outId: '出口ID',
    copySuccess: '复制成功',
    clickCopy: '点击复制',
    type: '类型',
    typeNetOutService: '该类型决定该网络出口在创建服务时出现在哪种服务访问方式中',
    netTypeNotNull: '网络类型不能为空',
    name: '名称',
    suggestPublicOrIntranet: '建议名称能体现出内网或公网，供创建服务时选择服务访问类型用',
    inputNetProxyName: '填写网络代理名称',
    serviceOutIp: '服务出口 IP',
    noNeedInput: '无需填写',
    intranetIpAccessService: '可访问服务的内网IP',
    serviceDomainConfig: '服务域名配置',
    serviceAddressDomain: '服务访问地址的域名(可选)',
    editConfig: '编辑配置',
    serviceIntranetProxy: '服务内网代理',
    serviceIntranetIpShow: '服务内网IP显示在[应用管理-服务地址：内网IP]处，集群内任意节点作为服务的内网出口代理；',
    serviceOut: '服务出口',
    serviceOutIpShow: '服务出口 IP 显示在『应用管理→服务地址：外网IP』处，服务内网 IP 地址所映射的代理或网关等性质的产品，平台暂无法自动获取，需手动填写，如OpenStack 的浮动 IP、节点绑定的负载均衡器、平台出口高可用的虚拟 IP 等',
    checkPic: '查看示意图',
    setDefaultNet: '设置默认网络',
    addNetOut: '添加网络出口',
    iKnow: '知道了',
    setDefaultNetOut: '设置默认网络出口',
    Schematic: '示意图',
    defaultNetOut: '默认网络出口',
    selectDefaultNetOut: '选择默认网络出口',
    noOut: '暂无出口',
    deleteNetOut: '删除网络出口',
    deleteNetOutTip: '删除该网络出口后，已使用此网络出口的服务将不能通过此网络出口被访问',
    deleteNetOutTip2: '2、此网络出口为默认网络出口，删除后，创建服务或数据库与缓存集群时，将没有默认的网络出口，建议设置其他网络出口作为默认',
    deleteNetOutConfirm: '是否确定删除 { currentName } 网络出口?',
  }
}

export default defineIntlMessages(mapData)
