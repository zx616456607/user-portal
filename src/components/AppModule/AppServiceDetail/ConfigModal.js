/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  ConfigModal
 *
 * v0.1 - 2016/10/27
 * @author ZhaoXueYu
 */

import React, { Component } from 'react'
import { Row, Col, Button, Modal } from 'antd'
import { connect } from 'react-redux'
import './style/ConfigModal.less'
import { DEFAULT_CONTAINER_RESOURCES, DEFAULT_CONTAINER_RESOURCES_MEMORY } from '../../../../constants'
import { changeQuotaService } from '../../../actions/services'
import { getResourcesByMemory } from '../../../../kubernetes/utils'
import NotificationHandler from '../../../common/notification_handler'
import { isStorageUsed } from '../../../common/tools'

class ConfigModal extends Component {
  constructor(props) {
    super(props)
    this.selectComposeType = this.selectComposeType.bind(this)
    this.handleConfigOK = this.handleConfigOK.bind(this)
    this.handleConfigCancel = this.handleConfigCancel.bind(this)
    this.state = {
      composeType: parseInt(DEFAULT_CONTAINER_RESOURCES_MEMORY),
      haveRBDVolume: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    const { service, visible } = nextProps
    if (!service) {
      return
    }
    if (!visible) {
      return
    }
    let resources = service.spec.template.spec.containers[0].resources || DEFAULT_CONTAINER_RESOURCES
    let limits = resources.limits || DEFAULT_CONTAINER_RESOURCES.limits
    let memory = limits.memory || DEFAULT_CONTAINER_RESOURCES.limits.memory
    this.setState({
      composeType: memory.indexOf('Gi') > -1 ? parseInt(memory) * 1024 : parseInt(memory),
      haveRBDVolume: isStorageUsed(service.spec.template.spec.volumes),
    })
  }

  selectComposeType(type) {
    this.setState({
      composeType: type
    })
  }

  handleConfigOK() {
    const {
      parentScope,
      cluster,
      service,
      appName,
      loadServiceList,
      changeQuotaService
    } = this.props
    const { composeType } = this.state
    const serviceName = service.metadata.name
    const resources = getResourcesByMemory(composeType)
    const { requests, limits } = resources
    let notification = new NotificationHandler()
    notification.spin(`服务 ${serviceName} 配置更改中...`)
    changeQuotaService(cluster, serviceName, { requests, limits }, {
      success: {
        func: (res) => {
          loadServiceList(cluster, appName)
          parentScope.setState({
            configModal: false
          })
          if(res.data.code == 200) {
            notification.close()
            notification.success(`服务 ${serviceName} 配置已成功更改`)
          } else {
            notification.close()
            notification.error(`更改服务 ${serviceName} 配置失败`)
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.close()
          notification.error(`更改服务 ${serviceName} 配置失败`)
        }
      }
    })
  }

  handleConfigCancel() {
    const { parentScope } = this.props
    parentScope.setState({
      configModal: false
    })
  }

  render() {
    const { service, visible } = this.props
    if (!visible) {
      return null
    }
    const { composeType } = this.state
    const modalFooter = [
      <Button key="back" type="ghost" size="large" onClick={this.handleConfigCancel}>
        取 消
      </Button>,
      <Button
        key="submit" type="primary" size="large" loading={this.state.loading}
        onClick={this.handleConfigOK}>
        保 存
      </Button>
    ]
    return (
      <Modal
        visible={visible}
        title="更改服务配置"
        onOk={this.handleConfigOK}
        onCancel={this.handleConfigCancel}
        width="600px"
        footer={modalFooter}>
        <div id="ConfigModal">
          <Row className="serviceName">
            <Col className="itemTitle" span={4} style={{ textAlign: 'left' }}>服务名称</Col>
            <Col className="itemBody" span={20}>
              {service.metadata.name}
            </Col>
          </Row>
          <Row>
            <Col className="itemTitle" span={4} style={{ textAlign: 'left' }}>
              选择配置
            </Col>
            <Col className="itemBody" span={20}>
              <div className="operaBox">
                <div className="selectCompose">
                  <ul className="composeList">
                    {/*<li className="composeDetail">
                      <Button type={composeType == 256 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(256)}>
                        <div className="topBox">
                          1X
                        </div>
                        <div className="bottomBox">
                          <span>256M&nbsp;内存</span><br />
                          <span>1CPU&nbsp;(共享)</span>
                        </div>
                      </Button>
                    </li>*/}
                    <li className="composeDetail">
                      <Button type={composeType == 512 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(512)}>
                        <div className="topBox">
                          2X
                        </div>
                        <div className="bottomBox">
                          <span>512M&nbsp;内存</span><br />
                          <span>1CPU&nbsp;(共享)</span>
                        </div>
                      </Button>
                    </li>
                    <li className="composeDetail">
                      <Button type={composeType == 1024 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(1024)}>
                        <div className="topBox">
                          4X
                        </div>
                        <div className="bottomBox">
                          <span>1GB&nbsp;内存</span><br />
                          <span>1CPU&nbsp;(共享)</span>
                        </div>
                      </Button>
                    </li>
                    <li className="composeDetail">
                      <Button type={composeType == 2048 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(2048)}>
                        <div className="topBox">
                          8X
                        </div>
                        <div className="bottomBox">
                          <span>2GB&nbsp;内存</span><br />
                          <span>1CPU&nbsp;(共享)</span>
                        </div>
                      </Button>
                    </li>
                    <li className="composeDetail">
                      <Button type={composeType == 4096 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(4096)}>
                        <div className="topBox">
                          16X
                        </div>
                        <div className="bottomBox">
                          <span>4GB&nbsp;内存</span><br />
                          <span>1CPU</span>
                        </div>
                      </Button>
                    </li>
                    <li className="composeDetail">
                      <Button type={composeType == 8192 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(8192)}>
                        <div className="topBox">
                          32X
                        </div>
                        <div className="bottomBox">
                          <span>8GB&nbsp;内存</span><br />
                          <span>2CPU</span>
                        </div>
                      </Button>
                    </li>
                    <div style={{ clear: "both" }}></div>
                  </ul>
                  <div style={{ clear: "both" }}></div>
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col style={{ color: '#a0a0a0', textAlign: 'left', marginTop: '20px' }}>
              注: 重新选择配置 , 保存后系统将重启该服务的所有实例。{this.state.haveRBDVolume ? '此服务已挂载存储卷，不支持平滑更新。更新完成前您的服务会短暂不可用！' : '此服务更新配置过程中不影响正常访问。'}
            </Col>
          </Row>
        </div>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const {
    changeQuotaService,
  } = state.services
  return {
    changeQuota: changeQuotaService
  }
}

export default connect(mapStateToProps, {
  changeQuotaService,
})(ConfigModal)
