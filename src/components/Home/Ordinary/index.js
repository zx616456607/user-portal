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
import { Row, Col, Card, Radio, Icon } from 'antd'
import './style/Ordinary.less'
import ReactEcharts from 'echarts-for-react'
import MySpace from './MySpace'
import { getAppStatus, getServiceStatus, getContainerStatus } from '../../../common/status_identify'
import { connect } from 'react-redux'
import { loadClusterInfo } from '../../../actions/overview_cluster'
import ProgressBox from '../../ProgressBox'

let restValue = '12366'
let costValue = '45666'

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

let SvcState = React.createClass({
  getInitialState(){
    return {
      
    }
  },
  render: function(){
    const { currentState } = this.props
    let item
    if(currentState === 'normal'){
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{backgroundColor:'#2eb764'}}></div>
          <span style={{color:'#2eb865'}}>正常</span>
        </div>
      )
    }
    if(currentState === 'warning'){
      item = (
        <div id='SvcState'>
          <div className='errorDot' style={{backgroundColor:'#f0986b'}}></div>
          <span style={{color:'#f0986b'}}>警告</span>
        </div>
      )
    }
    if(currentState === 'abnormal'){
      item = (
        <div>
          <Icon type="exclamation-circle" style={{color:'#f85a59'}} className='errorDot'/>
          <span style={{color:'#f85a59'}}>异常</span>
        </div>
      )
    }
    return (
      <div id='SvcState'>
        { item }
      </div>
    )
  }
})
  
class Ordinary extends Component{
  constructor(props){
    super(props)
    this.handleDataBaseClick = this.handleDataBaseClick.bind(this)
    this.handleSize = this.handleSize.bind(this)
    this.thousandBitSeparator = this.thousandBitSeparator.bind(this)
    this.state = {
      tab1: true,
      tab2: false,
      tab3: false,
    }
  }
  
