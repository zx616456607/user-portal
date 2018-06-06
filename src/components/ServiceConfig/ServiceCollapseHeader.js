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
import { Row, Col, Modal, Button, Icon, Checkbox, Menu, Dropdown, Tooltip } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { createConfigFiles, deleteConfigGroup, deleteConfigFiles, addConfigFile } from '../../actions/configs'
import { connect } from 'react-redux'
import { calcuDate } from '../../common/tools.js'
import NotificationHandler from '../../components/Notification'
import { USERNAME_REG_EXP_NEW } from '../../constants'
import { validateK8sResource } from '../../common/naming_validation'
import CreateConfigFileModal from './CreateConfigFileModal'

const ButtonGroup = Button.Group

class CollapseHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalConfigFile: false,
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
  }

  handleDropdown(e) {
    e.stopPropagation()
  }
  handChage(e, Id) {
    this.props.handChageProp(e,Id)
  }
  btnDeleteGroup() {
    const self = this
    let configArray = []
    configArray.push(this.state.groupName)
    let configData = {
      cluster: this.props.cluster.clusterID,
      "groups": configArray
    }
    let notification = new NotificationHandler()
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
        },
        isAsync: true
      }
    })
    this.setState({delModal: false})

  }
  menuClick(item) {
    const { collapseHeader, grandScope } = this.props
    if (item.key === '1') {
      this.setState({delModal: true, groupName: collapseHeader.name})
    } else if (item.key === '2') {
      grandScope.setState({
        currentGroup:collapseHeader.name
      },()=>{
        grandScope.configModal(true,true)
      })
    }
  }
  render() {
    const {collapseHeader } = this.props
    const {sizeNumber, modalConfigFile} = this.state
    const menu = (
      <Menu onClick={this.menuClick.bind(this)} mode="vertical">
        <Menu.Item key="1"><Icon type="delete"/> 删除配置组</Menu.Item>
        <Menu.Item key="2"><i className="fa fa-pencil-square-o fa-lg" aria-hidden="true"/> 修改分类</Menu.Item>
      </Menu>
    );
    return (
      <Row>
        <Col className="group-name textoverflow" span="6">
          <Checkbox checked={(this.props.configArray.indexOf(collapseHeader.name) >-1)} onChange={(e) => this.handChage(e, collapseHeader.name)} onClick={(e) => this.handleDropdown(e)}/>
          <Icon type="folder-open" />
          <Icon type="folder" />
          <Tooltip title={collapseHeader.name}>
            <span className="textoverflow">{collapseHeader.name}</span>
          </Tooltip>
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
          {
            modalConfigFile &&
            <CreateConfigFileModal scope={this} visible = {modalConfigFile} groupName={collapseHeader.name}/>
          }
          {/*添加配置文件-弹出层-end*/}

          {/*删除配置文件-弹出层 */}

          <Modal title="删除配置组操作" visible={this.state.delModal}
                 onOk={()=> this.btnDeleteGroup()} onCancel={()=> this.setState({delModal: false})}
          >
            <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除配置组 {collapseHeader.name} ?</div>
          </Modal>
        </Col>
      </Row>
    )
  }
}

CollapseHeader.propTypes = {
  collapseHeader: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  createConfigFiles: PropTypes.func.isRequired,
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
    addConfigFile: (configFile) => dispatch(addConfigFile(configFile))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CollapseHeader, {
  withRef: true,
}))

