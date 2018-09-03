/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Resource quota modal(cpu, memory)
 *
 * v0.1 - 2017-03-15
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Button, Icon, Row, Col, Progress } from 'antd'
import classNames from 'classnames'
import Modal from './Modal'
import './style/index.less'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../containers/Application/intl'

class ResourceQuotaModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    useRestResource: PropTypes.func.isRequired,
    selectResource: PropTypes.object.isRequired,
    totalResource: PropTypes.object.isRequired,
  }

  static defaultProps = {
    selectResource: {
      cpu: 0,
      memory: 0,
    },
    usedResource: {
      cpu: 0,
      memory: 0,
    },
    totalResource: {
      cpu: 0,
      memory: 0,
    },
  }

  constructor(props) {
    super(props)
  }

  getPercentage(used, total) {
    const percent = Math.ceil(used / total * 100)
    if (isNaN(percent)) {
      return 0
    }
    return percent
  }

  render() {
    const {
      visible, closeModal, selectResource,
      usedResource, totalResource, closable,
      intl
    } = this.props
    const usedCpu = usedResource.cpu
    const usedMemory = usedResource.memory
    const totalCpu = totalResource.cpu
    const totalMemory = totalResource.memory
    const usedCpuPercent = this.getPercentage(usedCpu, totalCpu)
    const usedMemoryPercent = this.getPercentage(usedMemory, totalMemory)
    const restCpu = Math.ceil((totalCpu - usedCpu) * 10) / 10
    const restMemory = Math.ceil((totalMemory - usedMemory) * 10) / 10
    return (
      <Modal
        visible={visible}
        closable={closable}
        closeModal={closeModal}
        content={(
          <div>
            <Row className="row">
              <Col span={6}>cpu</Col>
              <Col span={11} className="Progress">
                <Progress percent={usedCpuPercent} status="active" showInfo={false} />
              </Col>
              <Col span={7}>
                {usedCpu}/{totalCpu}{intl.formatMessage(IntlMessage.core)}
                ({usedCpuPercent}%)
              </Col>
            </Row>
            <Row className="row">
              <Col span={6}><FormattedMessage {...IntlMessage.memory}/></Col>
              <Col span={11} className="Progress">
                <Progress percent={usedMemoryPercent} status="active" showInfo={false} />
              </Col>
              <Col span={7}>
                {usedMemory}/{totalMemory}GB
                ({usedMemoryPercent}%)
              </Col>
            </Row>
            <Row className="textRow">
              <Col span={6}><FormattedMessage {...IntlMessage.selectedConfiguration}/></Col>
              <Col span={18}>
                <span className={classNames({red: selectResource.cpu > restCpu})}>
                  {selectResource.cpu}{intl.formatMessage(IntlMessage.core)}
                </span>
                &nbsp;|&nbsp;
                <span className={classNames({red: selectResource.memory > restMemory})}>
                  {selectResource.memory}GB
                </span>
              </Col>
            </Row>
            <Row className="textRow">
              <Col span={6}><FormattedMessage {...IntlMessage.remainingConfiguration}/></Col>
              <Col span={18} className="restResources">
                {restCpu}{intl.formatMessage(IntlMessage.core)} | {restMemory}GB
              </Col>
            </Row>
          </div>
        )}
      >
      </Modal>
    )
  }
}

export default injectIntl(ResourceQuotaModal, {
  withRef: true,
})
