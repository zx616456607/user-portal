/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * TerminalModal component
 *
 * v0.1 - 2017-03-27
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Link,browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Icon, Tabs, Button } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../constants'
import { isSafariBrower } from '../../common/tools'
import {
  updateTerminal, removeAllTerminal, changeActiveTerminal,
  removeTerminal,
} from '../../actions/terminal'
import { setTingLogs } from '../../actions/app_manage'
import cloneDeep from 'lodash/cloneDeep'
import Dock from 'react-dock'
import './style/Xterm.less'

const TabPane = Tabs.TabPane
const TERM_TIPS_DISABLED = 'term_tips_disabled'
const DEFAULT_SIZE = 0.6

class TerminalModal extends Component {
  constructor(props) {
    super(props)
    this.updateMinSize = this.updateMinSize.bind(this)
    this.renderTermStatus = this.renderTermStatus.bind(this)
    this.renderTabs = this.renderTabs.bind(this)
    this.getDisableTips = this.getDisableTips.bind(this)
    this.disabledTermTips = this.disabledTermTips.bind(this)
    this.closeTip = this.closeTip.bind(this)
    this.onTabChange = this.onTabChange.bind(this)
    this.closeTerminalItem = this.closeTerminalItem.bind(this)
    this.closeXterm = this.closeXterm.bind(this)
    this.resizeXterm = this.resizeXterm.bind(this)
    this.onDockSizeChange = this.onDockSizeChange.bind(this)
    this.state = {
      disableTips: this.getDisableTips(),
      resize: 'min',
      size: DEFAULT_SIZE,
      minSize: this.getMinHeight(),
      showLogs: false
    }
    this.isSafariBrower = isSafariBrower()
  }

  componentWillMount() {
    window.webTerminalCallBack = (name, status) => {
      const { clusterID, updateTerminal, list } = this.props
      const _list = cloneDeep(list)
      _list && _list.every((item) => {
        if(item.metadata.name == name) {
          item.terminalStatus = status
          if (status === 'exit') {
            this.closeTerminalItem(item)
            return false
          }
          updateTerminal(clusterID, item)
          return false
        }
        return true
      })
    }
    if (location.href.indexOf('/app_manage/container/') >-1) {
      this.setState({showLogs: true})
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateMinSize)
  }

  componentWillReceiveProps(nextProps) {
    const { active } = nextProps
    const list = nextProps.list || []
    const _list = this.props.list || []
    if (list.length > _list.length || active !== this.props.active) {
      this.setState({
        size: DEFAULT_SIZE,
        resize: 'normal',
      })
    }
    if (list.length < _list.length && list.length === 0) {
      this.setState({
        resize: 'min',
      })
    }
    if (location.href.indexOf('/app_manage/container/') >-1) {
      this.setState({showLogs: true})
      return
    }
    this.setState({showLogs: false})
  }

