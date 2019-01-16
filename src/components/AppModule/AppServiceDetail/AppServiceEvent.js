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
import { loadServiceDetailEvents, loadContainersAllEvents } from '../../../actions/services'
import { calcuDate } from '../../../common/tools.js'
import CommonStatus from '../../CommonStatus'
import NotificationHandler from '../../../components/Notification'
import './style/AppServiceEvent.less'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'

function loadData(props) {
  const { formatMessage } = props.intl
  const notification = new NotificationHandler()
  const { cluster, serviceName, type } = props;

  props.loadServiceDetailEvents(cluster, serviceName, type, {
    failed: {
      func: err => {
        if (err.message && err.message.code === 404) {
          notification.warn(formatMessage(AppServiceDetailIntl.serviceStarting))
        }
      }
    }
  })
  props.loadContainersAllEvents(cluster, serviceName)
}

var MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    isFetching: React.PropTypes.bool,
  },
  shouldComponentUpdate(nextProps) {
    // [KK-748] 事件闪烁, 排查无重新请求和组件卸载的情况
    if ((JSON.stringify(nextProps.config) !== JSON.stringify(this.props.config)) ||
      (JSON.stringify(nextProps.containersAllEvent) !== JSON.stringify(this.props.containersAllEvent))) {
      return true
    }
      return false
  },
  getContainerEvent(message) {
    const { formatMessage } = this.props
    let podname = message.replace('Created pod: ', '')
    const { containersAllEvent } = this.props
    const result = []
    if (containersAllEvent.result) {
        if(!containersAllEvent.result.data.events) return
        containersAllEvent.result.data.events.forEach(event => {
        const name = event.objectMeta.name.split('.')[0]
        if (name == podname) {
          result.push(<div className='containerDetail' key={event.id}>
            <div className='infoBox'>
              <div className='status'>
                <div className={event.type == 'Normal' ? 'icon fa fa-check-circle success' : 'icon fa fa-times-circle fail'}>
                </div>
                <span className='commonSpan'>
                  <CommonStatus status={event.type} content={event.reason} />
                </span>
              </div>
              <div className='message'>
                {formatMessage(ServiceCommonIntl.message)}&nbsp;:&nbsp;{event.message}
              </div>
              <div className='createTime'>
                <span className='commonSpan'>
                  {calcuDate(event.lastSeen)}
                </span>
              </div>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>)
        }
      })
    }
    return result
  },
  render: function () {
    const { isFetching, config } = this.props;
    const { formatMessage } = this.props
    if (isFetching || this.props.containersAllEvent.isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length == 0 || !!!config) {
      return (
        <div className='loadingBox'>
          {formatMessage(AppServiceDetailIntl.noData)}
        </div>
      )
    }
    var items = config.reverse().map((item, index) => {
        return <div className='eventDetail' key={item.id}>
          <div className='iconBox'>
            <div className='line'></div>
            <div className={item.type == 'Normal' ? 'icon fa fa-check-circle success' : 'icon fa fa-times-circle fail'}>
            </div>
          </div>
          <div className='infoBox'>
            <div className='status titleStatus'>
              <span className='commonSpan'>
                <CommonStatus status={item.type} content={item.reason} />
              </span>
            </div>
            <div className='message titleMsg'>
              {formatMessage(ServiceCommonIntl.message)}&nbsp;:&nbsp;{item.message}
            </div>
            <div className='createTime'>
              <span className='commonSpan'>
                {calcuDate(item.lastSeen)}
              </span>
            </div>
            {item.reason == 'SuccessfulCreate' ? this.getContainerEvent(item.message) : ''}
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      })
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
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, service } = nextProps
    if (serviceDetailmodalShow && serviceDetailmodalShow != this.props.serviceDetailmodalShow) {
      loadData(nextProps)
      return
    }
  }
  render() {
    const { isFetching, eventList, containersAllEvent } = this.props;
    const { formatMessage } = this.props.intl
    return (
      <Card id='AppServiceEvent'>
        <MyComponent
        isFetching={isFetching}
        config={eventList}
        containersAllEvent={containersAllEvent}
        formatMessage={formatMessage}
        />
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
    eventList: [],
    containerEvent: []
  }
  const { serviceDetailEvents, containersAllEvent } = state.services
  let targetServices
  if (serviceDetailEvents[props.cluster] && serviceDetailEvents[props.cluster][props.serviceName]) {
    targetServices = serviceDetailEvents[props.cluster][props.serviceName]
  }
  const { eventList, isFetching } = targetServices || defaultEvents

  return {
    eventList,
    isFetching,
    containersAllEvent: containersAllEvent || {}
  }
}

export default injectIntl(connect(mapStateToProps, {
  loadServiceDetailEvents,
  loadContainersAllEvents
})(AppServiceEvent), { withRef: true, })
