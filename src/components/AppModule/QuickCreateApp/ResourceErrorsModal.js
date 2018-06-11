/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Template resource errors modal
 *
 * @author zhangxuan
 * @date 2018-06-11
 */
import React from 'react'
import { Modal, Timeline } from 'antd'
import isEmpty from "lodash/isEmpty";

export default class ResourceErrorsModal extends React.Component {
  formatErrorType = record => {
    switch (record.type) {
      case 0:
        return <span>nfs集群 <span className="themeColor">{record.resourceName}</span> 不存在</span>
      case 1:
        return <span>ceph集群 <span  className="themeColor">{record.resourceName}</span> 不存在</span>
      case 2:
        return <span>应用负载均衡器 <span className="themeColor">{record.resourceName}</span> 不存在</span>
      case 3:
        return <span>集群未添加公网出口</span>
      case 4:
        return <span>集群未添加内网出口</span>
      case 5:
        return <span>配置组 <span  className="themeColor">{record.resourceName}</span> 名称重复</span>
      case 6:
        return <span>加密配置 <span  className="themeColor">{record.resourceName}</span> 不存在</span>
      case 7:
        return <span>集群禁用本地（host）存储</span>
      case 8:
        return <span>没有安装amp</span>
      case 9:
        return <span>加密变量 <span className="themeColor">{record.resourceName}</span> 不存在</span>
      case 10:
        return <span>监听器 <span className="themeColor">{record.resourceName}</span> 名称重复</span>
      case 11:
        return <span>转发规则 <span className="themeColor">{record.subResourceName}</span> 重复</span>
      default:
        return
      }
  }

  renderResourceError = () => {
    const { templateDeployCheck } = this.props;
    if (isEmpty(templateDeployCheck) || !templateDeployCheck.data) {
      return
    }
    const { data } = templateDeployCheck
    const children = data.map(item => {
      if (isEmpty(item.content)) {
        return
      }
      return (
        <div className="resourceList" key={item.name}>
          <div className="themeColor serviceName">{item.name}</div>
          <Timeline className="resourceTimeline">
            {
              item.content.map(record => {
                return <Timeline.Item key={record.type + record.resourceName}>{this.formatErrorType(record)}</Timeline.Item>
              })
            }
          </Timeline>
        </div>
      )
    })
    return (
      <div>
        <div className="resourceHint">以下模板引用资源不存在或不可用，您可以点击放弃，待解决资源故障后再行创建应用；或点击继续，手动修改服务配置，然后创建应用</div>
        {children}
      </div>
    )
  }

  render() {
    const { visible, closeModal, confirmModal } = this.props
    return (
      <Modal
        className="resourceErrorModal"
        title="资源故障"
        visible={visible}
        onCancel={closeModal}
        onOk={confirmModal}
        okText="继续"
        cancelText="放弃"
        maskClosable={false}
      >
        {this.renderResourceError()}
      </Modal>
    )
  }
}