  closeIframeTerm(key) {
    const frame = window.frames[key]
    if (!frame || !frame.contentWindow) {
      return
    }
    frame.contentWindow.closeTerminal()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateMinSize)
  }

  updateMinSize() {
    const state = {
      minSize: this.getMinHeight()
    }
    if (this.state.resize = 'min') {
      state.size = state.minSize
    }
    this.setState(state)
  }

  getDisableTips() {
    if (!window.localStorage) {
      return []
    }
    const { loginUser } = this.props
    const { userName } = loginUser
    let disabledTermTipsNames = window.localStorage.getItem(TERM_TIPS_DISABLED)
    if (disabledTermTipsNames) {
      disabledTermTipsNames = JSON.parse(disabledTermTipsNames)
    } else {
      disabledTermTipsNames = {}
    }
    if (!disabledTermTipsNames[userName]) {
      return []
    }
    return disabledTermTipsNames[userName]
  }

  disabledTermTips(name) {
    const { disableTips } = this.state
    disableTips.push(name)
    this.setState({
      disableTips,
    })
    if (!window.localStorage) {
      return false
    }
    const { loginUser } = this.props
    const { userName } = loginUser
    let disabledTermTipsNames = window.localStorage.getItem(TERM_TIPS_DISABLED)
    if (disabledTermTipsNames) {
      disabledTermTipsNames = JSON.parse(disabledTermTipsNames)
    } else {
      disabledTermTipsNames = {}
    }
    if (!disabledTermTipsNames[userName]) {
      disabledTermTipsNames[userName] = []
    }
    disabledTermTipsNames[userName].push(name)
    window.localStorage.setItem(TERM_TIPS_DISABLED, JSON.stringify(disabledTermTipsNames))
  }

  closeTip(name) {
    const { disableTips } = this.state
    disableTips.push(name)
    this.setState({
      disableTips,
    })
  }

  resizeXterm() {
    const { resize, minSize } = this.state
    this.setState({
      size: (resize === 'normal' ? minSize : DEFAULT_SIZE),
      resize: (resize === 'normal' ? 'min' : 'normal'),
    })
  }

  getMinHeight() {
    const bodyHeigh = window.document.body.offsetHeight
    return 30 / bodyHeigh
  }

  onTabChange(key) {
    const { clusterID, changeActiveTerminal } = this.props
    changeActiveTerminal(clusterID, key)
  }

  closeTerminalItem(item, e) {
    e && e.stopPropagation()
    const { clusterID, removeTerminal, list} = this.props
    const { resize } = this.state
    if (resize === 'min') {
      this.setState({
        resize: 'normal',
        size: DEFAULT_SIZE,
      })
    }
    this.closeIframeTerm(item.metadata.name)
    removeTerminal(clusterID, item)
    if (list.length == 1 && this.state.showLogs) {
      this.props.setTingLogs(null)
      document.getElementsByClassName('bottomBox')[0].style.height = null
    }
  }

  renderTermStatus(terminalStatus, item) {
    const { disableTips } = this.state
    const { name } = item.metadata
    if (this.isSafariBrower) {
      return (
        <div className='webLoadingBox' key={`webLoadingBox-${name}`}>
          <span>暂不支持 Safari 浏览器</span>
        </div>
      )
    }
    if (terminalStatus === 'success') {
      if (!(disableTips.indexOf(name) > -1)) {
        return (
          <div className="tips">
            <Icon type="info-circle-o" /> 由于容器本身无状态且不可变的特性，以防容器销毁后，对容器内部做的改动无法保留，
            <span className="important">建议不要直接修改容器中内容（有状态容器中存储映射出来的目录除外）</span>
            <div className="btns">
              <Button key="back" type="primary" onClick={() => this.closeTip(name)}>知道了</Button>
              <Button key="submit" onClick={() => this.disabledTermTips(name)}>
                不再提醒
              </Button>
            </div>
          </div>
        )
      }
      return
    }
    if (terminalStatus == 'timeout') {
      return (
        <div className='webLoadingBox' key={`webLoadingBox-${name}`}>
          <span>连接超时了</span>
        </div>
      )
    }
    return (
      <div className='webLoadingBox' key={`webLoadingBox-${name}`}>
        <span className='terIcon'></span>
        <span className='terIcon'></span>
        <span className='terIcon'></span>
        <span>终端链接中...</span>
      </div>
    )
  }
  openLogs() {
    if (location.href.indexOf('/app_manage/container/') >-1) {
      // @todo start setting show log in container detail
      browserHistory.push({
        pathname:location.pathname,
        hash: '#logs'
      })
      this.props.setTingLogs('big')
    }

  }
  renderTabs() {
    const { clusterID, active, list } = this.props
    const { disableTips, size, minSize, resize } = this.state
    if (!list || list.length < 1) {
      return
    }
    const operaBox = (
      <div className='operaBox'>
        <svg onClick={this.resizeXterm} >
          <use xlinkHref={resize === 'normal' ? '#minwindow' : '#maxwindow'} />
        </svg>
        <Icon type='cross' onClick={this.closeXterm} />
      </div>
    )
    return (
      <Tabs
        tabBarExtraContent={operaBox}
        onChange={this.onTabChange}
        activeKey={active}
        size='small'>
        {
          list.map((item, index) => {
            const { terminalStatus, metadata } = item
            const { name, namespace } = metadata
            const titleTab = (
              <div>
                <span>{name}</span>
                <span>&nbsp;&nbsp;</span>
                {this.state.showLogs ?
                  <Icon type="file-text" onClick={()=> this.openLogs()} title="查看日志" />
                :null}
                <Icon type='cross' onClick={this.closeTerminalItem.bind(this, item)}/>
              </div>
            )
            return (
              <TabPane tab={titleTab} key={name}>
                <div>
                  {this.renderTermStatus(terminalStatus, item)}
                  <iframe
                    id={name}
                    src={`/js/container_terminal.html?namespace=${namespace}&pod=${name}&cluster=${clusterID}&_=20170602`} />
                </div>
              </TabPane>
            )
          })
        }
      </Tabs>
    )
  }

  closeXterm() {
    const { clusterID, removeAllTerminal, list } = this.props
    list.map(item => this.closeIframeTerm(item.metadata.name))
    removeAllTerminal(clusterID)
    if (this.state.showLogs) {
      this.props.setTingLogs(null)
      document.getElementsByClassName('bottomBox')[0].style.height = null
    }
  }

  onDockSizeChange(size) {
    const { minSize } = this.state
    const state = {
      size,
      resize: 'normal',
    }
    if (size <= minSize) {
      state.size = minSize
      state.resize = 'min'
    } else if (size >= 1) {
      state.size = 1
    }
    if (this.props.containerLogs.logSize == 'big') {
      // 设置 分层显示log 和控制台
      setTimeout(()=>this.props.setTingLogs('big'),200)
    }
    this.setState(state)
  }

  render() {
    const { list } = this.props
    const { size } = this.state
    const visible = (list && list.length > 0)
    return (
      <Dock position='bottom'
        isVisible={visible}
        dimMode="none"
        fluid={true}
        size={size}
        onSizeChange={ this.onDockSizeChange }>
        <div id='TerminalModal'>
          {this.renderTabs()}
        </div>
      </Dock>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities, terminal } = state
  const { current, loginUser } = entities
  let clusterID = current.cluster.clusterID
  const { list, active } = terminal
  if (active.cluster) {
    clusterID = active.cluster
  }
  return {
    clusterID,
    loginUser: loginUser.info,
    active: active[clusterID],
    list: list[clusterID],
    containerLogs: state.containers.containerLogs,
  }
}

TerminalModal.propTypes = {
  //
}

export default connect(mapStateToProps, {
  updateTerminal,
  removeAllTerminal,
  changeActiveTerminal,
  removeTerminal,
  setTingLogs,
})(injectIntl(TerminalModal, {
  withRef: true,
}))
