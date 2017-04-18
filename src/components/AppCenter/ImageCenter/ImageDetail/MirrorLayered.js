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
    this.state = {
      currentNumber:0
    }
  }

  componentWillReceiveProps(nextProps){
    console.log('this.props=',this.props)
    console.log('nextProps=',nextProps)
    const imageName = nextProps.imageName
    const tag = nextProps.tag
    const mirrorLayeredinfo = nextProps.mirrorLayeredinfo[imageName]
    if(imageName !== this.props.imageName || tag !== this.props.tag){
      //if(mirrorLayeredinfo[imageName] && mirrorLayeredinfo[imageName] == this.props.mirrorLayeredinfo[imageName]){
      //  return
      //}
      loadMirrorSafetyLayerinfo({ imageName, tag })
    }
  }

  handleStepScroll(){
    //console.log(this)
  }

  testContent(){
    const {mirrorLayeredinfo, imageName} = this.props
    console.log('mirrorLayeredinfo=',mirrorLayeredinfo)
    if(!mirrorLayeredinfo[imageName]){
      return <div></div>
    }
    if(mirrorLayeredinfo[imageName] && Object.keys(mirrorLayeredinfo[imageName]).length == 0){
      return (<div>
        <span>暂无数据</span>
        <Button>点击获取数据</Button>
      </div>)
    }
    const mirrorLayeredStep = mirrorLayeredinfo[imageName].map((item, index) =>{
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
  let layerInfo = images.mirrorSafetyLayerinfo.mirrorLayerinfo || ''
  return {
    layerInfo
  }
}
export default connect(mapStateToProps,{
  loadMirrorSafetyLayerinfo
})(injectIntl(MirrorLayered, {
  withRef: true,
}));