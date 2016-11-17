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
import { Row, Col, Card, Timeline } from 'antd'
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
              <div>
                <Row className="teamInfItem">
                  <Col span={12} style={{padding:'0 20px',}}>
                    <Col span={13}>
                      <svg className="teamInfSvg" style={{marginRight:10}}>
                        <use xlinkHref="#settingname" />
                      </svg>
                      空间数
                    </Col>
                    <Col span={11} style={{textAlign:'right'}}>
                      100个
                    </Col>
                  </Col>
                  <Col span={12} style={{padding:'0 20px',}}>
                    <Col span={11}>
                      <svg className="teamInfSvg" style={{marginRight:10}}>
                        <use xlinkHref="#settingname" />
                      </svg>
                      镜像数
                    </Col>
                    <Col span={13} style={{textAlign:'right'}}>
                      9999个
                    </Col>
                  </Col>
                </Row>
                <Row className="teamInfItem">
                  <Col span={12} style={{padding:'0 20px',}}>
                    <Col span={13}>
                      <svg className="teamInfSvg" style={{marginRight:10}}>
                        <use xlinkHref="#settingname" />
                      </svg>
                      应用数
                    </Col>
                    <Col span={11} style={{textAlign:'right'}}>
                      100个
                    </Col>
                  </Col>
                  <Col span={12} style={{padding:'0 20px',}}>
                    <Col span={13}>
                      <svg className="teamInfSvg" style={{marginRight:10}}>
                        <use xlinkHref="#settingname" />
                      </svg>
                      编排数
                    </Col>
                    <Col span={11} style={{textAlign:'right'}}>
                      9999个
                    </Col>
                  </Col>
                </Row>
                <Row className="teamInfItem">
                  <Col span={12} style={{padding:'0 20px',}}>
                    <Col span={13}>
                      <svg className="teamInfSvg" style={{marginRight:10}}>
                        <use xlinkHref="#settingname" />
                      </svg>
                      服务数
                    </Col>
                    <Col span={11} style={{textAlign:'right'}}>
                      100个
                    </Col>
                  </Col>
                  <Col span={12} style={{padding:'0 20px',}}>
                    <Col span={13}>
                      <svg className="teamInfSvg" style={{marginRight:10}}>
                        <use xlinkHref="#settingname" />
                      </svg>
                      存储卷数
                    </Col>
                    <Col span={11} style={{textAlign:'right'}}>
                      9999个
                    </Col>
                  </Col>
                </Row>
                <Row className="teamInfItem">
                  <Col span={12} style={{padding:'0 20px',}}>
                    <Col span={13}>
                      <svg className="teamInfSvg" style={{marginRight:10}}>
                        <use xlinkHref="#settingname" />
                      </svg>
                      容器数
                    </Col>
                    <Col span={11} style={{textAlign:'right'}}>
                      100个
                    </Col>
                  </Col>
                  <Col span={12} style={{padding:'0 20px',}}>
                    <Col span={13}>
                      <svg className="teamInfSvg" style={{marginRight:10}}>
                        <use xlinkHref="#settingname" />
                      </svg>
                      构建项目数
                    </Col>
                    <Col span={11} style={{textAlign:'right'}}>
                      9999个
                    </Col>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={11}>
            <Card title="本日该团队消费" bordered={false} bodyStyle={{height:170}}>
              <Col span={10}>
                
              </Col>
              <Col span={14}>
                <Row>
                  <Col span={16} style={{paddingLeft:40}}>空间名称</Col>
                  <Col span={8}>消费金额</Col>
                </Row>
                <Timeline>
                  <Timeline.Item>创建服务现场 2015-09-01</Timeline.Item>
                  <Timeline.Item>初步排除网络异常 2015-09-01</Timeline.Item>
                  <Timeline.Item>技术测试异常 2015-09-01</Timeline.Item>
                  <Timeline.Item>网络异常正在修复 2015-09-01</Timeline.Item>
                </Timeline>
              </Col>
            </Card>
          </Col>
          <Col span={5}></Col>
        </Row>
      </div>
    )
  }
}