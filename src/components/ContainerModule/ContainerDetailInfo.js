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
import { Card, Tooltip, Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { cpuFormat, memoryFormat } from '../../common/tools'
import "./style/ContainerDetailInfo.less"

const mode = require('../../../configs/model').mode
const standard = require('../../../configs/constants').STANDARD_MODE
const enterpriseFlag = standard != mode

export default class ContainerDetailInfo extends Component {
  constructor(props) {
    super(props);
  }

  getMount(container) {
    let ele = []
    const volumes = container.spec.volumes
    if (container.spec.containers[0].volumeMounts) {
      container.spec.containers[0].volumeMounts.forEach((volume, index) => {
        let name = ''
        let mountPath = ''
        let volumeType = '分布式存储'
        if (volume.mountPath === '/var/run/secrets/kubernetes.io/serviceaccount') { return }
        let isShow = volumes.some(item => {
          if (item.name === volume.name) {
            if (item.configMap) {
              return false
            }
            if(item.rbd){
              name = item.rbd.image.split('.')[2]
              mountPath = volume.mountPath
            } else if(item.hostPath) {
              name = item.name
              volumeType = '本地存储'
              mountPath = item.hostPath.path
            }
            return true
          }
          return false
        })
        if (!isShow) return
        ele.push(
          <div key={name}>
            <div className="commonTitle">{name}</div>
            <div className="commonTitle" >{volumeType}</div>
            <div className="commonTitle" >{mountPath}</div>
            <div style={{ clear: "both" }}></div>
          </div>
        )
      })
    }
    return ele
  }
  getConfigMap(container) {
    let ele = []
    let volumes = container.spec.volumes
    let configMaps = []
    if (container.spec.containers[0].volumeMounts) {
      container.spec.containers[0].volumeMounts.forEach((volume) => {
        if (volume.mountPath === '/var/run/secrets/kubernetes.io/serviceaccount') { return }
        volumes.forEach(item => {
          if(!item) return false
          if (item.name === volume.name) {
            if (item.configMap) {
              item.configMap.items.forEach(configMap => {
                let arr = volume.mountPath.split('/')
                if(arr[arr.length - 1] == configMap.path) {
                  configMap.mountPath = volume.mountPath
                  configMap.configMapName = item.configMap.name
                  configMaps.push(configMap)
                }
              })
            }
          }
        })
      })
      console.log(configMaps)
      configMaps.forEach((item, index) => {
          ele.push(
            <div key={item.name + item.key + '-' + index}>
              <div className="commonTitle">{item.configMapName}</div>
              <div className="commonTitle">{item.key}</div>
              <div className="commonTitle">{item.mountPath}</div>
              <div style={{ clear: "both" }}></div>
            </div>
          )
      })
      return ele
    }
    return []
  }
  render() {
    const parentScope = this
    const { container } = this.props
    if (!container.spec.containers[0].resources.requests) {
      container.spec.containers[0].resources.requests = {}
    }
    return (
      <div id="ContainerDetailInfo">
        <div className="info commonBox">
          <span className="titleSpan">基本信息</span>
          <div className="titleBox">
            <div className="commonTitle">
              名称
          </div>
            <div className="commonTitle">
              镜像
          </div>
            {
              mode !== standard &&
              <div className="commonTitle">
              所属节点
              </div>
            }
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              {container.metadata.name}
            </div>
            <div className="commonTitle">
              {container.images.join(', ') || '-'}
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
          <span className="titleSpan">资源配置</span>
          <div className="titleBox">
            <div className="commonTitle">
              CPU
            </div>
            <div className="commonTitle">
              内存
            </div>
            <div className="commonTitle">
              系统盘
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              {cpuFormat(container.spec.containers[0].resources.requests.memory, container.spec.containers[0].resources) || '-'}
            </div>
            <div className="commonTitle">
              {memoryFormat(container.spec.containers[0].resources)}
            </div>
            <div className="commonTitle">
              10G
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
        </div>
        <div className="environment commonBox">
          <span className="titleSpan">环境变量</span>
          <div className="titleBox">
            <div className="commonTitle">
              变量名
              </div>
            <div className="commonTitle">
              变量值
              </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            {
              !!container.spec.containers[0].env ? container.spec.containers[0].env.map((env) => {
                return (
                  <div key={env.name}>
                    <div className="commonTitle">{env.name}</div>
                    <div className="commonTitle" style={{width:'66%'}}>{env.value}</div>
                    <div style={{ clear: "both" }}></div>
                  </div>
                )
              }) : null
            }
          </div>
        </div>
        <div className="storage commonBox">
          <span className="titleSpan">存储卷</span>
          <div className="titleBox">
            <div className="commonTitle">
              名称
              </div>
            <div className="commonTitle">
              存储类型
            </div>
            <div className="commonTitle">
              挂载点
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            {this.getMount(container)}
          </div>
        </div>
        <div className="storage commonBox">
          <span className="titleSpan">服务配置</span>
          <div className="titleBox">
            <div className="commonTitle">
              配置组
            </div>
            <div className="commonTitle">
              配置文件
            </div>
            <div className="commonTitle">
              挂载点
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
