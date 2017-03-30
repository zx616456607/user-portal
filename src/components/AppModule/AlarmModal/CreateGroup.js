/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Create Alarm component
 *
 * v0.1 - 2017-3-20
 * @author BaiYu
 */

import React from 'react'
import { Input, Form, Icon, Button, Modal } from 'antd'
import { sendAlertNotifyInvitation, getAlertNotifyInvitationStatus, createNotifyGroup } from '../../../actions/alert'
import { connect } from 'react-redux'
import NotificationHandler from '../../../common/notification_handler'

const EMAIL_STATUS_WAIT_SEND = 0
const EMAIL_STATUS_WAIT_ACCEPT = 1
const EMAIL_STATUS_ACCEPTED = 2

// create alarm group from
let mid = 0
let CreateAlarmGroup = React.createClass({
  getInitialState() {
    return {
      isAddEmail: 1
    }
  },
  removeEmail(k) {
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      keys,
    });
    this.setState({isAddEmail: 1})
  },
  addEmail() {
    const { form } = this.props
    console.log(this.state)
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      console.log('vaelue', values)

    })
    if (!this.state.isAddEmail) return
    mid++;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.concat(mid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys,
    });
    this.setState({isAddEmail: false})
  },
  addRuleEmail(rule, value, callback) {
    let isAddEmail= true
    if(!Boolean(value)) {
      callback(new Error('请输入邮箱地址'))
      isAddEmail = false
    }
    if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value)) {
      callback(new Error('请输入正确的邮箱地址'))
      isAddEmail = false
    }
    callback()
    this.setState({isAddEmail})
  },
  ruleEmail(k) {
    // send rule email
    const _this = this
    const { getFieldValue } = this.props.form
    const {
      sendAlertNotifyInvitation,
      getAlertNotifyInvitationStatus,
    } = this.props
    let email = getFieldValue(`email${k}`)
    if (email) {
      // check if email already accept invitation
      getAlertNotifyInvitationStatus(email, {
        success: {
          func: (result) => {
            if (email in result.data && result.data[email] === 1) {
              _this.setState({[`emailStatus${k}`]: EMAIL_STATUS_ACCEPTED})
            } else {
              sendNotify(email)
            }
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notification.error(`向 ${email} 发送邮件邀请失败`)
          },
          isAsync: true
        }
      })
      let sendNotify = function(email) {
        let notification = new NotificationHandler()
        sendAlertNotifyInvitation([email], {
          success: {
            func: (result) => {
              _this.setState({[`emailStatus${k}`]: EMAIL_STATUS_WAIT_ACCEPT})
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              notification.error(`向 ${email} 发送邮件邀请失败`)
            },
            isAsync: true
          }
        })
      }
    }
  },
  emailName(rule, value, callback) {
    // top email rule name
    if (!Boolean(value)) {
      callback(new Error('请输入名称'))
      return
    }
    if (value.length < 3 || value.length > 21) {
      callback(new Error('请输入3~21个字符'))
      return
    }
    callback()
  },
  submitAddEmail() {
    // submit add email modal
    // console.log('getFielsv',this.props.form.getFieldsValue());
    const { form } = this.props
    form.validateFields((error, values) => {
      if (!!error) {
        console.log('error is')
        return
      }
      console.log('submitVaelue', values)

    })
  },
  handCancel() {
    const {funcs,form } = this.props
    funcs.scope.setState({ createGroup: false, alarmModal: true})
    form.resetFields()
    this.setState({isAddEmail: true})
  },
  okModal() {
    const { form, createNotifyGroup, funcs, afterCreateFunc } = this.props
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      let body = {
        name: values.emailName,
        desc: values.emailDesc,
        receivers: {
          email: []
        },
      }
      values.keys.map(function(k) {
        if (values[`email${k}`]) {
          body.receivers.email.push({
            addr: values[`email${k}`],
            desc: values[`remark${k}`] || '',
          })
        }
      })
      createNotifyGroup(body, {
        success: {
          func: (result) => {
            funcs.scope.setState({ createGroup: false, alarmModal: true})
            form.resetFields()
            this.setState({isAddEmail: true})
            if (afterCreateFunc) {
              afterCreateFunc()
            }
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            console.log('error', err)
            let notification = new NotificationHandler()
            notification.error(`向 ${email} 发送邮件邀请失败`)
          },
          isAsync: true
        }
      })
    })
  },
  getEmailStatusText(k) {
    let text = '验证邮箱'
    switch (this.state[`emailStatus${k}`]) {
      case EMAIL_STATUS_WAIT_ACCEPT:
        text = '已发送验证邮件'
        break;
      case EMAIL_STATUS_ACCEPTED:
        text = '已接收邀请'
        break;
    }
    return text
  },
  render() {
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    const { getFieldProps, getFieldValue } = this.props.form;
    const { funcs } = this.props
    getFieldProps('keys', {
      initialValue: [],
    });

    const formItems = getFieldValue('keys').map((k) => {
      return (
        <div key={k} style={{clear:'both'}}>
        <Form.Item style={{float:'left'}}>
          <Input {...getFieldProps(`email${k}`, {
            rules: [{
              whitespace: true,
            },
            {validator: this.addRuleEmail}
            ],
          }) } style={{ width: '150px', marginRight: 8 }}
          />
        </Form.Item>
          <Form.Item style={{float:'left'}}>
            <Input placeholder="备注"size="large" style={{ width: 100,  marginRight: 8 }} {...getFieldProps(`remark${k}`)}/>
          </Form.Item>
          <Button type="primary" disabled={this.state[`emailStatus${k}`] == EMAIL_STATUS_WAIT_ACCEPT || this.state[`emailStatus${k}`] == EMAIL_STATUS_ACCEPTED} size="large" onClick={()=> this.ruleEmail(k)}>{this.getEmailStatusText(k)}</Button>
          <Button size="large" style={{ marginLeft: 8}} onClick={()=> this.removeEmail(k)}>取消</Button>
        </div>
      );
    });
    return (
      <Form className="alarmAction" form={this.props.form}>
        <Form.Item label="名称" {...formItemLayout} >
          <Input {...getFieldProps(`emailName`, {
          rules: [{ whitespace: true },
            { validator: this.emailName}
          ]}) }
        />
        </Form.Item>
        <Form.Item label="描述" {...formItemLayout} >
          <Input type="textarea" {...getFieldProps(`emailDesc`, {
          rules: [{ whitespace: true },
          ]}) }/>
        </Form.Item>
        <div className="lables">
          <div className="keys">
            邮箱
          </div>
          <div className="emaillItem" >

            {formItems}
            <div style={{clear:'both'}}><a onClick={() => this.addEmail()}><Icon type="plus-circle-o" /> 添加邮箱</a></div>
          </div>
        </div>
        <div className="ant-modal-footer" style={{margin:'0 -30px'}}>
          <Button type="ghost" size="large" onClick={()=> this.handCancel()}>取消</Button>
          <Button type="primary" size="large" onClick={()=> this.okModal()}>保存</Button>
        </div>
      </Form>
    )
  }
})

CreateAlarmGroup = Form.create()(CreateAlarmGroup)
function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  sendAlertNotifyInvitation,
  getAlertNotifyInvitationStatus,
  createNotifyGroup,
})(CreateAlarmGroup)