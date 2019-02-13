/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster component
 *
 * v0.1 - 2017-1-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import SecondSider from '../../components/SecondSider'
import { browserHistory } from 'react-router'
// import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import * as openApiActions from '../../actions/open_api'
import './style/cluster.less'

const HEADER_HEIGHT = 60
let menuList = [
  {
    url: '/cluster',
    name: 'clusterManage'
  },
  {
    url: '/cluster/globalConfig',
    name: 'globalConfig'
  },
  {
    url: '/cluster/iaas',
    name: 'iaas'
  },
  {
    url: '/cluster/cluster_autoscale',
    name: 'clusterAutoscale'
  },
  {
    url: '/cluster/monitor',
    name: 'clusterMonitor',
    onClick: () => {
      try {
        browserHistory.push('/cluster/monitor')
        if (window.monitorPortalHistory) {
          window.monitorPortalHistory.replace('/cluster/monitor')
        }
      } catch (error) {
        //
      }
    }
  },
  {
    url: '/cluster/backup',
    name: 'clusterBackup',
    onClick: () => {
      try {
        browserHistory.push('/cluster/backup')
        if (window.monitorPortalHistory) {
          window.monitorPortalHistory.replace('/backup')
        }
      } catch (error) {
        //
      }
    }
  },
  {
    url: '/cluster/alarmSetting',
    name: 'alarmSetting',
    onClick: () => {
      try {
        browserHistory.push('/cluster/alarmSetting')
        if (window.monitorPortalHistory) {
          window.monitorPortalHistory.replace('/alarmSetting')
        }
      } catch (error) {
        //
      }
    }
  },
  {
    url: '/cluster/alarmRecord',
    name: 'alarmRecord',
    onClick: () => {
      try {
        browserHistory.push('/cluster/alarmRecord')
        if (window.monitorPortalHistory) {
          window.monitorPortalHistory.replace('/alarmRecord')
        }
      } catch (error) {
        //
      }
    }
  },
  {
    url: '/cluster/integration',
    name: 'integration',
  },
]
class Cluster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal',
      windowHeight: window.innerHeight,
    }
  }
  componentDidMount() {
    window.appStackIframeCallBack = (action, data) => {
      switch (action) {
        case 'redirect':
          browserHistory.push(data.pathname)
          break
        case 'appStackPortalHistory':
          window.appStackPortalHistory = data
          break
        default:
          break
      }
    }
    window.addEventListener('resize', this.handleWindowResize)
    const { loadApiInfo } = this.props
    loadApiInfo()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize)
  }

  handleWindowResize = () => {
    this.setState({
      windowHeight: window.innerHeight,
    })
  }
  render() {
    const { children } = this.props
    const scope = this
    const { windowHeight } = this.state
    const style = {
      height: windowHeight - HEADER_HEIGHT,
      overflowY: 'auto',
    }
    return (
      <div id='Cluster' style={style}>
        <div className="ClusterContent CommonSecondContent" >
          {children}
        </div>
      </div>
    )
  }
}

Cluster.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps, {
  loadApiInfo: openApiActions.loadApiInfo,
})(Cluster)
