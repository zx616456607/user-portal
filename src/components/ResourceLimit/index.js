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
      cluster: '',
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
    const { getGlobaleQuota, getGlobaleQuotaList, getClusterQuota, getClusterQuotaList, clusterID, userName, projectName, isProject, namespace } = this.props
    let query
    if (isProject) {
      query = {
        id: key ? key : clusterID,
        header: {
          teamspace: projectName
        }
      }
    } else {
      if (userName !== namespace) {
        query = {
          id: key ? key : clusterID,
          header: {
            onbehalfuser: userName
          }
        }
      } else {
        query = {
          id: key ? key : clusterID,
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
    const { putGlobaleQuota, userName, projectName, isProject, namespace } = this.props
    const { validateFields } = this.props.form
    let notify = new NotificationHandler()
    validateFields((error, value) => {
      if (!!error) return
      let header
      if (isProject) {
        header = {
          teamspace: projectName
        }
      } else {
        if (userName !== namespace) {
          header = {
            onbehalfuser: userName
          }
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
    const { cluster } = this.state
    const { putClusterQuota, clusterID, userName, projectName, isProject, namespace } = this.props
    const { validateFields } = this.props.form
    validateFields((error, value) => {
      if (!!error) return
      let header
      if (isProject) {
        header = {
          teamspace: projectName
        }
      } else {
        if (userName !== namespace) {
          header = {
            onbehalfuser: userName
          }
        }
      }
      let query = {
        id: cluster === '' ? clusterID : cluster,
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
      cluster: e.key,
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
    if (value === 0 && count === 0) return 0
    if (value === 1) {
      if (count > value) {
        result = max
      } else {
        if (count === value) {
          result = max
        } else {
          result = count * 100
        }
      }
    } else if (value > 0) {
      let number = 100 / value
      for (let i = 0; i < count; i++) {
        if (String(count).indexOf('.') === -1) {
          result += number
        } else {
          if (Number(String(count).split('.')[0]) > 0) {
            result += Math.floor(number)
          } else {
            result += count * number
          }
        }
      }
    }
    result >= max ? result = max : result
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
          count = Object.values(globaleList)[index] !== null ? Object.values(globaleList)[index] : -1
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
    let count = 0
    if (globaleUseList) {
      Object.keys(globaleUseList).forEach((item, index) => {
        if (item === value) {
          count = Object.values(globaleUseList)[index].toString().indexOf('.') === -1 ?
            Object.values(globaleUseList)[index] : Object.values(globaleUseList)[index].toFixed(2)
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
          count = Object.values(clusterList)[index] !== null ? Object.values(clusterList)[index] : -1
        }
      })
    }
    return count
  }
  useClusterCount(value) {
    const { clusterUseList } = this.state
    let count = 0
    if (clusterUseList) {
      Object.keys(clusterUseList).forEach((item, index) => {
        if (item === value) {
          count = Object.values(clusterUseList)[index].toString().indexOf('.') === -1 ?
            Object.values(clusterUseList)[index] : Object.values(clusterUseList)[index].toFixed(2)
        }
      })
    }
    return count
  }
  updateCountSum() {
    const { validateFields } = this.props.form
    validateFields((error, value) => {
      if (!!error) return
    })
  }
  handleGlobalePlus() {
    let plus = 0
    const { validateFields } = this.props.form
    const { globaleList } = this.state
    validateFields((error, value) => {
      if (!!error) {
        return
      }
      let curObj = {
        dockerfile: value.dockerfile,
        subTask: value.subTask,
        tenxflow: value.tenxflow,
        orchestrationTemplate: value.orchestrationTemplate,
        applicationPackage: value.applicationPackage
      }
      Object.keys(curObj).forEach((item, index) => {
        if (Object.values(globaleList)[index] !== Object.values(curObj)[index]) {
        }
      })
    })
    return plus
  }
  handaleClusterPlus() {
    let plus = 0
    const { getFieldValue, validateFields } = this.props.form
    validateFields((error, value) => {
      if (!!error) {
        return
      }
      let curObj = {
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
        etcd: value.etcd
      }
    })
    return plus
  }

  render() {
    const { gIsEdit, cIsEdit, isDisabled, inputsDisabled, quotaName, sum } = this.state //属性
    const { globaleList, clusterList } = this.state //数据
    const { clusterData, clusterName, isProject } = this.props
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
        text: 'TenxFlow (个)',
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
        text: 'CPU (C)'
      },
      {
        key: 'memory',
        text: '内存 (GB)'
      },
      {
        key: 'storage',
        text: '磁盘 (GB)'
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
        text: 'MySQL集群 (个)'
      }, {
        key: 'redis',
        text: 'Redis集群 (个)'
      }, {
        key: 'zookeeper',
        text: 'Zookeeper集群 (个)'
      }, {
        key: 'elasticsearch',
        text: 'ElasticSearch集群 (个)'
      }, {
        key: 'etcd',
        text: 'Etcd集群 (个)'
      }]
    const { getFieldProps, getFieldValue, setFieldsValue, setFields } = this.props.form
    return (
      <div className="quota">
        {
          !isProject ?
            <div className="alertRow">
              <span>以下为个人项目的资源配额使用情况，了解该成员参与的其他项目资源配额，使用情况点击
                <Link to="/tenant_manage/project_manage">
                  <span> 共享项目资源配额 </span>
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
              {/* <span className="header_desc">修改配额，将修改 <p className="sum">{this.handleGlobalePlus()}</p> 个资源配额</span> */}
            </div> :
            this.props.role === 2 ?
              <Button size="large" className="btn" type="primary" onClick={() => this.handleGlobaleEdit()}>编辑</Button> : ''
        }
        <div className="connent">
          {
            gIsEdit ?
              <div className="overallEdit">
                <svg className='cicd commonImg'>
                  <use xlinkHref="#cicd"></use>
                </svg> &nbsp;
                <span>CI/CD</span>
                {
                  ciList.map((item, index) => {
                    const inputValue = getFieldValue(item.key)
                    const beforeValue = this.maxGlobaleCount(item.key)
                    const plusValue = beforeValue === -1 ? inputValue : inputValue - beforeValue
                    const checkKey = `${item.key}-check`
                    const checkProps = getFieldProps(checkKey, {
                      initialValue: beforeValue === -1 ? true : false,
                      onChange: (e) => {
                        e.target.checked ? setFieldsValue({
                          [item.key]: undefined,
                        }) : setFieldsValue({
                          [item.key]: this.maxGlobaleCount(item.key) === -1 ? undefined : this.maxGlobaleCount(item.key)
                        })
                      },
                      validate: [{
                        valuePropName: 'checked',
                      }]
                    })
                    const checkValue = getFieldValue(checkKey)
                    const inputProps = getFieldProps(item.key, {
                      initialValue: globaleList ? checkValue === true ? undefined : beforeValue === -1 ? undefined : beforeValue : 0,
                    })
                    const surplu = inputProps.value !== undefined ?
                      inputProps.value - this.useGlobaleCount(item.key) : '无限制'
                    return (
                      <Row key={index} className="connents">
                        <Col span={3}>
                          <span>{item.text}</span>
                        </Col>
                        <Col span={7}>
                          <FormItem>
                            <InputNumber {...inputProps} disabled={checkValue} placeholder="请输入授权配额数量" style={{ width: '100%' }} id="input" min={0} />
                          </FormItem>
                        </Col>
                        <Col span={3}>
                          <FormItem>
                            <Checkbox {...checkProps} checked={checkValue}>无限制</Checkbox>
                          </FormItem>
                        </Col>
                        <Col span={4}>
                          <FormItem>
                            <span className="surplus">配额剩余：{surplu}</span>
                            {
                              plusValue > 0 ?
                                <div className="plus">
                                  <p>+ {plusValue}</p>
                                </div> :
                                plusValue === 0 || isNaN(plusValue) ? '' :
                                  <div className="minu">
                                    <p>{isNaN(plusValue) ? '' : plusValue}</p>
                                  </div>
                            }
                          </FormItem>
                        </Col>
                      </Row>
                    )
                  })
                }
                <p className="line"></p>
                <svg className='cicd commonImg'>
                  <use xlinkHref="#cicd"></use>
                </svg> &nbsp;
                <span>交付中心</span>
                {
                  cdList.map((item, index) => {
                    const inputValue = getFieldValue(item.key)
                    const beforeValue = this.maxGlobaleCount(item.key)
                    const plusValue = beforeValue === -1 ? inputValue : inputValue - beforeValue
                    const checkKey = `${item.key}-check`
                    const checkProps = getFieldProps(checkKey, {
                      initialValue: beforeValue === -1 ? true : false,
                      onChange: (e) => {
                        e.target.checked ? setFieldsValue({
                          [item.key]: undefined,
                        }) : setFieldsValue({
                          [item.key]: this.maxGlobaleCount(item.key) === -1 ? undefined : this.maxGlobaleCount(item.key)
                        })
                      },
                      validate: [{
                        valuePropName: 'checked',
                      }]
                    })
                    const checkValue = getFieldValue(checkKey)
                    const inputProps = getFieldProps(item.key, {
                      initialValue: globaleList ? checkValue === true ? undefined : this.maxGlobaleCount(item.key) === -1 ? undefined : this.maxGlobaleCount(item.key) : 0
                    })
                    const surplu = inputProps.value !== undefined ?
                      inputProps.value - this.useGlobaleCount(item.key) : '无限制'
                    return (
                      <Row key={index} className="connents">
                        <Col span={3}>
                          <span>{item.text}</span>
                        </Col>
                        <Col span={7}>
                          <FormItem>
                            <InputNumber {...inputProps} disabled={checkValue} placeholder="请输入授权配额数量" style={{ width: '100%' }} id="input" min={0} />
                          </FormItem>
                        </Col>
                        <Col span={3}>
                          <FormItem>
                            <Checkbox {...checkProps} checked={checkValue}>无限制</Checkbox>
                          </FormItem>
                        </Col>
                        <Col span={4}>
                          <FormItem>
                            <span className="surplus">配额剩余：{surplu}</span>
                            {
                              plusValue > 0 ?
                                <div className="plus">
                                  <p>+ {plusValue}</p>
                                </div> :
                                plusValue === 0 || isNaN(plusValue) ? '' :
                                  <div className="minu">
                                    <p>{isNaN(plusValue) ? '' : plusValue}</p>
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
                <div>
                  <svg className='cicd commonImg'>
                    <use xlinkHref="#cicd"></use>
                  </svg> &nbsp;
                <span>CI/CD</span>
                </div>
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
                          {
                            this.useGlobaleCount(item.key) > this.maxGlobaleCount(item.key) ?
                              this.maxGlobaleCount(item.key) === -1 ?
                                <span>{this.useGlobaleCount(item.key)}</span> :
                                <span style={{ color: 'red' }}>{this.useGlobaleCount(item.key)}</span> : <span>{this.useGlobaleCount(item.key)}</span>
                          }/<p>{this.maxGlobaleCount(item.key) === -1 ? '无限制' : this.maxGlobaleCount(item.key)}</p>
                        </Col>
                      </Row>
                    )
                  })
                }
                <p className="line"></p>
                <div>
                  <svg className='center commonImg'>
                    <use xlinkHref="#center"></use>
                  </svg> &nbsp;
                <span>交付中心</span>
                </div>

                {
                  cdList.map((item, index) => (
                    <Row className="list" key={index}>
                      <Col span={2}>
                        <span>{item.text}</span>
                      </Col>
                      <Col span={8}>
                        <Progress percent={this.filterPercent(this.maxGlobaleCount(item.key), this.useGlobaleCount(item.key))} showInfo={false} />
                      </Col>
                      <Col span={4}>
                        {
                          this.useGlobaleCount(item.key) > this.maxGlobaleCount(item.key) ?
                            this.maxGlobaleCount(item.key) === -1 ?
                              <span>{this.useGlobaleCount(item.key)}</span> :
                              <span style={{ color: 'red' }}>{this.useGlobaleCount(item.key)}</span> :
                            <span>{this.useGlobaleCount(item.key)}</span>
                        }/<p>{this.maxGlobaleCount(item.key) === -1 ? '无限制' : this.maxGlobaleCount(item.key)}</p>
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
                  <Button size="large" className="save" type="primary" onClick={(e) => this.handleClusterOk(e)}>保存</Button>
                  {/* <span className="header_desc">修改配额，将修改 <p className="sum">{this.handaleClusterPlus()}</p> 个资源配额</span> */}
                </div> :
                this.props.role === 2 ?
                  <Button size="large" className="edit" type="primary" onClick={() => this.handleClusterEdit()}>编辑</Button> : ''
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
                        const inputValue = getFieldValue(item.key)
                        const beforeValue = this.maxClusterCount(item.key)
                        const plusValue = beforeValue === -1 ? inputValue : inputValue - beforeValue
                        const checkKey = `${item.key}-check`
                        const checkProps = getFieldProps(checkKey, {
                          initialValue: beforeValue === -1 ? true : false,
                          onChange: (e) => {
                            e.target.checked ? setFieldsValue({
                              [item.key]: undefined,
                            }) : setFieldsValue({
                              [item.key]: this.maxClusterCount(item.key) === -1 ? undefined : this.maxClusterCount(item.key)
                            })
                          },
                          validate: [{
                            valuePropName: 'checked',
                          }]
                        })
                        const checkValue = getFieldValue(checkKey)
                        const inputProps = getFieldProps(item.key, {
                          initialValue: clusterList ? checkValue === true ? undefined : beforeValue === -1 ? undefined : beforeValue : 0
                        })
                        const surplus = inputProps.value !== undefined ?
                          inputProps.value - this.useClusterCount(item.key) : '无限制'
                        return (
                          <Row key={index} className="connents">
                            <Col span={3}>
                              <span>{item.text}</span>
                            </Col>
                            <Col span={7}>
                              <FormItem>
                                <InputNumber {...inputProps} disabled={checkValue} placeholder="请输入授权配额数量" style={{ width: '100%' }} min={0} />
                              </FormItem>
                            </Col>
                            <Col span={3}>
                              <FormItem>
                                <Checkbox {...checkProps} checked={checkValue}>无限制</Checkbox>
                              </FormItem>
                            </Col>
                            <Col span={4}>
                              <span className="surplus">配额剩余：{surplus}</span>
                              {
                                plusValue > 0 ?
                                  <div className="plus">
                                    <p>+ {plusValue}</p>
                                  </div> :
                                  plusValue === 0 || isNaN(plusValue) ? '' :
                                    <div className="minu">
                                      <p>{isNaN(plusValue) ? '' : plusValue}</p>
                                    </div>
                              }
                            </Col>
                          </Row>
                        )
                      })
                    }
                  </div>
                  <span className="ptzy">平台资源</span>
                  <div className="platform">
                    <svg className='app commonImg'>
                      <use xlinkHref="#app"></use>
                    </svg> &nbsp;
                    <span>应用管理</span>
                    {
                      platformList.map((item, index) => {
                        const inputValue = getFieldValue(item.key)
                        const beforeValue = this.maxClusterCount(item.key)
                        const plusValue = beforeValue === -1 ? inputValue : inputValue - beforeValue
                        const isPlus = inputValue > beforeValue ? true : false
                        const checkKey = `${item.key}-check`
                        const checkProps = getFieldProps(checkKey, {
                          initialValue: beforeValue === -1 ? true : false,
                          onChange: (e) => {
                            e.target.checked ? setFieldsValue({
                              [item.key]: undefined,
                            }) : setFieldsValue({
                              [item.key]: this.maxClusterCount(item.key) === -1 ? undefined : this.maxClusterCount(item.key)
                            })
                          },
                          validate: [{
                            valuePropName: 'checked',
                          }]
                        })
                        const checkValue = getFieldValue(checkKey)
                        const inputProps = getFieldProps(item.key, {
                          initialValue: clusterList ? checkValue === true ? undefined : this.maxClusterCount(item.key) === -1 ? undefined : this.maxClusterCount(item.key) : 0
                        })
                        const surplus = inputProps.value !== undefined ?
                          inputProps.value - this.useClusterCount(item.key) : '无限制'
                        return (
                          <Row key={index} className="connents">
                            <Col span={3}>
                              <span>{item.text}</span>
                            </Col>
                            <Col span={7}>
                              <FormItem>
                                <InputNumber {...inputProps} disabled={checkValue} placeholder="请输入授权配额数量" style={{ width: '100%' }} min={0} />
                              </FormItem>
                            </Col>
                            <Col span={3}>
                              <FormItem>
                                <Checkbox {...checkProps} checked={checkValue}>无限制</Checkbox>
                              </FormItem>
                            </Col>
                            <Col span={4}>
                              <span className="surplus">配额剩余：{surplus}</span>
                              {
                                plusValue > 0 ?
                                  <div className="plus">
                                    <p>+ {plusValue}</p>
                                  </div> :
                                  plusValue === 0 || isNaN(plusValue) ? '' :
                                    <div className="minu">
                                      <p>{isNaN(plusValue) ? '' : plusValue}</p>
                                    </div>
                              }
                            </Col>
                          </Row>
                        )
                      })
                    }
                  </div>
                  <p className="line"></p>
                  <div className="service">
                    <svg className='database commonImg'>
                      <use xlinkHref="#database"></use>
                    </svg> &nbsp;
                    <span>数据库与缓存</span>
                    {
                      serviceList.map((item, index) => {
                        const inputValue = getFieldValue(item.key)
                        const beforeValue = this.maxClusterCount(item.key)
                        const plusValue = beforeValue === -1 ? inputValue : inputValue - beforeValue
                        const checkKey = `${item.key}-check`
                        const checkProps = getFieldProps(checkKey, {
                          initialValue: beforeValue === -1 ? true : false,
                          onChange: (e) => {
                            e.target.checked ? setFieldsValue({
                              [item.key]: undefined,
                            }) : setFieldsValue({
                              [item.key]: this.maxClusterCount(item.key) === -1 ? undefined : this.maxClusterCount(item.key)
                            })
                          },
                          validate: [{
                            valuePropName: 'checked',
                          }]
                        })
                        const checkValue = getFieldValue(checkKey)
                        const inputProps = getFieldProps(item.key, {
                          initialValue: clusterList ? checkValue === true ? undefined : this.maxClusterCount(item.key) === -1 ? undefined : this.maxClusterCount(item.key) : 0
                        })
                        const surplus = inputProps.value !== undefined ?
                          inputProps.value - this.useClusterCount(item.key) : '无限制'
                        return (
                          <Row key={index} className="connents">
                            <Col span={3}>
                              <span>{item.text}</span>
                            </Col>
                            <Col span={7}>
                              <FormItem>
                                <InputNumber {...inputProps} disabled={checkValue} placeholder="请输入授权配额数量" style={{ width: '100%' }} min={0} />
                              </FormItem>
                            </Col>
                            <Col span={3}>
                              <FormItem>
                                <Checkbox {...checkProps} checked={checkValue}>无限制</Checkbox>
                              </FormItem>
                            </Col>
                            <Col span={4}>
                              <span className="surplus">配额剩余：{surplus}</span>
                              {
                                plusValue > 0 ?
                                  <div className="plus">
                                    <p>+ {plusValue}</p>
                                  </div> :
                                  plusValue === 0 || isNaN(plusValue) ? '' :
                                    <div className="minu">
                                      <p>{isNaN(plusValue) ? '' : plusValue}</p>
                                    </div>
                              }
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
                            {
                              this.useClusterCount(item.key) > this.maxClusterCount(item.key) ?
                                this.maxClusterCount(item.key) === -1 ?
                                  <span>{this.useClusterCount(item.key)}</span> :
                                  <span style={{ color: 'red' }}>{this.useClusterCount(item.key)}</span> :
                                <span>{this.useClusterCount(item.key)}</span>
                            }/<p>{this.maxClusterCount(item.key) === -1 ? '无限制' : this.maxClusterCount(item.key)}</p>
                          </Col>
                        </Row>
                      ))
                    }
                  </div>
                  <span>平台资源</span>
                  <div className="platform">
                    <svg className='app commonImg'>
                      <use xlinkHref="#app"></use>
                    </svg> &nbsp;
                    <span>应用管理</span>
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
                            {
                              this.useClusterCount(item.key) > this.maxClusterCount(item.key) ?
                                this.maxClusterCount(item.key) === -1 ?
                                  <span>{this.useClusterCount(item.key)}</span> :
                                  <span style={{ color: 'red' }}>{this.useClusterCount(item.key)}</span> :
                                <span>{this.useClusterCount(item.key)}</span>
                            }/<p>{this.maxClusterCount(item.key) === -1 ? '无限制' : this.maxClusterCount(item.key)}</p>
                          </Col>
                        </Row>
                      ))
                    }
                  </div>
                  <p className="line"></p>
                  <div className="service">
                    <svg className='database commonImg'>
                      <use xlinkHref="#database"></use>
                    </svg> &nbsp;
                    <span >数据库与缓存</span>
                    {
                      serviceList.map((item, index) => (
                        <Row className="list" key={index}>
                          <Col span={3}>
                            <span>{item.text}</span>
                          </Col>
                          <Col span={7}>
                            <Progress percent={this.filterPercent(this.maxClusterCount(item.key), this.useClusterCount(item.key))} showInfo={false} />
                          </Col>
                          <Col span={4}>
                            {
                              this.useClusterCount(item.key) > this.maxClusterCount(item.key) ?
                                this.maxClusterCount(item.key) === -1 ?
                                  <span>{this.useClusterCount(item.key)}</span> :
                                  <span style={{ color: 'red' }}>{this.useClusterCount(item.key)}</span> :
                                <span>{this.useClusterCount(item.key)}</span>
                            }/<p>{this.maxClusterCount(item.key) === -1 ? '无限制' : this.maxClusterCount(item.key)}</p>
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
  const { current, loginUser } = state.entities
  const { clusterID } = current.cluster
  const { clusterName } = current.cluster
  const user = current.space.namespace
  const { role } = loginUser.info
  const { namespace } = loginUser.info
  const { projectVisibleClusters } = state.projectAuthority
  const clusterData = projectVisibleClusters[user] && projectVisibleClusters[user].data || []
  return {
    role,
    namespace,
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
