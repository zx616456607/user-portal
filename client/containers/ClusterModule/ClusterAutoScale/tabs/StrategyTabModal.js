/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2018-04-08
 * @author rensiwei
 */
import React from 'react'
import { Modal, Input, Select, Row, Form, Spin, Icon } from 'antd'
import '../style/tabModal.less'
import classNames from 'classnames'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler'
import { connect } from 'react-redux'
import filter from 'lodash/filter'
import NotificationHandler from '../../../../../src/components/Notification'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { IP_REGEX } from '../../../../../constants'

const notify = new NotificationHandler()
const FormItem = Form.Item
const disabledIcons = [ 'aws', 'azure', 'ali' ] // 不支持的资源池

const mapStateToProps = state => {
  const { appAutoScaler } = state
  const { getAutoScalerClusterList } = appAutoScaler
  const { clusterList, isModalFetching } =
    getAutoScalerClusterList || { clusterList: [], isModalFetching: false }
  return {
    clusterList,
    isModalFetching,
  }
}

export default connect(mapStateToProps, {
  getAutoScalerClusterList: autoScalerActions.getAutoScalerClusterList,
  addServer: autoScalerActions.createServer,
  updateServer: autoScalerActions.updateServer,
  getServerList: autoScalerActions.getServerList,
})(Form.create()(class Tab2Modal extends React.Component {
  clickIcon = value => {
    const { isEdit } = this.props
    const { currDis } = this.state
    let flag = true
    for (const item in currDis) {
      if (currDis[item] === false) {
        flag = false
        break
      }
    }
    if (isEdit || currDis[value] || flag) return
    this.setState({ currentIcon: value })
  }
  state = {
    currentIcon: '',
    selectValue: undefined,
    disabled: false,
    isShowPassword: false,
    isPasswordReadOnly: true, // 防止密码填充表单
    submitLoading: false,
    allClusterIds: [],
    objCluster: {},
    currDis: {},
  }
  componentDidMount() {
    // 接收参数
    this.getQueryData()
    this.getServers()
    this.setCurrDis()
  }
  setCurrDis = () => {
    const { objCluster } = this.state
    const { isEdit } = this.props
    let objProvider
    objCluster ?
      objProvider = objCluster.provider
      :
      objProvider = { vmware: false, aws: false, azure: false, ali: false, openstack: false }
    if (isEdit) {
      objProvider = { vmware: true, aws: true, azure: true, ali: true, openstack: true }
    }
    const temp = {}
    temp.vmware = isEdit ||
        disabledIcons.indexOf('vmware') > -1 ||
        (!!objProvider && objProvider.vmware) // true 为已配置 false为未配置
    temp.openstack = isEdit ||
        disabledIcons.indexOf('openstack') > -1 ||
        (!!objProvider && objProvider.openstack)
    temp.aws = isEdit ||
        disabledIcons.indexOf('aws') > -1 ||
        (!!objProvider && objProvider.aws)
    temp.azure = isEdit ||
        disabledIcons.indexOf('azure') > -1 ||
        (!!objProvider && objProvider.azure)
    temp.ali = isEdit ||
        disabledIcons.indexOf('ali') > -1 ||
        (!!objProvider && objProvider.ali)
    this.setState({
      currDis: temp,
    })
  }
  getServers = () => {
    this.props.getServerList({}, {
      success: {
        func: res => {
          const allClusterIds = {}
          if (res.data) {
            res.data.map(item => {
              const temp = allClusterIds[item.iaas]
              if (temp) {
                temp.push(item.cluster)
              } else {
                allClusterIds[item.iaas] = [ item.cluster ]
              }
              return item
            })
            this.setState({
              allClusterIds,
            })
          }
        },
        isAsync: true,
      },
    })
  }
  getQueryData() {
    const { getAutoScalerClusterList, currData, isEdit } = this.props
    getAutoScalerClusterList().then(() => {
      if (isEdit && !!currData) {
        this.setState({
          disabled: true,
          currentIcon: currData.iaas,
          selectValue: currData.cluster,
        })
      }
    })
  }
  onClusterChange = value => {
    const { clusterList } = this.props
    this.setState({
      selectValue: value,
      objCluster: filter(clusterList, { clusterid: value })[0] || {},
    }, () => {
      this.setCurrDis()
    })
    return value
  }
  checkParams = () => {
    return this.checkIaas() && this.checkCluster()
  }
  checkIaas = () => {
    let b = true
    if (!this.state.currentIcon) {
      notify.warn('请选择Iaas平台')
      b = false
    }
    return b
  }
  checkCluster = () => {
    let b = true
    const { selectValue } = this.state
    if (!selectValue) {
      notify.warn('请选择容器集群')
      b = false
    }
    return b
  }
  onCancel = () => {
    const { form, onCancel } = this.props
    form.resetFields()
    onCancel(this.resetState)
  }
  resetState = () => {
    this.setState({
      currentIcon: '',
      selectValue: '',
      disabled: false,
      isShowPassword: false,
      isPasswordReadOnly: true, // 防止密码填充表单
      submitLoading: false,
    })
  }
  formatDate = (date, fmt) => {
    const o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'H+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
    }
    if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }
    return fmt
  }

  onTab2ModalOk = () => {
    if (!this.checkParams()) return
    const { form, isEdit } = this.props
    form.validateFields((errors, values) => {
      if (!!errors || (errors === null && JSON.stringify(values) === '{}')) {
        return
      }
      this.setState({
        submitLoading: true,
      }, () => {
        // 新增、修改接口
        const { addServer, updateServer, funcTab1, funcTab2 } = this.props
        const { selectValue, currentIcon } = this.state
        const names = currentIcon === 'openstack' ? '身份认证 API 地址, 用户域, 登录用户名, 登录密码' : 'vSphere地址, 登录用户名, 登录密码'
        const date = new Date()
        const dateString = this.formatDate(date, 'yyyy-MM-dd HH:mm:ss')
        const params = Object.assign({}, {
          iaas: currentIcon,
          // name: this.state.name,
          // password: this.state.password,
          // server: this.state.vSphere,
          cluster: selectValue,
          date: dateString,
        })
        params.name = values.Username
        params.password = values.Userpassword
        params.server = values.server
        if (values.projectDomainName) params.projectDomainName = values.projectDomainName
        if (values.projectName) params.projectName = values.projectName
        if (values.domainName) params.domainName = values.domainName
        if (isEdit) {
          updateServer(params, {
            success: {
              func: () => {
                notify.success('资源池配置更新成功')
                if (funcTab2) {
                  funcTab2.loadData()
                  funcTab2.scope.setState({
                    isTab2ModalShow: false,
                    pagination: {
                      current: 1,
                      defaultCurrent: 1,
                      pageSize: 5,
                    }, // 分页配置
                    paginationCurrent: 1,
                  })
                }
              },
              isAsync: true,
            },
            failed: {
              func: err => {
                const { statusCode } = err
                if (statusCode === 401) {
                  return notify.warn(`更新资源池配置失败，请确认【${names}】配置是否正确`)
                }
                if (statusCode === 404 && currentIcon === 'openstack') {
                  return notify.warn('更新资源池配置失败，请确认【项目域, 项目名】配置是否正确')
                }
                notify.warn('更新资源池配置失败')
              },
            },
            finally: {
              func: () => {
                this.setState({
                  submitLoading: false,
                })
              },
              isAsync: true,
            },
          })
        } else {
          addServer(params,
            {
              success: {
                func: () => {
                  notify.success('资源池配置新建成功')
                  if (funcTab2) {
                    funcTab2.loadData()
                    funcTab2.scope.setState({ isTab2ModalShow: false,
                      pagination: {
                        current: 1,
                        defaultCurrent: 1,
                        pageSize: 5,
                      }, // 分页配置
                      paginationCurrent: 1 })
                  } else if (funcTab1) {
                    funcTab1.scope.onTab2ModalCancel()
                  }
                },
                isAsync: true,
              },
              failed: {
                func: err => {
                  const { statusCode } = err
                  if (statusCode === 401) {
                    return notify.warn(`新建资源池配置失败，请确认【${names}】配置是否正确`)
                  }
                  if (statusCode === 404 && currentIcon === 'openstack') {
                    return notify.warn('新建资源池配置失败，请确认【项目域, 项目名】配置是否正确')
                  }
                  notify.warn('新建资源池配置失败')
                },
              },
              finally: {
                func: () => {
                  this.setState({
                    submitLoading: false,
                  })
                },
                isAsync: true,
              },
            })
        }
      })
    })
  }
  changePasswordType = () => {
    this.setState({
      isShowPassword: !this.state.isShowPassword,
    })
  }
  checkIp = (rule, value, callback, label) => {
    // if (!value) {
    //   return callback(new Error('请输入' + label))
    // }
    if (!IP_REGEX.test(value)) {
      return callback(new Error('请输入正确的' + label))
    }
    callback()
  }
  checkHost = (rule, value, callback, label) => {
    // if (!value) {
    //   return callback(new Error('请输入' + label))
    // }
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return callback(new Error('请输入正确的' + label))
    }
    // if (!/^((http|https):\/\/)?(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])+(:[0-9]{1,5})(\/[a-zA-Z0-9-]+)?$/.test(value)) {
    //   return callback(new Error('请输入正确的' + label))
    // }
    callback()
  }
  render() {
    const { clusterList, isModalFetching, currData,
      form, visible, onClose, isEdit } = this.props
    const { getFieldProps } = form
    const { currentIcon, currDis,
      allClusterIds, selectValue, disabled, submitLoading } = this.state
    const currIconClusters = allClusterIds[currentIcon]
    const options = clusterList ?
      clusterList.map((o, i) =>
        <Select.Option
          disabled={
            currIconClusters && currIconClusters.length > 0 &&
            currIconClusters.indexOf(o.clusterid) > -1}
          key={i} value={o.clusterid}>{o.clustername}</Select.Option>) : null
    // !!options && options.unshift(<Select.Option key="-1" value=""><span className="optionValueNull">请选择容器集群</span></Select.Option>)

    const iconClass1 = classNames({
      iconCon: true,
      iconvmware: true,
      selectedBox: currentIcon === 'vmware',
      iconConDis: currDis.vmware,
    })
    const iconClassOS = classNames({
      iconCon: true,
      iconopenstack: true,
      selectedBox: currentIcon === 'openstack',
      iconConDis: currDis.openstack, // true 为已配置 false为未配置
    })

    const iconClass2 = classNames({
      iconCon: true,
      iconaws: true,
      selectedBox: currentIcon === 'aws',
      iconConDis: currDis.aws,
    })
    const iconClass3 = classNames({
      iconCon: true,
      iconazure: true,
      selectedBox: currentIcon === 'azure',
      iconConDis: currDis.azure,
    })
    const iconClass4 = classNames({
      iconCon: true,
      iconali: true,
      selectedBox: currentIcon === 'ali',
      iconConDis: currDis.ali,
    })
    const formItemLargeLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    }
    const server = currData ? currData.server : ''
    const domainName = currData ? currData.domainName : ''
    const name = currData ? currData.name : ''
    const password = currData ? currData.password : ''
    const projectDomainName = currData ? currData.projectDomainName : ''
    const projectName = currData ? currData.projectName : ''
    let label
    if (currentIcon === 'vmware') {
      label = 'vSphere地址'
    } else if (currentIcon === 'openstack') {
      label = '身份认证 API 地址'
    }
    return (
      <Modal
        className="aotuScalerModal"
        visible={visible}
        onOk={this.onTab2ModalOk}
        onCancel={this.onCancel}
        onClose={onClose}
        title={ isEdit ? '编辑资源池配置' : '新建资源池配置'}
        okText="保存"
        width="650"
        maskClosable={false}
        confirmLoading={submitLoading}
      >
        {isModalFetching ?
          <div className="loadingBox">
            <Spin size="large"/>
          </div>
          :
          <Form horizontal >
            <Row key="row1">
              <FormItem
                {...formItemLargeLayout}
                label="容器集群"
              >
                <Select disabled={disabled} value={selectValue} onChange={value => { this.onClusterChange(value) }} placeholder="请选择容器集群" style={{ width: '100%' }}>
                  {options}
                </Select>
              </FormItem>
            </Row>
            <div className="bottom-line"></div>
            <div className="topIconContainer">
              <div className={iconClass1} data-name="vmware" onClick={ () => { this.clickIcon('vmware') }}>
                <div className="icon"></div>
                <div className="name">vmware</div>
                <svg className="commonSelectedImg">
                  {/* @#selected*/}
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={iconClassOS} data-name="openstack" onClick={ () => { this.clickIcon('openstack') }}>
                <div className="icon">
                  <TenxIcon style={{ color: '#da1a32' }} type="openstack" />
                </div>
                <div className="name">openstack</div>
                <svg className="commonSelectedImg">
                  {/* @#selected*/}
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>

              <div className={iconClass2} data-name="aws" onClick={ () => { this.clickIcon('aws') }}>
                <div className="icon"></div>
                <div className="name">aws</div>
                <svg className="commonSelectedImg">
                  {/* @#selected*/}
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={iconClass3} data-name="azure" onClick={ () => { this.clickIcon('azure') }}>
                <div className="icon"></div>
                <div className="name">azure</div>
                <svg className="commonSelectedImg">
                  {/* @#selected*/}
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={iconClass4} data-name="ali" onClick={ () => { this.clickIcon('ali') }}>
                <div className="icon"></div>
                <div className="name">aliyun</div>
                <svg className="commonSelectedImg">
                  {/* @#selected*/}
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className="bottom-line"></div>
            {
              currentIcon === 'openstack' || currentIcon === 'vmware' ?
                <div className="formContainer" style={{ paddingTop: 20 }}>
                  <Row key="row2">
                    <FormItem
                      {...formItemLargeLayout}
                      label={label}
                    >
                      <Input {...getFieldProps('server', { initialValue: server,
                        validate: [{
                          rules: [
                            { required: true, message: '请输入' + label },
                            { validator: (rule, value, callback) =>
                              (label === '身份认证 API 地址' ?
                                this.checkHost(rule, value, callback, label)
                                :
                                this.checkIp(rule, value, callback, label)) },
                          ],
                          trigger: [ 'onChange' ],
                        }],
                      }
                      )} placeholder={currentIcon === 'vmware' ? ('请输入' + label) : 'Keystone API 地址, 例如: http://example.com:5000/v1'} />
                    </FormItem>
                  </Row>
                  {
                    currentIcon === 'openstack' ?
                      <Row key="row22">
                        <FormItem
                          {...formItemLargeLayout}
                          label="用户域"
                        >
                          <Input {...getFieldProps('domainName', { initialValue: domainName,
                            validate: [{
                              rules: [
                                { required: true, message: '请输入用户域' },
                              ],
                              trigger: [ 'onBlur', 'onChange' ],
                            }],
                          }
                          )} placeholder="请输入用户域" />
                        </FormItem>
                      </Row>
                      :
                      null
                  }
                  <Row key="row3">
                    <FormItem
                      {...formItemLargeLayout}
                      label="登录用户名"
                    >
                      <Input {...getFieldProps('Username', { initialValue: name,
                        validate: [{
                          rules: [
                            { required: true, message: '请输入登录用户名' },
                          ],
                          trigger: [ 'onBlur', 'onChange' ],
                        }],
                      }
                      )} placeholder="请输入登录用户名" />
                    </FormItem>
                  </Row>
                  <Row key="row4">
                    <FormItem
                      {...formItemLargeLayout}
                      label="登录密码"
                    >
                      <Input {...getFieldProps('Userpassword', { initialValue: password,
                        validate: [{
                          rules: [
                            { required: true, message: '请输入登录密码' },
                          ],
                          trigger: [ 'onBlur', 'onChange' ],
                        }],
                      }
                      )} autoComplete="new-password"
                      readOnly={this.state.isPasswordReadOnly}
                      onFocus={() => this.setState({ isPasswordReadOnly: false })}
                      onBlur={() => this.setState({ isPasswordReadOnly: true })}
                      type={this.state.isShowPassword ? 'text' : 'password'} placeholder="请输入登录密码" />
                      {
                        this.state.isShowPassword ?
                          <Icon className="iconEye" type="eye-o" onClick={this.changePasswordType} />
                          :
                          <Icon className="iconEye" type="eye" onClick={this.changePasswordType} />
                      }
                    </FormItem>
                  </Row>

                  {
                    currentIcon === 'openstack' &&
                    [
                      <Row key="row6">
                        <FormItem
                          {...formItemLargeLayout}
                          label="项目域"
                        >
                          <Input {...getFieldProps('projectDomainName', { initialValue: projectDomainName,
                            validate: [{
                              rules: [
                                { required: true, message: '请输入项目域' },
                              ],
                              trigger: [ 'onBlur', 'onChange' ],
                            }],
                          }
                          )} placeholder="请输入项目域" />
                        </FormItem>
                      </Row>,
                      <Row key="row7">
                        <FormItem
                          {...formItemLargeLayout}
                          label="项目名"
                        >
                          <Input {...getFieldProps('projectName', { initialValue: projectName,
                            validate: [{
                              rules: [
                                { required: true, message: '请输入项目名' },
                              ],
                              trigger: [ 'onBlur', 'onChange' ],
                            }],
                          }
                          )} placeholder="请输入项目名" />
                        </FormItem>
                      </Row>,
                    ]
                  }
                </div>
                :
                null
            }
          </Form>
        }
      </Modal>
    )
  }
}))
