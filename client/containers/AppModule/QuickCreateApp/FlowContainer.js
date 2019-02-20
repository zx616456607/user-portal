import React from 'react'
import { Row, Col, Checkbox, Icon, Tooltip, Slider, Input } from 'antd'
import * as FlowActons from '../../../actions/FlowContainer'
import './style/FlowContainer.less'
import { connect } from 'react-redux'
import get from 'lodash/get'
import * as cont from '../../../../src/constants'

const marks = {
  0: '1M',
  25: '50M',
  50: '100M',
  75: '150M',
  100: '200M',
};

class FlowContainer extends React.Component {
  async componentDidMount() {
    if (this.props.serviceDetail) {
      const res = get(this.props.serviceDetail, [ 'spec', 'template', 'metadata', 'annotations' ], {})
      const sliderValue1 = res[cont.flowContainerIN]
      const sliderValue2 = res[cont.flowContainerOut]
      if (sliderValue1 || sliderValue2) {
        this.props.setFlowContainersFields({
          check: false,
          sliderValue1: this.restValue(sliderValue1),
          sliderValue2: this.restValue(sliderValue2),
        })
      }
      return
    }
    this.props.setFlowContainersFields({
      check: true,
      sliderValue1: 0,
      sliderValue2: 0,
    })
  }
  restValue(value) {
    if (typeof value !== 'string') { return 0 }
    const newValue = parseInt(value) / 2
    if (newValue > 100 || newValue < 0) {
      return 0
    }
    return newValue
  }
  componentWillUnmount() {
    this.props.setFlowContainersFields({
      check: true,
      sliderValue1: 0,
      sliderValue2: 0,
    })
  }
  onCheckChange = e => {
    if (e) {
      this.props.setFlowContainersFields({ sliderValue1: 0, sliderValue2: 0 })
    }
    this.props.setFlowContainersFields({ check: !e.target.checked })
    this.props.setParentState && this.props.setParentState(true)
  }
  onSlider1Change = e => {
    this.props.setFlowContainersFields({ sliderValue1: e })
    this.props.setParentState && this.props.setParentState(true)
  }
  onSlider2Change = e => {
    this.props.setFlowContainersFields({ sliderValue2: e })
    this.props.setParentState && this.props.setParentState(true)
  }
  getValue = sliderValue => {
    if (this.props.check) {
      return '无限制'
    }
    return sliderValue === 0 ? 1 : sliderValue * 2
  }
  render() {
    return (
      <div className="FlowContainer">
        <Row>
          <Col span={4}>
            <div className="FlowTitle">带宽限制</div>
          </Col>
          <Col span={20}>
            <Checkbox onChange={this.onCheckChange} checked={!this.props.check}>
              启动带宽限制
              <Tooltip title="限制容器服务间网络带宽，避免异常网络影响宿主机其他应用服务">
                <Icon type="info-circle-o" className="InfoIcon"/>
              </Tooltip>
            </Checkbox>
            <Row className="SliderRow">
              <Col span={2}>
                <div className="inOutInfo">入站</div>
              </Col>
              <Col span={14}>
                <Slider
                  marks={marks}
                  defaultValue={0}
                  disabled={this.props.check}
                  onChange={this.onSlider1Change}
                  tipFormatter={() => {
                    if (this.props.check) {
                      return 0
                    }
                    return this.props.sliderValue1 === 0 ? 1 : this.props.sliderValue1 * 2
                  }}
                  value={this.props.sliderValue1}
                />
              </Col>
              <Col span={1}></Col>
              <Col span={7}>
                <div className="InputWrap">
                  <Input
                    style={{ width: '40%' }}
                    disabled={this.props.check}
                    value={this.getValue(this.props.sliderValue1)}
                  />
                  <span className="containerN">Mbps * 实例数</span>
                </div>
              </Col>
            </Row>
            <Row className="SliderRow">
              <Col span={2}>
                <div className="inOutInfo">出站</div>
              </Col>
              <Col span={14}>
                <Slider
                  marks={marks}
                  defaultValue={0}
                  disabled={this.props.check}
                  onChange={this.onSlider2Change}
                  tipFormatter={() => {
                    if (this.props.check) {
                      return 0
                    }
                    return this.props.sliderValue2 === 0 ? 1 : this.props.sliderValue2 * 2
                  }}
                  value={this.props.sliderValue2}
                />
              </Col>
              <Col span={1}></Col>
              <Col span={7}>
                <div className="InputWrap">
                  <Input style={{ width: '40%' }} disabled={this.props.check} value={this.getValue(this.props.sliderValue2)}/>
                  <span className="containerN">Mbps * 实例数</span>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const check = get(state, [ 'FlowContainer', 'getFlowContainerValue', 'check' ])
  const sliderValue1 = get(state, [ 'FlowContainer', 'getFlowContainerValue', 'sliderValue1' ])
  const sliderValue2 = get(state, [ 'FlowContainer', 'getFlowContainerValue', 'sliderValue2' ])
  return { check, sliderValue1, sliderValue2 }
}
export default connect(mapStateToProps, {
  setFlowContainersFields: FlowActons.setFlowContainersFields,
})(FlowContainer)
