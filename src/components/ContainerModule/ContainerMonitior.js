/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/19
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Radio, } from 'antd';
import "./style/ContainerMonitior.less"
import CPUMonitior from './CPUMonitior'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
class ContainerMonitior extends Component {
  constructor(props){
    super(props)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.state = {
      timeChange: 1,
    }
  }
  handleTimeChange(e) {
    const {value} = e.target
    this.setState({
      timeChange: value
    })
  }
  render() {
    const { containerName, cluster } = this.props
    const { timeChange } = this.state
    return (
      <div id="ContainerMonitior">
        <div className="cpu">
          <div className="timeControl">
            <RadioGroup defaultValue="1" size="large" onChange={this.handleTimeChange}>
              <RadioButton value="1">1小时</RadioButton>
              <RadioButton value="6">6小时</RadioButton>
              <RadioButton value="24">1天</RadioButton>
              <RadioButton value="168">1周</RadioButton>
              <RadioButton value="672">1月</RadioButton>
            </RadioGroup>
          </div>
          <CPUMonitior changeTime = { timeChange } cluster={ cluster } containerName={ containerName } />
        </div>
      </div>
    )
  }
}
ContainerMonitior.propTypes = {
  
}
export default ContainerMonitior