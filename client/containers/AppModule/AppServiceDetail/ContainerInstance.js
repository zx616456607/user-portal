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
import { Modal, Form, Input, Row, Col, Button, Icon } from 'antd'
import Notification from '../../../../src/components/Notification'
import * as serviceActions from '../../../../src/actions/services'

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
  }

  componentDidMount() {
    const { isSee } = this.props
    isSee && setTimeout(
      this.setInitaialStatus(),
      150
    )
  }

  setInitaialStatus = () => {
    const { serviceDetail, cluster } = this.props
    const service = Object.keys(serviceDetail[cluster])[0]
    const annotations = serviceDetail[cluster][service].service.metadata.annotations
    const ipv4 = annotations && annotations.hasOwnProperty('cni.projectcalico.org/ipv4pools')
      && annotations['cni.projectcalico.org/ipv4pools']
    if (ipv4) {
      const { setFieldsValue, getFieldValue } = this.props.form
      const ipv4Arr = JSON.parse(ipv4)
      ipv4Arr.forEach((item, ind) => {
        const keys = getFieldValue('keys')
        const nextKeys = keys.concat(ind)
        setFieldsValue({
          [`replicasIP${ind}`]: item,
          keys: nextKeys,
        })
        uuid = ind + 1
      })
      this.setState({ oldIP: ipv4Arr })
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
    this.props.form.validateFields((err, values) => {
      // console.log( values, 'vvvv' )
      if (!values.keys.length) return
      const { UpdateServiceAnnotation, cluster, serviceDetail } = this.props
      const server = Object.keys(serviceDetail[cluster])[0]
      const { keys } = values
      const ipArr = []
      keys.forEach(el => {
        ipArr.push(values[`replicasIP${el}`])
      })
      const ipStr = JSON.stringify(ipArr)
      const annotations = serviceDetail[cluster][server].service.metadata.annotations
      Object.assign(annotations, {
        'cni.projectcalico.org/ipv4pools': ipStr,
      })
      notification.spin()
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
          func: () => {
            notification.close()
            notification.warn('固定 IP 操作失败')
          },
        },
      })

    })
  }

  handleNotFix = () => {
    const { UpdateServiceAnnotation, onChangeVisible, cluster, serviceDetail } = this.props
    const server = Object.keys(serviceDetail[cluster])[0]
    const annotations = serviceDetail[cluster][server].service.metadata.annotations
    Object.assign(annotations, {
      'cni.projectcalico.org/ipv4pools': '',
    })
    notification.spin()
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
        func: () => {
          notification.close()
          notification.warn('释放 IP 失败')
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

  render() {
    const { oldIP } = this.state
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
              message: '请填写实例 IP（需属于 172.168.0.0/16）',
            }],
          })}
          style={{ width: 280 }}
          placeholder="请填写实例 IP（需属于 172.168.0.0/16）"
          />
          { use || <span className="useStatus shouldUse">未使用</span> }
          <Button
            className="delBtn"
            disabled={use}
            onClick={() => this.remove(k)}
          >
            <Icon type="delete" />
          </Button>
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
            <FormItem
              label="容器实例数量"
              {...formItemLayout}>
              <span>{containerNum}</span>
            </FormItem>
            {formItems}
            <Row className="addInstance">
              <Col span={5}></Col>
              <Col>
                <span onClick={this.add} className="add">
                  <Icon type="plus-circle-o" style={{ marginRight: 8 }}/>
                  添加实例 IP
                </span>
              </Col>
            </Row>
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
})(Form.create()(ContainerInstance))
