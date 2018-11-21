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
import { Form, Button, Input, Spin, Checkbox, Icon, Modal, Radio } from 'antd'
import ReactDom from 'react-dom'
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
import { saveGlobalConfig, updateGlobalConfig, loadGlobalConfig, isValidConfig, sendEmailVerification, validateMsgConfig } from '../../../actions/global_config'
import { loadLoginUserDetail } from '../../../actions/entities'
import NotificationHandler from '../../../components/Notification'
import { getPortalRealMode } from '../../../common/tools'
import { LITE } from '../../../constants'
import { PHONE_REGEX } from '../../../../constants'
import ConIntergration from './ContinueIntegration'
import Title from '../../Title'
import QueueAnim from 'rc-queue-anim'
import { Link } from 'react-router'
import TenxIcon from '@tenx-ui/icon/es/_old'

const FormItem = Form.Item
const mode = getPortalRealMode
const liteFlag = mode === LITE
const RadioGroup = Radio.Group;

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
            if(msg.indexOf('dial tcp') > -1 &&
              msg.indexOf('getsockopt: connection refused') > -1){
              msg = '服务器 IP 地址不正确'
            }
            if(msg === '530 Login incorrect.') msg = '用户名或密码错误'
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
      <div className="GlobalConfigFtp">
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
      const { form, saveGlobalConfig, updateGlobalConfig, cluster, setGlobalConfig } = this.props
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
      const { form, saveGlobalConfig, cluster, setGlobalConfig } = this.props
      const { getFieldValue } = form
      const host = getFieldValue('url')
      let protocol = ''
      let url = host
      if (host.includes('://')) {
        [ protocol, url ] = getFieldValue('url').split('://')
      }
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
      initialValue: !!(protocol && url) ? `${protocol}://${url}` : url
    });

    const chartRepoID = getFieldProps('chartRepoID', {
      initialValue: config ? config.configID : ''
    });

    return (
      <div className="GlobalConfigTemplate">
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
          默认 Harbor
          {
            liteFlag &&
            <span className="tips">Tips：时速云官方不支持企业版 Lite 配置私有的镜像仓库，如有需要请联系时速云购买企业版 Pro</span>
          }
          <span className="tips">提供初始化所需基础镜像，并作为镜像仓库默认harbor；新版本支持每个集群配置一个harbor，在<Link to={{pathname: '/cluster', query: {tab: 'cluster_set'}}}>【集群管理】-【集群设置】-【镜像服务】</Link>配置</span>
        </div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <img src={MirrorImg} alt="镜像服务" />
            </div>
            {/*<div className="contentForm" style={{ marginTop: 35 }}>
              <div className="key">新版本支持每个集群配置一个harbor，构建集群必须配置harbor
              </div>
            </div>*/}
            <div className="contentkeys">
              <div className="key">Harbor 地址</div>
            </div>
            <div className="contentForm">
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

// ai 深度学习
class AiDeepLearning extends React.Component {

  state = {
    disable: true,
  }

  componentDidMount = () => {
    this.setConfigForm()
  }

  setConfigForm = () => {
    const { config } = this.props
    if (!config) {
      return
    }
    const { configDetail, configID, detail } = config
    const configDate = configDetail && JSON.parse(configDetail) || detail
    const { apiVersion, host, protocol } = configDate
    const aiApi = protocol ? `${protocol}://${host}` : ''
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      aiApi,
      apiVersion,
    })
    if (configID) {
      setFieldsValue({
        configID,
      })
    }
  }

  handlSave = () => {
    this.props.form.validateFields((error, values) => {
      if (error) return
      const { aiApi, apiVersion, configID } = values
      const protocol = aiApi.split('://')[0]
      const host = aiApi.split('://')[1]
      const body = {
        detail: {
          protocol,
          host,
          apiVersion
        }
      }
      if (configID) {
        body.configID = configID
      }
      const { saveGlobalConfig, cluster, form } = this.props
      const notification = new NotificationHandler()
      notification.spin('保存中')
      saveGlobalConfig(cluster.clusterID, 'ai', body, {
        success: {
          func: () => {
            notification.close()
            notification.success('Ai 深度学习配置保存成功')
            this.changeDisable()
            this.props.setGlobalConfig('ai', body)
          }
        },
        failed: {
          func: (err) => {
            notification.close()
            let aiMsg
            if (err.message.message) {
              aiMsg = err.message.message
            } else {
              aiMsg = err.message
            }
            notification.error('Ai 深度学习配置保存失败', aiMsg)
          }
        }
      })

    })

  }

  handleCandle = () => {
    this.setConfigForm()
    this.changeDisable()
  }

  changeDisable = () => {
    this.setState({
      disable: !this.state.disable,
    })
  }

  checkUrl = (rule, value, callback) => {
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写 AI 深度学习服务地址')])
      return
    }
    if (!/^(http:\/\/|https:\/\/)([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?(\/)?$/.test(value) && !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?(\/)?$/.test(value)) {
      callback([new Error('请填入 AI 深度学习服务地址')])
      return
    }
    callback()
  }

  checkVersion = (rule, value, callback) => {
    if (!value) {
      return callback([new Error('请填写 apiVersion 地址')])
    }
    callback()
  }

  render() {
    const { disable } = this.state
    const { form, config } = this.props
    const { getFieldProps } = form
    const aiApiProps = getFieldProps('aiApi', {
      rules: [
        { validator: this.checkUrl }
      ],
    })
    const apiVersionProps = getFieldProps('apiVersion', {
      rules: [
        { validator: this.checkVersion }
      ],
      initialValue: 'v3',
    })
    const aiID = getFieldProps('configID', {
      initialValue: config ? config.configID : ''
    })
    return (
      <div className="AiDeepLearning">
        <div className="title">AI 深度学习</div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <TenxIcon type="ai" size="86"/>
            </div>
            <div className="contentkeys">
              <div className="key">AI 深度学习地址</div>
              <div className="key">apiVersion 地址</div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem>
                  <Input {...aiApiProps} placeholder="如：http://192.168.1.59:61088" disabled={disable} />
                </FormItem>
                <FormItem>
                  <Input {...apiVersionProps} placeholder="如：v3" disabled={disable} />
                </FormItem>
                {
                  disable ?
                    <FormItem>
                      <Button
                        type="primary"
                        onClick={this.changeDisable}
                      >
                        编辑
                      </Button>
                    </FormItem>
                    :
                    <FormItem>
                      <Button
                        onClick={this.handleCandle}
                        style={{ marginRight: 12 }}
                      >
                        取消
                      </Button>
                      <Button
                        type="primary"
                        onClick={this.handlSave}
                      >
                        保存
                      </Button>
                    </FormItem>
                }
                <input type="hidden" {...aiID} />
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

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
                基础镜像是用于 流水线 任务中，提供任务执行基础环境的容器镜像
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

// 短信告警
class MessageAlarm extends React.Component {

  state = {
    disable: true,
    isShowValidate: false,
    confirmLoading: false,
  }

  componentDidMount = () => {
    this.setConfigForm()
  }

  setConfigForm = () => {
    const { config } = this.props
    const { setFieldsValue } = this.props.form
    if (!config) return null
    const { configDetail, configID, detail } = config || {}
    const configData = configDetail && JSON.parse(configDetail) || detail
    const { sms_user, sms_key, log_template, resource_template } = configData.sendcloud || {}
    const { phoneParameter, contentParameter } = configData.urlconfig || {}
    setFieldsValue({
      meassageType: configData && configData.meassageType || '',
      sendUrl: configData && configData.sendcloud && configData.sendcloud.url || '',
      smsUser: sms_user,
      smsKey: sms_key,
      logTemplate: log_template,
      resourceTemplate: resource_template,
      cloudUrl: configData && configData.urlconfig && configData.urlconfig.url || '',
      phoneParameter,
      contentParameter,
      configID,
    })
  }

  handlSave = () => {
    const { getFieldValue, validateFields } = this.props.form
    let checkArr = [ 'meassageType', 'configID', 'sendUrl', 'smsUser', 'smsKey', 'logTemplate', 'resourceTemplate' ]
    if (getFieldValue('meassageType') === 'urlconfig') {
      checkArr = [ 'meassageType', 'configID', 'cloudUrl', 'contentParameter', 'phoneParameter' ]
    }
    validateFields(checkArr, (error, values) => {
      if (error) return
      const { config } = this.props
      const { configDetail, detail } = config || {}
      const configData = configDetail && JSON.parse(configDetail) || detail || {}
      const { meassageType, configID } = values
      if (meassageType === 'sendcloud') {
        const { sendUrl, logTemplate, resourceTemplate, smsKey, smsUser,  } = values
        Object.assign(configData, {
          meassageType,
          [meassageType]: {
            url: sendUrl,
            log_template: logTemplate,
            resource_template: resourceTemplate,
            sms_key: smsKey,
            sms_user: smsUser,
          },
        })
      }
      if (meassageType === 'urlconfig') {
        const { cloudUrl, contentParameter, phoneParameter } = values
        Object.assign(configData, {
          meassageType,
          [meassageType]: {
            url: cloudUrl,
            contentParameter,
            method: "GET",
            phoneParameter,
          },
        })
      }
      const body = {
        configID: configID ? configID : '',
        detail: configData,
      }
      const { saveGlobalConfig, cluster } = this.props
      const notification = new NotificationHandler()
      notification.spin('保存中')
      saveGlobalConfig(cluster.clusterID, 'message', body, {
        success: {
          func: () => {
            notification.close()
            notification.success('保存成功')
            this.changeDisable()
            this.props.setGlobalConfig('message', body)
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
            notification.error('保存失败', msg)
          }
        }
      })
    })
  }

  validateConfig = () => {
    this.props.form.validateFields([ 'sendUrl', 'smsUser', 'smsKey', 'logTemplate', 'resourceTemplate', 'phone' ], (error, values) => {
      if (error) return
      const { sendUrl, smsUser, smsKey, logTemplate, resourceTemplate, phone } = values
      const body = {
        url: sendUrl,
        sms_user: smsUser,
        sms_key: smsKey,
        log_template: logTemplate,
        resource_template: resourceTemplate,
        test_phone: phone
      }
      const notification = new NotificationHandler()
      const { validateMsgConfig } = this.props
      this.changemLoading()
      validateMsgConfig(body, {
        success: {
          func: () => {
            this.changemLoading()
            notification.close()
            notification.success('验证成功')
            this.changeValidate()
          }
        },
        failed: {
          func: err => {
            this.changemLoading()
            notification.close()
            const msg = err.message.message
            notification.warn('验证失败', msg)
          }
        }
      })
    })
  }

  handleCandle = () => {
    this.setConfigForm()
    this.changeDisable()
  }

  changeDisable = () => {
    this.setState({
      disable: !this.state.disable,
    })
  }

  checkUrl = (rule, value, callback) => {
    if (!value) {
      callback([new Error('请填写短信服务器地址')])
      return
    }
    callback()
  }

  checkPhone = (rule, value, callback) => {
    if (!value) {
      return callback('请输入手机号')
    }
    if (!PHONE_REGEX.test(value)) {
      return callback('请输入正确的号码')
    }
    callback()
  }

  showValidate = () => {
    this.props.form.validateFields([ 'sendUrl', 'smsUser', 'smsKey', 'logTemplate', 'resourceTemplate' ],
      (error, values) => {
        if (error) return
        this.changeValidate()
      }
    )
  }

  changeValidate = () => {
    this.setState({
      isShowValidate: !this.state.isShowValidate,
    })
  }

  changemLoading = () => {
    this.setState({
      confirmLoading: !this.state.confirmLoading,
    })
  }
  render() {
    const { disable, isShowValidate, confirmLoading } = this.state
    const { form, config } = this.props
    const { getFieldProps, getFieldValue } = form
    const isSendcloud = getFieldValue('meassageType') === 'sendcloud'
    const sendUrlProps = getFieldProps('sendUrl', {
      rules: [
        { validator: this.checkUrl }
      ],
    })
    const cloudUrlProps = getFieldProps('cloudUrl', {
      rules: [
        { validator: this.checkUrl }
      ],
    })
    const msmUserProps = getFieldProps('smsUser', {
      rules: [ { required: isSendcloud ? true : false, message: '请输入 SMS_USER' } ]
    })
    const msmsKeyProps = getFieldProps('smsKey', {
      rules: [ { required: isSendcloud ? true : false, message: '请输入 SMS_KEY' } ]
    })
    const logTemProps = getFieldProps('logTemplate', {
      rules: [ { required: isSendcloud ? true : false, message: '请输入 模板 ID' } ]
    })
    const resourceProps = getFieldProps('resourceTemplate', {
      rules: [ { required: isSendcloud ? true : false, message: '请输入 资源 ID' } ]
    })
    const phoneProps = getFieldProps('phone', {
      rules: [ { validator: this.checkPhone } ]
    })
    const msgID = getFieldProps('configID', {
      initialValue: config ? config.configID : ''
    })
    const meassageTypeProps = getFieldProps('meassageType')
    const phoneParameterProps =  getFieldProps('phoneParameter', {
      rules: [{ required: !isSendcloud ? true : false, message: '请输入手机参数名' }]
    })
    const contentParameterProps =  getFieldProps('contentParameter', {
      rules: [{ required: !isSendcloud ? true : false, message: '请输入内容参数名' }]
    })
    return (
      <div className="GlobalConfigMessage">
        <div className="title">短信告警</div>
        <div className="content">
          <div className="contentMain">
            <div className="contentImg">
              <Icon type="message" />
            </div>
            <div className="contentkeys">
              <div className="key">服务商</div>
              <div className="key">短信服务器</div>
              <div className={ isSendcloud ? '' : 'candleShow' }>
                <div className="key">SMS_USER</div>
                <div className="key">SMS_KEY</div>
                <div className="key">模板 ID</div>
                <div className="key">资源 ID</div>
              </div>
              <div className={ isSendcloud ? 'candleShow' : '' }>
                <div className="key">手机参数名</div>
                <div className="key">内容参数名</div>
                <div className="key">请求地址预览</div>
              </div>
            </div>
            <div className="contentForm">
              <Form horizontal className="contentFormMain">
                <FormItem>
                  <RadioGroup
                    disabled={disable}
                    {...meassageTypeProps}
                  >
                    <Radio value="sendcloud">第三方 SendCloud</Radio>
                    <Radio value="urlconfig">企业私有短信服务</Radio>
                  </RadioGroup>
                </FormItem>
                <div className={ isSendcloud ? '' : 'candleShow' }>
                  <FormItem>
                    <Input {...sendUrlProps} placeholder="请填写短信服务器地址" disabled={disable} />
                  </FormItem>
                  <FormItem>
                    <Input {...msmUserProps} placeholder="输入短信服务器的 SMS_USER" disabled={disable} />
                  </FormItem>
                  <FormItem>
                    <Input {...msmsKeyProps} placeholder="输入短信服务器的 SMS_KEY" disabled={disable} />
                  </FormItem>
                  <FormItem>
                    <Input {...logTemProps} placeholder="输入短信服务器的 模板 ID" disabled={disable} />
                  </FormItem>
                  <FormItem>
                    <Input {...resourceProps} placeholder="输入短信服务器的 资源 ID" disabled={disable} />
                  </FormItem>
                </div>
                <div className={ isSendcloud ? 'candleShow' : '' }>
                  <FormItem>
                    <Input {...cloudUrlProps} placeholder="请填写短信服务器地址" disabled={disable} />
                  </FormItem>
                  <FormItem>
                    <Input {...phoneParameterProps} placeholder="输入短信服务器的手机参数名" disabled={disable} />
                  </FormItem>
                  <FormItem>
                    <Input {...contentParameterProps} placeholder="输入短信服务器的内容参数名" disabled={disable} />
                  </FormItem>
                  <FormItem>
                    <div className="addressPreview">
                      {getFieldValue('cloudUrl')
                        && getFieldValue('phoneParameter')
                        && getFieldValue('contentParameter')
                        && `${getFieldValue('cloudUrl')}?${getFieldValue('phoneParameter')}=13000000000&${getFieldValue('contentParameter')}=我是短信内容`
                        || '输入以上参数即可预览'
                      }
                    </div>
                  </FormItem>
                </div>
                {
                  disable ?
                    <FormItem>
                      <Button
                        type="primary"
                        onClick={this.changeDisable}
                      >
                        编辑
                      </Button>
                    </FormItem>
                    :
                    <FormItem>
                      <Button
                        onClick={this.handleCandle}
                      >
                        取消
                      </Button>
                      <Button
                        type="primary"
                        onClick={this.handlSave}
                        style={{ margin: '0 12px' }}
                      >
                        保存
                      </Button>
                      {
                        isSendcloud && <Button
                        onClick={this.showValidate}
                        >
                          发送验证短信
                        </Button>
                      }
                    </FormItem>
                }
                <input type="hidden" {...msgID} />
              </Form>
            </div>
          </div>
        </div>
        <Modal
          title="验证短信"
          visible={isShowValidate}
          onOk={this.validateConfig}
          onCancel={this.changeValidate}
          confirmLoading={confirmLoading}
        >
          <FormItem
            label="手机号"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >
            <Input {...phoneProps} placeholder="请填写手机号"/>
          </FormItem>
        </Modal>
      </div>
    )
  }
}

Emaill = Form.create()(Emaill)
Msa = Form.create()(Msa)
Ftp = Form.create()(Ftp)
Vm = Form.create()(Vm)
ChartServer = Form.create()(ChartServer)
ConInter = Form.create()(ConInter)
MirrorService = Form.create()(MirrorService)
// StorageService = Form.create()(StorageService)
AiDeepLearning = Form.create()(AiDeepLearning)
MessageAlarm = Form.create()(MessageAlarm)


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
      globalConfig: {},
      menuArr :[
        {
          id: 'GlobalConfigEmail',
          name: '邮件报警',
        },
        {
          id: 'GlobalConfigMessage',
          name: '短信告警',
        },
        {
          id: 'GlobalConfigMSA',
          name: '微服务',
        },
        {
          id: 'GlobalConfigFtp',
          name: 'FTP 服务器配置',
        },
        {
          id: 'GlobalConfigVm',
          name: '传统应用',
        },
        {
          id: 'GlobalConfigTemplate',
          name: '应用模板',
        },
        {
          id: 'mirrorservice',
          name: '默认 Harbor',
        },
        {
          id: 'AiDeepLearning',
          name: 'AI 深度学习',
        },
        {
          id: 'conInter',
          name: '开放 API 地址',
        },
        {
          id: 'continue',
          name: '持续集成',
        }
      ],
      currentMenu: 'GlobalConfigEmail'
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
  componentDidMount() {
    setTimeout(() => {
      const navHeight = this.refs.nav ? this.refs.nav.offsetHeight: 0
      const globalWrapper = document.getElementById('GlobalConfig')
      globalWrapper.style.marginTop = `${navHeight + 10}px`
    }, 100)
  }
  componentWillUnmount() {
    this.props.loadLoginUserDetail()
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
  jumpTo = id => {
    this.setState({
      currentMenu: id
    })
    const element = document.getElementsByClassName(id)[0]
    const existItem = element && element.getElementsByClassName('title')[0]
    const anchor = document.createElement('div')
    const navHeight = this.refs.nav ? this.refs.nav.offsetHeight: 0
    // 创建锚点元素，滚动到窗口顶部与锚点元素对齐，删除锚点
    anchor.style.position = 'absolute'
    anchor.style.top = `-${navHeight + 55}px`
    element.insertBefore(anchor, existItem)
    anchor.scrollIntoView({behavior: "smooth", block: "start"});
    element.removeChild(anchor)
  }
  render() {
    const {
      emailDisable, msaDisable, ftpDisable, vmDisable, emailChange,
      cicdeditDisable, cicdeditChange, mirrorDisable, mirrorChange,
      cephDisable, cephChange, globalConfig, chartServerDisable,
      menuArr,currentMenu
    } = this.state


    const { updateGlobalConfig, saveGlobalConfig, loadGlobalConfig, loadLoginUserDetail, validateMsgConfig } = this.props
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
      <div id="GlobalConfig" ref='wrapper'>
        <div className="nav" ref="nav">
          <span className="configNav">
            {
              menuArr.map(v => <Button size="large"
                                 className={currentMenu === v.id? '' : 'defaultBtn'}
                                 key={v.id}
                                 type={currentMenu === v.id ? 'primary' : 'default'}
                                 onClick={() => this.jumpTo(v.id)}
                               >{v.name}</Button>)
            }
          </span>
        </div>

        <QueueAnim>
          <div className="globalConfigContent">
            <Title title="全局配置" />
            <Emaill
              sendEmailVerification={this.props.sendEmailVerification}
              setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)}
              emailDisable={emailDisable} emailChange={this.emailChange.bind(this)}
              saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig}
              cluster={cluster}
              config={globalConfig.mail} />

            <MessageAlarm
              setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)}
              saveGlobalConfig={saveGlobalConfig}
              updateGlobalConfig={saveGlobalConfig}
              cluster={cluster}
              config={globalConfig.message}
              validateMsgConfig={validateMsgConfig}
            />
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
              cluster={cluster}
              config={globalConfig.vm}
            />
            <ChartServer
              setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)}
              disable={chartServerDisable}
              onChange={this.chartServerChange.bind(this)}
              saveGlobalConfig={saveGlobalConfig}
              updateGlobalConfig={saveGlobalConfig}
              cluster={cluster}
              config={globalConfig.chart_repo}
            />
            <MirrorService setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)} mirrorDisable={mirrorDisable} mirrorChange={this.mirrorChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} config={globalConfig.harbor} isValidConfig={this.props.isValidConfig}/>
            <AiDeepLearning
              setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)}

              saveGlobalConfig={saveGlobalConfig}
              updateGlobalConfig={saveGlobalConfig}
              loadGlobalConfig={loadGlobalConfig}
              cluster={cluster}
              config={globalConfig.ai}
            />
            {/*<StorageService setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)} cephDisable={cephDisable} cephChange={this.cephChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} config={globalConfig.rbd}  isValidConfig={this.props.isValidConfig} />*/}
            <ConInter setGlobalConfig={(key, value) => this.setGlobalConfig(key, value)} cicdeditDisable={cicdeditDisable} cicdeditChange={this.cicdeditChange.bind(this)} saveGlobalConfig={saveGlobalConfig} updateGlobalConfig={saveGlobalConfig} cluster={cluster} cicdConfig={globalConfig.cicd} apiServer={globalConfig.apiServer} />
            <Continue />
          </div>
        </QueueAnim>

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
  sendEmailVerification,
  saveGlobalConfig,
  updateGlobalConfig,
  loadGlobalConfig,
  isValidConfig,
  loadLoginUserDetail,
  validateMsgConfig,
})(GlobalConfig)
