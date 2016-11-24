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
import { Row, Col, Card, Radio } from 'antd'
import './style/Ordinary.less'
import ReactEcharts from 'echarts-for-react'
import MySpace from './MySpace'
import { getAppStatus, getServiceStatus, getContainerStatus } from '../../../common/status_identify'
import { connect } from 'react-redux'
import { loadClusterOperations, loadClusterSysinfo, loadClusterStorage,
         loadClusterAppStatus } from '../../../actions/overview_cluster'
import ProgressBox from '../../ProgressBox'

let restValue = 12366
let costValue = 45666
//应用数
let appCountRun = 10
let appCountStop = 100
let appCountBusy = 1000


let clusterCostOption = {
  tooltip : {
    trigger: 'item',
    formatter: "{b} : {c}<br/> ({d}%)"
  },
  legend: {
    orient : 'vertical',
    left : '50%',
    top : '30%',
    data:[{name:'余额'}, {name:'消费'}],
    formatter: function (name) {
      if(name === '余额'){
        return name + ': ' + restValue + 'T币'
      } else {
        return name + ': ' + costValue + 'T币'
      }
    },
    textStyle: {
      fontSize: 14,
    },
    itemGap: 15,
    itemWidth: 10,
    itemHeight: 10,
  },
  color: ['#46b2fa', '#f6565e'],
  series : [
    {
      name:'',
      type:'pie',
      selectedMode: 'single',
      radius : '40%',
      center: ['30%', '50%'],
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
    top : 'middle',
    data:[{name:'运行中'}, {name:'已停止'},{name:'操作中'}],
    formatter: function (name) {
      if(name === '运行中'){
        return name + ': ' + appCountRun + 'T币'
      } else if (name === '已停止') {
        return name + ': ' + appCountStop + 'T币'
      } else if (name === '操作中') {
        return name + ': ' + appCountBusy + 'T币'
      }
    },
    textStyle: {
      fontSize: 14,
    },
    itemGap: 15,
    itemWidth: 10,
    itemHeight: 10,
  },
  color: ['#46b3f8','#b5e0ff','#2abe84'],
  series: {
    type:'pie',
    selectedMode: 'single',
    avoidLabelOverlap: false,
    hoverAnimation: false,
    selectedOffset: 0,
    radius: ['28', '40'],
    center: ['25%', '50%'],
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
    text: '内存',
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
let diskOption = {
  title: {
    text: '磁盘',
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

class Ordinary extends Component{
  constructor(props){
    super(props)
    this.handleDataBaseClick = this.handleDataBaseClick.bind(this)
    this.state = {
      tab1: true,
      tab2: false,
      tab3: false,
    }
  }
  
  componentWillMount() {
    const { loadClusterOperations, loadClusterSysinfo, loadClusterStorage, loadClusterAppStatus } = this.props
    loadClusterOperations("cce1c71ea85a5638b22c15d86c1f61df")
    loadClusterSysinfo("cce1c71ea85a5638b22c15d86c1f61df")
    loadClusterStorage("cce1c71ea85a5638b22c15d86c1f61df")
    loadClusterAppStatus("cce1c71ea85a5638b22c15d86c1f61df")
  }
  handleDataBaseClick(current){
    if(current === 'tab1'){
      this.setState({
        tab1: true,
        tab2: false,
        tab3: false,
      })
      return
    }
    if(current === 'tab2'){
      this.setState({
        tab1: false,
        tab2: true,
        tab3: false,
      })
      return
    }
    if(current === 'tab3'){
      this.setState({
        tab1: false,
        tab2: false,
        tab3: true,
      })
      return
    }
  }
  render(){
    const {clusterOperations, clusterSysinfo, clusterStorage} = this.props
    let boxPos = 0
    if ((clusterStorage.freeSize + clusterStorage.usedSize) > 0) {
      boxPos = (clusterStorage.usedSize/(clusterStorage.freeSize + clusterStorage.usedSize)).toFixed(3)
    }
    return (
      <div id='Ordinary' style={{marginTop:40}}>
        <Row className="title">我的空间-产品环境集群</Row>
        <Row className="content" gutter={16}>
          <Col span={8} className='clusterCost'>
            <Card title="本日该集群消费" bordered={false} bodyStyle={{height:220,padding:'0 24px'}}>
              <ReactEcharts
                notMerge={true}
                option={clusterCostOption}
                style={{height:'200px'}}
              />
            </Card>
          </Col>
          <Col span={11} className='sysState'>
            <Card title="系统状态和版本" bordered={false} bodyStyle={{height:220}}>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      Kubernetes
                    </td>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      {clusterSysinfo.k8s.status}
                    </td>
                    <td style={{textAlign:'right',paddingRight:10}}>
                      {clusterSysinfo.k8s.version}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      DNS
                    </td>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      {clusterSysinfo.dns.status}
                    </td>
                    <td style={{textAlign:'right',paddingRight:10}}>
                      {clusterSysinfo.dns.version}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      API Server
                    </td>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      {clusterSysinfo.apiserver.status}
                    </td>
                    <td style={{textAlign:'right',paddingRight:10}}>
                      {clusterSysinfo.apiserver.version}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      CICD
                    </td>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      {clusterSysinfo.cicd.status}
                    </td>
                    <td style={{textAlign:'right',paddingRight:10}}>
                      {clusterSysinfo.cicd.version}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      Logging
                    </td>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      {clusterSysinfo.logging.status}
                    </td>
                    <td style={{textAlign:'right',paddingRight:10}}>
                      {clusterSysinfo.logging.version}
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
                    {clusterOperations.appCreate}个
                  </td>
                </tr>
                <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      修改应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {clusterOperations.appModify}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      停止应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {clusterOperations.appStop}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      启动应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {clusterOperations.appStart}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      重新部署应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {clusterOperations.appRedeploy}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      创建服务数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {clusterOperations.svcCreate}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      删除服务数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {clusterOperations.svcDelete}个
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
        <Row className="content" gutter={16} style={{marginTop:10}}>
          <Col span={6}>
            <Card title="应用" bordered={false} bodyStyle={{height:200,padding:'0 24px'}}>
              <ReactEcharts
                notMerge={true}
                option={appOption}
                style={{height:'200px'}}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="服务" bordered={false} bodyStyle={{height:200,padding:'0 24px'}}>
              <ReactEcharts
                notMerge={true}
                option={appOption}
                style={{height:'200px'}}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="容器" bordered={false} bodyStyle={{height:200,padding:'0 24px'}}>
              <ReactEcharts
                notMerge={true}
                option={appOption}
                style={{height:'200px'}}
              />
            </Card>
          </Col>
          <Col span={6} className='storage'>
            <Card title="存储" bordered={false} bodyStyle={{height:200,padding:'0 24px'}}>
              <ProgressBox boxPos={boxPos}/>
              <Col span={12} className='storageInf'>
                <div className="storageInfList">
                  <Row className='storageInfItem'>
                    <Col span={12}>已使用:</Col>
                    <Col span={12} style={{textAlign:'right'}}>{clusterStorage.usedSize}MB</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>空闲:</Col>
                    <Col span={12} style={{textAlign:'right'}}>{clusterStorage.freeSize}MB</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>存储卷数:</Col>
                    <Col span={12} style={{textAlign:'right'}}>{clusterStorage.totalCnt}个</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>使用中:</Col>
                    <Col span={12} style={{textAlign:'right'}}>{clusterStorage.usedCnt}个</Col>
                  </Row>
                </div>
              </Col>
            </Card>
          </Col>
        </Row>
        <Row className="content" gutter={16} style={{marginTop: 10}}>
          <Col span={6} className='dataBase'>
            <Card title="数据库与缓存" bordered={false} bodyStyle={{height:200}}>
              <Row gutter={16}>
                <Col span={8} onClick={() => this.handleDataBaseClick('tab1')} className={this.state.tab1?'seleted':''}><span className='dataBtn'>MySQL集群</span></Col>
                <Col span={8} onClick={() => this.handleDataBaseClick('tab2')} className={this.state.tab2?'seleted':''}><span className='dataBtn'>Mongo集群</span></Col>
                <Col span={8} onClick={() => this.handleDataBaseClick('tab3')} className={this.state.tab3?'seleted':''}><span className='dataBtn'>Redis集群</span></Col>
              </Row>
              <Row style={{display: this.state.tab1?'block':'none'}}>
                <Col span={12}></Col>
                <Col span={12} style={{marginTop:40}}>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中:
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        70个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#a2d7ff'}}></div>
                        已停止
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        20个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        10个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{display: this.state.tab2?'block':'none'}}>
                <Col span={12}></Col>
                <Col span={12} style={{marginTop:40}}>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中:
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        70个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#a2d7ff'}}></div>
                        已停止
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        20个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        10个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{display: this.state.tab3?'block':'none'}}>
                <Col span={12}></Col>
                <Col span={12} style={{marginTop:40}}>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中:
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        70个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#a2d7ff'}}></div>
                        已停止
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        20个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        10个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={18} className="hostState">
            <Card title="计算资源使用率" bordered={false} bodyStyle={{height:200,padding:'0 24px'}}>
              <Row gutter={16} style={{height:200}}>
                <Col span={6}>
                  <ReactEcharts
                    notMerge={true}
                    option={CPUOption}
                    style={{height:'200px'}}
                  />
                </Col>
                <Col span={6}>
                  <ReactEcharts
                    notMerge={true}
                    option={memoryOption}
                    style={{height:'200px'}}
                  />
                </Col>
                <Col span={6}>
                  <ReactEcharts
                    notMerge={true}
                    option={diskOption}
                    style={{height:'200px'}}
                  />
                </Col>
                <Col span={6} style={{borderLeft: '1px solid #e2e2e2',height:'200px'}}>
                  <Row style={{fontSize:'14px',textAlign: 'center',height:60,lineHeight:'60px'}}>主机状态</Row>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#43b4f6'}}></div>
                        主机总数
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        12346个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#2abe84'}}></div>
                        健康主机数
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        12340个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#a2d8fa'}}></div>
                        未启用主机数
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        6个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <MySpace />
      </div>
    )
  }
}

function setMap(map, key) {
  if (map.get(key) == undefined) {
   map.set(key, 1)
  } else {
   map.set(key, map.get(key)+1)
  }
}

function getStatus(data) {
  let appMap = new Map()
  let svcMap = new Map()
  let podMap = new Map()

  for (let appName in data) {
     let services = data[appName].deployments
     let pods = data[appName].pods
     let status = getAppStatus(services)
     setMap(appMap, status.phase)
     services.map(service => {
       status = getServiceStatus(service)
       setMap(svcMap, status.phase)
     })
     pods.map(pod => {
       status = getContainerStatus(pod)
       setMap(podMap, status.phase)
     })
  }

  console.log("App Result: ")
  for (let key of appMap.keys()) {
    console.log(key, ": ", appMap.get(key))
  }

  console.log("Service Result: ")
  for (let key of svcMap.keys()) {
    console.log(key, ": ", svcMap.get(key))
  }

  console.log("Pod Result: ")
  for (let key of podMap.keys()) {
    console.log(key, ": ", podMap.get(key))
  }

  return {appMap, svcMap, podMap}
}

function mapStateToProp(state,props) {
  let clusterOperationsData = {
    appCreate: 0,
    appModify: 0,
    svcCreate: 0,
    svcDelete: 0,
    appStop: 0,
    appStart: 0,
    appRedeploy: 0,
  }
  let clusterSysinfoData = {
    k8s:{
      version: "",
      status: ""
    },
    dns:{
      version: "",
      status: ""
    },
    apiserver:{
      version: "",
      status: ""
    },
    cicd:{
      version: "",
      status: ""
    },
    logging:{
      version: "",
      status: ""
    }
  }
  let clusterStorageData = {
    freeSize: 0,
    totalCnt: 0,
    usedCnt: 0,
    usedSize: 0,
  }
  let clusterAppStatusData = {
    appMap: new Map(),
    svcMap: new Map(),
    podMap: new Map(),
  }
  const {clusterOperations, clusterSysinfo, clusterStorage, clusterAppStatus} = state.overviewCluster
  if (clusterOperations.result && clusterOperations.result.data
      && clusterOperations.result.data.data) {
        let data = clusterOperations.result.data.data
        if (data.appCreate) {
          clusterOperationsData.appCreate = data.appCreate
        }
        if (data.appModify) {
          clusterOperationsData.appModify = data.appModify
        }
        if (data.svcCreate) {
          clusterOperationsData.svcCreate = data.svcCreate
        }
        if (data.svcDelete) {
          clusterOperationsData.svcDelete = data.svcDelete
        }
        if (data.appStop) {
          clusterOperationsData.appStop = data.appStop
        }
        if (data.appStart) {
          clusterOperationsData.appStart = data.appStart
        }
        if (data.appCreate) {
          clusterOperationsData.appCreate = data.appCreate
        }
        if (data.appRedeploy) {
          clusterOperationsData.appRedeploy = data.appRedeploy
        } 
      }
  if (clusterSysinfo.result && clusterSysinfo.result.data) {
        let data = clusterSysinfo.result.data
        if (data.k8s) {
          if (data.k8s.version) {
            clusterSysinfoData.k8s.version = data.k8s.version
          }
          if (data.k8s.status) {
            clusterSysinfoData.k8s.status = data.k8s.status
          }
        }
        if (data.dns) {
          if (data.dns.version) {
            clusterSysinfoData.dns.version = data.dns.version
          }
          if (data.dns.status) {
            clusterSysinfoData.dns.status = data.dns.status
          }
        }
        if (data.apiserver) {
          if (data.apiserver.version) {
            clusterSysinfoData.apiserver.version = data.apiserver.version
          }
          if (data.apiserver.status) {
            clusterSysinfoData.apiserver.status = data.apiserver.status
          }
        }
        if (data.cicd) {
          if (data.cicd.version) {
            clusterSysinfoData.cicd.version = data.cicd.version
          }
          if (data.cicd.status) {
            clusterSysinfoData.cicd.status = data.cicd.status
          }
        }
        if (data.logging) {
          if (data.logging.version) {
            clusterSysinfoData.logging.version = data.logging.version
          }
          if (data.logging.status) {
            clusterSysinfoData.logging.status = data.logging.status
          }
        }
      }
  if (clusterStorage.result && clusterStorage.result.data) {
        let data = clusterStorage.result.data
        if (data.freeSize) {
          clusterStorageData.freeSize = data.freeSize
        }
        if (data.totalCnt) {
          clusterStorageData.totalCnt = data.totalCnt
        }
        if (data.usedCnt) {
          clusterStorageData.usedCnt = data.usedCnt
        }
        if (data.usedSize) {
          clusterStorageData.usedSize = data.usedSize
        }
  }
  if (clusterAppStatus.result && clusterAppStatus.result.data) {
    let data = clusterAppStatus.result.data
    clusterAppStatusData = getStatus(data)
  }
  return {
    clusterOperations: clusterOperationsData,
    clusterSysinfo: clusterSysinfoData,
    clusterStorage: clusterStorageData,
    clusterAppStatus: clusterAppStatusData,
  }
}

export default connect(mapStateToProp, {
  loadClusterOperations,
  loadClusterSysinfo,
  loadClusterStorage,
  loadClusterAppStatus,
})(Ordinary)