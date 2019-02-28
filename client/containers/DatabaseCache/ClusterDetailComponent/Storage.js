/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Storage container
 *
 * v0.1 - 2018-07-12
 * @author zhouhaitao
 */

import React from 'react'
import './style/Storage.less'
import { Button, Icon, Modal, Row, Col, Slider, InputNumber, Tooltip } from 'antd'
import graphCluster from '../../../assets/img/database_cache/cluster.png'
import graphStorage from '../../../assets/img/database_cache/storage.png'
import { parseAmount } from '../../../../src/common/tools'
import { connect } from 'react-redux'
import NotificationHandler from '../../../../src/components/Notification'
import * as storageActions from '../../../../src/actions/database_cache'
import TenxIcon from '@tenx-ui/icon/es/_old'
const notification = new NotificationHandler()

class Storage extends React.Component {
  state = {
    extendModal: false,
    volumeSizemin: 512,
    volumeSize: 512,
    storage: 0,
  }
  componentDidMount() {
    let size = this.props.databaseInfo.storage
    if (size.indexOf('Mi') >= 0) {
      size = parseInt(size) / 1024
    }
    this.setState({
      storage: parseFloat(size) || 0,
      volumeSizemin: parseFloat(size) || 0,
      volumeSize: parseFloat(size) || 0,
    })
  }
  showExtendModal = () => {
    this.setState({
      extendModal: true,
    })
  }
  confirmExtend = () => {
    const { cluster, databaseInfo, database, expendDatabaseCluster } = this.props
    const data = {
      expandedSize: `${this.state.volumeSize}Gi`,
    }
    expendDatabaseCluster(cluster.clusterID,
      database, databaseInfo.objectMeta.name, data, {
        success: {
          func: res => {
            if (database === 'redis') {
              this.setState({
                storage: parseFloat(res.data.spec.expandedSize),
                volumeSizemin: parseFloat(res.data.spec.expandedSize),
                volumeSize: parseFloat(res.data.spec.expandedSize),
              })
            } else if (database === 'mysql' || database === 'rabbitmq' || database === 'mongodbreplica') {
              this.setState({
                storage: parseFloat(res.data.expandedSize),
                volumeSizemin: parseFloat(res.data.expandedSize),
                volumeSize: parseFloat(res.data.expandedSize),
              })

            }
            notification.success('扩容成功')
          },
        },
        failed: {
          func: () => { notification.warn('扩容失败') },
        },
      })
    this.setState({
      extendModal: false,
    })

  }
  changeVolumeSizeSlider(size) {
    const { volumeSizemin } = this.state
    if (size < volumeSizemin) {
      size = volumeSizemin
    }
    if (size > 20480) {
      size = 20480
    }
    this.setState({
      volumeSize: size,
    })
  }

  changeVolumeSizeInputNumber(number) {
    const { volumeSizemin } = this.state
    if (number < volumeSizemin) {
      number = volumeSizemin
    }
    this.setState({
      volumeSize: number,
    })
  }

  render() {
    const { cluster, databaseInfo, database } = this.props
    const resourcePrice = cluster.resourcePrice
    const storagePrice = resourcePrice.storage / 10000
    const hourPrice = parseAmount(this.state.volumeSize / 1024 * resourcePrice.storage, 4)
    const countPrice = parseAmount(
      this.state.volumeSize / 1024 * resourcePrice.storage * 24 * 30, 4)
    const replicasNum = databaseInfo.replicas ? databaseInfo.replicas : 0
    return <div className="dbClustetStorage">
      <div className="tips">
        Tips: 扩容后，需要重启集群才能生效。
      </div>
      <div className="title">存储</div>
      <div className="extendBtn">
        <Button type="primary" disabled={databaseInfo.status !== 'Stopped'} onClick={this.showExtendModal}>
          <TenxIcon type="expansion"/>
          <span style={{ marginLeft: 5 }}>扩容</span>
        </Button>
        {
          (databaseInfo.status !== 'Stopped') &&
          <span className="tip">
            <Icon type="info-circle-o" />
            停止集群后可做扩容操作
          </span>
        }

      </div>
      <div className="graph">
        <div className="cluster">
          <div className="clusterName">
            {database === 'mongodbreplica' ? 'mongoDB' : database}集群：<Tooltip placement="topLeft" title={databaseInfo.objectMeta.name}>
              <span>{databaseInfo.objectMeta.name}</span>
            </Tooltip>
          </div>
          <div className="graphCluster">
            <img src={graphCluster} alt=""/>
            <div className="name">{replicasNum}个容器实例</div>
          </div>
        </div>
        <div className="line"></div>
        <div className="graphStorage">
          <img src={graphStorage} alt=""/>
          <div className="name">{replicasNum}个存储卷： {replicasNum} <Icon type="cross"/> { this.state.storage || 0 }GB</div>
        </div>
      </div>
      <Modal
        title="扩容存储卷"
        visible={this.state.extendModal}
        onOk={this.confirmExtend}
        onCancel={() => {
          this.setState({
            extendModal: false,
          })
        }}
      >
        <div className="extend-storage">
          <Row className="volumeSize">
            <Col span={2} className="name-text-center size">
              大小
            </Col>
            <Col span={15}>
              <Slider
                min={this.state.volumeSizemin}
                max={20}
                step={0.5}
                defaultValue={this.state.volumeSizemin}
                onChange={size => this.changeVolumeSizeSlider(size)}
                value={this.state.volumeSize}
              />
            </Col>
            <Col span={6} className="inputbox">
              <InputNumber
                min={this.state.volumeSizemin}
                max={20}
                step={0.5}
                defaultValue={this.state.volumeSizemin}
                value={this.state.volumeSize}
                onChange={number => this.changeVolumeSizeInputNumber(number)}
              />
              <span style={{ paddingLeft: 10 }} >GB</span>
            </Col>
          </Row>
          <div className="modal-price">
            <div className="price-left">
              存储：{hourPrice.unit === '￥' ? '￥' : ''}{ storagePrice } {hourPrice.unit === '￥' ? '' : ' T'}/(GB*小时)
            </div>
            <div className="price-unit">
              <p>合计：<span className="unit">{hourPrice.unit === '￥' ? '￥' : ''}</span><span className="unit blod">{ hourPrice.amount }{hourPrice.unit === '￥' ? '' : ' T'}/小时</span></p>
              <p><span className="unit">（约：</span><span className="unit">{ countPrice.fullAmount }/月）</span></p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  }
}
function mapStateToProps(state) {
  const { cluster } = state.entities.current
  const { namespace } = state.entities.loginUser.info
  const { billingConfig } = state.entities.loginUser.info
  const clusterID = cluster.clusterID
  const { enabled: billingEnabled } = billingConfig
  return {
    cluster,
    clusterID,
    billingEnabled,
    namespace,
  }
}

export default connect(mapStateToProps, {
  expendDatabaseCluster: storageActions.expendDatabaseCluster,
})(Storage)
