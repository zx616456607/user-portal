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
import { InputNumber, Table, Button, Icon, Input, Modal, Row, Col, Transfer, Tooltip, Dropdown, Menu, Progress, Select, Checkbox, Form } from 'antd'
import { putGlobaleQuota, putClusterQuota } from '../../actions/quota'
const FormItem = Form.Item
const createForm = Form.create

class ResourceQuota extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      clusterList: [],
      globaleList: {},
      gIsEdit: false,
      cIsEdit: false,
      isProject: false,
      isDisabled: false,
    }
  }
  componentWillMount() {
    const { isProject, data } = this.props
    this.setState({
      isProject,
      globaleList: data,
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
  /**
   * 筛选内容
   * @param {*} value
   */
  screenValue(value) {
    const { globaleList } = this.state
    let values = ''
    Object.keys(globaleList).forEach((item, index) => {
      if (value === item) {
        values = Object.values(globaleList)[index]
      }
    })
    return values
  }
  /**
   * 百分比
   * @param {*} value
   */
  filterPercent(value, count) {
    let max = 100
    let result = 0
    let number = 100 / Number(value)
    for (let i = 0; i < count; i++) {
      result+=number
     }
     result > max ? 0 : result
  }

  render() {
    const { isProject, gIsEdit, cIsEdit, isDisabled, inputsDisabled } = this.state //属性
    const { globaleList } = this.state //数据
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
    const ciList = [
      {
        key: 'tenxflow',
        text: 'Tencfilow (个)',
      },
      {
        key: 'subTask',
        text: '子任务 (个)',
      },
      {
        key: 'dockerfile',
        text: 'Dockerfile (个)',
      },
    ]
    const cdList = [
      {
        key: 'registryProject',
        text: '镜像仓库组 (个)',
      },
      {
        key: 'registry',
        text: '镜像仓库 (个)',
      },
      {
        key: 'orchestrationTemplate',
        text: '编排文件 (个)',
      },
      {
        key: 'applicationPackage',
        text: '应用包 (个)',
      }]
    const computeList = ['CPU （核）', '内存（GB）', '磁盘（GB）']
    const platformList = ['应用 (个)', '服务 (个)', '容器 (个)', '存储 (个)', '快照 (个)', '服务配置 (个)']
    const serviceList = ['关系型数据库 (个)', '缓存 (个)', 'Zookeeper (个)', 'ElasticSearch (个)']
    const { getFieldProps, getFieldValue } = this.props.form
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
                  ciList.map((item, index) => {
                    const inputProps = getFieldProps(item.key, {
                      initialValue: globaleList ? this.screenValue(item.key) : ''
                    })
                    const checkKey = `${item.key}-check`
                    const checkProps = getFieldProps(checkKey, {
                      validate: [{
                        valuePropName: 'checked',
                      }]
                    })
                    const checkValue = getFieldValue(checkKey)
                    return (
                      <Row key={index} className="connents">
                        <Col span={2} style={{ height: 30 }}>
                          <span>{item.text}</span>
                        </Col>
                        <Col span={7} style={{ height: 30 }}>
                          <FormItem>
                            <InputNumber {...inputProps} disabled={checkValue} style={{ width: '100%' }} id="input" />
                          </FormItem>
                        </Col>
                        <Col span={3} style={{ height: 30 }}>
                          <FormItem>
                            <Checkbox {...checkProps}>无限制</Checkbox>
                          </FormItem>
                        </Col>
                        <Col span={4} style={{ height: 30 }}>
                          <FormItem>
                            <span>配额剩余：0/
                              {
                                Object.keys(globaleList).map((value, index) => (
                                  <span >
                                    {
                                      JSON.stringify(value) === item.key ? Object.values(globaleList)[index] : null
                                    }
                                  </span>
                                ))
                              }
                            </span>
                          </FormItem>
                        </Col>
                      </Row>
                    )
                  })
                }
                <p className="line"></p>
                {
                  cdList.map((item, index) => {
                    const inputProps = getFieldProps(item.key, {
                      initialValue: globaleList ? this.screenValue(item.key) : ''
                    })
                    const checkKey = `${item.key}-check`
                    const checkProps = getFieldProps(checkKey, {
                      validate: [{
                        valuePropName: 'checked',
                      }]
                    })
                    const checkValue = getFieldValue(checkKey)
                    return (
                      <Row key={index} className="connents">
                        <Col span={2} style={{ height: 30 }}>
                          <span>{item.text}</span>
                        </Col>
                        <Col span={7} style={{ height: 30 }}>
                          <FormItem>
                            <InputNumber {...inputProps} disabled={checkValue} style={{ width: '100%' }} id="input" />
                          </FormItem>
                        </Col>
                        <Col span={3} style={{ height: 30 }}>
                          <FormItem>
                            <Checkbox {...checkProps}>无限制</Checkbox>
                          </FormItem>
                        </Col>
                        <Col span={4} style={{ height: 30 }}>
                          <FormItem>
                            <span>配额剩余：0
                              {
                                Object.keys(globaleList).map((value, index) => (
                                  <span >
                                    {
                                      JSON.stringify(value) === item.key ? Object.values(globaleList)[index] : null
                                    }
                                  </span>
                                ))
                              }
                            </span>
                          </FormItem>
                        </Col>
                      </Row>
                    )
                  })
                }
              </div> :
              <div className="overall">
                <span>CI/CD</span>
                {
                  ciList.map((item, index) => (
                    <Row className="list" key={index}>
                      <Col span={2}>
                        <span>{item.text}</span>
                      </Col>
                      <Col span={8}>
                        <Progress percent={30} showInfo={false} />
                      </Col>
                      <Col span={4}>
                        <span>0/
                          {
                            globaleList ?
                              Object.keys(globaleList).map((value, index) => (
                                value === item.key ? Object.values(globaleList)[index] : ''
                              )) : ''
                          }（个）</span>
                      </Col>
                    </Row>
                  ))
                }
                <p className="line"></p>
                {
                  cdList.map((item, index) => (
                    <Row className="list" key={index}>
                      <Col span={2}>
                        <span>{item.text}</span>
                      </Col>
                      <Col span={8}>
                        <Progress percent={30} showInfo={false} />
                      </Col>
                      <Col span={4}>
                        <span>0/
                            {
                            globaleList ?
                              Object.keys(globaleList).map((value, index) => (
                                value === item.key ? Object.values(globaleList)[index] : ''
                              )) : ''
                          }（个）</span>
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
ResourceQuota = createForm()(ResourceQuota)
function mapStateToProps(state) {
  const { entities } = state
  const { current } = entities
  return {}
}

export default connect(mapStateToProps, {
  putGlobaleQuota,
  putClusterQuota,
})(ResourceQuota)
