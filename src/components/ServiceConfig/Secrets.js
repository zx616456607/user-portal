/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * service config: secret
 *
 * v0.1 - 2018-01-30
 * @author Zhangpc
 */

import React from 'react'
import { connect } from 'react-redux'
import { Row, Col, Modal, Button, Icon, Collapse, Input, Spin, Tooltip } from 'antd'
import {
  createSecret, getSecrets, removeSecrets, removeKeyFromSecret,
  addKeyIntoSecret, updateKeyIntoSecret,
} from '../../actions/secrets'
import NotificationHandler from '../../components/Notification'
import CommonSearchInput from '../../components/CommonSearchInput'
import ConfigGroup from './ConfigGroup'
import CreateConfigFileModal from './CreateConfigFileModal'
import UpdateConfigFileModal from './UpdateConfigFileModal'
import CreateServiceGroupModal from './ConfigGroup/CreateModal'
import noConfigGroupImg from '../../assets/img/no_data/no_config.png'
import './style/Secret.less'
import './style/ServiceConfig.less'

const notification = new NotificationHandler()

class ServiceSecretsConfig extends React.Component {
  state = {
    searchInput: undefined,
    checkedList: [],
    createServiceGroupModalVisible: false,
    createServiceGroupModalConfrimLoading: false,
    deleteServiceGroupModalVisible: false,
    deleteServiceGroupModalConfrimLoading: false,
    modalConfigFile: false,
    createConfigFileModalVisible: false,
    updateConfigFileModalVisible: false,
    activeGroupName: undefined,
    configName: undefined,
    configtextarea: undefined,
    removeKeyModalVisible: false,
  }

  loadData = () => {
    const { getSecrets, clusterID } = this.props
    getSecrets(clusterID)
    this.setState({
      checkedList: []
    })
  }

  componentDidMount() {
    this.loadData()
  }

  setCheckedList = (checkedList, cb) => this.setState({ checkedList }, cb)

  createServiceGroup = values => {
    const { createSecret, clusterID } = this.props
    const { name } = values
    this.setState({
      createServiceGroupModalConfrimLoading: true,
    })
    createSecret(clusterID, name, {
      success: {
        func: () => {
          notification.success('创建成功')
          this.loadData()
          this.onCreateServiceGroupModalCancel()
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.error('创建失败')
        },
        isAsync: true
      },
      finally: {
        func: () => {
          this.setState({
            createServiceGroupModalConfrimLoading: false,
          })
        },
      },
    })
  }

  onCreateServiceGroupModalCancel = () => this.setState({ createServiceGroupModalVisible: false })

