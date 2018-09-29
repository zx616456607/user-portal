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

// loadServiceDetail(cluster, serviceName, {

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
    const { isSee, getPodNetworkSegment, cluster } = this.props
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
            notification.warn('获取 Pod 网段数据失败')
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
            notification.warn('获取自动伸缩数据失败')
          }
        },
      },
    })
  }

  setInitaialStatus = () => {
    const { serviceDetail, cluster } = this.props
    const service = Object.keys(serviceDetail[cluster])[0]
    const annotations = serviceDetail[cluster][service].service.spec.template
      && serviceDetail[cluster][service].service.spec.template.metadata.annotations
    const ipv4 = annotations && annotations.hasOwnProperty('cni.projectcalico.org/ipAddrs')
      && annotations['cni.projectcalico.org/ipAddrs']
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
        containerNum, manualScaleService } = this.props
      const server = Object.keys(serviceDetail[cluster])[0]
      const { replicasIP } = values
      const ipStr = `[\"${replicasIP}\"]`
      const annotations = serviceDetail[cluster][server].service.spec.template
        && serviceDetail[cluster][server].service.spec.template.metadata.annotations
        || {}
      Object.assign(annotations, {
        'cni.projectcalico.org/ipAddrs': ipStr,
      })
      notification.spin('更改中...')
      if (containerNum > 1) {
        await manualScaleService(cluster, server, { num: 1 }, {
          failed: {
            func: error => {
              const { statusCode } = error
              notification.close()
              if (statusCode !== 403 && statusCode !== 412) {
                return notification.warn('固定 IP 操作失败, 水平扩展失败')
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
            notification.success('已固定 IP')
          },
          isAsync: true,
        },
        failed: {
          func: error => {
            notification.close()
            const { statusCode } = error
            if (statusCode !== 403 && statusCode !== 412) {
              notification.warn('固定 IP 操作失败')
            }
          },
        },
      })

    })
  }

  handleNotFix = () => {
    const { UpdateServiceAnnotation, onChangeVisible,
      cluster, serviceDetail, loadServiceDetail } = this.props
    const server = Object.keys(serviceDetail[cluster])[0]
    const annotations = serviceDetail[cluster][server].service.spec.template
      && serviceDetail[cluster][server].service.spec.template.metadata.annotations
    Object.assign(annotations, {
      'cni.projectcalico.org/ipAddrs': '',
    })
    notification.spin('释放中...')
    UpdateServiceAnnotation(cluster, server, annotations, {
      success: {
        func: () => {
          notification.close()
          onChangeVisible()
          loadServiceDetail(cluster, server)
          notification.success('释放 IP 成功')
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          notification.close()
          if (statusCode !== 403 && statusCode !== 412) {
            notification.warn('释放 IP 失败')
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

  checkPodCidr = (rule, value, callback) => {
    if (!value) return callback()
    const { NetSegment } = this.state
    if (!NetSegment) {
      return callback('未获取到指定网段')
    }
    const inRange = ipRangeCheck(value, NetSegment)
    if (!inRange) {
      return callback(`请输入属于 ${NetSegment} 的 IP`)
    }
    callback()
  }

  render() {
    const { NetSegment, isScale } = this.state
    const { form, configIP, notConfigIP, containerNum, cluster, serviceDetail } = this.props
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
          title="配置固定 IP"
          visible={configIP}
          onOk={this.handleOk}
          onCancel={() => this.handleCandle(false)}
          className="containerInstanceModal"
          footer={[
            <Button key="cancel" onClick={() => this.handleCandle(false)}>取消</Button>,
            <Tooltip title={isStop ? '停止中的服务不支持固定 IP' : null}>
              <Button key="confirm" type="primary" disabled={isStop} onClick={this.handleOk}>重启服务，应用更改</Button>
            </Tooltip>,
          ]}
        >
          <div className="relateCont">
            {
              (containerNum > 1 || isScale) ?
                <div className="podPrompt">
                  目前仅支持一个实例固定 IP，且功能开启后，将不支持服务自动伸缩
                </div>
                : null
            }
            <FormItem
              label="容器实例数量"
              {...formItemLayout}>
              <span>{containerNum}</span>
            </FormItem>
            <FormItem
              wrapperCol={{ span: 16, offset: 4 }}
              {...formItemLayout}
              label={'配置固定 IP'}
              className="addIp"
            >
              <Input {...getFieldProps('replicasIP', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: `请填写实例 IP（需属于 ${NetSegment}）`,
                }, {
                  validator: this.checkPodCidr,
                }],
              })}
              style={{ width: 280 }}
              placeholder={`请填写实例 IP（需属于 ${NetSegment}）`}
              />
            </FormItem>
          </div>
        </Modal>
        <Modal
          title="不再固定实例 IP"
          visible={notConfigIP}
          onOk={this.handleNotFix}
          onCancel={() => this.handleCandle(true)}
          okText={'确认释放 IP'}
        >
          <div className="securityGroupContent">
            <i className="fa fa-exclamation-triangle modalIcon" aria-hidden="true"></i>
            <div>
              <p>容器实例 IP 将不再固定，重新创建容器 IP 可能发生变化，且已配置的固定 IP 将被释放！</p>
              <p>继续将不再固定实例 IP，确认继续? </p>
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
})(Form.create()(ContainerInstance))
