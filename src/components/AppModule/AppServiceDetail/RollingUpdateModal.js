/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/26
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import './style/RollingUpdateModal.less'
import { DEFAULT_REGISTRY } from '../../../constants'
import {
  Button, Card, Menu, Icon, Tooltip, Row, Col, Radio,
  Select, InputNumber, Alert, Modal, Input, Tag,
 } from 'antd'
import { loadRepositoriesTags, loadWrapTags } from '../../../actions/harbor'
import { rollingUpdateService, rollingUpdateServiceRecreate } from '../../../actions/services'
import { getNetworkSolutions } from '../../../actions/cluster_node'
import { connect } from 'react-redux'
import NotificationHandler from '../../../components/Notification'
import ServiceCommonIntl, { AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'
import AppServerTag from './AppServerTag';
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { getServiceStatus } from '../../../common/status_identify'

const Option = Select.Option
const RadioGroup = Radio.Group

function loadTags(props, imageFullName) {
  const { loadRepositoriesTags, registry, harbor } = props
  loadRepositoriesTags(harbor, registry, imageFullName)
}

class RollingUpdateModal extends Component {
  constructor(props) {
    super(props)
    this.handleOK = this.handleOK.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.getVolumeTypeInfo = this.getVolumeTypeInfo.bind(this)
    this.isIpAddr = getDeepValue(props.service, [ 'spec', 'template', 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ])
    this.state = {
      containers: [],
      wrapTags: [],
      rollingInterval: false,
      rollingStrategy: this.isIpAddr || this.isCalico ? '3' : '1', // 分别对应取值 见 Options
      maxUnavailable: 1,
      maxSurge: 1,
      intervalTime: undefined,
    }
  }

  componentWillMount() {
  // componentWillReceiveProps(nextProps) {
    const { service, visible } = this.props
    if (!service) {
      return
    }
    /*if (visible) {
      return
    }*/
    const containers = getDeepValue(service, [ 'spec', 'template', 'spec', 'containers' ]) || ''
    const temp1 = getDeepValue(service, [ 'spec', 'strategy', 'rollingUpdate', 'maxSurge' ])
    const temp2 = getDeepValue(service, [ 'spec', 'strategy', 'rollingUpdate', 'maxUnavailable' ])
    const isStaticIP = getDeepValue(service, [ 'spec', 'template', 'metadata', 'annotations', 'system/reservedIps' ]) && true || false
    let maxUnavailable = 1
    let maxSurge = 1
    const rollingStrategy = (() => {
      if (this.isIpAddr || this.isCalico) {
        return '3'
      }
      if (isStaticIP) {
        return '2'
      }
      if (!isNaN(temp1) && !isNaN(temp2)) {
        if (temp1 !== 0 && temp2 !== 0) {
          maxSurge = temp1
          maxUnavailable = temp2
          return '4'
        } else if (temp1 === 0 && temp2 !== 0) {
          maxSurge = 1
          maxUnavailable = temp2
          return '2'
        } else if (temp1 !== 0 && temp2 === 0) {
          maxSurge = temp1
          maxUnavailable = 1
          return '1'
        }
      } else {
        return '1'
      }
    })()
    containers.map(container => {
      let { image } = container
      let tagIndex = image.lastIndexOf(':')
      if(tagIndex < 0) {
        tagIndex = image.length
      }
      let tag = image.substr(tagIndex + 1)
      let imageSrc = image.substring(0, tagIndex)
      let fullName = image.substring(image.indexOf('/') + 1, tagIndex)
      container.imageObj = {
        tag,
        imageSrc,
        fullName,
      }
    })

    this.setState({
      containers,
      rollingStrategy,
      maxSurge,
      maxUnavailable,
    })
    // if (!visible || visible === this.props.visible) {
    //   return
    // }
    this.setState({
      intervalTime: service.spec.minReadySeconds,
    })
    if (service.wrapper) {
      this.getWrapTags()
      return
    }
    containers.map((container) => {
      let { imageObj } = container
      loadTags(this.props, imageObj.fullName)
    })
  }

  async componentDidMount() {
    const { service } = this.props
    const { formatMessage } = this.props.intl
    if (service && service.status.phase === 'RollingUpdate') {
      this.handleCancel()
      Modal.info({
        title: formatMessage(AppServiceDetailIntl.confirmPublished),
        width: 480,
        content: (
          <div>
            {formatMessage(AppServiceDetailIntl.confirmPublishedAfter)}
          </div>
        ),
        onOk() {},
      })
    }
    const incloudPrivate = this.getVolumeTypeInfo()
    if (incloudPrivate) {
      this.setState({
        rollingStrategy: '3',
      })
    }
    await this.props.getNetworkSolutions(this.props.cluster)
    this.isCalico = this.props.currentNetType === 'calico'
  }

  getWrapTags() {
    const { service, harbor } = this.props
    const wrap = service.wrapper.appPkgName.split('.')
    const body = {
      filename: wrap[0],
      filetype: wrap[1],
    }
    this.props.loadWrapTags(harbor, body,{
      success:{
        func:(res)=> {
          this.setState({wrapTags: res.data})
        }
      },
    })
  }
  handleCancel() {
    const { parentScope } = this.props
    parentScope.setState({
      rollingUpdateModalShow: false
    })
  }

  handleOK() {
    /*const { parentScope } = this.props
    parentScope.setState({
      rollingUpdateModalShow: false
    })*/
    const {
      parentScope,
      cluster,
      service,
      appName,
      loadServiceList,
      rollingUpdateService,
      rollingUpdateServiceRecreate,
    } = this.props
    const { formatMessage } = this.props.intl
    const { containers, rollingStrategy, maxSurge, maxUnavailable } = this.state
    const serviceName = service.metadata.name
    const targets = {}
    let count = 0
    containers.forEach((container) => {
      if(!container.targetTag) {
        count++
        return
      }
      targets[container.name] = `${container.imageObj.imageSrc}:${container.targetTag}`
    })
    let notification = new NotificationHandler()
    const status = getServiceStatus(service)
    const { replicas } = status
    const temp_count = parseInt(replicas)
    if ((!maxSurge && rollingStrategy === '1') || (!maxUnavailable && rollingStrategy === '2')) {
      notification.error(formatMessage(AppServiceDetailIntl.noeachcounthint))
      return
    }
    if (maxSurge > temp_count || maxUnavailable > temp_count) {
      notification.warn(formatMessage(AppServiceDetailIntl.batchUpdateCountHint))
      return
    }
    if (count === containers.length) {
      notification.warn(formatMessage(AppServiceDetailIntl.AtleastVersion))
      return
    }
    if (rollingStrategy !== '3' && !this.isIpAddr && !this.isCalico) {
      // 统一间隔时间
      const intervalTime = this.state.intervalTime
      if (intervalTime > 600) {
        notification.warn(formatMessage(AppServiceDetailIntl.updateIntervalTimeCannot))
        return
      }
      if (!intervalTime) {
        notification.error(formatMessage(AppServiceDetailIntl.fillin260stimes))
        return
      }
      if (!/[0-9]+/.test(intervalTime)) {
        notification.error(formatMessage(AppServiceDetailIntl.fillin260sNumbers))
        return
      }
      if (intervalTime < 2) {
        notification.error(formatMessage(AppServiceDetailIntl.fillin260sNumbers))
        return
      }

      let maxSurge,
        maxUnavailable
      if (rollingStrategy === '1') {
        maxSurge = this.state.maxSurge.toString()
        maxUnavailable = '0'
      } else if (rollingStrategy === '2') {
        maxSurge = '0'
        maxUnavailable = this.state.maxUnavailable.toString()
      } else if (rollingStrategy === '3') {
        // maxSurge = 0
        // maxUnavailable = max
      } else if (rollingStrategy === '4') {
        if (this.state.maxSurge === undefined) {
          notification.error(formatMessage(AppServiceDetailIntl.maxSurgeMsg1))
          return
        }
        if (this.state.maxUnavailable === undefined) {
          notification.error(formatMessage(AppServiceDetailIntl.maxUnavailableMsg1))
          return
        }
        const tempMaxSurge = this.state.maxSurge.toString()
        const tempMaxUnavailable = this.state.maxUnavailable.toString()
        if (tempMaxSurge === '0' && tempMaxUnavailable === '0') {
          notification.error(formatMessage(AppServiceDetailIntl.maxSurgeMsg))
          return
        }
        maxSurge = tempMaxSurge
        maxUnavailable = tempMaxUnavailable
      }
      const hide = notification.spin(formatMessage(AppServiceDetailIntl.saving), 0)
      notification.spin(formatMessage(AppServiceDetailIntl.servicePublishRoll, { serviceName }))
      const body = {
        type: 0,
        targets,
        interval: parseInt(intervalTime),
        onlyRollingUpdate: true,
        maxSurge,
        maxUnavailable,
      }
      if (service.wrapper) {
        const wrapfile = this.state.wrap.split('||')
        body.type = 1
        body.targets = {
          [wrapfile[0]]: wrapfile[1]
        }
      }
      rollingUpdateService(cluster, serviceName, body, {
        success: {
          func: () => {
            notification.close()
            loadServiceList(cluster, appName)
            setTimeout(function () {
              notification.success(formatMessage(AppServiceDetailIntl.servicePublishSuccess, { serviceName }))
            }, 300)
            parentScope.setState({
              rollingUpdateModalShow: false
            })
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            notification.close()
            setTimeout(function () {
              notification.error(formatMessage(AppServiceDetailIntl.servicePublishFailure, { serviceName }))
            }, 300)
          },
          isAsync: true,
        }
      })
    } else {
      const body = {
        containers: Object.keys(targets).map(name => {
          return {
            name,
            image: targets[name],
          }
        }),
      }
      rollingUpdateServiceRecreate(cluster, serviceName, body, {
        success: {
          func: () => {
            notification.close()
            loadServiceList(cluster, appName)
            setTimeout(() => {
              notification.success(formatMessage(AppServiceDetailIntl.servicePublishSuccess, { serviceName }))
            }, 300)
            parentScope.setState({
              rollingUpdateModalShow: false,
            })
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            notification.close()
            setTimeout(() => {
              notification.error(formatMessage(AppServiceDetailIntl.servicePublishFailure, { serviceName }))
            }, 300)
          },
        },
        isAsync: true,
      })
    }
  }

  handleTagChange(value, item) {
    const { containers } = this.state
    containers.map((container) => {
      if (container.name === item.name) {
        container.targetTag = value
      }
    })
    this.setState({
      wrap: value,
      containers,
    })
  }
  getintervalTime(value) {
    const { containers } = this.state
    if (containers.length < 2 || this.state.rollingInterval === false) {
      this.setState({
        intervalTime: value,
      })
      return
    }
  }

  switchType(c) {
    this.setState({
      rollingInterval: c,
    })
  }

  getVolumeTypeInfo(){
    const { service } = this.props
    let incloudPrivate = false
    const { volumeTypeList } = service
    for(let i = 0; i < volumeTypeList.length; i++){
      if(volumeTypeList[i] == 'private'){
        incloudPrivate = true
        break
      }
    }
    return incloudPrivate
  }
  handleStrategyChange(value) {
    this.setState({
      rollingStrategy: value,
    })
  }
  render() {
    const { formatMessage } = this.props.intl
    const { service, visible } = this.props
    if (!visible) {
      return null
    }
    const { containers, rollingStrategy, maxUnavailable, maxSurge } = this.state
    if(!service) {
      return <div></div>
    }
    if (service.status.phase === 'RollingUpdate') {
      return null
    }
    const minReadySeconds = service.spec.minReadySeconds
    const count = containers.length
    const isOnly = count > 1 ? false : true
    const incloudPrivate = this.getVolumeTypeInfo()
    const os = getDeepValue(service, [ 'spec', 'template', 'metadata', 'annotations', 'imagetagOs' ]) || ''
    const arch = getDeepValue(service, [ 'spec', 'template', 'metadata', 'annotations', 'imagetagArch' ]) || ''
    const showOs = (() => {
      if (os && arch) {
        const array = os.split('')
        array[0] = array[0].toUpperCase()
        const osStr = array.join('')
        const showArch = arch.toUpperCase()
        if (os === 'windows') {
          return <div>
            <Button className="btnOs" size="small" type="ghost">{osStr} {showArch}</Button>
          </div>
        } else if (os === 'linux') {
          return <div>
            <Button className="btnOs" size="small" type="ghost">{osStr} {showArch}</Button>
          </div>
        }
      }
    })()
    const status = getServiceStatus(service)
    const { replicas } = status
    const temp_count = parseInt(replicas)
    const isStaticIP = getDeepValue(service, [ 'spec', 'template', 'metadata', 'annotations', 'system/reservedIps' ]) && true || false
    return (
      <Modal
        visible={visible}
        maskClosable={false}
        title={formatMessage(AppServiceDetailIntl.rollPublish)} onOk={this.handleOK} onCancel={this.handleCancel}
        footer={[
          <Button
            key="back" type="ghost" size="large" onClick={this.handleCancel}>
            {formatMessage(ServiceCommonIntl.cancel)}
          </Button>,
          <Button
            key="submit" type="primary" size="large" loading={this.state.loading}
            onClick={this.handleOK}
            // disabled={incloudPrivate}
          >
            {formatMessage(ServiceCommonIntl.save)}
          </Button>
        ]}>
        <div id="RollingUpdateModal">
          {
            count > 1 && (
              <Alert message={formatMessage(AppServiceDetailIntl.k8sContainerRollPublish)} type="info" />
            )
          }
          {/*
            incloudPrivate && <div className='alertRow'>{formatMessage(AppServiceDetailIntl.noSupportRollPublish)}</div>
          */}
          <div className="alertRow">
            {formatMessage(AppServiceDetailIntl.rollPublishAlertRow)}。
            {formatMessage(AppServiceDetailIntl.rollPublishAlertRowAfter)}
          </div>
          <Row>
            <Col span={6}>{formatMessage(AppServiceDetailIntl.serviceName)}</Col>
            <Col className="itemBody" span={18}>
              {service.metadata.name}
            </Col>
          </Row>
          <Row>
            <Col span={6}>{formatMessage(AppServiceDetailIntl.os)}</Col>
            <Col className="itemBody" span={18}>
              {showOs}
            </Col>
          </Row>
          {containers.map((item, index) => {
            let imageTags = this.props[item.imageObj.fullName]
            imageTags = imageTags && imageTags.tagWithOS || []
            let start = item.image.lastIndexOf(":")
            let tag, image
            if(start >= 0) {
              tag = item.image.substring(start + 1)
              image = item.image.substring(0, start)
            } else {
              image = item.image
              tag = "latest"
            }
            let show = image
            let showText = formatMessage(AppServiceDetailIntl.mirrorVersion)
            if(image.length > 40) show = image.substring(0, 40) + "..."
            if (service.wrapper) {
              show = service.wrapper.appPkgName
              tag = service.wrapper.appPkgTag
              showText = formatMessage(AppServiceDetailIntl.appPackage)
            }
            return [
              <Row key="old-tag" className="old-tag">
                <Col span={6}>
                {showText}
                </Col>
                <Tooltip title={item.image}>
                  <Col className={'textoverflow'} span={18}>
                  {show}:
                  <Tag>{tag}</Tag>
                  </Col>
                </Tooltip>
              </Row>,
              <Row key="target-tag">
                <Col span={6}>
                  {formatMessage(AppServiceDetailIntl.targetVersion)}
                </Col>
                <Col span={10}>
                  <Select
                    placeholder={formatMessage(AppServiceDetailIntl.pleaseChoiceVersion)}
                    value={item.targetTag}
                    onChange={(value) => this.handleTagChange(value, item)}
                  >
                  {// app wrap
                    service.wrapper ?
                    this.state.wrapTags.map((item, index) => {
                      return <Option
                        value={item.fileName +'.'+ item.fileType + ':'+item.fileTag+'||'+item.iD}
                        disabled={item.fileTag == tag}
                        key={index}
                        title={item.fileTag}
                      >
                        {item.fileTag}
                      </Option>
                    })
                    :
                    <Select.OptGroup label={formatMessage(AppServiceDetailIntl.pleaseChoiceVersion)}>
                      {
                        imageTags.map(tag => {
                          let disabled = false
                          if (tag.name === item.imageObj.tag) {
                            disabled = true
                          }
                          return (
                            <Option disabled={disabled || tag.os !== os} key={tag.name} value={tag.name} title={tag.name}>
                              {tag.name}
                            </Option>
                          )
                        })
                      }
                    </Select.OptGroup>
                  }
                  </Select>
                </Col>
              </Row>,
            ]
          })}
          <Row key="rollingStrategy">
            <Col span={6}>
              {formatMessage(AppServiceDetailIntl.rollingStrategy)}&nbsp;
            </Col>
            <Col span={12}>
              <Select
                placeholder={formatMessage(AppServiceDetailIntl.rollingStrategyPlaceholder)}
                value={rollingStrategy}
                onChange={value => this.handleStrategyChange(value)}
              >
                <Option disabled={this.isIpAddr || this.isCalico || incloudPrivate || isStaticIP} value="1" >{formatMessage(AppServiceDetailIntl.rollingStrategy1)}</Option>
                <Option disabled={this.isIpAddr || this.isCalico || incloudPrivate} value="2" >{formatMessage(AppServiceDetailIntl.rollingStrategy2)}</Option>
                <Option value="3">{formatMessage(AppServiceDetailIntl.rollingStrategy3)}</Option>
                <Option disabled={this.isIpAddr || this.isCalico || incloudPrivate || isStaticIP} value="4">{formatMessage(AppServiceDetailIntl.rollingStrategy4)}</Option>
              </Select>
            </Col>
          </Row>
          {
            rollingStrategy !== '3' ?
              [
                (() => {
                  return rollingStrategy === '4' ?
                    <Row className="batchRow" key="batchUpdate">
                      <Col span={6}>
                        {formatMessage(AppServiceDetailIntl.batchUpdateLabel)}&nbsp;
                      </Col>
                      <Col span={14}>
                        <div className="numberWap">
                          {formatMessage(AppServiceDetailIntl.maxSurge)}&nbsp;<InputNumber
                            onChange={maxSurge => this.setState({
                              maxSurge,
                            })}
                            step={1}
                            value={maxSurge}
                            min={0}
                            max={temp_count}
                          />&nbsp;{formatMessage(AppServiceDetailIntl.maxUnavailable)}
                          &nbsp;<InputNumber
                            onChange={maxUnavailable => this.setState({
                              maxUnavailable,
                            })}
                            step={1}
                            value={maxUnavailable}
                            min={0}
                            max={temp_count}
                          />
                        </div>
                      </Col>
                    </Row>
                    :
                    <Row className="batchRow" key="batchUpdate">
                      <Col span={6}>
                        {formatMessage(AppServiceDetailIntl.batchUpdateLabel)}&nbsp;
                      </Col>
                      <Col span={12}>
                        <div className="numberWap">
                          {formatMessage(AppServiceDetailIntl.everyTime)}&nbsp;<InputNumber
                            onChange={count => {
                              const temp = {}
                              if (rollingStrategy === '1') {
                                temp.maxSurge = count
                              } else if (rollingStrategy === '2') {
                                temp.maxUnavailable = count
                              }
                              this.setState(temp)
                            }}
                            value={rollingStrategy === '1' ? maxSurge : maxUnavailable}
                            min={1}
                            max={temp_count}
                          />&nbsp;/ {temp_count}{formatMessage(AppServiceDetailIntl.count)}
                        </div>
                      </Col>
                    </Row>
                })(),
                <Row key="minReadySeconds">
                  <Col span={6}>
                    {formatMessage(AppServiceDetailIntl.updateIntervalTime)}&nbsp;
                    <Tooltip title="容器实例升级时间间隔，例如若为 0 秒，则 Pod 在 Ready 后就会被认为是可用状态，继续升级">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </Col>
                  <Col span={10}>
                    <InputNumber
                      min={0}
                      max={599}
                      style={{ width: 191 }}
                      placeholder={formatMessage(AppServiceDetailIntl.suggest260s)}
                      defaultValue={ minReadySeconds ? minReadySeconds : 0 }
                      onChange={value => this.getintervalTime(value)}
                    />
                  </Col>
                  <Col span={1}>&nbsp;秒</Col>
                </Row>
              ]
              :
              null
          }
        </div>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const {
    imageTags
  } = state.harbor
  let targetImageTag = imageTags[DEFAULT_REGISTRY] || {}
  const { cluster_nodes: { networksolutions } } = state

  const { cluster } =  state.entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    registry: DEFAULT_REGISTRY,
    harbor,
    cluster: cluster.clusterID,
    currentNetType: networksolutions[cluster.clusterID] && networksolutions[cluster.clusterID].current,
    ...targetImageTag
  }
}

export default injectIntl(connect(mapStateToProps, {
  loadRepositoriesTags,
  loadWrapTags,
  rollingUpdateService,
  rollingUpdateServiceRecreate,
  getNetworkSolutions,
})(RollingUpdateModal), { withRef: true, })