  handleRemoveSecrets = () => {
    const { removeSecrets, clusterID } = this.props
    const {
      checkedList,
    } = this.state
    this.setState({
      deleteServiceGroupModalConfrimLoading: true,
    })
    removeSecrets(clusterID, checkedList, {
      success: {
        func: () => {
          notification.success('删除成功')
          this.loadData()
          this.setState({
            deleteServiceGroupModalVisible: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.error('删除失败')
        },
        isAsync: true
      },
      finally: {
        func: () => {
          this.setState({
            deleteServiceGroupModalConfrimLoading: false,
          })
        },
      },
    })
  }

  openCreateConfigFileModal = name => {
    this.setState({
      modalConfigFile: true,
      createConfigFileModalVisible: true,
      activeGroupName: name,
    })
  }

  createConfigModal = (e, modal) => {
    e.stopPropagation()
    this.setState({ modalConfigFile: modal })
    this.setState({
      modalConfigFile: modal,
      createConfigFileModalVisible: modal,
    })
  }

  handleAddKeyIntoSecret = values => {
    const { addKeyIntoSecret, clusterID } = this.props
    const { activeGroupName } = this.state
    const body = {
      key: values.configName,
      value: values.configDesc,
    }
    addKeyIntoSecret(clusterID, activeGroupName, body, {
      success: {
        func: () => {
          notification.success('添加成功')
          this.loadData()
          this.setState({
            modalConfigFile: false,
            createConfigFileModalVisible: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.error('添加失败')
        },
        isAsync: true
      },
    })
  }

  openUpdateConfigFileModal = (name, key, value) => {
    this.setState({
      modalConfigFile: true,
      updateConfigFileModalVisible: true,
      activeGroupName: name,
      configName: key,
      configtextarea: value,
    })
  }

  handleUpdateKeyIntoSecret = values => {
    const { updateKeyIntoSecret, clusterID } = this.props
    const { activeGroupName, configName } = this.state
    const body = {
      key: configName,
      value: values.configDesc,
    }
    updateKeyIntoSecret(clusterID, activeGroupName, body, {
      success: {
        func: () => {
          notification.success('更新成功')
          this.loadData()
          this.setState({
            modalConfigFile: false,
            createConfigFileModalVisible: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.error('更新失败')
        },
        isAsync: true
      },
    })
  }

  handleRemoveKeyFromSecret = () => {
    const { removeKeyFromSecret, clusterID } = this.props
    const { activeGroupName, configName } = this.state
    removeKeyFromSecret(clusterID, activeGroupName, configName, {
      success: {
        func: () => {
          notification.success('移除成功')
          this.loadData()
          this.setState({
            modalConfigFile: false,
            removeKeyModalVisible: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.error('移除失败')
        },
        isAsync: true
      },
    })
  }

  render() {
    const { secretsList } = this.props
    const {
      checkedList, createServiceGroupModalVisible,
      createServiceGroupModalConfrimLoading,
      deleteServiceGroupModalVisible,
      deleteServiceGroupModalConfrimLoading,
      modalConfigFile,
      createConfigFileModalVisible,
      updateConfigFileModalVisible,
      removeKeyModalVisible,
    } = this.state
    const { data = [], isFetching } = secretsList
    return (
      <div className="service-secret-config" id="service-secret-config">
        <div className="layout-content-btns">
          <Button
            type="primary"
            size="large"
            onClick={() => this.setState({ createServiceGroupModalVisible: true })}
          >
            <i className="fa fa-plus" /> 创建配置组
          </Button>
          <Button
            size="large"
            disabled={checkedList.length === 0}
            onClick={() => this.setState({deleteServiceGroupModalVisible: true})}
          >
            <i className="fa fa-trash-o" /> 删除
          </Button>
          <CommonSearchInput
            onSearch={value => { this.setState({ searchInput: value && value.trim()}) }}
            placeholder="按配置组名称搜索"
            size="large"
          />
        </div>
        <div>
          {
            isFetching &&
            <div className='loadingBox'>
              <Spin size='large' />
            </div>
          }
          {
            !isFetching && data.length === 0 &&
            <div className="text-center">
              <img src={noConfigGroupImg} />
              <div>
                您还没有配置组，创建一个吧！&nbsp;
                <Button
                  type="primary"
                  size="large"
                  onClick={() => this.setState({ createServiceGroupModalVisible: true })}
                >
                创建
                </Button>
              </div>
            </div>
          }
          {
            data.length > 0 &&
            <Collapse accordion>
              {
                data.map((secret, index) => (
                  ConfigGroup({
                    key: index,
                    group: secret,
                    checkedList,
                    setCheckedList: this.setCheckedList,
                    removeSecrets: () => this.setState({deleteServiceGroupModalVisible: true}),
                    openCreateConfigFileModal: this.openCreateConfigFileModal,
                    openUpdateConfigFileModal: this.openUpdateConfigFileModal,
                    removeKeyFromSecret: (name, key) => this.setState({
                      removeKeyModalVisible: true,
                      activeGroupName: name,
                      configName: key,
                    })
                  })
                ))
              }
            </Collapse>
          }
        </div>
        {/*创建配置组-弹出层-start*/}
        <CreateServiceGroupModal
          visible={createServiceGroupModalVisible}
          onCancel={this.onCreateServiceGroupModalCancel}
          onOk={this.createServiceGroup}
          confirmLoading={createServiceGroupModalConfrimLoading}
        />
        {/* 删除配置组-弹出层-*/}
        <Modal
          title="删除配置组操作"
          visible={deleteServiceGroupModalVisible}
          onOk={this.handleRemoveSecrets}
          onCancel={() => this.setState({ deleteServiceGroupModalVisible: false })}
          confirmLoading={deleteServiceGroupModalConfrimLoading}
        >
          <div className="modalColor">
          <i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}/>
          您是否确定要删除配置组 {checkedList.join('，')} ?</div>
        </Modal>
        {/* 添加加密对象-弹出层-*/}
        {
          createConfigFileModalVisible && modalConfigFile &&
          <CreateConfigFileModal
            scope={this}
            modalConfigFile={modalConfigFile}
            addKeyIntoSecret={this.handleAddKeyIntoSecret}
            type="secrets"
          />
        }
        {/* 修改加密对象-弹出层-*/}
        {
          updateConfigFileModalVisible && modalConfigFile &&
          <UpdateConfigFileModal
            scope={this}
            modalConfigFile={modalConfigFile}
            updateKeyIntoSecret={this.handleUpdateKeyIntoSecret}
            type="secrets"
          />
        }
        {/* 移除加密对象-弹出层-*/}
        <Modal title="移除加密对象操作"
          visible={removeKeyModalVisible}
          onOk={this.handleRemoveKeyFromSecret}
          onCancel={() => this.setState({ removeKeyModalVisible: false })}
        >
          <div className="modalColor">
            <i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>
            您是否确定要移除加密对象 {this.state.configName}?
          </div>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities, secrets } = state
  const { current } = entities
  const { cluster } = current
  const { clusterID } = cluster
  return {
    clusterID,
    secretsList: secrets.list[clusterID] || {}
  }
}

export default connect(mapStateToProps, {
  getSecrets,
  createSecret,
  removeSecrets,
  removeKeyFromSecret,
  addKeyIntoSecret,
  updateKeyIntoSecret,
})(ServiceSecretsConfig)
