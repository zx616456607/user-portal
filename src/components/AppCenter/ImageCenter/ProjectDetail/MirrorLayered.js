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
import {  Button, Steps, Tooltip } from 'antd'
import { injectIntl } from 'react-intl'
import './style/MirrorLayered.less'
import { loadMirrorSafetyLayerinfo } from '../../../../actions/app_center'
import { connect } from 'react-redux'
import mirrorLayered from './intl/mirrorLayered'

const Step = Steps.Step

class MirrorLayered extends Component {
  constructor(props){
    super(props)
    this.testContent = this.testContent.bind(this)
    this.handleStepScroll = this.handleStepScroll.bind(this)
    this.handleStepsCurrentNumber = this.handleStepsCurrentNumber.bind(this)
    this.APIGetLayerInfo = this.APIGetLayerInfo.bind(this)
    this.state = {
      currentNumber:0,
      APIloading : false
    }
  }

  handleStepScroll(){
    //console.log(this)
  }

  APIGetLayerInfo(){
    const { loadMirrorSafetyLayerinfo, imageName, tag } = this.props
    this.setState({APIloading : true})
    loadMirrorSafetyLayerinfo({ imageName, tag },{
      success : {
        func : ()=> {
          this.setState({APIloading : false})
        },
        isAsync : true
      },
      failed : {
        func : () => {
          this.setState({APIloading : false})
        },
        isAsync : false
      }
    })
  }

  testContent(){
    const {mirrorLayeredinfo, imageName, tag } = this.props
    const { formatMessage } = this.props.intl
    if(!mirrorLayeredinfo[imageName] || !mirrorLayeredinfo[imageName][tag] || !mirrorLayeredinfo[imageName][tag].result){
      return (<div style={{textAlign:'center'}}>
        <div style={{marginTop:'10px'}}>{formatMessage(mirrorLayered.noLayered)}</div>
        <Button onClick={this.APIGetLayerInfo} style={{marginTop:'10px'}} loading={this.state.APIloading}>{formatMessage(mirrorLayered.clickToScan)}</Button>
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
    const { mirrorLayeredinfo, LayerCommandParameters, imageName, tag } = this.props
    if(!LayerCommandParameters){
      return 0
    }
    const mirrorLayeredinfoArr = mirrorLayeredinfo[imageName][tag].result
    for(let i=0;i<mirrorLayeredinfoArr.length;i++){
      if(mirrorLayeredinfoArr[i].command.parameters == LayerCommandParameters){
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
