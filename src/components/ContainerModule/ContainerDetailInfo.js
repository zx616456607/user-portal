/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerDetailInfo component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, Tooltip, Icon, Row, Col, Select } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { cpuFormat, memoryFormat } from '../../common/tools'
import "./style/ContainerDetailInfo.less"
import { FormattedMessage } from 'react-intl'
import IntlMessages from './ContainerDetailIntl'
import AppServiceDetailIntl from "../AppModule/ServiceIntl/AppServiceDetailIntl";
import {getDeepValue} from "../../../client/util/util";

const mode = require('../../../configs/model').mode
const standard = require('../../../configs/constants').STANDARD_MODE
const enterpriseFlag = standard != mode

export default class ContainerDetailInfo extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    containerIndex: '0',
  }
  getMount(container) {
    const { containerIndex } = this.state
    const { formatMessage } = this.props.intl
    const volumes = container.spec.volumes || []
    const volumeMounts = container.spec.containers[containerIndex].volumeMounts || []
    return volumes.map((item, index) => {
      let type = '-'
      let name = '-'
      let volumeIndex = item.name
      let mountPath = '-'
      if (item.hostPath || item.persistentVolumeClaim || item.rbd) {
        // 确定存储类型和存储名称
        if (item.hostPath) {
          type = '本地存储'
          name = '-'
        } else if (item.persistentVolumeClaim) {
          name = item.persistentVolumeClaim.claimName
          const annotations = container.metadata.annotations
          for (let key in annotations) {
            let index = volumeIndex.replace('-', '')
            if (key == index) {
              if (annotations[key] == 'private') {
                type = '独享型（rbd）'
              } else if (annotations[key] == 'share') {
                type = '共享型（nfs）'
              } else {
                type = '-'
              }
              break
            }
          }
        } else if (item.rbd) {
          type = '独享型（rbd）'
          let imageArray = item.rbd.image.split('.')
          name = imageArray[imageArray.length - 1]
        }
        // 确定容器目录
        for (let i = 0; i < volumeMounts.length; i++) {
          if (volumeMounts[i].name == volumeIndex) {
            mountPath = volumeMounts[i].mountPath
            break
          }
        }
        if((type == '本地存储' && mountPath == '/etc/localtime') || (type == '本地存储' && mountPath == '/etc/timezone')){
          return null
        }
        let typeText
        switch (type) {
          case '本地存储':
            typeText = formatMessage(IntlMessages.localStorage)
            break
          case '独享型（rbd）':
            typeText = formatMessage(IntlMessages.rbdStorage)
            break
          case '共享型（nfs）':
            typeText = formatMessage(IntlMessages.nfsStorage)
            break
          default:
            typeText = '-'
            break
        }
        return <Row key={`volume${index}`}>
          <Col span='8' className='commonTitle'>{typeText}</Col>
          <Col span='8' className='commonTitle'>{name}</Col>
          <Col span='8' className='commonTitle'>{mountPath}</Col>
        </Row>
      } else {
        return null
      }
    })
  }
  getConfigMap(container) {
    const { containerIndex } = this.state
    let ele = []
    let volumes = container.spec.volumes
    let configMaps = []
    const { formatMessage } = this.props.intl
    if (container.spec.containers[containerIndex].volumeMounts) {
      container.spec.containers[containerIndex].volumeMounts.forEach((volume) => {
        if (volume.mountPath === '/var/run/secrets/kubernetes.io/serviceaccount') { return }
        volumes.forEach(item => {
          if(!item) return false
          if (item.name === volume.name) {
            if (item.configMap) {
              if (item.configMap.items) {
                item.configMap.items.forEach(configMap => {
                  let arr = volume.mountPath.split('/')
                  if(arr[arr.length - 1] == configMap.path) {
                    configMap.mountPath = volume.mountPath
                    configMap.configMapName = item.configMap.name
                    configMaps.push(configMap)
                  }
                })
              } else {
                configMaps.push({
                  mountPath: volume.mountPath,
                  key: formatMessage(IntlMessages.allConfigGroupMounted),
                  configMapName: item.configMap.name,
                })
              }
            }
          }
        })
      })
      configMaps.forEach((item, index) => {
        ele.push(
          <div key={item.name + item.key + '-' + index}>
            <div className="commonTitle"><Link to="/app_manage/configs">{item.configMapName}</Link></div>
            <div className="commonTitle">{item.key}</div>
            <div className="commonTitle">{item.mountPath}</div>
            <div style={{ clear: "both" }}></div>
          </div>
        )
      })
      return ele
    }
  }
  renderEnvValue = env => {
    if (env && env.value) {
      return (
        <div key={env.name}>
          <div className="commonTitle">{env.name}</div>
          <div className="commonTitle" style={{width:'66%'}}>{env.value}</div>
          <div style={{ clear: "both" }}></div>
        </div>
      )
    }
    if (env && env.valueFrom && env.valueFrom.secretKeyRef) {
      const { formatMessage } = this.props.intl
      const { name, key } = env.valueFrom.secretKeyRef
      const nv = `${name}/${key}`
      return (
        <div key={env.name}>
          <div className="commonTitle">{env.name}</div>
          <div className="commonTitle" style={{width:'66%'}}>
            <span>
              <Tooltip title={formatMessage(AppServiceDetailIntl.encryptionVariable)} placement="top">
                <a><i className="fa fa-key" /></a>
              </Tooltip>&nbsp;
              <Tooltip title={nv} placement="topLeft">
                <span>{nv}</span>
              </Tooltip>
            </span>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      )
    }
    return null
  }
  render() {
    const { containerIndex } = this.state
    const { container } = this.props
    if (!container.spec.containers[containerIndex].resources.requests) {
      container.spec.containers[containerIndex].resources.requests = {}
    }
    const conList = container.spec.containers || []
    return (
      <div id="ContainerDetailInfo">
        <div>
          容器:&nbsp;&nbsp;
          <Select
            style={{ minWidth: 120 }}
            value={containerIndex}
            onChange={v => this.setState({ containerIndex: v })}
          >
            {
              conList.map((c, i) => <Select.Option value={i + ''} key={c.name + i}>{c.name}</Select.Option>)
            }
          </Select>
        </div>
        <div className="info commonBox">
          <span className="titleSpan">
          <FormattedMessage {...IntlMessages.basic} />
          </span>
          <div className="titleBox">
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.image} />
          </div>
            {
              mode !== standard &&
              <div className="commonTitle">
              <FormattedMessage {...IntlMessages.node} />
              </div>
            }
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              {getDeepValue(container, `spec.containers.${containerIndex}.image`.split('.'))}
            </div>
            {
              mode !== standard &&
              <div className="commonTitle">
                {container.status.hostIP}
              </div>
            }
            <div style={{ clear: "both" }}></div>
          </div>
        </div>
        <div className="compose commonBox">
          <span className="titleSpan">
              <FormattedMessage {...IntlMessages.resources} />
            </span>
          <div className="titleBox">
            <div className="commonTitle">
              CPU
            </div>
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.memory} />
            </div>
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.sysDisk} />
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              {cpuFormat(container.spec.containers[containerIndex].resources.requests.memory, container.spec.containers[containerIndex].resources) || '-'}
            </div>
            <div className="commonTitle">
              {memoryFormat(container.spec.containers[containerIndex].resources)}
            </div>
            <div className="commonTitle">
              10G
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
        </div>
        <div className="environment commonBox">
          <span className="titleSpan">
            <FormattedMessage {...IntlMessages.env} />
          </span>
          <div className="titleBox">
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.envKey} />
              </div>
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.envValue} />
              </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            {
              !!container.spec.containers[containerIndex].env ? container.spec.containers[containerIndex].env.map(this.renderEnvValue) : null
            }
          </div>
        </div>
        <div className="storage commonBox">
          <span className="titleSpan">
            <FormattedMessage {...IntlMessages.volume} />
          </span>
          <div className="titleBox">
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.volumeType} />
              </div>
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.volume} />
            </div>
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.mountPath} />
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            {this.getMount(container)}
          </div>
        </div>
        <div className="storage commonBox">
          <span className="titleSpan">
          <FormattedMessage {...IntlMessages.config} />
          </span>
          <div className="titleBox">
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.configGroup} />
            </div>
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.configFile} />
            </div>
            <div className="commonTitle">
              <FormattedMessage {...IntlMessages.mountPoint} />
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            {this.getConfigMap(container)}
          </div>
        </div>
      </div>
    )
  }
}

ContainerDetailInfo.propTypes = {
  //
}
