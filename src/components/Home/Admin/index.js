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
import { Row, Col, Card, Timeline, } from 'antd'
import './style/Admin.less'

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
              <Col span={10}>
                
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
                      <svg className="teamRecSvg" style={{marginRight:10}}>
                        <use xlinkHref="#settingname" />
                      </svg>
                      创建应用数量
                    </td>
                    <td>
                      1000个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Col span={18}>
                        <svg className="teamRecSvg" style={{marginRight:10}}>
                          <use xlinkHref="#settingname" />
                        </svg>
                        创建应用数量
                      </Col>
                      <Col span={6}>1000个</Col>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Col span={18}>
                        <svg className="teamRecSvg" style={{marginRight:10}}>
                          <use xlinkHref="#settingname" />
                        </svg>
                        创建应用数量
                      </Col>
                      <Col span={6}>1000个</Col>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Col span={18}>
                        <svg className="teamRecSvg" style={{marginRight:10}}>
                          <use xlinkHref="#settingname" />
                        </svg>
                        创建应用数量
                      </Col>
                      <Col span={6}>1000个</Col>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Col span={18}>
                        <svg className="teamRecSvg" style={{marginRight:10}}>
                          <use xlinkHref="#settingname" />
                        </svg>
                        创建应用数量
                      </Col>
                      <Col span={6}>1000个</Col>
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