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
import { Row, Col, Icon, Form, Button, Input, Spin, Checkbox, Table, Tooltip, Popover } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import classNames from 'classnames'
import './style/GlobalConfig.less'
import EmailImg from '../../../assets/img/setting/globalconfigEmail.png'
import conInter from '../../../assets/img/setting/globalconfigCICD.png'
import MirrorImg from '../../../assets/img/setting/globalconfigmirror.png'
import APIImg from '../../../assets/img/setting/globalconfigapi.png'
import CephImg from '../../../assets/img/setting/globalconfigceph.png'
import MsaImg from '../../../assets/img/setting/globalconfigmsa.png'
import FTPImg from '../../../assets/img/setting/globalconfigftp.png'
import VmImg from '../../../assets/img/setting/globalconfigvm.png'
import ChartRepoImg from '../../../assets/img/setting/chart-repo.png'
import tip_harbor from '../../../assets/img/setting/tip_harbor.jpg'
import { connect } from 'react-redux'
import { saveGlobalConfig, updateGlobalConfig, loadGlobalConfig, isValidConfig, sendEmailVerification } from '../../../actions/global_config'
import { loadLoginUserDetail } from '../../../actions/entities'
import NotificationHandler from '../../../components/Notification'
import { getPortalRealMode } from '../../../common/tools'
import { LITE } from '../../../constants'
import ConIntergration from './ContinueIntegration'
import Title from '../../Title'
import QueueAnim from 'rc-queue-anim'

const FormItem = Form.Item
const mode = getPortalRealMode
const liteFlag = mode === LITE

