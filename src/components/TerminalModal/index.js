/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TerminalModal component
 *
 * v0.1 - 2016-10-19
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Icon, Tabs, Modal } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../constants'
import $ from 'jquery'
import './style/TerminalModal.less'

const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;

class TerminalModal extends Component {
  constructor(props) {
    super(props);
    this.minWindow = this.minWindow.bind(this);
    this.closeWindow = this.closeWindow.bind(this);
    this.onChangeTabs = this.onChangeTabs.bind(this);
    this.closeTerminal = this.closeTerminal.bind(this);
    this.state = {
      currentShow: null,
      currentTab: null,
      terminalList: [],
      terminalType: 'normal'
    }
  }
  
  componentWillMount() {
    //set first tab
    let { config } = this.props;
    const scope = this;
    let currentTab = config[0].metadata.name + '0';
    config.map((item) => {
      item.terminalStatus = 'connect'
    })
    this.setState({
      currentTab: currentTab,
      terminalList: config
    });
    window.webTerminalCallBack = function(name, status){
      let { terminalList } = scope.state;
      terminalList.map((item) => {
        if(item.metadata.name == name) {
          item.terminalStatus = status;
        }
      });
      scope.setState({
        terminalList: terminalList
      });
    }
  }
  
  componentDidMount() {
    //bind change modal height event
    let doc = $(document);
    let box = $('#TerminalModal .titleBox');
    let bodyHeight = $(document.body)[0].clientHeight;
    let scope = this;
    box.mousedown(function(ee){
      if(ee.currentTarget.className != 'titleBox') {
        return;
      }
      $('#TerminalModal .cover').css('display','block');
      $(document).mousemove(function(e){
        let newHeight = bodyHeight - e.clientY;
        if(newHeight >= bodyHeight) {
          newHeight = bodyHeight
        }
        if(newHeight <= 35) {
          newHeight = 35;
          this.setState({
            terminalType: 'min'
          });
        }
        $('.TerminalLayoutModal').css('cssText','height:' + newHeight + 'px !important;transition:all !important;');
      })
    })
    doc.mouseup(function(){
      $('#TerminalModal .cover').css('display','none');
      doc.unbind('mousemove')
    });
    //change css
    $('.TerminalLayoutModal').parent().parent().find('.ant-modal-mask').css('display', 'none');
    $('.TerminalLayoutModal').parent().css('box-shadow', ' 0 -1px 4px rgba(0,0,0,0.2)');
    $('.TerminalLayoutModal').parent().css('top','auto');
    $('.TerminalLayoutModal').parent().css('right','initial');
    $('.TerminalLayoutModal').parent().css('height','auto');
  }
  
  minWindow(){
    //this function for minx the modal
    const { terminalType } = this.state;
    if(terminalType == 'normal') {      
      $('.TerminalLayoutModal').css('cssText','height:35px !important;transition:all 0.3s !important;');
      this.setState({
        terminalType: 'min'
      })
    } else {
      $('.TerminalLayoutModal').css('cssText','height:550px !important;transition:all 0.3s !important;');
      this.setState({
        terminalType: 'normal'
      })
    }
  }
  
  closeWindow(e){
    //this function for close the modal
    e.stopPropagation();
    const _this = this;
    confirm({
      title: '关闭终端链接',
      content: `确定要关闭所有终端链接么?`,
      onOk() {      
        const { scope, config } = _this.props;
        config.map((item, index) => {
          let frameKey = item.metadata.name + index;
          if(item.terminalStatus == 'success') {     
            if(!!window.frames[frameKey].contentWindow) {          
              window.frames[frameKey].contentWindow.closeTerminal();
            } else {
              window.frames[frameKey].closeTerminal()
            }
          }
        })
        _this.setState({
          terminalList: []
        })
        scope.setState({
          TerminalLayoutModal: false,
          currentContainer: []
        });
      },
      onCancel() {
        
      },
    });
  }
  
