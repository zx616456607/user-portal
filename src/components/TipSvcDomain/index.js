/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  server and app some port in card
 *
 * v0.1 - 2016/11/14
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Tooltip, Badge, Timeline, Icon, Row, Col, Popover } from 'antd'
import './style/TipSvcDomain.less'
import { genRandomString } from '../../common/tools'
import TenxIcon from '@tenx-ui/icon'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../AppModule/ServiceIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
import meshIcon from '../../assets/img/meshIcon.svg'
import {API_URL_PREFIX } from '../../constants'
import { toQuerystring } from '../../common/tools'
// server tips port card
class SvcTip extends Component {
  constructor(props) {
    super(props)
    this.state = {
      copyStatus: false,
      inputID: `serverCodeInput${genRandomString('0123456789',4)}`
    }
  }
  servercopyCode() {
    let code = document.getElementById(this.state.inputID);
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyStatus: true
    });
  }
  returnDefaultTooltip() {
     //this function for return default tooltip message
    const _this = this
    setTimeout(function () {
      _this.setState({
        copyStatus: false
      });
    }, 500);
  }
  startCopyCode(url) {
    //this function for copy code to input
    let code = document.getElementById(this.state.inputID);
    code.value = url
  }

  render() {
    const { formatMessage } = this.props
    const { svcDomain } = this.props
    const scope = this
    let item = svcDomain.map((element, index) => {
      let linkURL = 'http://' + element.domain
      return (
        <li key={element.domain + element.interPort}>
          <a href="javascript:void(0)" >{formatMessage(AppServiceDetailIntl.conatinerPort)}:{element.interPort}</a>
          &nbsp;&nbsp;
          <a href={linkURL} target='_blank'>{lbgroup2Text(element)}:{element.domain}</a>
          <Tooltip placement='top' title={scope.state.copyStatus ?
            formatMessage(AppServiceDetailIntl.copySuccess)
            :
            formatMessage(AppServiceDetailIntl.clickCopy)
            }>
            <TenxIcon type="copy"
                      onClick={this.servercopyCode.bind(this)}
                      onMouseLeave={ this.returnDefaultTooltip.bind(this) }
                      onMouseEnter={this.startCopyCode.bind(this,element.domain)}
                      className='tipCopySvg'
            />
          </Tooltip>
          {renderProtocolIcon(element)}
        </li>
      )
    })
    return (
      <div className='SvcTip'>
        <input id={this.state.inputID} style={{ position: 'absolute', opacity: '0' }} />
        <ul>
          {item}
        </ul>
      </div>
    )
  }
}

