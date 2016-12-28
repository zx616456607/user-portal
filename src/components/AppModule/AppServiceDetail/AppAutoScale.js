/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/25
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Button, Alert, Card, Slider, Row, Col, InputNumber, Tooltip, Icon, Switch,
  Modal,
} from 'antd'
import { loadAutoScale, deleteAutoScale, updateAutoScale } from '../../../actions/services'
import { INSTANCE_AUTO_SCALE_MAX_CPU, INSTANCE_MAX_NUM } from '../../../../constants'
import './style/AppAutoScale.less'
import NotificationHandler from '../../../common/notification_handler'
import { isStorageUsed } from '../../../common/tools'

const confirm = Modal.confirm

function loadData(props) {
  const { cluster, serviceName, loadAutoScale } = props
  loadAutoScale(cluster, serviceName)
}

class AppAutoScale extends Component {
  constructor(props) {
    super(props)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleMinReplicas = this.handleMinReplicas.bind(this)
    this.handleMaxReplicas = this.handleMaxReplicas.bind(this)
    this.handleTargetCPUUtilizationPercentage = this.handleTargetCPUUtilizationPercentage.bind(this)
    this.state = {
      edit: false,
      minReplicas: props.autoScale.minReplicas || 1,
      maxReplicas: props.autoScale.maxReplicas || 2,
      targetCPUUtilizationPercentage: props.autoScale.targetCPUUtilizationPercentage || 30,
      saveText: '保存',
      isAutoScaleOpen: props.isAutoScaleOpen,
      isAvailable: false
    }
  }

  componentWillMount() {
    loadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const { cluster, serviceName, autoScale, replicas, isAutoScaleOpen, volumes } = nextProps
    this.setState({
      isAutoScaleOpen: isAutoScaleOpen,
      isAvailable: !isStorageUsed(volumes)
    })
    if (serviceName === this.props.serviceName) {
      return
    }

    this.setState({
      minReplicas: autoScale.minReplicas || replicas,
      maxReplicas: autoScale.maxReplicas || replicas,
      targetCPUUtilizationPercentage: autoScale.targetCPUUtilizationPercentage || 30
    })
    loadData(nextProps)
  }

  handleMinReplicas(value) {
    const { maxReplicas } = this.state
    if (value >= maxReplicas) {
      value -= 1
    }
    this.setState({
      minReplicas: value,
      maxReplicas: (value >= maxReplicas ? value + 1 : maxReplicas),
    })
  }

  handleMaxReplicas(value) {
    const { minReplicas } = this.state
    if (value <= minReplicas) {
      value += 1
    }
    this.setState({
      minReplicas: (value <= minReplicas ? value -1 : minReplicas),
      maxReplicas: value,
    })
  }

  handleTargetCPUUtilizationPercentage(value) {
    const { minReplicas } = this.state
    this.setState({
      targetCPUUtilizationPercentage: value,
    })
  }

  handleSwitch() {
    const { isAutoScaleOpen } = this.state
    const self = this
    if (!isAutoScaleOpen) {
      this.setState({
        saveText: '开启并保存',
        edit: true
      })
      return
    }
    const { cluster, serviceName, deleteAutoScale, loadAutoScale } = this.props
    let notification = new NotificationHandler()
    confirm({
      title: `您是否确定要关闭自动伸缩？`,
      // content: '',
      onOk() {
        return new Promise((resolve) => {
          resolve()
          notification.spin('正在保存中...')
          deleteAutoScale(cluster, serviceName, {
            success: {
              func: () => {
                loadAutoScale(cluster, serviceName, {
                  success: {
                    func: () => {
                      self.setState({
                        isAutoScaleOpen: false
                      })
                      notification.close()
                      notification.success('自动伸缩已关闭')
                    }
                  }
                })
              },
              isAsync: true
            },
            failed: {
              func: () => {
                notification.close()
                notification.error('关闭自动伸缩失败')
              }
            }
          })
        })
      },
      onCancel() { },
    })
  }

  handleEdit() {
    this.setState({
      saveText: '保存',
      edit: true
    })
  }

