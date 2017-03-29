/**
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2017 TenxCloud. All Rights Reserved.
*
*  Setting GlobalConfig
*
* v0.1 - 2017/3/7
* @author ZhangChengZheng
*/
import React, { Component } from 'react'
import { Row, Col, Icon, Form, Button, Input, Spin } from 'antd'
import './style/GlobalConfig.less'
import EmailImg from '../../../assets/img/setting/globalconfigEmail.png'
import conInter from '../../../assets/img/setting/globalconfigCICD.png'
import MirrorImg from '../../../assets/img/setting/globalconfigmirror.png'
import CephImg from '../../../assets/img/setting/globalconfigceph.png'
import { connect } from 'react-redux'
import { saveGlobalConfig, updateGlobalConfig, loadGlobalConfig, isValidConfig } from '../../../actions/global_config'
import NotificationHandler from '../../../common/notification_handler'
import { getPortalRealMode } from '../../../common/tools'
import { LITE } from '../../../constants'

const FormItem = Form.Item
const mode = getPortalRealMode
const liteFlag = mode === LITE

//邮件报警
let Emaill = React.createClass({
  getInitialState() {
    return {
      isEve: false,
      canClick: true,
      aleardySave: false
    }
  },
  handleReset(e) {
    e.preventDefault();
    if (!this.state.aleardySave) {
      const { resetFields } = this.props.form
      resetFields(['service', 'email', 'password', 'emailID'])
    }
    this.props.emailChange();
  },
  handEve() {
    this.setState({ isEve: !this.state.isEve })
  },
  handleEmail() {
    this.props.emailChange()
  },
  saveEmail() {
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      if (!this.state.canClick) {
        return
      }
      const notification = new NotificationHandler()
      notification.spin('保存中')
      this.setState({
        canClick: false,
        aleardySave: true
      })
      const { form, saveGlobalConfig, updateGlobalConfig, cluster } = this.props
      const { getFieldValue } = form
      const service = getFieldValue('service')
      const email = getFieldValue('email')
      const password = getFieldValue('password')
      const emailID = getFieldValue('emailID')
      const self = this
      saveGlobalConfig(cluster.clusterID, 'mail', {
        configID: emailID,
        detail: {
          senderMail: email,
          senderPassword: password,
          mailServer: service
        }
      }, {
          success: {
            func: (result) => {
              notification.close()
              notification.success('邮件报警配置保存成功')
              const { form } = self.props
              const { getFieldProps, getFieldValue, setFieldsValue } = form
              self.handleEmail()
              if (result.data.toLowerCase() != 'success') {
                setFieldsValue({
                  emailID: result.data
                })
              }
              this.setState({
                canClick: true,
                aleardySave: true
              })
            }
          },
          failed: {
            func: (err) => {
              notification.close()
              let msg
              if (err.message.message) {
                msg = err.message.message
              } else {
                msg = err.message
              }
              notification.error('邮件报警配置保存失败 => ' + msg)
              this.setState({
                canClick: true
              })
            }
          }
        })
    })
  },
  checkService(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写邮件服务器服务器地址')])
      return
    }
    if (!/^([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      callback([new Error('请填入合法的服务器地址')])
      return
    }
    callback()
  },
  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    callback()
  },
  checkEmail(rule, value, callback) {
    if (!value) {
      return callback('请填写邮箱地址')
    }
    if (!/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(value)) {
      return callback('请填入合法的邮箱地址')
    }
    return callback()
  },
  render() {
    const { emailDisable, emailChange, config } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    let emailDetail = {
      senderMail: '',
      mailServer: '',
      senderPassword: ''
    }
    if (config) {
      emailDetail = JSON.parse(config.configDetail)
    }
    //邮件服务器
    const serviceProps = getFieldProps('service', {
      rules: [
        { validator: this.checkService }
      ],
      initialValue: emailDetail.mailServer
    });

    //邮箱
    const emailProps = getFieldProps('email', {
      rules: [{
        validator: this.checkEmail
      }],
      initialValue: emailDetail.senderMail
    });
    //密码
    const passwordProps = getFieldProps('password', {
      rules: [
        { validator: this.checkPass }
      ],
      initialValue: emailDetail.senderPassword
    });

    const emailID = getFieldProps('emailID', {
      initialValue: config ? config.configID : ''
    });

    return (
      <div className="GlobalConfigEmail">
        <div className="title">邮件报警</div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={EmailImg} alt="邮件报警" />
            </div>
            <div className="contentkeys">
              <div className="key">邮件服务器</div>
              <div className="key">邮箱</div>
              <div className="key">密码</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem >
                  <Input {...serviceProps} placeholder="如：smtp.exmail.qq.com:25" disabled={emailDisable} />
                </FormItem>
                <FormItem >
                  <Input className="temInput1" {...emailProps} type="email" placeholder="邮箱地址" disabled={emailDisable} />
                </FormItem>
                <FormItem >
                  <i className={this.state.isEve ? 'fa fa-eye activeEve' : 'fa fa-eye-slash activeEve'}
                    onClick={() => this.handEve()}></i>
                  <Input {...passwordProps} type={this.state.isEve ? "text" : "password"} placeholder="请输入密码"
                    disabled={emailDisable} />
                </FormItem>
                <FormItem>
                  {
                    emailDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleEmail}>编辑</Button>
                      : ([
                        <Button onClick={this.handleReset} className="itemInputLeft" disabled={emailDisable}>取消</Button>,
                        <Button type='primary' onClick={this.saveEmail}>保存</Button>
                      ])
                  }
                </FormItem>
                <input type="hidden" {...emailID} />
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

//持续集成
let ConInter = React.createClass({
  getInitialState() {
    return {
      canClick: true,
      aleardySave: false
    }
  },
  handleCicd() {
    this.props.cicdeditChange()
  },
  handleReset() {
    if (!this.state.aleardySave) {
      const { resetFields } = this.props.form
      resetFields(['cicd', 'cicdID'])
    }
    this.props.cicdeditChange()
  },
  saveCICD() {
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      if (!this.state.canClick) {
        return
      }
      const notification = new NotificationHandler()
      notification.spin('保存中')
      this.setState({
        canClick: false
      })
      const { form, saveGlobalConfig, updateGlobalConfig, cluster } = this.props
      const { getFieldValue } = form
      const cicd = getFieldValue('cicd')
      const api = getFieldValue('apiServer')
      const cicdID = getFieldValue('cicdID')
      const apiServerID = getFieldValue('apiServerID')
      const self = this
      const arr = cicd.split('://')
      saveGlobalConfig(cluster.clusterID, 'cicd', {
        cicdID: cicdID,
        apiServerID: apiServerID,
        cicdDetail: {
          protocol: arr[0],
          url: arr[1]
        },
        apiServerDetail: {
          url: api
        }
      }, {
          success: {
            func: (result) => {
              notification.close()
              notification.success('持续集成配置保存成功')
              const { form } = self.props
              const { setFieldsValue } = form
              self.handleCicd()
              if (result.cicd.data.toLowerCase() != 'success') {
                setFieldsValue({
                  cicdID: result.cicd.data
                })
              }
              if (result.apiServer.data.toLowerCase() != 'success') {
                setFieldsValue({
                  apiServerID: result.apiServer.data
                })
              }
              this.setState({
                canClick: true,
                aleardySave: true
              })
            }
          },
          failed: {
            func: (err) => {
              notification.close()
              let msg
              if (err.message.message) {
                msg = err.message.message
              } else {
                msg = err.message
              }
              notification.error('持续集成配置保存失败 => ' + msg)
              this.setState({
                canClick: true
              })
            }
          }
        })
    })
  },
  checkCicd(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写持续集成地址')])
      return
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的持续集成主机地址')
    }
    callback()
  },
  checkApiServer(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写API服务地址')])
      return
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的API服务地址')
    }
    callback()
  },
  render() {
    const { cicdeditDisable, cicdeditChange, cicdConfig, apiServer } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    let cicdDetail = {
      external_protocol: '',
      external_host: ''
    }
    let apiServerDetail = {
      external_protocol: '',
      external_host: ''
    }

    if (cicdConfig) {
      cicdDetail = JSON.parse(cicdConfig.configDetail)
    }
    if (apiServer) {
      apiServerDetail = JSON.parse(apiServer.configDetail)
    }
    const cicdProps = getFieldProps('cicd', {
      rules: [
        { validator: this.checkCicd }
      ],
      initialValue: cicdDetail.external_protocol ? cicdDetail.external_protocol + '://' + cicdDetail.external_host : ''
    });
    const apiServerProps = getFieldProps('apiServer', {
      rules: [
        { validator: this.checkApiServer }
      ],
      initialValue: apiServerDetail.external_protocol ? apiServerDetail.external_protocol + '://' + apiServerDetail.external_host : ''
    });
    const cicdID = getFieldProps('cicdID', {
      initialValue: cicdConfig ? cicdConfig.configID : ''
    });
    const apiServerID = getFieldProps('apiServerID', {
      initialValue: apiServer ? apiServer.configID : ''
    });

    return (
      <div className="conInter">
        <div className="title">开放 API 地址</div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={conInter} alt="持续集成" />
            </div>
            <div className="contentkeys">
              <div className="key">容器引擎 API</div>
              <div className="key">集成部署 API</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem >
                  <Input {...apiServerProps} placeholder="如：http://192.168.1.103:38090" disabled={cicdeditDisable} />
                </FormItem>
                <FormItem >
                  <Input {...cicdProps} placeholder="如：http://192.168.1.103:38090" disabled={cicdeditDisable} />
                </FormItem>
                {/*<FormItem>
                  {
                    cicdeditDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleCicd}>编辑</Button>
                      : ([
                        <Button onClick={this.handleReset} className="itemInputLeft">取消</Button>,
                        <Button type='primary'  onClick={this.saveCICD}>保存</Button>
                      ])
                  }
                </FormItem>

                <input type="hidden" {...cicdID} />
                <input type="hidden" {...apiServerID} />
                */}
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

//镜像服务
let MirrorService = React.createClass({
  getInitialState() {
    return {
      canClick: true,
      aleardySave: false
    }
  },
  handleMirror() {
    this.props.mirrorChange()
  },
  handleReset() {
    if (!this.state.aleardySave) {
      const { resetFields } = this.props.form
      resetFields(['mirror', 'approve', 'extend', 'registryID'])
    }
    this.props.mirrorChange()
  },
  saveMirror() {
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      if (!this.state.canClick) {
        return
      }
      const notification = new NotificationHandler()
      notification.spin('保存中')
      this.setState({
        canClick: false
      })
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, isValidConfig } = this.props
      const { getFieldValue } = form
      const mirror = getFieldValue('mirror')
      const approve = getFieldValue('approve')
      const extend = getFieldValue('extend')
      const registryID = getFieldValue('registryID')
      const self = this
      isValidConfig('registry', {
        host: mirror,
        v2AuthServer: approve,
        v2Server: extend
      }, {
          success: {
            func: (result) => {
              if (result.data && result.data == 'success') {
                saveGlobalConfig(cluster.clusterID, 'registry', {
                  configID: registryID,
                  detail: {
                    host: mirror,
                    v2AuthServer: approve,
                    v2Server: extend
                  }
                }, {
                    success: {
                      func: (result) => {
                        notification.close()
                        notification.success('镜像服务配置保存成功')
                        const { form } = self.props
                        const { setFieldsValue } = form
                        self.handleMirror()
                        this.setState({
                          canClick: true,
                          aleardySave: true
                        })
                        if (result.data.toLowerCase() != 'success') {
                          setFieldsValue({
                            registryID: result.data
                          })
                        }
                      }
                    },
                    failed: {
                      func: (err) => {
                        notification.close()
                        let msg
                        if (err.message.message) {
                          msg = err.message.message
                        } else {
                          msg = err.message
                        }
                        notification.error('镜像服务配置保存失败 => ' + msg)
                        self.setState({
                          canClick: true
                        })
                      }
                    }
                  })
              } else {
                notification.close()
                notification.error('镜像服务地址不可用')
                self.setState({
                  canClick: true
                })
              }
            },
            isAsync: true
          },
          failed: {
            func: () => {
              notification.close()
              notification.error('镜像服务地址不可用')
              self.setState({
                canClick: true
              })
            }
          }
        })
    })
  },
  // 镜像服务地址校验规则
  checkMirror(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写镜像服务地址')])
      return
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的镜像服务地址')
    }
    callback()
  },

  // 认证服务地址校验规则
  checkApprove(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写镜像服务地址')])
      return
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的认证服务地址')
    }
    callback()
  },

  // 扩展服务地址校验规则
  checkExtend(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写扩展服务地址')])
      return
    }
    if (!/^([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的扩展服务地址')
    }
    callback()
  },
  render() {
    const { mirrorDisable, mirrorChange, config } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    let mirroDetail = {
      protocol: "",
      host: "",
      port: "",
      v2Server: "",
      v2AuthServer: ""
    }
    if (config) {
      mirroDetail = JSON.parse(config.configDetail)
    }
    const mirrorProps = getFieldProps('mirror', {
      rules: [
        { validator: this.checkMirror }
      ],
      initialValue: mirroDetail.protocol ? mirroDetail.protocol + '://' + mirroDetail.host + (mirroDetail.port ? ':' + mirroDetail.port : '') : ''
    })
    const approveProps = getFieldProps('approve', {
      rules: [
        { validator: this.checkApprove }
      ],
      initialValue: mirroDetail.v2AuthServer
    })
    const extendProps = getFieldProps('extend', {
      rules: [
        { validator: this.checkExtend }
      ],
      initialValue: mirroDetail.v2Server
    })
    const registryID = getFieldProps('registryID', {
      initialValue: config ? config.configID : ''
    })
    return (
      <div className="mirrorservice">
        <div className="title">
          镜像服务
          {
            liteFlag &&
            <span className="tips">Tips：时速云官方不支持企业版 Lite 配置私有的镜像仓库，如有需要请联系时速云购买企业版 Pro</span>
          }
        </div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={MirrorImg} alt="镜像服务" />
            </div>
            <div className="contentkeys">
              <div className="key">镜像服务地址</div>
              <div className="key">认证服务地址</div>
              <div className="key">扩展服务地址</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem >
                  <Input {...mirrorProps} placeholder="如：http://192.168.1.113:80" disabled={mirrorDisable} />
                </FormItem>
                <FormItem >
                  <Input {...approveProps} placeholder="如：https://192.168.1.113:5001" disabled={mirrorDisable} />
                </FormItem>
                <FormItem >
                  <Input {...extendProps} placeholder="如：https://192.168.1.113:4081" disabled={mirrorDisable} />
                </FormItem>
                <FormItem>
                  {
                    mirrorDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleMirror} disabled={liteFlag}>编辑</Button>
                      : ([
                        <Button onClick={this.handleReset} className="itemInputLeft">取消</Button>,
                        <Button type='primary' onClick={this.saveMirror}>保存</Button>
                      ])
                  }
                </FormItem>
                <input type="hidden" {...registryID} />
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

//存储服务
let StorageService = React.createClass({
  getInitialState() {
    return {
      canClick: true,
      aleardySave: false
    }
  },
  handleCeph() {
    this.props.cephChange()
  },
  handleReset() {
    const { form } = this.props
    if (!this.state.aleardySave) {
      const { resetFields } = form
      resetFields(['node', 'url'])
    }
    this.props.cephChange()
  },
  saveStorage() {
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      if (!this.state.canClick) {
        return
      }
      const notification = new NotificationHandler()
      notification.spin('保存中')
      this.setState({
        canClick: false
      })
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, isValidConfig } = this.props
      if (cluster.isUserDefine) {
        notification.close()
        notification.error('没有配置集群')
        this.setState({
          canClick: true
        })
        return
      }
      const { getFieldValue } = form
      let node = getFieldValue('node')
      node = node.split(',')
      let monitors = []
      node = node.map(item => {
        if (item) {
          monitors.push(item.trim())
        }
      })
      const url = getFieldValue('url')
      const storageID = getFieldValue('storageID')
      const self = this
      isValidConfig('rbd', {
        url: url,
        config: {
          monitors
        }
      }, {
          success: {
            func: (result) => {
              if (result.data && result.data == 'success') {
                saveGlobalConfig(cluster.clusterID, 'rbd', {
                  configID: storageID,
                  detail: {
                    url: url,
                    config: {
                      monitors
                    }
                  }
                }, {
                    success: {
                      func: (result) => {
                        notification.close()
                        notification.success('ceph配置保存成功')
                        const { form } = self.props
                        const { setFieldsValue } = form
                        this.setState({
                          canClick: true,
                          aleardySave: true
                        })
                        if (result.data.toLowerCase() != 'success') {
                          setFieldsValue({
                            cicdID: result.data
                          })
                        }
                        self.handleCeph()
                      }
                    },
                    failed: {
                      func: (err) => {
                        notification.close()
                        let msg
                        if (err.message.message) {
                          msg = err.message.message
                        } else {
                          msg = err.message
                        }
                        notification.error('ceph配置保存失败 => ' + msg)
                        self.setState({
                          canClick: true
                        })
                      }
                    }
                  })
              } else {
                notification.close()
                self.setState({
                  canClick: true
                })
                notification.error('存储地址不可用')
              }
            },
            isAsync: true
          },
          failed: {
            func: () => {
              notification.close()
              self.setState({
                canClick: true
              })
              notification.error('存储地址不可用')
            }
          }
        })
    })
  },
  // 存储节点校验规则
  checkNode(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      return callback('请填写存储节点')
    }
    if (!/^([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5}){0,1}?(,([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5}){0,1})*$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(,[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?)*$/.test(value)) {
      return callback('请填入合法的存储节点')
    }
    callback()
  },
  // ceph Url 校验规则
  checkUrl(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      return callback('请填写 Ceph Agent 地址')
    }
    if (!/^(http|https):\/\/([a-zA-Z-]+\.)+[a-zA-Z-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的 Ceph Agent 地址')
    }
    callback()
  },
  render() {
    const { cephDisable, cephChange, config } = this.props
    let storageDetail = {
      url: "", config: {
        monitors: []
      }
    }
    if (config) {
      storageDetail = JSON.parse(config.configDetail)
    }
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const nodeProps = getFieldProps('node', {
      rules: [
        { validator: this.checkNode }
      ],
      initialValue: storageDetail.config.monitors.join(',')
    })
    const urlProps = getFieldProps('url', {
      rules: [
        { validator: this.checkUrl }
      ],
      initialValue: storageDetail.url
    })
    const storageID = getFieldProps('storageID', {
      initialValue: config ? config.configID : ''
    })
    return (
      <div className="storageservice">
        <div className="title">
          存储服务
          {
            liteFlag &&
            <span className="tips">Tips：时速云官方不支持企业版 Lite 配置存储服务，如有需要请联系时速云购买企业版 Pro</span>
          }
        </div>
        <div className="content">
          <div className="contentHeader">
            Ceph 分布式存储
						</div>
          <div className="contentMain">
            <div className="contentImg">
              <img src={CephImg} alt="镜像服务" />
            </div>
            <div className="contentkeys">
              <div className="key">存储节点</div>
              <div className="key">Agent 地址</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem >
                  <Input {...urlProps} placeholder="如：https://192.168.88.6789" disabled={cephDisable} />
                </FormItem>
                <FormItem >
                  <Input {...nodeProps} placeholder="如：192.168.1.113:4081，如有多个存储节点，请使用英文逗号隔开" disabled={cephDisable} />
                </FormItem>
                <FormItem>
                  {
                    cephDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleCeph} disabled={liteFlag}>编辑</Button>
                      : ([
                        <Button className="itemInputLeft" onClick={this.handleReset}>取消</Button>,
                        <Button type='primary' onClick={this.saveStorage}>保存</Button>
                      ])
                  }
                </FormItem>
                <input type="hidden" {...storageID} />
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

Emaill = Form.create()(Emaill)
ConInter = Form.create()(ConInter)
MirrorService = Form.create()(MirrorService)
StorageService = Form.create()(StorageService)


class GlobalConfig extends Component {
  constructor(props) {
    super(props)
    this.state = {
      emailDisable: true,
      cicdeditDisable: true,
      mirrorDisable: true,
      cephDisable: true,
      globalConfig: {}
    }
  }

  componentWillMount() {
    this.props.loadGlobalConfig(this.props.cluster.clusterID, {
      success: {
        func: (result) => {
          if (result.data) {
            let globalConfig = {}
            result.data.forEach(item => {
              globalConfig[item.configType] = item
            })
            this.setState({
              globalConfig: globalConfig
            })
          }
        }
      }
    })
  }

  emailChange() {
    this.setState({ emailDisable: !this.state.emailDisable })
  }

  cicdeditChange() {
    this.setState({ cicdeditDisable: !this.state.cicdeditDisable })
  }

  mirrorChange() {
    this.setState({ mirrorDisable: !this.state.mirrorDisable })
  }

  cephChange() {
    this.setState({ cephDisable: !this.state.cephDisable })
  }

  render() {
    const { emailDisable, emailChange, cicdeditDisable, cicdeditChange, mirrorDisable, mirrorChange, cephDisable, cephChange, globalConfig } = this.state
    const { updateGlobalConfig, saveGlobalConfig } = this.props
    let { cluster } = this.props
    if (!cluster) {
      cluster = {
        clusterID: 1,
        isUserDefine: true
      }
    }
    const propGlobalConfig = this.props.globalConfig
    if (!propGlobalConfig || propGlobalConfig.isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"></Spin>
        </div>
      )
    }
    return (
      <div id="GlobalConfig">
        <div className="alertRow" style={{ margin: 0 }}>
          全局配置---对这整个系统的邮件报警、持续集成、镜像服务、分布式存储的配置；只有做了这些配置才能完整的使用这几项功能，分别是：邮件报警对应的是系统中涉及的邮件提醒、持续集成对应的是CI/CD中整个Tenxflow功能的使用、镜像服务对应的是镜像仓库的使用、分布式存储对应的是容器有状态服务存储的使用
					</div>
        <Emaill emailDisable={emailDisable} emailChange={this.emailChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} config={globalConfig.mail} />
        <MirrorService mirrorDisable={mirrorDisable} mirrorChange={this.mirrorChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} config={globalConfig.registry} isValidConfig={this.props.isValidConfig}/>
        <StorageService cephDisable={cephDisable} cephChange={this.cephChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} config={globalConfig.rbd}  isValidConfig={this.props.isValidConfig} />
        <ConInter cicdeditDisable={cicdeditDisable} cicdeditChange={this.cicdeditChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} cicdConfig={globalConfig.cicd} apiServer={globalConfig.apiServer} />
      </div>
    )
  }
}

function mapPropsToState(state) {
  return {
    cluster: state.entities.current.cluster,
    globalConfig: state.globalConfig.globalConfig
  }
}

export default connect(mapPropsToState, {
  saveGlobalConfig,
  updateGlobalConfig,
  loadGlobalConfig,
  isValidConfig
})(GlobalConfig)