function inputFocusMethod(node){
  node && node.focus();
  const value = node && node.value
  if(value){
    node.selectionStart = value.length
    node.selectionEnd = value.length
  }
}

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
    const { setFieldsValue } = this.props.form
    const { emailChange, config } = this.props
    let emailDetail = {
      senderMail: '',
      mailServer: '',
      senderPassword: ''
    }
    if (config) {
      emailDetail = JSON.parse(config.configDetail)
    }
    const body =
    setFieldsValue({
      service: emailDetail.mailServer,
      email: emailDetail.senderMail,
      password: emailDetail.senderPassword,
      secure: emailDetail.secure,
      emailID: config ? config.configID : ''
    })
    // resetFields(['service', 'email', 'password', 'emailID'])
    emailChange();
  },
  handEve() {
    this.setState({ isEve: !this.state.isEve })
  },
  handleEmail() {
    setTimeout(() => {
      const node = document.getElementById('emailServer')
      inputFocusMethod(node)
    }, 100)
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
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, setGlobalConfig } = this.props
      const { getFieldValue } = form
      const service = getFieldValue('service')
      const email = getFieldValue('email')
      const password = getFieldValue('password')
      const emailID = getFieldValue('emailID')
      const secure = getFieldValue('secure')
      const self = this
      const body = {
        configID: emailID,
        detail: {
          senderMail: email,
          senderPassword: password,
          mailServer: service,
          secure,
        }
      }
      saveGlobalConfig(cluster.clusterID, 'mail', body , {
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
                body.configID = result.data
              }
              this.setState({
                canClick: true,
                aleardySave: true
              })
              body.configDetail = JSON.stringify(body.detail)
              setGlobalConfig('mail', body)
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
      callback([new Error('请填写邮件服务地址')])
      return
    }
    if (!/^([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      callback([new Error('请填入合法的服务器地址')])
      return
    }
    callback()
  },
  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form
    //if (!value) {
    //  callback([new Error('请填写密码')])
    //  return
    //}
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
  sendEmail() {
    const email = this.props.form.getFieldValue('email')
    const host = this.props.form.getFieldValue('service')
    const password = this.props.form.getFieldValue('password')
    const secure = this.props.form.getFieldValue('secure')
    const body ={
      email,
      password,
	  host,
	  secure
    }
    const notitf = new NotificationHandler()
    this.props.sendEmailVerification(body,{
      success:{
        func:(ret)=> {
          notitf.success('验证成功')
        }
      },
      failed:{
        func:()=> {
          notitf.error('验证失败','请检查邮箱或者密码是否正确')
        }
      }
    })
  },
  render() {
    const { emailDisable, emailChange, config } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form
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
    // 使用 TLS 安全协议
    const secureProps = getFieldProps('secure', {
      valuePropName: 'checked',
      initialValue: emailDetail.secure || false
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
              <div className="key">{/*使用 TLS 安全协议*/}</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem >
                  <Input {...serviceProps} placeholder="如：smtp.exmail.qq.com:25" disabled={emailDisable} id='emailServer'/>
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
                <FormItem style={{marginTop: '-8px'}}>
                  <Checkbox {...secureProps} disabled={emailDisable}>
                    {
                      /*getFieldValue('secure')
                      ? '安全'
                      : '非安全'*/
                    }
                    使用 TLS 安全协议
                  </Checkbox>
                </FormItem>
                <FormItem>
                  {
                    emailDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleEmail}>编辑</Button>
                      : ([
                        <Button onClick={this.handleReset} className="itemInputLeft" disabled={emailDisable}>取消</Button>,
                        <Button type='primary' className="itemInputLeft" onClick={this.saveEmail}>保存</Button>
                      ])
                  }
                  <Button onClick={()=> this.sendEmail()} >验证邮箱</Button>
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
//msa 配置
let Msa = React.createClass({
  getInitialState() {
    return {
      canClick: true,
      aleardySave: false
    }
  },
  handleReset(e) {
    e.preventDefault();
    const { setFieldsValue } = this.props.form
    const { msaChange, config } = this.props
    let msaDetail = {
      url: ''
    }
    if (config) {
      msaDetail = JSON.parse(config.configDetail)
    }
    setFieldsValue({
      url: msaDetail.url,
    })
    // resetFields(['service', 'email', 'password', 'emailID'])
    msaChange();
  },
  handleMsa() {
    setTimeout(() => {
      const node = document.getElementById('microServiceAgent')
      inputFocusMethod(node)
    },100)
    this.props.msaChange()
  },
  saveMsa() {
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
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, setGlobalConfig } = this.props
      const { getFieldValue } = form
      const url = getFieldValue('url')
      const msaID = getFieldValue('msaID')
      const self = this
      const body = {
        configID: msaID,
        detail: {
          url,
        }
      }
      saveGlobalConfig(cluster.clusterID, 'msa', body , {
        success: {
          func: (result) => {
            notification.close()
            notification.success('微服务配置保存成功')
            const { form } = self.props
            const { getFieldProps, getFieldValue, setFieldsValue } = form
            self.handleMsa()
            if (result.data.toLowerCase() != 'success') {
              setFieldsValue({
                msaID: result.data
              })
              body.configID = result.data
            }
            this.setState({
              canClick: true,
              aleardySave: true
            })
            body.configDetail = JSON.stringify(body.detail)
            setGlobalConfig('msa', body)
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
            notification.error('微服务配置保存失败 => ' + msg)
            this.setState({
              canClick: true
            })
          }
        }
      })
    })
  },
  checkUrl(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写微服务服务地址')])
      return
    }
    if (!/^(http:\/\/|https:\/\/)([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?(\/)?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(\/)?$/.test(value)) {
      callback([new Error('请填入合法的微服务地址')])
      return
    }
    callback()
  },
  render() {
    const { msaDisable, emailChange, config } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form
    let msaDetail = {
      url: '',
    }
    if (config) {
      msaDetail = JSON.parse(config.configDetail)
    }
    // 微服务地址
    const urlProps = getFieldProps('url', {
      rules: [
        { validator: this.checkUrl }
      ],
      initialValue: msaDetail.url
    });

    const msaID = getFieldProps('msaID', {
      initialValue: config ? config.configID : ''
    });

    return (
      <div className="GlobalConfigMSA">
        <div className="title">微服务</div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={MsaImg} alt="微服务" />
            </div>
            <div className="contentkeys">
              <div className="key">微服务地址</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem >
                  <Input {...urlProps} placeholder="如：https://192.168.1.113:4081" disabled={msaDisable} id='microServiceAgent'/>
                </FormItem>
                <FormItem>
                  {
                    msaDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleMsa}>编辑</Button>
                      : ([
                        <Button onClick={this.handleReset} className="itemInputLeft" disabled={msaDisable}>取消</Button>,
                        <Button type='primary' className="itemInputLeft" onClick={this.saveMsa}>保存</Button>
                      ])
                  }
                </FormItem>
                <input type="hidden" {...msaID} />
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
//ftp 配置
let Ftp = React.createClass({
  getInitialState() {
    return {
      isEve: false,
      canClick: true,
      aleardySave: false
    }
  },
  handleReset(e) {
    e.preventDefault();
    const { setFieldsValue } = this.props.form
    const { ftpChange, config } = this.props
    let ftpDetail = {
      addr: '',
      username: '',
      password: '',
    }
    if (config) {
      ftpDetail = JSON.parse(config.configDetail)
    }
    setFieldsValue({
      addr: ftpDetail.addr,
      username: ftpDetail.username,
      password: ftpDetail.password,
    })
    // resetFields(['service', 'email', 'password', 'emailID'])
    ftpChange();
  },
  handEve() {
    this.setState({ isEve: !this.state.isEve })
  },
  handleMsa() {
    setTimeout(() => {
      const node = document.getElementById('ftpServerAgent')
      inputFocusMethod(node)
    }, 100)
    this.props.ftpChange()
  },
  saveFtp() {
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
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, setGlobalConfig } = this.props
      const { getFieldValue } = form
      const ftpID = values.ftpID
      const self = this
      delete values.ftpID
      // not port push default(21)
      if (!/:\d+$/.test(values.addr)){
        values.addr +=':21'
      }
      const body = {
        configID: ftpID,
        detail: values,
      }
      saveGlobalConfig(cluster.clusterID, 'ftp', body , {
        success: {
          func: (result) => {
            notification.close()
            notification.success('ftp 配置保存成功')
            const { form } = self.props
            const { getFieldProps, getFieldValue, setFieldsValue } = form
            self.handleMsa()
            if (result.data.toLowerCase() != 'success') {
              setFieldsValue({
                ftpID: result.data
              })
              body.configID = result.data
            }
            this.setState({
              canClick: true,
              aleardySave: true
            })
            body.configDetail = JSON.stringify(body.detail)
            setGlobalConfig('ftp', body)
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
            notification.error('ftp 配置保存失败 => ' + msg)
            this.setState({
              canClick: true
            })
          }
        }
      })
    })
  },
  checkUrl(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      return callback('请输入服务地址')
    }
    if (!/^(http:\/\/|https:\/\/|ftp:\/\/)([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?(\/)?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(\/)?$/.test(value)) {
      return callback([new Error('请填入合法的 ftp 地址')])
    }
    callback()
  },
  render() {
    const { ftpDisable, config } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form
    let ftpDetail = {
      addr: '',
      username: '',
      password: '',
    }
    if (config) {
      ftpDetail = JSON.parse(config.configDetail)
    }
    const addrProps = getFieldProps('addr', {
      rules: [
        { validator: this.checkUrl }
      ],
      initialValue: ftpDetail.addr,
    });
    const usernameProps = getFieldProps('username', {
      rules: [
        { required: true, message: '请填写用户名' },
      ],
      initialValue: ftpDetail.username,
    });
    const passwordProps = getFieldProps('password', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
      ],
      initialValue: ftpDetail.password,
    });

    const ftpID = getFieldProps('ftpID', {
      initialValue: config ? config.configID : ''
    });

    return (
      <div className="GlobalConfigEmail">
        <div className="title">FTP 服务器配置</div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={FTPImg} alt="FTP 服务器配置" />
            </div>
            <div className="contentkeys">
              <div className="key">FTP 服务地址</div>
              <div className="key">用户名</div>
              <div className="key">密码</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem
                  className={classNames({'has-error': getFieldError('addr')})}
                  hasFeedback
                  help={isFieldValidating('addr') ? '校验中...' : (getFieldError('addr') || []).join(', ')}
                >
                  <Input {...addrProps} placeholder="如：192.168.1.113:21" disabled={ftpDisable} id='ftpServerAgent'/>
                </FormItem>
                <FormItem >
                  <Input {...usernameProps} placeholder="请输入用户名" disabled={ftpDisable} />
                </FormItem>
                <FormItem >
                  <i className={this.state.isEve ? 'fa fa-eye activeEve' : 'fa fa-eye-slash activeEve'}
                    onClick={() => this.handEve()}></i>
                  <Input {...passwordProps} type={this.state.isEve ? "text" : "password"} placeholder="请输入密码" disabled={ftpDisable} />
                </FormItem>
                <FormItem>
                  {
                    ftpDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleMsa}>编辑</Button>
                      : ([
                        <Button onClick={this.handleReset} className="itemInputLeft" disabled={ftpDisable}>取消</Button>,
                        <Button type='primary' className="itemInputLeft" onClick={this.saveFtp}>保存</Button>
                      ])
                  }
                </FormItem>
                <input type="hidden" {...ftpID} />
              </Form>
            </div>
          </div>
        </div>
      </div>
    )

  }
})
let Vm = React.createClass({
  getInitialState() {
    return {
      isEve: false,
      canClick: true,
      aleardySave: false
    }
  },
  handleReset(e) {
    e.preventDefault();
    const { setFieldsValue } = this.props.form
    const { vmChange, config } = this.props
    let vmDetail = {
      url: ''
    }
    if (config) {
      vmDetail = JSON.parse(config.configDetail)
    }
    setFieldsValue({
      url: vmDetail.protocol || vmDetail.host ? `${vmDetail.protocol}://${vmDetail.host}` : "",
    })
    // resetFields(['service', 'email', 'password', 'emailID'])
    vmChange();
  },
  handEve() {
    this.setState({ isEve: !this.state.isEve })
  },
  handleMsa() {
    setTimeout(() => {
      const node = document.getElementById('vmAppAgent')
      inputFocusMethod(node)
    },100)
    this.props.vmChange()
  },
  saveVM() {
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
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, setGlobalConfig, loadGlobalConfig, loadLoginUserDetail } = this.props
      const { getFieldValue } = form
      const [ protocol, host ] = getFieldValue('url').split('://')
      const vmID = getFieldValue('vmID')
      const self = this
      const body = {
        configID: vmID,
        detail: {
          protocol,
          host: host || ''
        }
      }
      if (!protocol && !host) {
        Object.assign(body.detail, { enabled: false })
      }
      saveGlobalConfig(cluster.clusterID, 'vm', body , {
        success: {
          func: (result) => {
            notification.close()
            notification.success('传统应用配置保存成功')
            const { form } = self.props
            const { getFieldProps, getFieldValue, setFieldsValue } = form
            self.handleMsa()
            if (result.data.toLowerCase() != 'success') {
              setFieldsValue({
                msaID: result.data
              })
              body.configID = result.data
            }
            this.setState({
              canClick: true,
              aleardySave: true
            })
            body.configDetail = JSON.stringify(body.detail)
            setGlobalConfig('vm', body)
            loadGlobalConfig(cluster.clusterID)
            loadLoginUserDetail()
          },
          isAsync: true
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
            notification.error('传统应用配置保存失败 => ' + msg)
            this.setState({
              canClick: true
            })
          }
        }
      })
    })
  },
  checkUrl(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback()
      return
    }
    if (!/^(http:\/\/|https:\/\/)([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?(\/)?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(\/)?$/.test(value)) {
      callback([new Error('请填入合法的传统应用地址')])
      return
    }
    callback()
  },
  render() {
    const { vmDisable, emailChange, config } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form
    let vmDetail = {
      protocol: '',
      host: ''
    }
    if (config) {
      vmDetail = JSON.parse(config.configDetail)
    }
    const { protocol, host } = vmDetail
    // 传统应用地址
    const urlProps = getFieldProps('url', {
      rules: [
        { validator: this.checkUrl }
      ],
      initialValue: !!(protocol && host) ? `${protocol}://${host}` : ''
    });

    const vmID = getFieldProps('vmID', {
      initialValue: config ? config.configID : ''
    });

    return (
      <div className="GlobalConfigVm">
        <div className="title">传统应用</div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={VmImg} alt="传统应用" />
            </div>
            <div className="contentkeys">
              <div className="key">传统应用地址</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem
                  className={classNames({'has-error': getFieldError('url')})}
                  hasFeedback
                  help={isFieldValidating('url') ? '校验中...' : (getFieldError('url') || []).join(', ')}
                >
                  <Input {...urlProps} placeholder="如：https://192.168.1.113:19005" disabled={vmDisable} id='vmAppAgent'/>
                </FormItem>
                <FormItem>
                  {
                    vmDisable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleMsa}>编辑</Button>
                      : ([
                        <Button onClick={this.handleReset} className="itemInputLeft" disabled={vmDisable}>取消</Button>,
                        <Button type='primary' className="itemInputLeft" onClick={this.saveVM}>保存</Button>
                      ])
                  }
                </FormItem>
                <input type="hidden" {...vmID} />
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
let ChartServer = React.createClass({
  getInitialState() {
    return {
      isEve: false,
      canClick: true,
      aleardySave: false
    }
  },
  handleReset(e) {
    e.preventDefault();
    const { setFieldsValue } = this.props.form
    const { onChange, config } = this.props
    let chartRepoDetail = {
      url: ''
    }
    if (config) {
      chartRepoDetail = JSON.parse(config.configDetail)
    }
    setFieldsValue({
      url: `${chartRepoDetail.protocol}://${chartRepoDetail.url}`,
    })
    // resetFields(['service', 'email', 'password', 'emailID'])
    onChange();
  },
  handEve() {
    this.setState({ isEve: !this.state.isEve })
  },
  handleChartRepo() {
    setTimeout(() => {
      const node = document.getElementById('chartRepoAgent')
      inputFocusMethod(node)
    },100)
    this.props.onChange()
  },
  saveChartRepo() {
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
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, setGlobalConfig, loadGlobalConfig, loadLoginUserDetail } = this.props
      const { getFieldValue } = form
      const [ protocol, url ] = getFieldValue('url').split('://')
      const chartRepoID = getFieldValue('chartRepoID')
      const self = this
      const body = {
        configID: chartRepoID,
        detail: {
          protocol,
          url: url || ''
        }
      }
      saveGlobalConfig(cluster.clusterID, 'chart_repo', body , {
        success: {
          func: (result) => {
            notification.close()
            notification.success('chart repo 配置保存成功')
            const { form } = self.props
            const { getFieldProps, getFieldValue, setFieldsValue } = form
            self.handleChartRepo()
            if (result.data.toLowerCase() != 'success') {
              setFieldsValue({
                msaID: result.data
              })
              body.configID = result.data
            }
            this.setState({
              canClick: true,
              aleardySave: true
            })
            body.configDetail = JSON.stringify(body.detail)
            setGlobalConfig('chart_repo', body)
            loadGlobalConfig(cluster.clusterID)
            loadLoginUserDetail()
          },
          isAsync: true
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
            notification.error('chart repo 配置保存失败 => ' + msg)
            this.setState({
              canClick: true
            })
          }
        }
      })
    })
  },
  checkUrl(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      callback()
      return
    }
    if (!/^(http:\/\/|https:\/\/)([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?(\/)?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(\/)?$/.test(value)) {
      callback([new Error('请填入合法的 chart repo 地址')])
      return
    }
    callback()
  },
  render() {
    const { disable, emailChange, config } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form
    let vmDetail = {
      protocol: '',
      host: ''
    }
    if (config) {
      vmDetail = JSON.parse(config.configDetail)
    }
    const { protocol, url } = vmDetail
    // chart repo 地址
    const urlProps = getFieldProps('url', {
      rules: [
        { validator: this.checkUrl }
      ],
      initialValue: !!(protocol && url) ? `${protocol}://${url}` : ''
    });

    const chartRepoID = getFieldProps('chartRepoID', {
      initialValue: config ? config.configID : ''
    });

    return (
      <div className="GlobalConfigVm">
        <div className="title">应用模版</div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={ChartRepoImg} alt="应用模版" />
            </div>
            <div className="contentkeys">
              <div className="key">Chart Repo 地址</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem
                  className={classNames({'has-error': getFieldError('url')})}
                  hasFeedback
                  help={isFieldValidating('url') ? '校验中...' : (getFieldError('url') || []).join(', ')}
                >
                  <Input {...urlProps} placeholder="如：https://192.168.1.113:19005" disabled={disable} id='chartRepoAgent'/>
                </FormItem>
                <FormItem>
                  {
                    disable
                      ? <Button type='primary' className="itemInputLeft" onClick={this.handleChartRepo}>编辑</Button>
                      : ([
                        <Button onClick={this.handleReset} className="itemInputLeft" disabled={disable}>取消</Button>,
                        <Button type='primary' className="itemInputLeft" onClick={this.saveChartRepo}>保存</Button>
                      ])
                  }
                </FormItem>
                <input type="hidden" {...chartRepoID} />
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
//开放API地址
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
    const { setFieldsValue } = this.props.form
    const { cicdeditChange, cicdConfig, apiServer } = this.props
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
    setFieldsValue({
      cicd: cicdDetail.external_protocol ? cicdDetail.external_protocol + '://' + cicdDetail.external_host : '',
      cicdID: cicdConfig ? cicdConfig.configID : '',
      apiServerID: apiServer ? apiServer.configID : '',
      apiServer: apiServerDetail.external_protocol ? apiServerDetail.external_protocol + '://' + apiServerDetail.external_host : ''
    })
    //resetFields(['cicd', 'cicdID'])
    cicdeditChange()
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
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, setGlobalConfig } = this.props
      const { getFieldValue } = form
      const cicd = getFieldValue('cicd')
      const api = getFieldValue('apiServer')
      const cicdID = getFieldValue('cicdID')
      const apiServerID = getFieldValue('apiServerID')
      const self = this
      const arr = cicd.split('://')
      const body = {
        cicdID: cicdID,
        apiServerID: apiServerID,
        cicdDetail: {
          protocol: arr[0],
          url: arr[1]
        },
        apiServerDetail: {
          url: api
        }
      }
      saveGlobalConfig(cluster.clusterID, 'cicd', body, {
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
              body.cicdID = result.apiServer.data
            }
            if (result.apiServer.data.toLowerCase() != 'success') {
              setFieldsValue({
                apiServerID: result.apiServer.data
              })
              body.apiServerID = result.apiServer.data
            }
            this.setState({
              canClick: true,
              aleardySave: true
            })
            body.configDetail = JSON.stringify(body.detail)
            setGlobalConfig('cicd', body)
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
    if (!/^(http|https):\/\/([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
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
    if (!/^(http|https):\/\/([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
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
              <img src={APIImg} alt="开放API地址" />
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
    setTimeout(() => {
      const node = document.getElementById('mirrorServerAgent')
      inputFocusMethod(node)
    },100)
    this.props.mirrorChange()
  },
  handleReset() {
    const { mirrorChange, config } = this.props
    const { setFieldsValue } = this.props.form
    let mirroDetail = {
       url: ''
    }
    if (config) {
      mirroDetail = JSON.parse(config.configDetail)
    }
    setFieldsValue({
      mirror: mirroDetail.url
    })
    mirrorChange()
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
      this.setState({
        canClick: false
      })
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, isValidConfig, setGlobalConfig } = this.props
      const { getFieldValue } = form
      const url = getFieldValue('mirror')
      const harborID = getFieldValue('harborID')
      const self = this
      const body = {
        configID: harborID,
        detail: {
          url
        }
      }
      notification.spin('保存中')
      isValidConfig('harbor', {
        url: url
      }, {
          success: {
            func: () => {
              saveGlobalConfig(cluster.clusterID, 'harbor', body, {
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
                        harborID: result.data
                      })
                      body.configID = result.data
                    }
                    body.configDetail = JSON.stringify(body.detail)
                    setGlobalConfig('harbor', body)
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
            },
            isAsync: true
          },
          failed: {
            func: (res) => {
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
    if (!value) {
      callback([new Error('请填写镜像服务地址')])
      return
    }
    if (!/^(http:\/\/|https:\/\/)([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?(\/)?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(\/)?$/.test(value)) {
      return callback('请填入合法的镜像服务地址')
    }
    callback()
  },
  render() {
    const { mirrorDisable, mirrorChange, config } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    let mirroDetail = {
       url: ''
    }
    if (config) {
      mirroDetail = JSON.parse(config.configDetail)
    }
    const mirrorProps = getFieldProps('mirror', {
      rules: [
        { validator: this.checkMirror }
      ],
      initialValue: mirroDetail.url
    })
    const harborID = getFieldProps('harborID', {
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
            <div className="contentForm" style={{ marginTop: 35 }}>
              <div className="key">新版本支持每个集群配置一个harbor，构建集群必须配置harbor
              </div>
            </div>
            {/*<div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem >
                  <Input {...mirrorProps} placeholder="如：https://192.168.1.113:4081" disabled={mirrorDisable} id='mirrorServerAgent'/>
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
                <input type="hidden" {...harborID} />
              </Form>
            </div>*/}
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
    const { setFieldsValue } = this.props.form
    const { cephChange, config } = this.props
    let storageDetail = {
      url: "", config: {
        monitors: []
      }
    }
    if (config) {
      storageDetail = JSON.parse(config.configDetail)
    }
    setFieldsValue({
      node:  storageDetail.config.monitors.join(','),
      url: storageDetail.url,
      storageID: config ? config.configID : ''
    })
    cephChange()
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
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, isValidConfig, setGlobalConfig } = this.props
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
      const body = {
        configID: storageID,
        detail: {
          url: url,
          config: {
            monitors
          }
        }
      }
      isValidConfig('rbd', {
        url: url,
        config: {
          monitors
        }
      }, {
          success: {
            func: (result) => {
              if (result.data && result.data == 'success') {
                saveGlobalConfig(cluster.clusterID, 'rbd', body, {
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
                            storageID: result.data
                          })
                          body.configID = result.data
                        }
                        self.handleCeph()
                        body.configDetail = JSON.stringify(body.detail)
                        setGlobalConfig('rbd', body)
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
      return callback('请填写存储集群信息')
    }
    if (!/^([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5}){0,1}?(,([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5}){0,1})*$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(,[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?)*$/.test(value)) {
      return callback('请填入合法的存储集群信息')
    }
    callback()
  },
  // ceph Url 校验规则
  checkUrl(rule, value, callback) {
    const { validateFields } = this.props.form
    if (!value) {
      return callback('请填写 Ceph Agent 地址')
    }
    if (!/^(http|https):\/\/([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的 Ceph Agent 地址')
    }
    callback()
  },
  render() {
    const { cephDisable, cephChange, config } = this.props
    let storageDetail = {
      url: "",
      config: {
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
          <div className="contentMain">
            <div className="contentImg">
              <img src={CephImg} alt="镜像服务" />
            </div>
            <div className="contentkeys">
              <div className="key">Agent 地址</div>
              <div className="key">集群配置</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem >
                  <Input {...urlProps} placeholder="如：http://192.168.1.113:8001" disabled={cephDisable} />
                </FormItem>
                <FormItem >
                  <Input {...nodeProps} placeholder="如：192.168.1.113:6789，如有多个 monitor 节点，请使用英文逗号隔开" disabled={cephDisable} />
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

//持续集成
let Continue = React.createClass({
  getInitialState() {
    return {
      visible: false,
    }
  },
  handleVisibleChange (visible) {
    this.setState({
      visible,
    })
  },
  closeTip() {
    this.setState({
      visible: false,
    })
  },
  render() {
    const { visible } = this.state
    const ImageTip = <div className="imgTip"><span onClick={this.closeTip} className="close">X</span><img style={{width: 800}} src={tip_harbor} /></div>
    return (
      <div className="continue">
        <div className='title'>持续集成</div>
        <div className='content'>
          <div className="contentMain" style={{overflow:'hidden'}}>
            <div className="contentImg">
              <img src={conInter} alt="持续集成" />
            </div>
            <div className='contenttable'>
              <div className='contenttableheader'>
                <span className='forward'>流水线基础镜像</span>
                基础镜像是用于流水线任务中，提供任务执行基础环境的容器镜像，基础镜像存储在构建集群harbor上，切换构建集群时请重新上传
                <Popover overlayClassName="GlobalConfigTip" placement="left" onVisibleChange={this.handleVisibleChange} visible={visible} content={ImageTip} trigger="click">
                  <a>【查看 harbor 地址】</a>
                </Popover>
              </div>
              <div className='contenttablemain'>
                <ConIntergration />
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }
});

Emaill = Form.create()(Emaill)
Msa = Form.create()(Msa)
Ftp = Form.create()(Ftp)
Vm = Form.create()(Vm)
ChartServer = Form.create()(ChartServer)
ConInter = Form.create()(ConInter)
MirrorService = Form.create()(MirrorService)
// StorageService = Form.create()(StorageService)


class GlobalConfig extends Component {
  constructor(props) {
    super(props)
    this.state = {
      emailDisable: true,
      msaDisable: true,
      ftpDisable: true,
      vmDisable: true,
      chartServerDisable: true,
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

  msaChange() {
    this.setState({ msaDisable: !this.state.msaDisable })
  }

  ftpChange() {
    this.setState({ ftpDisable: !this.state.ftpDisable })
  }

  vmChange() {
    this.setState({ vmDisable: !this.state.vmDisable })
  }

  chartServerChange() {
    this.setState({ chartServerDisable: !this.state.chartServerDisable })
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
  setGlobalConfig(type, value) {
    let globalConfig = cloneDeep(this.state.globalConfig)
    globalConfig[type] = value
    this.setState({
      globalConfig: globalConfig
    })
  }

  render() {
    const {
      emailDisable, msaDisable, ftpDisable, vmDisable, emailChange,
      cicdeditDisable, cicdeditChange, mirrorDisable, mirrorChange,
      cephDisable, cephChange, globalConfig, chartServerDisable,
    } = this.state
    const { updateGlobalConfig, saveGlobalConfig, loadGlobalConfig, loadLoginUserDetail } = this.props
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
      <QueueAnim>
      <div id="GlobalConfig" key='GlobalConfig'>
        <Title title="全局配置" />
        <Emaill sendEmailVerification={this.props.sendEmailVerification} setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)} emailDisable={emailDisable} emailChange={this.emailChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} config={globalConfig.mail} />
        <Msa
          setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)}
          msaDisable={msaDisable}
          msaChange={this.msaChange.bind(this)}
          saveGlobalConfig={saveGlobalConfig}
          updateGlobalConfig={saveGlobalConfig}
          cluster={cluster}
          config={globalConfig.msa}
        />
        <Ftp
          setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)}
          ftpDisable={ftpDisable}
          ftpChange={this.ftpChange.bind(this)}
          saveGlobalConfig={saveGlobalConfig}
          updateGlobalConfig={saveGlobalConfig}
          cluster={cluster}
          config={globalConfig.ftp}
        />
        <Vm
          setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)}
          vmDisable={vmDisable}
          vmChange={this.vmChange.bind(this)}
          saveGlobalConfig={saveGlobalConfig}
          updateGlobalConfig={saveGlobalConfig}
          loadGlobalConfig={loadGlobalConfig}
          loadLoginUserDetail={loadLoginUserDetail}
          cluster={cluster}
          config={globalConfig.vm}
        />
        <ChartServer
          setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)}
          disable={chartServerDisable}
          onChange={this.chartServerChange.bind(this)}
          saveGlobalConfig={saveGlobalConfig}
          updateGlobalConfig={saveGlobalConfig}
          loadGlobalConfig={loadGlobalConfig}
          loadLoginUserDetail={loadLoginUserDetail}
          cluster={cluster}
          config={globalConfig.chart_repo}
        />
        <MirrorService setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)} mirrorDisable={mirrorDisable} mirrorChange={this.mirrorChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} config={globalConfig.harbor} isValidConfig={this.props.isValidConfig}/>
        {/*<StorageService setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)} cephDisable={cephDisable} cephChange={this.cephChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} config={globalConfig.rbd}  isValidConfig={this.props.isValidConfig} />*/}
        <ConInter setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)} cicdeditDisable={cicdeditDisable} cicdeditChange={this.cicdeditChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} cicdConfig={globalConfig.cicd} apiServer={globalConfig.apiServer} />
        <Continue />
      </div>
      </QueueAnim>
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
  sendEmailVerification,
  saveGlobalConfig,
  updateGlobalConfig,
  loadGlobalConfig,
  isValidConfig,
  loadLoginUserDetail
})(GlobalConfig)
