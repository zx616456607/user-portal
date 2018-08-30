/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Template resource errors modal
 *
 * @author zhangxuan
 * @date 2018-06-11
 */
import React from 'react'
import { Modal, Timeline } from 'antd'
import isEmpty from "lodash/isEmpty";
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../containers/Application/intl'

class ResourceErrorsModal extends React.Component {
  formatErrorType = record => {
    switch (record.type) {
      case 0:
        return <span>nfs<FormattedMessage {...IntlMessage.cluster}/>
          <span className="themeColor">{record.resourceName}</span>
          <FormattedMessage {...IntlMessage.notExist}/>
        </span>
      case 1:
        return <span>ceph<FormattedMessage {...IntlMessage.cluster}/>
          <span className="themeColor">{record.resourceName}</span>
          <FormattedMessage {...IntlMessage.notExist}/>
        </span>
      case 2:
        return <span><FormattedMessage {...IntlMessage.loadBalance}/>
          <span className="themeColor">{record.resourceName}</span>
          <FormattedMessage {...IntlMessage.notExist}/>
        </span>
      case 3:
        return <span><FormattedMessage {...IntlMessage.clusterNoPublicNexport}/></span>
      case 4:
        return <span><FormattedMessage {...IntlMessage.clusterNoInternalNexport}/></span>
      case 5:
        return <span><FormattedMessage {...IntlMessage.configurationGroup}/>
          <span  className="themeColor">{record.resourceName}</span>
          <FormattedMessage {...IntlMessage.nameExisted}/>
        </span>
      case 6:
        return <span>
          <FormattedMessage {...IntlMessage.secretConfiguration}/> <span className="themeColor">{record.resourceName}</span>
          <FormattedMessage {...IntlMessage.notExist}/>
        </span>
      case 7:
        return <span><FormattedMessage {...IntlMessage.clusterDisableHostStorage}/></span>
      case 8:
        return <span><FormattedMessage {...IntlMessage.noApmInstalled}/></span>
      case 9:
        return <span>
          <FormattedMessage {...IntlMessage.secretVariable}/> <span className="themeColor">{record.resourceName}</span>
          <FormattedMessage {...IntlMessage.nameExisted}/>
        </span>
      case 10:
        return <span>
          <FormattedMessage {...IntlMessage.listener}/> <span className="themeColor">{record.resourceName}</span>
          <FormattedMessage {...IntlMessage.nameExisted}/>
        </span>
      case 11:
        return <span>
          <FormattedMessage {...IntlMessage.forwardingRules}/> <span className="themeColor">{record.subResourceName}</span>
          <FormattedMessage {...IntlMessage.existed}/>
        </span>
      default:
        return
      }
  }

  renderResourceError = () => {
    const { templateDeployCheck } = this.props;
    if (isEmpty(templateDeployCheck) || !templateDeployCheck.data) {
      return
    }
    const { data } = templateDeployCheck
    const children = data.map(item => {
      if (isEmpty(item.content)) {
        return
      }
      return (
        <div className="resourceList" key={item.name}>
          <div className="themeColor serviceName">{item.name}</div>
          <Timeline className="resourceTimeline">
            {
              item.content.map(record => {
                return <Timeline.Item key={record.type + record.resourceName}>{this.formatErrorType(record)}</Timeline.Item>
              })
            }
          </Timeline>
        </div>
      )
    })
    return (
      <div>
        <div className="resourceHint"><FormattedMessage {...IntlMessage.appTemplateResourceErrorTip}/></div>
        {children}
      </div>
    )
  }

  render() {
    const { visible, closeModal, confirmModal, intl } = this.props
    return (
      <Modal
        className="resourceErrorModal"
        title={intl.formatMessage(IntlMessage.resourceFailure)}
        visible={visible}
        onCancel={closeModal}
        onOk={confirmModal}
        okText={intl.formatMessage(IntlMessage.continue)}
        cancelText={intl.formatMessage(IntlMessage.abandon)}
        maskClosable={false}
      >
        {this.renderResourceError()}
      </Modal>
    )
  }
}

export default injectIntl(ResourceErrorsModal, {
  withRef: true,
})
