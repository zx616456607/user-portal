/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: vm list
 *
 * v0.1 - 2017-07-21
 * @author ZhaoYanbei
 */

import React from 'react'
import { Button, Modal, Form, Input, Icon, Select, Row, Col, Tooltip } from 'antd'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../constants'
import NotificationHandler from '../../../../components/Notification'
import cloneDeep from 'lodash/cloneDeep'
import filter from 'lodash/filter'

const FormItem = Form.Item
const Option = Select.Option
const createForm = Form.create
let CreateVMListModal = React.createClass({
  getInitialState: function () {
    return {
      checkIP: false,
      Prompt: false,
      isShow: false,
      verification: false,
      jdkList: [],
      isShowPassword: false,
      readOnly: true,
    };
  },
  componentDidMount () {
    const { scope: { props: { getJdkList } } } = this.props
    getJdkList({}, {
      success: {
        func: res => {
          if (res.statusCode === 200 && res.results) {
            this.setState({
              jdkList: res.results,
            })
          }
        },
        isAsync: true,
      }
    })
  },
  handleSub() {
    let notification = new NotificationHandler()
    const { form, scope } = this.props
    let info = form.getFieldsValue()
    let query = {
      host: info.host,
      account: info.account,
      password: info.password
    }
    this.setState({
      verification: true
    })
    return new Promise((resolve, reject) => {
      scope.props.checkVMUser(query, {
        success: {
          func: res => {
            if (res.statusCode === 200) {
              resolve()
              this.setState({
                Prompt: true,
                isShow: true,
                verification: false
              })
            }
          }
        },
        failed: {
          func: err => {
            reject(err)
            notification.error('验证信息异常')
            this.setState({
              Prompt: false,
              isShow: true,
              verification: false
            })
          }
        }
      })
    })
  },
  handleAdd() {
    const { form, onSubmit, scope, modalTitle } = this.props
    const validateArr = ['name', 'account', 'password', 'jdk_id', 'prune_dir']
    if (modalTitle) {
      validateArr.unshift('host')
    }
    form.validateFields(validateArr, (errors, values) => {
      if (errors) return
      this.setState({
        confirmLoading: true
      })
      let List = cloneDeep(values)
      List.host = form.getFieldValue('host')
      this.handleSub().then(() => {
        onSubmit(List)
        scope.setState({
          visible: false
        })
        this.setState({
          confirmLoading: false
        })
        form.resetFields()
      }).catch(() => {
        this.setState({
          confirmLoading: false
        })
      })
    })
  },
  handleClose() {
    const { scope, form } = this.props
    scope.setState({
      visible: false
    })
    this.setState({
      isShow: false
    })
    form.resetFields()
  },
  userExists(rule, value, callback) {
    const _this = this
    if (!value) {
      callback([new Error('请输入用户名')])
      return
    }
    // if (value.length < 5 || value.length > 40) {
    //   callback([new Error('长度为5~40个字符')])
    //   return
    // }
    /*if (!USERNAME_REG_EXP_NEW.test(value)) {
      callback([new Error('以小写字母开头，允许[0~9]、[-]，且以小写英文和数字结尾')])
      return
    }*/
    callback()
  },
  checkPass(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 2 || value.length > 16) {
      callback([new Error('长度为2~16个字符')])
      return
    }
    if (/^[^0-9]+&&[^a-zA-Z]+$/.test(value) /*|| /^[^a-zA-Z]+$/.test(value)*/) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
    callback()
  },

  checkName(rule, value, callback) {
    if (!value) {
      return callback(new Error('请输入名称'))
    }
    if (value.length > 12) {
      return callback(new Error('名称长度不能超过 12 个字符'))
    }
    callback()
  },

  checkDir(rule, value, callback) {
    if (!value) {
      return callback()
      // return callback(new Error('请输入清理目录'))
    }
    var arr = value.split(';')
    for (let i in arr) {
      const temp = arr[i]
      if (temp !== '' && !/\/[0-9a-zA-Z]+\/[0-9a-zA-z\/]+/.test(temp)) {
        return callback(new Error('请输入清理的路径, 多个路径分号隔开, 输入为空时不清理'))
      }
    }
    callback()
  },

  checkIP(rule, value, callback) {
    const { scope } = this.props
    let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (!value) {
      callback([new Error('请填写IP')])
      return
    }
    if (reg.test(value) !== true) {
      callback([new Error('请输入正确IP地址')])
      return
    }
    let query = {
      ip: value,
    }
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      scope.props.checkVminfoExists(query, {
        success: {
          func: res => {
            if (res.statusCode === 200) {
              callback()
              return
            }
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            if (err.statusCode === 405) {
              callback([new Error('当前IP已存在')])
              return
            }
          },
          isAsync: true,
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  },
  setDefault() {
    let notification = new NotificationHandler()
    const { form: { getFieldValue, validateFields } } = this.props
    validateFields([ 'jdk_id' ], (err, values) => {
      if (err) return
      notification.destroy()
      notification.success('设置成功')
      console.log('jdk_id', values)
    })
  },
  render() {
    const { confirmLoading, jdkList, isShowPassword } = this.state
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 17 }
    }
    const { form, Rows, isAdd, modalTitle } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = form
    const hostProps = getFieldProps('host', {
      rules: [
        { validator: this.checkIP },
      ],
      initialValue: isAdd ? undefined : Rows.host,
    })

    const dirProps = getFieldProps('prune_dir', {
      rules: [
        { validator: this.checkDir },
      ],
      initialValue: isAdd ? undefined : Rows.pruneDir,
    })
    const nameProps = getFieldProps('name', {
      rules: [
        // { required: true, message: '请输入名称' }
        { validator: this.checkName },
      ],
      initialValue: isAdd ? undefined : Rows.name,
    })
    const username = getFieldValue('name')
    const accountProps = getFieldProps('account', {
      rules: [
        { validator: this.userExists },
      ],
      initialValue: isAdd ? undefined : Rows.user
    })
    const passwordProps = getFieldProps('password', {
      rules: [
        // { validator: this.checkPas },
        { required: true, message: '请输入环境密码' }
      ],
      initialValue: isAdd ? undefined : Rows.password
    })

    const options = jdkList.map((item, i) => <Option key={item.id} value={item.id}>{item.jdkName}</Option>)
    const envProps = getFieldProps('jdk_id', {
      rules: [
        { required: true, message: '请选择 Java 环境' },
      ],
      initialValue: isAdd ? (jdkList[0] && jdkList[0].id) : Rows.jdkId
    })
    const jdk_id = getFieldValue('jdk_id')
    const jdk_name = jdk_id && jdkList.length ? filter(jdkList, { id: jdk_id })[0].jdkName : ''
    let style = {
      fontSize: 12
    }
    let btnStyle = {
      position: 'absolute',
      left: 10,
      marginBottom: 9
    }
    let testStyle = {
      color: '#31ba6a',
      size: 20
    }
    let fallStyle = {
      color: '#FF0000',
      size: 20
    }
    let promptStyle = {
      marginRight: 120
    }
    return (
      <Modal
        title={modalTitle ? "添加传统环境" : "编辑传统环境"}
        width={600}
        visible={this.props.visible}
        onCancel={() => this.handleClose()}
        footer={[
          <span style={promptStyle}>
            {
              this.state.isShow ?
                this.state.Prompt ?
                  <span style={testStyle}><Icon type="check-circle-o" /> 测试连接成功</span> : <span style={fallStyle}><Icon type="cross-circle-o" /> 测试连接失败</span>
                : ''
            }
          </span>,
          <Button
            type="primary"
            size="large"
            onClick={() => this.handleSub()}
            style={btnStyle}
            disabled={this.state.verification}
          >
            测试连接
          </Button>,
          <Button
            key="back"
            type="ghost"
            size="large"
            onClick={() => this.handleClose()}>
            取 消
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={confirmLoading}
            onClick={() => this.handleAdd()}>
            保 存
          </Button>,
        ]}
      >
        <Form>
          <FormItem
            label="名称"
            {...formItemLayout}
          >
            <Input className="vmModalName" {...nameProps} placeholder="请输入名称" />
          </FormItem>
          <FormItem
            label="传统环境 IP"
            hasFeedback
            {...formItemLayout}
          >
            <Input disabled={!modalTitle} {...hostProps} placeholder="请输入已开通 SSH 登录的传统环境 IP" id="host" ref={host => this.host = host} />
            <span style={style}><Icon size={15} type="question-circle-o" />传统环境一般指非容器环境（Linux的虚拟机、物理机等）</span>
          </FormItem>
          <FormItem
            hasFeedback
            label="环境登录账号"
            {...formItemLayout}
          >
            <Input key="userName"{...accountProps} placeholder="请输入传统环境登录账号" id="account" />
          </FormItem>
          <FormItem
            hasFeedback
            label="环境登录密码"
            {...formItemLayout}
          >
            <Input
              autoComplete="off"
              readOnly={this.state.readOnly}
              onFocus={() => this.setState({ readOnly: false })}
              onBlur={() => this.setState({ readOnly: true })}
              type={isShowPassword ? 'text' : 'password'} key="passWord" {...passwordProps} placeholder="请输入传统环境登录密码" id="password" />
            <span style={{ cursor: 'pointer', position: 'absolute', right: '-20px', top: '2px' }}>
              {
                isShowPassword ?
                  <Icon onClick={() => this.setState({ isShowPassword: false })} type={'eye'}/>
                  :
                  <Icon onClick={() => this.setState({ isShowPassword: true })} type={'eye-o'}/>
              }
              <Icon />
            </span>
          </FormItem>

          <Row>
            <Col span={19}>
              <FormItem
                hasFeedback
                label="Java 环境"
                {...Object.assign(cloneDeep(formItemLayout), {labelCol: { span: 6 }})}
              >
                <Select style={{ marginLeft: '5px' }} {...envProps} placeholder="请选择 Java 环境">
                  {options}
                </Select>
              </FormItem>
            </Col>
            <Col style={{ paddingTop: 7 }} span={4}>
              <Tooltip title="以后默认选择该 JDK 版本">
                <span><a onClick={this.setDefault}>设为默认</a></span>
              </Tooltip>
            </Col>
          </Row>
          <FormItem
            label={
              <span>清理目录 <Tooltip title="清理Java、Tomcat等安装目录，必须“/”开头，至少两级“/”">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
            {...formItemLayout}
          >
            <Input {...dirProps} placeholder="多个路径分号隔开，为空时不清理" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="环境安装路径"
            style={{ marginBottom: 0 }}
          >
            <div key="hint" className="alertRow" style={{ fontSize: 12 }}>
              {
                username === 'root' ?
                  [<div>JRE_HOME=/root/java/{jdk_name}/jre</div>,
                  <div>JAVA_HOME=/root/java/{jdk_name}</div>]
                  :
                  [<div>JRE_HOME=/home/{username}/java/{jdk_name}/jre</div>,
                  <div>JAVA_HOME=/home/{username}/java/{jdk_name}</div>]
              }
              {/* <div>JAVA_HOME='/home/java'</div>
              <div>JRE_HOME='/home/java/jre1.8.0_151'</div>
              <div>CATALINA_HOME='/usr/local/tomcat'</div>
              <div style={{ marginTop: 20 }}>系统将默认安装该 Tomcat 环境</div> */}
            </div>
          </FormItem>
        </Form>
      </Modal>
    )
  }
})

CreateVMListModal = createForm()(CreateVMListModal)

export default CreateVMListModal
