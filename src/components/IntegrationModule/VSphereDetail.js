/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  VSphereDetail index module
 *
 * v2.0 - 2016-11-23
 * @author by Gaojian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import ReactEcharts from 'echarts-for-react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Button, Spin, Select } from 'antd'
import { getIntegrationPodDetail } from '../../actions/integration'
import './style/VSphereDetail.less'
import ProgressBox from '../ProgressBox'

const Option = Select.Option;

let CPUOption = {
  title: {
    text: 'CPU已分配',
    top: '15px',
    left: 'center',
    textStyle: {
      fontWeight:'normal',
      fontSize:14
    }
  },
  color: ['#3398DB'],
  tooltip : {
    trigger: 'axis',
    axisPointer : {
      type : 'shadow'
    },
    formatter: '{b} : {c}'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis : [
    {
      type : 'category',
      data : ['node', 'node1', 'node2'],
      splitLine: {
        "show": false
      },
      axisTick: {
        "show": false
      },
      splitArea: {
        "show": false
      },
      axisLabel: {
        "interval": 0,
      },
    }
  ],
  yAxis : [
    {
      type : 'value',
      max: 100,
      splitNumber: 2,
      interval: 50,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        },
      },
    }
  ],
  series : [
    {
      name:'',
      type:'bar',
      barWidth: '60%',
      data:[10, 52, 100],
      
    }
  ]
}

let memoryOption = {
  title: {
    text: '内存已分配',
    top: '15px',
    left: 'center',
    textStyle: {
      fontWeight:'normal',
      fontSize:14
    }
  },
  color: ['#3398DB'],
  tooltip : {
    trigger: 'axis',
    axisPointer : {
      type : 'shadow'
    },
    formatter: '{b} : {c}'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis : [
    {
      type : 'category',
      data : ['node', 'node1', 'node2'],
      splitLine: {
        "show": false
      },
      axisTick: {
        "show": false
      },
      splitArea: {
        "show": false
      },
      axisLabel: {
        "interval": 0,
      },
    }
  ],
  yAxis : [
    {
      type : 'value',
      max: 100,
      splitNumber: 2,
      interval: 50,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        },
      },
    }
  ],
  series : [
    {
      name:'',
      type:'bar',
      barWidth: '60%',
      data:[10, 52, 100],
      
    }
  ]
}

const menusText = defineMessages({
  resource: {
    id: 'Integration.VSphereDetail.resource',
    defaultMessage: '计算资源',
  },
  storage: {
    id: 'Integration.VSphereDetail.storage',
    defaultMessage: '存储',
  },
  podNum: {
    id: 'Integration.VSphereDetail.podNum',
    defaultMessage: '主机总数',
  },
  healthPod: {
    id: 'Integration.VSphereDetail.healthPod',
    defaultMessage: '健康主机数',
  },
  unstartPod: {
    id: 'Integration.VSphereDetail.unstartPod',
    defaultMessage: '未启用主机数',
  },
  unit: {
    id: 'Integration.VSphereDetail.unit',
    defaultMessage: '个',
  },
  podStatus: {
    id: 'Integration.VSphereDetail.podStatus',
    defaultMessage: '主机状态',
  },
  used: {
    id: 'Integration.VSphereDetail.used',
    defaultMessage: '已使用：',
  },
  idle: {
    id: 'Integration.VSphereDetail.idle',
    defaultMessage: '空闲：',
  },
  vgNum: {
    id: 'Integration.VSphereDetail.vgNum',
    defaultMessage: '存储卷数：',
  },
  using: {
    id: 'Integration.VSphereDetail.using',
    defaultMessage: '使用中：',
  },
})

function diskFormat(num) {
  if(num < 1024) {
    return num + 'MB'
  }
  num = parseInt(num / 1024);
  if(num < 1024) {
    return num + 'GB'
  }
  num = parseInt(num / 1024);
  return num + 'TB'
}

function checkHealthPods(config) {
  let num = 0;
  config.map((item) => {
    if(item.powerstate == 'poweron') {
      num++
    }
  })
  return num;
}

function checkErrorPods(config) {
  let num = 0;
  config.map((item) => {
    if(item.powerstate == 'poweroff') {
      num++
    }
  })
  return num;
}

class VSphereDetail extends Component {
  constructor(props) {
    super(props);
    this.onChangeDataCenter = this.onChangeDataCenter.bind(this);
    this.state = {
    }
  }
  
  componentDidMount() {
    const { getIntegrationPodDetail, dataCenters, integrationId, currentDataCenter } = this.props;
    let datacenter = !!currentDataCenter ? currentDataCenter : dataCenters[0]
    getIntegrationPodDetail(integrationId, datacenter);
  }
  
