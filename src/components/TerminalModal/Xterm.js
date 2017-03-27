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
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Icon, Tabs, Modal, Button } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../constants'
import { updateTerminal } from '../../actions/terminal'
import $ from 'jquery'
import cloneDeep from 'lodash/cloneDeep'
import './style/Xterm.less'

const TabPane = Tabs.TabPane
const TERM_TIPS_DISABLED = 'term_tips_disabled'

class TerminalModal extends Component {
  constructor(props) {
    super(props)
    this.renderTabs = this.renderTabs.bind(this)
    this.getTermTipsStatus = this.getTermTipsStatus.bind(this)
    this.disabledTermTips = this.disabledTermTips.bind(this)
    this.closeTip = this.closeTip.bind(this)
    this.onTabChange = this.onTabChange.bind(this)
    this.closeTerminal = this.closeTerminal.bind(this)
    this.state = {
      tipsVisible: true,
    }
  }

  componentWillMount() {
    window.webTerminalCallBack = (name, status) => {
      const { clusterID, updateTerminal, list } = this.props
      const _list = cloneDeep(list)
      _list && _list.every((item) => {
        if(item.metadata.name == name) {
          item.terminalStatus = status
          updateTerminal(clusterID, item)
          return false
        }
        return true
      })
    }
  }

  componentDidMount() {
    //bind change modal height event
    let doc = $(document)
    let box = $('#TerminalModal .titleBox')
    let bodyHeight = $(document.body)[0].clientHeight
    let scope = this
    box.mousedown(function(ee){
      if(ee.currentTarget.className != 'titleBox') {
        return
      }
      $('#TerminalModal .cover').css('display','block')
      $(document).mousemove(function(e){
        let newHeight = bodyHeight - e.clientY
        if(newHeight >= bodyHeight) {
          newHeight = bodyHeight
        }
        if(newHeight <= 35) {
          newHeight = 35
          this.setState({
            terminalType: 'min'
          })
        }
        $('.TerminalLayoutModal').css('cssText','height:' + newHeight + 'px !importanttransition:all !important')
      })
    })
    doc.mouseup(function(){
      $('#TerminalModal .cover').css('display','none')
      doc.unbind('mousemove')
    })
    //change css
    $('.TerminalLayoutModal').parent().parent().find('.ant-modal-mask').css('display', 'none')
    $('.TerminalLayoutModal').parent().css('box-shadow', ' 0 -1px 4px rgba(0,0,0,0.2)')
    $('.TerminalLayoutModal').parent().css('top','auto')
    $('.TerminalLayoutModal').parent().css('right','initial')
    $('.TerminalLayoutModal').parent().css('height','auto')
  }

  onChangeTabs(e) {
    //this function for user change the tab and the iframe focus will be change
    this.setState({
      currentTab: e
    })
    let frame = window.frames[e]
    if (!frame) {
      return
    }
    if(!!frame.contentWindow) {
      frame.contentWindow.focusTerminal()
    } else {
      frame.focusTerminal()
    }
  }

  getTermTipsStatus() {
    if (!window.localStorage) {
      return false
    }
    const { loginUser } = this.props
    const disabledTermTipsNames = window.localStorage.getItem(TERM_TIPS_DISABLED)
    if (disabledTermTipsNames.indexOf(loginUser.userName)) {
      return true
    }
    return false
  }

  disabledTermTips() {
    this.setState({
      tipsVisible: false,
    })
    if (!window.localStorage) {
      return false
    }
    const { loginUser } = this.props
    let disabledTermTipsNames = window.localStorage.getItem(TERM_TIPS_DISABLED)
    if (disabledTermTipsNames) {
      disabledTermTipsNames = disabledTermTipsNames.split(',')
    } else {
      disabledTermTipsNames = []
    }
    disabledTermTipsNames.push(loginUser.userName)
    window.localStorage.setItem(TERM_TIPS_DISABLED, disabledTermTipsNames.join(','))
  }

  closeTip() {
    this.setState({
      tipsVisible: false
    })
  }

  onTabChange() {
    //
  }

  closeTerminal() {
    //
  }

  renderTabs() {
    const { clusterID, active, list, closeTerminalModal } = this.props
    const { tipsVisible } = this.state
    if (!list || list.length < 1) {
      return
    }
    console.log(list)
    console.log(list)
    console.log(list)
    const operaBox = (
      <div className='operaBox'>
        <svg onClick={this.minWindow} >
          <use xlinkHref={this.state.terminalType == 'normal' ? '#minwindow' : '#maxwindow'} />
        </svg>
        <Icon type='cross' onClick={closeTerminalModal} />
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
                <Icon type='cross' onClick={() => this.closeTerminal(item)}/>
              </div>
            )
            return (
              <TabPane tab={titleTab} key={name}>
                <div>
                  {
                    (terminalStatus === 'success' && tipsVisible) &&
                    <div className="tips">
                      <Icon type="info-circle-o" /> 由于容器本身无状态且不可变的特性，以防容器销毁后，对容器内部做的改动无法保留，
                      <span className="important">建议不要直接修改容器中内容（有状态容器中存储映射出来的目录除外）</span>
                      <div className="btns">
                        <Button key="back" type="primary" onClick={this.closeTip}>知道了</Button>
                        <Button key="submit" onClick={this.disabledTermTips}>
                          不再提醒
                        </Button>
                      </div>
                    </div>
                  }
                  {
                    terminalStatus == 'connect' ? [
                      <div className='webLoadingBox' key={'webLoadingBox' + index}>
                        <span className='terIcon'></span>
                        <span className='terIcon'></span>
                        <span className='terIcon'></span>
                        <span>终端链接中...</span>
                      </div>
                    ] : null
                  }
                  <iframe
                    id={name}
                    key={'iframe' + index}
                    src={`/js/container_terminal.html?namespace=${namespace}&pod=${name}&cluster=${clusterID}&_=20170327`} />
                  {
                    terminalStatus == 'timeout' ? [
                      <div className='webLoadingBox' key={'webLoadingBox' + index}>
                        <span>连接超时了</span>
                      </div>
                    ] : null
                  }
                </div>
              </TabPane>
            )
          })
        }
      </Tabs>
    )
  }

  render() {
    const { visible, closeTerminalModal } = this.props
    return (
      <Modal
        visible={visible}
        className='TerminalLayoutModal'
        transitionName='move-down'
        onCancel={closeTerminalModal}
        maskClosable={false}
        >
        <div id='TerminalModal'>
          <div className='titleBox'></div>
          <div className='cover'></div>
          {this.renderTabs()}
        </div>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities, terminal } = state
  const { current, loginUser } = entities
  const clusterID = current.cluster.clusterID
  const { list, active } = terminal
  return {
    clusterID,
    loginUser: loginUser.info,
    active: active[clusterID],
    list: list[clusterID],
  }
}

TerminalModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  closeTerminalModal: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, {
  updateTerminal,
})(injectIntl(TerminalModal, {
  withRef: true,
}))
