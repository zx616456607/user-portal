/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerLog component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox, Dropdown, Button, Card, Menu, Icon, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/ContainerLog.less'
import { loadContainerDetailEvents } from '../../actions/app_manage'
import { DEFAULT_CLUSTER } from '../../constants'
import { tenxDateFormat } from '../../common/tools.js'

function loadData(props) {
  const { cluster, containerName } = props;
  props.loadContainerDetailEvents(cluster, containerName);
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  onchange: function() {

  },
  render: function() {
    let { config, isFetching } = this.props;
    if(!!config) {
      return( <div className = "noData" >
        No Data 
        </div>
      )
    }
    if(isFetching) {
      return( 
        <div className = "loadingBox" >
          <Spin size = "large" / >
        </div>
      )
    }
    let items = config.map((item) => {
      return( 
      <div className = 'logDetail' key = { item.id } >
        <div className = 'iconBox' >
          <div className = 'line' ></div> 
          <div className = { item.type == 'Normal' ? 'icon fa fa-check-circle success' : 'icon fa fa-times-circle fail' } > </div> 
        </div> 
        <div className = 'infoBox' >
          <div className = { item.type == 'Normal' ? 'status success' : 'status fail' } >
            <span className = "commonSpan" > 
              { item.reason } 
            </span> 
          </div> 
          <div className = 'message' >
            <span className = "commonSpan" > 
              消息 & nbsp;: & nbsp; { item.message } 
            </span>
          </div> 
          <div className = 'createTime' >
            <span className = "commonSpan" > 
              { tenxDateFormat(item.lastTimestamp) } 
            < /span> 
          </div> 
        </div>
        <div style = {{ clear: 'both' }} > </div> 
      </div>
      );
    });
    return( 
      <div className = 'logBox' > 
        { items } 
      </div>
    );
  }
});

class ContainerLog extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    loadData(this.props);
  }

  render() {
    const { eventList } = this.props;
    return( 
      <div id = 'ContainerLog' >
        <MyComponent config = { eventList } /> 
      </div>
    )
  }
}

ContainerLog.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  eventList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadContainerDetailEvents: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const defaultEvents = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    eventList: []
  }
  const { containerDetailEvents } = state.containers
  const { eventList, isFetching } = containerDetailEvents[DEFAULT_CLUSTER] || defaultEvents

  return {
    eventList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadContainerDetailEvents
})(ContainerLog)