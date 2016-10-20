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
    this.state = {
      
    }
  }
  
  componentWillMount() {
    
  }
  
  changeBoxHeight(e){
    let bodyHeight = $(document.body)[0].clientHeight;
    let newHeight = bodyHeight - e.screenY + 112 + 'px !important';
    $('.TerminalLayoutModal').css('height',newHeight)
  }
  
  changeBoxHeightEnd(e){
    let bodyHeight = $(document.body)[0].clientHeight;
    let newHeight = bodyHeight - e.screenY + 112 + 'px !important';
    $('.TerminalLayoutModal').css('height',newHeight)
  }

  render() {
    const { scope, config } = this.props;
    return (
      <div id='TerminalModal'>
        <div className='titleBox' onDrag={this.changeBoxHeight} onDragEnd={this.changeBoxHeightEnd} draggable='true'>
        aa
        </div>
        <div className='contentBox'>
        bb
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

