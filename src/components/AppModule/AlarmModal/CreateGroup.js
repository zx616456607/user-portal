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
import { sendAlertNotifyInvitation, getAlertNotifyInvitationStatus, createNotifyGroup, modifyNotifyGroup, loadNotifyGroups, validateDingHook } from '../../../actions/alert'
import { connect } from 'react-redux'
// import QRCode from 'qrcode.react'
import NotificationHandler from '../../../components/Notification'
import { injectIntl, FormattedMessage } from 'react-intl'
import intlMsg from './Intl'
import ServiceCommonIntl, { AppServiceDetailIntl } from '../../AppModule/ServiceIntl'
import { URL_REG_EXP } from '../../../constants'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
const EMAIL_STATUS_WAIT_ACCEPT = 0
const EMAIL_STATUS_ACCEPTED = 1
const EMAIL_STATUS_WAIT_SEND = 2

const notify = new NotificationHandler()

// create alarm group from
let mid = 0
let phoneUuid = 0
let dingUuid = 0
let CreateAlarmGroup = React.createClass({
  getInitialState() {
    const { formatMessage } = this.props.intl
    return {
      isAddEmail: 1,
      transitionTime1:formatMessage(AppServiceDetailIntl.validateEmail),
      // 验证hook的loading态
      validateDingNum: -1,
      validateDing: false,
    }
  },
  componentWillMount() {
    if (this.props.createGroup) {
      mid = 0
      phoneUuid = 0
    }
    this.fillEmails(this.props)
  },
  componentDidMount() {
    setTimeout(()=> {
      document.getElementById('groupName').focus()
    },300)
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

    if (isModify) {
      if (oldProps && oldProps.isModify === true) {
        return
      }
      let keys = []
      for (let email of (data.receivers.email || [])) {
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
      let phoneKeys = []
      for (let phone of (data.receivers.tel || [])) {
        phoneUuid++
        phoneKeys.push(phoneUuid)
        form.setFieldsValue({
          [`phoneNum${phoneUuid}`]: phone.number,
          [`phoneDesc${phoneUuid}`]: phone.desc,
        })
      }
      let dingKeys = []
      for (let ding of (data.receivers.ding || [])) {
        dingUuid++
        dingKeys.push(dingUuid)
        form.setFieldsValue({
          [`dingNum${dingUuid}`]: ding.url,
          [`dingDesc${dingUuid}`]: ding.desc,
          [`dingStatus${dingUuid}`]: !!ding.url,
        })
      }
      form.setFieldsValue({
        keys,
        phoneKeys,
        dingKeys,
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
    const { form, intl: { formatMessage } } = this.props
    let nextStep = true
    let keys = form.getFieldValue('keys');
    if (!keys.length) {
      form.setFieldsValue({
        keys: [0],
      });
      return
    }
    keys.map(k => {
      if (!form.getFieldValue(`email${k}`)) {
        form.setFields({
          [`email${k}`]:{
            errors: [formatMessage(intlMsg.plsInputRightEmail)],
            value: ''
          }
        })
        nextStep = false
      }
    })
    if (!nextStep) {
      return
    }
    mid++;
    if (!this.state.isAddEmail) return
    // can use data-binding to get
    keys = keys.concat(mid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys,
    });
    this.setState({isAddEmail: false})
  },
  addRuleEmail(rule, value, callback) {
    const { intl: { formatMessage }, form } = this.props
    let newValue = value.trim()
    let isAddEmail= true
    if(!Boolean(newValue)) {
      return callback()
      // callback(new Error('请输入邮箱地址'))
      // isAddEmail = false
    }
    if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(newValue)) {
      callback(new Error(formatMessage(intlMsg.plsInputRightEmail)))
      isAddEmail = false
    }
    let keys = form.getFieldValue('keys');
    let repeat
    keys.length >1 && keys.every(k => {
      // cannot repeat
      if (`email${k}` === rule.fullField) {
        return true
      }
      if (value === form.getFieldValue(`email${k}`)) {
        repeat = true
        return false
      }
      return true
    })
    if (repeat) {
      return callback(formatMessage(intlMsg.repeatEmail))
    }
    callback()
    this.setState({isAddEmail})
  },
  ruleEmail(k) {
    // send rule email
    const _this = this
    const { intl: { formatMessage } } = this.props
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
            notification.success(formatMessage(intlMsg.sendEmailScs, { email }))
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            _this.setState({
              [`transitionEnble${k}`]: false,
            })
            notification.error(formatMessage(intlMsg.sendEmailFail, { email }))
          }
        }
      })
    }
    if (email) {
      this.setState({
        ['transitionTime'+[k]]: formatMessage(intlMsg.validating),
        ['transitionEnble'+[k]]: true,
      })
      // check if email already accept invitation
      getAlertNotifyInvitationStatus(email, {
        success: {
          func: (result) => {
            if (email in result.data && result.data[email] === 1) {
              this.setState({
                [`emailStatus${k}`]: EMAIL_STATUS_ACCEPTED,
                ['transitionTime'+[k]]: formatMessage(intlMsg.receiveInvite),
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
            notification.error(formatMessage(intlMsg.sendEmailFail, { email }))
          }
        }
      })
    }else{
      this.okModal()
    }
  },
  groupName(rule, value, callback) {
    const { intl: { formatMessage } } = this.props
    // top email rule name
    let newValue = value.trim()
    if (!Boolean(newValue)) {
      callback(new Error(formatMessage(intlMsg.plsInputName)))
      return
    }
    if (newValue.length < 3 || newValue.length > 21) {
      callback(new Error(formatMessage(intlMsg.plsInput321)))
      return
    }
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5]{1}[a-zA-Z0-9\u4e00-\u9fa5\-_]+$/.test(newValue)){
      return callback(formatMessage(intlMsg.plsInputCnEnNum))
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
    this.setState({
      isAddEmail: true,
      'transitionEnble0': false,
    })
  },
  okModal() {
    const { form, createNotifyGroup, modifyNotifyGroup, funcs, afterCreateFunc, afterModifyFunc, data, shouldLoadGroup, intl: { formatMessage } } = this.props
    const clusterID = this.props.cluster.clusterID
    let notification = new NotificationHandler()
    form.validateFields((error, values) => {
      if (!!error) {
        return
      }
      // have one email at least
      if (!values.keys.length && !values.phoneKeys.length && !values.dingKeys.length) {
        notification.error(formatMessage(intlMsg.atLeastOneEmail))
        return
      }
      let noOne = true
      let body = {
        name: values.groupName,
        desc: values.groupDesc,
        receivers: {
          email: [],
          tel: [],
          ding: [],
        },
      }
      if (values.keys.length) {
        values.keys.map(function(k) {
          if (values[`email${k}`]) {
            noOne = false
            body.receivers.email.push({
              addr: values[`email${k}`],
              desc: values[`remark${k}`] || '',
            })
          }
        })
      }
      if (values.phoneKeys.length) {
        values.phoneKeys.forEach(k => {
          if (values[`phoneNum${k}`]) {
            noOne = false
            body.receivers.tel.push({
              number: values[`phoneNum${k}`],
              desc: values[`phoneDesc${k}`] || '',
            })
          }
        })
      }
      let needValidateHook
      if (values.dingKeys.length) {
        values.dingKeys.forEach(k => {
          if (values[`dingNum${k}`] && values[`dingStatus${k}`]) {
            noOne = false
            body.receivers.ding.push({
              url: values[`dingNum${k}`],
              desc: values[`dingDesc${k}`] || '',
            })
          }
          if (values[`dingNum${k}`] && values[`dingStatus${k}`] !== true) {
            needValidateHook = true
          }
        })
      }
      if (needValidateHook) {
        return notification.error('请先验证 钉钉 webhook 地址')
      }
      if (noOne) {
        return notification.error(formatMessage(intlMsg.atLeastOneEmail))
      }
      if (!this.props.isModify) {
        notification.spin('创建中...')
        createNotifyGroup(clusterID, body, {
          success: {
            func: (result) => {
              notification.close()
              notification.success('创建成功')
              funcs.scope.setState({ createGroup: false, alarmModal: true})
              form.resetFields()
              this.setState({
                isAddEmail: true,
                'transitionEnble0': false,
              })
              if (afterCreateFunc) {
                afterCreateFunc()
              }
              if(shouldLoadGroup) {
                setTimeout(this.props.loadNotifyGroups("", clusterID), 0)
              }
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              this.setState({
                'transitionEnble0': false,
              })
              notification.close()
              if (err.message.code === 404) {
                notification.warn(formatMessage(intlMsg.createGroupFail), formatMessage(intlMsg.withoutConfig))
              } else if (err.message.code === 409) {
                notification.error(formatMessage(intlMsg.createGroupFail), formatMessage(intlMsg.nameExist))
              } else {
                notification.error(formatMessage(intlMsg.createGroupFail), err.message.message)
              }
            },
            isAsync: true
          }})
      } else {
        notification.spin('更新中...')
        modifyNotifyGroup(data.groupID,clusterID, body, {
          success: {
            func: (result) => {
              notification.close()
              notification.success('更新成功')
              funcs.scope.setState({ modifyGroup: false, alarmModal: true})
              form.resetFields()
              this.setState({
                isAddEmail: true,
                'transitionEnble0': false,
              })
              if (afterModifyFunc) {
                afterModifyFunc()
              }
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              notification.close()
              this.setState({
                'transitionEnble0': false,
              })
              if (err.message.code === 404) {
                return notification.warn(formatMessage(intlMsg.createGroupFail), formatMessage(intlMsg.withoutConfig))
              } else {
                notification.warn(formatMessage(intlMsg.editGroupFail), err.message.message)
              }
            }
          }
        })
      }
    })
  },
  getEmailStatusText(k,time) {
    const { intl: { formatMessage } } = this.props
    let text = formatMessage(intlMsg.validatorEmail)
    let enble= true
    switch (this.state[`emailStatus${k}`]) {
      case EMAIL_STATUS_WAIT_ACCEPT:{
        // text = '再次验证邮件'
        let timefunc = setInterval(()=>{
          if(this.props.createGroup == false){
            clearInterval(timefunc)
            this.setState({
              [`transitionEnble${k}`]: false,
            })
            return
          }
          if (time <=1) {
            enble = false
            clearInterval(timefunc)
          }
          time--
          text = time +formatMessage(intlMsg.secondsAfter)
          this.setState({
            ['transitionTime'+[k]]:time ==0?formatMessage(intlMsg.validatorEmail):text,
            ['transitionEnble'+[k]]:enble
          })
        },1000)
        return;
      }
      case EMAIL_STATUS_ACCEPTED:
        this.setState({
          ['transitionTime'+[k]]:formatMessage(intlMsg.receiveInvite),
          ['transitionEnble'+[k]]:enble
        })
        return
      // default: this.setState({transitionTime:text})
    }
  },
  removePhone(k) {
    const { form } = this.props;
    let phoneKeys = form.getFieldValue('phoneKeys');
    phoneKeys = phoneKeys.filter((key) => {
      return key !== k;
    });
    form.setFieldsValue({
      phoneKeys,
    });
  },
  addPhone() {
    const { form, intl: { formatMessage } } = this.props
    let nextStep = true
    let phoneKeys = form.getFieldValue('phoneKeys');
    if (!phoneKeys.length) {
      form.setFieldsValue({
        phoneKeys: [0],
      });
      return
    }
    phoneKeys.map(k => {
      if (!form.getFieldValue(`phoneNum${k}`)) {
        nextStep = false
        form.setFields({
          [`phoneNum${k}`]:{
            errors: [formatMessage(intlMsg.plsInputRightPhone)],
            value: ''
          }
        })
      }
    })
    if (!nextStep) {
      return
    }
    phoneUuid++;
    phoneKeys = phoneKeys.concat(phoneUuid);
    form.setFieldsValue({
      phoneKeys,
    });
  },
  removeDing(k) {
    const { form } = this.props;
    let dingKeys = form.getFieldValue('dingKeys');
    dingKeys = dingKeys.filter((key) => {
      return key !== k;
    });
    form.setFieldsValue({
      dingKeys,
    });
  },
  addDing() {
    const { form, intl: { formatMessage } } = this.props
    let nextStep = true
    let dingKeys = form.getFieldValue('dingKeys');
    if (!dingKeys.length) {
      form.setFieldsValue({
        dingKeys: [0],
      });
      return
    }
    dingKeys.map(k => {
      if (!form.getFieldValue(`dingNum${k}`)) {
        nextStep = false
        form.setFields({
          [`dingNum${k}`]:{
            errors: ['请输入正确的地址'],
            value: ''
          }
        })
      }
    })
    if (!nextStep) {
      return
    }
    dingUuid++;
    dingKeys = dingKeys.concat(dingUuid);
    form.setFieldsValue({
      dingKeys: dingKeys,
    });
  },
  _dingValidator(rule, value, callback) {
    const v = value.trim()
    if (v === '' || !URL_REG_EXP.test(v)) {
      return callback()
    }
    const { form } = this.props
    let keys = form.getFieldValue('dingKeys');
    let repeat
    keys.length >1 && keys.every(k => {
      // cannot repeat
      if (`dingNum${k}` === rule.fullField) {
        return true
      }
      if (value === form.getFieldValue(`dingNum${k}`)) {
        repeat = true
        return false
      }
      return true
    })
    if (repeat) {
      return callback('钉钉地址重复')
    }
    callback()
  },
  validateDing(k) {
    const { intl: { formatMessage }, validateDingHook } = this.props
    const { setFieldsValue, validateFields } = this.props.form
    const dingNumK = `dingNum${k}`
    validateFields([ dingNumK ], async (errors, values) => {
      if (errors) return
      this.setState({
        validateDingNum: k,
        validateDing: true,
      })
      const res = await validateDingHook(values[dingNumK], {
        failed: {
          func: () => {},
        },
      })
      // await delay({ timeout: 1000 })
      // const res = JSON.parse('{"response": {"result": {"status":"Success","code":200,"data":"","statusCode":200}}}')
      this.setState({
        validateDingNum: -1,
        validateDing: false,
      })
      if (res && res.error && res.error.message && res.error.message.status === 'Failure') {
        notify.warn('钉钉 webhook 地址验证失败')
      }
      const { status, data } = getDeepValue(res, 'response.result'.split('.')) || {}
      if (status === 'Success' && data === '') {
        console.log('success')
        setFieldsValue({
          [`dingStatus${k}`]: true,
        })
      }
    })
  },
  boundWechat() {
    this.setState({
      QRCodeVisible: true,
    })
  },
  checkPhoneNum(rule, value, callback) {
    const { intl: { formatMessage }, form } = this.props
    let newValue = value.trim()
    let isAddEmail= true
    if(!Boolean(newValue)) {
      return callback()
    }
    if (!/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(newValue)) {
      // callback(new Error(formatMessage(intlMsg)))
      return callback(new Error('请输入正确手机号'))
    }
    let phoneKeys = form.getFieldValue('phoneKeys');
    let repeat
    phoneKeys.length >1 && phoneKeys.every(list => {
      if (`phoneNum${list}` === rule.fullField) {
        return true
      }
      // cannot repeat
      if (value == form.getFieldValue(`phoneNum${list}`)) {
        repeat = true
        return false
      }
      return true

    })
    if (repeat) {
      return callback(formatMessage(intlMsg.repeatPhone))
    }
    callback()
  },
  render() {
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    const { getFieldProps, getFieldValue, setFieldsValue, getFieldError } = this.props.form;
    const { funcs } = this.props
    getFieldProps('keys', {
      initialValue: [0],
    });
    const { isModify,data, intl: { formatMessage } } = this.props
    const formItems = getFieldValue('keys').map((k) => {
      let indexed = Math.max(0,k-1)
      let initAddrValue = ''
      let initDescValue = ''
      if (isModify && data.receivers.email[indexed]) {
        initAddrValue = data.receivers.email[indexed].addr
        initDescValue = data.receivers.email[indexed].desc
      }
      return (
        <div key={k} className="createEmailList" style={{clear:'both'}}>
        <Form.Item style={{float:'left'}}>
          <Input placeholder="请输入邮箱地址" {...getFieldProps(`email${k}`, {
            rules: [
            {validator: this.addRuleEmail.bind(this)}
            ],
            initialValue: initAddrValue,
          }) } style={{ width: '150px', marginRight: 8 }}
          />
        </Form.Item>
        <Form.Item style={{float:'left'}}>
          <Input placeholder={formatMessage(intlMsg.remarks)} size="large" style={{ width: 80,  marginRight: 8 }} {...getFieldProps(`remark${k}`,{initialValue: initDescValue})}/>
        </Form.Item>
        <Button
          type="primary"
          style={{padding:5}}
          disabled={this.state[`transitionEnble${k}`]}
          size="large"
          onClick={()=> this.ruleEmail(k)}
        >
          {
            this.state[`transitionEnble${k}`]
            ? this.state[`transitionTime${k}`]
            :formatMessage(intlMsg.validatorEmail)
          }
        </Button>
        <Button size="large" style={{ marginLeft: 8}} disabled={this.state[`transitionEnble${k}`]} onClick={()=> this.removeEmail(k)}><FormattedMessage {...intlMsg.delete}/></Button>
      </div>
      );
    });
    getFieldProps('phoneKeys', {
      initialValue: [0],
    });
    const phoneItems = getFieldValue('phoneKeys').map((k) => {
      let indexed = Math.max(0,k)
      let initAddrValue = ''
      let initDescValue = ''
      if (isModify && data.receivers.tel[indexed]) {
        initAddrValue = data.receivers.tel[indexed].number
        initDescValue = data.receivers.tel[indexed].desc
      }
      return (
        <div key={`phone-${k}`} className="createEmailList" style={{clear:'both'}}>
          <Form.Item style={{float:'left'}}>
            <Input
              style={{ width: '150px', marginRight: 8 }}
              placeholder="请输入手机号"
              {
                ...getFieldProps(`phoneNum${k}`, {
                  rules: [ {validator: this.checkPhoneNum.bind(this)} ],
                  initialValue: initAddrValue,
                })
              }
            />
          </Form.Item>
          <Form.Item style={{float:'left'}}>
            <Input
              placeholder={formatMessage(intlMsg.remarks)}
              size="large"
              style={{ width: 80,  marginRight: 8 }}
              {
                ...getFieldProps(`phoneDesc${k}`, {
                  initialValue: initDescValue,
                })
              }
            />
          </Form.Item>
          {/* <Button
            type="primary"
            style={{padding:5}}
            size="large"
          >
            <FormattedMessage {...intlMsg.validatorPhone}/>
          </Button> */}
          <Button size="large" style={{ marginLeft: 8}} onClick={()=> this.removePhone(k)}
          >
            <FormattedMessage {...intlMsg.delete}/>
          </Button>
        </div>
      );
    });
    getFieldProps('dingKeys', {
      initialValue: [0],
    });
    const dingItems = getFieldValue('dingKeys').map((k) => {
      let indexed = Math.max(0,k)
      let initAddrValue = ''
      let initDescValue = ''
      if (isModify && data.receivers && data.receivers.ding && data.receivers.ding[indexed]) {
        initAddrValue = data.receivers.ding[indexed].url
        initDescValue = data.receivers.ding[indexed].desc
      }
      getFieldProps(`dingStatus${k}`, {
        initialValue: false,
      })
      return (
        <div key={`ding-${k}`} className="createEmailList" style={{clear:'both'}}>
          <Form.Item style={{float:'left'}}>
            <Input
              style={{ width: '150px', marginRight: 8 }}
              placeholder="请输入 webhook 地址"
              {
                ...getFieldProps(`dingNum${k}`, {
                  rules: [
                    {pattern: URL_REG_EXP, required: false, message:'请输入正确的地址'},
                    { validator: this._dingValidator }
                  ],
                  initialValue: initAddrValue,
                  onChange: e => setFieldsValue({
                    [`dingStatus${k}`]: false,
                  })
                })
              }
            />
          </Form.Item>
          <Form.Item style={{float:'left'}}>
            <Input
              placeholder={formatMessage(intlMsg.remarks)}
              size="large"
              style={{ width: 80,  marginRight: 8 }}
              {
                ...getFieldProps(`dingDesc${k}`, {
                  initialValue: initDescValue,
                })
              }
            />
          </Form.Item>
          {
            getFieldValue(`dingStatus${k}`) !== true &&
            <Button
              type="primary"
              style={{padding:5}}
              size="large"
              loading={this.state.validateDing && this.state.validateDingNum === k}
              disabled={!getFieldValue(`dingNum${k}`) || getFieldError(`dingNum${k}`)}
              onClick={() =>this.validateDing(k)}
            >
              {/* <FormattedMessage {...intlMsg.validatorPhone}/> */}
              验证 hook
            </Button>
          }
          <Button size="large" style={{ marginLeft: 8}} onClick={()=> this.removeDing(k)}
          >
            <FormattedMessage {...intlMsg.delete}/>
          </Button>
          {
            getFieldValue(`dingStatus${k}`) === true &&
            <span style={{ marginLeft: 8, color: 'green' }}>已验证</span>
          }
        </div>
      );
    });
    return (
      <Form className="alarmAction" form={this.props.form}>
        <div className="alertRow">通知组是一个联系方式列表，您可以添加若干联系人的邮箱，手机或钉钉群机器人。添加钉钉和邮箱联系方式时，必须验证通过才能接收通知消息</div>
        <Form.Item label={formatMessage(intlMsg.name)} {...formItemLayout} >
          <Input placeholder={formatMessage(intlMsg.plsInputName)} {...getFieldProps(`groupName`, {
          rules: [
            { validator: this.groupName.bind(this)}
          ],
          initialValue: this.props.isModify ? this.props.data.name : '',}) }
          disabled={!!this.props.isModify}/>
        </Form.Item>
        <Form.Item label={formatMessage(intlMsg.description)} {...formItemLayout} >
          <Input type="textarea" placeholder="选填" {...getFieldProps(`groupDesc`, {
          initialValue: this.props.isModify ? this.props.data.desc : '',
          }) }/>
        </Form.Item>
        <div className="lables">
          <div className="keys">
            <FormattedMessage {...intlMsg.email}/>
          </div>
          <div className="emaillItem" >
            {formItems}
            <div style={{clear:'both'}}><a onClick={() => this.addEmail()}><Icon type="plus-circle-o" /> <FormattedMessage {...intlMsg.addEmail}/></a></div>
          </div>
        </div>
        <div className="lables">
          <div className="keys">
            手机列表
          </div>
          <div className="emaillItem" >
            {phoneItems}
            <div style={{clear:'both'}}>
              <a onClick={() => this.addPhone()}>
                <Icon type="plus-circle-o" /> 添加手机号
              </a>
            </div>
          </div>
        </div>
        <div className="lables">
          <div className="keys">
            钉钉列表
          </div>
          <div className="emaillItem" >
            {dingItems}
            <div style={{clear:'both'}}>
              <a onClick={() => this.addDing()}>
                <Icon type="plus-circle-o" /> 添加钉钉号
              </a>
            </div>
          </div>
        </div>
        {/* <div className="lables">
          <div className="keys">
            微信
          </div>
          <div className="emaillItem" >
            <div style={{clear:'both'}}>
              <a onClick={() => this.boundWechat()}>
                <Icon type="plus-circle-o" /> 绑定微信
              </a>
            </div>
          </div>
        </div> */}

        <div className="ant-modal-footer" style={{margin:'0 -30px'}}>
          <Button type="ghost" size="large" onClick={()=> this.handCancel()}><FormattedMessage {...intlMsg.cancel}/></Button>
          <Button type="primary" size="large" onClick={()=> this.okModal()}><FormattedMessage {...intlMsg.save}/></Button>
        </div>
        {/* <Modal
          title={formatMessage(intlMsg.scanCodeWechat)}
          footer={null}
          visible={this.state.QRCodeVisible}
          onCancel={() => this.setState({ QRCodeVisible: false })}
          wrapClassName="QRCodeModal"
        >
          <QRCode value="https://tenxcloud.com/" />
        </Modal> */}
      </Form>
    )
  }
})

CreateAlarmGroup = Form.create()(CreateAlarmGroup)
function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  return {
    cluster
  }
}

export default connect(mapStateToProps, {
  sendAlertNotifyInvitation,
  getAlertNotifyInvitationStatus,
  createNotifyGroup,
  modifyNotifyGroup,
  loadNotifyGroups,
  validateDingHook
})(injectIntl(CreateAlarmGroup, {
  withRef: true,
}))
