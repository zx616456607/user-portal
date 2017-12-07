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
import { checkServiceExists, createVMservice } from '../../../../actions/vm_wrap'
import { validateK8sResourceForServiceName } from '../../../../common/naming_validation'

class VMServiceCreate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      vmInfoID:undefined,
      host:undefined,
      account:undefined,
      password:undefined,
      address:undefined,
      init:undefined,
      normal:undefined,
      interval:undefined,
      packages:[],
      env:[],
      isNewEnv: true
    }
  }

  onChange(key) {

  }
  changeEnv(flag) {
    this.setState({
      isNewEnv: flag
    })
  }
  renderPanelHeader(text) {
    return (
      <div className="headerBg">
        <i/>{text}
      </div>
    )
  }
  serviceNameCheck(rules,value,callback) {
    const { checkServiceExists } = this.props;
    let newValue = value
    if (!Boolean(newValue)) {
      callback()
      return
    }
    if (!validateK8sResourceForServiceName(newValue)) {
      return callback('应用名称可由3~24位小写字母、数字、中划线组成，以小写字母开头，小写字母或者数字结尾')
    }
    clearTimeout(this.projectNameCheckTimeout)
    this.projectNameCheckTimeout = setTimeout(()=>{
      checkServiceExists(value,{},{
        success: {
          func: (res) => {
            callback()
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            if (res.statusCode === 405) {
              return callback(new Error('该应用名称已经存在'))
            }
          },
          isAsync:true
        }
      })
    },ASYNC_VALIDATOR_TIMEOUT)
  }
  createService() {
    const { createVMservice, form } = this.props;
    const { validateFields } = form;
    const { host, account, password, address, init, normal, interval, packages, env, isNewEnv } = this.state;
    let notify = new NotificationHandler()
    let obj = {}
    for (let i = 0; i < env.length; i++) {
      obj[Object.keys(env[i])] = Object.values(env[i])[0]
    }
    let serviceName = form.getFieldValue('serviceName')
    let validateArr = ['checkAddress','initTimeout','ruleTimeout','intervalTimeout']
    if (isNewEnv) {
      validateArr = validateArr.concat(['envIP','userName','password'])
    } else {
      validateArr.push('host')
    }
    validateFields(validateArr, (errors,values)=>{
      if (!!errors) {
        return
      }
      if (!packages.length) {
        return notify.info('请选择部署包')
      }
      let vminfo = {
        host,
        account,
        password
      }
      createVMservice({
        name: serviceName,
        vminfo: isNewEnv ? vminfo : Number(values.host),
        healthcheck:{
          check_address:address,
          init_timeout:init,
          normal_timeout:normal,
          interval
        },
        packages:packages,
        envs:obj
      },{
        success: {
          func: res => {
            notify.success('创建应用成功')
            form.resetFields()
            browserHistory.push('/app_manage/vm_wrap')
          },
          isAsync: true
        },
        failed: {
          func: res => {
            if (res && res.statusCode === 409) {
              notify.error('相关资源已经存在，请修改后重试')
              return
            }
            notify.error('创建应用失败')
          },
          isAsync: true
        }
      })
    })
  }
  cancelCreate = () => {
    const { form } = this.props
    form.resetFields()
    browserHistory.push('/app_manage/vm_wrap')
  }
  render() {
    const { getFieldProps, isFieldValidating, getFieldError } = this.props.form;
    return (
      <QueueAnim
        id="vmServiceCreate"
        type='right'
      >
        <div key='vmServiceCreate' className="vmServiceCreate">
          <Card>
            <Form>
              <FormItem
                label="应用名称"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 9 }}
                hasFeedback
                className='app_name_style'
                // help={isFieldValidating('serviceName') ? '校验中...' : (getFieldError('serviceName') || []).join(', ')}
              >
                <Input {...getFieldProps('serviceName',{
                  rules: [
                    {required: true,message:'请输入应用名称'},
                    { validator: this.serviceNameCheck.bind(this)}
                  ]
                })} placeholder="请输入应用名称"/>
              </FormItem>
            </Form>
            <Collapse defaultActiveKey={['env','status','packet']} onChange={this.onChange}>
              <Panel header={this.renderPanelHeader('传统环境')} key="env">
                <TraditionEnv scope={this} form={this.props.form} changeEnv={this.changeEnv.bind(this)}/>
              </Panel>
              <Panel header={this.renderPanelHeader('选择部署包')} key="packet">
                <SelectPacket scope={this} form={this.props.form}/>
              </Panel>
              <Panel header={this.renderPanelHeader('服务状态')} key="status">
                <ServiceStatus scope={this} form={this.props.form}/>
              </Panel>
            </Collapse>
            <div className="btnBox clearfix">
              <Button type="primary" size="large" className="pull-right" onClick={this.createService.bind(this)}>创建</Button>
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
  createVMservice
})(Form.create()(VMServiceCreate))