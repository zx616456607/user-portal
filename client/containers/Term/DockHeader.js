/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Term header container
 *
 * @author Songsz
 * @date 2018-12-18
 *
*/

import React from 'react'
import classnames from 'classnames'
import { Button, Icon, Tooltip } from 'antd'
import { DOCK_DEFAULT_HEADER_SIZE, DOCK_DEFAULT_SIZE } from './index'
import intlMsg from './Intl'
import { injectIntl, FormattedMessage } from 'react-intl'
import { browserHistory } from 'react-router'

const TERM_TIPS_DISABLED = 'term_tips_disabled'

class DockHeader extends React.PureComponent {
  toggleShowLog = async record => {
    if (/^\/app_manage\/container\/[\-\w]+/.test(location.pathname)) {
      browserHistory.push({
        pathname: location.pathname,
        hash: '#logs',
      })
    }
    await this.props.setPropsState({
      logShow: {},
    })
    this.props.setPropsState({
      logShow: record,
    })
  }
  onSizeChange = dockSize =>
    dockSize >= DOCK_DEFAULT_HEADER_SIZE && this.props.setPropsState({ dockSize })
  onCloseDock = () => {
    this.props.setPropsState({
      tipHasKnow: false,
      termMsg: {},
    })
    this.props.removeAllTerminal(this.props.clusterID)
  }
  onNeverRemindClick = () => {
    const { userName } = this.props
    const noTipList = JSON.parse(window.localStorage.getItem(TERM_TIPS_DISABLED) || '{}')
    noTipList[userName] = true
    window.localStorage.setItem(TERM_TIPS_DISABLED, JSON.stringify(noTipList))
    this.props.setPropsState({ tipHasKnow: true })
  }
  renderWarning = () => {
    const { userName } = this.props
    const { tipHasKnow } = this.props
    const noTipList = JSON.parse(window.localStorage.getItem(TERM_TIPS_DISABLED) || '{}')
    if (noTipList[userName] || tipHasKnow) return null
    return (
      <span className="warningTip">
        <span>
          <Icon type="info-circle-o" />
          <span><FormattedMessage {...intlMsg.containerStateless}/></span>
          <span className="notModify"><FormattedMessage {...intlMsg.suggestNotEditContainer}/></span>
        </span>
        <span>
          <Button
            onClick={() => this.props.setPropsState({ tipHasKnow: true })}
            className="hasKnow"
            size="small"
            type="primary"><FormattedMessage {...intlMsg.iKnow}/></Button>
          <Button onClick={this.onNeverRemindClick} size="small"><FormattedMessage {...intlMsg.neverMind}/></Button>
        </span>
      </span>
    )
  }
  renderMsg = () => {
    const { termMsg, selectTerm: { key } } = this.props
    if (!termMsg[key] && termMsg[key] !== '') {
      return (
        <span className="termMsg">
          <div className="webLoadingBox">
            <span className="terIcon" key="point1"/>
            <span className="terIcon" key="point2"/>
            <span className="terIcon" key="point3"/>
            <span>{this.props.consts.isConnecting}</span>
          </div>
        </span>
      )
    }
    if (termMsg[key] && termMsg[key].length > 0) {
      return (
        <span className="termMsg">
          <div className="webLoadingBox">
            {
              termMsg[key] === this.props.consts.isConnecting &&
              [
                <span className="terIcon" key="point1"/>,
                <span className="terIcon" key="point2"/>,
                <span className="terIcon" key="point3"/>,
              ]
            }
            <span>{termMsg[key]}</span>
          </div>
        </span>
      )
    }
    return null
  }
  renderHeaderNames = () => this.props.termData.map(t => (
    <div
      key={t.key}
      className={classnames({
        oneTermName: true,
        oneTermSelect: t.key === this.props.selectTerm.key,
      })}
    >
      <Tooltip title={t.name}>
        <div className="name" onClick={() => this.props.changeActiveTerminal(t.clusterID, t.name)}>
          { t.name }
        </div>
      </Tooltip>
      <Button icon="file-text" onClick={() => this.toggleShowLog(t)} size="small" type="primary">
        <FormattedMessage {...intlMsg.log}/>
      </Button>
      <Button
        icon="cross"
        type="dashed"
        size="small"
        className="close"
        onClick={() => this.props.removeTerminal(t.clusterID, t)}
      />
    </div>
  ))
  render() {
    const { dockSize } = this.props
    return (
      <div className={'header'}>
        <div className="headerStatic">
          <div className="left">
            { this.renderHeaderNames() }
          </div>
          <span className="right">
            {
              dockSize > DOCK_DEFAULT_HEADER_SIZE + 8 &&
              <Icon type="minus" className="icon" onClick={() => this.onSizeChange(DOCK_DEFAULT_HEADER_SIZE)}/>
            }
            {
              dockSize <= DOCK_DEFAULT_HEADER_SIZE + 8 &&
              <svg onClick={() => this.onSizeChange(DOCK_DEFAULT_SIZE)} className="maxWindow">
                <use xlinkHref={'#maxwindow'} />
              </svg>
            }
            <Icon type="cross" className="icon" onClick={this.onCloseDock}/>
          </span>
        </div>
        { this.renderWarning() }
        { this.renderMsg() }
      </div>
    )
  }
}

export default injectIntl(DockHeader, {
  withRef: true,
})
