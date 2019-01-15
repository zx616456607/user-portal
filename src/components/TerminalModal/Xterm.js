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
import { Icon, Tabs, Button,Modal } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../constants'
import { isSafariBrower, toQuerystring } from '../../common/tools'
import {
  updateTerminal, removeAllTerminal, changeActiveTerminal,
  removeTerminal,
} from '../../actions/terminal'
import { loadContainerDetailEvents, setTingLogs } from '../../actions/app_manage'
import { throwError } from '../../actions'
import cloneDeep from 'lodash/cloneDeep'
import Dock from 'react-dock'
import Logs from '../ContainerModule/ContainerLogs'
import './style/Xterm.less'
import intlMsg from './Intl'

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
    window.webTerminalCallBack = (name, status, error) => {
      const { clusterID, updateTerminal, list, throwError } = this.props
      const _list = cloneDeep(list)
      _list && _list.every((item) => {
        if(item.metadata.name == name) {
          if (status === '[403 resource permission error]') {
            this.closeTerminalItem(item)
            throwError(error)
            return
          }
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
    let minSize = this.getMinHeight()
    minSize = Math.ceil(minSize * 100000) / 100000
    if (this.state.minSize === minSize) {
      return
    }
    const state = {
      minSize
    }
    if (this.state.resize === 'min') {
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
    const url =  new RegExp('/app_manage/container/[a-zA-Z0-9-_]+')
    if (url.test(location.pathname) && location.hash == '#logs') {
      browserHistory.push(`/app_manage/container/${key}#logs`)
      this.props.loadContainerDetailEvents(clusterID, key)
      return
    }
    // tab 切换时先卸载日志组件
    this.setState({logModal: false, containerName:false})
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
    if (list.length == 1 && document.getElementsByClassName('bottomBox')[0]) {
      this.props.setTingLogs(null)
      document.getElementsByClassName('bottomBox')[0].style.height = null
    }
  }

  renderTermStatus(terminalStatus, item) {
    const { disableTips } = this.state
    const { name, labels } = item.metadata
    const serviceName = labels && labels.name || name.split('-')[0]
    if (this.isSafariBrower) {
      return (
        <div className='webLoadingBox' key={`webLoadingBox-${name}`}>
          <span><FormattedMessage {...intlMsg.notSupportSafari}/></span>
        </div>
      )
    }
    if (terminalStatus === 'success') {
      if (!(disableTips.indexOf(serviceName) > -1)) {
        return (
          <div className="tips">
            <Icon type="info-circle-o" /> <FormattedMessage {...intlMsg.containerStateless}/>
            <span className="important"><FormattedMessage {...intlMsg.suggestNotEditContainer}/></span>
            <div className="btns">
              <Button key="back" type="primary" onClick={() => this.closeTip(serviceName)}><FormattedMessage {...intlMsg.iKnow}/></Button>
              <Button key="submit" onClick={() => this.disabledTermTips(serviceName)}>
                <FormattedMessage {...intlMsg.neverMind}/>
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
          <span><FormattedMessage {...intlMsg.connectTimeout}/></span>
        </div>
      )
    }
    if (terminalStatus === 'close') {
      return (
        <div className='webLoadingBox' key={`webLoadingBox-${name}`}>
          <span><FormattedMessage {...intlMsg.connectClose}/></span>
        </div>
      )
    }
    return (
      <div className='webLoadingBox' key={`webLoadingBox-${name}`}>
        <span className='terIcon'></span>
        <span className='terIcon'></span>
        <span className='terIcon'></span>
        <span><FormattedMessage {...intlMsg.termConnecting}/></span>
      </div>
    )
  }
  openLogs(item) {
    const { logModal } = this.state
    if (location.href.indexOf('/app_manage/container/') >-1) {
      // @todo start setting show log in container detail
      if (this.props.containerLogs.logSize === 'big') {
        this.props.setTingLogs('normal')
        return
      }
      browserHistory.push({
        pathname:`/app_manage/container/${item.metadata.name}`,
        hash: '#logs'
      })
      this.props.setTingLogs('big')
      return
    }
    if (logModal && this.state.containerName === item.metadata.name) {
      this.setState({logModal:!logModal})
      return
    }
    // http://jira.tenxcloud.com/browse/EV-607
    // tab 切换时先卸载日志组件，然后再挂载，这样可以保证日志正确的加载
    // 挂载日志组件需要在卸载日志组件之后，所以这里给了 50 毫秒的延迟
    setTimeout(() => {
      this.setState({logModal: true,containerName: item.metadata.name})
    }, 50)
    this.props.setTingLogs('big')
    let bottomBox = document.getElementsByClassName('bottomBox')[0]
    bottomBox && setTimeout(()=> {
      bottomBox.style.height = document.body.clientHeight - document.getElementById('TerminalModal').clientHeight + 'px'
    },200)
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
          {/*@#line rectangle*/}
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
            const { containers } = item.spec || {}
            const container = containers && containers[0] && containers[0].name
            const titleTab = (
              <div className="action-header">
                <span className="service-name">{name}</span>
                {
                  location.pathname !== '/cluster' &&
                  <Button icon="file-text" type="primary" onClick={()=> this.openLogs(item)} ><FormattedMessage {...intlMsg.log}/></Button>
                }
                <span>&nbsp;&nbsp;</span>
                <Button icon='cross' type="ghost" className="closeBtn" onClick={()=> this.closeTerminalItem(item)}></Button>
              </div>
            )
            const query = {
              namespace,
              pod: name,
              cluster: clusterID,
              container,
              '_': '20180928', // for clear cache
            }
            return (
              <TabPane tab={titleTab} key={name}>
                <div>
                  {this.renderTermStatus(terminalStatus, item)}
                  <iframe
                    allowFullScreen
                    id={name}
                    src={`/js/container_terminal.html?${toQuerystring(query)}`} />
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
    if (document.getElementsByClassName('bottomBox')[0]) {
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
      let bottomBox = document.getElementsByClassName('bottomBox')[0]
      bottomBox && setTimeout(()=> {
        this.props.setTingLogs('big')
        bottomBox.style.height = document.body.clientHeight - document.getElementById('TerminalModal').clientHeight + 'px'
      },500)
    }
    this.setState(state)
  }
  closeModal = () => {
    this.setState({logModal: false,containerName:false})
  }
  render() {
    const { list,clusterID } = this.props
    const { size,containerName } = this.state
    const visible = (list && list.length > 0)
    const func = {
      closeModal: this.closeModal
    }
    return (
      <Dock position='bottom'
        isVisible={visible}
        dimMode="none"
        fluid={true}
        size={size}
        onSizeChange={ this.onDockSizeChange }>
        <div id='TerminalModal'>
          {this.renderTabs()}
          <Modal className="logModal" maskClosable={false} closable={false} title={null} footer={null} visible={this.state.logModal}
          >
            {containerName ?
            <Logs visible={this.state.logModal} func={func} cluster={clusterID} containerName={containerName}/>
            :null
            }
          </Modal>
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
  loadContainerDetailEvents,
  throwError,
})(injectIntl(TerminalModal, {
  withRef: true,
}))
