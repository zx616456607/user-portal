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
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../constants'
import $ from 'n-zepto'
import './style/TerminalModal.less'

class TerminalModal extends Component {
  constructor(props) {
    super(props);
    this.changeBoxHeight = this.changeBoxHeight.bind(this);
    this.changeBoxHeightEnd = this.changeBoxHeightEnd.bind(this);
    this.minWindow = this.minWindow.bind(this);
    this.closeWindow = this.closeWindow.bind(this);
    this.state = {
    
    }
  }
  
  componentWillMount() {
    
  }
  
  changeBoxHeight(e){
    //this function for user dragging the title and change the modal height
    let bodyHeight = $(document.body)[0].clientHeight;
    let newHeight = bodyHeight - e.screenY + 112;
    if(newHeight >= bodyHeight){
      newHeight = bodyHeight;
    }
    newHeight = newHeight + 'px !important';
    $('.TerminalLayoutModal').css('height',newHeight);
  }
  
  changeBoxHeightEnd(e){
    //this function for user drag end the title and change the modal height
    let bodyHeight = $(document.body)[0].clientHeight;
    let newHeight = bodyHeight - e.screenY + 112;
    if(newHeight >= bodyHeight){
      newHeight = bodyHeight;
    }
    newHeight = newHeight + 'px !important';
    $('.TerminalLayoutModal').css('height',newHeight);
  }
  
  minWindow(){
    //this function for minx the modal
    $('.TerminalLayoutModal').css('height','30px !important');
  }
  
  closeWindow(){
    //this function for close the modal
    const { scope } = this.props;
    scope.setState({
      TerminalLayoutModal: false
    });
  }

  render() {
    const { scope, config } = this.props;
    return (
      <div id='TerminalModal'>
        <div className='titleBox' onDrag={this.changeBoxHeight} onDragEnd={this.changeBoxHeightEnd} draggable='true'>
        {config.metadata.name}
          <i className='fa fa-minus' onClick={this.minWindow} />
          <i className='fa fa-times ' onClick={this.closeWindow} />
        </div>
        <div className='contentBox'>
          <iframe src={`/js/container_terminal.html?host=192.168.1.92&port=8080&namespace=${config.metadata.namespace}&pod=${config.metadata.name}`} width="1270" height="450" />
        </div>
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

