/**
 *
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Config Group
 *
 * v0.1 - 2016/9/23
 * @author ZhaoXueYu BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Row, Col, Modal, Button, Form, Icon, Checkbox, Menu, Dropdown, Input } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { createConfigFiles, deleteConfigGroup, loadConfigGroup, deleteConfigFiles, addConfigFile } from '../../actions/configs'
import { connect } from 'react-redux'
import { calcuDate } from '../../common/tools.js'
import NotificationHandler from '../../common/notification_handler'
import { validateK8sResource } from '../../common/naming_validation'

const ButtonGroup = Button.Group
const FormItem = Form.Item

class CollapseHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalConfigFile: false,
      configArray: [],
      configName: '',
      configDesc: '',
      sizeNumber: this.props.sizeNumber,
      configNameList: this.props.configNameList
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      configNameList: nextProps.configNameList,
      sizeNumber: nextProps.sizeNumber
    })
  }
  // click config modal show
  createConfigModal(e, modal) {
    e.stopPropagation()
    this.setState({ modalConfigFile: modal })
    setTimeout(() => {
      this.nameInput.refs.input.focus()
    })
  }
  createConfigFile(group) {
    let notification = new NotificationHandler()
    if (!this.state.configName) {
      notification.error('请输入配置组名称')
      return
    }
    if (escape(this.state.configName).indexOf("%u") > 0) {
      notification.error('名称格式输入有误，请重新输入')
      return
    }
    if (this.state.configDesc == '') {
      notification.error('内容不能为空，请重新输入内容')
      return
    }
    if (!validateK8sResource(this.state.configName)) {
      notification.error('名称由小写英文字母、数字、点（.）和连字符（-）组成，长度为 3-63 个字符')
      return
    }
    let configfile = {
      group,
      cluster: this.props.cluster.clusterID,
      name: this.state.configName,
      desc: this.state.configDesc
    }
    let self = this
    const {parentScope} = this.props
    self.props.createConfigFiles(configfile, {
      success: {
        func: () => {
          notification.success('创建配置文件成功')
          self.setState({
            modalConfigFile: false,
            configName: '',
            configDesc: ''
          })
          self.props.addConfigFile(configfile)
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let errorText
          switch (res.message.code) {
            case 403: errorText = '添加配置文件过多'; break
            case 409: errorText = '配置已存在'; break
            case 500: errorText = '网络异常'; break
            default: errorText = '缺少参数或格式错误'
          }
          notification.error('添加配置文件失败', errorText);
          self.setState({
            modalConfigFile: false,
            configName: '',
            configDesc: ''
          })
        }
      }
    })
  }
  handleDropdown(e) {
    e.stopPropagation()
  }
  addConfigFile(e, key) {
    if (key == 'name') {
      this.setState({
        configName: e.target.value
      })
    } else {
      this.setState({
        configDesc: e.target.value
      })
    }
  }
  handChage(e, Id) {
    this.props.handChageProp(e, Id)
  }
  btnDeleteGroup(group) {
    const self = this
    let configArray = []
    configArray.push(group)
    let configData = {
      cluster: this.props.cluster.clusterID,
      "groups": configArray
    }
    let notification = new NotificationHandler()
    Modal.confirm({
      title: '您是否确认要删除这些配置组',
      content: group,
      onOk() {
        self.props.deleteConfigGroup(configData, {
          success: {
            func: (res) => {
              // self.props.loadConfigGroup()
              const errorText =[]
              if (res.message.length > 0) {
                res.message.forEach(function(list){
                  errorText.push({
                    name: list.name,
                    text: list.error
                  })
                })
                const content = errorText.map(list => {
                  return (
                    <h3>{list.name} ：{list.text}</h3>
                  )
                })
                Modal.error({
                  title:'删除配置组失败!',
                  content
                })
              } else {
                notification.success('删除成功')
              }
              self.setState({
                configArray: [],
              })
            },
            isAsync: true
          }
        })
      }
    })
  }
  render() {
    const {collapseHeader } = this.props
    const {sizeNumber} = this.state
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 21 } }
    const menu = (
      <Menu onClick={() => this.btnDeleteGroup(collapseHeader.name)} mode="vertical">
        <Menu.Item key="1"><Icon type="delete" /> 删除配置组</Menu.Item>
      </Menu>
    );
    return (
      <Row>
        <Col className="group-name textoverflow" span="6">
          <Checkbox onChange={(e) => this.handChage(e, collapseHeader.name)} onClick={(e) => this.handleDropdown(e)}></Checkbox>
          <Icon type="folder-open" />
          <Icon type="folder" />
          <span>{collapseHeader.name}</span>
        </Col>
        <Col span="6">
          配置文件 &nbsp;
          {sizeNumber}个
        </Col>
        <Col span="6">
          创建时间&nbsp;&nbsp;{calcuDate(collapseHeader.creationTimestamp)}
        </Col>
        <Col span="6">
          <ButtonGroup onClick={(e)=>this.handleDropdown(e)}>
            <Dropdown.Button size='large' onClick={(e) => this.createConfigModal(e, true)} overlay={menu} type="ghost">
              <span style={{ fontSize:'14px !important' }}><Icon type="plus" />&nbsp;配置文件</span>
            </Dropdown.Button>
          </ButtonGroup>
          {/*添加配置文件-弹出层-start*/}
          <Modal
            title="添加配置文件"
            wrapClassName="configFile-create-modal"
            visible={this.state.modalConfigFile}
            onOk={(e) => this.createConfigFile(collapseHeader.name)}
            onCancel={(e) => this.createConfigModal(e, false)}
            width = "800px"
            >
            <div className="configFile-inf" style={{ padding: '0 10px' }}>
              <p className="configFile-tip" style={{ color: "#16a3ea", height: '35px', textIndent: '10px' }}>
                &nbsp;&nbsp;&nbsp;<Icon type="info-circle-o" style={{ marginRight: "10px" }} />
                即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置
              </p>
              <Form horizontal>
                <FormItem  {...formItemLayout} label="名称">
                  <Input type="text" ref={(ref) => { this.nameInput = ref; }} value={this.state.configName} onChange={(e) => this.addConfigFile(e, 'name')} className="configName" />
                </FormItem>
                <FormItem {...formItemLayout} label="内容">
                  <Input type="textarea" style={{ minHeight: '300px' }} value={this.state.configDesc} onChange={(e) => this.addConfigFile(e, 'desc')} />
                </FormItem>
              </Form>
            </div>
          </Modal>
          {/*添加配置文件-弹出层-end*/}
        </Col>
      </Row>
    )
  }
}

CollapseHeader.propTypes = {
  collapseHeader: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  createConfigFiles: PropTypes.func.isRequired,
  loadConfigGroup: PropTypes.func.isRequired,
  deleteConfigGroup: PropTypes.func.isRequired
}
function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultConfigFiles = {
    isFetching: false,
    cluster: cluster.clusterID,
    configFiles: [],
    configNameList: []
  }

  const { configGroupList  } = state.configReducers

  const {configFiles, isFetching, configNameList} = configGroupList[cluster.clusterID] || defaultConfigFiles
  return {
    configFiles,
    cluster,
    isFetching,
    configNameList
  }
}

function mapDispatchToProps(dispatch) {
  return {
    createConfigFiles: (obj, callback) => { dispatch(createConfigFiles(obj, callback)) },
    deleteConfigGroup: (obj, callback) => { dispatch(deleteConfigGroup(obj, callback)) },
    loadConfigGroup: (obj) => { dispatch(loadConfigGroup(obj)) },
    addConfigFile: (configFile) => dispatch(addConfigFile(configFile))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CollapseHeader, {
  withRef: true,
}))


