/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: create tomcat
 *
 * @author rensiwei
 */

import React from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Row, Col, Form, Input, Modal } from 'antd'
import { checkVMUser } from '../../../../actions/vm_wrap'
import cloneDeep from 'lodash/cloneDeep'
import "./style/index.less"

const FormItem = Form.Item

class CreateTomcat extends React.Component {
  static propTypes = {
    tomcatList: React.PropTypes.array,
    allPort: React.PropTypes.array,
  }
  state = {
    name: 'tomcat_' + parseInt(Math.random()*100000),
  }
  checkPort = (rule, value, callback) => {
    const { allPort = [] } = this.props
    if (!value) return callback(new Error('请填写端口号'))
    if (!/^[0-9]+$/.test(value.trim())) {
      callback(new Error('请填入数字'))
      return
    }
    const port = parseInt(value.trim())
    if (port < 1 || port > 65535) {
      callback(new Error('请填入1~65535'))
      return
    }
    if (allPort.indexOf(port) >= 0) {
      callback(new Error('该端口已被占用'))
      return
    }
    return callback()
  }
  getValues = () => {
    const { form: { getFieldsValue } } = this.props
    return getFieldsValue()
  }
  onOk = () => {
    const { form, onOk } = this.props
    const { validateFields } = form
    validateFields((errors, values) => {
      if(errors) return
      const temp = cloneDeep(values)
      temp.start_port = parseInt(temp.start_port)
      onOk && onOk(temp)
    })
  }
  onPortChange = e => {
    const { form: { setFieldsValue } } = this.props
    setFieldsValue({
      port: e.target.value
    })
  }
  render() {
    const { name } = this.state
    const { form: { getFieldProps }, tomcatList, isNeedModal,
      title, visible, onCancel, confirmLoading } = this.props
    const dir = `/usr/local/${name}`
    const env = `CATALINA_HOME_${name.toLocaleUpperCase()}`
    const layout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 }
    }
    const portProps = getFieldProps('start_port', {
      rules: [
        { validator: this.checkPort }
      ],
      onChange: this.onPortChange,
    })
    const nameProps = getFieldProps('name', {
      initialValue: name,
    })
    const dirProps = getFieldProps('catalina_home_dir', {
      initialValue: dir,
    })
    const envProps = getFieldProps('catalina_home_env', {
      initialValue: env,
    })

    const form = <div className="createTomcatWrapper">
      <FormItem
        {...layout}
        label="实例"
        style={{ marginTop: 10}}
      >
        <div>{ name }</div>
        <Input type="hidden" {...nameProps} />
        <Input type="hidden" {...dirProps} />
        <Input type="hidden" {...envProps} />
      </FormItem>
      <FormItem
        {...layout}
        label="端口"
        style={{ marginTop: 10}}
      >
        <Input placeholder="请填写端口号" {...portProps} />
      </FormItem>
      <FormItem
        {...layout}
        label="环境安装路径"
        style={{ marginTop: 10}}
      >
        <div className="alertRow" style={{ fontSize: 12, wordBreak: 'break-all' }}>
          {/* <div>JAVA_HOME='/home/java'</div>
          <div>JRE_HOME='/home/java/jre1.8.0_151'</div> */}
          <div>{env}='{dir}'</div>
          <div style={{ marginTop: 20 }}>系统将默认安装该 Tomcat 环境</div>
        </div>
      </FormItem>
    </div>
    return (
      isNeedModal ?
        <Modal
          title="添加 Tomcat 实例"
          onOk={this.onOk}
          onCancel={onCancel}
          confirmLoading={confirmLoading}
          visible={visible}>
          {form}
        </Modal>
        :
        form
    )
  }
}

function mapStateToProps(state, props) {
  return {}
}
export default connect(mapStateToProps, {
})(CreateTomcat)
