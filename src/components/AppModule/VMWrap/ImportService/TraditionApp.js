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
import { Link, browserHistory } from 'react-router'
import { getTomcatVersion } from '../../../../actions/vm_wrap'
import { connect } from 'react-redux'
import { Form, Input, Row, Col, Icon, Select, InputNumber } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/TraditionApp.less'

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 9 },
}
const formLargeItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 15 },
}

const formItemNoLabelLayout = {
  wrapperCol: { span: 24, offset: 0 },
}

class TraditionApp extends React.Component {
  state = {
    count: 1,
    tomcatVersionList: [],
  }
  getTom = jdk_id => {
    const { getTomcatVersion } = this.props
    getTomcatVersion({
      jdk_id
    }, {
      success: {
        func: res => {
          if (res.statusCode === 200) {
            this.setState({
              tomcatVersionList: res.results
            })
          }
        },
        isAsync: true,
      },
      failed: {
        func: () => {}
      }
    })
  }
  componentWillReceiveProps(next) {
    if (next.jdk_id !== this.props.jdk_id) {
      this.getTom(next.jdk_id)
    }
    if (next.host !== this.props.host) {
      this.onCheckAddressChange({ host: next.host })
    }
  }
  componentDidMount() {
    this.getTom(this.props.jdk_id)
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
  onPortChange = (i, value) => {
    const { form: { setFieldsValue } } = this.props
    const temp = {}
    temp['tomcat_name_' + i] = 'tomcat_' + value
    setFieldsValue(temp)
    this.onCheckAddressChange({ port: value }, i)
  }
  onCheckAddressChange = (opt, i) => {
    const { getFieldValue, setFieldsValue } = this.props.form
    if (i === undefined) {
      const { count } = this.state
      let j = 0
      while(j < count) {
        const host = getFieldValue('host') || ''
        const port = getFieldValue('start_port_' + j) || ''
        const name = getFieldValue('name_' + j) || ''
        const temp = {}
        temp['check_address_' + j] = 'http://' + host + ':' + port + '/' + name
        setFieldsValue(temp)
        j++
      }
    }
    const {
      host = getFieldValue('host') || '',
      name = getFieldValue('name_' + i) || '',
      port = getFieldValue('start_port_' + i) || ''
    } = opt
    const temp = {}
    temp['check_address_' + i] = 'http://' + host + ':' + port + '/' + name
    setFieldsValue(temp)
  }
  renderItems = () => {
    const { count, tomcatVersionList } = this.state
    const { form: { getFieldProps, getFieldValue } } = this.props
    const tomcatVersionOptions = tomcatVersionList.map(item => <Option key={item.id} value={item.id}>{item.tomcatName}</Option>)
    const items = []
    for (let i = 0; i < count; i++) {
      const nameProps = getFieldProps(`name_${i}`, {
        rules: [
          { required: true, message: '请输入应用名称' },
        ],
        onChange: e => this.onCheckAddressChange({ name: e.target.value }, i)
      })
      const descProps = getFieldProps(`description_${i}`, {
        rules: [
          // { required: true, message: '请输入应用名称' },
        ],
      })
      const portProps = getFieldProps(`start_port_${i}`, {
        rules: [
          { validator: this.checkPort }
        ],
        onChange: e => this.onPortChange(i, e.target.value),
      })
      const tomcatNameProps = getFieldProps(`tomcat_name_${i}`, {
        rules: [
          // { required: true, message: '请输入端口号' },
        ],
      })
      const tomcatVersionProps = getFieldProps(`tomcat_id_${i}`, {
        rules: [
          {required: true, message: "请选择 Tomcat 版本"}
        ],
      })

      const envProps = getFieldProps(`catalina_home_env_${i}`, {
        rules: [
          {required: true, message: "请输入 CATATALINA_HOME 变量名"}
        ],
      })
      const dirProps = getFieldProps(`catalina_home_dir_${i}`, {
        rules: [
          {required: true, message: "请输入 CATATALINA_HOME 指向路径"}
        ],
      })
      const check_addressProps = getFieldProps(`check_address_${i}`, {
        rules: [
          { required: true, message: '请输入检查路径' },
        ],
        initialValue: 'http://' + (getFieldValue('host') || ''),
      })
      const init_timeoutProps = getFieldProps(`init_timeout_${i}`, {
        initialValue: 10,
        rules: [
          { required: true, message: '请输入初始化超时' },
        ],
      })
      const normal_timeoutProps = getFieldProps(`normal_timeout_${i}`, {
        initialValue: 10,
        rules: [
          { required: true, message: '请输入常规检查超时' },
        ],
      })
      const intervalProps = getFieldProps(`interval_${i}`, {
        initialValue: 10,
        rules: [
          { required: true, message: '请输入间隔检查超时' },
        ],
      })
      items.push(<div className="item_app">
        <FormItem
          {...formItemLayout}
          label="应用名称"
        >
          <Input placeholder="请输入应用名称" size="large" {...nameProps} />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="应用描述"
        >
          <Input type="textarea" autosize={{ minRows: 4, maxRows: 4 }} placeholder="请输入应用描述" size="large" {...descProps} />
        </FormItem>
        <FormItem
          label="Tomcat 版本"
          {...formItemLayout}
        >
          <Select placeholder="请选择 Tomcat 版本" size="large" {...tomcatVersionProps}>
            {tomcatVersionOptions}
          </Select>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="端口号"
        >
          <Input placeholder="请输入端口号" size="large" {...portProps} />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="实例名称"
        >
          {'tomcat_' + (getFieldValue(`start_port_${i}`) || '')}
          <Input type="hidden" {...tomcatNameProps} />
        </FormItem>
        <FormItem
          {...formLargeItemLayout}
          label="安装路径"
        >
          <Row>
            <Col span={5}>
              <FormItem
                {...formItemNoLabelLayout}
              >
                <Input placeholder="请输入 CATALINA_HOME 变量名" {...envProps} />
              </FormItem>
            </Col>
            <Col style={{ textAlign: 'center' }} span={1}>-</Col>
            <Col span={5}>
              <FormItem
                {...formItemNoLabelLayout}
              >
                <Input placeholder="请输入 CATALINA_HOME 指向的路径" {...dirProps} />
              </FormItem>
              </Col>
          </Row>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="检查路径"
        >
          <Input disabled={true} placeholder="请输入检查路径" size="large" {...check_addressProps} />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="初始化超时"
        >
          <InputNumber placeholder="请输入初始化超时" size="large" {...init_timeoutProps} /> <span className="hint">s</span>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="常规检查超时"
        >
          <InputNumber placeholder="请输入常规检查超时" size="large" {...normal_timeoutProps} /> <span className="hint">s</span>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="间隔检查超时"
        >
          <InputNumber placeholder="请输入间隔检查超时" size="large" {...intervalProps} /> <span className="hint">s</span>
        </FormItem>
      </div>)
    }
    return items
  }
  render() {
    const { count } = this.state
    return (
      <Form className="importTraditionApp">
        <div>
          { this.renderItems() }
        </div>
        <Row>
          <Col style={{ textAlign: 'right', paddingRight: 13 }} span={3}>
            <a onClick={() => this.setState({ count: count + 1 })}><Icon type="plus-circle-o" /> 添加传统应用</a>
          </Col>
        </Row>
      </Form>
    )
  }
}

function mapStateToProps(state, props) {
  return {

  }
}
export default connect(mapStateToProps, {
  getTomcatVersion,
})(Form.create()(TraditionApp))
