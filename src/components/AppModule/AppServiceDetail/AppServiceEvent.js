/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppServiceEvent component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox, Dropdown, Button, Card, Menu, Icon, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { loadServiceDetailEvents } from '../../../actions/services'
import { calcuDate } from '../../../common/tools.js'
import CommonStatus from '../../CommonStatus'
import './style/AppServiceEvent.less'

function loadData(props) {
  const { cluster, serviceName } = props;
  props.loadServiceDetailEvents(cluster, serviceName);
}

var MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    isFetching: React.PropTypes.bool,
  },
  render: function () {
    const { isFetching, config } = this.props;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length == 0 || !!!config) {
      return (
        <div className='loadingBox'>
          暂无数据
        </div>
      )
    }
    var items = config.map((item) => {
      return (
        <div className='eventDetail' key={item.id}>
          <div className='iconBox'>
            <div className='line'></div>
            <div className={item.type == 'Normal' ? 'icon fa fa-check-circle success' : 'icon fa fa-times-circle fail'}>
            </div>
          </div>
          <div className='infoBox'>
            <div className='status'>
              <span className='commonSpan'>
                <CommonStatus status={item.type} content={item.reason} />
              </span>
            </div>
            <div className='message'>
              消息&nbsp;:&nbsp;{item.message}
            </div>
            <div className='createTime'>
              <span className='commonSpan'>
                {calcuDate(item.lastSeen)}
              </span>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      );
    });
    return (
      <div className='logBox'>
        {items}
      </div>
    );
  }
});

class AppServiceEvent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    loadData(this.props);
  }

  render() {
    const { isFetching, eventList } = this.props;
    return (
      <Card id='AppServiceEvent'>
        <MyComponent isFetching={isFetching} config={eventList} />
      </Card>
    )
  }
}

AppServiceEvent.propTypes = {
  // Injected by React Redux
  eventList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadServiceDetailEvents: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const defaultEvents = {
    isFetching: false,
    cluster: props.cluster,
    eventList: []
  }
  const { serviceDetailEvents } = state.services
  let targetServices
  if (serviceDetailEvents[props.cluster] && serviceDetailEvents[props.cluster][props.serviceName]) {
    targetServices = serviceDetailEvents[props.cluster][props.serviceName]
  }
  const { eventList, isFetching } = targetServices || defaultEvents

  return {
    eventList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadServiceDetailEvents
})(AppServiceEvent)