  handleSave() {
    const self = this
    const { cluster, serviceName, updateAutoScale, loadAutoScale } = this.props
    const { minReplicas, maxReplicas, targetCPUUtilizationPercentage, saveText } = this.state
    const body = {
      min: minReplicas,
      max: maxReplicas,
      cpu: targetCPUUtilizationPercentage
    }
    let notification = new NotificationHandler()
    notification.spin('正在保存中...')
    updateAutoScale(cluster, serviceName, body, {
      success: {
        func: () => {
          loadAutoScale(cluster, serviceName, {
            success: {
              func: () => {
                self.setState({
                  edit: false,
                  isAutoScaleOpen: true
                })
                notification.close()
                notification.success(`${saveText}成功`)
              }
            }
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.close()
          notification.error(`${saveText}失败`)
        }
      }
    })
  }

  handleCancel() {
    const { autoScale } = this.props
    this.setState({
      edit: false,
      minReplicas: autoScale.minReplicas || 1,
      maxReplicas: autoScale.maxReplicas || 1,
      targetCPUUtilizationPercentage: autoScale.targetCPUUtilizationPercentage || 30
    })
  }

  render() {
    const {
      edit,
      minReplicas,
      maxReplicas,
      targetCPUUtilizationPercentage,
      saveText,
      isAutoScaleOpen,
    } = this.state
    return (
      <div id="AppAutoScale">
        <div className="title">
          自动弹性伸缩
          <div className="titleBtn">
            {!edit
              ? (
                <div>
                  <Tooltip
                    arrowPointAtCenter
                    title={this.state.isAvailable ? (isAutoScaleOpen ? '弹性伸缩已开启' : '弹性伸缩已关闭') : '不允许弹性伸缩'} >
                    <Switch
                      disabled={!this.state.isAvailable}
                      onChange={this.handleSwitch}
                      checkedChildren="开" unCheckedChildren="关"
                      checked={isAutoScaleOpen}
                      className="switch" />
                  </Tooltip>
                  {isAutoScaleOpen && (
                    <Tooltip arrowPointAtCenter title="设置">
                      <Button
                        type="primary" shape="circle"
                        size="small" icon="setting"
                        onClick={this.handleEdit} />
                    </Tooltip>
                  )}
                </div>)
              : (
                <div>
                  <Button type="primary" size="large" onClick={this.handleSave}>{saveText}</Button>
                  <Button size="large" onClick={this.handleCancel}>取消</Button>
                </div>)
            }
          </div>
        </div>
        {this.state.isAvailable ? 
          <Alert message="注: 系统将根据设定的CPU阈值来自动的『扩展,或减少』该服务所『缺少,或冗余』的实例数量" type="info" /> :
          <Alert message="注: 已挂载存储卷的服务不允许设置弹性伸缩" type="info" />}
        <Card>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>服务名称</Col>
            <Col className="itemBody" span={20}>ngnix-test</Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>最小实例数量</Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12} style={{ marginTop: '24px' }}>
                  <Slider defaultValue={30}
                    value={minReplicas}
                    onChange={this.handleMinReplicas}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_MAX_NUM}
                    />
                </Col>
                <Col span={12}>
                  <InputNumber style={{ marginLeft: '16px' }}
                    value={minReplicas}
                    onChange={this.handleMinReplicas}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_MAX_NUM}
                    /> 个
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>最大实例数量</Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12} style={{ marginTop: '24px' }}>
                  <Slider defaultValue={30}
                    onChange={this.handleMaxReplicas}
                    value={maxReplicas}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_MAX_NUM} />
                </Col>
                <Col span={12}>
                  <InputNumber style={{ marginLeft: '16px' }}
                    value={maxReplicas}
                    onChange={this.handleMaxReplicas}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_MAX_NUM}
                    /> 个
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'right' }}>CPU阈值</Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12} style={{ marginTop: '24px' }}>
                  <Slider defaultValue={30}
                    onChange={this.handleTargetCPUUtilizationPercentage}
                    value={targetCPUUtilizationPercentage}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_AUTO_SCALE_MAX_CPU} />
                </Col>
                <Col span={12} id="tip">
                  <InputNumber style={{ marginLeft: '16px' }}
                    value={targetCPUUtilizationPercentage}
                    onChange={this.handleTargetCPUUtilizationPercentage}
                    disabled={!edit}
                    min={1}
                    max={INSTANCE_AUTO_SCALE_MAX_CPU}
                    /> %
                  <Tooltip title="容器实例实际占用CPU与实例CPU限制比例" getTooltipContainer={() =>
                    document.getElementById('tip')
                  }>
                    <i className="anticon anticon-question-circle-o" style={{ marginLeft: '40px' }} />
                  </Tooltip>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="cardItem" />
        </Card>
      </div>
    )
  }
}

AppAutoScale.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  replicas: PropTypes.number.isRequired,
  loadAutoScale: PropTypes.func.isRequired,
  deleteAutoScale: PropTypes.func.isRequired,
  updateAutoScale: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {
  const {
    autoScale,
  } = state.services
  let autoScaleData = {}
  let isAutoScaleOpen = false
  if (autoScale && autoScale.result && autoScale.result.data.spec) {
    autoScaleData = autoScale.result.data.spec
    isAutoScaleOpen = true
  }

  return {
    autoScale: autoScaleData,
    isAutoScaleOpen,
  }
}

export default connect(mapStateToProps, {
  loadAutoScale,
  deleteAutoScale,
  updateAutoScale,
})(AppAutoScale)