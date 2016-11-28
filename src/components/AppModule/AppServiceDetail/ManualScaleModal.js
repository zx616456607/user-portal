/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/27
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import './style/ManualScaleModal.less'
import { Row, Col, Slider, InputNumber, Modal, Button, Spin, message } from 'antd'
import { INSTANCE_MAX_NUM } from '../../../../constants'
import { manualScaleService } from '../../../actions/services'

class ManualScaleModal extends Component {
  constructor(props) {
    super(props)
    this.handleRealNum = this.handleRealNum.bind(this)
    this.handleModalOK = this.handleModalOK.bind(this)
    this.handleModalCancel = this.handleModalCancel.bind(this)
    this.state = {
      realNum: 1
    }
  }

  handleRealNum(value) {
    this.setState({
      realNum: value
    })
  }
  componentWillReceiveProps(nextProps) {
    const { service, visible } = nextProps
    if (!service) {
      return
    }
    if (!visible) {
      return
    }
    this.setState({
      realNum: service.spec.replicas
    })
  }

  handleModalOK() {
    const {
      parentScope,
      manualScaleService,
      cluster,
      appName,
      loadServiceList,
      service,
    } = this.props
    const { realNum } = this.state
    const serviceName = service.metadata.name
    const hide = message.loading('正在保存中...', 0)
    manualScaleService(cluster, serviceName, { num: realNum }, {
      success: {
        func: () => {
          const { serviceList } = parentScope.state
          serviceList.map(item => {
            if (item.metadata.name === serviceName) {
              item.status.phase = 'Scaling'
            }
          })
          parentScope.setState({
            manualScaleModalShow: false,
            serviceList
          })
          hide()
          message.success(`服务 ${serviceName} 已成功伸缩到 ${realNum} 个实例`)
          loadServiceList(cluster, appName)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          hide()
          message.error(`服务 ${serviceName} 伸缩失败`)
        }
      }
    })
  }

  handleModalCancel() {
    const { parentScope } = this.props
    parentScope.setState({
      manualScaleModalShow: false
    })
  }

  render() {
    const { service, visible } = this.props
    if (!visible) {
      return null
    }
    const { realNum } = this.state
    const modalFooter = [
      <Button
        key="back" type="ghost" size="large"
        onClick={this.handleModalCancel}>
        取 消
      </Button>,
      <Button
        key="submit" type="primary"
        size="large" loading={this.state.loading}
        onClick={this.handleModalOK} >
        保 存
      </Button>
    ]
    return (
      <Modal
        visible={visible}
        title="手动水平扩展"
        onOk={this.handleModalOK}
        onCancel={this.handleModalCancel}
        footer={modalFooter} >
        <div id="ManualScaleModal">
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'left' }}>服务名称</Col>
            <Col className="itemBody" span={20}>{service.metadata.name}</Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'left' }}>
              实际数量
              <i className="anticon anticon-question-circle-o" />
            </Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12}>
                  <Slider
                    min={1}
                    max={INSTANCE_MAX_NUM}
                    defaultValue={service.spec.replicas}
                    onChange={this.handleRealNum}
                    value={realNum} />
                </Col>
                <Col span={12}>
                  <InputNumber
                    min={1}
                    max={INSTANCE_MAX_NUM}
                    style={{ marginLeft: '16px' }}
                    value={realNum}
                    onChange={this.handleRealNum}
                    /> 个
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col style={{ color: '#a0a0a0', textAlign: 'left', marginTop: '20px' }}>
              注: 实例数量调整 , 保存后系统将调整实例数量至设置预期. (若自动伸缩开启, 则无法手动扩展)
            </Col>
          </Row>
        </div>
      </Modal>
    )
  }
}

ManualScaleModal.propTypes = {
  parentScope: PropTypes.object.isRequired,
  cluster: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  loadServiceList: PropTypes.func.isRequired,
  manualScaleService: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {
  const {
    manualScaleService,
  } = state.services
  return {
    manualScaleService
  }
}

export default connect(mapStateToProps, {
  manualScaleService,
})(ManualScaleModal)