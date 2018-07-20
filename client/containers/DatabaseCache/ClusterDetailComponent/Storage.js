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
import { Button, Icon, Modal, Row, Col, Slider, InputNumber } from 'antd'
import graphCluster from '../../../assets/img/database_cache/cluster.png'
import graphStorage from '../../../assets/img/database_cache/storage.png'
import extend from '../../../assets/img/database_cache/extend.png'
// import extendDisabled from '../../../assets/img/database_cache/extend-disabled.png'
import { parseAmount } from '../../../../src/common/tools'
import { connect } from 'react-redux'

class Storage extends React.Component {
  state = {
    extendModal: false,
    volumeSizemin: 512,
    volumeSize: 512,
  }
  showExtendModal = () => {
    this.setState({
      extendModal: true,
    })
  }
  confirmExtend = () => {
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
    const { cluster } = this.props
    const resourcePrice = cluster.resourcePrice
    const storagePrice = resourcePrice.storage / 10000
    const hourPrice = parseAmount(this.state.volumeSize / 1024 * resourcePrice.storage, 4)
    const countPrice = parseAmount(
      this.state.volumeSize / 1024 * resourcePrice.storage * 24 * 30, 4)
    // const { databaseInfo } = this.props
    return <div className="storage">
      <div className="title">存储</div>
      <div className="extendBtn">
        <Button type="primary" onClick={this.showExtendModal}>
          <img src={ extend } alt=""/>
          <span>扩容</span>
        </Button>

        <span className="tip">
          <Icon type="info-circle-o" />
          停止集群后可做扩容操作
        </span>

      </div>
      <div className="graph">
        <div className="cluster">
          <div className="clusterName">
            MySql集群：
          </div>
          <div className="graphCluster">
            <img src={graphCluster} alt=""/>
            <div className="name">3个容器实例</div>
          </div>
        </div>
        <div className="line"></div>
        <div className="graphStorage">
          <img src={graphStorage} alt=""/>
          <div className="name">存储卷： 512M</div>
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
                min={512}
                max={20480}
                step={512}
                defaultValue={this.state.volumeSizemin}
                onChange={size => this.changeVolumeSizeSlider(size)}
                value={this.state.volumeSize}
              />
            </Col>
            <Col span={6} className="inputbox">
              <InputNumber
                min={this.state.volumeSizemin}
                max={20480}
                step={512}
                defaultValue={this.state.volumeSizemin}
                value={this.state.volumeSize}
                onChange={number => this.changeVolumeSizeInputNumber(number)}
              />
              <span style={{ paddingLeft: 10 }} >MB</span>
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
  const { billingConfig } = state.entities.loginUser.info
  const clusterID = cluster.clusterID
  const { enabled: billingEnabled } = billingConfig
  return {
    cluster,
    clusterID,
    billingEnabled,
  }
}

export default connect(mapStateToProps, {})(Storage)
