/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/10
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Icon, } from 'antd'
import './style/Version.less'

export default class Version extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id='Version'>
        <Row className="title">
          <Col>平台版本</Col>
        </Row>
        <Row className="content">
          <Card>
            <Row className="versionWrap">
              <div className="versionTitle">
                <Icon type="cloud-o" style={{marginRight:8}}/>
                <span className="infSvgTxt">
                  云平台版本
                </span>
              </div>
              <div className="versionContent">
                <Row className="contentTop">
                    <Col span={8}>
                      <svg className="infSvg" style={{marginRight:8}}>
                        <use xlinkHref="#settingname" />
                      </svg>
                      <span className="infSvgTxt">系统名称</span>
                    </Col>
                    <Col span={8}>
                      <svg className="infSvg" style={{marginRight:8}}>
                        <use xlinkHref="#settingperspace" />
                      </svg>
                      <span className="infSvgTxt">对应名称</span>
                    </Col>
                    <Col span={8}>
                      <Icon type="tag" style={{marginRight:8}}/>
                      <span className="infSvgTxt">版本</span>
                    </Col>
                  </Row>
                <Row className='contentList firstItem'>
                  <Col span={8}>TenxCloud Admin Console</Col>
                  <Col span={8}>管理运维平台</Col>
                  <Col span={8}>2.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>TenxCloud User Portal</Col>
                  <Col span={8}>用户使用中心</Col>
                  <Col span={8}>2.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>TenxCloud Application Center</Col>
                  <Col span={8}>应用中心</Col>
                  <Col span={8}>2.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>TenxCloud Container Engine</Col>
                  <Col span={8}>容器引擎</Col>
                  <Col span={8}>2.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>TenxCloud CI/CD Center</Col>
                  <Col span={8}>持续集成交付中心</Col>
                  <Col span={8}>2.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>TenxCloud API Gateway</Col>
                  <Col span={8}>API 网关中心</Col>
                  <Col span={8}>2.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>TenxCloud Integration Center</Col>
                  <Col span={8}>集成中心</Col>
                  <Col span={8}>2.0</Col>
                </Row>
              </div>
            </Row>
          </Card>
        </Row>
        <Row className="content">
          <Card>
            <Row className="versionWrap">
              <div className="versionTitle">
                <svg className="infSvg" style={{marginRight:8}}>
                  <use xlinkHref="#settingownteam" />
                </svg>
                <span className="infSvgTxt">
                  基础系统版本
                </span>
              </div>
              <div className="versionContent">
                <Row className="contentTop">
                  <Col span={8}>
                    <svg className="infSvg" style={{marginRight:8}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    <span className="infSvgTxt">系统名称</span>
                  </Col>
                  <Col span={8}>
                    <Icon type="tag" style={{marginRight:8}}/>
                    <span className="infSvgTxt">版本</span>
                  </Col>
                </Row>
                <Row className='contentList firstItem'>
                  <Col span={8}>kubernetes</Col>
                  <Col span={8}>2.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>etcd</Col>
                  <Col span={8}>2.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>docker</Col>
                  <Col span={8}>2.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>registry</Col>
                  <Col span={8}>2.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>AppStore</Col>
                  <Col span={8}>2.0</Col>
                </Row>
              </div>
            </Row>
          </Card>
        </Row>
      </div>
    )
  }
}