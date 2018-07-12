/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * label module
 *
 * v0.1 - 2018-07-11
 * @author rensiwei
 */



import React, { Component } from 'react'
import { Table, Button, Popover } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import { connect } from 'react-redux'
import { BlockPicker, TwitterPicker, SketchPicker } from 'react-color'
import { loadProjectList } from '../../../../../actions/harbor'
import NotificationHandler from '../../../../../components/Notification'

const colors = [
  '#872ED8', '#AE64F4', '#4067FF', '#548CFE', '#2DB8F4',
  '#2BCFE5', '#00D183', '#27E09A', '#54C41A', '#83D167',
  '#FCBB00', '#F9B659', '#FF6A00', '#FF8A67', '#F5232B',
  '#F95561', '#EC3195', '#FB7F9E', '#687689', '#AABAC4',
]
class Project extends Component {
  state = {
    color: 'orange'
  }
  handleColorChange = ({ hex: color }) => {
    console.log(color)
    this.setState({
      color,
    })
  }
  render() {
    const { color } = this.state
    const content1 = <BlockPicker
        colors={colors}
        color={color}
        triangle="hide"
        onChangeComplete={this.handleColorChange} />
    const content2 = <TwitterPicker
        colors={colors}
        color={color}
        triangle="hide"
        onChangeComplete={this.handleColorChange} />
    const content3 = <SketchPicker
        colors={colors}
        color={color}
        onChangeComplete={this.handleColorChange} />
    return (
      <QueueAnim className='LabelModule'>
        <div style={{width: 100, height: 100, backgroundColor: color, position: 'relative', marginBottom: '10px'}}>
          <span style={{position: 'absolute', left: 50, top: 50, transform: 'translate(-50%, -50%)', color: 'white'}}>text</span>
        </div>
        <div key="main">
          <span className="marginRight">label</span>
          <Popover placement="bottom" content={content1} trigger="click">
            <Button className="marginRight">BlockPicker</Button>
          </Popover>
          <Popover placement="bottom" content={content2} trigger="click">
            <Button className="marginRight">TwitterPicker</Button>
          </Popover>
          <Popover placement="bottom" content={content3} trigger="click">
            <Button className="marginRight">SketchPicker</Button>
          </Popover>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities } = state
  return {
    entities,
  }
}

export default connect(mapStateToProps, {
  loadProjectList,
})(Project)
