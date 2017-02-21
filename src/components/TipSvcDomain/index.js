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
import { Tooltip, Badge, Timeline, Icon, Row, Col, Popover } from 'antd'
import './style/TipSvcDomain.less'

class SvcTip extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { svcDomain } = this.props
    let item = svcDomain.map((element, index) => {
      let linkURL = 'http://' + element.domain
      return (
        <li key={element.domain}>
          <a href="javascript:void(0)" > 容器端口:{element.interPort}</a>
          &nbsp;&nbsp;
          <a href={linkURL} target='_blank'>{element.isInternal ? '内网' : '外网'}:{element.domain}</a>
        </li>
      )
    })
    return (
      <div className='SvcTip'>
        <ul>
          {item}
        </ul>
      </div>
    )
  }
}

class AppTip extends Component {
  constructor(props) {
    super(props)
    this.copyCode = this.copyCode.bind(this)
    this.returnDefaultTooltip = this.returnDefaultTooltip.bind(this)
    this.startCopyCode = this.startCopyCode.bind(this)
  }
  copyCode(e) {
    //this function for copy url
    const { scope } = this.props;
    let code = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName('input');
    code[0].select();
    document.execCommand('Copy', false);
    scope.setState({
      copyStatus: true
    });
  }
  returnDefaultTooltip() {
    //this function for return default tooltip message
    const { scope } = this.props;
    setTimeout(function () {
      scope.setState({
        copyStatus: false
      });
    }, 500);
  }
  startCopyCode(url) {
    //this function for copy code to input
    let code = document.getElementsByClassName('privateCodeInput');
    for(let index = 0; index < code.length; index++) {
      code[index].value = url.domain;
    }
  }
  render() {
    const { appDomain, scope } = this.props
    let item = appDomain.map((item, index) => {
      if (item.data.length === 0) {
        return (
          <div>
            <span>-</span>
          </div>
        )
      }
      if (item.data.length === 1) {
        let linkURL = 'http://' + item.data[0].domain
        return (
          <div>
            <Row className='firstSvc'>
              <Col style={{ display: 'inline-block', color: '#49b1e2' }}>{item.name}</Col>
            </Row>
            <Timeline>
              <Timeline.Item dot={<div style={{ height: 5, width: 5, backgroundColor: '#2db7f5', margin: '0 auto' }}></div>}>
              </Timeline.Item>
              <Timeline.Item dot={<div></div>}>
                <svg className='branchSvg'><use xlinkHref='#branch' /></svg>
                <a href="javascript:void(0)">容器端口:{item.data[0].interPort}</a>&nbsp;&nbsp;
                <a href={linkURL} target='_blank'>
                  {
                    item.data[0].isInternal ? '内网' : '外网'
                  }:{
                    item.data[0].domain
                  }
                </a>
                <Tooltip placement='top' title={scope.state.copyStatus ? '复制成功' : '点击复制'}>
                  <svg className='tipCopySvg' onClick={this.copyCode} onMouseLeave={this.returnDefaultTooltip} onMouseEnter={this.startCopyCode.bind(this, item.data[0].domain)}><use xlinkHref='#appcentercopy' /></svg>
                </Tooltip>
              </Timeline.Item>
            </Timeline>
          </div>
        )
      }
      if (item.data.length > 1) {
        let emptyArray = ['']
        let list = emptyArray.concat(item.data)
        return (
          <div>
            <Row className='firstSvc'>
              <Col style={{ display: 'inline-block', color: '#49b1e2' }}>{item.name}</Col>
            </Row>
            <Timeline>
              {
                list.map((url, index) => {
                  if (index === 0) {
                    return (
                      <Timeline.Item dot={ <div style={{ height: 5, width: 5, backgroundColor: '#2db7f5', margin: '0 auto' }}></div> }>
                      </Timeline.Item>
                    )
                  }
                  let linkURL = 'http://' + url.domain
                  return (
                    <Timeline.Item dot={<div></div>}>
                      <svg className='branchSvg'><use xlinkHref='#branch' /></svg>
                      <a href="javascript:void(0)">容器端口:{url.interPort}</a>&nbsp;&nbsp;
                      <a href={linkURL} target='_blank'>{url.isInternal ? '内网' : '外网'}:{url.domain}</a>
                      <Tooltip placement='top' title={scope.state.copyStatus ? '复制成功' : '点击复制'}>
                        <svg className='tipCopySvg' onClick={this.copyCode} onMouseLeave={this.returnDefaultTooltip} onMouseEnter={this.startCopyCode.bind(this, url)}><use xlinkHref='#appcentercopy' /></svg>
                      </Tooltip>
                    </Timeline.Item>
                  )
                })
              }
            </Timeline>
          </div>
        )
      }
    })
    return (
      <div className='AppTip'>
        {item}
        <input className='privateCodeInput' style={{ position: 'absolute', opacity: '0' }} />
      </div>
    )
  }
}

