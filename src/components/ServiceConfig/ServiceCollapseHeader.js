/**
 *
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/23
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { Row, Col, Modal, Button, Icon, Checkbox, Menu, Dropdown, Input, message } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { createConfigFiles, deleteConfigFiles, configGroupName } from '../../actions/configs'
import { connect } from 'react-redux'
import { DEFAULT_CLUSTER } from '../../constants'


function handleMenuClick() {
  console.log('delete !');
}
const menu = (
  <Menu onClick={() => handleMenuClick()} mode="vertical">
    <Menu.Item key="1">删除配置组</Menu.Item>
  </Menu>
);
const ButtonGroup = Button.Group

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
    console.log('fileName', group)
    let configfile = {
      group,
      cluster: DEFAULT_CLUSTER,
      name: this.state.configName,
      desc: this.state.configDesc
    }
    let self = this
    self.props.createConfigFiles(configfile, {
      success: {
        func: () => {
          message.success('创建配置文件成功')
          self.setState({
            modalConfigFile: false,
            configName: '',
            configDesc: ''
          })
          self.props.configGroupName(configfile)
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
  render() {
    const {collapseHeader} = this.props
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
          {collapseHeader.extended.size}个
        </Col>
        <Col span="6">
          创建时间&nbsp;&nbsp;{collapseHeader.native.metadata.creationTimestamp}
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
              <p className="configFile-tip" style={{ color: "#16a3ea" }}>
                <Icon type="info-circle-o" style={{ marginRight: "10px" }} />
                即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置
              </p>
              <span className="li">名称 : </span>
              <Input type="text" value={this.state.configName} onChange={(e) => this.addConfigFile(e, 'name')} className="configName" />
              <span className="li">内容 : </span>
              <Input type="textarea" value={this.state.configDesc} onChange={(e) => this.addConfigFile(e, 'desc')} />
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
  configGroupName: PropTypes.func.isRequired
}
function mapStateToProps() {
  const defaultConfigFiles = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    configFiles: [],
  }
  const {configFiles, cluster, isFetching} = createConfigFiles[DEFAULT_CLUSTER] || defaultConfigFiles
  return {
    configFiles, cluster, isFetching
  }
}

function mapDispatchToProps(dispatch) {
  return {
    createConfigFiles: (obj, callback) => { dispatch(createConfigFiles(obj, callback)) },
    configGroupName: (obj) => { dispatch(configGroupName(obj)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CollapseHeader, {
  withRef: true,
}))


