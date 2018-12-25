/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * monitor loadBabanlce
 *
 * @author lvjunfeng
 * @date 2018-12-18
 *
*/
import React from 'react'
import { connect } from 'react-redux'
import * as LoadBalanceAction from '../../../../../src/actions/load_balance'
import TimeControl from '../../../../../src/components/Metrics/TimeControl'
import Metrics from '../../../../../src/components/Metrics'
import MonitorBlock from './monitorBlock'
import { UPDATE_INTERVAL, LOAD_INSTANT_INTERVAL } from '../../../../../src/constants'
import { getDeepValue } from '../../../../util/util';
import { Spin } from 'antd'

const monitorType = [
  'controller/connections', // 负载均衡当前 【连接数】
  'controller/qps', // 负载均衡 qps 单位 reqps
  'controller/success_rate', // 负载均衡相应【成功率】(除4xx 5xx外百分比)
  'config/last_reload_successful', // 配置文件成功加载次数
  'config/last_reload_failed', // 配置文件加载失败次数
  'cpu/usage_rate',
  'memory/usage_rate',
  'network/tx_rate',
  'network/rx_rate',
  'ingress/qps', // 监听器 qps 单位 reqps
  'ingress/success_rate', // 监听器相应【成功率】(除4xx 5xx外百分比)
  // 'config/last_reload_timestamp', // 配置文件最后一次加载成功实践
]

class MonitorLoadBalance extends React.Component {

  state = {
    intervalStatus: false,
    freshTime: '1分钟',
    switchCpu: false,
    switchMemory: false,
    switchNetwork: false,
    switchQps: false,
    switchSuccRate: false,
    currentValue: 1,
    // currentStart: this.changeTimeStart(1),
    loading: true,
  }

  clearIntervalLoadMetrics = () => {
    clearInterval(this.metricsInterval)
    monitorType.forEach(item => {
      clearInterval(this[`${item}RealTimeInterval`])
    })
  }

  componentWillUnmount() {
    this.clearIntervalLoadMetrics()
    // 关闭实时定时器
    const switchArr = [ 'Cpu', 'Memory', 'Network', 'Qps', 'SuccRate' ]
    switchArr.forEach(item => {
      if (this.state[`switch${item}`]) {
        this.switchChange(false, item)
      }
    })
  }

  componentDidMount() {
    this.setState({
      currentStart: this.changeTimeStart(1),
    }, () => {
      this.clearIntervalLoadMetrics()
      setTimeout(() => {
        this.intervalLoadMetrics()
      }, 400)
    })
  }

  intervalLoadMetrics = () => {
    clearInterval(this.metricsInterval)
    this.setState({
      loading: true,
    })
    this.loadInstanceAllMetrics()
    this.metricsInterval = setInterval(() => {
      this.loadInstanceAllMetrics()
    }, UPDATE_INTERVAL)
  }

  loadInstanceAllMetrics = async () => {
    const promiseArray = monitorType.map(type => this.getInstanceMetricsByType(type))
    await Promise.all(promiseArray)
    this.setState({
      loading: false,
    })
  }

  getInstanceMetricsByType = (type, kind) => {
    const { clusterID, location, getMonitorData } = this.props
    const { query: { name } } = location || {}
    const { currentValue } = this.state
    const queryBody = {
      type,
      ...this.formatTimeRange(currentValue),
    }
    getMonitorData(clusterID, name, queryBody, {
      success: {
        func: () => {
          kind && this.setState({
            [`${kind}Loading`]: false,
          })
        },
      },
    })
  }

  formatTimeRange = range => ({
    start: this.changeTimeStart(range),
    end: new Date().toISOString(),
  })

  changeTimeStart = hours => {
    const d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }

  handleTimeChange = e => {
    const { value } = e.target
    const start = this.changeTimeStart(value)
    const timeFrequency = {
      1: {
        second: 1000 * 60,
        timeDes: '1分钟',
      },
      6: {
        second: 1000 * 60 * 5,
        timeDes: '5分钟',
      },
      24: {
        second: 1000 * 60 * 20,
        timeDes: '20分钟',
      },
      168: {
        second: 1000 * 60 * 60 * 2,
        timeDes: '2小时',
      },
      720: {
        second: 1000 * 60 * 60 * 6,
        timeDes: '6小时',
      },
    }
    const timeDes = timeFrequency[value].timeDes
    this.setState({
      currentStart: start,
      freshTime: timeDes,
      currentValue: value,
    }, this.intervalLoadMetrics)
  }

