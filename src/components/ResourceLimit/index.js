/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * quota
 *
 * v0.1 - 2017-09-19
 * @author Zhaoyb
 */
import React from 'react'
import { connect } from 'react-redux'
import './style/index.less'
import { Tabs, Table, Button, Icon, Input, Modal, Row, Col, Transfer, Tooltip, Dropdown, Menu, Progress, Select, Checkbox } from 'antd'

class ResourceQuota extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      isProject: false,
    }
  }
  componentWillMount() {
    const { isProject } = this.props
    this.setState({
      isProject
    })
  }
  render() {
    const { isProject } = this.state
    const menu = (
      <Menu>
        <Menu.Item>
          <span>第一个菜单项</span>
        </Menu.Item>
        <Menu.Item>
          <span>第二个菜单项</span>
        </Menu.Item>
        <Menu.Item>
          <span>第三个菜单项</span>
        </Menu.Item>
      </Menu>
    )
    const computeList = ['CPU （核）', '内存（GB）', '磁盘（GB）']
    const platformList = ['应用（个）', '服务（个）', '容器（个）', '存储（个）', '快照（个）', '服务配置（个）']
    const serviceList = ['关系型数据库（个）', '缓存（个）', 'Zookeeper（个）', 'ElasticSearch（个）']
    return (
      <div className="quota">
        {
          !isProject ?
            <div className="alertRow">
              <span>以下为个人项目的资源配额使用情况，了解该成员参与的其他项目资源配额使用情况点击 <span>共享项目资源配额</span>进入项目详情查看</span>
            </div> : <div></div>
        }
        <div className="topDesc">
          <div className="titles"><span>项目全局资源配额</span></div>
        </div>
        <Button size="large" className="btn" type="primary">编辑</Button>
        <div className="connent">
          <div className="overall">
            <span>CI/CD</span>
            <Row className="list">
              <Col span={2}>
                <span>Tencfilow（个）</span>
              </Col>
              <Col span={8}>
                <Progress percent={30} showInfo={false} />
              </Col>
              <Col span={4}>
                <span>2/5（个）</span>
              </Col>
            </Row>
            <Row className="list">
              <Col span={2}>
                <span>子任务（个）</span>
              </Col>
              <Col span={8}>
                <Progress percent={30} showInfo={false} />
              </Col>
              <Col span={4}>
                <span>2/5（个）</span>
              </Col>
            </Row>
            <Row className="list">
              <Col span={2}>
                <span>Dockerfile（个）</span>
              </Col>
              <Col span={8}>
                <Progress percent={30} showInfo={false} />
              </Col>
              <Col span={4}>
                <span>2/5（个）</span>
              </Col>
            </Row>
            <p className="line"></p>
            <Row className="list">
              <Col span={2}>
                <span>镜像仓库组（个）</span>
              </Col>
              <Col span={8}>
                <Progress percent={30} showInfo={false} />
              </Col>
              <Col span={4}>
                <span>2/5（个）</span>
              </Col>
            </Row>
            <Row className="list">
              <Col span={2}>
                <span>镜像仓库（个）</span>
              </Col>
              <Col span={8}>
                <Progress percent={30} showInfo={false} />
              </Col>
              <Col span={4}>
                <span>2/5（个）</span>
              </Col>
            </Row>
            <Row className="list">
              <Col span={2}>
                <span>编排文件（个）</span>
              </Col>
              <Col span={8}>
                <Progress percent={30} showInfo={false} />
              </Col>
              <Col span={4}>
                <span>2/5（个）</span>
              </Col>
            </Row>
            <Row className="list">
              <Col span={2}>
                <span>应用包（个）</span>
              </Col>
              <Col span={8}>
                <Progress percent={30} showInfo={false} />
              </Col>
              <Col span={4}>
                <span>2/5（个）</span>
              </Col>
            </Row>
          </div>
        </div>
        <div className="colony">
          <div className="top">
            <div className="titles">项目集群相关资源配额</div>
            <Dropdown overlay={menu}>
              <span className="desc">默认集群 <Icon type="down" /></span>
            </Dropdown>
          </div>
          <div className="header">
            <Button size="large" className="close">取消</Button>
            <Button size="large" className="save" type="primary">保存</Button>
            <span className="header_desc">修改配额，将修改 <p className="sum">1</p> 个资源配额</span>
          </div>
          <div className="list">
            <div className="compute">
              <span>计算资源</span>
              {
                computeList.map((item, index) => (
                  <Row key={index} className="connents">
                    <Col span={2}>
                      <span>{item}</span>
                    </Col>
                    <Col span={6}>
                      <Input />
                    </Col>
                    <Col span={3}>
                      <Checkbox>无限制</Checkbox>
                    </Col>
                    <Col span={4}>
                      <span>配额剩余：3</span>
                    </Col>
                    <Col span={4}>
                      <span>该集群剩余：2</span>
                    </Col>
                  </Row>
                ))
              }
            </div>
            <div className="platform">
              <span>平台资源</span>
              {
                platformList.map((item, index) => (
                  <Row key={index} className="connents">
                    <Col span={2}>
                      <span>{item}</span>
                    </Col>
                    <Col span={6}>
                      <Input />
                    </Col>
                    <Col span={3}>
                      <Checkbox>无限制</Checkbox>
                    </Col>
                    <Col span={4}>
                      <span>配额剩余：3</span>
                    </Col>
                    <Col span={4}>
                      <span>该集群剩余：2</span>
                    </Col>
                  </Row>
                ))
              }
            </div>
            <p className="line"></p>
            <div className="service">
              <span>数据库与缓存</span>
              {
                serviceList.map((item, index) => (
                  <Row key={index} className="connents">
                    <Col span={3}>
                      <span>{item}</span>
                    </Col>
                    <Col span={6}>
                      <Input />
                    </Col>
                    <Col span={3}>
                      <Checkbox>无限制</Checkbox>
                    </Col>
                    <Col span={4}>
                      <span>配额剩余：3</span>
                    </Col>
                    <Col span={4}>
                      <span>该集群剩余：2</span>
                    </Col>
                  </Row>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, {
})(ResourceQuota)
