/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Tcp udp ingress modal
 *
 * @author zhangxuan
 * @date 2018-08-03
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Modal, Form, Select } from 'antd'
import isEmpty from 'lodash/isEmpty'
import { sleep } from "../../../../../common/tools";
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'
import * as lbActions from '../../../../../actions/load_balance'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import PortInputNumber from '../../../../../../client/components/PortInputNumber'

const FormItem = Form.Item
const Option = Select.Option

const mapStateToProps = (state, props) => {
  const { type } = props
  const lowerType = type.toLowerCase()
  const ingressData = getDeepValue(state, ['loadBalance', 'tcpUdpIngress', lowerType])
  return {
    ingressData,
  }
}

@connect(mapStateToProps, {
  getTcpUdpIngress: lbActions.getTcpUdpIngress,
})

class TcpUdpModal extends React.PureComponent{
  static propTypes = {
    type: PropTypes.oneOf([ 'TCP', 'UDP' ]).isRequired,
    visible: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    currentIngress: PropTypes.object,
    callback: PropTypes.func,
    clusterID: PropTypes.string.isRequired,
    lbname: PropTypes.string.isRequired,
  }

  state = {
    existPorts: [],
  }

  async componentDidMount() {
    const { getTcpUdpIngress, type, clusterID, lbname, form, currentIngress } = this.props
    const { getFieldValue } = form
    const lowerType = type.toLowerCase()
    await getTcpUdpIngress(clusterID, lbname, lowerType)
    const { ingressData } = this.props
    const keys = getFieldValue(`${lowerType}Keys`)
    const existPorts = []
    if (!isEmpty(keys)) {
      keys.forEach(key => {
        const exportPort = getFieldValue(`${lowerType}-exportPort-${key}`)
        existPorts.push(exportPort.toString())
      })
    }
    if (!isEmpty(ingressData.data)) {
      ingressData.data.forEach(item => {
        existPorts.push(item.exportPort)
      })
    }
    this.setState({
      existPorts,
    })
  }

  componentWillUnmount() {
    const { resetFields } = this.props.form
    resetFields(['modalExportPort', 'modalServicePort'])
  }

  handleConfirm = () => {
    const { closeModal, form, callback } = this.props
    const validateArray = ['modalExportPort', 'modalServicePort']
    form.validateFields(validateArray, async (errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        confirmLoading: true,
      })
      await sleep(500)
      if (callback) {
        callback(values)
      }
      this.setState({
        confirmLoading: false,
      })
      closeModal()
    })
  }

  exportPortCheck = (rules, value, callback) => {
    const { intl, currentIngress } = this.props
    const { existPorts } = this.state
    if (currentIngress && value && value === currentIngress.exportPort) {
      return callback()
    }
    if (value && !isEmpty(existPorts) && existPorts.includes(value.toString())) {
      return callback(intl.formatMessage(IntlMessage.listeningPortBeUsed))
    }
    callback()
  }

  servicePortCheck = (rules, value, callback) => {
    const { intl } = this.props
    if (isEmpty(value)) {
      return callback(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.containerPort),
        end: '',
      }))
    }
    if (value.length > 1) {
      return callback(intl.formatMessage(IntlMessage.containerPortSingleSlt))
    }
    callback()
  }

  renderPorts = () => {
    const { form, type } = this.props
    const { getFieldValue } = form
    const lowerType = type.toLowerCase()
    const imagePorts = getFieldValue('imagePorts')
    if (isEmpty(imagePorts)) {
      return
    }
    const protocolPorts = imagePorts.filter(_item => _item.split('/')[1] === lowerType)
    if (isEmpty(protocolPorts)) {
      return
    }
    return protocolPorts.map(_item => {
      const port = _item.split('/')[0]
      return <Option key={port}>{port}</Option>
    })
  }

  render() {
    const { form ,type, visible, currentIngress, closeModal, intl } = this.props
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 }
    }
    const monitorPortProps = getFieldProps('modalExportPort', {
      rules: [{
        required: true,
        message: intl.formatMessage(IntlMessage.monitorPortIsRequired),
      }, {
        validator: this.exportPortCheck,
      }],
      initialValue: currentIngress ? currentIngress.exportPort : '',
    })
    const containerPortProps = getFieldProps('modalServicePort', {
      rules: [{
        required: true,
        message: intl.formatMessage(IntlMessage.containerPortIsRequired),
      }, {
        validator: this.servicePortCheck,
      }],
      initialValue: currentIngress ? [currentIngress.servicePort] : [],
    })
    return (
      <Modal
        title={intl.formatMessage(IntlMessage.configMonitor, {
          item: type,
        })}
        visible={visible}
        onCancel={closeModal}
        onOk={this.handleConfirm}
      >
        <FormItem
          label={intl.formatMessage(IntlMessage.containerPort)}
          {...formItemLayout}
        >
          <Select
            style={{ width: '100%' }}
            tags
            {...containerPortProps}
            placeholder={intl.formatMessage(IntlMessage.pleaseEnter, {
              item: intl.formatMessage(IntlMessage.containerPort),
              end: '',
            })}
          >
            {this.renderPorts()}
          </Select>
        </FormItem>
        <FormItem
          label={intl.formatMessage(IntlMessage.listeningPort)}
          {...formItemLayout}
        >
          {
            PortInputNumber({
              style: { width: '100%' },
              placeholderFunc: range => intl.formatMessage(IntlMessage.pleaseEnter, {
                item: intl.formatMessage(IntlMessage.listeningPort),
                end: ` ${range}`,
              }),
              ...monitorPortProps
            })
          }
        </FormItem>
      </Modal>
    )
  }
}

export default Form.create()(injectIntl(TcpUdpModal, {
  withRef: true,
}))
