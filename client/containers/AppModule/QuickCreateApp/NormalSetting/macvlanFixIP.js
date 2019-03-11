/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 *
 * macvlan 固定IP
 *
 * v0.1 - 2019-02-14
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Form, Input, Icon, Tooltip, Row, Col, Button } from 'antd'
import './style/ReplicasRestrictIP.less'
import * as podAction from '../../../../../src/actions/app_manage'
import * as serviceActions from '../../../../../src/actions/services'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../src/containers/Application/ServiceConfigIntl'
import * as IPPoolActions from '../../../../actions/ipPool'
// import { IP_REGEX } from '../../../../../constants'
import { isIP } from '@tenx-ui/utils/lib/IP/isIP'
import { checkIPInRange } from '../../../../../kubernetes/ip'
const FormItem = Form.Item

class ReplicasRestrictIP extends React.Component {

  state={
    uuid: 0,
  }

  componentDidMount() {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const num = getFieldValue('replicas')
    let uuid = this.state.uuid
    let ipKeys = []
    for (let i = 0; i < num; i++) {
      ipKeys = ipKeys.concat(i)
      uuid = ++uuid
    }
    this.setState({ uuid })
    setFieldsValue({
      ipKeys,
    })
    this.props.Events.on('changeReplics', v => {
      const ipNum = getFieldValue('ipKeys').length
      if (v > ipNum) {
        let oldKey = getFieldValue('ipKeys')
        let uuNum = this.state.uuid
        for (let i = ipNum; i < v; i++) {
          oldKey = oldKey.concat(uuNum)
          uuNum = ++uuNum
        }
        setFieldsValue({
          ipKeys: oldKey,
        })
        this.setState({ uuid: uuNum })
      }
    })
  }

  componentWillUnmount() {
    const { form } = this.props
    const ipKeys = form.getFieldValue('ipKeys')
    ipKeys.forEach(i => {
      form.setFieldsValue({
        [`replicasIP${i}`]: undefined,
      })
    })
    form.setFieldsValue({
      ipKeys: [],
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

  add = () => {
    const { uuid } = this.state
    const { form } = this.props
    let ipKeys = form.getFieldValue('ipKeys')
    ipKeys = ipKeys.concat(uuid)
    form.setFieldsValue({
      ipKeys,
    })
    this.setState({
      uuid: uuid + 1,
    })
  }

  checkPodCidr = async (rule, value, callback, key) => {
    if (!value) return callback()
    const { form, ipAssignmentList, getIPAllocations, cluster,
      form: { getFieldsValue } } = this.props
    const ipAssignment = form.getFieldValue('ipAssignment')
    if (!ipAssignment) {
      return callback('请先选择地址池')
    }
    if (!isIP(value)) {
      return callback('请填写格式正确的 ip 地址')
    }
    const res = await getIPAllocations(cluster, { assignment: ipAssignment })
    const ipList = res.response.result.data
    if (ipList.filter(item => item.spec.ip === value).length > 0) {
      return callback('该 ip 已使用')
    }
    const assignment = ipAssignmentList.filter(item => item.metadata.name === ipAssignment)[0]
    const isInRange = checkIPInRange(value, assignment.spec.begin, assignment.spec.end)
    if (!isInRange) {
      return callback(`请输入在 ${assignment.spec.begin} - ${assignment.spec.end} 间的 ip`)
    }
    const iPObj = getFieldsValue()
    iPObj.ipKeys.forEach(item => {
      if (item !== key && iPObj[`replicasIP${item}`] === value) {
        return callback('该 IP 地址已填写, 请重新填写')
      }
    })
    callback()
  }

  render() {
    const { form, intl } = this.props
    const { getFieldProps, getFieldValue } = form
    const NetSegment = getFieldValue('ipAssignment')
    getFieldProps('ipKeys', {
      initialValue: [ 0 ],
    })
    const isdelete = getFieldValue('replicas')
      && getFieldValue('replicas') >= getFieldValue('ipKeys').length
      || false
    const formItems = getFieldValue('ipKeys').map(k => {
      return (
        <FormItem key={k} wrapperCol={{ span: 16, offset: 4 }}>
          <Input {...getFieldProps(`replicasIP${k}`, {
            rules: [{
              required: true,
              whitespace: true,
              message: intl.formatMessage(IntlMessage.ipPodPlaceholder, { NetSegment }),
            }, {
              validator: (rule, value, callback) => (
                this.checkPodCidr(rule, value, callback, k)
              ),
            }],
          })}
          style={{ width: 300, marginRight: 15 }}
          placeholder= {intl.formatMessage(IntlMessage.ipPodPlaceholder, { NetSegment }) }
          />
          <Tooltip placement="top" title={'IP 数需 ≥ 实例数'}>
            <Button
              className="delBtn"
              disabled={isdelete}
              onClick={() => this.remove(k)}
            >
              <Icon type="delete" />
            </Button>
          </Tooltip>
        </FormItem>
      )
    })
    const text = '可添加超出实例数量的固定实例 IP，可以确保水平扩展，自动弹性伸缩等功能可用（否则无法伸缩实例）'
    return <div className="restrictsIP">
      {formItems}
      <Row className="addInstance">
        <Col span={4}></Col>
        <Col>
          <span onClick={this.add} className="add">
            <Icon type="plus-circle-o" style={{ marginRight: 8 }}/>
            添加实例 IP
          </span>
          <span className="add">
            <Tooltip placement="top" title={text}>
              <Icon type="question-circle" style={{ marginLeft: 8 }} />
            </Tooltip>
          </span>
        </Col>
      </Row>
    </div>
  }
}

const mapStateToProps = ({
  entities: { current },
  ipPool: { ipAssignmentList: { data } },
}) => {
  return {
    cluster: current.cluster.clusterID,
    ipAssignmentList: data || [],
  }
}

export default connect(mapStateToProps, {
  getPodNetworkSegment: podAction.getPodNetworkSegment,
  getISIpPodExisted: serviceActions.getISIpPodExisted,
  getIPAllocations: IPPoolActions.getIPAllocations,
})(injectIntl(ReplicasRestrictIP, {
  withRef: true,
}))
