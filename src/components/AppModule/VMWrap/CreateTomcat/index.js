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
import { Row, Col, Form, Input, Modal, Select, Popover, notification, Tooltip, Button } from 'antd'
import { getTomcatVersion } from '../../../../actions/vm_wrap'
import { checkVMUser } from '../../../../actions/vm_wrap'
import cloneDeep from 'lodash/cloneDeep'
import "./style/index.less"

const FormItem = Form.Item
const Option = Select.Option

class CreateTomcat extends React.Component {
  static propTypes = {
    tomcatList: React.PropTypes.array,
    allPort: React.PropTypes.array,
  }
  state = {
    tomcatVersions: [],
  }
  componentDidMount() {
    const { jdk_id, getTomcatVersion } = this.props
    jdk_id && getTomcatVersion({
      jdk_id,
    }, {
      success: {
        func: res => {
          if (res.statusCode === 200) {
            this.setState({
              tomcatVersions: res.results
            })
          }
        },
        isAsync: true,
      }
    })
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
    if (allPort.indexOf(String(port)) >= 0) {
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
      temp.name = temp.name + temp.port
      onOk && onOk(temp)
    })
  }

  onPortChange = e => {
    const { form: { setFieldsValue, getFieldValue }, username } = this.props
    const port = e.target.value

    const name = getFieldValue('name') || 'tomcat_'

    const dir = username === 'root' ? `/root/${name + port}` : `/home/${username}/${name + port}`
    const env = `CATALINA_HOME_${name.toLocaleUpperCase() + port}`
    const temp = {
      port,
      tomcat_name: 'tomcat_' + port,
    }
    if (!this.props.isImport) {
      temp.catalina_home_dir = dir
      temp.catalina_home_env = env
    }
    setFieldsValue(temp)
  }

  setDefault = () => {
    const { form: { validateFields } } = this.props
    validateFields([ 'tomcat_id' ], (err, values) => {
      if (err) return
      notification.destroy()
      notification.success({
        message: '设置成功'
      })
      console.log('tomcat_id', values)
    })
  }

  render() {
    const { form: { getFieldProps, getFieldValue }, tomcatList, isNeedModal, isImport,
      title, visible, onCancel, confirmLoading, isRight, username, allPort } = this.props
    const { tomcatVersions } = this.state
    const tomcat_id = tomcatVersions[0] && tomcatVersions[0].id
    const port = getFieldValue('port') || ''
    const name = getFieldValue('name') || 'tomcat_'
    const options = tomcatVersions.map(item => <Option key={item.id} value={item.id}>{item.tomcatName}</Option>)
    const dir = username === 'root' ? `/root/${name+port}` : `/home/${username}/${name+port}`
    const env = `CATALINA_HOME_${name.toLocaleUpperCase()+port}`
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
    const layoutsmall = {
      labelCol: { span: 7 },
      wrapperCol: { span: 15 }
    }

    const portProps = getFieldProps('start_port', {
      rules: [
        {
          validator: this.checkPort,
          trigger: [ 'onBlur', 'onChange' ]
        },
      ],
      onChange: this.onPortChange,
    })
    const versionProps = getFieldProps('tomcat_id', {
      initialValue: tomcat_id || undefined,
    })
    const nameProps = getFieldProps('tomcat_name', {
      initialValue: name + port,
    })
    const dirRules = [
      { required: true, message: '路径不能为空' },
    ]
    const envRules = [
      { required: true, message: '变量名不能为空' },
    ]
    const dirProps = getFieldProps('catalina_home_dir', {
      rules: isImport ? dirRules : [],
      initialValue: isImport ? '' : dir,
    })
    const envProps = getFieldProps('catalina_home_env', {
      rules: isImport ? envRules : [],
      initialValue: isImport ? '' : env,
    })
    const content = (
      <div className="portBody">
        {
          allPort &&
            allPort.length &&
            allPort.map(item => <div key={item}>{item}</div>)
        }
      </div>
    )
    const form = <div style={{ width: 460 }} className={"createTomcatWrapper" + (isRight ? ' textRight' : '')}>
     <Row>
        <Col style={{ paddingLeft: (isRight ? '20px' : 0) }} span={20}>
          <FormItem
            {...layout}
            label="Tomcat 版本"
            style={{ marginTop: 10}}
          >
            <Select style={{ width: 280, display: 'block', marginLeft: (isRight ? 3 : '16px') }} placeholder="请选择 Tomcat 版本" {...versionProps}>
              {options}
            </Select>
          </FormItem>
        </Col>
        <Col style={{ paddingTop: '15px', paddingLeft: '15px' }} span={4}>
          <Tooltip title="以后默认选择该 Tomcat 版本">
            <span><a onClick={this.setDefault}>设为默认</a></span>
          </Tooltip>
        </Col>
      </Row>
      <Row>
        <Col span={20}>
          <FormItem
            {...layoutsmall}
            label="端口"
            style={{ marginTop: 10}}
          >
            <Input placeholder="请填写端口号" {...portProps} />
          </FormItem>
        </Col>
        <Col span={4}>
          <Popover
            content={content}
            title="已被占用的端口"
            trigger="click"
          >
            <Button size="large" className="portBtn" type="primary">已用端口</Button>
          </Popover>
        </Col>
      </Row>
      <FormItem
        {...layout}
        label="实例"
        style={{ marginTop: 10}}
      >
        <div>{ name+port }</div>
        <Input type="hidden" {...nameProps} />
        {
          isImport ?
            null
            :
            [
              <Input key="dir" type="hidden" {...dirProps} />,
              <Input key="env" type="hidden" {...envProps} />,
            ]

        }
      </FormItem>
      {
        isImport ?
          <FormItem
            {...layout}
            label="安装路径"
          >
            <Row>
              <Col span={11}>
                <FormItem>
                  <Input placeholder="请输入变量名" {...envProps} />
                </FormItem>
              </Col>
              <Col span={1} style={{ textAlign: 'center' }}> = </Col>
              <Col span={11}>
                <FormItem>
                  <Input placeholder="请输入路径" {...dirProps} />
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          :
          null
      }
      {
        isImport ?
          null
          :
          <FormItem
            {...layout}
            label="环境安装路径"
            style={{ marginTop: 10}}
          >
            <div className="alertRow" style={{ fontSize: 12, wordBreak: 'break-all' }}>
              <div>{env}='{dir}'</div>
              <div style={{ marginTop: 20 }}>系统将默认安装该 Tomcat 环境</div>
            </div>
          </FormItem>
      }
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
  getTomcatVersion,
})(CreateTomcat)
