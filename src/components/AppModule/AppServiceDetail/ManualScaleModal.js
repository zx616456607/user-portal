/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/27
 * @author ZhaoXueYu
 */
import React,{ Component } from 'react'
import './style/ManualScaleModal.less'
import { Row, Col, Slider, InputNumber, } from 'antd'

export default class ManualScaleModal extends Component {
  constructor(props){
    super(props)
    this.handleRealNum = this.handleRealNum.bind(this)
    this.state = {
      realNum: 0,
    }
  }
  handleRealNum(value) {
    this.setState({
      realNum: value
    })
  }
  render(){
    const { checkedServiceList } = this.props
    const { realNum } = this.state
    return (
      <div id="ManualScaleModal">
        <Row className="cardItem">
          <Col className="itemTitle" span={4} style={{textAlign: 'left'}}>服务名称</Col>
          <Col className="itemBody" span={20}>{ checkedServiceList[0].metadata.name }</Col>
        </Row>
        <Row className="cardItem">
          <Col className="itemTitle" span={4} style={{textAlign: 'left'}}>
            实际数量
            <i className="anticon anticon-question-circle-o" />
          </Col>
          <Col className="itemBody" span={20}>
            <Row>
              <Col span={12}>
                <Slider defaultValue={30} onChange={ this.handleRealNum } value={ realNum }/>
              </Col>
              <Col span={12}>
                <InputNumber style={{ marginLeft: '16px' }}
                             value={ realNum } onChange={this.handleRealNum}
                /> 个
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col style={{color: '#a0a0a0',textAlign: 'left',marginTop: '20px'}}>
            注: 实例数量调整 , 保存后系统将调整实例数量至设置预期. (若自动伸缩开启, 则无法手动扩展)
          </Col>
        </Row>
      </div>
    )
  }
}
