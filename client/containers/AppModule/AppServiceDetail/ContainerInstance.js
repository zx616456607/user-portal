/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * ContainerInstance of AppDetailTab
 *
 * v0.1 - 2018-08-22
 * @author lvjunfeng
 */

import React from 'react'
import './styles/ContainerInstance.less'
import { connect } from 'react-redux'
import { Modal, Form, Input, Button, Tooltip } from 'antd'
import Notification from '../../../../src/components/Notification'
import * as serviceActions from '../../../../src/actions/services'
import * as podAction from '../../../../src/actions/app_manage'
import ipRangeCheck from 'ip-range-check'
import { getServiceStatus } from '../../../../src/common/status_identify'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessages from './ContainerHeaderIntl'

const notification = new Notification()
const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 20 },
    sm: { span: 19 },
  },
  colon: false,
}
// let uuid = 0
class ContainerInstance extends React.Component {
  state = {
    NetSegment: undefined,
    isScale: undefined,
  }

  componentDidMount() {
    const { isSee, getPodNetworkSegment, cluster, intl } = this.props
    getPodNetworkSegment(cluster, {
      success: {
        func: res => {
          this.setState({
            NetSegment: res.data, // 校验网段使用
          })
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode !== 403) {
            notification.warn(intl.formatMessage(IntlMessages.getPodDataFail))
          }
        },
      },
    })
    isSee && setTimeout(
      this.setInitaialStatus(),
      150
    )
    const { loadAutoScale, serviceName } = this.props
    loadAutoScale(cluster, serviceName, {
      success: {
        func: res => {
          const isScale = res.data && res.data.metadata && res.data.metadata.annotations.status === 'RUN' || false
          this.setState({
            isScale,
          })
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode !== 403 && statusCode !== 412) {
            notification.warn(intl.formatMessage(IntlMessages.getAutoScaleFail))
          }
        },
      },
    })
  }

  setInitaialStatus = () => {
    const { serviceDetail, cluster } = this.props
    const service = Object.keys(serviceDetail[cluster])[0]
    const ipv4 = getDeepValue(serviceDetail, [ cluster, service, 'service', 'spec', 'template', 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ])
    const { setFieldsValue } = this.props.form
    if (ipv4) {
      const ipv4Arr = JSON.parse(ipv4)
      setFieldsValue({
        replicasIP: ipv4Arr[0],
      })
    }
  }

  handleOk = () => {
    this.props.form.validateFields(async (err, values) => {
      if (err) return
      const { UpdateServiceAnnotation, cluster, serviceDetail,
        containerNum, manualScaleService, intl } = this.props
      const server = Object.keys(serviceDetail[cluster])[0]
      const { replicasIP } = values
      const ipStr = `[\"${replicasIP}\"]`
      const annotations = getDeepValue(serviceDetail, [ cluster, server, 'service', 'spec', 'template', 'metadata', 'annotations' ]) || {}
      Object.assign(annotations, {
        'cni.projectcalico.org/ipAddrs': ipStr,
      })
      notification.spin(intl.formatMessage(IntlMessages.fixIPing))
      if (containerNum > 1) {
        await manualScaleService(cluster, server, { num: 1 }, {
          failed: {
            func: error => {
              const { statusCode } = error
              notification.close()
              if (statusCode !== 403 && statusCode !== 412) {
                return notification.warn(intl.formatMessage(IntlMessages.scaleFail))
              }
            },
          },
        })
      }
      const { loadAutoScale, updateAutoScaleStatus, loadServiceDetail } = this.props
      const serviceName = Object.keys(serviceDetail[cluster])[0]
      const res = await loadAutoScale(cluster, serviceName)
      const status = res.response.result.data
        && res.response.result.data.metadata
        && res.response.result.data.metadata.annotations.status === 'RUN'
        || false
      if (status) {
        await updateAutoScaleStatus(cluster, {
          services: [ serviceName ],
          type: 0,
        })
      }
      UpdateServiceAnnotation(cluster, server, annotations, {
        success: {
          func: () => {
            notification.close()
            const { onChangeVisible, onHandleCanleIp } = this.props
            onChangeVisible()
            onHandleCanleIp(true)
            loadServiceDetail(cluster, serviceName)
            notification.success(intl.formatMessage(IntlMessages.fixIPSuccess))
          },
          isAsync: true,
        },
        failed: {
          func: error => {
            notification.close()
            const { statusCode } = error
            if (statusCode !== 403 && statusCode !== 412) {
              notification.warn(intl.formatMessage(IntlMessages.fixIPFail))
            }
          },
        },
      })

    })
  }

  handleNotFix = () => {
    const { UpdateServiceAnnotation, onChangeVisible,
      cluster, serviceDetail, loadServiceDetail, intl } = this.props
    const server = Object.keys(serviceDetail[cluster])[0]
    const annotations = getDeepValue(serviceDetail, [ cluster, server, 'service', 'spec', 'template', 'metadata', 'annotations' ]) || {}
    Object.assign(annotations, {
      'cni.projectcalico.org/ipAddrs': '',
    })
    notification.spin(intl.formatMessage(IntlMessages.releasing))
    UpdateServiceAnnotation(cluster, server, annotations, {
      success: {
        func: () => {
          notification.close()
          onChangeVisible()
          loadServiceDetail(cluster, server)
          notification.success(intl.formatMessage(IntlMessages.releaseSuccess))
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          notification.close()
          if (statusCode !== 403 && statusCode !== 412) {
            notification.warn(intl.formatMessage(IntlMessages.releaseFail))
          }
        },
      },
    })
  }

  handleCandle = v => {
    const { isSee, onChangeVisible, onHandleCanleIp, isCheckIP } = this.props
    if (isSee) {
      onChangeVisible()
      onHandleCanleIp(isCheckIP)
      return
    }
    onChangeVisible()
    onHandleCanleIp(v)
  }

  checkPodCidr = async (rule, value, callback) => {
    const NetSegment = this.currentIPPool()
    const { intl } = this.props
    if (!value) {
      return callback(intl.formatMessage(IntlMessages.ipPodPlaceholder, { NetSegment }))
    }
    if (!NetSegment) {
      return callback(intl.formatMessage(IntlMessages.netSegmentUnknow))
    }
    const inRange = ipRangeCheck(value, NetSegment)
    if (!inRange) {
      return callback(intl.formatMessage(IntlMessages.inputRange, { NetSegment }))
    }
    const { getISIpPodExisted, cluster } = this.props
    const isExist = await getISIpPodExisted(cluster, value)
    const { code, data: { isPodIpExisted } } = isExist.response.result
    if (code !== 200) {
      return callback(intl.formatMessage(IntlMessages.checkIPFail))
    } else if (code === 200 && isPodIpExisted === 'true') {
      return callback(intl.formatMessage(IntlMessages.isUsedIP))
    }
    callback()
  }
  currentIPPool = () => {
    const { NetSegment } = this.state
    const { cluster, serviceDetail } = this.props
    const server = Object.keys(serviceDetail[cluster])[0]
    let ipPool = NetSegment || undefined
    const annotations = getDeepValue(serviceDetail, [ cluster, server, 'service', 'spec', 'template', 'metadata', 'annotations' ]) || {}
    if (annotations.hasOwnProperty('cni.projectcalico.org/ipv4pools')) {
      ipPool = JSON.parse(annotations['cni.projectcalico.org/ipv4pools'])[0]
    }
    if (annotations.hasOwnProperty('cni.projectcalico.org/ipv6pools')) {
      ipPool = JSON.parse(annotations['cni.projectcalico.org/ipv6pools'])[0]
    }
    return ipPool
  }
  render() {
    const { isScale } = this.state
    const { form, configIP, notConfigIP, containerNum, cluster, serviceDetail, intl } = this.props
    const { getFieldProps } = form
    const server = Object.keys(serviceDetail[cluster])[0]
    const service = serviceDetail[cluster][server].service
    const status = getServiceStatus(service)
    const { replicas, availableReplicas } = status
    let isStop = false
    if (!replicas && !availableReplicas) {
      isStop = true
    }
    return (
      <div className="containerInstance">
        <Modal
          title={<FormattedMessage {...IntlMessages.fixIPConfig} />}
          visible={configIP}
          onOk={this.handleOk}
          onCancel={() => this.handleCandle(false)}
          className="containerInstanceModal"
          footer={[
            <Button key="cancel" onClick={() => this.handleCandle(false)}>
              <FormattedMessage {...IntlMessages.fixIPCandle} />
            </Button>,
            <Tooltip
              title={isStop ? <FormattedMessage {...IntlMessages.stopedServer} /> : null}>
              <Button key="confirm" type="primary" disabled={isStop} onClick={this.handleOk}>
                <FormattedMessage {...IntlMessages.fixIPEnter} />
              </Button>
            </Tooltip>,
          ]}
        >
          <div className="relateCont">
            {
              (containerNum > 1 || isScale) ?
                <div className="podPrompt">
                  <FormattedMessage {...IntlMessages.fixOnePrompt} />
                </div>
                : null
            }
            <FormItem
              label={<FormattedMessage {...IntlMessages.instanceNum} />}
              {...formItemLayout}>
              <span>{containerNum}</span>
            </FormItem>
            <FormItem
              wrapperCol={{ span: 16, offset: 4 }}
              {...formItemLayout}
              label={<FormattedMessage {...IntlMessages.staticIP} />}
              className="addIp"
            >
              <Input {...getFieldProps('replicasIP', {
                rules: [{
                  validator: this.checkPodCidr,
                }],
              })}
              style={{ width: 280 }}
              placeholder={intl.formatMessage(IntlMessages.ipPodPlaceholder,
                { NetSegment: this.currentIPPool() }) }
              />
            </FormItem>
          </div>
        </Modal>
        <Modal
          title={<FormattedMessage {...IntlMessages.releaseIP} />}
          visible={notConfigIP}
          onOk={this.handleNotFix}
          onCancel={() => this.handleCandle(true)}
          okText={<FormattedMessage {...IntlMessages.enterReleaseIP} />}
        >
          <div className="securityGroupContent">
            <i className="fa fa-exclamation-triangle modalIcon" aria-hidden="true"></i>
            <div>
              <p><FormattedMessage {...IntlMessages.releaseIPPrompt} /></p>
              <p><FormattedMessage {...IntlMessages.askReleaseIP} /></p>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = ({
  entities: { current },
  services: { serviceDetail },
}) => {
  return {
    cluster: current.cluster.clusterID,
    serviceDetail,
  }
}

export default connect(mapStateToProps, {
  UpdateServiceAnnotation: serviceActions.UpdateServiceAnnotation,
  manualScaleService: serviceActions.manualScaleService,
  loadAutoScale: serviceActions.loadAutoScale,
  updateAutoScaleStatus: serviceActions.updateAutoScaleStatus,
  loadServiceDetail: serviceActions.loadServiceDetail,
  getPodNetworkSegment: podAction.getPodNetworkSegment,
  getISIpPodExisted: serviceActions.getISIpPodExisted,
})(injectIntl(Form.create()(ContainerInstance), {
  withRef: true,
}))
