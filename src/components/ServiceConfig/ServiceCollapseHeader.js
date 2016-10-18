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
import { Row, Col, Modal, Button,Form , Icon, Checkbox, Menu, Dropdown, Input, message } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { createConfigFiles, deleteConfigGroup, loadConfigGroup, deleteConfigFiles, configGroupName } from '../../actions/configs'
import { connect } from 'react-redux'
import { DEFAULT_CLUSTER } from '../../constants'
import { tenxDateFormat } from '../../common/tools.js'


const ButtonGroup = Button.Group
const FormItem = Form.Item

class CollapseHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalConfigFile: false,
      configArray: [],
      configName: '',
      configDesc: ''

    }
  }
  // click config modal show
  createConfigModal(e, modal) {
    e.stopPropagation()
    this.setState({ modalConfigFile: modal })
  }
  createConfigFile(group) {
    // e.stopPropagation()
    if (!this.state.configName) {
      message.error('请输入配置组名称')
      return
    }
    if (escape(this.state.configName).indexOf( "%u" ) > 0) {
      message.error('名称格式输入有误，请重新输入')
      return
    }
    if (escape(this.state.configDesc).indexOf( "%u" ) > 0) {
      message.error('内容格式输入有误，请重新输入')
      return
    }
    let configfile = {
      group,
      cluster: DEFAULT_CLUSTER,
      name: this.state.configName,
      desc: this.state.configDesc
    }
    let self = this
    const {parentScope} = this.props
    self.props.createConfigFiles(configfile, {
      success: {
        func: () => {
          message.success('创建配置文件成功')
          self.setState({
            modalConfigFile: false,
            configName: '',
            configDesc: ''
          })
          self.props.configGroupName(configfile, {
            success: {
              func: ()=>{
                parentScope.setState({
                  List: self.props.configName,
                  Size: self.props.configName.length
                })
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      },
      failure: {
        func: () => {
          message.error('创建配置文件失败')
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
    // console.log('props',this.props)
    const self = this
    let configArray = []
    configArray.push(group)
    let configData = {
      cluster: DEFAULT_CLUSTER,
      "groups": configArray
    }
    Modal.confirm({
      title: '您是否确认要删除这些配置组',
      content: group,
      onOk() {
        self.props.deleteConfigGroup(configData, {
          success: {
            func: () => {
              message.success('删除成功')
              self.props.loadConfigGroup()
            },
            isAsync: true
          }
        })
      }
    })
  }
  render() {
    const {collapseHeader, sizeNumber} = this.props
    const formItemLayout = {labelCol: { span: 3 },wrapperCol: { span: 21 }}
    const menu = (
      <Menu onClick={() => this.btnDeleteGroup(collapseHeader.native.metadata.name)} mode="vertical">
        <Menu.Item key="1">删除配置组</Menu.Item>
      </Menu>
    );
    return (
      <Row>
        <Col className="group-name" span="6">
          <Checkbox onChange={(e) => this.handChage(e, collapseHeader.native.metadata.name)} onClick={(e) => this.handleDropdown(e)}></Checkbox>
          <Icon type="folder-open" />
          <Icon type="folder" />
          <span>{collapseHeader.native.metadata.name}</span>
        </Col>
        <Col span="6">
          配置文件 &nbsp;
          {sizeNumber}个
        </Col>
        <Col span="6">
          创建时间&nbsp;&nbsp;{ tenxDateFormat(collapseHeader.native.metadata.creationTimestamp) }
        </Col>
        <Col span="6">
          <ButtonGroup>
            <Button type="ghost" onClick={(e) => this.createConfigModal(e, true)}>
              <Icon type="plus" style={{ marginRight: '5px' }} />配置文件
            </Button>
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type="ghost" onClick={(e) => this.handleDropdown(e, false)}>
                <Icon type="down" />
              </Button>
            </Dropdown>
          </ButtonGroup>
          {/*添加配置文件-弹出层-start*/}
          <Modal
            title="添加配置文件"
            wrapClassName="configFile-create-modal"
            visible={this.state.modalConfigFile}
            onOk={(e) => this.createConfigFile(collapseHeader.native.metadata.name)}
            onCancel={(e) => this.createConfigModal(e, false)}
            >
            <div className="configFile-inf">
              <p className="configFile-tip" style={{ color: "#16a3ea", height:'35px', textIndent:'12px'}}>
                <Icon type="info-circle-o" style={{ marginRight: "10px" }} />
                即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置
              </p>
              <Form horizontal>
                <FormItem  {...formItemLayout} label="名称">
                  <Input type="text" value={this.state.configName} onChange={(e) => this.addConfigFile(e, 'name')} className="configName" />
                </FormItem>
                <FormItem {...formItemLayout} label="内容">
                  <Input type="textarea" style={{minHeight:'100px'}} value={this.state.configDesc} onChange={(e) => this.addConfigFile(e, 'desc')} />
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
  configGroupName: PropTypes.func.isRequired,
  loadConfigGroup: PropTypes.func.isRequired,
  deleteConfigGroup: PropTypes.func.isRequired
}
function mapStateToProps(state, props) {
  const defaultConfigFiles = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    configFiles: [],
    configName: []
  }

  const { configGroupName  } = state.configReducers

  const {configFiles, cluster, isFetching} = createConfigFiles[DEFAULT_CLUSTER] || defaultConfigFiles
  const {configName} = configGroupName[DEFAULT_CLUSTER] || defaultConfigFiles
  return {
    configFiles, cluster, isFetching, configName
  }
}

function mapDispatchToProps(dispatch) {
  return {
    createConfigFiles: (obj, callback) => { dispatch(createConfigFiles(obj, callback)) },
    configGroupName: (obj,callback) => { dispatch(configGroupName(obj, callback)) },
    deleteConfigGroup: (obj, callback) => {dispatch(deleteConfigGroup(obj, callback))},
    loadConfigGroup: (obj) => {dispatch(loadConfigGroup(obj))}
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CollapseHeader, {
  withRef: true,
}))


