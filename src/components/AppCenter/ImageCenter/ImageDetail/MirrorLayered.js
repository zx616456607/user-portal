/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * MirrorLayered component
 *
 * v0.1 - 2017-3-22
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table, Tooltip } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/MirrorLayered.less'
import { loadMirrorSafetyLayerinfo } from '../../../../actions/app_center'
import { connect } from 'react-redux'

const Step = Steps.Step

class MirrorLayered extends Component {
  constructor(props){
    super(props)
    this.testContent = this.testContent.bind(this)
    this.handleStepScroll = this.handleStepScroll.bind(this)
    this.handleStepsCurrentNumber = this.handleStepsCurrentNumber.bind(this)
    this.APIGetLayerInfo = this.APIGetLayerInfo.bind(this)
    this.state = {
      currentNumber:0
    }
  }

  handleStepScroll(){
    //console.log(this)
  }

  APIGetLayerInfo(){
    const { loadMirrorSafetyLayerinfo, mirrorScanstatus, imageName, tag } = this.props
    loadMirrorSafetyLayerinfo({ imageName, tag })
  }

  testContent(){
    const {mirrorLayeredinfo, imageName, tag } = this.props
    if(!mirrorLayeredinfo[imageName] || !mirrorLayeredinfo[imageName][tag] || !mirrorLayeredinfo[imageName][tag].result){
      return <div></div>
    }
    if(mirrorLayeredinfo[imageName][tag].result && Object.keys(mirrorLayeredinfo[imageName][tag].result).length == 0){
      return (<div>
        <span>暂无数据</span>
        <Button onClick={null}>点击获取数据</Button>
      </div>)
    }
    const mirrorLayeredStep = mirrorLayeredinfo[imageName][tag].result.map((item, index) =>{
      return (
        <Step title={null} description={ <div className='safetytabitem'>
          <Tooltip title={item.iD}>
            <div className='safetytabitemleft'>{item.iD}</div>
          </Tooltip>
          <span className='safetytabitemtitle'>{item.command.action}</span>
          <div className='safetytabitemdescription'>
            {item.command.parameters}
          </div>
        </div> } className='safetycontentmianitem' key={index}/>
      )
    })
    return (<Steps direction="vertical" className='safetycontentmian' current={this.handleStepsCurrentNumber()}>
      {mirrorLayeredStep}
    </Steps>)
  }

  handleStepsCurrentNumber(){
    const { mirrorLayeredinfo, LayerCommandParameters } = this.props
    if(!LayerCommandParameters){
      return 0
    }
    for(let i=0;i<mirrorLayeredinfo.length;i++){
      if(mirrorLayeredinfo[i].command.parameters == LayerCommandParameters){
        this.setState({
          currentNumber:i
        })
        return i
      }
    }
  }

  render(){
    return (
      <div id='MirrorLayered'>
        {this.testContent()}
      </div>
    )
  }
}

function mapStateToProps(state,props){
  const { images } = state
  let mirrorLayeredinfo = images.mirrorSafetyLayerinfo
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  return {
    mirrorLayeredinfo,
    mirrorScanstatus
  }
}
export default connect(mapStateToProps,{
  loadMirrorSafetyLayerinfo
})(injectIntl(MirrorLayered, {
  withRef: true,
}));