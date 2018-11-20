/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: import service
 *
 * v0.1 - 2018-11-16
 * @author rensiwei
 */

import React from 'react'
// import { Link, browserHistory } from 'react-router'
import { checkVMUser, getJdkList } from '../../../../../src/actions/vm_wrap'
import { connect } from 'react-redux'
import { Form, Input, Icon, Button, Select, Row, Col } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import './style/TraditionEnv.less'
import NotificationHandler from '../../../../../src/components/Notification';

const notify = new NotificationHandler();

const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 9 },
}

const formTextLayout = {
  wrapperCol: { span: 9, offset: 3 },
}
const formItemNoLabelLayout = {
  wrapperCol: { span: 24, offset: 0 },
}


class TraditionEnv extends React.Component {
  state = {
    readOnly: true,
    isShowPassword: false,
    jdkList: [],
    isTestSucc: false,
    ports: [],
    btnLoading: false,
  }
  componentDidMount() {
    const { getJdkList, getJdkId } = this.props
    getJdkList({}, {
      success: {
        func: res => {
          if (res.statusCode === 200 && res.results) {
            this.setState({
              jdkList: res.results,
            })
            getJdkId(res.results[0] ? res.results[0].id : '')
          }
        },
        isAsync: true,
      },
    })
  }
  checkVmInfos = () => {
    const { form, checkVMUser, checkSucc } = this.props
    const { validateFields } = form
    const validateArr = [ 'host', 'account', 'password' ]
    validateFields(validateArr, (errors, values) => {
      if (errors) {
        return
      }
      this.setState({
        btnLoading: true,
      }, () => {
        const infos = cloneDeep(values)
        checkVMUser(infos, {
          success: {
            func: res => {
              if (res.statusCode === 200) {
                this.setState({
                  isTestSucc: true,
                  ports: res.ports,
                })
                notify.success('测试连接成功')
                checkSucc(true)
              }
            },
            isAsync: true,
          },
          failed: {
            func: () => {
              this.setState({
                ports: [],
              })
              notify.warn('测试连接失败')
            },
            isAsync: true,
          },
          finally: {
            func: () => {
              this.setState({
                btnLoading: false,
              })
            },
          },
        })
      })
    })

  }
  checkHost = (rules, value, callback) => {
    const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (!value) {
      callback([ new Error('请输入传统环境 IP') ])
      return
    }
    if (reg.test(value) !== true) {
      callback([ new Error('请输入正确 IP 地址') ])
      return
    }
    return callback()
  }
  validateDefaultFields = () => {
    const { form } = this.props
    const { validateFields } = form
    validateFields((err, values) => {
      if (err || !values) return
      // console.log(values)
    })
  }
  rePut = () => {
    const { form, checkSucc } = this.props
    const { setFieldsValue } = form
    setFieldsValue({
      account: '',
      password: '',
      host: '',
    })
    this.setState({
      isTestSucc: false,
    })
    checkSucc(false)
  }
  onJdkChange = jdk_id => {
    const { getJdkId } = this.props
    getJdkId(jdk_id)
  }
  onHostChange = e => {
    const { getHost } = this.props
    getHost(e.target.value)
  }
  render() {
    const { form } = this.props
    const { getFieldProps } = form
    const { readOnly, isShowPassword, jdkList, isTestSucc, btnLoading } = this.state

    const envNameProps = getFieldProps('envName', {
      rules: [
        // { validator: this.checkHost },
        { required: true, message: '请输入传统环境名称' },
      ],
      // onChange: this.onHostChange,
    })
    const hostProps = getFieldProps('host', {
      rules: [
        { validator: this.checkHost },
      ],
      onChange: this.onHostChange,
    })
    const accountProps = getFieldProps('account', {
      rules: [
        { required: true, message: '请输入环境登录账号' },
      ],
    })
    const passwordProps = getFieldProps('password', {
      rules: [
        { required: true, message: '请输入环境登录密码' },
      ],
    })
    const envProps = getFieldProps('jdk_id', {
      rules: [
        { required: true, message: '请选择 JDK 版本' },
      ],
      initialValue: jdkList[0] && jdkList[0].id,
      onChange: this.onJdkChange,
    })
    const javahomeProps = getFieldProps('java_home', {
      rules: [
        { required: true, message: '请输入 JAVA_HOME' },
      ],
    })
    const jrehomeProps = getFieldProps('jre_home', {
      rules: [
        { required: true, message: '请输入 JRE_HOME' },
      ],
    })

    const options = jdkList.map(item =>
      <Option key={item.id} value={item.id}>{item.jdkName}</Option>)
    return (
      <Form className="importTraditionEnv">
        <FormItem
          {...formItemLayout}
          label="传统环境名称"
        >
          <Input placeholder="请输入传统环境名称" size="large" {...envNameProps} />
        </FormItem>
        <FormItem
          className="nomarginbottom"
          {...formItemLayout}
          label="传统环境 IP"
        >
          <Input disabled={isTestSucc} placeholder="请输入传统环境 IP" size="large" {...hostProps} />
        </FormItem>
        <FormItem
          {...formTextLayout}
        >
          <div><Icon type="question-circle-o" /> 传统环境一般指非容器环境（Linux的虚拟机、物理机等）</div>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="环境登录账号"
        >
          <Input disabled={isTestSucc} placeholder="请输入环境登录账号" size="large" {...accountProps} />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="环境登录密码"
        >
          <Input
            disabled={isTestSucc}
            type={isShowPassword ? 'text' : 'password'}
            autoComplete="new-password"
            readOnly={readOnly}
            onFocus={() => this.setState({ readOnly: false })}
            onBlur={() => this.setState({ readOnly: true })}
            placeholder="请输入环境登录密码"
            size="large"
            {...passwordProps} />
          <Icon
            className="eyeIcon"
            type={isShowPassword ? 'eye-o' : 'eye'}
            onClick={() => this.setState({
              isShowPassword: !isShowPassword,
            })}
          />
        </FormItem>
        <FormItem
          {...formTextLayout}
        >
          <div>{
            !isTestSucc ?
              <Button loading={btnLoading} type="primary" size="large" onClick={this.checkVmInfos}>测试连接</Button>
              :
              <Button type="ghost" size="large" onClick={this.rePut}>重新填写</Button>
          }</div>
        </FormItem>
        <FormItem
          label="Java 环境"
          {...formItemLayout}
        >
          <Select style={{ marginLeft: '5px' }} {...envProps} placeholder="请选择 Java 环境">
            {options}
          </Select>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="安装路径"
        >
          <Row className="rowHome">
            <Col span={5} className="left">JAVA_HOME</Col>
            <Col span={2} className="equre"> = </Col>
            <Col span={10}>
              <FormItem
                {...formItemNoLabelLayout}
              >
                <Input placeholder="请输入 JAVA_HOME" size="large" {...javahomeProps} />
              </FormItem>
            </Col>
          </Row>
          <Row className="rowHome">
            <Col span={5} className="left">JRE_HOME</Col>
            <Col span={2} className="equre"> = </Col>
            <Col span={10}>
              <FormItem
                {...formItemNoLabelLayout}
              >
                <Input placeholder="请输入 JRE_HOME" size="large" {...jrehomeProps} />
              </FormItem>
            </Col>
          </Row>
        </FormItem>
      </Form>
    )
  }
}

function mapStateToProps() {
  return {

  }
}
export default connect(mapStateToProps, {
  checkVMUser,
  getJdkList,
})(Form.create()(TraditionEnv))
