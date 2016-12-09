/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeFile component
 *
 * v0.1 - 2016-09-20
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Dropdown, Modal, Checkbox, Button, Card, Menu, Input, Select, Popconfirm, message, Form } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ComposeFile.less"
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { createApp, checkAppName } from '../../../actions/app_manage'
import { loadStackDetail } from '../../../actions/app_center'
import YamlEditor from '../../Editor/Yaml'
import * as yaml from 'js-yaml'
import { browserHistory } from 'react-router'
import AppAddStackModal from './AppAddStackModal'
import { validateAppName } from '../../../common/naming_validation'

const FormItem = Form.Item;
const createForm = Form.create;

const defaultEditOpts = {
  readOnly: false,
}

class ComposeFile extends Component {
  constructor(props) {
    super(props);
    this.subApp = this.subApp.bind(this)
    this.handleYaml = this.handleYaml.bind(this)
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.confirm = this.confirm.bind(this)
    this.cancel = this.cancel.bind(this)
    this.handleForm = this.handleForm.bind(this)
    this.appNameCheck = this.appNameCheck.bind(this)
    this.remarkCheck = this.remarkCheck.bind(this)
    this.editYamlSetState = this.editYamlSetState.bind(this)

    let serviceList = JSON.parse(localStorage.getItem('servicesList'))
    let selectedList = JSON.parse(localStorage.getItem('selectedList'))
    let serviceDesc = {}
    let deploymentDesc = {}
    let desc = []
    if (serviceList) {
      let newServiceList = serviceList.filter(function (service) {
        return selectedList.includes(service.id)
      })
      newServiceList.map(function (item) {
        serviceDesc = item.inf.Service
        deploymentDesc = item.inf.Deployment
        desc.push(yaml.dump(serviceDesc), yaml.dump(deploymentDesc))
      })
    }
    this.state = {
      appName: '',
      appDescYaml: desc.join('---\n'),
      remark: '',
      visible: false,
      condition: true,
      modalShow: false,
      stackType: true
    }
  }
  componentWillMount() {
    const { templateid } = this.props.location.query
    const self = this
    if (templateid) {
      this.props.loadStackDetail(templateid, {
        success: {
          func: (res) => {
            self.setState({
              appDescYaml: res.data.data.content,
              stackType: false
            })
          }
        }
      })
    }
    if (this.props.location.query.hasOwnProperty('query')) {
      self.setState({
        stackType: false
      })
    }
  }
  subApp() {
    const {appName, appDescYaml, remark} = this.state
    const { cluster } = this.props
    let appConfig = {
      cluster,
      template: appDescYaml,
      appName: appName,
      desc: remark,
    }
    let self = this
    if (appConfig.appName == '') {
      message.info('请填写应用名称')
      return
    }
    if (appConfig.template == '') {
      message.info('请选择编排文件')
      return
    }
    this.props.createApp(appConfig, {
      success: {
        func: () => {
          self.setState({
            appName: '',
            remark: '',
          })
          localStorage.removeItem('servicesList')
          localStorage.removeItem('selectedList')
          browserHistory.push('/app_manage')
        },
        isAsync: true
      },
    })
  }
  handleYaml(e) {
    this.setState({
      appDescYaml: e.target.value,
      condition: false,
    })
  }
  confirm() {
    this.setState({ visible: false });
    message.success('返回');
    browserHistory.push('/app_manage/app_create/fast_create')
  }
  cancel() {
    this.setState({ visible: false })
    message.error('留在当前页面')
  }
  handleVisibleChange(visible) {
    if (!visible) {
      this.setState({ visible })
      return
    }
    if (this.state.condition) {
      this.confirm()
    } else {
      this.setState({ visible })
    }
  }
  appNameCheck(rule, value, callback) {
    // const { needAppName} = this.state
    const { cluster, checkAppName } = this.props
    /*if (!value || needAppName) {
      callback([new Error('请输入应用名称')])
      // validateAppName
      return
    }*/
    const error = validateAppName(value)
    if (error) {
      return callback(error)
    }
    checkAppName(cluster, value, {
      success: {
        func: (result) => {
          if (result.data) {
            callback([new Error('应用名称已经存在')])
            return
          }
          this.setState({
            appName: value,
          })
          callback()
        },
        isAsync: true
      }
    })
  }
  remarkCheck(rule, value, callback) {
    this.setState({
      remark: value
    })
    if (this.state.appName === '') {
      const { validateFields } = this.props.form
      validateFields(['appNameFormCheck'], { force: true })
    }
    callback()
  }
  handleForm() {
    this.props.form.validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        this.setState({
          disable: true,
        })
        return
      }
    })
  }
  editYamlSetState(e) {
    //this function for yaml edit callback function
    this.setState({
      appDescYaml: e
    })
  }
  selectStack() {
    this.setState({
      modalShow: true
    })
  }
  closeModal() {
    this.setState({
      modalShow: false
    })
  }
  render() {
    const { appDescYaml, remark } = this.state
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = this.props.form
    const appNameFormCheck = getFieldProps('appNameFormCheck', {
      rules: [
        { validator: this.appNameCheck },
      ]
    })

    const remarkFormCheck = getFieldProps('remarkFormCheck', {
      rules: [
        { validator: this.remarkCheck },
      ]
    })
    const parentScope = this.props.scope;
    const createModel = parentScope.state.createModel;
    return (
      <QueueAnim id="ComposeFile"
        type="right"
        >
        <Form horizontal>
          <div className="ComposeFile" key="ComposeFile">
            <div className="nameBox">
              <span>应用名称</span>
              <FormItem
                help={isFieldValidating('appNameFormCheck') ? '校验中...' : (getFieldError('appNameFormCheck') || []).join(', ')}
                >
                <Input size="large"
                  placeholder="请输入应用名称"
                  autoComplete="off"
                  {...appNameFormCheck} />
              </FormItem>
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="introBox">
              <span>应用描述</span>
              <FormItem>
                <Input size="large"
                  placeholder="请输入应用描述"
                  {...remarkFormCheck}
                  value={remark} />
              </FormItem>
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="composeBox">
              {this.state.stackType ?

                <div className="topBox">
                  <span>编排类型</span>
                  <span>{this.state.templateName}</span>
                  <Button size="large" type="primary" onClick={() => this.selectStack()}>
                    选择编排
                </Button>

                </div>
                : null
              }
              <div className="bottomBox">
                <span className='titleSpan'>编排文件</span>
                <div className="textareaBox">
                  <YamlEditor value={appDescYaml} options={defaultEditOpts} parentId={'AppCreate'} callback={this.editYamlSetState} />
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
            </div>
            <div className="btnBox">
              <Popconfirm title="返回上一步,改动将丢失"
                okText="确认"
                cancelText="取消"
                onVisibleChange={this.handleVisibleChange}
                onConfirm={this.confirm}
                onCancel={this.cancel}
                visible={this.state.visible}>
                <Button size="large" type="primary" className="lastBtn" onClick={() => browserHistory.goBack()}>
                  上一步
                  </Button>
              </Popconfirm>
              <Button size="large" type="primary" className="createBtn" onClick={this.subApp}>
                创建
              </Button>
            </div>
          </div>
        </Form>
        <Modal title="选择编排文件"
          visible={this.state.modalShow}
          className="AppAddServiceModal"
          wrapClassName="appAddServiceModal"
          onCancel={() => this.closeModal()}
          >
          <AppAddStackModal scope={this} />
        </Modal>
      </QueueAnim>
    )
  }
}

ComposeFile.propTypes = {
  intl: PropTypes.object.isRequired,
}
function mapStateToProps(state) {
  const { cluster } = state.entities.current
  return {
    cluster: cluster.clusterID,
    createApp: state.apps.createApp,
    checkAppName: state.apps.checkAppName
  }
}

ComposeFile = connect(mapStateToProps, {
  createApp,
  checkAppName,
  loadStackDetail
})(injectIntl(ComposeFile, {
  withRef: true,
}))

ComposeFile = createForm()(ComposeFile)

export default ComposeFile

