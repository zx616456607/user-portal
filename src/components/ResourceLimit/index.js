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
import classNames from 'classnames'
import './style/index.less'
import { InputNumber, Table, Button, Icon, Input, Modal, Row, Col, Tooltip, Dropdown, Menu, Progress, Select, Checkbox, Form } from 'antd'
import { camelize } from 'humps'
import { putGlobaleQuota,
  putClusterQuota,
  getGlobaleQuota,
  getGlobaleQuotaList,
  getResourceDefinition,
  getClusterQuota,
  getClusterQuotaList,
  getDevopsGlobaleQuotaList } from '../../actions/quota'
import { getProjectVisibleClusters } from '../../actions/project'
import NotificationHandler from '../../components/Notification'
import { REG } from '../../constants'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN } from '../../../constants'
import { toQuerystring } from '../../common/tools'
import TenxIcon from '@tenx-ui/icon/es/_old'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import _ from 'lodash'

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
      isDisabled: false,
      clusterSurplus: 0,
      globaleSurplus: 0,
      globaleUseList: [],
      clusterUseList: [],
      quotas: {
        globalResource: [],
        clusterResource: [],
      },
      globalUnlimited: [], // 被设置成无限制的key
      clusterUnlimited: [], // 被设置成无限制的key
    }
  }
  componentWillMount() {
    this.fetchQuota()
  }
  quotaSuffix = type => {
    switch (type) {
      case 'cpu':
        return 'C'
      case 'memory':
        return 'GB'
      case 'storage':
        return 'GB'
      default:
        return '个'
    }
  }
  async fetchQuota(key) {
    const {
      getGlobaleQuota,
      getGlobaleQuotaList,
      getResourceDefinition,
      getClusterQuota,
      getClusterQuotaList,
      projectName,
      getDevopsGlobaleQuotaList,
      namespace,
      getProjectVisibleClusters,
    } = this.props
    const query = {
      id: key,
      header: {
        teamspace: projectName,
        onbehalfuser: ''
      }
    }
    /**
     * 获取资源定义，目的为了让资源配额管理支持后台动态设置
     */
    getResourceDefinition({
      success: {
        func: res => {
          if(res.code === 200) {
            const cluster = res.data.clusterResource
            const global = res.data.globalResource
            const { definitions } = res.data
            const classify = (all,accord) => {
              const newArr = []
              for (const v of all) {
                for (const k in accord) {
                  if(parseInt(k) === v.id) {
                    newArr.push(v)
                  }
                }

                if( v.children) {
                  for(const item of v.children) {
                    for (const k in accord) {
                      if((parseInt(k) === item.id || accord[k] === item.id) && newArr.indexOf(v)<0) {
                        if (v.id === 10014) {
                          v.children = v.children.filter(j => accord[k] === j.resourceType)
                        }
                        newArr.push(v)
                      }
                    }
                  }
                }
              }
              // 格式化数据
              newArr.forEach((v, i) => {
                v.name = v.resourceName
                if(v.children) {
                  for(const k of v.children) {
                    k.name = k.resourceName
                    k.id = k.resourceType
                  }
                }else if(v.resourceType && !v.children) {
                  // 判断如果没有children但是有resourceType，那么也是资源
                  const children = {
                    id: v.resourceType,
                    name: v.resourceName,
                  }
                }
              })
              return newArr
            }
            const quotas = {
              globalResource: classify(_.cloneDeep(definitions),_.cloneDeep(global)),
              clusterResource: classify(_.cloneDeep(definitions),_.cloneDeep(cluster))
            }
            this.setState({
              quotas
            })

          }

        },
        isAsync: true
      }
    })
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
              globaleUseList: { ...this.state.globaleUseList, ...res.data }
            })
          }
        },
        isAsync: true
      }
    })
    let { cluster } = this.state
    const clustersRes = await getProjectVisibleClusters(projectName, { failed: {} }) || {}
    const clusters = getDeepValue(clustersRes, [ 'response', 'result', 'data', 'clusters' ]) || []
    if (!clusters || clusters.length < 1) {
      cluster = ''
      this.setState({
        cluster,
        quotaName: '-',
      })
      return
    }
    let targetCluster
    clusters.forEach(clusterItem => {
      if (clusterItem.clusterID === cluster) {
        targetCluster = clusterItem
      }
    })
    if (!targetCluster) {
      targetCluster = clusters[0]
      cluster = targetCluster.clusterID
      query.id = cluster
      this.setState({
        cluster,
        quotaName: targetCluster.clusterName,
      })
    }
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
    getDevopsGlobaleQuotaList(query, {
      success: {
        func: res => {
          if (REG.test(res.status)) {
            this.setState({
              globaleUseList: { ...this.state.globaleUseList, ...res.result }
            })
          }
        }
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
    const { putGlobaleQuota, projectName, namespace } = this.props
    const { validateFields } = this.props.form
    let notify = new NotificationHandler()
    validateFields((error, value) => {
      if (!!error) return
      const header = {
        teamspace: projectName
      }

      let body = {}
      // 将被设置成无限制的key放到参数里
      for (const v of this.state.globalUnlimited) {
        body[v] = null
      }
      for(let k in value) {
        if(typeof value[k] === 'string' || typeof value[k] === 'number') {
          body[k] = Number(value[k])
        }
      }
      let query = {
        header,
        body
      }
      putGlobaleQuota(query, {
        success: {
          func: res => {
            const { cluster } = this.state
            const { getGlobaleQuota, projectName, namespace } = this.props
            const query = {
              id: cluster,
              header: {
                teamspace: projectName
              }
            }
            if (res.statusCode === 200) {
              notify.success('设置成功')
              getGlobaleQuota(query, {
                success: {
                  func: res => {
                    if (REG.test(res.code)) {
                      this.setState({
                        gIsEdit: false,
                        globaleList: res.data
                      })
                    }
                  },
                  isAsync: true
                }
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
    const { putClusterQuota, getClusterQuota, projectName, namespace } = this.props
    const { validateFields } = this.props.form
    validateFields((error, value) => {
      if (!!error) return
      const header = {
        teamspace: projectName
      }
      // 把编辑的字段过滤出来，发送给后台
      let body = {}
      for (const v of this.state.clusterUnlimited) {
        body[v] = null
      }
      for(let k in value) {
        if(typeof value[k] === 'string' || typeof value[k] === 'number') {
          body[k] = Number(parseFloat(value[k]).toFixed(2))
        }
      }
      let query = {
        id: cluster,
        header,
        body
      }
      putClusterQuota(query, {
        success: {
          func: res => {
            if (res.statusCode === 200) {
              notify.success('设置成功')
              getClusterQuota(query, {
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
    let count = -1
    if (globaleList) {
      for( let k in globaleList) {
        if(k === camelize(value)) {
          count = globaleList[k] !== null ? globaleList[k] : -1
        }
      }
      //
      // Object.keys(globaleList).forEach((item, index) => {
      //   if (item === value) {
      //     count = Object.values(globaleList)[index] !== null ? Object.values(globaleList)[index] : -1
      //   }
      // })
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
    let count = -1
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
        secret: value.secret,
        mysql: value.mysql,
        redis: value.redis,
        zookeeper: value.zookeeper,
        elasticsearch: value.elasticsearch,
        etcd: value.etcd
      }
    })
    return plus
  }

  filterValue(value) {
    return value.replace(/[()]个[()]/g, '')
  }

  checkInputValue = (rules, value, callback, text, key) => {
    const { form } = this.props
    const isCheck = form.getFieldValue(`${key}-check`)
    if (isCheck) {
      return callback()
    }
    if (!value) {
      return callback(`${this.filterValue(text)}配额不能为空`)
    }
    if (value < 0) {
      return callback(`${this.filterValue(text)}配额数量不能小于0`)
    }
    let reg = /^[1-9]\d*(\.\d{1,2})?$/
    if (!reg.test(value)) {
      return callback(`${this.filterValue(text)}配额格式不正确`)
    }
    callback()
  }

  globalValueCheck = (rules, value, callback, text, key) => {
    const { form } = this.props
    const isCheck = form.getFieldValue(`${key}-check`)
    if (isCheck) {
      return callback()
    }
    if (!value) {
      return callback(`${this.filterValue(text)}配额不能为空`)
    }
    if (value < 0) {
      return callback(`${this.filterValue(text)}配额数量不能小于0`)
    }
    let reg = /^[1-9]*[1-9][0-9]*$/
    if (!reg.test(value)) {
      return callback(`${this.filterValue(text)}配额数量必须是整数`)
    }
    callback()
  }
  icon = name => {
    switch (name) {
      case 'CI/CD':
        return <span>
            <TenxIcon type="lift-card-o"/>&nbsp;
        </span>

      case '交付中心':
        return <span>
          <TenxIcon type="center-o"/>
          &nbsp;
        </span>
      case '应用管理':
        return <span>
            <TenxIcon type="apps"/>&nbsp;
        </span>
      case '数据库与缓存':
        return <span>
          <TenxIcon type="database-o"/>&nbsp;
        </span>
      default:
        return ''
    }
  }

  render() {
    const { gIsEdit, cIsEdit, isDisabled, inputsDisabled, quotaName, sum, cluster } = this.state //属性
    const { globaleList, clusterList } = this.state //数据
    const { clusterData, clusterName, outlineRoles=[], projectName, projectDetail,
       showProjectName, roleNameArr, clustersFetching
     } = this.props
    const newshowProjectName = showProjectName
    //默认集群
    const menu = (
      <Menu onClick={(e) => this.handleOnMenu(e)}>
        {
          clusterData.length > 0
          ? clusterData.map((item, index) => (
              <Menu.Item key={item.clusterID}>
                <span>{item.clusterName}</span>
              </Menu.Item>
            ))
          : <Menu.Item disabled>
            暂无授权集群
          </Menu.Item>
        }
      </Menu>
    )

    const { getFieldProps, getFieldValue, setFieldsValue, setFields, getFieldError } = this.props.form
    return (
      <Form form={this.props.form} className="quota">
        <div className="topDesc">
          {
            ( this.props.role !== ROLE_SYS_ADMIN &&
              this.props.role !== ROLE_PLATFORM_ADMIN &&
              (outlineRoles.includes('manager') )
            ) ?
            <div className="applyLimitBtn">
              <Link to={`/tenant_manage/applyLimit?${toQuerystring(newshowProjectName)}`}>
                <Button type="primary" >配额申请</Button>
              </Link>
            </div> : ''
          }
          { ( roleNameArr && ( !roleNameArr.length || (roleNameArr.length === 1 && roleNameArr[0] === '项目访客')))
            && <div className="alertTips">Tips: 可联系项目管理员申请配额</div> }
          <div className="titles"><span>项目全局资源配额</span></div>
        </div>
        {
          gIsEdit ?
            <div className="globaleEdit">
              <Button size="large" className="close" onClick={() => this.handleGlobaleClose()}>取消</Button>
              <Button size="large" className="save" type="primary" onClick={(e) => this.handleGlobaleSave(e)}>保存</Button>
              {/* <span className="header_desc">修改配额，将修改 <p className="sum">{this.handleGlobalePlus()}</p> 个资源配额</span> */}
            </div> :
            this.props.role === ROLE_SYS_ADMIN || this.props.role === ROLE_PLATFORM_ADMIN ?
              <Button size="large" className="btn" type="primary" onClick={() => this.handleGlobaleEdit()}>编辑</Button> : ''
        }

        <div className="connent">
          {
            gIsEdit ?
              <div className="overallEdit">
                {
                  this.state.quotas.globalResource.map((v, i) => {
                    return (
                      <div>
                        <div>
                          {this.icon(v.name)}
                          <span>{v.name}</span>
                        </div>
                        {
                          v.children ?
                            v.children.map((item, index) => {
                              const inputValue = getFieldValue(item.id)
                              const beforeValue = this.maxGlobaleCount(item.id)
                              const plusValue = beforeValue === -1 ? inputValue : inputValue - beforeValue
                              const checkKey = `${item.id}-check`
                              const checkProps = getFieldProps(checkKey, {
                                initialValue: beforeValue === -1 ? true : false,
                                onChange: (e) => {
                                  const unlimitedKeys=this.state.globalUnlimited
                                  if(e.target.checked) {
                                    setFieldsValue({
                                      [item.id]: null,
                                    })
                                    unlimitedKeys.push(item.id)
                                    this.setState({
                                      globalUnlimited: unlimitedKeys,
                                    })
                                  }else {
                                    unlimitedKeys.splice(unlimitedKeys.indexOf(item.id), 1)
                                    this.setState({
                                      globalUnlimited: unlimitedKeys
                                    })
                                    setFieldsValue({
                                      [item.id]: this.maxGlobaleCount(item.id) === -1 ? null : this.maxGlobaleCount(item.id)
                                    })
                                  }
                                },
                                valuePropName: 'checked',
                              })
                              const checkValue = getFieldValue(checkKey)
                              const id = item.id? item.id : 'id'
                              const inputProps = getFieldProps(`${id}`, {
                                rules: [
                                  {
                                    validator: (rules, value, callback) => this.globalValueCheck(rules, value, callback, item.name, item.id)
                                  },
                                ],
                                initialValue: globaleList ? checkValue === true ? undefined : beforeValue === -1 ? undefined : beforeValue : undefined,
                              })
                              const surplu = inputProps.value !== undefined
                                ? Math.round((inputProps.value - this.useGlobaleCount(item.id)) * 100) / 100
                                : '无限制'
                              return (
                                <Row key={item.id} className="connents">
                                  <Col span={3} style={{ minWidth: '120px' }}>
                                    <span>{item.name + `(${this.quotaSuffix(item.resourceType)})`}</span>
                                  </Col>
                                  <Col span={7} style={{ height: 'auto' }}>
                                    <FormItem
                                      className={classNames({'has-error': getFieldError(`${item.id}`)})}
                                      help={(getFieldError(`${item.id}`) || []).join(', ')}
                                    >
                                      <Input {...inputProps} disabled={checkValue} placeholder="请输入授权配额数量" style={{ width: '100%' }} id="input" />
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
                            :
                            ''
                        }
                        { i !== this.state.quotas.globalResource.length-1?
                          <p className="line"></p> : ''
                        }

                      </div>
                    )
                  })
                }
              </div> :
              <div className="overall">
                {
                  this.state.quotas.globalResource.map((v, i) => {
                    return (
                      <div key={v.id}>
                        <div>
                          {this.icon(v.name)}
                          <span>{v.name}</span>
                        </div>
                        {
                          v.children ?
                            v.children.map((item, index) => {
                              return (
                                <Row className="list" key={index}>
                                  <Col span={3} style={{ minWidth: '120px' }}>
                                    <span>{item.name + ` (${this.quotaSuffix(item.resourceType)})`}</span>
                                  </Col>
                                  <Col span={10}>
                                    <Progress percent={this.filterPercent(this.maxGlobaleCount(item.id), this.useGlobaleCount(item.id))} showInfo={false} />
                                  </Col>
                                  <Col span={4}>
                                    {
                                      this.useGlobaleCount(item.id) > this.maxGlobaleCount(item.id) ?
                                        this.maxGlobaleCount(item.id) === -1 ?
                                          <span>{this.useGlobaleCount(item.id)}</span> :
                                          <span style={{ color: 'red' }}>{this.useGlobaleCount(item.id)}</span> : <span>{this.useGlobaleCount(item.id)}</span>
                                    }/<p>{this.maxGlobaleCount(item.id) === -1 ? '无限制' : this.maxGlobaleCount(item.id)}</p>
                                  </Col>
                                </Row>
                              )
                            })
                            :
                            ''
                        }
                        { i !== this.state.quotas.globalResource.length-1?
                          <p className="line"></p> : ''
                        }

                      </div>
                    )
                  })
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
          {
            clustersFetching &&
            <div className="loadingTips">loading ...</div>
          }
          {
            !clustersFetching && !cluster &&
            <div className="loadingTips">暂无授权集群</div>
          }
          {
            !clustersFetching && cluster &&
            [
              <div className="header" key="header">
                {
                  cIsEdit ?
                    <div>
                      <Button size="large" className="close" onClick={() => this.handleClusterClose()}>取消</Button>
                      <Button size="large" className="save" type="primary" onClick={(e) => this.handleClusterOk(e)}>保存</Button>
                      {/* <span className="header_desc">修改配额，将修改 <p className="sum">{this.handaleClusterPlus()}</p> 个资源配额</span> */}
                    </div> :
                    this.props.role === ROLE_SYS_ADMIN || this.props.role === ROLE_PLATFORM_ADMIN ?
                      <Button size="large" className="edit" type="primary" onClick={() => this.handleClusterEdit()}>编辑</Button> : ''
                }
              </div>,
              <div className="liste" key="liste">
                {
                  cIsEdit ?
                    <div className="edit">
                      {
                        this.state.quotas.clusterResource.map(v => {
                          return (
                            <div key={v.id}>
                              <span>{v.name}</span>
                              {
                                v.children ?
                                  v.children.map((k, i) => {
                                    if (k.children) {
                                      return <div className="platform" key={k.id}>
                                        {this.icon(k.name)}
                                        <span>{k.name + ` (${this.quotaSuffix(k.resourceType)})`}</span>
                                        {
                                          k.children.map(item => {
                                            const inputValue = getFieldValue(item.id)
                                            const beforeValue = this.maxClusterCount(item.id)
                                            let plusValue = beforeValue === -1 ? inputValue : inputValue - beforeValue
                                            plusValue = Math.floor(plusValue * 100) / 100
                                            const isPlus = inputValue > beforeValue ? true : false
                                            const checkKey = `${item.id}-check`
                                            const checkProps = getFieldProps(checkKey, {
                                              initialValue: beforeValue === -1 ? true : false,
                                              onChange: (e) => {
                                                const unlimitedKeys=this.state.clusterUnlimited
                                                if(e.target.checked) {
                                                  setFieldsValue({
                                                    [item.id]: null,
                                                  })
                                                  unlimitedKeys.push(item.id)
                                                  this.setState({
                                                    clusterUnlimited: unlimitedKeys,
                                                  })
                                                }else {
                                                  unlimitedKeys.splice(unlimitedKeys.indexOf(item.id), 1)
                                                  this.setState({
                                                    clusterUnlimited: unlimitedKeys
                                                  })
                                                  setFieldsValue({
                                                    [item.id]: this.maxClusterCount(item.id) === -1 ? null : this.maxClusterCount(item.id)
                                                  })
                                                }

                                                // e.target.checked ? setFieldsValue({
                                                //   [item.id]: null,
                                                // }) : setFieldsValue({
                                                //   [item.id]: this.maxClusterCount(item.id) === -1 ? null : this.maxClusterCount(item.id)
                                                // })
                                              },
                                              valuePropName: 'checked',
                                            })
                                            const checkValue = getFieldValue(checkKey)
                                            const id = item.id? item.id: 'id'
                                            const inputProps = getFieldProps(`${id}`, {
                                              rules: [
                                                {
                                                  validator: (rules, value, callback) => this.globalValueCheck(rules, value, callback, item.name, item.id)
                                                }
                                              ],
                                              initialValue: clusterList ? checkValue === true ? undefined : this.maxClusterCount(item.id) === -1 ? undefined : this.maxClusterCount(item.id) : 0
                                            })
                                            const surplus = inputProps.value !== undefined
                                              ? Math.round((inputProps.value - this.useClusterCount(item.id)) * 100) / 100
                                              : '无限制'
                                            return (
                                              <Row key={item.id} className="connents">
                                                <Col span={3} style={{ minWidth: '120px' }}>
                                                  <span>{item.name}</span>
                                                </Col>
                                                <Col span={7} style={{ height: 'auto' }}>
                                                  <FormItem>
                                                    <Input {...inputProps} disabled={checkValue} placeholder="请输入授权配额数量" id={item.id || 'id'} style={{ width: '100%' }} />
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
                                        {
                                          i !== v.children.length - 1?
                                            <p className="line"></p>
                                            :
                                            ''
                                        }

                                      </div>
                                    }
                                    const inputValue = getFieldValue(k.id)
                                    const beforeValue = this.maxClusterCount(k.id)
                                    let plusValue = beforeValue === -1 ? inputValue : inputValue - beforeValue
                                    plusValue = Math.floor(plusValue * 100) / 100
                                    const checkKey = `${k.id}-check`
                                    const checkProps = getFieldProps(checkKey, {
                                      initialValue: beforeValue === -1 ? true : false,
                                      onChange: (e) => {
                                        const unlimitedKeys=this.state.clusterUnlimited
                                        if(e.target.checked) {
                                          setFieldsValue({
                                            [k.id]: null,
                                          })
                                          unlimitedKeys.push(k.id)
                                          this.setState({
                                            clusterUnlimited: unlimitedKeys,
                                          })
                                        }else {
                                          unlimitedKeys.splice(unlimitedKeys.indexOf(k.id), 1)
                                          this.setState({
                                            clusterUnlimited: unlimitedKeys
                                          })
                                          setFieldsValue({
                                            [k.id]: this.maxClusterCount(k.id) === -1 ? null : this.maxClusterCount(k.id)
                                          })
                                        }
                                      },
                                      valuePropName: 'checked'
                                    })
                                    const checkValue = getFieldValue(checkKey)
                                    let id = k.id? k.id : 'id'
                                    const inputProps = getFieldProps(id, {
                                      // rules: (!checkValue && !this.state[`${k.id}-check`]) ? [
                                      //   {
                                      //     validator: (rules, value, callback) => this.checkInputValue(rules, value, callback, k.name)
                                      //   }
                                      // ] : [],
                                      rules:  [
                                        {
                                          validator: (rules, value, callback) => this.checkInputValue(rules, value, callback, k.name, k.id)
                                        }
                                      ],
                                      initialValue: clusterList ? checkValue === true ? undefined : beforeValue === -1 ? undefined : beforeValue : undefined
                                    })
                                    const surplus = inputProps.value !== undefined
                                      ? Math.round((inputProps.value - this.useClusterCount(k.id)) * 100) / 100
                                      : '无限制'
                                    return (
                                      <Row key={k.id} className="connents">
                                        <Col span={3} style={{ minWidth: '120px', height: 'auto' }}>
                                          <span>{k.name + ` (${this.quotaSuffix(k.resourceType)})`}</span>
                                        </Col>
                                        <Col span={7} style={{ height: 'auto' }}>
                                          <FormItem>
                                            <Input {...inputProps} id={k.id || 'id'} disabled={checkValue} placeholder="请输入授权配额数量" style={{ width: '100%' }} />
                                          </FormItem>
                                        </Col>
                                        <Col span={3} style={{ height: 'auto' }}>
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
                                  :
                                  ''
                              }
                            </div>
                          )
                        })
                      }
                    </div> :
                    <div className="lists">
                      {
                        this.state.quotas.clusterResource.map((v, i) => {
                          return (
                            <div className="quotaItem">
                              <span>{v.name}</span>
                              {
                                v.children?
                                  v.children.map((k, current) => {
                                    return k.children ?
                                      <div key={k.id} className="childrenItem">
                                        {this.icon(k.name)}
                                        <span>{k.name}</span>
                                        {
                                          k.children.map(item => (
                                            <Row className="list" key={item.id}>
                                              <Col span={3} style={{ minWidth: '120px' }}>
                                                <span>{item.name + ` (${this.quotaSuffix(item.resourceType)})`}</span>
                                              </Col>
                                              <Col span={10}>
                                                <Progress percent={this.filterPercent(this.maxClusterCount(item.id), this.useClusterCount(item.id))} showInfo={false} />
                                              </Col>
                                              <Col span={4}>
                                                {
                                                  this.useClusterCount(item.id) > this.maxClusterCount(item.id) ?
                                                    this.maxClusterCount(item.id) === -1 ?
                                                      <span>{this.useClusterCount(item.id)}</span> :
                                                      <span style={{ color: 'red' }}>{this.useClusterCount(item.id)}</span> :
                                                    <span>{this.useClusterCount(item.id)}</span>
                                                }/<p>{this.maxClusterCount(item.id) === -1 ? '无限制' : this.maxClusterCount(item.id)}</p>

                                              </Col>
                                            </Row>
                                          ))
                                        }
                                        { current !== v.children.length-1?
                                          <p className="line"></p> : ''
                                        }

                                      </div>
                                      :
                                      <Row className="list" key={k.id}>
                                        <Col span={3} style={{ minWidth: '120px' }}>
                                          <span>{k.name + ` (${this.quotaSuffix(k.resourceType)})`}</span>
                                        </Col>
                                        <Col span={10}>
                                          <Progress percent={this.filterPercent(this.maxClusterCount(k.id), this.useClusterCount(k.id))} showInfo={false} />
                                        </Col>
                                        <Col span={4}>
                                          {
                                            this.useClusterCount(k.id) > this.maxClusterCount(k.id) ?
                                              this.maxClusterCount(k.id) === -1 ?
                                                <span>{this.useClusterCount(k.id)}</span> :
                                                <span style={{ color: 'red' }}>{this.useClusterCount(k.id)}</span> :
                                              <span>{this.useClusterCount(k.id)}</span>
                                          }/<p>{this.maxClusterCount(k.id) === -1 ? '无限制' : this.maxClusterCount(k.id)}</p>
                                        </Col>
                                      </Row>
                                  })
                                  :
                                  ''
                              }
                            </div>

                          )
                        })
                      }
                    </div>
                }
              </div>
            ]
          }
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
      </Form>
    )
  }
}
ResourceQuota = createForm()(ResourceQuota)
function mapStateToProps(state, props) {
  const { current, loginUser } = state.entities
  const { clusterName } = current.cluster
  const { role } = loginUser.info
  const { namespace } = loginUser.info
  const { projectVisibleClusters } = state.projectAuthority
  const project = props.projectName
  const clusterData = projectVisibleClusters[project] || {}

  return {
    role,
    namespace,
    clusterName,
    clusterData: clusterData.data || [],
    clustersFetching: clusterData.isFetching,
  }
}

export default connect(mapStateToProps, {
  getGlobaleQuota,
  getClusterQuota,
  getClusterQuotaList,
  getGlobaleQuotaList,
  getResourceDefinition,
  putGlobaleQuota,
  putClusterQuota,
  getDevopsGlobaleQuotaList,
  getProjectVisibleClusters,
})(ResourceQuota)
