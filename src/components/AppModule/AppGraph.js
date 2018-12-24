/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppGraph component
 *
 * v0.1 - 2016-10-26
 * @author Shouhong_Zhang
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import "./style/AppGraph.less"
import { getAppOrchfile } from '../../actions/app_manage'
import YamlEditor from '../Editor/Yaml'
import intlMsg from './AppDetailIntl'
import { injectIntl, FormattedMessage } from 'react-intl'

let OrchfileComponent = React.createClass({
  componentWillMount() {
    const {cluster,appName } = this.props
    this.props.getAppOrchfile(cluster, appName)
  },
  render: function () {
    if (!this.props.appOrchfile || !this.props.appOrchfile.result
      || this.props.appOrchfile.result.data.length <= 0 ) {
      return <div className="introBox"><FormattedMessage {...intlMsg.none}/></div>
    }
    let content = this.props.appOrchfile.result.data;
    return (
      <div id="AppGraph">
        <div className="bottomBox">
          <YamlEditor value={content} parentId={'AppInfo'} />
          <div style={{ clear: "both" }}></div>
        </div>
      </div>
    )
  }
});

function mapStateToProp(state,props) {
  const defaultServices = {
    serviceList: [],
    total: 0
  }
  const { cluster,appName } = props
  return {
    appOrchfile: state.apps.appOrchfile,
  }
}

OrchfileComponent = connect(mapStateToProp, {
  getAppOrchfile
})(injectIntl(OrchfileComponent, {
  withRef: true,
}))

export default class AppGraph extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <OrchfileComponent cluster={this.props.cluster} appName={this.props.appName} />
    )
  }
}

AppGraph.propTypes = {
  //
}


