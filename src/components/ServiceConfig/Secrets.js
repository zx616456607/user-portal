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
import find from 'lodash/find'
import { loadAppList } from '../../actions/app_manage'
import NotificationHandler from '../../components/Notification'
import CommonSearchInput from '../../components/CommonSearchInput'
import ConfigGroup from './ConfigGroup'
import CreateConfigFileModal from './CreateConfigFileModal'
import UpdateConfigFileModal from './UpdateConfigFileModal'
import CreateServiceGroupModal from './ConfigGroup/CreateModal'
import noConfigGroupImg from '../../assets/img/no_data/no_config.png'
import { isResourceQuotaError } from '../../common/tools'
import './style/Secret.less'
import './style/ServiceConfig.less'
import { isResourcePermissionError } from '../../common/tools'

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
    const { getSecrets, loadAppList, clusterID } = this.props
    getSecrets(clusterID)
    loadAppList(clusterID)
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
        func: err => {
          let errorText
          if(isResourcePermissionError(err)){
            //403 没权限判断 在App/index中统一处理 这里直接返回
            return;
          }
          switch (err.message.code) {
            case 403: errorText = '添加的配置过多'; break
            case 409: errorText = `配置组 ${name} 已存在`; break
            case 500: errorText = '网络异常'; break
            default: errorText = '创建失败'
          }
          notification.error(errorText)
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
    const { removeSecrets, clusterID, secretsOnUse } = this.props
    const {
      checkedList,
    } = this.state
    if (secretsOnUse) {
      const onUseSecrets = []
      checkedList.forEach(secretName => {
        if (Object.keys(secretsOnUse[secretName] || {}).length > 0) {
          onUseSecrets.push(secretName)
        }
      })
      if (onUseSecrets.length > 0) {
        this.setState({
          deleteServiceGroupModalVisible: false,
          checkedList: [],
        })
        return Modal.warning({
          title: '删除配置组失败!',
          content: <div>
            {
              onUseSecrets.map(secretName => <div>{secretName}：配置组正在使用中</div>)
            }
          </div>,
        })
      }
    }
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
            configName: undefined,
            configtextarea: undefined,
          })
        },
        isAsync: true
      },
      failed: {
        func: error => {
          if (isResourceQuotaError(error)) {
            this.setState({
              modalConfigFile: false,
              createConfigFileModalVisible: false,
              configName: undefined,
              configtextarea: undefined,
            })
            return
          }
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
            updateConfigFileModalVisible: false,
            configName: undefined,
            configtextarea: undefined,
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
    const { removeKeyFromSecret, clusterID, secretsOnUse } = this.props
    const { activeGroupName, configName } = this.state
    if (secretsOnUse[activeGroupName] && secretsOnUse[activeGroupName][configName].length > 0) {
      this.setState({
        modalConfigFile: false,
        removeKeyModalVisible: false,
      })
      return Modal.warning({
        title: '移除加密对象失败!',
        content: `${configName}：加密对象正在使用中`,
      })
    }
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
    const { secretsList, secretsOnUse } = this.props
    const {
      checkedList,
      createServiceGroupModalVisible,
      createServiceGroupModalConfrimLoading,
      deleteServiceGroupModalVisible,
      deleteServiceGroupModalConfrimLoading,
      modalConfigFile,
      createConfigFileModalVisible,
      updateConfigFileModalVisible,
      removeKeyModalVisible,
      searchInput,
    } = this.state
    const { isFetching } = secretsList
    let data = secretsList.data || []
    if (searchInput) {
      data = data.filter(secret => secret.name.indexOf(searchInput) > -1)
    }
    return (
      <div className="service-secret-config" id="service-secret-config">
        <div className="layout-content-btns">
          <Button
            type="primary"
            size="large"
            onClick={() => this.setState({ createServiceGroupModalVisible: true }, () => {
              document.getElementById('name').focus()
            })}
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
                {
                  searchInput
                  ? '未找到相关配置组'
                  : '您还没有配置组，创建一个吧！'
                }
                &nbsp;
                <Button
                  type="primary"
                  size="large"
                  onClick={() => this.setState({ createServiceGroupModalVisible: true }, () => {
                    document.getElementById('name').focus()
                  })}
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
                    }),
                    secretOnUse: secretsOnUse[secret.name] || {},
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
  const { entities, secrets, apps } = state
  const { current } = entities
  const { cluster } = current
  const { clusterID } = cluster
  const { appItems } = apps
  const secretsList = secrets.list[clusterID] || {}
  const appList = appItems[clusterID] && appItems[clusterID].appList || []
  const secretsOnUse = {}
  if (secretsList.data && appList.length > 0) {
    appList.forEach(app => {
      app.services.forEach(service => {
        const { volumes = [] } = service.spec.template.spec
        // volumes
        volumes.forEach(v => {
          const { secret, name } = v
          if (secret) {
            const { secretName, items } = secret
            secretsOnUse[secretName] = Object.assign({}, secretsOnUse[secretName])
            const currentSecret = find(secretsList.data, { name: secretName }) || {}
            const currentSecretData = currentSecret.data || {}
            const volumeMount = find(
              service.spec.template.spec.containers[0].volumeMounts,
              { name }
            ) || {}
            let configItems = items
            if (!items) {
              configItems = Object.keys(currentSecretData).map(key => ({
                key,
              }))
            }
            configItems.forEach(config => {
              const { key } = config
              if (!secretsOnUse[secretName][key]) {
                secretsOnUse[secretName][key] = []
              }
              const secretAndService = {
                appName: app.name,
                serviceName: service.metadata.name,
                mountPath: volumeMount.mountPath,
                env: [],
              }
              /* const { env = [] } = service.spec.template.spec.containers[0]
              env.forEach(({ name, valueFrom }) => {
                if (valueFrom
                  && valueFrom.secretKeyRef.name === secretName
                  && valueFrom.secretKeyRef.key === key
                ) {
                  secretAndService.env.push(name)
                }
              }) */
              secretsOnUse[secretName][key].push(secretAndService)
            })
          }
        })
        // env
        const { env = [] } = service.spec.template.spec.containers[0]
        env.forEach(({ name, valueFrom }) => {
          if (valueFrom && valueFrom.secretKeyRef) {
            const { secretKeyRef } = valueFrom
            const secretAndService = {
              appName: app.name,
              serviceName: service.metadata.name,
            }
            if (!secretsOnUse[secretKeyRef.name]) {
              secretsOnUse[secretKeyRef.name] = {}
            }
            if (!secretsOnUse[secretKeyRef.name][secretKeyRef.key]) {
              secretsOnUse[secretKeyRef.name][secretKeyRef.key] = []
            }
            const currentSecretsOnUseNameKey = find(secretsOnUse[secretKeyRef.name][secretKeyRef.key], secretAndService)
            if (currentSecretsOnUseNameKey) {
              currentSecretsOnUseNameKey.env.push(name)
            } else {
              secretAndService.env = [ name ]
              secretsOnUse[secretKeyRef.name][secretKeyRef.key].push(secretAndService)
            }
          }
        })
      })
    })
  }
  return {
    clusterID,
    secretsList,
    secretsOnUse,
    appList,
  }
}

export default connect(mapStateToProps, {
  getSecrets,
  createSecret,
  removeSecrets,
  removeKeyFromSecret,
  addKeyIntoSecret,
  updateKeyIntoSecret,
  loadAppList,
})(ServiceSecretsConfig)
