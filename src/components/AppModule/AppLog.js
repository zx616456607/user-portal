/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppLog component
 *
 * v0.1 - 2016-09-11
 * @author GaoJian
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import "./style/AppLog.less"
import { appLogs } from '../../actions/app_manage'
import { FormattedMessage } from 'react-intl'
import intlMsg from './AppDetailIntl'

function formatOperation(opera) {
  //this function for format opera
  switch(opera) {
    case 'create app':
      return (<span><FormattedMessage {...intlMsg.createApp}/></span>)
      break;
    case 'modify app':
      return (<span><FormattedMessage {...intlMsg.editApp}/></span>)
      break;
    case 'add service':
      return (<span><FormattedMessage {...intlMsg.createServer}/></span>)
      break;
    case 'delete service':
      return (<span><FormattedMessage {...intlMsg.deleteServer}/></span>)
      break;
    case 'stop app':
      return (<span><FormattedMessage {...intlMsg.stopApp}/></span>)
      break;
    case 'start app':
      return (<span><FormattedMessage {...intlMsg.startApp}/></span>)
      break;
    case 'restart app':
      return (<span><FormattedMessage {...intlMsg.rebootApp}/></span>)
      break;
    case 'delete app':
      return (<span><FormattedMessage {...intlMsg.deleteApp}/></span>)
      break;
    case 'redeploy service':
      return (<span><FormattedMessage {...intlMsg.reDeployServer}/></span>)
    case 'stop service':
      return (<span><FormattedMessage {...intlMsg.stopServer}/></span>)
    case 'start service':
      return (<span><FormattedMessage {...intlMsg.startServer}/></span>)
  }
}

function formatResult(result) {
  //this function for format result
  switch(result) {
    case 'success':
      return (<span><FormattedMessage {...intlMsg.scs}/></span>);
      break;
    case 'fail':
      return (<span><FormattedMessage {...intlMsg.fail}/></span>)
  }
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    this.props.getAppLogs(this.props.cluster, this.props.appName)
  },
  onchange: function () {

  },
  getDetailMsg: function (item) {
    let msg = ''
    // 2: create service, 3: delete service, 8: stop service, 9: start service, 10: restart service
    if (item.operationCode === 2 || item.operationCode === 3
      || item.operationCode === 8 || item.operationCode === 9 || item.operationCode === 10) {
      msg = ` - ${item.detail}`
    }
    return msg
  },
  render: function () {
    if(!this.props.appLogs || !this.props.appLogs.result || this.props.appLogs.result.data <= 0 ) {
      return  <div className="logDetail"></div>
    }
    const logs = this.props.appLogs.result.data || []
    const items = logs.map((item, index) => {
      return (
        <div className="logDetail" key={index}>
          <div className="iconBox">
            <div className="line"></div>
            <div className={item.result === 'success' ? "icon fa fa-check-circle success" : "icon fa fa-times-circle fail"}>
            </div>
          </div>
          <div className="infoBox">
            <div className={item.result === 'success' ? "status success" : "status fail"}>
              {formatOperation(item.operation)}{formatResult(item.result)}
            </div>
            <div className="message">
              &nbsp;{ this.getDetailMsg(item)}
            </div>
            <div className="createTime">
              {item.time}
            </div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    return (
      <div className="logBox">
        {items}
      </div>
    );
  }
});
function mapStateToProp(state) {
  return {
    appLogs: state.apps.appLogs
  }
}
MyComponent = connect(mapStateToProp, {
  getAppLogs: appLogs
})(MyComponent)

export default class AppLog extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="AppLog">
        <MyComponent  cluster={this.props.cluster} appName={this.props.appName} />
      </div>
    )
  }
}

AppLog.propTypes = {
  //
}
