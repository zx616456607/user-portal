/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * 实例数量 固定IP
 *
 * v0.1 - 2018-08-21
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Form, Input, Icon, Tooltip } from 'antd'
import './style/ReplicasRestrictIP.less'
import * as podAction from '../../../../../src/actions/app_manage'
import ipRangeCheck from '@tenx-ui/utils/lib/IP/ipRangeCheck'
import * as serviceActions from '../../../../../src/actions/services'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../src/containers/Application/ServiceConfigIntl'

const FormItem = Form.Item

class ReplicasRestrictIP extends React.Component {

  state={
    uuid: 0,
  }

  componentDidMount() {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const num = getFieldValue('replicas')
    let ipKeys = []
    for (let i = 0; i < num; i++) {
      ipKeys = ipKeys.concat(i)
    }
    setFieldsValue({
      ipKeys,
    })
    /*
    // 固定ip暂时只支持固定一个
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
    */
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

  checkPodCidr = async (rule, value, callback) => {
    if (!value) return callback()
    const { intl, form } = this.props
    const NetSegment = form.getFieldValue('ipPool')
    if (!NetSegment) {
      return callback(intl.formatMessage(IntlMessage.NetSegmentUnknow))
    }
    const inRange = ipRangeCheck(value, NetSegment)
    if (!inRange) {
      return callback(intl.formatMessage(IntlMessage.ipPodPlaceholder, { NetSegment }))
    }
    const { getISIpPodExisted, cluster } = this.props
    const isExist = await getISIpPodExisted(cluster, value)
    const { code, data: { isPodIpExisted } } = isExist.response.result
    if (code !== 200) {
      return callback(intl.formatMessage(IntlMessage.checkNetSegmentFail))
    } else if (code === 200 && isPodIpExisted === 'true') {
      return callback(intl.formatMessage(IntlMessage.isUsedAlready))
    }
    callback()
  }

  render() {
    const { form, intl } = this.props
    const { getFieldProps, getFieldValue } = form
    const NetSegment = getFieldValue('ipPool')
    getFieldProps('ipKeys', {
      initialValue: [ ],
    })
    // const isdelete = getFieldValue('replicas')
    //   && getFieldValue('replicas') >= getFieldValue('ipKeys').length
    //   || false
    const formItems = getFieldValue('ipKeys').map(k => {
      return (
        <FormItem key={k} wrapperCol={{ span: 16, offset: 4 }}>
          <Input {...getFieldProps(`replicasIP${k}`, {
            rules: [{
              required: true,
              whitespace: true,
              message: intl.formatMessage(IntlMessage.ipPodPlaceholder, { NetSegment }),
            }, {
              validator: this.checkPodCidr,
            }],
          })}
          style={{ width: 300, marginRight: 15 }}
          placeholder= {intl.formatMessage(IntlMessage.ipPodPlaceholder, { NetSegment }) }
          />
          <Tooltip placement="top" title={intl.formatMessage(IntlMessage.supportOnlyOne)}
          >
            <Icon type="question-circle" style={{ marginLeft: 8 }} />
          </Tooltip>
          {/* <Tooltip placement="top" title={'IP 数需 ≥ 实例数'}>
            <Button
              className="delBtn"
              disabled={isdelete}
              onClick={() => this.remove(k)}
            >
              <Icon type="delete" />
            </Button>
          </Tooltip> */}
        </FormItem>
      )
    })
    // const text = '可添加超出实例数量的固定实例 IP，可以确保水平扩展，自动弹性伸缩等功能可用（否则无法伸缩实例）'
    return <div className="restrictsIP">
      {formItems}
      {/*  // 暂时不支持 固定多个实例 IP

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
      */}
    </div>
  }
}

const mapStateToProps = ({
  entities: { current },
}) => {
  return {
    cluster: current.cluster.clusterID,
  }
}

export default connect(mapStateToProps, {
  getPodNetworkSegment: podAction.getPodNetworkSegment,
  getISIpPodExisted: serviceActions.getISIpPodExisted,
})(injectIntl(ReplicasRestrictIP, {
  withRef: true,
}))