  componentWillMount() {
    
  }
  componentDidMount(){
    const { loadClusterInfo, current } = this.props
    const {clusterID} = current.cluster
    loadClusterInfo(clusterID)
  }
  componentWillReceiveProps(nextProps){
    const { loadClusterInfo } = this.props
    const {current} = nextProps
    const {clusterID} = current.cluster
    if(clusterID !== this.props.current.cluster.clusterID){
      loadClusterInfo(clusterID)
      return
    }
    
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
  thousandBitSeparator(num) {
    return num && (num
        .toString().indexOf('.') != -1 ? num.toString().replace(/(\d)(?=(\d{3})+\.)/g, function($0, $1) {
        return $1 + ",";
      }) : num.toString().replace(/(\d)(?=(\d{3}))/g, function($0, $1) {
        return $1 + ",";
    }));
  }
  handleSize(size){
    if(!size){
      return 0 + 'MB'
    }
    let result = 0
    if(size < 1024){
      return size + 'MB'
    }
    if(size < 1024*1024){
      result = this.thousandBitSeparator((size/1024).toFixed(2))
      console.log('result : ',result);
      return result + 'GB'
    }
    if(size < 1024*1024*1024){
      result = this.thousandBitSeparator((size/(1024*1024)).toFixed(2))
      return result + 'T'
    }
    result = this.thousandBitSeparator((size/(1024*1024*1024)).toFixed(2))
    return result + 'T'
  }
  /*render(){
    return (
      <div>111</div>
    )
  }*/
  render(){
    const {clusterOperations, clusterSysinfo, clusterStorage, clusterAppStatus, clusterNodeSummary,clusterDbServices,spaceName,clusterName} = this.props
    let boxPos = 0
    if ((clusterStorage.freeSize + clusterStorage.usedSize) > 0) {
      boxPos = (clusterStorage.usedSize/(clusterStorage.freeSize + clusterStorage.usedSize)).toFixed(3)
    }
    //应用
    let appRunning = clusterAppStatus.appMap.get('Running')
    let appStopped = clusterAppStatus.appMap.get('Stopped')
    let appOthers = clusterAppStatus.appMap.get('Unknown')
    //服务
    let svcRunning = clusterAppStatus.svcMap.get('Running')
    let svcStopped = clusterAppStatus.svcMap.get('Stopped')
    let svcOthers = clusterAppStatus.svcMap.get('Deploying')?clusterAppStatus.svcMap.get('Deploying'):0 +
    clusterAppStatus.svcMap.get('Pending')?clusterAppStatus.svcMap.get('Pending'):0
    //容器
    let conRunning = clusterAppStatus.podMap.get('Running')
    let conFailed = clusterAppStatus.podMap.get('Failed')
    let conOthers = clusterAppStatus.podMap.get('Pending')?clusterAppStatus.podMap.get('Pending'):0 +
    clusterAppStatus.podMap.get('Terminating')?clusterAppStatus.podMap.get('Terminating'):0 +
    clusterAppStatus.podMap.get('Unknown')?clusterAppStatus.podMap.get('Unknown'):0
    
    appRunning = appRunning ? appRunning:0
    appStopped = appStopped ? appStopped:0
    appOthers = appOthers ? appOthers:0
    svcRunning = svcRunning ? svcRunning:0
    svcStopped = svcStopped ? svcStopped:0
    svcOthers = svcOthers ? svcOthers:0
    conRunning = conRunning ? conRunning:0
    conFailed = conFailed ? conFailed:0
    conOthers = conOthers ? conOthers:0
    //计算资源使用率
    //CPU
    let CPUNameArr = []
    let CPUUsedArr = []
    console.log('clusterNodeSummary.cpu.length',clusterNodeSummary.cpu)
    if(clusterNodeSummary.cpu.length !== 0){
      clusterNodeSummary.cpu.map((item,index) => {
        let name = item.name.replace(/192.168./,'')
        CPUNameArr.push(name.substring(0, 7))
        CPUUsedArr.push(item.used)
      })
    } else {
      CPUUsedArr = ['没有数据']
    }
    //内存
    let memoryNameArr = []
    let memoryUsedArr = []
    if(clusterNodeSummary.memory.length !== 0){
      clusterNodeSummary.memory.map((item,index) => {
        let name = item.name.replace(/192.168./,'')
        memoryNameArr.push(name.substring(0, 7))
        memoryUsedArr.push(item.used)
      })
    } else {
      memoryUsedArr = ['没有数据']
    }
    //磁盘
    let diskNameArr = []
    let diskUsedArr = []
    if(clusterNodeSummary.storage.length !== 0){
      clusterNodeSummary.storage.map((item,index) => {
        let name = item.name.replace(/192.168./,'')
        diskNameArr.push(name.substring(0, 7))
        diskUsedArr.push((item.used))
      })
    } else {
      console.log('没有数据....没有数据')
      diskUsedArr = ['没有数据']
    }
    //数据库与缓存
    //MySQL
    const mysqlData = clusterDbServices.get('mysql')
    console.log('clusterDbServices',clusterDbServices);
    let mySQLRunning = 0
    let mySQLStopped = 0
    let mySQLOthers = 0
    if(mysqlData.size !== 0){
      mysqlData.get('failed')?mysqlData.get('failed'):0
      mysqlData.get('pending')?mysqlData.get('pending'):0
      mysqlData.get('running')?mysqlData.get('running'):0
      mysqlData.get('unknown')?mysqlData.get('unknown'):0
      mySQLRunning = mysqlData.get('running')
      mySQLStopped = mysqlData.get('failed') + mysqlData.get('unknown')
      mySQLOthers = mysqlData.get('pending')
    }
    //Mongo
    const mongoData = clusterDbServices.get('mongo')
    let mongoRunning = 0
    let mongoStopped = 0
    let mongoOthers = 0
    if(mongoData.size !== 0){
      mongoData.get('failed')?mongoData.get('failed'):0
      mongoData.get('pending')?mongoData.get('pending'):0
      mongoData.get('running')?mongoData.get('running'):0
      mongoData.get('unknown')?mongoData.get('unknown'):0
      mongoRunning = mongoData.get('running')
      mongoStopped = mongoData.get('failed') + mongoData.get('unknown')
      mongoOthers = mongoData.get('pending')
    }
    //Redis
    const redisData = clusterDbServices.get('redis')
    let redisRunning = 0
    let redisStopped = 0
    let redisOthers = 0
    if(redisData.size !== 0){
      redisData.get('failed')?redisData.get('failed'):0
      redisData.get('pending')?redisData.get('pending'):0
      redisData.get('running')?redisData.get('running'):0
      redisData.get('unknown')?redisData.get('unknown'):0
      redisRunning = redisData.get('running')
      redisStopped = redisData.get('failed') + redisData.get('unknown')
      redisOthers = redisData.get('pending')
    }
    //Options
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
            return name + ': ' + appRunning + '个'
          } else if (name === '已停止') {
            return name + ': ' + appStopped + '个'
          } else if (name === '操作中') {
            return name + ': ' + appOthers + '个'
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
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data:[
          {value:appRunning, name:'运行中'},
          {value:appStopped, name:'已停止'},
          {value:appOthers, name:'操作中',selected:true},
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
    let serviceOption = {
      tooltip : {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient : 'vertical',
        left : '50%',
        top : 'middle',
        data:[{name:'运行中'}, {name:'已停止'},{name:'操作中'}],
        // data: legendData,
        formatter: function (name) {
          if(name === '运行中'){
            return name + ': ' + svcRunning + '个'
          } else if (name === '已停止') {
            return name + ': ' + svcStopped + '个'
          } else if (name === '操作中') {
            return name + ': ' + svcOthers + '个'
          }
        },
        textStyle: {
          fontSize: 14,
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#46b3f8','#b5e0ff','#2abe84','#f6575e'],
      series: {
        type:'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data:[
          {value:svcRunning, name:'运行中'},
          {value:svcStopped, name:'已停止'},
          {value:svcOthers, name:'操作中',selected:true},
        ],
        // data: seriesData,
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
    let containerOption = {
      tooltip : {
        trigger: 'item',
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient : 'vertical',
        left : '50%',
        top : 'middle',
        data:[{name:'运行中'}, {name:'异常'},{name:'操作中'}],
        formatter: function (name) {
          if(name === '运行中'){
            return name + ': ' + conRunning + '个'
          } else if (name === '异常') {
            return name + ': ' + conFailed + '个'
          } else if (name === '操作中') {
            return name + ': ' + conOthers + '个'
          }
        },
        textStyle: {
          fontSize: 14,
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#46b3f8','#f6575e','#2abe84'],
      series: {
        type:'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['32', '45'],
        center: ['25%', '50%'],
        data:[
          {value:conRunning, name:'运行中'},
          {value:conFailed, name:'异常'},
          {value:conOthers, name:'操作中',selected:true},
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
        formatter: clusterNodeSummary.cpu.length === 0?'{c}':'{b} : {c}%'
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
          data : CPUNameArr,
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
          barWidth: 16,
          data:CPUUsedArr,
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
        formatter: clusterNodeSummary.memory.length === 0?'{c}':'{b} : {c}%'
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
          data : memoryNameArr,
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
          barWidth: 16,
          data:memoryUsedArr,
          
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
        formatter: clusterNodeSummary.storage.length === 0?'{c}':'{b} : {c}%'
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
          data : diskNameArr,
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
          barWidth: 16,
          data:diskUsedArr,
          
        }
      ]
    }
    return (
      <div id='Ordinary'>
        <Row className="title">空间 :{spaceName} - {clusterName}集群</Row>
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
          <Col span={10} className='sysState'>
            <Card title="系统状态和版本" bordered={false} bodyStyle={{height:220}}>
              <table>
                <tbody>
                <tr>
                  <td>
                    <img className="stateImg" src="/img/homeKubernetes.png"/>
                    Kubernetes
                  </td>
                  <td>
                    <SvcState currentState={clusterSysinfo.k8s.status} />
                  </td>
                  <td style={{textAlign:'right',paddingRight:10}}>
                    {clusterSysinfo.k8s.version}
                  </td>
                </tr>
                <tr>
                  <td>
                    <svg className="stateSvg">
                      <use xlinkHref="#homewww" />
                    </svg>
                    DNS
                  </td>
                  <td>
                    <SvcState currentState={clusterSysinfo.dns.status} />
                  </td>
                  <td style={{textAlign:'right',paddingRight:10}}>
                    {clusterSysinfo.dns.version}
                  </td>
                </tr>
                <tr>
                  <td>
                    <svg className="stateSvg">
                      <use xlinkHref="#homeapiservice" />
                    </svg>
                    API Server
                  </td>
                  <td>
                    <SvcState currentState={clusterSysinfo.apiserver.status} />
                  </td>
                  <td style={{textAlign:'right',paddingRight:10}}>
                    {clusterSysinfo.apiserver.version}
                  </td>
                </tr>
                <tr>
                  <td>
                    <svg className="stateSvg">
                      <use xlinkHref="#cicd" />
                    </svg>
                    CICD
                  </td>
                  <td>
                    <SvcState currentState={clusterSysinfo.cicd.status} />
                  </td>
                  <td style={{textAlign:'right',paddingRight:10}}>
                    {clusterSysinfo.cicd.version}
                  </td>
                </tr>
                <tr>
                  <td>
                    <svg className="stateSvg">
                      <use xlinkHref="#homeLogging" />
                    </svg>
                    Logging
                  </td>
                  <td>
                    <SvcState currentState={clusterSysinfo.logging.status} />
                  </td>
                  <td style={{textAlign:'right',paddingRight:10}}>
                    {clusterSysinfo.logging.version}
                  </td>
                </tr>
                </tbody>
              </table>
            </Card>
          </Col>
          <Col span={6} className='clusterRecord'>
            <Card title="今日该集群记录" bordered={false} bodyStyle={{height:220}}>
              <div style={{overflowY:'auto',height:'172px'}}>
                <table>
                  <tbody>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#homeappcount" />
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
                        <use xlinkHref="#homeappcount" />
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
                        <use xlinkHref="#homeappcount" />
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
                        <use xlinkHref="#homeappcount" />
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
                        <use xlinkHref="#homeappcount" />
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
                        <use xlinkHref="#homeservicecount" />
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
                        <use xlinkHref="#homeservicecount" />
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
                        <use xlinkHref="#homesavecount" />
                      </svg>
                      创建存储卷个数
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {clusterOperations.volumeCreate}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#homesavecount" />
                      </svg>
                      删除存储卷个数
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {clusterOperations.volumeDelete}个
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
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
                option={serviceOption}
                style={{height:'200px'}}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="容器" bordered={false} bodyStyle={{height:200,padding:'0 24px'}}>
              <ReactEcharts
                notMerge={true}
                option={containerOption}
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
                    <Col span={12} style={{textAlign:'right'}}>{this.handleSize(clusterStorage.usedSize)}</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>空闲:</Col>
                    <Col span={12} style={{textAlign:'right'}}>{this.handleSize(clusterStorage.freeSize)}</Col>
                  </Row>
                  <Row className='storageInfItem'>
                    <Col span={12}>存储卷:</Col>
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
              <Row style={{display: this.state.tab1?'block':'none',height:130}}>
                <Col span={12} className='dbImg'>
                  <img src="/img/homeMySQL.png" alt="MySQL"/>
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中:
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {mySQLRunning}个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#a2d7ff'}}></div>
                        已停止
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {mySQLStopped}个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {mySQLOthers}个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{display: this.state.tab2?'block':'none',height:130}}>
                <Col span={12} className='dbImg'>
                  <img src="/img/homeMongoCluster.png" alt="MongoCluster"/>
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中:
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {mongoRunning}个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#a2d7ff'}}></div>
                        已停止
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {mongoStopped}个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {mongoOthers}个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{display: this.state.tab3?'block':'none',height:130}}>
                <Col span={12} className='dbImg'>
                  <img src="/img/homeRedis.png" alt="Redis"/>
                </Col>
                <Col span={12} className='dbInf'>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#46b2fa'}}></div>
                        运行中:
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {redisRunning}个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#a2d7ff'}}></div>
                        已停止
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {redisStopped}个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#28bd83'}}></div>
                        操作中
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {redisOthers}个
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
                        {clusterNodeSummary.nodeInfo.total}个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#2abe84'}}></div>
                        健康主机数
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {clusterNodeSummary.nodeInfo.health}个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="stateDot" style={{backgroundColor:'#a2d8fa'}}></div>
                        未启用主机数
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {clusterNodeSummary.nodeInfo.unused}个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <MySpace spaceName={spaceName} />
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

function getDbServiceStatus(data) {
  let dbServiceMap = new Map()
  dbServiceMap.set("mysql", new Map())
  dbServiceMap.set("mongo", new Map())
  dbServiceMap.set("redis", new Map())

  data.petSets.map(petSet => {
    let key = "unknown"
    if (petSet.objectMeta && petSet.objectMeta.labels
      && petSet.objectMeta.labels.appType) {
      key = petSet.objectMeta.labels.appType
    }

    let map = dbServiceMap.get(key)
    if (map && petSet.pods) {
      if (petSet.pods.failed != 0) {
        setMap(map, "failed")
      } else if (petSet.pods.pending != 0) {
        setMap(map, "pending")
      } else if (petSet.pods.running == petSet.pods.desired) {
        setMap(map, "running")
      } else {
        setMap(map, "unknown")
      }
    }
  })

  for (let [key, map] of dbServiceMap) {
    console.log(key, " status: ")
    for (let [status, count] of map) {
      console.log("---", status, ": ", count)
    }
  }

  return dbServiceMap
}

function mapStateToProp(state,props) {
  const { current } = state.entities
  let clusterOperationsData = {
    appCreate: 0,
    appModify: 0,
    svcCreate: 0,
    svcDelete: 0,
    appStop: 0,
    appStart: 0,
    appRedeploy: 0,
    volumeCreate: 0,
    volumeDelete: 0,
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
  let clusterDbServicesData = new Map()
  clusterDbServicesData.set("mysql", new Map())
  clusterDbServicesData.set("mongo", new Map())
  clusterDbServicesData.set("redis", new Map())
  
  let clusterNodeSummaryData = {
    nodeInfo: {
      total: 0,
      health: 0,
      unused: 0
    },
    cpu: [],
    memory: [],
    storage: [],
  }

  const {clusterOperations, clusterSysinfo, clusterStorage,
    clusterAppStatus, clusterDbServices, clusterNodeSummary, clusterInfo} = state.overviewCluster
  if (clusterInfo.result && clusterInfo.result) {
    if (clusterInfo.result.operations) {
      if (clusterInfo.result.operations.app) {
        let data = clusterInfo.result.operations.app
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
      if (clusterInfo.result.operations.volume) {
        let data = clusterInfo.result.operations.volume
        if (data.volumeCreate) {
          clusterOperationsData.volumeCreate = data.volumeCreate
        }
        if (data.volumeDelete) {
          clusterOperationsData.volumeDelete = data.volumeDelete
        }
      }
    }
    if (clusterInfo.result.sysinfo) {
      let data = clusterInfo.result.sysinfo
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
    if (clusterInfo.result.storage) {
      let data = clusterInfo.result.storage
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
    if (clusterInfo.result.appstatus) {
      let data = clusterInfo.result.appstatus
      clusterAppStatusData = getStatus(data)
    }
    if (clusterInfo.result.dbservices) {
      let data = clusterInfo.result.dbservices
      clusterDbServicesData = getDbServiceStatus(data)
    }
    if (clusterInfo.result.nodesummary) {
      clusterNodeSummaryData = clusterInfo.result.nodesummary
    }
  }
  return {
    current,
    clusterOperations: clusterOperationsData,
    clusterSysinfo: clusterSysinfoData,
    clusterStorage: clusterStorageData,
    clusterAppStatus: clusterAppStatusData,
    clusterDbServices: clusterDbServicesData,
    clusterNodeSummary: clusterNodeSummaryData,
  }
}

export default connect(mapStateToProp, {
  loadClusterInfo,
})(Ordinary)