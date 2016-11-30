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
import { Icon, Tabs,  } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../constants'
import $ from 'n-zepto'
import './style/TerminalModal.less'

const TabPane = Tabs.TabPane;

class TerminalModal extends Component {
  constructor(props) {
    super(props);
    this.minWindow = this.minWindow.bind(this);
    this.closeWindow = this.closeWindow.bind(this);
    this.onChangeTabs = this.onChangeTabs.bind(this);
    this.closeTerminal = this.closeTerminal.bind(this);
    this.state = {
      currentShow: null,
      currentTab: null
    }
  }
  
  componentWillMount() {
    //set first tab
    const { config } = this.props;
    let currentTab = config[0].metadata.name + '0';
    this.setState({
      currentTab: currentTab
    });
  }
  
  componentDidMount() {
    let doc = $(document);
    let box = $('#TerminalModal .titleBox');
    let bodyHeight = $(document.body)[0].clientHeight;
    box.mousedown(function(ee){
      if(ee.path[0].className != 'titleBox') {
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
        }
        newHeight = newHeight + 'px !important';
        $('.TerminalLayoutModal').css('height',newHeight);
      })
    })
    doc.mouseup(function(){
      $('#TerminalModal .cover').css('display','none');
      doc.unbind('mousemove')
    });
  }
  
  minWindow(){
    //this function for minx the modal
    $('.TerminalLayoutModal').css('transition', 'all 0.3s');
    $('.TerminalLayoutModal').css('height', '30px !important');
    setTimeout(function(){
      $('.TerminalLayoutModal').css('transition', 'all');
    })
  }
  
  closeWindow(e){
    //this function for close the modal
    e.stopPropagation();
    const { scope } = this.props;
    window.frames[0].postMessage('close', window.location.protocol + '//' +window.location.host)
    scope.setState({
      TerminalLayoutModal: false
    });
  }
  
  componentWillReceiveProps(nextProps) {
    const { config } = nextProps;
    if(config.length > 0) { 
      let currentTab = config[config.length -1].metadata.name + (config.length - 1);
      this.setState({
        currentTab: currentTab
      });
    }
    let terminal = $('.TerminalLayoutModal').css('height'))
//  const nextShow = nextProps.show
//  if(!nextShow) return
//  if(nextShow && nextProps.config.metadata.name === this.props.config.metadata.name && nextProps.config.metadata.namespace === this.props.config.metadata.namespace) {
//    
//  }
  }
  
  onChangeTabs(e) {
    //this function for user change the tab and the iframe focus will be change
    this.setState({
      currentTab: e
    })
    window.frames[e].contentWindow.focusTerminal();
  }
  
  closeTerminal(config, index) {
    //this function for user close the current terminal
    //and we will ask user make sure to close the terminal or not
    const { scope } = this.props;
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
    let frameKey = config.metadata.name + index;
    window.frames[frameKey].contentWindow.closeTerminal();
    if(newList.length == 0) {
      scope.setState({
        TerminalLayoutModal: false
      });
    }
  }
  
  render() {
    const { scope, config } = this.props;
    const _this = this;
    const operaBox = (
      <div className='operaBox'>
        <i className='fa fa-window-minimize' onClick={this.minWindow} />
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
                <iframe id={item.metadata.name + index} 
                  src={`/js/container_terminal.html?host=192.168.1.92&port=6443&namespace=${item.metadata.namespace}&pod=${item.metadata.name}`} />
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
    
  }
}

TerminalModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  
})(injectIntl(TerminalModal, {
  withRef: true,
}));