  switchChange(flag, type) {
    this.setState({
      [`switch${type}`]: flag,
      [`${type}Loading`]: flag,
    })
    switch (type) {
      case 'Cpu':
        clearInterval(this.cpuInterval)
        if (flag) {
          this.getInstanceMetricsByType('cpu/usage_rate', type)
          this.cpuInterval = setInterval(() => {
            this.getInstanceMetricsByType('cpu/usage_rate', type)
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Memory':
        clearInterval(this.memoryInterval)
        if (flag) {
          this.getInstanceMetricsByType('memory/usage_rate', type)
          this.memoryInterval = setInterval(() => {
            this.getInstanceMetricsByType('memory/usage_rate', type)
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Network':
        clearInterval(this.networkInterval)
        if (flag) {
          this.getInstanceMetricsByType('network/tx_rate', type)
          this.getInstanceMetricsByType('network/rx_rate')
          this.networkInterval = setInterval(() => {
            this.getInstanceMetricsByType('network/tx_rate', type)
            this.getInstanceMetricsByType('network/rx_rate')
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Qps':
        clearInterval(this.qpsInterval)
        if (flag) {
          this.getInstanceMetricsByType('ingress/qps', type)
          this.qpsInterval = setInterval(() => {
            this.getInstanceMetricsByType('ingress/qps', type)
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'SuccRate':
        clearInterval(this.succRateInterval)
        if (flag) {
          this.getInstanceMetricsByType('ingress/success_rate', type)
          this.succRateInterval = setInterval(() => {
            this.getInstanceMetricsByType('ingress/success_rate', type)
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      default:
        break
    }
  }
  render() {
    const { loading } = this.state
    const { monitor } = this.props
    const watchAgruments = [
      {
        title: '总连接数',
        tip: '应用负载均衡上当前总共的连接数量',
        content: getDeepValue(monitor, [ 'controller/connections', 'data' ]),
        key: 'link',
      }, {
        title: '总请求量',
        tip: '应用负载均衡上总的请求数量',
        content: getDeepValue(monitor, [ 'controller/qps', 'data' ]),
        unit: 'reqps',
        key: 'request',
      }, {
        title: '成功率 (非 4|5XX 响应)',
        tip: '请求成功率，即 200 在响应的占比',
        content: getDeepValue(monitor, [ 'controller/success_rate', 'data' ]),
        unit: '%',
        key: 'response',
      }, {
        title: '配置文件更新',
        tip: '应用负载均衡上监听器增/删/改等调整次数',
        content: getDeepValue(monitor, [ 'config/last_reload_successful', 'data' ]),
        key: 'configRefresh',
      }, {
        title: '上次配置失败',
        content: getDeepValue(monitor, [ 'config/last_reload_failed', 'data' ]),
        key: 'configFailed',
      },
    ]
    return (
      <div>
        {
          loading ?
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Spin size="large" />
            </div> :
            <div>
              <TimeControl
                onChange={this.handleTimeChange}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '20px 0 12px',
                }}
              >
                {
                  watchAgruments.map(item => <MonitorBlock {...item} />)
                }
              </div>
              <Metrics
                scope={this}
                key="loadBalanceMonitior"
                events="loadBalanceMonitior"
                cpu={monitor && monitor['cpu/usage_rate']}
                memory={monitor && monitor['memory/usage_rate']}
                networkReceived={monitor && monitor['network/rx_rate']}
                networkTransmitted={monitor && monitor['network/tx_rate']}
                showQps={true}
                qps={monitor && monitor['ingress/qps']}
                showSuccRate={true}
                succRate={monitor && monitor['ingress/success_rate']}
                diskHide={true}
              />
            </div>
        }
      </div>
    )
  }
}

const mapStateToProps = ({
  entities: { current },
  loadBalance: { monitorData },
}) => {
  const clusterID = current.cluster.clusterID
  const { monitor, isFetching } = monitorData
  return {
    clusterID,
    monitor,
    isFetching,
  }
}

export default connect(mapStateToProps, {
  getMonitorData: LoadBalanceAction.getMonitorData,
})(MonitorLoadBalance)
