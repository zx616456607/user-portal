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
import { Tooltip, Badge, Timeline,Icon,Row,Col,Popover } from 'antd'
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
      <div className='SvcTip'>
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
          <div>
            <Row className="firstSvc">
              <Col style={{display:'inline-block',color:'#49b1e2'}}>{ item.name }</Col>
            </Row>
            <Timeline>
              <Timeline.Item dot={<div style={{height:5,width:5,backgroundColor:'#2db7f5',margin:'0 auto'}}></div>}></Timeline.Item>
              <Timeline.Item dot={<div></div>}>
                <svg className="branchSvg"><use xlinkHref="#branch"/></svg>
                {item.data[0]}
                <svg className="tipCopySvg"><use xlinkHref="#tipcopy"/></svg>
              </Timeline.Item>
            </Timeline>
          </div>
        )
      } else {
        return (
          <div>
            <Row className="firstSvc">
              <Col style={{display:'inline-block',color:'#49b1e2'}}>{ item.name }</Col>
            </Row>
            <Timeline>
              {/*<Timeline.Item dot={<div style={{height:5,width:5,backgroundColor:'#2db7f5',margin:'0 auto'}}></div>}/>*/}
            {
              item.data.map((url,index) => {
                if(index === 0){
                  return (
                    <Timeline.Item dot={<div style={{height:5,width:5,backgroundColor:'#2db7f5',margin:'0 auto'}}></div>}></Timeline.Item>
                  )
                } else {
                  return (
                    <Timeline.Item dot={<div></div>}>
                      <svg className="branchSvg"><use xlinkHref="#branch"/></svg>
                      {url}
                      <svg className="tipCopySvg"><use xlinkHref="#tipcopy"/></svg>
                    </Timeline.Item>
                  )
                }
              })
            }
            </Timeline>
          </div>
          
        )
      }
    })
    return (
      <div className='AppTip'>
        { item }
      </div>
    )
  }
}
export default class TipSvcDomain extends Component{
  constructor(props){
    super(props)
    this.showPop = this.showPop.bind(this)
    this.state = {
      show: false
    }
  }
  showPop(){
    console.log('POP !');
    const {show} = this.state
    this.setState({
      show: !show
    })
  }
  render(){
    const { appDomain,svcDomain,type } = this.props
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
          <div className='TipSvcDomain'>
            <a target="_blank" href={svcDomain[0]}>{svcDomain[0]}</a>
            <Popover placement="right"
                     content={<SvcTip svcDomain={svcDomain} />}
                     trigger="click"
                     onVisibleChange={ this.showPop }
                     arrowPointAtCenter={true}>
              <svg className={this.state.show?'more showPop':'more'} onClick={this.showPop}>
                <use xlinkHref="#more" />
              </svg>
            </Popover>
          </div>
        )
      }
    }
    if (appDomain) {
      if(appDomain.length === 0) {
        return (
          <div id="TipAppDomain">
            <span>-</span>
          </div>
        )
      } else if (appDomain.length === 1) {
        return (
          <a target="_blank">{appDomain[0].data[0]}</a>
        )
      } else {
        return (
          <div className={type ? 'TipAppDomain fixTop': 'TipAppDomain'}>
            <a target="_blank">{appDomain[0].data[0]}</a>
            <Popover placement={type?'rightBottom':'rightTop'}
                     content={<AppTip appDomain={appDomain}/>}
                     trigger="click"
                     onVisibleChange={ this.showPop }
                     getTooltipContainer={() => document.getElementsByClassName('TipAppDomain')[0]}
                     arrowPointAtCenter={true}
                     >
              <svg className={this.state.show?'more showPop':'more'} onClick={this.showPop}>
                <use xlinkHref="#more" />
              </svg>
            </Popover>
          </div>
        )
      }
    }
  }
}