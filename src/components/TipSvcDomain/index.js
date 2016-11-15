/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/14
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Tooltip, Badge, Timeline,Icon,Row,Col } from 'antd'
import './style/TipSvcDomain.less'

class SvcTip extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { svcDomain } = this.props
    let item = svcDomain.map((item,index) => {
      return (
        <li key={item}>{item}</li>
      )
    })
    return (
      <div className='Tip'>
        <ul>
          { item }
        </ul>
      </div>
    )
  }
}
class AppTip extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { appDomain } = this.props
    let item = appDomain.map((item,index) => {
      if(item.data.length === 0){
        return (
          <div>
            <span>-</span>
          </div>
        )
      } else if (item.data.length === 1) {
        return (
          <Row className="firstSvc">
            <Col span={5}>{ item.name }</Col>
            <Col span={10} className='urlFirstItem'>
              { item.data[0] }
            </Col>
          </Row>
        )
      } else {
        return (
          <div>
            <Row className="firstSvc">
              <Col span={5}>{ item.name }</Col>
              <Col span={10} className='urlFirstItem'>
                { item.data[0] }
              </Col>
            </Row>
            {
              item.data.map((url,index) => {
                if(index === 0){
                  return
                } else {
                  return (
                    <Row className="svcItem">
                      <Col span={5}/>
                      <Col span={10} className='urlItem'>
                        { url }
                      </Col>
                    </Row>
                  )
                }
              })
            }
          </div>
        )
      }
    })
    return (
      <div id='AppTip'>
        { item }
      </div>
    )
  }
}
export default class TipSvcDomain extends Component{
  constructor(props){
    super(props)
    this.popTip = this.popTip.bind(this)
    this.state = {
      
    }
  }
  popTip(){
    console.log('POP !');
  }
  render(){
    const { appDomain,svcDomain } = this.props
    //const svcDomain = ['10.1.27.1', '10.1.27.2', '10.1.27.3', '10.1.27.4', '10.1.27.5',]
    if (svcDomain) {
      if(svcDomain.length == 0){
        return (
          <span>-</span>
        )
      } else if (svcDomain.length == 1) {
        return (
          <div id='TipSvcDomain'>
            <a target="_blank" href={svcDomain[0]}>{svcDomain[0]}</a>
          </div>
        )
      } else if (svcDomain.length == 2) {
        return (
          <div id='TipSvcDomain'>
            <a target="_blank" href={svcDomain[0]}>{svcDomain[0]}</a>
            <a target="_blank" href={svcDomain[1]}>{svcDomain[1]}</a>
          </div>
        )
      } else if (svcDomain.length > 2) {
        return (
          <div id='TipSvcDomain'>
            <a target="_blank" href={svcDomain[0]}>{svcDomain[0]}</a>
            <Tooltip placement="right" title={ (<SvcTip svcDomain={svcDomain} />) }>
              <div className="more"><Icon type="ellipsis" style={{transform: 'scale(.7)'}}/></div>
            </Tooltip>
          </div>
        )
      }
    }
    if (appDomain) {
      if(appDomain.length === 0){
        return (
          <div id="TipAppDomain">
            <span>-</span>
          </div>
        )
      } else {
        return (
        <div id='TipAppDomain'>
          <a target="_blank">{appDomain[0].data[0]}</a>
          <Tooltip placement="right" title={<AppTip appDomain={appDomain}/>}
                   getTooltipContainer={() => document.getElementById('TipAppDomain')}
                   arrowPointAtCenter={true}>
            <div className="more"><Icon type="ellipsis" style={{transform: 'scale(.7)'}}/></div>
          </Tooltip>
        </div>
        )
      }
    }
  }
}