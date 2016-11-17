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
import './style/Admin.less'
import ReactEcharts from 'echarts-for-react'


let cost = 100
let rest = 900
let option = {
  title: {
    text: '余额 :  '+rest+'T币\n\n消费 :  '+cost+'T币',
    x:'center',
    top: '40%',
    textStyle:{
      color :'#6c6c6c',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '14',
    }
  },
  color: ['#46b2fa', '#2abe84'],
  backgroundColor: '#fff',
  tooltip: {
    trigger: 'item',
    formatter: "{b}: {c}<br/> ({d}%)"
  },
  legend: {
    orient: 'vertical',
    x: '50%',
    top: 10,
    data:['余额','消费'],
    show: false
  },
  series: [
    {
      name:'本日该团队消费',
      type:'pie',
      radius: ['28', '40'],
      center: ['50%','20%'],
      avoidLabelOverlap: false,
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
      hoverAnimation: false,
      selectedOffset: 10,
      label: {
        normal: {
          show: false,
          position: 'center'
        },
        emphasis: {
          show: true,
          formatter: function (param) {
            return param.percent.toFixed(0) + '%';
          },
          textStyle: {
            fontSize: '14',
            fontWeight: 'normal'
          }
        }
      },
      labelLine: {
        normal: {
          show: true
        }
      },
      data:[
        {value:900, name:'余额'},
        {value:100, name:'消费'},
      ]
    }
  ]
}


export default class Admin extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id='Admin'>
        <Row className="title">空间对应的团队</Row>
        <Row className="content" gutter={16}>
          <Col span={8} className='teamInf'>
            <Card title="团队信息总览" bordered={false} bodyStyle={{height:170}}>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    空间数
                  </div>
                  <div style={{textAlign:'right'}} className='tabCell'>
                    100个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    镜像数
                  </div>
                   <div style={{textAlign:'right'}} className='tabCell'>
                    9999个
                  </div>
                </Col>
              </Row>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    应用数
                  </div>
                  <div style={{textAlign:'right'}} className='tabCell'>
                    100个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    编排数
                  </div>
                   <div style={{textAlign:'right'}} className='tabCell'>
                    9999个
                  </div>
                </Col>
              </Row>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    服务数
                  </div>
                  <div style={{textAlign:'right'}} className='tabCell'>
                    100个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    存储卷数
                  </div>
                   <div style={{textAlign:'right'}} className='tabCell'>
                    9999个
                  </div>
                </Col>
              </Row>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    容器数
                  </div>
                  <div style={{textAlign:'right'}} className='tabCell'>
                    100个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    构建项目数
                  </div>
                   <div style={{textAlign:'right'}} className='tabCell'>
                    9999个
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={11} className='teamCost'>
            <Card title="本日该团队消费" bordered={false} bodyStyle={{height:170}}>
              <Col span={10} style={{height:170}}>
                  <ReactEcharts
                    notMerge={true}
                    option={option}
                  />
              </Col>
              <Col span={14} className='teamCostList'>
                <Row className="teamCostListTitle">
                  <Col span={16} style={{paddingLeft:40,height:40,lineHeight:'40px'}}>空间名称</Col>
                  <Col span={8} style={{height:40,lineHeight:'40px'}}>消费金额</Col>
                </Row>
                <Row className='teamCostListContent'>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                </Row>
              </Col>
            </Card>
          </Col>
          <Col span={5} className='teamRecord'>
            <Card title="今日该团队记录" bordered={false} bodyStyle={{height:170, overflowY:'auto'}}>
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
      </div>
    )
  }
}