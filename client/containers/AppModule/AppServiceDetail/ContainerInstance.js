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
import { Modal, Form, Input } from 'antd'
import Notification from '../../../../src/components/Notification'
import * as serviceActions from '../../../../src/actions/services'
import * as podAction from '../../../../src/actions/app_manage'
import ipRangeCheck from 'ip-range-check'

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
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 19, offset: 5 },
  },
};
let uuid = 0
class ContainerInstance extends React.Component {
  state = {
    oldIP: undefined,
    NetSegment: undefined,
    isScale: undefined,
  }

  componentDidMount() {
    const { isSee, configIP, getPodNetworkSegment, cluster } = this.props
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
    !isSee && configIP && this.nowNoneAndSetOneItem()
    const { loadAutoScale, serviceName } = this.props
    loadAutoScale(cluster, serviceName, {
      success: {
        func: res => {
          const isScale = res.data && res.data.metadata.annotations.status === 'RUN' || false
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

  nowNoneAndSetOneItem = () => {
    const keys = []
    this.props.form.setFieldsValue({
      keys: keys.concat(uuid),
    })
    uuid++
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
      const keys = []
      ipv4Arr.forEach(item => {
        keys.push(uuid)
        setFieldsValue({
          [`replicasIP${uuid}`]: item,
          keys,
        })
        uuid++
      })
      this.setState({ oldIP: ipv4Arr })
    }
    if (!ipv4) {
      this.nowNoneAndSetOneItem()
    }
  }

  remove = k => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    })
  }

  add = () => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    const nextKeys = keys.concat(uuid)
    uuid++
    form.setFieldsValue({
      keys: nextKeys,
    })
  }

  handleOk = () => {
    this.props.form.validateFields(async (err, values) => {
      if (err) return
      const { UpdateServiceAnnotation, cluster, serviceDetail,
        containerNum, manualScaleService } = this.props
      const server = Object.keys(serviceDetail[cluster])[0]
      const { keys } = values
      const ipArr = []
      keys.forEach(el => {
        ipArr.push(values[`replicasIP${el}`])
      })
      const ipStr = JSON.stringify(ipArr)
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
      const { loadAutoScale, updateAutoScaleStatus } = this.props
      const serviceName = Object.keys(serviceDetail[cluster])[0]
      const res = await loadAutoScale(cluster, serviceName)
      const status = res.response.result.data
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
    const { UpdateServiceAnnotation, onChangeVisible, cluster, serviceDetail } = this.props
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
    const { oldIP, NetSegment, isScale } = this.state
    const { form, configIP, notConfigIP, containerNum } = this.props
    const { getFieldProps, getFieldValue } = form
    getFieldProps('keys', {
      initialValue: [ ],
    })
    const formItems = getFieldValue('keys').map((k, index) => {
      let use = null
      oldIP && oldIP.forEach(ele => {
        if (ele === getFieldValue(`replicasIP${k}`)) {
          use = <span className="useStatus isUsed">已使用</span>
        }
      })
      return (
        <FormItem
          key={k}
          wrapperCol={{ span: 16, offset: 4 }}
          {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
          label={index === 0 ? '配置固定 IP' : ''}
          className="addIp"
        >
          <Input {...getFieldProps(`replicasIP${k}`, {
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
          { use || <span className="useStatus shouldUse">未使用</span> }
          {/*
          <Button
            className="delBtn"
            disabled={use}
            onClick={() => this.remove(k)}
          >
            <Icon type="delete" />
          </Button>
          */}
        </FormItem>
      )
    })
    return (
      <div className="containerInstance">
        <Modal
          title="配置固定 IP"
          visible={configIP}
          onOk={this.handleOk}
          onCancel={() => this.handleCandle(false)}
          okText={'重启服务,应用更改'}
          // okButtonProps={{ disabled: formItems.length === 0 }}
          className="containerInstanceModal"
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
            {formItems}
            {/*
            <Row className="addInstance">
              <Col span={5}></Col>
              <Col>
                <span onClick={this.add} className="add">
                  <Icon type="plus-circle-o" style={{ marginRight: 8 }}/>
                  添加实例 IP
                </span>
              </Col>
            </Row>
            */}
          </div>
        </Modal>
        <Modal
          title="不再固定实例 IP"
          visible={notConfigIP}
          onOk={this.handleNotFix}//  () => this.props.onChangeVisible(false)}
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
  getPodNetworkSegment: podAction.getPodNetworkSegment,
})(Form.create()(ContainerInstance))
