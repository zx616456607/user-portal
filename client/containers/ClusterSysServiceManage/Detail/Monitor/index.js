/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * serviceMonitor of SysServiceManageDetail
 *
 * @author Songsz
 * @date 2018-12-24
 *
*/

import React from 'react'
import { connect } from 'react-redux'
import { getSysMonitor as _getSysMonitor } from '../../../../actions/sysServiceManage'
import { Icon, Popover } from 'antd'
import TimeControl from '../../../../../src/components/Metrics/TimeControl'
import { LOAD_INSTANT_INTERVAL, UPDATE_INTERVAL } from '../../../../../src/constants'
import { getDeepValue } from '../../../../util/util'
import Metrics from '../../../../../src/components/Metrics'
import './style/index.less'
import SelectWithCheckbox from '@tenx-ui/select-with-checkbox/lib/index'
import '@tenx-ui/select-with-checkbox/assets/index.css'

const mapState = state => {
  return ({
    isFetching: getDeepValue(state, 'sysServiceManage.monitor.isFetching'.split('.')),
    data: getDeepValue(state, 'sysServiceManage.monitor.data'.split('.')),
  })
}

@connect(mapState, {
  getSysMonitor: _getSysMonitor,
})
export default class Index extends React.PureComponent {
  changeTime = hours => {
    const d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }
  constructor(props) {
    super(props)
    const { podList } = this.props
    this.types = [ 'cpu/usage_rate', 'memory/usage', 'network/rx_rate', 'network/tx_rate', 'disk/readio', 'disk/writeio' ]
    this.state = {
      intervalStatus: false,
      freshTime: '1分钟',
      currentValue: 1,
      filPodVisible: false,
      selectPod: undefined,
      searchPod: undefined,
      currentStart: this.changeTime('1'),
      containers: podList,
      checkedKeys: (podList.length > 5 ? podList.slice(0, 5) : podList).map(i => i.name),
    }
    this.chartTypes = [ 'Cpu', 'Memory', 'Network', 'Disk' ]
  }
  setChartLoading = flag => {
    const switchLoading = {}
    this.chartTypes.map(item => (switchLoading[`${item}Loading`] = flag))
    this.setState({ ...switchLoading })
  }
  async componentDidMount() {
    this.intervalLoadMetrics()
  }
  componentWillUnmount() {
    this.metricsInterval && clearInterval(this.metricsInterval)
    this.chartTypes.map(type => {
      const interval = `switch${type}FetchInterval`
      return this[interval] && clearInterval(this[interval])
    })
  }
  formatTimeRange = range => ({
    start: this.changeTime(range),
    end: new Date().toISOString(),
  })

  switchChange = (flag, type) => {
    this.setState({
      [`switch${type}`]: flag,
    })
    if (type === 'Cpu') return this.switchFetchData(flag, type, [ 'cpu/usage_rate' ])
    if (type === 'Memory') return this.switchFetchData(flag, type, [ 'memory/usage' ])
    if (type === 'Network') return this.switchFetchData(flag, type, [ 'network/rx_rate', 'network/tx_rate' ])
    if (type === 'Disk') return this.switchFetchData(flag, type, [ 'disk/readio', 'disk/writeio' ])
  }
  switchFetchData = (flag, type, types) => {
    const interval = `switch${type}FetchInterval`
    this[interval] && clearInterval(this[interval])
    if (!flag) return
    this.loadSwitchInstanceAllMetrics(type, types)
    this[interval] = setInterval(() => {
      this.loadSwitchInstanceAllMetrics(type, types)
    }, LOAD_INSTANT_INTERVAL)
  }
  loadSwitchInstanceAllMetrics = async (type, types) => {
    const { clusterID, getSysMonitor, podList } = this.props
    if (!podList.length) return
    this.setState({
      [`${type}Loading`]: true,
    })
    await getSysMonitor(
      clusterID,
      podList.map(item => item.name).join(','),
      { ...this.formatTimeRange(this.state.currentValue), types: types.join(',') },
      type
    )
    this.setState({
      [`${type}Loading`]: false,
    })
  }
  handleTimeChange = e => {
    const { value } = e.target
    const start = this.changeTime(value)
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
  intervalLoadMetrics = () => {
    this.metricsInterval && clearInterval(this.metricsInterval)
    this.loadInstanceAllMetrics()
    this.metricsInterval = setInterval(() => {
      this.loadInstanceAllMetrics()
    }, UPDATE_INTERVAL)
  }
  loadInstanceAllMetrics = async () => {
    const { clusterID, getSysMonitor, podList } = this.props
    if (!podList.length) return
    this.setChartLoading(true)
    const res = await getSysMonitor(
      clusterID,
      podList.map(item => item.name).join(','),
      { ...this.formatTimeRange(this.state.currentValue), types: this.types.join(',') }
    )
    this.setChartLoading(false)
    return res
  }
  monitorFilterOnSelect = item => {
    const { checkedKeys } = this.state
    const keys = new Set(checkedKeys)
    if (keys.has(item.name)) {
      keys.delete(item.name)
    } else {
      keys.add(item.name)
    }
    this.setState({
      checkedKeys: [ ...keys ],
    })
  }

  toggleVisible = () => {
    this.setState(({ visible }) => ({
      visible: !visible,
    }))
  }
  renderFilPodContent = () => {
    const { checkedKeys } = this.state
    return <SelectWithCheckbox
      type="checkBox"
      dataSource={this.props.podList}
      nameKey={'name'}
      checkedKeys={checkedKeys}
      onCheck={this.monitorFilterOnSelect}
      onOk={() => this.setState({ visible: false })}
      onReset={() => this.setState({ checkedKeys: [] })}
    />
  }
  filterShowLine = type => ({
    data: (getDeepValue(this.props.data, `${type}.data`.split('.')) || [])
      .filter(l => this.state.checkedKeys.includes(l.containerName)),
    isFetching: true,
  })
  render() {
    const { visible, checkedKeys } = this.state
    return (
      <div className="clusterSysServiceManageDetailMonitor">
        <div className="title">
          <div id="sysServiceMetrics">
            <Popover
              placement={'bottom'}
              trigger={'click'}
              visible={visible}
              onVisibleChange={this.toggleVisible}
              content={this.renderFilPodContent()}
              overlayClassName="monitor-filter-content"
              getTooltipContainer={() => document.getElementById('sysServiceMetrics')}
            >
              <a style={{ lineHeight: '32px' }}>
                <Icon type="filter" /> 筛选实例 (已选择 {checkedKeys.length} )
              </a>
            </Popover>
          </div>
          <TimeControl
            onChange={this.handleTimeChange}
            style={{ paddingRight: 20 }}
          />
        </div>
        <Metrics
          scope={this}
          cpu={this.filterShowLine('cpu/usage_rate')}
          memory={this.filterShowLine('memory/usage')}
          networkReceived={this.filterShowLine('network/rx_rate')}
          networkTransmitted={this.filterShowLine('network/tx_rate')}
          diskWriteIo={this.filterShowLine('disk/writeio')}
          diskReadIo={this.filterShowLine('disk/readio')}
        />
      </div>
    )
  }
}
