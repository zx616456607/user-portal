/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * App (template) create intl message
 *
 * @author zhangxuan
 * @date 2018-08-24
 */
import { defineIntlMessages } from '../../common/tools'

const messageObj = {
  prefix: 'AppCreate.',
  data: {
    requestFailure: '请求错误',
    imageStoreError: '镜像仓库暂时无法访问，请联系管理员',
    imageName: '镜像名称',
    deploy: '部署',
    add: '添加',
    selectImage: '选择镜像',
    public: '公有',
    private: '私有',
    imageStore: '镜像商店',
    imagePlaceholder: '请输入镜像名称搜索',
    total: '共 {total} 条',
    wrapName: '包名称',
    publishName: '发布名称',
    tag: '版本标签',
    wrapType: '包类型',
    uploadTime: '上传时间',
    operation: '操作',
    selectWrap: '选择应用包',
    wrap: '应用包',
    wrapStore: '应用包商店',
    wrapStorePlaceholder: '请输入包名称或发布名称搜索',
    wrapPlaceholder: '请输入包名称搜索',
    uploadWrap: '去上传部署包',
    totalPrice: '合计',
    priceHour: '{RMB}{priceHour}/{unit}小时',
    priceMonth: '合 {RMB}{priceMonth}{unit}/月',
    calculateResource: '计算资源',
    formsError: '表单信息有误',
    appTemplateCreating: '应用模板创建中',
    appTemplateCreateFailure: '应用模板创建失败',
    appTemplateCreateSuccess: '应用模板创建成功',
    cancel: '取消',
    previous: '上一步',
    overview: '信息总览',
    appTemplateName: '模板名称',
    appTemplateVersion: '模板版本',
    appTemplateDesc: '模板描述',
    service: '服务',
    keepAddService: '继续添加服务',
    serviceTooltip: '至少添加一个服务',
    save: '保存',
    create: '创建',
    deleteFailure: '删除失败',
    deleteTooltip: '至少保留一个服务',
    appTemplate: '应用模板',
    deleteService: '删除服务',
    deleteServiceTip: '删除服务无法恢复，是否确认删除？',
    returnToPrevious: '返回上一步',
    returnToPreviousTip: '返回上一步，将会放弃当前正在编辑的配置信息，本次编辑的信息将不会保留，是否返回上一步？',
    imageWarehouse: '镜像仓库',
    wrapManage: '应用包管理',
    addService: '添加服务',
    serviceConfig: '服务配置',
  }
}

export default defineIntlMessages(messageObj)
