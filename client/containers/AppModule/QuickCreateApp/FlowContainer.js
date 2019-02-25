import React from 'react'
import { Row, Col, Checkbox, Icon, Tooltip, Slider, InputNumber } from 'antd'
import './style/FlowContainer.less'
import get from 'lodash/get'
import * as cont from '../../../../src/constants'

const marks = {
  1: '1Mbps',
  250: '250Mbps',
  500: '500Mbps',
  750: '750Mbps',
  1000: '1000Mbps',
};

export default class FlowContainer extends React.Component {
  async componentDidMount() {
    if (this.props.serviceDetail) {
      const res = get(this.props.serviceDetail, [ 'spec', 'template', 'metadata', 'annotations' ], {})
      const sliderValue1 = res[cont.flowContainerIN]
      const sliderValue2 = res[cont.flowContainerOut]
      if (sliderValue1 || sliderValue2) {
        this.props.form.setFieldsValue({
          flowSliderCheck: true,
          flowSliderInput: this.restValue(sliderValue1),
          flowSliderOut: this.restValue(sliderValue2),
        })
        return
      }
    }
    this.props.form.setFieldsValue({
      flowSliderCheck: false,
      flowSliderInput: undefined,
      flowSliderOut: undefined,
    })
  }
  restValue(value) {
    if (typeof value !== 'string') { return 0 }
    return parseInt(value) / 8000
  }
  // componentWillUnmount() {
  //   this.props.setFlowContainersFields({
  //     check: true,
  //     sliderValue1: 1,
  //     sliderValue2: 1,
  //   })
  // }
  onCheckChange = e => {
    if (e.target.checked) {
      this.props.form.setFieldsValue({ flowSliderInput: 1, flowSliderOut: 1 })
    } else {
      this.props.form.setFieldsValue({ flowSliderInput: undefined, flowSliderOut: undefined })
    }
    this.props.setParentState && this.props.setParentState(true)
  }
  onSlider1Change = e => {
    if (e === undefined) { e = 1 }
    this.props.form.setFieldsValue({ flowSliderInput: e })
    this.props.setParentState && this.props.setParentState(true)
  }
  onSlider2Change = e => {
    if (e === undefined) { e = 1 }
    this.props.form.setFieldsValue({ flowSliderOut: e })
    this.props.setParentState && this.props.setParentState(true)
  }
  getValue = sliderValue => {
    if (!this.props.form.getFieldValue('flowSliderCheck')) {
      return '无限制'
    }
    return sliderValue
  }
  render() {
    return (
      <div className="FlowContainer" style={{ marginBottom: this.props.serviceDetail ? '48px' : 0 }}>
        <Row>
          <Col span={4}>
            { this.props.serviceDetail ?
              <div>带宽限制</div> :
              <div className="FlowTitle">带宽限制</div>
            }
          </Col>
          <Col span={20}>
            <Checkbox
              {...this.props.form.getFieldProps('flowSliderCheck', {
                onChange: this.onCheckChange,
                valuePropName: 'checked',
              })}
            >
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
                  min={1}
                  max={1000}
                  marks={marks}
                  defaultValue={0}
                  disabled={!this.props.form.getFieldValue('flowSliderCheck')}
                  onChange={this.onSlider1Change}
                  tipFormatter={() => {
                    if (this.props.check) {
                      return 0
                    }
                    return this.props.form.getFieldValue('flowSliderInput')
                  }}
                  value={this.props.form.getFieldValue('flowSliderInput')}
                />
              </Col>
              <Col span={1}></Col>
              <Col span={7}>
                <div className="InputWrap">
                  <InputNumber min={1} max={1000}
                    style={{ width: '40%' }}
                    disabled={!this.props.form.getFieldValue('flowSliderCheck')}
                    // value={this.getValue(this.props.sliderValue1)}
                    // onChange={this.onSlider1Change}
                    placeholder={'无限制'}
                    {...this.props.form.getFieldProps('flowSliderInput', {
                      onChange: this.onSlider1Change,
                    })}
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
                  min={1}
                  max={1000}
                  marks={marks}
                  defaultValue={0}
                  disabled={!this.props.form.getFieldValue('flowSliderCheck')}
                  onChange={this.onSlider2Change}
                  tipFormatter={() => {
                    if (this.props.check) {
                      return 0
                    }
                    return this.props.form.getFieldValue('flowSliderOut')
                  }}
                  value={this.props.form.getFieldValue('flowSliderOut')}
                />
              </Col>
              <Col span={1}></Col>
              <Col span={7}>
                <div className="InputWrap">
                  <InputNumber
                    min={1}
                    max={1000}
                    style={{ width: '40%' }}
                    disabled={!this.props.form.getFieldValue('flowSliderCheck')}
                    // value={this.getValue(this.props.sliderValue2)}
                    // onChange={this.onSlider2Change}
                    placeholder={'无限制'}
                    {...this.props.form.getFieldProps('flowSliderOut', {
                      onChange: this.onSlider2Change,
                    })}
                  />
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

