/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  config group list
 *
 * v2.0 - 2016/9/23
 * @author ZhaoXueYu  BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Row, Icon, Input, Form, Modal, Timeline, Spin, Button, Tooltip, Upload } from 'antd'
import { injectIntl } from 'react-intl'
// import ConfigFile from './ServiceConfigFile'
import { loadConfigName, updateConfigName, configGroupName, deleteConfigName, changeConfigFile, getConfig, deleteConfig } from '../../actions/configs'
import { loadAppList } from '../../actions/app_manage'
import NotificationHandler from '../../components/Notification'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import unionWith from 'lodash/unionWith'
import isEqual from 'lodash/isEqual'
import UpdateConfigFileModal from './UpdateConfigFileModal'
import serviceIntl from './intl/serviceIntl'
import indexIntl from './intl/indexIntl'

function formatLinkContainer(data, groupname, name) {
  let linkContainer = []
  if (data.length == 0) return
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].services.length; j++) {
      if (data[i].services[j].spec.template.spec.volumes) {
        for (let k = 0; k < data[i].services[j].spec.template.spec.volumes.length; k++) {
          if (data[i].services[j].spec.template.spec.volumes[k].configMap && data[i].services[j].spec.template.spec.volumes[k].configMap.name == groupname) {
            if (!data[i].services[j].spec.template.spec.volumes[k].configMap.items) {
              linkContainer.push(data[i].services[j].metadata.name)
              continue
            }
            for (let l = 0; l < data[i].services[j].spec.template.spec.volumes[k].configMap.items.length; l++) {
              if (data[i].services[j].spec.template.spec.volumes[k].configMap.items[l].key == name) {
                linkContainer.push(data[i].services[j].metadata.name)
              }
            }
          }
        }
      }
    }
  }
  return linkContainer
}

function formatVolumeMounts(data, groupname, name) {
  let volumeMounts = []
  if (data.length == 0) return
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].services.length; j++) {
      let volumesMap = {}
      if (data[i].services[j].spec.template.spec.volumes) {
        for (let k = 0; k < data[i].services[j].spec.template.spec.volumes.length; k++) {
          let cm = data[i].services[j].spec.template.spec.volumes[k]
          if (cm.configMap && cm.configMap.name == groupname) {
            if (!data[i].services[j].spec.template.spec.volumes[k].configMap.items) {
              volumesMap[cm.name] = cm
              continue
            }
            for (let l = 0; l < data[i].services[j].spec.template.spec.volumes[k].configMap.items.length; l++) {
              if (data[i].services[j].spec.template.spec.volumes[k].configMap.items[l].key == name) {
                volumesMap[cm.name] = cm
              }
            }
          }
        }
      }
      let containers = data[i].services[j].spec.template.spec.containers
      for (var k in containers) {
        if (containers[k].volumeMounts) {
          for (var l in containers[k].volumeMounts) {
            if (volumesMap[containers[k].volumeMounts[l].name]) {
              const volumeMount = containers[k].volumeMounts[l]
              const configMap = volumesMap[containers[k].volumeMounts[l].name]
              if (configMap.configMap.items) {
                configMap.configMap.items.forEach(item => {
                  // If it's not whole directory mount, match the subPath
                  if (volumeMount.subPath) {
                    if (volumeMount.subPath === name) {
                      volumeMounts = unionWith(volumeMounts, [{
                        imageName: data[i].name,
                        serviceName: data[i].services[j].metadata.name,
                        mountPath: volumeMount.mountPath
                      }], isEqual)
                    }
                  } else {
                    volumeMounts = unionWith(volumeMounts, [{
                      imageName: data[i].name,
                      serviceName: data[i].services[j].metadata.name,
                      mountPath: volumeMount.mountPath
                    }], isEqual)
                  }
                })
              } else {
                volumeMounts = unionWith(volumeMounts, [{
                  imageName: data[i].name,
                  serviceName: data[i].services[j].metadata.name,
                  mountPath: volumeMount.mountPath
                }], isEqual)
              }
            }
          }
        }
      }
    }
  }
  return volumeMounts
}

class CollapseContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalConfigFile: false,
      configtextarea: '',
      checkConfigFile: false,
      defaultData: {}
      // collapseContainer: this.props.collapseContainer

    }
  }
  componentWillMount() {
    // 暂时不重新加载 group file 父组件已经返回了
    const { loadAppList, cluster } = this.props
    // this.props.loadConfigName(groupname)
    loadAppList(cluster)
  }

  editConfigModal(group, configName) {
    const self = this
    const { cluster, loadConfigName } = this.props
    // getConfig({
    //   configmap_name: group,
    //   cluster_id: cluster,
    //   config_name: configName,
    // }, {
    loadConfigName(cluster, { group, Name: configName }, {
      success: {
        func: res => {
          let tempState = {}
          if (!!res.data) {
            if (typeof res.data === 'string') {
              tempState = {
                modalConfigFile: true,
                configName: configName,
                configtextarea: res.data
              }
            } else {
              tempState = {
                modalConfigFile: true,
                configName: res.data.name || configName,
                configtextarea: res.data.data,
                defaultData: {
                  projectId: res.data.projectId || undefined,
                  defaultBranch: res.data.defaultBranch || undefined,
                  path: res.data.filePath || "",
                  enable: res.data.enable || 0
                }
              }
            }
          }
          self.setState(tempState)
        },
        isAsync: true
      }
    })
  }

  setInputValue(e) {
    this.setState({ configtextarea: e.target.value })
  }
  deleteConfigModal(group, Name) {
    this.setState({ configName: Name, configGroup: group, delModal: true })
  }
  deleteConfigFile() {
    const { intl } = this.props
    const { formatMessage } = intl
    let configs = []
    configs.push(this.state.configName)
    const self = this
    const { parentScope, deleteConfigName, cluster } = this.props
    const { configGroup, configName } = this.state
    const groups = {
      group: configGroup,
      cluster: cluster,
      configs
    }
    const query = {
      configmap_name: configGroup,
      cluster_id: cluster,
      config_name: configName
    }
    let notification = new NotificationHandler()
    this.setState({ delModal: false })
    deleteConfigName(groups, {
    // deleteConfig(query, {
      success: {
        func: res => {
          const errorText = []
          if (res.message.length > 0) {
            res.message.forEach(function (list) {
              errorText.push({
                name: list.name,
                text: list.error
              })
            })
            const content = errorText.map(list => {
              return <h3>{list.name} ：{list.text}</h3>
            })
            Modal.warning({
              title: formatMessage(serviceIntl.delConfigFailed),
              content
            })
          } else {
            notification.success(formatMessage(serviceIntl.delConfigSucc))
            this.props.loadData()
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.warn(formatMessage(serviceIntl.delConfigFailed))
        }
      }
    })
  }
  render() {
    const { collapseContainer, groupname, intl } = this.props
    const { formatMessage } = intl
    const self = this
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 21 } }
    let configFileList
    if (collapseContainer.length === 0) {
      return <div className="li" style={{ lineHeight: '60px', height: '10px' }}>{formatMessage(serviceIntl.noConfigs)}</div>
    }
    if (!collapseContainer) {
      return <div className="loadingBox">
          <Spin size="large" />
        </div>
    }

    configFileList = collapseContainer.map(configFileItem => {
      let mounts = null
      let volume = null
      let imageName = ''
      if (self.props.appList && self.props.appList.length > 0) {
        imageName = formatLinkContainer(self.props.appList, groupname, configFileItem.name)
        if (imageName.length == 0) {
          volume = <td style={{ textAlign: 'center' }}>
            <div>{formatMessage(indexIntl.onVolumeMounts)}</div>
          </td>
        } else {
          mounts = formatVolumeMounts(self.props.appList, groupname, configFileItem.name)
          volume = mounts.slice(0, 1).map((list, index) => {
            return <td key={intl.get("ServiceCollapseContainer.js-0.2098809752393429", {
              index: index
            }).d('key@ {index}  ')}>
                <div className="li">{formatMessage(serviceIntl.appTitle)}<Link to={`/app_manage/detail/${list.imageName}`}>{list.imageName}</Link>{formatMessage(serviceIntl.serviceTitle)}<Link to={`/app_manage/service?serName=${list.serviceName}`}>{list.serviceName}</Link></div>
                <Tooltip title={list.mountPath} placement="topLeft">
                  <div className="lis textoverflow">{list.mountPath}</div>
                </Tooltip>
              </td>
          })
        }
      } else {
        volume = <td style={{ textAlign: 'center' }}>
            <div>{formatMessage(indexIntl.onVolumeMounts)}</div>
          </td>
      }
      return <Timeline.Item key={configFileItem.name}>
          <Row className="file-item">
            <div className="line"></div>
            <table>
              <tbody>
                <tr>
                  <td className="title" style={{ padding: '15px' }}>
                    {configFileItem.branch || configFileItem.project ? <div style={{ width: '160px' }}>
                          <div>
                            <Tooltip title={configFileItem.name} placement="topLeft">
                              <div className="textoverflow">
                                <i className="fa fa-gitlab" aria-hidden="true" style={{ marginRight: '10px', marginTop: '3px' }}></i>
                                {configFileItem.name}
                              </div>
                            </Tooltip>
                          </div>
                          <div style={{ color: "#999", fontSize: "12px" }}>
                            {configFileItem.project && <Tooltip title={configFileItem.project} placement="left">
                              <div><span>{formatMessage(indexIntl.projectName)}</span><span className="textoverflow projectName">
                                {configFileItem.project}
                              </span></div>
                            </Tooltip>}
                            {configFileItem.branch && <Tooltip title={configFileItem.branch} placement="left">
                              <div><span>{formatMessage(indexIntl.branchName)}</span><span className="textoverflow branchName">{configFileItem.branch}</span></div>
                            </Tooltip>}
                          </div>
                        </div> : <div style={{ width: '160px' }} className="textoverflow">
                          <Icon type="file-text" style={{ marginRight: '10px', float: 'left', marginTop: '3px' }} />
                          <Tooltip title={configFileItem.name} placement="topLeft">
                            <div className="textoverflow">{configFileItem.name}</div>
                          </Tooltip>
                        </div>}
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <Button type="primary" style={{ height: '30px', padding: '0 9px' }} onClick={() => this.editConfigModal(this.props.groupname, configFileItem.name)}>
                      <Icon type="edit" />
                    </Button>
                    <Button type="ghost" onClick={() => this.deleteConfigModal(this.props.groupname, configFileItem.name)} style={{ marginLeft: '10px', height: '30px', padding: '0 9px', backgroundColor: '#fff' }} className="config-cross">
                      <Icon type="cross" />
                    </Button>
                  </td>
                  <td style={{ width: '130px' }}>
                    <div className="li">{formatMessage(indexIntl.associatedService)}<span className="node-number">{Array.from(new Set(imageName)).length}</span></div>
                    <div className="lis">{formatMessage(serviceIntl.mountPath)}</div>
                  </td>
                  {volume}

                  {mounts && mounts.length > 1 ? <td style={{ textAlign: 'center' }}>
                      <div style={{ cursor: 'pointer' }} onClick={() => {
                    this.setState({ [this.props.groupname + configFileItem.name]: true })
                  }}><a>{formatMessage(indexIntl.loadMore)}</a></div>
                    </td> : null}
                </tr>
              </tbody>
            </table>
            <Modal title={`${formatMessage(serviceIntl.configFile)} ${configFileItem.name}`} wrapClassName="server-check-modal" visible={this.state[this.props.groupname + configFileItem.name]} onCancel={() => {
            this.setState({ [this.props.groupname + configFileItem.name]: false })
          }} onOk={() => {
            this.setState({ [this.props.groupname + configFileItem.name]: false })
          }}>
              <div className="check-config-head">
                <div className="span4">{formatMessage(indexIntl.serviceName)}</div>
                <div className="span6">{formatMessage(serviceIntl.mountPath)}</div>
              </div>
                {}
                {mounts && mounts.slice(1).map((list, index) => {
              return <div className="check-config" key={index}>
                      <div className="span4"><Link to={`/app_manage/detail/${list.imageName}`}>{list.serviceName}</Link></div>
                      <div className="span6 textoverflow">
                        <Tooltip title={list.mountPath} placement="topLeft">
                          <span>{list.mountPath}</span>
                        </Tooltip>
                      </div>
                    </div>
                })}
                {}
            </Modal>
          </Row>
        </Timeline.Item>
    })
    const { modalConfigFile, defaultData } = this.state
    return <Row className="file-list">
        <Timeline>
          {configFileList}
        </Timeline>
        {}
        {modalConfigFile ? <UpdateConfigFileModal scope={this} modalConfigFile={modalConfigFile} defaultData={defaultData} /> : null}
        {}
        <Modal title={formatMessage(serviceIntl.delConfigTitle)} visible={this.state.delModal} onOk={() => this.deleteConfigFile()} onCancel={() => this.setState({ delModal: false })}>
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            {formatMessage(serviceIntl.delConfigContent, { name: this.state.configName })}
          </div>
        </Modal>
        {}
      </Row>
  }
}

CollapseContainer.propTypes = {
  // collapseContainer: PropTypes.array.isRequired,
  configGroupName: PropTypes.func.isRequired,
  loadConfigName: PropTypes.func.isRequired,
  deleteConfigName: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  groupname: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired
}
function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultConfigList = {
    isFetching: false,
    cluster: cluster.clusterID,
    configName: ''
  }
  const { configGroupList, loadConfigName } = state.configReducers
  const { configNameList, isFetching } = configGroupList[cluster.clusterID] || defaultConfigList
  const { appItems } = state.apps
  const { appList } = appItems[cluster.clusterID] || []
  return {
    cluster: cluster.clusterID,
    isFetching,
    configNameList,
    appList
  }
}

export default connect(mapStateToProps, {
  loadConfigName,
  updateConfigName,
  deleteConfigName,
  deleteConfig,
  configGroupName,
  loadAppList,
  getConfig
})(injectIntl(CollapseContainer, {
  withRef: true
}))