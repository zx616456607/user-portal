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
import { Modal, Form, Input, Button, Tooltip, Row, Col, Icon } from 'antd'
import Notification from '../../../../src/components/Notification'
import * as serviceActions from '../../../../src/actions/services'
import * as podAction from '../../../../src/actions/app_manage'
import ipRangeCheck from 'ip-range-check'
import { getServiceStatus } from '../../../../src/common/status_identify'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessages from './ContainerHeaderIntl'
import { IP_REGEX } from '../../../../constants'
import * as IPPoolActions from '../../../actions/ipPool'

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
    uuid: 0,
  }

  componentDidMount() {
    const { isSee, getPodNetworkSegment, cluster, intl, currentNetType } = this.props
    if (currentNetType === 'calico') {
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
    }
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
    const { serviceDetail, cluster, form: { setFieldsValue }, currentNetType } = this.props
    const service = Object.keys(serviceDetail[cluster])[0]
    if (currentNetType === 'calico') {
      const ipv4 = getDeepValue(serviceDetail, [ cluster, service, 'service', 'spec', 'template', 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ])
      if (ipv4) {
        const ipv4Arr = JSON.parse(ipv4)
        setFieldsValue({
          replicasIP: ipv4Arr[0],
        })
      }
    } else if (currentNetType === 'macvlan') {
      const ipAssign = getDeepValue(serviceDetail, [ cluster, service, 'service', 'spec', 'template', 'metadata', 'annotations', 'system/reserved-ips' ])
      const ipArr = ipAssign.split(',')
      let ipKeys = []
      let uuid = this.state.uuid
      ipArr.forEach((item, index) => {
        ipKeys = ipKeys.concat(index)
        uuid = ++uuid
        setFieldsValue({
          ipKeys,
          [`replicasIP${index}`]: item,
        })
      })
      this.setState({ uuid })
    }

  }

  handleOk = () => {
    this.props.form.validateFields(async (err, values) => {
      if (err) return
      const { UpdateServiceAnnotation, cluster, serviceDetail, currentNetType,
        containerNum, manualScaleService, intl } = this.props
      const server = Object.keys(serviceDetail[cluster])[0]
      const annotations = getDeepValue(serviceDetail, [ cluster, server, 'service', 'spec', 'template', 'metadata', 'annotations' ]) || {}
      notification.spin(intl.formatMessage(IntlMessages.fixIPing))
      if (currentNetType === 'calico') {
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
        const { replicasIP } = values
        const ipStr = `[\"${replicasIP}\"]`
        Object.assign(annotations, {
          'cni.projectcalico.org/ipAddrs': ipStr,
        })
      } else if (currentNetType === 'macvlan') {
        const { ipKeys } = values
        let ipStr = ''
        ipKeys.forEach(item => {
          ipStr = ipStr + values[`replicasIP${item}`] + ','
        })
        ipStr = ipStr.substring(0, ipStr.length - 1)
        Object.assign(annotations, {
          'system/reserved-ips': ipStr,
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
    const { UpdateServiceAnnotation, onChangeVisible, currentNetType,
      cluster, serviceDetail, loadServiceDetail, intl } = this.props
    const server = Object.keys(serviceDetail[cluster])[0]
    const annotations = getDeepValue(serviceDetail, [ cluster, server, 'service', 'spec', 'template', 'metadata', 'annotations' ]) || {}
    if (currentNetType === 'calico') {
      Object.assign(annotations, {
        'cni.projectcalico.org/ipAddrs': '',
      })
    } else if (currentNetType === 'macvlan') {
      Object.assign(annotations, {
        'system/reserved-ips': '',
      })
    }
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
  checkMacvlan = async (rule, value, callback) => {
    const { ipAssignmentList, getIPAllocations, cluster, serviceDetail } = this.props
    if (!IP_REGEX.test(value)) {
      return callback('请填写格式正确的 ip 地址')
    }
    const server = Object.keys(serviceDetail[cluster])[0]
    const ipAssignment = getDeepValue(serviceDetail, [ cluster, server, 'service', 'spec', 'template', 'metadata', 'annotations', 'system/ip-assignment-name' ])
    const res = await getIPAllocations(cluster, { assignment: ipAssignment })
    const ipList = res.response.result.data
    if (ipList.filter(item => item.spec.ip === value).length > 0) {
      return callback('该 ip 已使用')
    }
    const assignment = ipAssignmentList.filter(item => item.metadata.name === ipAssignment)[0]
    const begin = assignment.spec.begin.split('.')[3]
    const end = assignment.spec.end.split('.')[3]
    const inpVal = value.split('.')[3]
    if (begin > inpVal || inpVal > end) {
      return callback(`请输入在 ${assignment.spec.begin} - ${assignment.spec.end} 间的 ip`)
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

  add = () => {
    let uuid = this.state.uuid
    ++uuid
    const { form } = this.props
    let ipKeys = form.getFieldValue('ipKeys')
    ipKeys = ipKeys.concat(uuid)
    form.setFieldsValue({
      ipKeys,
    })
    this.setState({
      uuid,
    })
  }

  remove = k => {
    const { form } = this.props
    let ipKeys = form.getFieldValue('ipKeys')
    ipKeys = ipKeys.filter(key => {
      return key !== k
    })
    form.setFieldsValue({
      ipKeys,
    })
  }

  render() {
    const { isScale } = this.state
    const { form, configIP, notConfigIP, containerNum, cluster, serviceDetail,
      currentNetType, intl } = this.props
    const { getFieldProps, getFieldValue } = form
    const server = Object.keys(serviceDetail[cluster])[0]
    const service = serviceDetail[cluster][server].service
    const status = getServiceStatus(service)
    const { replicas, availableReplicas } = status
    let isStop = false
    if (!replicas && !availableReplicas) {
      isStop = true
    }
    getFieldProps('ipKeys', {
      initialValue: [ 0 ],
    })
    const canDel = getFieldValue('ipKeys').length <= containerNum
    const formItems = getFieldValue('ipKeys').map((k, ind) => {
      return (
        <FormItem
          key={k}
          {...(ind === 0 ? formItemLayout : { wrapperCol: { span: 19, offset: 5 } })}
          label={ind === 0 ? <FormattedMessage {...IntlMessages.staticIP} /> : ''}
        >
          <Input {...getFieldProps(`replicasIP${k}`, {
            rules: [{
              required: true,
              whitespace: true,
              message: 'intl.formatMessage',
            }, {
              validator: this.checkMacvlan,
            }],
          })}
          style={{ width: 300, marginRight: 15 }}
          placeholder={'intl.formatMessage'}
          />
          <Tooltip placement="top" title={'IP 数需 ≥ 实例数'}>
            <Button
              className="delBtn"
              disabled={canDel}
              onClick={() => this.remove(k)}
              style={{ padding: 4 }}
            >
              <Icon type="delete" />
            </Button>
          </Tooltip>
        </FormItem>
      )
    })
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

            {
              currentNetType === 'calico' ?
                <FormItem
                  wrapperCol={{ span: 16, offset: 5 }}
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
                : <span>
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
                </span>
            }

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
  cluster_nodes: { networksolutions },
  ipPool: { ipAssignmentList: { data } },
}) => {
  const cluster = current.cluster.clusterID
  const currentNetType = networksolutions[cluster].current
  return {
    cluster,
    serviceDetail,
    currentNetType,
    ipAssignmentList: data || [],
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
  getIPAllocations: IPPoolActions.getIPAllocations,
})(injectIntl(Form.create()(ContainerInstance), {
  withRef: true,
}))
