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
import { sendAlertNotifyInvitation, getAlertNotifyInvitationStatus, createNotifyGroup, modifyNotifyGroup, loadNotifyGroups } from '../../../actions/alert'
import { connect } from 'react-redux'
import NotificationHandler from '../../../common/notification_handler'

const EMAIL_STATUS_WAIT_ACCEPT = 0
const EMAIL_STATUS_ACCEPTED = 1
const EMAIL_STATUS_WAIT_SEND = 2

// create alarm group from
let mid = 0
let CreateAlarmGroup = React.createClass({
  getInitialState() {
    return {
      isAddEmail: 1,
      transitionTime1:'验证邮件'
    }
  },
  componentWillMount() {
    this.fillEmails(this.props)
  },
  componentWillReceiveProps(nextProps) {
    this.fillEmails(nextProps, this.props)
  },
  fillEmails(newProps, oldProps) {
    const {
      isModify,
      data,
      form,
    } = newProps
    if (form.getFieldValue('keys') && form.getFieldValue('keys').length > 0) {
      return
    }
    if (isModify) {
      if (oldProps && oldProps.isModify === true) {
        return
      }
      let keys = []
      for (let email of data.receivers.email) {
        mid++
        keys.push(mid)
        form.setFieldsValue({
          [`email${mid}`]: email.addr,
          [`remark${mid}`]: email.desc,
        })
        this.setState({
          [`emailStatus${mid}`]: email.status,
        })
      }
      form.setFieldsValue({
        keys
      })
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
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
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
    let time = 60
    const { getFieldValue } = this.props.form
    const {
      sendAlertNotifyInvitation,
      getAlertNotifyInvitationStatus,
    } = this.props
    let email = getFieldValue(`email${k}`)
    let notification = new NotificationHandler()
    let sendNotify = function(email) {
      sendAlertNotifyInvitation([email], {
        success: {
          func: (result) => {
            _this.setState({[`emailStatus${k}`]: EMAIL_STATUS_WAIT_ACCEPT})
            _this.getEmailStatusText(k,time)
            notification.success(`向 ${email} 发送邮件邀请成功`)
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notification.error(`向 ${email} 发送邮件邀请失败`)
          }
        }
      })
    }
    if (email) {
      // check if email already accept invitation
      getAlertNotifyInvitationStatus(email, {
        success: {
          func: (result) => {
            if (email in result.data && result.data[email] === 1) {
               this.setState({
                  [`emailStatus${k}`]: EMAIL_STATUS_ACCEPTED,
                  ['transitionTime'+[k]]:'已接收邀请',
                  ['transitionEnble'+[k]]:true
                })
            } else {
              sendNotify(email)
            }
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            notification.error(`向 ${email} 发送邮件邀请失败`)
          }
        }
      })
    }
  },
  groupName(rule, value, callback) {
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
        return
      }
    })
  },
  handCancel() {
    const {funcs,form } = this.props
    funcs.scope.setState({ createGroup: false, alarmModal: true, modifyGroup: false})
    form.resetFields()
    this.setState({isAddEmail: true})
  },
  okModal() {
    const { form, createNotifyGroup, modifyNotifyGroup, funcs, afterCreateFunc, afterModifyFunc, data, shouldLoadGroup } = this.props
    let notification = new NotificationHandler()
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      // have one email at least
      if (values.keys.length === 0) {
        notification.error('请至少添加一个邮箱')
        return
      }
      let body = {
        name: values.groupName,
        desc: values.groupDesc,
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
      if (!this.props.isModify) {
        createNotifyGroup(body, {
          success: {
            func: (result) => {
              funcs.scope.setState({ createGroup: false, alarmModal: true})
              form.resetFields()
              this.setState({isAddEmail: true})
              if (afterCreateFunc) {
                afterCreateFunc()
              }
              if(shouldLoadGroup) {
                setTimeout(this.props.loadNotifyGroups(), 0)
              }
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              if (err.message.code === 409) {
                notification.error('创建通知组失败', `通知组名字已存在，请修改后重试`)
              } else {
                notification.error(`创建通知组失败`, err.message.message)
              }
            },
            isAsync: true
          }})
      } else {
        modifyNotifyGroup(data.groupID, body, {
          success: {
            func: (result) => {
              funcs.scope.setState({ modifyGroup: false, alarmModal: true})
              form.resetFields()
              this.setState({isAddEmail: true})
              if (afterModifyFunc) {
                afterModifyFunc()
              }
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              notification.error(`修改通知组失败`, err.message.message)
            }
          }
        })
      }
    })
  },
  getEmailStatusText(k,time) {
    let text = '验证邮件'
    let enble= true
    switch (this.state[`emailStatus${k}`]) {
      case EMAIL_STATUS_WAIT_ACCEPT:{
        // text = '再次验证邮件'
        let timefunc = setInterval(()=>{
          if (time <=1) {
            enble = false
            clearInterval(timefunc)
          }
          time--
          text = time +'秒后重新验证'
          this.setState({
            ['transitionTime'+[k]]:time ==0?'验证邮件':text,
            ['transitionEnble'+[k]]:enble
          })
        },1000)
        return;
      }
      case EMAIL_STATUS_ACCEPTED:
        this.setState({
          ['transitionTime'+[k]]:'已接收邀请',
          ['transitionEnble'+[k]]:enble
        })
        return
      // default: this.setState({transitionTime:text})
    }
  },
  render() {
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    const { getFieldProps, getFieldValue } = this.props.form;
    const { funcs } = this.props
    getFieldProps('keys', {
      initialValue: [0],
    });
    const { isModify,data } = this.props
    const formItems = getFieldValue('keys').map((k) => {
      let indexed = Math.max(0,k-1)
      let initAddrValue = ''
      let initDescValue = ''
      if (isModify && data.receivers.email[indexed]) {
        initAddrValue = data.receivers.email[indexed].addr
        initDescValue = data.receivers.email[indexed].desc
      }
      return (
        <div key={k} style={{clear:'both'}}>
        <Form.Item style={{float:'left'}}>
          <Input {...getFieldProps(`email${k}`, {
            rules: [{
              whitespace: true,
            },
            {validator: this.addRuleEmail}
            ],
            initialValue: initAddrValue,
          }) } style={{ width: '150px', marginRight: 8 }}
          />
        </Form.Item>
        <Form.Item style={{float:'left'}}>
          <Input placeholder="备注"size="large" style={{ width: 80,  marginRight: 8 }} {...getFieldProps(`remark${k}`,{initialValue: initDescValue})}/>
        </Form.Item>
        <Button type="primary" style={{padding:5}} disabled={this.state[`transitionEnble${k}`]} size="large" onClick={()=> this.ruleEmail(k)}>{this.state[`transitionEnble${k}`] ? this.state[`transitionTime${k}`]:'验证邮件'}</Button>
        <Button size="large" style={{ marginLeft: 8}} onClick={()=> this.removeEmail(k)}>取消</Button>
      </div>
      );
    });
    return (
      <Form className="alarmAction" form={this.props.form}>
        <Form.Item label="名称" {...formItemLayout} >
          <Input placeholder="请输入名称" {...getFieldProps(`groupName`, {
          rules: [{ whitespace: true },
            { validator: this.groupName}
          ],
          initialValue: this.props.isModify ? this.props.data.name : '',}) }
          disabled={!!this.props.isModify}/>
        </Form.Item>
        <Form.Item label="描述" {...formItemLayout} >
          <Input type="textarea" {...getFieldProps(`groupDesc`, {
          rules: [{ whitespace: true },
          ],
          initialValue: this.props.isModify ? this.props.data.desc : '',
          }) }/>
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
  modifyNotifyGroup,
  loadNotifyGroups
})(CreateAlarmGroup)
