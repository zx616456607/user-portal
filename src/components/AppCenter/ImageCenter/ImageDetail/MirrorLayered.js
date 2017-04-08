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
    this.handleStepsCurrentNumber = this.handleStepsCurrentNumber.bind(this)
  }

  componentWillMount(){
    //const { layerInfo, loadMirrorSafetyLayerinfo, tag, imageName } = this.props
    //if(!layerInfo){
    //  loadMirrorSafetyLayerinfo({imageName, tag})
    //}
  }


  testContent(){
    const {mirrorLayeredinfo} = this.props
    if(Object.keys(mirrorLayeredinfo).length == 0){
      return (<div>
        <span>暂无数据</span>
        <Button>点击获取数据</Button>
      </div>)
    }
    const mirrorLayeredStep = mirrorLayeredinfo.map((item, index) =>{
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