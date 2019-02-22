/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CommonStatus component
 *
 * v0.1 - 2016-10-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/CommonStatus.less"
import Ellipsis from '@tenx-ui/ellipsis/lib/index'
import '@tenx-ui/ellipsis/assets/index.css'

const menusText = defineMessages({
  normal: {
    id: 'CommonStatus.normal',
    defaultMessage: '搜索',
  },
  warning: {
    id: 'CommonStatus.warning',
    defaultMessage: '公有',
  },
})

function statusClass(status){
   //this function for show different status class
  switch(status){
    case 'Running':
      return 'Running';
      break;
    case 'Waiting':
      return 'Waiting';
      break;
    case 'Pending':
      return 'Pending';
      break;
    case 'Stopped':
      return 'Stopped';
      break;
    case 'Failed':
      return 'Failed';
      break;
    case 'Initialization':
      return 'Initialization';
      break;
    case 'Terminating':
      return 'Terminating';
      break;
    case 'Abnormal':
      return 'Abnormal';
      break;
    case "Normal":
      return "Normal";
      break;
    case "Warning":
      return "Warning";
      break;
    default:
      break;
  }
}

function statusSpan(status, content, formatMessage){
    //this function for show different status words
    switch(status){
      case 'Running':
        if(!!content){
          return <Ellipsis>{content}</Ellipsis>;
        }else{
          return formatMessage(menusText.normal);
        }
        break;
      case 'Waiting':
        if(!!content){
          return <Ellipsis>{content}</Ellipsis>;
        }else{
          return formatMessage(menusText.normal);
        }
        break;
      case 'Pending':
        if(!!content){
          return <Ellipsis>{content}</Ellipsis>;
        }else{
          return formatMessage(menusText.normal);
        }
        break;
      case 'Stopped':
        if(!!content){
          return <Ellipsis>{content}</Ellipsis>;
        }else{
          return formatMessage(menusText.normal);
        }
        break;
      case 'Failed':
        if(!!content){
          return <Ellipsis>{content}</Ellipsis>;
        }else{
          return formatMessage(menusText.normal);
        }
        break;
      case 'Initialization':
        if(!!content){
          return <Ellipsis>{content}</Ellipsis>;
        }else{
          return formatMessage(menusText.normal);
        }
        break;
      case 'Terminating':
        if(!!content){
          return <Ellipsis>{content}</Ellipsis>;
        }else{
          return formatMessage(menusText.normal);
        }
        break;
      case 'Abnormal':
        if(!!content){
          return <Ellipsis>{content}</Ellipsis>;
        }else{
          return formatMessage(menusText.normal);
        }
        break;
      case "Normal" :
        if(!!content){
          return <Ellipsis>{content}</Ellipsis>
        }else{
          return formatMessage(menusText.normal);
        }
        break;
      case "Warning" :
        if(!!content){
          return <Ellipsis>{content}</Ellipsis>;
        }else{
          return formatMessage(menusText.warning);
        }
        break;
      default :
        break;
    }
  }

class CommonStatus extends Component {
  super(props) {
  }

  render() {
    let { status, circle, content } = this.props;

    return (
      <span id="CommonStatus" key="commonStatus">
        <span className={ statusClass(status) }>
          { circle ? [<i className="fa fa-circle" />] : null }
          { statusSpan(status, content, this.props.formatMessage) }
        </span>
      </span>
    )
  }
}

CommonStatus.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(CommonStatus, {
  withRef: true,
}))
