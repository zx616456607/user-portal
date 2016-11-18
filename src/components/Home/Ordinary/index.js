/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/16
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, } from 'antd'
import './style/Ordinary.less'
import ReactEcharts from 'echarts-for-react'

let value = 123

let clusterCostOption = {
  tooltip : {
    trigger: 'item',
    formatter: "{b} : {c}<br/> ({d}%)"
  },
  legend: {
    orient : 'vertical',
    left : '50%',
    top : '20%',
    data:[{name:'余额'}, {name:'消费'}],
    formatter: '{name} : '+value+'T币',
    /*formatter: function (name) {
      console.log('name',name);
      return name
    }*/
  },
  color: ['#46b2fa', '#f6565e'],
  series : [
    {
      name:'',
      type:'pie',
      selectedMode: 'single',
      radius : '40%',
      center: ['20%', '30%'],
      data:[
        {value:900, name:'余额'},
        {value:100, name:'消费',selected:true},
      ],
      itemStyle: {
        normal: {
          borderWidth: 0.5,
          borderColor: '#ffffff'
        },
        emphasis: {
        }
      }
    }
  ]
}
let appOption = {
  tooltip : {
    trigger: 'item',
    formatter: "{b} : {c}({d}%)"
  },
  legend: {
    orient : 'vertical',
    left : '50%',
    top : '4%',
    data:[{name:'运行中'}, {name:'已停止'},{name:'操作中'}],
    formatter: '{name} : '+value+'T币',
  },
  color: ['#46b3f8','#b5e0ff','#2abe84'],
  series: {
    type:'pie',
    selectedMode: 'single',
    avoidLabelOverlap: false,
    hoverAnimation: false,
    selectedOffset: 0,
    radius: ['28', '40'],
    center: ['15%', '15%'],
    data:[
      {value:70, name:'运行中'},
      {value:20, name:'已停止'},
      {value:10, name:'操作中',selected:true},
    ],
    label: {
      normal: {
        position: 'center',
        show: false,
      },
      emphasis: {
        // formatter: '{b}:{c}<br/>({d}%)',
        show: true,
        position: 'center',
        formatter: function (param) {
          return param.percent.toFixed(0) + '%';
        },
        textStyle: {
          fontSize: '14',
          fontWeight: 'normal'
        }
      }
    },
    itemStyle: {
      normal: {
        borderWidth: 2,
        borderColor: '#ffffff',
      },
      emphasis: {
        borderWidth: 0,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
  },
}
let CPUOption = {
  title: {
    text: 'CPU',
    top: '0',
    left: 'center',
    textStyle: {
      fontWeight:'normal'
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
    text: '内存',
    top: '0',
    left: 'center',
    
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
let diskOption = {
  title: {
    text: '磁盘',
    top: '0',
    left: 'center',
    
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
export default class Ordinary extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id='Ordinary' style={{marginTop:40}}>
        <Row className="title">我的空间-产品环境集群</Row>
        <Row className="content" gutter={16}>
          <Col span={8} className='clusterCost'>
            <Card title="本日该集群消费" bordered={false} bodyStyle={{height:220}}>
              <ReactEcharts
                notMerge={true}
                option={clusterCostOption}
              />
            </Card>
          </Col>
          <Col span={11} className='sysState'>
            <Card title="系统状态和版本" bordered={false} bodyStyle={{height:220}}>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <svg className="sysStateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      docker
                    </td>
                    <td>
                      <svg className="sysStateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      正常
                    </td>
                    <td style={{textAlign:'right',paddingRight:10}}>
                      1.2.1
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="sysStateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      docker
                    </td>
                    <td>
                      <svg className="sysStateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      正常
                    </td>
                    <td style={{textAlign:'right',paddingRight:10}}>
                      1.2.1
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="sysStateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      docker
                    </td>
                    <td>
                      <svg className="sysStateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      正常
                    </td>
                    <td style={{textAlign:'right',paddingRight:10}}>
                      1.2.1
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="sysStateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      docker
                    </td>
                    <td>
                      <svg className="sysStateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      正常
                    </td>
                    <td style={{textAlign:'right',paddingRight:10}}>
                      1.2.1
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="sysStateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      docker
                    </td>
                    <td>
                      <svg className="sysStateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      正常
                    </td>
                    <td style={{textAlign:'right',paddingRight:10}}>
                      1.2.1
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </Col>
          <Col span={5} className='clusterRecord'>
            <Card title="今日该集群记录" bordered={false} bodyStyle={{height:220, overflowY:'auto'}}>
              <table>
                <tbody>
                <tr>
                  <td>
                    <svg className="teamRecSvg">
                      <use xlinkHref="#settingname" />
                    </svg>
                    创建应用数量
                  </td>
                  <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                    1000个
                  </td>
                </tr>
                <tr>
                  <td>
                    <svg className="teamRecSvg">
                      <use xlinkHref="#settingname" />
                    </svg>
                    删除应用数量
                  </td>
                  <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                    1000个
                  </td>
                </tr>
                <tr>
                  <td>
                    <svg className="teamRecSvg">
                      <use xlinkHref="#settingname" />
                    </svg>
                    创建存储卷个数
                  </td>
                  <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                    1000个
                  </td>
                </tr>
                <tr>
                  <td>
                    <svg className="teamRecSvg">
                      <use xlinkHref="#settingname" />
                    </svg>
                    删除存储卷个数
                  </td>
                  <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                    1000个
                  </td>
                </tr>
                </tbody>
              </table>
            </Card>
          </Col>
        </Row>
        <Row className="content" gutter={16} style={{marginTop:40}}>
          <Col span={6}>
            <Card title="应用" bordered={false} bodyStyle={{height:175}}>
              <ReactEcharts
                notMerge={true}
                option={appOption}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="服务" bordered={false} bodyStyle={{height:175}}>
              <ReactEcharts
                notMerge={true}
                option={appOption}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="容器" bordered={false} bodyStyle={{height:175}}>
              <ReactEcharts
                notMerge={true}
                option={appOption}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="存储" bordered={false} bodyStyle={{height:175}}>
              <ReactEcharts
                notMerge={true}
                option={appOption}
              />
            </Card>
          </Col>
        </Row>
        <Row className="content" gutter={16} style={{marginTop: 40}}>
          <Col span={6}>
            <Card title="数据库与缓存" bordered={false} bodyStyle={{height:200}}>
              <Row gutter={16}>
                <Col span={8}>MySQL集群</Col>
                <Col span={8}>Mongo集群</Col>
                <Col span={8}>Redis集群</Col>
              </Row>
              <Row>
                <Col span={12}></Col>
                <Col span={12}></Col>
              </Row>
            </Card>
          </Col>
          <Col span={18}>
            <Card title="计算资源使用率" bordered={false} bodyStyle={{height:200}}>
              <Row gutter={16}>
                <Col span={6}>
                  <ReactEcharts
                    notMerge={true}
                    option={CPUOption}
                  />
                </Col>
                <Col span={6}>
                  <ReactEcharts
                    notMerge={true}
                    option={memoryOption}
                  />
                </Col>
                <Col span={6}>
                  <ReactEcharts
                    notMerge={true}
                    option={diskOption}
                  />
                </Col>
                <Col span={6} style={{borderLeft: '1px solid #e2e2e2'}}>
                  <Row style={{fontSize:'18px',textAlign: 'center',height:60}}>主机状态</Row>
                  <Row style={{padding:'0 30px',lineHeight:'30px'}}>
                    <Col span={12}>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      主机总数
                    </Col>
                    <Col span={12} style={{textAlign:'right'}}>
                      12346个
                    </Col>
                  </Row>
                  <Row style={{padding:'0 30px',lineHeight:'30px'}}>
                    <Col span={12}>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      健康主机数
                    </Col>
                    <Col span={12} style={{textAlign:'right'}}>
                      12340个
                    </Col>
                  </Row>
                  <Row style={{padding:'0 30px',lineHeight:'30px'}}>
                    <Col span={12}>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      未启用主机数
                    </Col>
                    <Col span={12} style={{textAlign:'right'}}>
                      6个
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Row className="title" style={{marginTop: 40}}>我的空间</Row>
        <Row className="content" gutter={16} style={{marginBottom: 100}}>
          <Col span={6}>
            <Card title="镜像仓库" bordered={false} bodyStyle={{height:175}}>
              
            </Card>
            <Card title="编排概况" bordered={false} bodyStyle={{height:175}} style={{marginTop: 10}}>
  
            </Card>
          </Col>
          <Col span={6}>
            <Card title="CI/CD" bordered={false} bodyStyle={{height:175}}>
  
            </Card>
            <Card title="今日该集群记录" bordered={false} bodyStyle={{height:175}} style={{marginTop: 10}}>
  
            </Card>
          </Col>
          <Col span={6}>
            <Card title="审计日志" bordered={false} bodyStyle={{height:410}}>
  
            </Card>
          </Col>
          <Col span={6}>
            <Card title="告警" bordered={false} bodyStyle={{height:410}}>
  
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}