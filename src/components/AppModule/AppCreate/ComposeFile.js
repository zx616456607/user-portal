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
import { Dropdown, Modal, Checkbox, Button, Card, Menu, Input, Select, Popconfirm, message, } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/ComposeFile.less"
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { createApp } from '../../../actions/app_manage'
import * as yaml from 'js-yaml'
import { browserHistory } from 'react-router'

const Option = Select.Option;

const operaMenu = (<Menu>
  <Menu.Item key="0">
    重新部署
            </Menu.Item>
  <Menu.Item key="1">
    弹性伸缩
            </Menu.Item>
  <Menu.Item key="2">
    灰度升级
            </Menu.Item>
  <Menu.Item key="3">
    更改配置
            </Menu.Item>
</Menu>);

class ComposeFile extends Component {
  constructor(props) {
    super(props);
    this.subApp = this.subApp.bind(this)
    this.handleAppName = this.handleAppName.bind(this)
    this.handleCluster = this.handleCluster.bind(this)
    this.handleYaml = this.handleYaml.bind(this)
    this.handleRemark = this.handleRemark.bind(this)
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.confirm = this.confirm.bind(this)
    this.cancel = this.cancel.bind(this)

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
  handleAppName(e) {
    this.setState({
      appName: e.target.value
    })
  }
  handleRemark(e) {
    this.setState({
      remark: e.target.value
    })
  }
  handleCluster(value) {
    console.log(`${value}`);
    this.setState({
      cluster: `${value}`
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
    this.setState({ visible: false });
    message.error('留在当前页面');
  }
  handleVisibleChange(visible) {
    if (!visible) {
      this.setState({ visible });
      return;
    }
    // 打开前进行判断
    console.log(this.state.condition);
    if (this.state.condition) {
      this.confirm();  // 直接执行下一步
    } else {
      this.setState({ visible });  // 进行确认
    }
  }
  render() {
    const {appName, appDescYaml, remark} = this.state
    const parentScope = this.props.scope;
    const createModel = parentScope.state.createModel;
    let backUrl = backLink(createModel);
    return (
      <QueueAnim id="ComposeFile"
        type="right"
        >
        <div className="ComposeFile" key="ComposeFile">
          <div className="nameBox">
            <span>应用名称</span>
            <Input size="large" placeholder="起一个萌萌哒的名称吧~" onChange={this.handleAppName} value={appName} />
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="introBox">
            <span>添加描述</span>
            <Input size="large" placeholder="写一个萌萌哒的描述吧~" onChange={this.handleRemark} value={remark} />
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
          <div className="envirBox">
            <span>部署环境</span>
            <Dropdown overlay={operaMenu} trigger={['click']}>
              <Button size="large" type="ghost">
                请选择空间
              <i className="fa fa-caret-down" />
              </Button>
            </Dropdown>
            <Select size="large" defaultValue="请选择集群" style={{ width: 200 }} onChange={this.handleCluster}>
              <Option value="cce1c71ea85a5638b22c15d86c1f61de">test</Option>
              <Option value="cce1c71ea85a5638b22c15d86c1f61df">产品环境</Option>
              <Option value="e0e6f297f1b3285fb81d27742255cfcf">k8s 1.4</Option>
            </Select>
          </div>
          <div className="btnBox">
              {/*<Link to={`${backUrl}`}>*/}
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
              {/*</Link>*/}
            
            <Button size="large" type="primary" className="createBtn" onClick={this.subApp}>
              创建
              </Button>
          </div>
        </div>
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
  }
}

function mapDispatchToProps(dispatch) {
  return {
    createApp: (appConfig, callback) => {
      dispatch(createApp(appConfig, callback))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ComposeFile, {
  withRef: true,
}))

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
