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
    let item = svcDomain.map((item, index) => {
      if (item.indexOf('http://') !== -1 || item.indexOf('https://') !== -1) {
        return (
          <li key={item}>
            <a href={item} target="_blank">{item}</a>
          </li>
        )
      } else {
        return (
          <li key={item}>
            {item}
          </li>
        )
      }
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
  }
  render() {
    const { appDomain } = this.props
    let urlData = []
    let item = appDomain.map((item, index) => {
      urlData = item.data
      if (item.data.length === 0) {
        return (
          <div>
            <span>-</span>
          </div>
        )
      }
      if (item.data.length === 1) {
        return (
          <div>
            <Row className="firstSvc">
              <Col style={{ display: 'inline-block', color: '#49b1e2' }}>{item.name}</Col>
            </Row>
            <Timeline>
              <Timeline.Item dot={<div style={{ height: 5, width: 5, backgroundColor: '#2db7f5', margin: '0 auto' }}></div>}></Timeline.Item>
              <Timeline.Item dot={<div></div>}>
                <svg className="branchSvg"><use xlinkHref="#branch" /></svg>
                {
                  (item.data[0].indexOf('http://') === -1 || item.data[0].indexOf('https://') === -1) ?
                    item.data[0] :
                    <a href={item.data[0]} target="_blank">{item.data[0]}</a>
                }
                <svg className="tipCopySvg"><use xlinkHref="#tipcopy" /></svg>
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
            <Row className="firstSvc">
              <Col style={{ display: 'inline-block', color: '#49b1e2' }}>{item.name}</Col>
            </Row>
            <Timeline>
                {
                  list.map((url, index) => {
                    if (index === 0) {
                      return (
                          <Timeline.Item dot={<div style={{ height: 5, width: 5, backgroundColor: '#2db7f5', margin: '0 auto' }}></div>}></Timeline.Item>
                      )
                    }
                    if (url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1) {
                      console.log('url',url);
                      return (
                        <Timeline.Item dot={<div></div>}>
                          <svg className="branchSvg"><use xlinkHref="#branch" /></svg>
                          <a href={url} target="_blank">{url}</a>
                          <svg className="tipCopySvg"><use xlinkHref="#tipcopy" /></svg>
                        </Timeline.Item>
                      )
                    }
                    return (
                      <Timeline.Item dot={<div></div>}>
                        <svg className="branchSvg"><use xlinkHref="#branch" /></svg>
                        {url}
                        <svg className="tipCopySvg"><use xlinkHref="#tipcopy" /></svg>
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
      </div>
    )
  }
}
export default class TipSvcDomain extends Component {
  constructor(props) {
    super(props)
    this.showPop = this.showPop.bind(this)
    this.state = {
      show: false
    }
  }
  showPop() {
    const {show} = this.state
    this.setState({
      show: !show
    })
  }
  render() {
    const { appDomain, svcDomain, type } = this.props
    if (svcDomain) {
      if (svcDomain.length == 0) {
        return (
          <span>-</span>
        )
      } else if (svcDomain.length == 1) {
        if (svcDomain[0].indexOf('http://') === -1 || svcDomain[0].indexOf('https://') === -1) {
          return (
            <div id='TipSvcDomain'>
              {svcDomain[0]}
            </div>
          )
        } else {
          return (
            <div id='TipSvcDomain'>
              <a target="_blank" href={svcDomain[0]}>{svcDomain[0]}</a>
            </div>
          )
        }
      }
      /*if (svcDomain.length == 2) {
        let item = svcDomain.map((item, index) => {
          if (item.indexOf('http://') !== -1 || item.indexOf('https://') !== -1) {
            return (
              <a target="_blank" href={item} style={{ display: 'block', height: 30, lineHeight: '40px' }}>{item}</a>
            )
          } else {
            return (
              <span style={{ display: 'block', height: 30, lineHeight: '40px' }}>{item}</span>
            )
          }
        })
        return (
          <Row id='TipSvcDomain'>
            {item}
          </Row>
        )
      }*/
      if (svcDomain.length > 1) {
        return (
          <div className='TipSvcDomain'>
            <span>
              {
                (svcDomain[0].indexOf('http://') !== -1 || svcDomain[0].indexOf('https://') !== -1) ?
                  <a target="_blank" href={svcDomain[0]}>{svcDomain[0]}</a> :
                  svcDomain[0]
              }
            </span>
            <Popover placement="right"
              content={<SvcTip svcDomain={svcDomain} />}
              trigger="click"
              onVisibleChange={this.showPop}
              getTooltipContainer={() => document.getElementsByClassName('TipSvcDomain')[0]}
              >
              <svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                <use xlinkHref="#more" />
              </svg>
            </Popover>
          </div>
        )
      }
    }
    if (appDomain) {
      if (appDomain.length === 0) {
        return (
          <div id="TipAppDomain">
            <span>-</span>
          </div>
        )
      } else if (appDomain.length === 1) {
        if (appDomain[0].data[0].indexOf('http://') === -1 || appDomain[0].data[0].indexOf('https://') === -1) {
          // console.log('appDomain data length',appDomain[0].data[0].indexOf('http://') === -1);
          return (
            <span>{appDomain[0].data[0]}</span>
          )
        } else {
          return (
            <a target="_blank" href={appDomain[0].data[0]}>{appDomain[0].data[0]}</a>
          )
        }
      } else {
        return (
          <div className={type ? 'TipAppDomain fixTop' : 'TipAppDomain'}>
            {
              (appDomain[0].data[0].indexOf('http://') !== -1 || appDomain[0].data[0].indexOf('https://') !== -1) ?
                <a target="_blank" href={appDomain[0].data[0]}>{appDomain[0].data[0]}</a> :
                appDomain[0].data[0]
            }
            <Popover placement={type ? 'rightBottom' : 'rightTop'}
              content={<AppTip appDomain={appDomain} />}
              trigger="click"
              onVisibleChange={this.showPop}
              getTooltipContainer={() => document.getElementsByClassName('more')[0]}
              arrowPointAtCenter={true}
              >
              <svg className={this.state.show ? 'more showPop' : 'more'} onClick={this.showPop}>
                <use xlinkHref="#more" />
              </svg>
            </Popover>
          </div>
        )
      }
    }
  }
}