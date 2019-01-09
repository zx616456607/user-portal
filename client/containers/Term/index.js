/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * vm Term&Log Container
 *
 * @author Songsz
 * @date 2018-12-11
 *
*/

import React from 'react'
import './style/index.less'
import Dock from 'react-dock'
import { connect } from 'react-redux'
import Log from './Log'
import Xterm from './Xterm'
import { removeAllTerminal, removeTerminal, changeActiveTerminal } from '../../../src/actions/terminal'
import { getDeepValue } from '../../util/util'
import { getExploreName } from './funcs'
import Header from './DockHeader'
import { injectIntl } from 'react-intl'
import intlMsg from '../../../src/components/TerminalModal/Intl'
import queryString from 'query-string'

export const DOCK_DEFAULT_SIZE = 370
export const DOCK_DEFAULT_HEADER_SIZE = 37

class TerminalNLog extends React.PureComponent {
  consts = {
    isConnecting: this.props.intl.formatMessage(intlMsg.termConnecting),
    timeout: this.props.intl.formatMessage(intlMsg.connectTimeout),
    connectStop: this.props.intl.formatMessage(intlMsg.connectClose),
  }
  state = {
    dockSize: DOCK_DEFAULT_SIZE,
    termMsg: {},
    tipHasKnow: false,
    logShow: {},
  }
  onSizeChange = dockSize => {
    if (dockSize < DOCK_DEFAULT_HEADER_SIZE) return
    this.setState({ dockSize })
  }
  componentWillUnmount() { // [KK-1667]
    this.props.removeAllTerminal(this.props.clusterID)
  }
  renderTerms = (cols, rows) => this.props.termData.map(t => {
    const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:'
    const query = queryString.stringify({ container: t.container, cols, rows })
    const termUrl = `${protocol}//${window.location.host}/api/v1/cluster/${t.clusterID}/namespaces/${t.namespace}/pods/${t.name}/exec?${query}`
    return (
      <div
        key={t.key}
        style={{ display: this.props.selectTerm.key === t.key ? 'block' : 'none' }}>
        <Xterm
          url={termUrl}
          consts={this.consts}
          setTermMsg={termMsg => this.setState({
            termMsg: {
              ...this.state.termMsg,
              [t.key]: termMsg,
            },
          })}
          cols={cols}
          rows={rows}
          removeTerminal={this.props.removeTerminal}
          data={t}
        />
      </div>
    )
  })
  render() {
    const browserRate = getExploreName() === 'Firefox' ? 0.068 : 0.073
    const rows = parseInt((this.state.dockSize - DOCK_DEFAULT_HEADER_SIZE - 24) * browserRate)
    const cols = parseInt((document.body.clientWidth - 26) / 6.95)
    const { dockSize, logShow } = this.state
    const { termData } = this.props
    return (
      <div>
        <div className="TerminalNLog">
          {
            !!logShow.key &&
            <Log
              height={document.documentElement.clientHeight - dockSize}
              setPropsState={data => this.setState(data)}
              logShow={logShow}
            />
          }
          {
            termData.length > 0 &&
            <Dock
              fluid={false}
              size={dockSize}
              isVisible={true}
              position="bottom"
              dimMode="none"
              onSizeChange={this.onSizeChange}
            >
              <div className="container">
                <Header
                  {...this.props}
                  {...this.state}
                  consts={this.consts}
                  onSizeChange={this.onSizeChange}
                  setPropsState={data => this.setState(data)}
                  logShow={logShow}
                />
                <div className="placeholderHeader"/>
                {
                  this.renderTerms(cols, rows)
                }
              </div>
            </Dock>
          }
        </div>
        {/* Terminal's height === this div's height. avoid Terminal coverage the page's content */}
        {
          termData.length > 0 &&
          <div style={{ width: '100vw', height: dockSize }}/>
        }
      </div>
    )
  }
}

const mapState = ({ terminal: { list, active }, entities }) => {

  return ({
    userName: getDeepValue(entities, 'loginUser.info.userName'.split('.')),
    clusterID: getDeepValue(entities, 'current.cluster.clusterID'.split('.')),
    termData: Object.keys(list || {})
      .filter(k => list[k] && list[k].length > 0)
      .map(k => list[k].map(item => ({
        ...item,
        clusterID: k,
        key: k + item.metadata.name,
        namespace: item.metadata.namespace,
        name: item.metadata.name,
        container: getDeepValue(item, 'spec.containers.0.name'.split('.')),
      })))
      .reduce((res, item) => res.concat(item), []),
    selectTerm: Object.keys(active || {}).length <= 0 ? null : {
      name: active[Object.keys(active)[0]],
      clusterID: Object.keys(active)[0],
      key: Object.keys(active)[0] + active[Object.keys(active)[0]],
    },
  })
}

export default connect(mapState, {
  removeTerminal,
  removeAllTerminal,
  changeActiveTerminal,
})(injectIntl(TerminalNLog, {
  withRef: true,
}))
