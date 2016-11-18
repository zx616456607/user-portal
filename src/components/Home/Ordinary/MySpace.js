/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/18
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Timeline, Popover } from 'antd'
import './style/MySpace.less'
import ReactEcharts from 'echarts-for-react'

let imageOption = {
  series: [{
    type: 'gauge',
    startAngle: 180,
    endAngle: 0,
    min: 0,
    max: 100,
    splitNumber: 1,
    radius: '155%',
    center: ['50%', 'bottom'],
    pointer: {
      show: false,
      width: 0
    },
    axisLine: {
      lineStyle: {
        width: 16,
        color: [[0.3, "#13c563"], [0.32,'#fff'],[1, "#46b2fa"]]
      }
    },
    splitLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel : {
      show: false,
    }
  }]
}
let layoutOption = {
  series: [{
    type: 'gauge',
    startAngle: 180,
    endAngle: 0,
    min: 0,
    max: 100,
    splitNumber: 1,
    radius: '155%',
    center: ['50%', 'bottom'],
    pointer: {
      show: false,
      width: 0
    },
    axisLine: {
      lineStyle: {
        width: 16,
        color: [[0.3, "#13c563"], [0.32,'#fff'],[1, "#46b2fa"]]
      }
    },
    splitLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel : {
      show: false,
    }
  }]
}
export default class MySpace extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id='MySpace'>
        <Row className="title" style={{marginTop: 40}}>我的空间</Row>
        <Row className="content" gutter={16} style={{marginBottom: 100}}>
          <Col span={6}>
            <Card title="镜像仓库" bordered={false} bodyStyle={{height:175,padding:'0',position:'relative'}}>
              <ReactEcharts
                notMerge={true}
                option={imageOption}
                style={{height:'90px'}}
              />
              <div style={{position:'absolute',top:'66px',width:'100%',textAlign:'center'}}>100个</div>
              <Row style={{textAlign:'center',height:40,lineHeight:'40px',padding:'0 24px'}}>
                <Col span={12}>公有25个</Col>
                <Col span={12}>私有75个</Col>
              </Row>
              <Row style={{height:40,lineHeight:'40px',borderTop:'1px solid #e2e2e2',padding:'0 24px'}}>
                服务状态:
                <div style={{float:'right'}}>
                  <svg className="stateSvg">
                    <use xlinkHref="#settingname" />
                  </svg>
                  健康
                </div>
              </Row>
            </Card>
            <Card title="编排概况" bordered={false} bodyStyle={{height:175}} style={{marginTop: 10}}>
              <ReactEcharts
                notMerge={true}
                option={layoutOption}
                style={{height:'90px'}}
              />
            </Card>
          </Col>
          <Col span={6} className='cdid'>
            <Card title="CI/CD" bordered={false} bodyStyle={{height:175,padding:0}}>
              <Row style={{height:130}}>
                <table>
                  <tbody>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      主机总数
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      12346个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      健康主机数
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      12340个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      未启用主机数
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      6个
                    </td>
                  </tr>
                  </tbody>
                </table>
              </Row>
              <Row style={{height:40,lineHeight:'40px',borderTop:'1px solid #e2e2e2',padding:'0 24px'}}>
                服务状态:
                <div style={{float:'right'}}>
                  <svg className="stateSvg">
                    <use xlinkHref="#settingname" />
                  </svg>
                  健康
                </div>
              </Row>
            </Card>
            <Card title="今日该集群记录" bordered={false} bodyStyle={{height:175, overflowY:'auto'}} style={{marginTop: 10}}>
              <table className="clusterTab">
                <tbody>
                <tr>
                  <td>
                    <svg className="stateSvg">
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
                    <svg className="stateSvg">
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
                    <svg className="stateSvg">
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
                    <svg className="stateSvg">
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
          <Col span={6} className='log'>
            <Card title="审计日志" bordered={false} bodyStyle={{height:410}}>
              <Timeline style={{height:350}}>
                <Timeline.Item dot={<svg className="stateSvg"><use xlinkHref="#settingname" /></svg>}>
                  <div className="logItem">
                    <div className="logTitle">停用应用</div>
                    <div className="logInf">
                      刚刚
                      <div className="logTime">持续一秒</div>
                    </div>
                  </div>
                </Timeline.Item>
                <Timeline.Item>
                  <div className="logItem">
                    <div className="logTitle">停用应用</div>
                    <div className="logInf">
                      刚刚
                      <div className="logTime">持续一秒</div>
                    </div>
                  </div>
                </Timeline.Item>
                <Timeline.Item>
                  <div className="logItem">
                    <div className="logTitle">停用应用</div>
                    <div className="logInf">
                      刚刚
                      <div className="logTime">持续一秒</div>
                    </div>
                  </div>
                </Timeline.Item>
                <Timeline.Item>
                  <div className="logItem">
                    <div className="logTitle">停用应用</div>
                    <div className="logInf">
                      刚刚
                      <div className="logTime">持续一秒</div>
                    </div>
                  </div>
                </Timeline.Item>
              </Timeline>
              <Row style={{height:40,lineHeight:'40px',borderTop:'1px solid #e2e2e2',padding:'0 24px',fontSize:'12px'}}>
                查看更多 >>
              </Row>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="告警" bordered={false} bodyStyle={{height:410}}>
              <Timeline>
                <Timeline.Item dot={
                  <svg id="stateSvg"><use xlinkHref="#settingname" /></svg>
                }>
                  <Popover content={
                    <div>
                      <Row>API Server发生故障</Row>
                      <Row>刚刚</Row>
                    </div>
                  } title="标题" visible={true}
                           placement="right"
                           getTooltipContainer={() => document.getElementById('posDiv')}
                  >
                    <div style={{width:1,height:1}} id="posDiv">121212</div>
                  </Popover>
                </Timeline.Item>
                <Timeline.Item>初步排除网络异常 2015-09-01</Timeline.Item>
                <Timeline.Item>技术测试异常 2015-09-01</Timeline.Item>
                <Timeline.Item>网络异常正在修复 2015-09-01</Timeline.Item>
              </Timeline>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}