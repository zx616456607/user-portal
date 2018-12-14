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
// import { getTomcatVersion } from '../../../../../src/actions/vm_wrap'
import { connect } from 'react-redux'
import { Form, Input, Row, Col, Icon, InputNumber } from 'antd'
import './style/TraditionApp.less'
import filter from 'lodash/filter'

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 9 },
}
const formLargeItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 15 },
}

let uuid = 0

class TraditionApp extends React.Component {
  state = {
  }
  componentWillReceiveProps(next) {
    if (next.host !== this.props.host) {
      this.onCheckAddressChange({ host: next.host })
    }
    if (next.vmId !== this.props.vmId) {
      this.onCheckAddressChange({ vmId: next.vmId })
    }
    if (next.tomcatId !== this.props.tomcatId) {
      this.onCheckAddressChange({ tomcatId: next.tomcatId })
    }
    if (next.startPort !== this.props.startPort) {
      this.onCheckAddressChange({ startPort: next.startPort })
    }
  }
  componentDidMount() {
    // const { jdk_id } = this.props
    // jdk_id && this.getTom(jdk_id)
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
  onCheckAddressChange = (opt, i) => {
    const { getFieldValue, setFieldsValue } = this.props.form
    const keys = getFieldValue('keys')
    const type = getFieldValue('type')
    const isNewTomcat = getFieldValue('isNewTomcat')
    const temp = {}
    if (type === '1') {
      if (i === undefined) {
        keys.map(j => {
          const host = getFieldValue('host') || ''
          const port = getFieldValue('start_port') || ''
          const name = getFieldValue('name_' + j) || ''
          const temp = {}
          temp['check_address_' + j] = 'http://' + host + ':' + port + '/' + name
          setFieldsValue(temp)
          return j
        })
      } else {
        const {
          host = getFieldValue('host') || '',
          name = getFieldValue('name_' + i) || '',
          port = getFieldValue('start_port') || '',
        } = opt
        temp['check_address_' + i] = 'http://' + host + ':' + port + '/' + name
      }
    } else if (type === '2') {
      if (isNewTomcat === '1') { // 已有 tomcat
        const {
          vminfoId = getFieldValue('vm_id') || '',
          tomcatId = getFieldValue('tomcat_env_id') || '',
        } = opt
        const { vmList, tomcatList } = this.props
        const host = vminfoId && vmList.length ? filter(vmList, { vminfoId: parseInt(vminfoId) })[0].host : '',
          port = tomcatId && tomcatList.length ? filter(tomcatList, { id: parseInt(tomcatId) })[0].startPort : ''
        if (i === undefined) {
          keys.map(j => {
            const name = getFieldValue('name_' + j) || ''
            const template = {}
            template['check_address_' + j] = 'http://' + host + ':' + port + '/' + name
            setFieldsValue(template)
            return j
          })
        } else {
          const {
            name = getFieldValue('name_' + i) || '',
          } = opt
          temp['check_address_' + i] = 'http://' + host + ':' + port + '/' + name
        }
      } else if (isNewTomcat === '2') { // 新建 tomcat
        const {
          vminfoId = getFieldValue('vm_id') || '',
          startPort = getFieldValue('start_port') || '',
        } = opt
        const { vmList } = this.props
        const host = vminfoId && vmList.length ? filter(vmList, { vminfoId: parseInt(vminfoId) })[0].host : ''
        if (i === undefined) {
          keys.map(j => {
            const name = getFieldValue('name_' + j) || ''
            const template = {}
            template['check_address_' + j] = 'http://' + host + ':' + startPort + '/' + name
            setFieldsValue(template)
            return j
          })
        } else {
          const {
            name = getFieldValue('name_' + i) || '',
          } = opt
          temp['check_address_' + i] = 'http://' + host + ':' + startPort + '/' + name
        }
      }
    }
    setFieldsValue(temp)
  }
  checkName = (rules, value, callback, i) => {
    if (!value) {
      callback([ new Error('请输入应用名称') ])
      return
    }
    const { form: { getFieldValue } } = this.props
    for (let j = 0; j < i; j++) {
      const temp = getFieldValue('name_' + j)
      if (temp === value) {
        return callback(new Error('应用名称重复'))
      }
    }
    return callback()
  }
  renderItems = () => {
    const { form: { getFieldProps, getFieldValue } } = this.props

    const keys = getFieldValue('keys')
    return keys.map(i => {
      const nameProps = getFieldProps(`name_${i}`, {
        rules: [
          { required: true, message: '请输入应用名称' },
          { validator: (rules, value, callback) => this.checkName(rules, value, callback, i) },
        ],
        onChange: e => this.onCheckAddressChange({ name: e.target.value }, i),
      })
      const descProps = getFieldProps(`description_${i}`, {
        rules: [
          // { required: true, message: '请输入应用名称' },
        ],
      })
      const check_addressProps = getFieldProps(`check_address_${i}`, {
        rules: [
          { required: true, message: '请输入检查路径' },
        ],
        initialValue: 'http://' + (getFieldValue('host') || '') + (getFieldValue('start_port') ? ':' + getFieldValue('start_port') + '/' : ''),
      })
      const check_addressTempProps = getFieldProps(`check_address_temp_${i}`, {
        rules: [
          // { required: true, message: '请输入检查路径' },
        ],
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
      return <div className="item_app" key={i}>
        <FormItem
          {...formItemLayout}
          label="应用名称"
        >
          <Input placeholder="请输入 Webapps 下实际部署的应用包名称" size="large" {...nameProps} />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="应用描述"
        >
          <Input type="textarea" autosize={{ minRows: 4, maxRows: 4 }} placeholder="请输入应用描述" size="large" {...descProps} />
        </FormItem>
        <FormItem
          {...formLargeItemLayout}
          label="检查路径"
        >
          <Row>
            <Col style={{ marginRight: 5 }} span={7}>
              <Input disabled={true} placeholder="请输入检查路径" size="large" {...check_addressProps} />
            </Col>
            <Col span={7}>
              <Input placeholder="例如: /index.html" size="large" {...check_addressTempProps} />
            </Col>
          </Row>
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
        {
          i > 0 && <div className="delBtn"><a onClick={() => this.remove(i)}><Icon type="delete" /></a></div>
        }
      </div>
    })
  }
  add = () => {
    uuid++
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.concat(uuid)
    form.setFieldsValue({
      keys,
    });

  }
  remove = k => {
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    keys = keys.filter(key => {
      return key !== k;
    })
    form.setFieldsValue({
      keys,
    })
  }
  render() {
    this.props.form.getFieldProps('keys', {
      initialValue: [ 0 ],
    });
    return (
      <Form className="importTraditionApp">
        <div>
          { this.renderItems() }
        </div>
        <Row>
          <Col style={{ textAlign: 'right', paddingRight: 13 }} span={3}>
            <a onClick={this.add}><Icon type="plus-circle-o" /> 添加传统应用</a>
          </Col>
        </Row>
      </Form>
    )
  }
}

function mapStateToProps() {
  return {
  }
}
export default connect(mapStateToProps, {
  // getTomcatVersion,
})(Form.create()(TraditionApp))
