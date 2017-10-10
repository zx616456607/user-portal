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
import { Link } from 'react-router'
import './style/index.less'
import { InputNumber, Table, Button, Icon, Input, Modal, Row, Col, Tooltip, Dropdown, Menu, Progress, Select, Checkbox, Form } from 'antd'
import { putGlobaleQuota, putClusterQuota, getGlobaleQuota, getGlobaleQuotaList, getClusterQuota, getClusterQuotaList } from '../../actions/quota'
import NotificationHandler from '../../components/Notification'
import { REG } from '../../constants'
const FormItem = Form.Item
const createForm = Form.create

class ResourceQuota extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      plus: 0,
      sum: 0,
      quotaName: '',
      clusterList: {},
      globaleList: {},
      gIsEdit: false,
      cIsEdit: false,
      isProject: false,
      isDisabled: false,
      clusterSurplus: 0,
      globaleSurplus: 0,
      globaleUseList: [],
      clusterUseList: [],

    }
  }
  componentWillMount() {
    this.fetchQuota()
  }
  fetchQuota(key) {
    const { getGlobaleQuota, getGlobaleQuotaList, getClusterQuota, getClusterQuotaList, clusterID, userName, projectName, isProject } = this.props
    let query
    if (isProject) {
      query = {
        id: key ? key : clusterID,
        header: {
          project: projectName
        }
      }
    } else {
      query = {
        id: key ? key : clusterID,
        header: {
          onbehalfuser: userName
        }
      }
    }

    getGlobaleQuota(query, {
      success: {
        func: res => {
          if (REG.test(res.code)) {
            this.setState({
              globaleList: res.data
            })
          }
        },
        isAsync: true
      }
    })
    getGlobaleQuotaList(query, {
      success: {
        func: res => {
          if (REG.test(res.code)) {
            this.setState({
              globaleUseList: res.data
            })
          }
        },
        isAsync: true
      }
    })

    getClusterQuota(query, {
      success: {
        func: res => {
          if (REG.test(res.code)) {
            this.setState({
              clusterList: res.data
            })
          }
        },
        isAsync: true
      }
    })
    getClusterQuotaList(query, {
      success: {
        func: res => {
          if (REG.test(res.code)) {
            this.setState({
              clusterUseList: res.data
            })
          }
        },
        isAsync: true
      }
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
    const { putGlobaleQuota, userName, projectName, isProject } = this.props
    const { validateFields } = this.props.form
    let notify = new NotificationHandler()
    validateFields((error, value) => {
      if (!!error) return
      let header
      if (isProject) {
        header = {
          project: projectName
        }
      } else {
        header = {
          onbehalfuser: userName
        }
      }
      let query = {
        header,
        body: {
          subTask: value.subTask,
          registry: value.registry,
          tenxflow: value.tenxflow,
          dockerfile: value.dockerfile,
          registryProject: value.registryProject,
          applicationPackage: value.applicationPackage,
          orchestrationTemplate: value.orchestrationTemplate,
        }
      }
      putGlobaleQuota(query, {
        success: {
          func: res => {
            if (res.code === 200) {
              notify.success('设置成功')
              this.setState({
                globaleList: res.data,
                gIsEdit: false
              })
            }
          },
          isAsync: true
        }
      })
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
    let notify = new NotificationHandler()
    const { putClusterQuota, clusterID, userName, projectName, isProject } = this.props
    const { validateFields } = this.props.form
    validateFields((error, value) => {
      if (!!error) return
      let header
      if (isProject) {
        header = {
          project: projectName
        }
      } else {
        header = {
          onbehalfuser: userName
        }
      }
      let query = {
        id: clusterID,
        header,
        body: {
          cpu: value.cpu,
          memory: value.memory,
          storage: value.storage,
          application: value.application,
          service: value.service,
          container: value.container,
          volume: value.volume,
          snapshot: value.snapshot,
          configuration: value.configuration,
          mysql: value.mysql,
          redis: value.redis,
          zookeeper: value.zookeeper,
          elasticsearch: value.elasticsearch,
          etcd: value.etcd,
        }
      }
      putClusterQuota(query, {
        success: {
          func: res => {
            if (REG.test(res.code)) {
              this.setState({
                clusterList: res.data,
                cIsEdit: false
              })
            }
          },
          isAsync: true
        }
      })
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
   * 切换集群
   * @param {*} e
   */
  handleOnMenu(e) {
    this.setState({
      quotaName: e.item.props.children.props.children
    })
    this.fetchQuota(e.key)
  }
  /**
   * 配额剩余
   * @param {*} e
   */
  handleChage(e) {
    this.setState({
      globaleSurplus: e.target.value
    })
  }
  /**
   * 百分比
   * @param {*} value
   */
  filterPercent(value, count) {
    let max = 100
    let result = 0
    if (value === 0) return 0
    let number = 100 / Number(value)
    for (let i = 0; i < count; i++) {
      result += number
    }
    result > max ? result = max : result
    return result
  }
  /**
   * 全局最大值
   * @param {*} value
   */
  maxGlobaleCount(value) {
    const { globaleList } = this.state
    let count = 0
    if (globaleList) {
      Object.keys(globaleList).forEach((item, index) => {
        if (item === value) {
          count = Object.values(globaleList)[index]
        }
      })
    }
    return count
  }
  /**
   * 全局使用值
   */
  useGlobaleCount(value) {
    const { globaleUseList } = this.state
    let count = ''
    if (globaleUseList) {
      Object.keys(globaleUseList).forEach((item, index) => {
        if (item === value) {
          count = Object.values(globaleUseList)[index]
        }
      })
    }
    return count
  }

  maxClusterCount(value) {
    const { clusterList } = this.state
    let count = 0
    if (clusterList) {
      Object.keys(clusterList).forEach((item, index) => {
        if (item === value) {
          count = Object.values(clusterList)[index]
        }
      })
    }
    return count
  }
  useClusterCount(value) {
    const { clusterUseList } = this.state
    let count = ''
    if (clusterUseList) {
      Object.keys(clusterUseList).forEach((item, index) => {
        if (item === value) {
          count = Object.values(clusterUseList)[index]
        }
      })
    }
    return Math.floor(count)
  }
  updateCountSum() {
    const { validateFields } = this.props.form
    validateFields((error, value) => {
      if (!!error) return
    })
  }

  render() {
    const { isProject, gIsEdit, cIsEdit, isDisabled, inputsDisabled, quotaName, sum } = this.state //属性
    const { globaleList, clusterList } = this.state //数据
    const { clusterData, clusterName } = this.props
    //默认集群
    const menu = (
      <Menu onClick={(e) => this.handleOnMenu(e)}>
        {
          clusterData ?
            clusterData.map((item, index) => (
              <Menu.Item key={item.clusterID}>
                <span>{item.clusterName}</span>
              </Menu.Item>
            )) : ''
        }
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
      // {
      //   key: 'registryProject',
      //   text: '镜像仓库组 (个)',
      // },
      // {
      //   key: 'registry',
      //   text: '镜像仓库 (个)',
      // },
      {
        key: 'orchestrationTemplate',
        text: '编排文件 (个)',
      },
      {
        key: 'applicationPackage',
        text: '应用包 (个)',
      }]
    const computeList = [
      {
        key: 'cpu',
        text: 'CPU （核）'
      },
      {
        key: 'memory',
        text: '内存（GB）'
      },
      {
        key: 'storage',
        text: '磁盘（GB）'
      }]
    const platformList = [
      {
        key: 'application',
        text: '应用 (个)'
      }, {
        key: 'service',
        text: '服务 (个)'
      }, {
        key: 'container',
        text: '容器 (个)'
      }, {
        key: 'volume',
        text: '存储 (个)'
      }, {
        key: 'snapshot',
        text: '快照 (个)'
      }, {
        key: 'configuration',
        text: '服务配置 (个)'
      }]
    const serviceList = [
      {
        key: 'mysql',
        text: '关系型数据库 (个)'
      }, {
        key: 'redis',
        text: '缓存 (个)'
      }, {
        key: 'zookeeper',
        text: 'Zookeeper (个)'
      }, {
        key: 'elasticsearch',
        text: 'ElasticSearch (个)'
      }, {
        key: 'etcd',
        text: 'Etcd(个)'
      }]
    const { getFieldProps, getFieldValue } = this.props.form
    return (
      <div className="quota">
        {
          !isProject ?
            <div className="alertRow">
              <span>以下为个人项目的资源配额使用情况，了解该成员参与的其他项目资源配额使用情况点击
                <Link to="tenant_manage/project_manage">
                  <span>共享项目资源配额</span>
                </Link>
                进入项目详情查看</span>
            </div> : <div></div>
        }
        <div className="topDesc">
          <div className="titles"><span>项目全局资源配额</span></div>
        </div>
        {
          gIsEdit ?
            <div className="globaleEdit">
              <Button size="large" className="close" onClick={() => this.handleGlobaleClose()}>取消</Button>
              <Button size="large" className="save" type="primary" onClick={(e) => this.handleGlobaleSave(e)}>保存</Button>
              <span className="header_desc">修改配额，将修改 <p className="sum">0</p> 个资源配额</span>
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
                      initialValue: globaleList ? this.maxGlobaleCount(item.key) : '',
                    })
                    const inputValue = getFieldValue(item.key)
                    const beforeValue = this.maxGlobaleCount(item.key)
                    const plusValue = inputValue - beforeValue
                    const isPlus = inputValue > beforeValue ? true : false
                    const checkKey = `${item.key}-check`
                    const checkProps = getFieldProps(checkKey, {
                      validate: [{
                        valuePropName: 'checked',
                      }]
                    })
                    const checkValue = getFieldValue(checkKey)
                    return (
                      <Row key={index} className="connents">
                        <Col span={3}>
                          <span>{item.text}</span>
                        </Col>
                        <Col span={7}>
                          <FormItem>
                            <InputNumber {...inputProps} disabled={checkValue} style={{ width: '100%' }} id="input" />
                          </FormItem>
                        </Col>
                        <Col span={3}>
                          <FormItem>
                            <Checkbox {...checkProps}>无限制</Checkbox>
                          </FormItem>
                        </Col>
                        <Col span={4}>
                          <FormItem>
                            <span>配额剩余：0</span>
                            {
                              isPlus ?
                                <div className="plus">
                                  <Icon type="plus" />
                                  <span>{plusValue}</span>
                                </div> :
                                <div className="minu">
                                  <Icon type="minus" />
                                  <span>{plusValue}</span>
                                </div>
                            }
                          </FormItem>
                        </Col>
                      </Row>
                    )
                  })
                }
                <p className="line"></p>
                <span>交付中心</span>
                {
                  cdList.map((item, index) => {
                    const inputProps = getFieldProps(item.key, {
                      initialValue: globaleList ? this.maxGlobaleCount(item.key) : ''
                    })
                    const inputValue = getFieldValue(item.key)
                    const beforeValue = this.maxGlobaleCount(item.key)
                    const plusValue = inputValue - beforeValue
                    const isPlus = inputValue > beforeValue ? true : false
                    const checkKey = `${item.key}-check`
                    const checkProps = getFieldProps(checkKey, {
                      validate: [{
                        valuePropName: 'checked',
                      }]
                    })
                    const checkValue = getFieldValue(checkKey)
                    return (
                      <Row key={index} className="connents">
                        <Col span={3}>
                          <span>{item.text}</span>
                        </Col>
                        <Col span={7}>
                          <FormItem>
                            <InputNumber {...inputProps} disabled={checkValue} style={{ width: '100%' }} id="input" />
                          </FormItem>
                        </Col>
                        <Col span={3}>
                          <FormItem>
                            <Checkbox {...checkProps}>无限制</Checkbox>
                          </FormItem>
                        </Col>
                        <Col span={4}>
                          <FormItem>
                            <span>配额剩余：0</span>
                            {
                              isPlus ?
                                <div className="plus">
                                  <Icon type="plus" />
                                  <span>{plusValue}</span>
                                </div> :
                                <div className="minu">
                                  <Icon type="minus" />
                                  <span>{plusValue}</span>
                                </div>
                            }
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
                  ciList.map((item, index) => {
                    return (
                      <Row className="list" key={index}>
                        <Col span={2}>
                          <span>{item.text}</span>
                        </Col>
                        <Col span={8}>
                          <Progress percent={this.filterPercent(this.maxGlobaleCount(item.key), this.useGlobaleCount(item.key))} showInfo={false} />
                        </Col>
                        <Col span={4}>
                          <span>{this.useGlobaleCount(item.key)}/{this.maxGlobaleCount(item.key) ? this.maxGlobaleCount(item.key) : '无限制'}（个）</span>
                        </Col>
                      </Row>
                    )
                  })
                }
                <p className="line"></p>
                <span>交付中心</span>
                {
                  cdList.map((item, index) => (
                    <Row className="list" key={index}>
                      <Col span={2}>
                        <span>{item.text}</span>
                      </Col>
                      <Col span={8}>
                        <Progress percent={this.filterPercent(this.maxGlobaleCount(item.key), this.useGlobaleCount(item.key))} showInfo={false} showInfo={false} />
                      </Col>
                      <Col span={4}>
                        <span>{this.useGlobaleCount(item.key)}/{this.maxGlobaleCount(item.key) ? this.maxGlobaleCount(item.key) : '无限制'}（个）</span>
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
              <span className="desc">{quotaName ? quotaName : clusterName} <Icon type="down" /></span>
            </Dropdown>
          </div>
          <div className="header">
            {
              cIsEdit ?
                <div>
                  <Button size="large" className="close" onClick={() => this.handleClusterClose()}>取消</Button>
                  <Button size="large" className="save" type="primary" onClick={() => this.handleClusterOk()}>保存</Button>
                  <span className="header_desc">修改配额，将修改 <p className="sum">0</p> 个资源配额</span>
                </div> :
                <div>
                  <Button size="large" className="edit" type="primary" onClick={() => this.handleClusterEdit()}>编辑</Button>
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
                      computeList.map((item, index) => {
                        const inputsProps = getFieldProps(item.key, {
                          initialValue: clusterList ? this.maxClusterCount(item.key) : ''
                        })
                        const inputValue = getFieldValue(item.key)
                        const beforeValue = this.maxGlobaleCount(item.key)
                        const plusValue = inputValue - beforeValue
                        const isPlus = inputValue > beforeValue ? true : false
                        const isNan = inputValue >= 0 ? true : false
                        const checkKey = `${item.key}-check`
                        const checkProps = getFieldProps(checkKey, {
                          validate: [{
                            valuePropName: 'checked',
                          }]
                        })
                        const checkValue = getFieldValue(checkKey)
                        return (
                          <Row key={index} className="connents">
                            <Col span={3}>
                              <span>{item.text}</span>
                            </Col>
                            <Col span={6}>
                              <FormItem>
                                <InputNumber {...inputsProps} disabled={checkValue} style={{ width: '100%' }} />
                              </FormItem>
                            </Col>
                            <Col span={3}>
                              <FormItem>
                                <Checkbox {...checkProps}>无限制</Checkbox>
                              </FormItem>
                            </Col>
                            <Col span={3}>
                              <span>配额剩余：0</span>
                              {
                                isNaN ?
                                  isPlus ?
                                    <div className="plus">
                                      <Icon type="plus" />
                                      <span>{plusValue}</span>
                                    </div> :
                                    <div className="minus">
                                      <Icon type="minus" />
                                      <span>{plusValue}</span>
                                    </div> : ''
                              }
                            </Col>
                            <Col span={3}>
                              <span>该集群剩余：0</span>
                              {
                                isNaN ?
                                  isPlus ?
                                    <div className="plus">
                                      <Icon type="plus" />
                                      <span>{plusValue}</span>
                                    </div> :
                                    <div className="minus">
                                      <Icon type="minus" />
                                      <span>{plusValue}</span>
                                    </div> : ''
                              }
                            </Col>
                          </Row>
                        )
                      })
                    }
                  </div>
                  <span className="ptzy">平台资源</span>
                  <div className="platform">
                    <span className="app">应用管理</span>
                    {
                      platformList.map((item, index) => {
                        const inputsProps = getFieldProps(item.key, {
                          initialValue: clusterList ? this.maxClusterCount(item.key) : ''
                        })
                        const inputValue = getFieldValue(item.key)
                        const beforeValue = this.maxGlobaleCount(item.key)
                        const plusValue = inputValue - beforeValue
                        const isPlus = inputValue > beforeValue ? true : false
                        const isNan = inputValue >= 0 ? true : false
                        const checkKey = `${item.key}-check`
                        const checkProps = getFieldProps(checkKey, {
                          validate: [{
                            valuePropName: 'checked',
                          }]
                        })
                        const checkValue = getFieldValue(checkKey)
                        return (
                          <Row key={index} className="connents">
                            <Col span={3}>
                              <span>{item.text}</span>
                            </Col>
                            <Col span={6}>
                              <FormItem>
                                <InputNumber {...inputsProps} disabled={checkValue} style={{ width: '100%' }} />
                              </FormItem>
                            </Col>
                            <Col span={3}>
                              <FormItem>
                                <Checkbox {...checkProps}>无限制</Checkbox>
                              </FormItem>
                            </Col>
                            <Col span={3}>
                              <span>配额剩余：0</span>
                              {
                                isNaN ?
                                  isPlus ?
                                    <div className="plus">
                                      <Icon type="plus" />
                                      <span>{plusValue}</span>
                                    </div> :
                                    <div className="minus">
                                      <Icon type="minus" />
                                      <span>{plusValue}</span>
                                    </div> : ''
                              }
                            </Col>
                            <Col span={3}>
                              <span>该集群剩余：0</span>
                              <div className="minus" style={{ visibility: 'hidden' }}>
                                <Icon type="minus" />
                                <span>{this.state.sum}</span>
                              </div>
                            </Col>
                          </Row>
                        )
                      })
                    }
                  </div>
                  <p className="line"></p>
                  <div className="service">
                    <span className="server">数据库与缓存</span>
                    {
                      serviceList.map((item, index) => {
                        const inputsProps = getFieldProps(item.key, {
                          initialValue: clusterList ? this.maxClusterCount(item.key) : ''
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
                            <Col span={3}>
                              <span>{item.text}</span>
                            </Col>
                            <Col span={6}>
                              <FormItem>
                                <InputNumber {...inputsProps} disabled={checkValue} style={{ width: '100%' }} />
                              </FormItem>
                            </Col>
                            <Col span={3}>
                              <FormItem>
                                <Checkbox {...checkProps}>无限制</Checkbox>
                              </FormItem>
                            </Col>
                            <Col span={3}>
                              <span>配额剩余：0</span>
                              <div className="plus" style={{ visibility: 'hidden' }}>
                                <Icon type="plus" />
                                <span>{this.state.sum}</span>
                              </div>
                            </Col>
                            <Col span={3}>
                              <span>该集群剩余：0</span>
                              <div className="minus" style={{ visibility: 'hidden' }}>
                                <Icon type="minus" />
                                <span>{this.state.sum}</span>
                              </div>
                            </Col>
                          </Row>
                        )
                      })
                    }
                  </div>
                </div> :
                <div className="lists">
                  <div className="compute">
                    <span>计算资源</span>
                    {
                      computeList.map((item, index) => (
                        <Row className="list" key={index}>
                          <Col span={2}>
                            <span>{item.text}</span>
                          </Col>
                          <Col span={8}>
                            <Progress percent={this.filterPercent(this.maxClusterCount(item.key), this.useClusterCount(item.key))} showInfo={false} />
                          </Col>
                          <Col span={4}>
                            <span>{this.useClusterCount(item.key)}/{this.maxClusterCount(item.key) ? this.maxClusterCount(item.key) : '无限制'}（个）</span>
                          </Col>
                        </Row>
                      ))
                    }
                  </div>
                  <span>平台资源</span>
                  <div className="platform">
                    <span className="app">应用管理</span>
                    {
                      platformList.map((item, index) => (
                        <Row className="list" key={index}>
                          <Col span={2}>
                            <span>{item.text}</span>
                          </Col>
                          <Col span={8}>
                            <Progress percent={this.filterPercent(this.maxClusterCount(item.key), this.useClusterCount(item.key))} showInfo={false} />
                          </Col>
                          <Col span={4}>
                            <span>{this.useClusterCount(item.key)}/{this.maxClusterCount(item.key) ? this.maxClusterCount(item.key) : '无限制'}（个）</span>
                          </Col>
                        </Row>
                      ))
                    }
                  </div>
                  <p className="line"></p>
                  <div className="service">
                    <span className="servier">数据库与缓存</span>
                    {
                      serviceList.map((item, index) => (
                        <Row className="list" key={index}>
                          <Col span={3}>
                            <span>{item.text}</span>
                          </Col>
                          <Col span={8}>
                            <Progress percent={this.filterPercent(this.maxClusterCount(item.key), this.useClusterCount(item.key))} showInfo={false} />
                          </Col>
                          <Col span={4}>
                            <span>{this.useClusterCount(item.key)}/{this.maxClusterCount(item.key) ? this.maxClusterCount(item.key) : '无限制'}（个）</span>
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
  const { current } = state.entities
  const { namespace } = current.space
  const { clusterID } = current.cluster
  const { clusterName } = current.cluster
  const { projectVisibleClusters } = state.projectAuthority
  const clusterData = projectVisibleClusters[namespace] && projectVisibleClusters[namespace].data || []
  return {
    clusterID,
    clusterName,
    clusterData,
  }
}

export default connect(mapStateToProps, {
  getGlobaleQuota,
  getClusterQuota,
  getClusterQuotaList,
  getGlobaleQuotaList,
  putGlobaleQuota,
  putClusterQuota,
})(ResourceQuota)