// app card port content
class AppTipComponent extends Component {
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
    const { appDomain, scope, serviceMeshflagListInfo = [] } = this.props
    const { formatMessage } = this.props.intl
    let item = appDomain.map((item, index) => {
      const serviceMeshinfo = this.props.serviceMeshflagListInfo.find(({name}) => name === item.name) || {}
      if (item.data.length === 0) {
        return (
          <div className="AppTipComponent">
            <span>-</span>
          </div>
        )
      }
      if (item.data.length === 1) {
        let linkURL = 'http://' + item.data[0].domain
        return (
          <div className="AppTipComponent">
            <Row className='firstSvc'>
              <Col style={{ display: 'inline-block', color: '#49b1e2' }}>{item.name}</Col>
            </Row>
            {
              serviceMeshinfo.istioEnabled ?
              <ServiceMeshInfo
                serviceMeshinfo={serviceMeshinfo}
                msaUrl={this.props.msaUrl}
              /> :
            <Timeline>
              <Timeline.Item dot={<div style={{ height: 5, width: 5, backgroundColor: '#2db7f5', margin: '0 auto' }}></div>}>
              </Timeline.Item>
              <Timeline.Item dot={<div></div>}>
                <TenxIcon type="branch"  className='branchSvg'/>
                <a href="javascript:void(0)">{formatMessage(AppServiceDetailIntl.containerPort)}:{item.data[0].interPort}</a>&nbsp;&nbsp;
                <a href={linkURL} target='_blank'>`
                  {
                    lbgroup2Text(item.data[0], formatMessage)
                  }:{
                    item.data[0].domain
                  }
                </a>
                <Tooltip placement='top' title={scope.state.copyStatus ?
                  formatMessage(AppServiceDetailIntl.copySuccess)
                  :
                  formatMessage(AppServiceDetailIntl.clickCopy)
                  }>
                  <TenxIcon type="copy"
                            onClick={this.copyCode}
                            onMouseLeave={ this.returnDefaultTooltip }
                            onMouseEnter={this.startCopyCode.bind(this, item.data[0].domain)}
                            className='tipCopySvg'
                  />
                </Tooltip>
                {renderProtocolIcon(item.data[0].domain)}
              </Timeline.Item>
            </Timeline>
            }
          </div>
        )
      }
      if (item.data.length > 1) {
        let emptyArray = ['']
        let list = emptyArray.concat(item.data)
        return (
          <div className="AppTipComponent">
            <Row className='firstSvc'>
              <Col style={{ display: 'inline-block', color: '#49b1e2' }}>{item.name}</Col>
            </Row>
            {
              serviceMeshinfo.istioEnabled ?
              <ServiceMeshInfo
                serviceMeshinfo={serviceMeshinfo}
                msaUrl={this.props.msaUrl}
              /> :
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
                  if (linkURL.endsWith("undefined")) {
                    // TODO: Skip undefined port if it has, refine later
                    return <div></div>
                  }
                  return (
                    <Timeline.Item dot={<div></div>}>
                      <TenxIcon type="branch" className='branchSvg'/>
                      <a href="javascript:void(0)">{formatMessage(AppServiceDetailIntl.conatinerPort)}:{url.interPort}</a>&nbsp;&nbsp;
                      <a href={linkURL} target='_blank'>{lbgroup2Text(url)}:{url.domain}</a>
                      <Tooltip placement='top' title={scope.state.copyStatus ? formatMessage(AppServiceDetailIntl.copySuccess)
                        :
                        formatMessage(AppServiceDetailIntl.clickCopy)
                        }>
                        <TenxIcon type="copy"
                          className='tipCopySvg'
                          onClick={this.copyCode}
                          onMouseLeave={this.returnDefaultTooltip}
                          onMouseEnter={this.startCopyCode.bind(this, url)}
                        />
                      </Tooltip>
                      {renderProtocolIcon(url)}
                    </Timeline.Item>
                  )
                })
              }
            </Timeline>
            }
          </div>
        )
      }
    })
    return (
      <div className='AppTip'>
        <input className='privateCodeInput' style={{ position: 'absolute', opacity: '0' }} />
        {item}
      </div>
    )
  }
}

const AppTip = injectIntl(AppTipComponent, {
  withRef: true,
})

function lbgroup2Text(item, formatMessage) {
  const { isInternal, lbgroup, isLb } = item
  let before = <FormattedMessage {...AppServiceDetailIntl.inCluster}/>
  let after = <FormattedMessage {...AppServiceDetailIntl.publicNetWork}/>
  if (lbgroup) {
    before = <FormattedMessage {...AppServiceDetailIntl.inCluster}/>
    const { type, id } = lbgroup
    if (type === 'public') {
      after = <FormattedMessage {...AppServiceDetailIntl.publicNetWork}/>
    }
    if (type === 'private') {
      after = <FormattedMessage  {...AppServiceDetailIntl.intranet}/>
    }
  }
  if (isLb) {
    return <FormattedMessage {...AppServiceDetailIntl.appLoadBalance}/>
  }
  return isInternal ? before : after
}

const renderProtocolIcon = element => {
  if (!element.isLb) {
    return null
  }
  let protocolText = ''
  let title = ''
  switch (element.protocol) {
    case 'tcp':
      protocolText = 'T'
      title = 'TCP'
      break
    case 'udp':
      protocolText = 'U'
      title = 'UDP'
      break
    case 'http':
      protocolText = 'H'
      title = 'HTTP'
      break
    default:
      break
  }
  return <Tooltip title={title}>
    <span className="protocolBox">{protocolText}</span>
  </Tooltip>
}

class TipSvcDomain extends Component {
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
    const { formatMessage } = this.props.intl
    if (icon === 'https') {
      return (<Tooltip title={formatMessage(AppServiceDetailIntl.HTTPSMode)}><svg className='https' ><use xlinkHref='#https' /></svg></Tooltip>)
    }
    else {
      return null
    }
  }
  render() {
    const { appDomain, svcDomain, type, parentNode } = this.props
    const { formatMessage } = this.props.intl
    const scope = this
    if (svcDomain) {
      if (svcDomain.length == 0) {
        return (
          <span>-</span>
        )
      }
      if (svcDomain.length === 1 || svcDomain.length > 1) {
        let linkURL = 'http://' + svcDomain[0].domain
        return (
          <div className='TipSvcDomain'>
            <Popover placement='right'
              content={
              <SvcTip
              svcDomain={svcDomain}
              serviceMeshflagListInfo={this.props.serviceMeshflagListInfo}
              msaUrl = {this.props.msaUrl}
              formatMessage={formatMessage}/>
              }
              trigger='click'
              onVisibleChange={this.showPop}
              getTooltipContainer={() => document.getElementsByClassName(parentNode)[0]}
              arrowPointAtCenter={true}
              >
              {/*<svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                <use xlinkHref='#more' />
              </svg>*/}
              <span className="checkAddress">查看访问地址</span>
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
        if (appDomain[0].data.length === 1 || appDomain[0].data.length > 1) {
          let linkURL = 'http://' + appDomain[0].data[0].domain
          return (
            <div className={type ? 'TipAppDomain fixTop' : 'TipAppDomain'}>
              {/* <span className='appDomain'>
                {this.getIconHtml()}
                <a target='_blank' href={linkURL}>{appDomain[0].data[0].domain}</a>
              </span> */}
              <Popover placement={type ? 'rightBottom' : 'rightTop'}
                content={
                <AppTip
                scope={scope}
                appDomain={appDomain}
                serviceMeshflagListInfo={this.props.serviceMeshflagListInfo}
                formatMessage={formatMessage}
                msaUrl = {this.props.msaUrl}
                />
                }
                trigger='click'
                onVisibleChange={this.showPop}
                getTooltipContainer={() => document.getElementsByClassName(parentNode)[0]}
                arrowPointAtCenter={true}
                >
                {/*<svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                  <use xlinkHref='#more' />
                </svg>*/}
                <span className="checkAddress">查看访问地址</span>
              </Popover>
            </div>
          )
        }
      } else {
        let currentDomain
        appDomain.every(appDo => {
          if (appDo.data[0]) {
            currentDomain = appDo.data[0].domain
            return false
          }
          return true
        })
        return (
          <div className={type ? 'TipAppDomain fixTop' : 'TipAppDomain'}>
            <Popover placement={type ? 'rightBottom' : 'rightTop'}
              content={
              <AppTip
              scope={scope}
              serviceMeshflagListInfo={this.props.serviceMeshflagListInfo}
              appDomain={appDomain}
              msaUrl = {this.props.msaUrl}
               />
              }
              trigger='click'
              onVisibleChange={this.showPop}
              getTooltipContainer={() => document.getElementsByClassName(parentNode)[0]}
              arrowPointAtCenter={true}
              >
              <span className="checkAddress">查看访问地址</span>
              {/*<svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                <use xlinkHref='#more' />
              </svg>*/}
            </Popover>
          </div>
        )
      }
    }
    return <span>-</span>
  }
}

export default injectIntl(TipSvcDomain, {withRef: true,})

function ServiceMeshInfo({
  serviceMeshinfo = {},
  msaUrl
}){
  return (
    <div className="ServiceMeshInfo">
      <img className="meshIcon"　src={meshIcon} alt=""/>
        {
          serviceMeshinfo.referencedComponent ?
          <span>
            <span>请在</span>
            <a target="_blank"
               href={`${API_URL_PREFIX}/jwt-auth?${toQuerystring({ redirect: encodeURIComponent(`${msaUrl}/service-mesh/component-management/component/detail?name=${serviceMeshinfo.referencedComponent}`) })}`}>
              {`「${serviceMeshinfo.referencedComponent}组件」`}
            </a>
            <span>中查看</span>
          </span> :
          <span>
             <a target="_blank"
        href={`${API_URL_PREFIX}/jwt-auth?${toQuerystring({ redirect: encodeURIComponent(`${ msaUrl}/service-mesh/component-management`) })}`}
        >
        「去绑定组件」</a>
          </span>
        }
    </div>
  )
}