  componentWillReceiveProps(nextProps) {
    const { config } = nextProps;
    const { terminalList } = this.state;
    let newList = []
    config.map((item) => {
      let existFlag = false;
      terminalList.map((oldItem) => {
        if(item.metadata.name == oldItem.metadata.name) {
          item.terminalStatus = oldItem.terminalStatus;
          newList.push(item);
          existFlag = true;
        }
      });
      if(!existFlag) {
        item.terminalStatus = 'connect';
        newList.push(item);
      }
    })
    this.setState({
      terminalList: newList
    })
    if(config.length > 0) { 
      let currentTab = config[config.length -1].metadata.name + (config.length - 1);
      this.setState({
        currentTab: currentTab
      });
    }
    //when the modal is min(35px height), user open an new one the modal will be error
    //so we change the modal height to show the terminal
    let terminal = $('.TerminalLayoutModal').css('height');
    if(terminal == '35px') {
      $('.TerminalLayoutModal').css('transition', 'all 0.3s');
      $('.TerminalLayoutModal').css('height', '550px !important');
      setTimeout(function(){
        $('.TerminalLayoutModal').css('transition', 'all');
      })
    }
  }
  
  onChangeTabs(e) {
    //this function for user change the tab and the iframe focus will be change
    this.setState({
      currentTab: e
    });
    if(!!window.frames[e].contentWindow) {          
      window.frames[e].contentWindow.focusTerminal();
    } else {
      window.frames[e].focusTerminal()
    }    
  }
  
  closeTerminal(config, index) {
    //this function for user close the current terminal
    //and we will ask user make sure to close the terminal or not
    const _this = this;
    confirm({
      title: '关闭终端链接',
      content: `确定要关闭${config.metadata.name}的终端链接么?`,
      onOk() {      
        const { scope } = _this.props;
        const { currentContainer } = scope.state;
        let newList = [];
        currentContainer.map((item) => {
          if(item.metadata.name != config.metadata.name) {
            newList.push(item);
          }
        });
        scope.setState({
          currentContainer: newList
        });
        _this.setState({
          terminalList: newList
        })
        let frameKey = config.metadata.name + index;
        if(config.terminalStatus == 'success') {          
          if(!!window.frames[frameKey].contentWindow) {          
            window.frames[frameKey].contentWindow.closeTerminal();
          } else {
            window.frames[frameKey].closeTerminal()
          }
        }
        if(newList.length == 0) {
          scope.setState({
            TerminalLayoutModal: false
          });
        }
      },
      onCancel() {
        
      },
    });
  }
  
  render() {
    const { scope } = this.props;
    let config = this.state.terminalList;
    const _this = this;
    const operaBox = (
      <div className='operaBox'>
        <svg onClick={this.minWindow} >
          <use xlinkHref={this.state.terminalType == 'normal' ? '#minwindow' : '#maxwindow'} />
        </svg>
        <Icon type='cross' onClick={this.closeWindow} />
      </div>
    )
    let tabsShow = (
      <Tabs
        tabBarExtraContent={operaBox}
        onChange={this.onChangeTabs}
        activeKey={this.state.currentTab}
        size='small'>     
        {
          config.map((item, index) => {
            const titleTab = (
              <div>
                <span>{item.metadata.name}</span>
                <Icon type='cross' onClick={_this.closeTerminal.bind(_this, item, index)}/>
              </div>
            )
            return (
              <TabPane tab={titleTab} key={item.metadata.name + index}>
                <div>
                  {
                    item.terminalStatus == 'connect' ? [
                      <div className='webLoadingBox' key={'webLoadingBox' + index}>
                        <span className='terIcon'></span>
                        <span className='terIcon'></span>
                        <span className='terIcon'></span>
                        <span>终端链接中...</span>
                      </div>
                    ] : null
                  }
                  <iframe id={item.metadata.name + index} key={'iframe' + index}
                    src={`/js/container_terminal.html?namespace=${item.metadata.namespace}&pod=${item.metadata.name}&cluster=${this.props.cluster}`} />
                  {
                    item.terminalStatus == 'timeout' ? [
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
    return (
      <div id='TerminalModal'>
        <div className='titleBox'></div>
        <div className='cover'></div>
        {tabsShow}
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  
  return {
    cluster: state.entities.current.cluster.clusterID
  }
}

TerminalModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  
})(injectIntl(TerminalModal, {
  withRef: true,
}));

