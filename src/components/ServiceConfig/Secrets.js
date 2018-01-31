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
  createSecret, getSecrets, removeSecrets,
} from '../../actions/secrets'
import NotificationHandler from '../../components/Notification'
import CommonSearchInput from '../../components/CommonSearchInput'
import ConfigGroup from './ConfigGroup'
import CreateServiceGroupModal from './ConfigGroup/CreateModal'
import './style/Secret.less'
import './style/ServiceConfig.less'

class ServiceSecretsConfig extends React.Component {
  state = {
    searchInput: undefined,
    checkedList: [],
    createServiceGroupModalVisible: false,
    createServiceGroupModalConfrimLoading: false,
    deleteServiceGroupModalVisible: false,
    deleteServiceGroupModalConfrimLoading: false,
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
    const notification = new NotificationHandler()
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
    const notification = new NotificationHandler()
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

  render() {
    const { secretsList } = this.props
    const {
      checkedList, createServiceGroupModalVisible,
      createServiceGroupModalConfrimLoading,
      deleteServiceGroupModalVisible,
      deleteServiceGroupModalConfrimLoading,
    } = this.state
    console.log('secretsList', secretsList)
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
          <Collapse accordion>
            {
              secretsList.data && secretsList.data.map((secret, index) => (
                ConfigGroup({
                  key: index,
                  group: secret,
                  checkedList,
                  setCheckedList: this.setCheckedList,
                  removeSecrets: () => this.setState({deleteServiceGroupModalVisible: true}),
                })
              ))
            }
          </Collapse>
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
})(ServiceSecretsConfig)