  onChangeDataCenter(e) {
    //this function for user change the current data center
    const { scope, getIntegrationPodDetail, integrationId } = this.props;
    scope.setState({
      currentDataCenter: e
    });
    getIntegrationPodDetail(integrationId, e)
  }
  
  render() {
    const { formatMessage } = this.props.intl;
    const {isFetching, pods, dataCenters, currentDataCenter} = this.props;
    console.log(this.props)
    if(isFetching || !Boolean(pods)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let diskTotal = 0;
    let diskUsed = 0;
    let diskFree = 0;
    let memoryTotal = 0;
    let cpuTotal = 0;
    pods.map((item) => {
      diskTotal = diskTotal + item.diskTotal;
      diskUsed = item.diskTotal - item.diskFree;
      diskFree = diskFree + item.diskFree;
      memoryTotal= memoryTotal + item.memoryTotal;
      cpuTotal = cpuTotal + item.cpuNumber;
    })
    let selectDcShow = dataCenters.map((item, index) => {
      return (
        <Option value={item} key={item}>{item.replace('/','')}</Option>
      )
    });
    return (
      <div id='VSphereDetail'>
        <div className='selectBox'>
          <Select defaultValue={currentDataCenter} style={{ width: 150 }} size='large' onChange={this.onChangeDataCenter}>
            {selectDcShow}
          </Select>
        </div>
        <div className='leftBox'>
          <div className='titleBox'>
            <FormattedMessage {...menusText.resource} />
          </div>
          <div className='littleLeft'>
            <ReactEcharts
              notMerge={true}
              option={CPUOption}
              style={{height:'200px'}}
            />
          </div>
          <div className='littelMiddle'>
            <ReactEcharts
              notMerge={true}
              option={memoryOption}
              style={{height:'200px'}}
            />
          </div>
          <div className='littelRight'>
            <p><FormattedMessage {...menusText.podStatus} /></p>
            <div className='podNum'>
              <div className='colorBox'>
              </div>
              <span><FormattedMessage {...menusText.podNum} /></span>
              <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
              <span className='rightSpan'>{pods.length}</span>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='healthPod'>
              <div className='colorBox'>
              </div>
              <span><FormattedMessage {...menusText.healthPod} /></span>
              <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
              <span className='rightSpan'>{checkHealthPods(pods)}</span>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='unstartPod'>
              <div className='colorBox'>
              </div>
              <span><FormattedMessage {...menusText.unstartPod} /></span>
              <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
              <span className='rightSpan'>{checkErrorPods(pods)}</span>
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='rightBox'>
          <div className='titleBox'>
            <FormattedMessage {...menusText.storage} />
          </div>
          <div className='littleLeft'>
            <ProgressBox boxPos={parseFloat(diskUsed/diskTotal).toFixed(2)} />
          </div>
          <div className='littelRight'>
            <div className='commonBox'>
              <span className='leftSpan'><FormattedMessage {...menusText.used} /></span>
              <span className='rightSpan'>{diskFormat(diskUsed)}</span>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='leftSpan'><FormattedMessage {...menusText.idle} /></span>
              <span className='rightSpan'>{diskFormat(diskFree)}</span>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='leftSpan'><FormattedMessage {...menusText.vgNum} /></span>
              <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
              <span className='rightSpan'>-</span>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='leftSpan'><FormattedMessage {...menusText.using} /></span>
              <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
              <span className='rightSpan'>-</span>
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div style={{ clear: 'both' }}></div>
        <div className='bottomBox'>
          <div className='cpu commonBox'>
            <img src='/img/integration/cpu.png' />
            <p>CPU共{cpuTotal}核</p>
          </div>
          <div className='vm commonBox'>
            <img src='/img/integration/vm.png' />
            <p>预计还可创建虚拟vm数量</p>
            <p>- 台</p>
          </div>
          <div className='cpuUsed commonBox'>
            <img src='/img/integration/cpuUsed.png' />
            <p>CPU 可用 - 核</p>
          </div>
          <div className='memory commonBox'>
            <img src='/img/integration/memory.png' />
            <p>内存{diskFormat(memoryTotal)}</p>
          </div>
          <div className='disk commonBox'>
            <img src='/img/integration/disk.png' />
            <p>磁盘{diskFormat(diskTotal)} 已用{diskFormat(diskUsed)}</p>
          </div>
        </div>
        <div className='tagBox'>
          <i className='fa fa-tag' />
          <span>VSphere版本:2.0</span>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultApp = {
    isFetching: false,
    pods: []
  }
  const { getIntegrationPodDetail } = state.integration
  const {isFetching, pods} = getIntegrationPodDetail || defaultApp
  return {
    isFetching,
    pods
  }
}
VSphereDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getIntegrationPodDetail
})(injectIntl(VSphereDetail, {
  withRef: true,
}));

