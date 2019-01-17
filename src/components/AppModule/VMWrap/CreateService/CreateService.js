/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: create service
 *
 * v0.1 - 2017-07-18
 * @author ZhangXuan
 */

import React from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Card, Row, Col, Form, Input, Button, Checkbox, Collapse  } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/createService.less'
import TraditionEnv from './TraditionEnv'
import ServiceStatus from './ServiceStatus'
import SelectPacket from './SelectPacket'
const FormItem = Form.Item;
const Panel = Collapse.Panel;
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../constants'
import NotificationHandler from '../../../../components/Notification'
import { checkServiceExists, createVMservice, checkVMUser, getVMinfosLimit } from '../../../../actions/vm_wrap'
import { vmWrapNameValidation } from '../../../../common/naming_validation'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'


class VMServiceCreate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      vmInfoID:undefined,
      host:undefined,
      account:undefined,
      jdk_id:undefined,
      password:undefined,
      address:undefined,
      init:undefined,
      normal:undefined,
      interval:undefined,
      packages:[],
      env:[],
      isNewEnv: true,
      isAddTomcat: 1, // 1 已安装 Tomcat 2 添加新 Tomcat
      limit: 0,
    }
  }
  componentDidMount() {
    const { getVMinfosLimit } = this.props
    getVMinfosLimit({}, {
      success: {
        func: res => {
          this.setState({
            limit: getDeepValue(res, [ 'results', 0, 'limitCount' ]) || 0,
          })
        },
        isAsync: true,
      },
    })
  }
  changeEnv(flag) {
    this.setState({
      isNewEnv: flag
    })
  }
  changeIsAddTomcat(type) {
    this.setState({
      isAddTomcat: type
    })
  }
  renderPanelHeader(text) {
    return (
      <div className="headerBg">
        <i/>{text}
      </div>
    )
  }
  serviceNameCheck(rules, value, callback) {
    const { checkServiceExists, form } = this.props
    const { isNewEnv, isAddTomcat } = this.state
    const message = vmWrapNameValidation(value)
    if (message !== 'success') {
      return callback(message)
    }
    if (!isNewEnv && isAddTomcat === 1) {
      const tomcat_id = form.getFieldValue('tomcat')
      if (!tomcat_id) {
        return callback(new Error('请先选择已安装 Tomcat 环境'))
      }
      clearTimeout(this.projectNameCheckTimeout)
      this.projectNameCheckTimeout = setTimeout(() => {
        checkServiceExists(value, {
          tomcat_id,
        }, {
          success: {
            func: res => {
              callback()
            },
            isAsync: true
          },
          failed: {
            func: (res) => {
              let msg = '校验失败'
              if (res.statusCode === 405) {
                msg = '该应用名称已经存在'
              }
              return callback(new Error(msg))
            },
            isAsync:true
          }
        })
      },ASYNC_VALIDATOR_TIMEOUT)
      return
    }
    callback()
  }
  checkHost(infos) {
    const { checkVMUser } = this.props
    return new Promise((resolve, reject) => {
      checkVMUser(infos,{
        success: {
          func: () => {
            resolve()
          }
        },
        failed: {
          func: err => {
            reject(err)
          }
        }
      })
    })
  }
  createService() {
    const { form } = this.props;
    const { validateFields } = form;
    const { host, account, jdk_id, password, packages, env, isNewEnv, isAddTomcat } = this.state;
    let notify = new NotificationHandler()
    let obj = {}
    let tempTomcat = {}
    for (let i = 0; i < env.length; i++) {
      obj[Object.keys(env[i])] = Object.values(env[i])[0]
    }
    let validateArr = ['serviceName','serviceDesc','checkAddress','initTimeout','ruleTimeout','intervalTimeout']
    if (isNewEnv) {
      const arr = ['envIP','envName','userName','password','jdk_id','new_port','tomcat_id','tomcat_name', 'catalina_home_dir', 'catalina_home_env']
      validateArr = validateArr.concat(arr)
    } else {
      validateArr.push('host')
      // 1 已安装 Tomcat 2 添加新 Tomcat
      if (isAddTomcat === 2) {
        validateArr = validateArr.concat(['tomcat_id', 'start_port', 'tomcat_name', 'catalina_home_dir', 'catalina_home_env'])
      } else {
        validateArr.push('tomcat')
      }
    }
    validateFields(validateArr, (errors,values)=>{
      if (!!errors) {
        return
      }
      if (!packages.length) {
        return notify.info('请选择部署包')
      }
      console.log('values', values)
      this.setState({
        confirmLoading: true
      }, () => {
        let vminfo = {
          host,
          account,
          password,
          jdk_id,
          name: values.envName,
        }
        if (isNewEnv) {
          this.checkHost(vminfo).then(() => {
            this.createAction(vminfo, values, obj)
          }).catch(() => {
            notify.close()
            notify.warn('传统环境测试连接失败，请重新填写')
            this.setState({
              confirmLoading: false
            })
          })
          return
        }
        this.createAction(vminfo, values, obj)
      })
    })
  }
  createAction(vminfo, values, obj) {
    const { createVMservice, form } = this.props;
    const { init, normal, interval, packages, isNewEnv, isAddTomcat, limit } = this.state
    let serviceName = form.getFieldValue('serviceName')
    let serviceDesc = form.getFieldValue('serviceDesc')

    let notify = new NotificationHandler()
    const body = {
      name: serviceName,
      description: serviceDesc,
      vminfo: isNewEnv ? vminfo : Number(values.host),
      healthcheck:{
        check_address:values.checkAddress,
        init_timeout:init,
        normal_timeout:normal,
        interval
      },
      packages:packages,
      envs:obj,
    }
    if (this.state.isNewEnv) {
      body.tomcat = {
        catalina_home_dir: values.catalina_home_dir,
        catalina_home_env: values.catalina_home_env,
        name: values.tomcat_name,
        start_port: values.new_port,
        tomcat_id: values.tomcat_id,
      }
    } else {
      if (isAddTomcat === 2) {
        body.tomcat = {
          catalina_home_dir: values.catalina_home_dir,
          catalina_home_env: values.catalina_home_env,
          name: values.tomcat_name,
          start_port: values.start_port,
          vminfo: values.host,
          tomcat_id: values.tomcat_id,
        }
      } else {
        body.tomcat = values.tomcat
      }
    }
    createVMservice(body, {
      success: {
        func: () => {
          notify.success('创建应用成功')
          form.resetFields()
          browserHistory.push('/app_manage/vm_wrap')
          this.setState({
            confirmLoading: false
          })
        },
        isAsync: true
      },
      failed: {
        func: res => {
          this.setState({
            confirmLoading: false
          })
          if (res && res.statusCode === 409) {
            notify.error('相关资源已经存在，请修改后重试')
            return
          }
          if (res && res.statusCode === 404 && res.message === 'package no found on ftp') {
            notify.error('创建应用失败', 'FTP 上未找到该应用包')
            return
          }
          if (res && res.statusCode === 405) {
            notify.warn('为了保证平台性能，每个项目建议不多于' + limit + '个传统环境')
            return
          }
          notify.error('创建应用失败')
        },
        isAsync: true
      }
    })
  }
  cancelCreate = () => {
    const { form } = this.props
    form.resetFields()
    browserHistory.push('/app_manage/vm_wrap')
  }
  render() {
    const { currentPacket, confirmLoading, limit } = this.state
    const { getFieldValue, getFieldProps, isFieldValidating, getFieldError } = this.props.form;
    return (
      <QueueAnim
        id="vmServiceCreate"
        type='right'
      >
        <div key='vmServiceCreate' className="vmServiceCreate">
          <Card>
            <Collapse defaultActiveKey={['env','status','packet']}>
              <Panel header={this.renderPanelHeader('传统环境')} key="env">
                <TraditionEnv limit={limit} ref={ ref => this.traditionEnv = ref } scope={this} form={this.props.form} changeEnv={this.changeEnv.bind(this)} changeIsAddTomcat={this.changeIsAddTomcat.bind(this)}/>
              </Panel>
              <Panel header={this.renderPanelHeader('配置应用')} key="packet">
                <Form>
                  <FormItem
                    label="应用名称"
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 9 }}
                    hasFeedback
                    className='app_name_style'
                    help={isFieldValidating('serviceName') ? '校验中...' : (getFieldError('serviceName') || []).join(', ')}
                  >
                    <Input {...getFieldProps('serviceName',{
                      rules: [
                        { validator: this.serviceNameCheck.bind(this)}
                      ]
                    })} placeholder="请输入应用名称"/>
                  </FormItem>
                  <FormItem
                    label="应用描述"
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 9 }}
                    hasFeedback
                    className='app_name_style'
                  >
                    <Input autosize={{ minRows: 4, maxRows: 4 }}type="textarea" {...getFieldProps('serviceDesc',{
                      rules: [
                        // { validator: this.serviceNameCheck.bind(this)}
                      ]
                    })} placeholder="请输入应用描述"/>
                  </FormItem>
                </Form>
                <SelectPacket scope={this} form={this.props.form}/>
              </Panel>
              <Panel header={this.renderPanelHeader('服务状态')} key="status">
                <ServiceStatus new_port={getFieldValue('new_port')} port={getFieldValue('port')} scope={this} form={this.props.form} currentPacket={currentPacket}/>
              </Panel>
            </Collapse>
            <div className="btnBox clearfix">
              <Button type="primary" size="large" className="pull-right" loading={confirmLoading} onClick={this.createService.bind(this)}>创建</Button>
              <Button size="large" className="pull-right" onClick={this.cancelCreate}>取消</Button>
            </div>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}
export default connect(mapStateToProps, {
  checkServiceExists,
  createVMservice,
  checkVMUser,
  getVMinfosLimit,
})(Form.create()(VMServiceCreate))
