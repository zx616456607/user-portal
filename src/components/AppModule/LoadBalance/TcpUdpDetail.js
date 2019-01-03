/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Tcp and udp monitor detail
 *
 * @author zhangxuan
 * @date 2018-08-02
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Form, InputNumber, Select, Card } from 'antd'
import isEmpty from 'lodash/isEmpty'
import DetailFooter from './DetailFooter'
import Notification from '../../Notification'
import * as lbActions from '../../../actions/load_balance'
import * as serviceActions from '../../../actions/services'
import { getDeepValue } from '../../../../client/util/util'


const FormItem = Form.Item
const Option = Select.Option
const notify = new Notification()

class TcpUdpDetail extends React.PureComponent{
  static propTypes = {
    type: PropTypes.oneOf(['TCP', 'UDP']).isRequired,
    togglePart: PropTypes.func,
  }

  state = {
    allServices: [],
  }

  componentDidMount() {
    const { loadAllServices, clusterID, getTcpUdpIngress, type, location, currentIngress } = this.props
    const { name } = location.query
    if (!currentIngress) {
      const lowerType = type.toLowerCase()
      getTcpUdpIngress(clusterID, name, lowerType)
    }
    loadAllServices(clusterID, {
      pageIndex: 1,
      pageSize: 100,
    }, {
      success: {
        func: res => {
          this.setState({
            allServices: res.data.services.filter(item => !isEmpty(item.service)).map(item => item.service),
          })
        }
      }
    })
  }

  goBack = () => {
    const { togglePart, type } = this.props
    togglePart(true, null, 'listener', type)
  }

  handelConfirm = async () => {
    const {
      currentIngress, updateTcpUdpIngress, clusterID,
      createTcpUdpIngress, location, form, type, lbDetail,
    } = this.props
    const { name, displayName } = location.query
    const { agentType } = getDeepValue(lbDetail.deployment, ['metadata', 'labels'])
    form.validateFields(async (errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        confirmLoading: true,
      })
      const lowerType = type.toLowerCase()
      const body = {
        [lowerType]: [{
          exportPort: values.exportPort.toString(),
          serviceName: values.serviceName,
          servicePort: values.servicePort.toString()
        }]
      }

      if (!currentIngress) {
        notify.spin('创建中...')
        const result = await createTcpUdpIngress(clusterID, name, lowerType, displayName, agentType, body)
        if (result.error) {
          notify.close()
          notify.warn('创建失败')
          this.setState({
            confirmLoading: false,
          })
          return
        }
        notify.close()
        notify.success('创建成功')
        this.setState({
          confirmLoading: false,
        })
        this.goBack()
        return
      }
      notify.spin('修改中...')
      const res = await updateTcpUdpIngress(clusterID, name, lowerType, displayName, agentType, body)
      if (res.error) {
        notify.close()
        notify.warn('修改失败')
        this.setState({
          confirmLoading: false,
        })
        return
      }
      notify.close()
      notify.success('修改成功')
      this.setState({
        confirmLoading: false,
      })
      this.goBack()
    })
  }

  containerPortCheck = (rules, value, callback) => {
    if (isEmpty(value)) {
      return callback('容器端口不能为空')
    }
    callback()
  }

  exportPortCheck = (rules, value, callback) => {
    const { currentIngress, ingressData } = this.props
    const { data } = ingressData || { data: [] }
    if (!value) {
      return callback('监听端口不能为空')
    }
    if (!currentIngress && !isEmpty(data)) {
      const result = data.some(item => item.exportPort === value.toString())
      if (result) {
        return callback('监听端口已存在')
      }
    }
    callback()
  }

  serviceOptions = () => {
    const { allServices } = this.state
    return (allServices || []).map(item =>
      <Option key={item.metadata.name}>{item.metadata.name}</Option>
    )
  }

  renderPorts = () => {
    const { allServices } = this.state
    const { form, type } = this.props
    const { getFieldValue } = form
    const serviceName = getFieldValue('serviceName')
    if (!serviceName) return
    const currentService = allServices.filter(item => item.metadata.name === serviceName)[0]
    if (!currentService) return
    return currentService.spec.ports
      .filter(_item => _item.protocol === type)
      .map(_item => {
      return <Option key={_item.port}>{_item.port}</Option>
    })
  }

  render() {
    const { confirmLoading } = this.state
    const { form ,currentIngress, type } = this.props
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 6 }
    }
    const monitorPortProps = getFieldProps('exportPort', {
      rules: [
        {
          validator: this.exportPortCheck,
        }
      ],
      initialValue: currentIngress ? currentIngress.exportPort : '',
    })
    const serviceProps = getFieldProps('serviceName', {
      rules: [
        {
          required: true,
          message: '请选择服务',
        }
      ],
      initialValue: currentIngress ? currentIngress.serviceName : undefined,
    })
    const containerPortProps = getFieldProps('servicePort', {
      rules: [
        {
          validator: this.containerPortCheck,
        }
      ],
      initialValue: currentIngress ? [currentIngress.servicePort] : [],
    })
    return (
      <Card
        title={currentIngress ? `编辑 ${type} 监听` : `创建 ${type} 监听`}
      >
        <Form form={form}>
          <FormItem
            label="监听端口"
            {...formItemLayout}
          >
            <InputNumber
              disabled={!!currentIngress}
              style={{ width: '100%' }}
              min={10000} max={65535}
              placeholder="监听端口10000-65535"
              {...monitorPortProps}
            />
          </FormItem>
          <FormItem
            label="后端服务"
            {...formItemLayout}
          >
            <Select
              placeholder="请选择服务"
              {...serviceProps}
            >
              {this.serviceOptions()}
            </Select>
          </FormItem>
          <FormItem
            label="容器端口"
            {...formItemLayout}
          >
            <Select
              placeholder={'请选择容器端口'}
              {...containerPortProps}
            >
              {this.renderPorts()}
            </Select>
          </FormItem>
        </Form>
        <DetailFooter
          onCancel={this.goBack}
          onOk={this.handelConfirm}
          loading={confirmLoading}
        />
      </Card>
    )
  }
}

TcpUdpDetail = Form.create()(TcpUdpDetail)

const mapStateToProps = (state, props) => {
  const { type } = props
  const lowerType = type.toLowerCase()
  const ingressData = getDeepValue(state, ['loadBalance', 'tcpUdpIngress', lowerType])
  return {
    ingressData,
  }
}

export default connect(mapStateToProps, {
  createTcpUdpIngress: lbActions.createTcpUdpIngress,
  updateTcpUdpIngress: lbActions.updateTcpUdpIngress,
  loadAllServices: serviceActions.loadAllServices,
  getTcpUdpIngress: lbActions.getTcpUdpIngress,
})(TcpUdpDetail)
