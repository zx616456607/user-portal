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
import { putGlobaleQuota, putClusterQuota } from '../../actions/quota'

class ResourceQuota extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      gIsEdit: false,
      cIsEdit: false,
      isProject: false,
      isDisabled: false,
      tenxflow: false,
      subTask: false,
      dockerfile: false,
      registryProject: false,
      registry: false,
      orchestrationTemplate: false,
      applicationPackage: false,
      cpu: false,
      memory: false,
      storage: false,
      application: false,
      service: false,
      container: false,
      volume: false,
      snapshot: false,
      configuration: false,
      mysql: false,
      redis: false,
      zookeeper: false,
      elasticsearch: false,
    }
  }
  componentWillMount() {
    const { isProject } = this.props
    this.setState({
      isProject
    })
  }
  /**
   * 编辑
   */
  handleGlobaleEdit() {
    this.setState({
      gIsEdit: true
    })
  }
  /**
   * 提示 Ok
   */
  handleOk() {
    this.setState({
      visible: false
    })
  }
  /**
   * 提示 Cancel
   */
  handleClose() {
    this.setState({
      visible: false
    })
  }
  /**
   * 全局 Cancel
   */
  handleGlobaleClose() {
    this.setState({
      gIsEdit: false
    })
  }
  /**
   * 全局 Ok
   */
  handleGlobaleSave() {
    this.setState({
      gIsEdit: false
    })
  }
  /**
   * 集群 Cancel
   */
  handleClusterClose() {
    this.setState({
      cIsEdit: false
    })
  }
  /**
   * 集群 Ok
   */
  handleClusterOk() {
    this.setState({
      cIsEdit: false
    })
  }
  /**
   * 集群 Edit
   */
  handleClusterEdit() {
    this.setState({
      cIsEdit: true
    })
  }
  handleCheckd(e){
    this.setState({
      isDisabled: e.target.checked
    })
  }

  render() {
    const { isProject, gIsEdit, cIsEdit, isDisabled } = this.state
    const { data } = this.props
    //默认集群
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
    const ciList = ['Tencfilow (个)','子任务 (个)','Dockerfile (个)']
    const ciName = ['Tencfilow','subTask','dockerfile']
    const cdList = ['镜像仓库组 (个)','镜像仓库 (个)','编排文件 (个)','应用包 (个)']
    const cdName = ['registryProject','registry','orchestrationTemplate','applicationPackage']
    const computeList = [{cpu:'CPU （核）'}, {memory:'内存（GB）'}, {storage:'磁盘（GB）'}]
    const platformList = [{application:'应用 (个)'}, {service:'服务 (个)'}, {container:'容器 (个)'}, {volume:'存储 (个)'}, {snapshot:'快照 (个)'}, {configuration:'服务配置 (个)'}]
    const serviceList = [{mysql:'关系型数据库 (个)'}, {redis:'缓存 (个)'}, {zookeeper:'Zookeeper (个)'}, {elasticsearch:'ElasticSearch (个)'}]
    return (
      <div className="quota">
        {
          !isProject ?
            <div className="alertRow">
              <span>以下为个人项目的资源配额使用情况，了解该成员参与的其他项目资源配额使用情况点击 <a className="wichtige" href="#">共享项目资源配额</a> 进入项目详情查看</span>
            </div> : <div></div>
        }
        <div className="topDesc">
          <div className="titles"><span>项目全局资源配额</span></div>
        </div>
        {
          gIsEdit ?
            <div className="globaleEdit">
              <Button size="large" className="close" onClick={() => this.handleGlobaleClose()}>取消</Button>
              <Button size="large" className="save" type="primary" onClick={this.handleGlobaleSave}>保存</Button>
            </div> :
            <Button size="large" className="btn" type="primary" onClick={() => this.handleGlobaleEdit()}>编辑</Button>
        }
        <div className="connent">
          {
            gIsEdit ?
              <div className="overallEdit">
                <span>CI/CD</span>
                {
                  ciList.map((item, index) => (
                    <Row key={index} className="connents">
                      <Col span={2}>
                        <span>{item}</span>
                      </Col>
                      <Col span={7}>
                        <Input disabled={isDisabled} />
                      </Col>
                      <Col span={3}>
                        <Checkbox onChange={(e) => this.handleCheckd(e)}>无限制</Checkbox>
                      </Col>
                      <Col span={4}>
                        <span>配额剩余：0</span>
                      </Col>
                    </Row>
                  ))
                }
                <p className="line"></p>
                {
                  cdList.map((item, index) => (
                    <Row key={index} className="connents">
                      <Col span={2}>
                        <span>{item}</span>
                      </Col>
                      <Col span={7}>
                        <Input />
                      </Col>
                      <Col span={3}>
                        <Checkbox>无限制</Checkbox>
                      </Col>
                      <Col span={4}>
                        <span>配额剩余：0</span>
                      </Col>
                    </Row>
                  ))
                }
              </div> :
              <div className="overall">
                <span>CI/CD</span>
                {
                  ciList.map((item, index) => (
                    <Row className="list" key={index}>
                      <Col span={2}>
                        <span>{item}</span>
                      </Col>
                      <Col span={8}>
                        <Progress percent={30} showInfo={false} />
                      </Col>
                      <Col span={4}>
                        <span>0/<span>{}</span>（个）</span>
                      </Col>
                    </Row>
                  ))
                }
                <p className="line"></p>
                {
                  cdList.map((item, index) => (
                    <Row className="list" key={index}>
                      <Col span={2}>
                        <span>{item}</span>
                      </Col>
                      <Col span={8}>
                        <Progress percent={30} showInfo={false} />
                      </Col>
                      <Col span={4}>
                        <span>0/<span>{}</span>（个）</span>
                      </Col>
                    </Row>
                  ))
                }
              </div>
          }
        </div>
        <div className="colony">
          <div className="top">
            <div className="titles">项目集群相关资源配额</div>
            <Dropdown overlay={menu}>
              <span className="desc">默认集群 <Icon type="down" /></span>
            </Dropdown>
          </div>
          <div className="header">
            {
              cIsEdit ?
                <div>
                  <Button size="large" className="close" onClick={() => this.handleClusterClose()}>取消</Button>
                  <Button size="large" className="save" type="primary" onClick={() => this.handleClusterOk()}>保存</Button>
                  <span className="header_desc">修改配额，将修改 <p className="sum">1</p> 个资源配额</span>
                </div> :
                <div>
                  <Button size="large" className="edit" type="primary" onClick={() => this.handleClusterEdit()}>编辑</Button>
                  <span className="header_desc">修改配额，将修改 <p className="sum">1</p> 个资源配额</span>
                </div>
            }
          </div>
          <div className="liste">
            {
              cIsEdit ?
                <div className="edit">
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
                </div> :
                <div className="lists">
                  <div className="compute">
                    {
                      computeList.map((item, index) => (
                        <Row className="list" key={index}>
                          <Col span={2}>
                            <span>{item}</span>
                          </Col>
                          <Col span={8}>
                            <Progress percent={30} showInfo={false} />
                          </Col>
                          <Col span={4}>
                            <span>2/5（个）</span>
                          </Col>
                        </Row>
                      ))
                    }
                  </div>
                  <div className="platform">
                    {
                      platformList.map((item, index) => (
                        <Row className="list" key={index}>
                          <Col span={2}>
                            <span>{item}</span>
                          </Col>
                          <Col span={8}>
                            <Progress percent={30} showInfo={false} />
                          </Col>
                          <Col span={4}>
                            <span>2/5（个）</span>
                          </Col>
                        </Row>
                      ))
                    }
                  </div>
                  <p className="line"></p>
                  <div className="service">
                    {
                      serviceList.map((item, index) => (
                        <Row className="list" key={index}>
                          <Col span={2}>
                            <span>{item}</span>
                          </Col>
                          <Col span={8}>
                            <Progress percent={30} showInfo={false} />
                          </Col>
                          <Col span={4}>
                            <span>2/5（个）</span>
                          </Col>
                        </Row>
                      ))
                    }
                  </div>
                </div>
            }
          </div>
        </div>
        <Modal title="超限" visible={this.state.visible}
          ok={() => this.handleOk()}
          onCancel={() => this.handleClose()}
        >
          <div>
            <div className="top">
              <Icon type="exclamation" />
              <span>超过配额，你目前只剩下<p>0个</p>配额</span>
            </div>
            <div className="bottom">
              <span>您可以前往总览或项目详情页面查询当前配额使用情况或联系系统管理员提高配额</span>
            </div>
            <Button className="btn" type="primary">知道了</Button>
          </div>
        </Modal>
      </div>
    )
  }
}
function mapStateToProps(state) {
  const { entities } = state
  const { current } = entities
  return {}
}

export default connect(mapStateToProps, {
  putGlobaleQuota,
  putClusterQuota,
})(ResourceQuota)
