/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Resource quota modal
 *
 * v0.1 - 2017-03-15
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Modal, Button, Icon, Row, Col, Progress } from 'antd'
import './style/index.less'

export default class ResourceQuotaModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
  }

  static defaultProps = {
    visible: true,
  }

  constructor(props) {
    super(props)
    this.state = {
      //
    }
  }

  componentDidMount() {
    //
  }

  componentWillUnmount() {
    //
  }

  render() {
    const { visible, closeModal } = this.props
    return (
      <Modal
        title="资源提醒"
        visible={visible}
        footer={[
          <Button key="back" type="ghost" size="large">重新选择</Button>,
          <Button key="submit" type="primary" size="large">
            选择剩余最大配置
          </Button>
        ]}
        wrapClassName="wrapResourceQuotaModal"
        className="ResourceQuotaModal"
        onCancel={closeModal}
      >
      <div className="tips">
        <Icon type="exclamation-circle-o" className="exclamationIcon" />
        注意：当前集群内资源不足
      </div>
      <Row className="row">
        <Col span={6}>cpu</Col>
        <Col span={12} className="Progress">
          <Progress percent={75} status="active" showInfo={false} />
        </Col>
        <Col span={6}>12/16核（75%）</Col>
      </Row>
      <Row className="row">
        <Col span={6}>内存</Col>
        <Col span={12} className="Progress">
          <Progress percent={98} status="active" showInfo={false} />
        </Col>
        <Col span={6}>980/1000GB（98%）</Col>
      </Row>
      <Row className="textRow">
        <Col span={6}>当前已选配置</Col>
        <Col span={18}>12核 | 980GB</Col>
      </Row>
      <Row className="textRow">
        <Col span={6}>剩余最大可选配置</Col>
        <Col span={18} className="restResources">4核 | 20GB</Col>
      </Row>
      </Modal>
    )
  }
}