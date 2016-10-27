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
import { Button, Alert, Card, Slider, Row, Col, InputNumber, Tooltip, Icon, Switch } from 'antd'
import { loadAutoScale } from '../../../actions/services'
import './style/AppAutoScale.less'

function loadData(props) {
  const { cluster, serviceName, loadAutoScale } = props
  loadAutoScale(cluster, serviceName)
}

class AppAutoScale extends Component {
  constructor(props) {
    super(props)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleMinReplicas = this.handleMinReplicas.bind(this)
    this.handleMaxReplicas = this.handleMaxReplicas.bind(this)
    this.handleTargetCPUUtilizationPercentage = this.handleTargetCPUUtilizationPercentage.bind(this)
    this.state = {
      edit: false,
      minReplicas: props.autoScale.minReplicas || 1,
      maxReplicas: props.autoScale.maxReplicas || 1,
      targetCPUUtilizationPercentage: props.autoScale.targetCPUUtilizationPercentage || 30,
    }
  }

  componentWillMount() {
    loadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const { cluster, serviceName, autoScale, replicas } = nextProps
    this.setState({
      minReplicas: autoScale.minReplicas || replicas,
      maxReplicas: autoScale.maxReplicas || replicas,
      targetCPUUtilizationPercentage: autoScale.targetCPUUtilizationPercentage || 30
    })
    if (serviceName === this.props.serviceName) {
      return
    }
    loadData(nextProps)
  }

  handleMinReplicas(value) {
    console.log('value1', value);
    this.setState({
      minReplicas: value,
    })
  }

  handleTargetCPUUtilizationPercentage(value) {
    this.setState({
      targetCPUUtilizationPercentage: value,
    })
  }

  handleMaxReplicas(value) {
    this.setState({
      maxReplicas: value,
    })
  }

  handleEdit() {
    this.setState({
      edit: true
    })
  }

  handleSave() {
    this.setState({
      edit: false
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

  /*? <Button type="primary" size="large" onClick={this.handleEdit}>编辑</Button>*/
  render() {
    const { isAutoScaleOpen } = this.props
    const { edit, minReplicas, maxReplicas, targetCPUUtilizationPercentage } = this.state
    return (
      <div id="AppAutoScale">
        <div className="title">
          自动弹性伸缩
          <div className="titleBtn">
            {!edit
              ? (
                <div>
                  <Tooltip title={isAutoScaleOpen ? '弹性伸缩已开启' : '弹性伸缩已关闭'}>
                    <Switch
                      onChange={this.handleEdit}
                      checkedChildren="开" unCheckedChildren="关"
                      checked={isAutoScaleOpen}
                      className="switch" />
                  </Tooltip>
                  {isAutoScaleOpen && (
                    <Tooltip title="修改">
                      <Button
                        type="primary" shape="circle"
                        size="small" icon="setting"
                        onClick={this.handleEdit} />
                    </Tooltip>
                  )}
                </div>)
              : (
                <div>
                  <Button type="primary" size="large" onClick={this.handleSave}>保存</Button>
                  <Button size="large" onClick={this.handleCancel}>取消</Button>
                </div>)
            }
          </div>
        </div>
        <Alert message="注: 系统将根据设定的CPU阈值来自动的『扩展,或减少』该服务所冗余的实例数量" type="info" />
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
                    onChange={this.handleMinReplicas}
                    value={minReplicas}
                    onChange={this.handleMinReplicas}
                    disabled={!edit}
                    />
                </Col>
                <Col span={12}>
                  <InputNumber style={{ marginLeft: '16px' }}
                    value={minReplicas}
                    onChange={this.handleMinReplicas}
                    disabled={!edit}
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
                    disabled={!edit} />
                </Col>
                <Col span={12}>
                  <InputNumber style={{ marginLeft: '16px' }}
                    value={maxReplicas}
                    onChange={this.handleMaxReplicas}
                    disabled={!edit}
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
                    disabled={!edit} />
                </Col>
                <Col span={12} id="tip">
                  <InputNumber style={{ marginLeft: '16px' }}
                    value={targetCPUUtilizationPercentage}
                    onChange={this.handleTargetCPUUtilizationPercentage}
                    disabled={!edit}
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
})(AppAutoScale)