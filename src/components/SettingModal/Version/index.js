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
import Title from '../../Title'
import QueueAnim from 'rc-queue-anim'
import TenxIcon from '@tenx-ui/icon/es/_old'

export default class Version extends Component{
  constructor(props){
    super(props)
    this.state = {

    }
  }
  render(){
    return (
      <QueueAnim>
      <div id='Version' key='Version'>
        <Title title="平台版本" />
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
                      <TenxIcon type="syc-name" className="sysName"/>
                      <span className="infSvgTxt">系统名称</span>
                    </Col>
                    <Col span={8}>
                      <TenxIcon type="setting-tran-name" className="sysName"/>
                      <span className="infSvgTxt">对应名称</span>
                    </Col>
                    <Col span={8}>
                      <Icon type="tag" style={{marginRight:8}}/>
                      <span className="infSvgTxt">版本</span>
                    </Col>
                  </Row>
                <Row className='contentList firstItem'>
                  <Col span={8}>User Portal</Col>
                  <Col span={8}>用户使用中心</Col>
                  <Col span={8}>v4.0.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>Application Center</Col>
                  <Col span={8}>应用中心</Col>
                  <Col span={8}>v4.0.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>Container Engine</Col>
                  <Col span={8}>容器引擎</Col>
                  <Col span={8}>v4.0.0</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>CI/CD Center</Col>
                  <Col span={8}>持续集成交付中心</Col>
                  <Col span={8}>v4.0.0</Col>
                </Row>
                {/*<Row className='contentList'>
                  <Col span={8}>API Gateway</Col>
                  <Col span={8}>API 网关中心</Col>
                  <Col span={8}>2.0</Col>
                </Row>*/}
                <Row className='contentList'>
                  <Col span={8}>Integration Center</Col>
                  <Col span={8}>集成中心</Col>
                  <Col span={8}>v4.0.0</Col>
                </Row>
              </div>
            </Row>
          </Card>
        </Row>
        <Row className="content">
          <Card>
            <Row className="versionWrap">
              <div className="versionTitle">
                <TenxIcon type="computer"/>

                <span className="infSvgTxt">
                  基础系统版本
                </span>
              </div>
              <div className="versionContent">
                <Row className="contentTop">
                  <Col span={8}>
                    <TenxIcon type="syc-name" className="sysName"/>
                    <span className="infSvgTxt">系统名称</span>
                  </Col>
                  <Col span={8}>
                    <Icon type="tag" style={{marginRight:8}}/>
                    <span className="infSvgTxt">版本</span>
                  </Col>
                </Row>
                <Row className='contentList firstItem'>
                  <Col span={8}>Kubernetes</Col>
                  <Col span={8}>v1.12.3</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>Etcd</Col>
                  <Col span={8}>v3.2.24</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>Docker</Col>
                  <Col span={8}>18.06.1-ce</Col>
                </Row>
                <Row className='contentList'>
                  <Col span={8}>Registry</Col>
                  <Col span={8}>Harbor 1.5.1 based</Col>
                </Row>
              </div>
            </Row>
          </Card>
        </Row>
      </div>
      </QueueAnim>
    )
  }
}
