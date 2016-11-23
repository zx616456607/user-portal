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
import { Button } from 'antd'
import './style/VSphereDetail.less'
import ProgressBox from '../ProgressBox'

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

class VSphereDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  
  render() {
    const { formatMessage } = this.props.intl;
    return (
      <div id='VSphereDetail'>
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
              <span className='rightSpan'>12345</span>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='healthPod'>
              <div className='colorBox'>
              </div>
              <span><FormattedMessage {...menusText.healthPod} /></span>
              <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
              <span className='rightSpan'>12222</span>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='unstartPod'>
              <div className='colorBox'>
              </div>
              <span><FormattedMessage {...menusText.unstartPod} /></span>
              <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
              <span className='rightSpan'>123</span>
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
            <ProgressBox boxPos={0.50} />
          </div>
          <div className='littelRight'>
            <div className='commonBox'>
              <span className='leftSpan'><FormattedMessage {...menusText.used} /></span>
              <span className='rightSpan'>T</span>
              <span className='rightSpan'>123</span>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='leftSpan'><FormattedMessage {...menusText.idle} /></span>
              <span className='rightSpan'>T</span>
              <span className='rightSpan'>123</span>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='leftSpan'><FormattedMessage {...menusText.vgNum} /></span>
              <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
              <span className='rightSpan'>123</span>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='leftSpan'><FormattedMessage {...menusText.using} /></span>
              <span className='rightSpan'><FormattedMessage {...menusText.unit} /></span>
              <span className='rightSpan'>123</span>
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div style={{ clear: 'both' }}></div>
        <div className='bottomBox'>
          <div className='commonBox'>
            <svg className='appcreatelayout'>
              <use xlinkHref='#appcreatelayout' />
            </svg>
            <p>CPU共200核</p>
          </div>
          <div className='commonBox'>
            <svg className='appcreatelayout'>
              <use xlinkHref='#appcreatelayout' />
            </svg>
            <p>预计还可创建虚拟vm数量</p>
            <p>20台</p>
          </div>
          <div className='commonBox'>
            <svg className='appcreatelayout'>
              <use xlinkHref='#appcreatelayout' />
            </svg>
            <p>CPU 可用20核</p>
          </div>
          <div className='commonBox'>
            <svg className='appcreatelayout'>
              <use xlinkHref='#appcreatelayout' />
            </svg>
            <p>内存18G 已用10G</p>
          </div>
          <div className='commonBox'>
            <svg className='appcreatelayout'>
              <use xlinkHref='#appcreatelayout' />
            </svg>
            <p>磁盘100T 已用80T</p>
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
  const defaultAppList = {
  }
  const {isFetching, appList} = defaultAppList
  return {
  }
}
VSphereDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(VSphereDetail, {
  withRef: true,
}));