export default class TipSvcDomain extends Component {
  constructor(props) {
    super(props)
    this.showPop = this.showPop.bind(this)
    this.state = {
      show: false,
      copyStatus: false
    }
  }
  showPop() {
    const {show} = this.state
    this.setState({
      show: !show
    })
  }
  getIconHtml() {
    const { icon } = this.props
    if (icon === 'https') {
      return (<Tooltip title='HTTPS模式'><svg className='https' ><use xlinkHref='#https' /></svg></Tooltip>)
    }
    else {
      return null
    }
  }
  render() {
    const { appDomain, svcDomain, type, parentNode } = this.props
    const scope = this
    if (svcDomain) {
      if (svcDomain.length == 0) {
        return (
          <span>-</span>
        )
      } else if (svcDomain.length == 1) {
        let linkURL = 'http://' + svcDomain[0].domain
        return (
          <div id='TipSvcDomain'>
            <a target='_blank' href={linkURL}>{svcDomain[0].domain}</a>
          </div>
        )
      }
      if (svcDomain.length > 1) {
        let linkURL = 'http://' + svcDomain[0].domain
        return (
          <div className='TipSvcDomain'>
            <span className='appDomain'>
              <a target='_blank' href={linkURL}>{this.getIconHtml()}{svcDomain[0].domain}</a>
            </span>
            <Popover placement='right'
              content={<SvcTip svcDomain={svcDomain} />}
              trigger='click'
              onVisibleChange={this.showPop}
              getTooltipContainer={() => document.getElementsByClassName(parentNode)[0]}
              >
              <svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                <use xlinkHref='#more' />
              </svg>
            </Popover>
          </div>
        )
      }
    }
    if (appDomain) {
      if (appDomain.length === 0) {
        return (
          <div id='TipAppDomain'>
            <span>-</span>
          </div>
        )
      } else if (appDomain.length === 1) {
        if (appDomain[0].data.length == 1) {
          let linkURL = 'http://' + appDomain[0].data[0].domain
          return (
            <a target='_blank' href={linkURL}>{appDomain[0].data[0].domain}</a>
          )
        }
        if (appDomain[0].data.length > 1) {
          let linkURL = 'http://' + appDomain[0].data[0].domain
          return (
            <div className={type ? 'TipAppDomain fixTop' : 'TipAppDomain'}>
              <span className='appDomain'>
                {this.getIconHtml()}
                <a target='_blank' href={linkURL}>{appDomain[0].data[0].domain}</a>
              </span>
              <Popover placement={type ? 'rightBottom' : 'rightTop'}
                content={<AppTip scope={scope} appDomain={appDomain} />}
                trigger='click'
                onVisibleChange={this.showPop}
                getTooltipContainer={() => document.getElementsByClassName(parentNode)[0]}
                arrowPointAtCenter={true}
                >
                <svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                  <use xlinkHref='#more' />
                </svg>
              </Popover>
            </div>
          )
        }
      } else {
        let linkURL = 'http://' + appDomain[0].data[0].domain
        return (
          <div className={type ? 'TipAppDomain fixTop' : 'TipAppDomain'}>
            <span className='appDomain'>
              <a target='_blank' href={linkURL}>{this.getIconHtml()}{appDomain[0].data[0].domain}</a>
            </span>
            <Popover placement={type ? 'rightBottom' : 'rightTop'}
              content={<AppTip scope={scope} appDomain={appDomain} />}
              trigger='click'
              onVisibleChange={this.showPop}
              getTooltipContainer={() => document.getElementsByClassName(parentNode)[0]}
              arrowPointAtCenter={true}
              >
              <svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                <use xlinkHref='#more' />
              </svg>
            </Popover>
          </div>
        )
      }
    }
  }
}