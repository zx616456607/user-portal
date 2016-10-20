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
import { Dropdown, Modal, Checkbox, Button, Card, Menu, Input, Select, Popconfirm, message, Form} from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ComposeFile.less"
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { createApp ,checkAppName} from '../../../actions/app_manage'
import * as yaml from 'js-yaml'
import { browserHistory } from 'react-router'

const FormItem = Form.Item;
const createForm = Form.create;

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

    let serviceList = JSON.parse(localStorage.getItem('servicesList'))
    let selectedList = JSON.parse(localStorage.getItem('selectedList'))
    let serviceDesc = {}
    let deploymentDesc = {}
    let desc = []
    if(serviceList){
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
      cluster: '',
      remark: '',
      visible:false,
      condition: true,
    }
  }
  subApp() {
    const {appName, appDescYaml, remark} = this.state
    let appConfig = {
      cluster: this.state.cluster,
      template: appDescYaml,
      appName: appName,
      remark: remark,
    }
    let self = this
    this.props.createApp(appConfig, {
      success: {
        func: () => {
          self.setState({
            appName: '',
            remark: '',
          })
          console.log('sub')
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
    const { clusterName, needAppName} = this.state
    const { checkAppName } = this.props
    if (!value || needAppName) {
      callback([new Error('请输入应用名称')])
    } else {
      checkAppName(clusterName,value,{
        success: {
          func: (result) => {
            if(result.data){
              callback([new Error('应用名称已经存在')])
            } else {
              this.setState({
                appName: value,
              })
              callback()
            }
          },
          isAsync: true
        }
      })
    }
  }
  remarkCheck(rule, value, callback){
    if(this.state.appName === ''){
      this.setState({
        remark:''
      })
      callback([new Error('请先输入应用名称')])
    } else {
      this.setState({
        remark: value
      })
      callback()
    }
  }
  handleForm() {
    this.props.form.validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!')
        console.log(errors)
        this.setState({
          disable: true,
        })
        return
      }
      console.log('Submit!!!')
      console.log(values)
    })
  }
  componentWillMount() {
    this.setState({
      cluster: window.localStorage.getItem('cluster')
    })
  }
  render() {
    const { appDescYaml, remark } = this.state
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = this.props.form
    const appNameFormCheck = getFieldProps('appNameFormCheck',{
      rules: [
        { validator: this.appNameCheck },
      ]
    })
    
    const remarkFormCheck = getFieldProps('remarkFormCheck',{
      rules: [
        { validator: this.remarkCheck },
      ]
    })
    const parentScope = this.props.scope;
    const createModel = parentScope.state.createModel;
    let backUrl = backLink(createModel);
    return (
      <QueueAnim id="ComposeFile"
        type="right"
        >
        <Form horizontal>
        <div className="ComposeFile" key="ComposeFile">
          <div className="nameBox">
            <span>应用名称</span>
            <FormItem help={isFieldValidating('appNameFormCheck') ? '校验中...' : (getFieldError('appNameFormCheck') || []).join(', ')}>
              <Input size="large"
                     placeholder="起一个萌萌哒的名称吧~"
                     autoComplete="off"
                     {...appNameFormCheck} />
            </FormItem>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="introBox">
            <span>添加描述</span>
            <FormItem>
              <Input size="large"
                     placeholder="写一个萌萌哒的描述吧~"
                     {...remarkFormCheck}
                     value={remark}/>
            </FormItem>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="composeBox">
            <div className="topBox">
              <span>编排类型</span>
              <span>tenxcloud.yaml</span>
              <Button size="large" type="primary">
                选择编排
              </Button>
              <div style={{ clear: "both" }}></div>
            </div>
            <div className="bottomBox">
              <span>描述文件</span>
              <div className="textareaBox">
                <div className="operaBox">
                  <i className="fa fa-expand" />
                  <i className="fa fa-star-o" />
                </div>
                <textarea value={appDescYaml} onChange={this.handleYaml} />
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
                  <Button size="large" type="primary" className="lastBtn">
                    上一步
                  </Button>
                </Popconfirm>
            <Button size="large" type="primary" className="createBtn" onClick={this.subApp}>
              创建
              </Button>
          </div>
        </div>
        </Form>
      </QueueAnim>
    )
  }
}

ComposeFile.propTypes = {
  intl: PropTypes.object.isRequired,
}
function mapStateToProps(state) {
  return {
    createApp: state.apps.createApp,
    checkAppName: state.apps.checkAppName
  }
}

ComposeFile = connect(mapStateToProps, {
  createApp,
  checkAppName
})(injectIntl(ComposeFile, {
  withRef: true,
}))

ComposeFile = createForm()(ComposeFile)

export default ComposeFile

function backLink(createModel) {
  switch (createModel) {
    case "fast":
      return "/app_manage/app_create/fast_create";
      break;
    case "store":
      return "/app_manage/app_create/app_store";
      break;
    case "layout":
      return "/app_manage/app_create";
      break;
  }
}
