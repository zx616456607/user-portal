/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Right cloud host modal
 *
 * @author zhangxuan
 * @date 2018-11-30
 */
import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { Modal, Transfer, Button, Row, Col, Form, Input, Icon } from 'antd'
import Ellipsis from '@tenx-ui/ellipsis/lib'
import './style/RightCloudModal.less'
import * as rcIntegrationActions from '../../../../actions/rightCloud/integration'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import isEmpty from 'lodash/isEmpty'
import intlMsg from '../../../../../src/components/ClusterModule/indexIntl'

const FormItem = Form.Item

const mapStateToProps = state => {
  const envs = getDeepValue(state, [ 'rightCloud', 'envs', 'data', 'data' ])
  const hostList = getDeepValue(state, [ 'rightCloud', 'hostList', 'data' ])
  const { isFetching } = state.rightCloud.hostList
  return {
    envs,
    hosts: hostList,
    isFetching,
  }
}

@connect(mapStateToProps, {
  cloudEnvList: rcIntegrationActions.cloudEnvList,
  hostList: rcIntegrationActions.hostList,
})
class RightCloudModal extends React.PureComponent {
  state = {
    step: 'first',
    targetKeys: [],
  }
  componentDidMount() {
    this.props.cloudEnvList()
    this.loadData()
  }

  loadData = async () => {
    const { hostList, form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('rcKeys')
    await hostList({
      pagesize: 1000,
      pagenum: 0,
    })
    const { hosts } = this.props
    const { data } = hosts || { data: [] }
    this.setState({
      originalData: data,
      filterData: data.filter(item => !keys.includes(item.instanceName)),
    })
  }

  filterOption = (inputValue, option) => {
    return option.instanceName.indexOf(inputValue) > -1;
  }

  handleChange = targetKeys => {
    this.setState({ targetKeys });
  }

  step = step => {
    this.setState({
      step,
    })
  }

  handleConfirm = () => {
    const { targetKeys, filterData } = this.state
    const { onCancel, onChange, form } = this.props
    const { getFieldValue } = form
    if (onChange) {
      const data = filterData
        .filter(item => targetKeys.includes(item.id))
        .map(item => {
          const port = getFieldValue(`port-${item.id}`)
          const password = getFieldValue(`password-${item.id}`)
          return Object.assign({}, item, {
            port,
            password,
          })
        })
      onChange(data)
    }
    onCancel()
  }

  renderFooter = () => {
    const { step } = this.state
    const { onCancel, intl: { formatMessage } } = this.props
    return [
      <Button type={'ghost'} key={'cancel'} onClick={onCancel}>{formatMessage(intlMsg.cancel)}</Button>,
      step === 'first' && <Button type={'primary'} key={'next'} onClick={() => this.step('second')}>{formatMessage(intlMsg.nextStep)}</Button>,
      step === 'second' && [
        <Button type={'ghost'} key={'previous'} className="previous-btn" onClick={() => this.step('first')}>{formatMessage(intlMsg.previewStep)}</Button>,
        <Button type={'primary'} key={'confirm'} onClick={this.handleConfirm}>{formatMessage(intlMsg.confirm)}</Button>,
      ],
    ]
  }

  renderTransferFooter = () => {
    const { intl: { formatMessage } } = this.props
    return (
      <Row className="transfer-title">
        <Col span={8}>{formatMessage(intlMsg.hostName)}</Col>
        <Col span={8}>{formatMessage(intlMsg.hostIp)}</Col>
        <Col span={8}>{formatMessage(intlMsg.cloudEnv)}</Col>
      </Row>
    )
  }

  renderCloudEnvName = envId => {
    const { envs } = this.props
    if (isEmpty(envs)) {
      return envs
    }
    const currentEnv = envs.filter(item => item.id === envId)[0]
    return currentEnv ? currentEnv.cloudEnvName : '其他'
  }

  renderItem = item => {
    return (
      <Row className="transfer-item" key={item.id}>
        <Col span={8}><Ellipsis>{item.instanceName}</Ellipsis></Col>
        <Col span={8}>{item.innerIp}</Col>
        <Col span={8}><Ellipsis>{this.renderCloudEnvName(item.cloudEnvId)}</Ellipsis></Col>
      </Row>
    )
  }

  removeItem = key => {
    this.setState(({ targetKeys }) => ({
      targetKeys: targetKeys.filter(_key => _key !== key),
      [`port-${key}`]: '',
      [`password-${key}`]: '',
    }))
  }

  portChange = (value, key) => {
    this.setState({
      [`port-${key}`]: value,
    })
  }

  passwordChange = (value, key) => {
    this.setState({
      [`password-${key}`]: value,
    })
  }

  renderHeader = () => {
    const { intl: { formatMessage } } = this.props
    return (
      <Row className="host-header">
        <Col span={8}>{formatMessage(intlMsg.hostNameWithIp)}</Col>
        <Col span={4} offset={1}>{formatMessage(intlMsg.hostUsername)}</Col>
        <Col span={6} offset={1}>{formatMessage(intlMsg.hostPassword)}</Col>
        <Col span={3} offset={1}>{formatMessage(intlMsg.operation)}</Col>
      </Row>
    )
  }

  renderHostList = () => {
    const { filterData, targetKeys } = this.state
    const { form, intl: { formatMessage } } = this.props
    const { getFieldProps } = form
    return targetKeys.map(key => {
      const currentData = filterData.filter(item => item.id === key)[0]
      return (
        <Row key={key} className="host-row">
          <Col span={8}>
            <Row>
              <Col span={8}>
                <FormItem><Ellipsis>{currentData.instanceName}</Ellipsis></FormItem>
              </Col>
              <Col span={8}>
                <FormItem>{`${currentData.innerIp}:`}</FormItem>
              </Col>
              <Col span={8}>
                <FormItem>
                  <Input
                    {...getFieldProps(`port-${key}`, {
                      initialValue: this.state[`port-${key}`],
                      rules: [{
                        required: true,
                        message: formatMessage(intlMsg.hostIsRequired),
                      }],
                      onChange: e => this.portChange(e.target.value, key),
                    })}
                  />
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={4} offset={1}>
            <FormItem><Ellipsis>{currentData.instanceName}</Ellipsis></FormItem>
          </Col>
          <Col span={6} offset={1}>
            <FormItem>
              <Input
                {...getFieldProps(`password-${key}`, {
                  initialValue: this.state[`password-${key}`],
                  rules: [{
                    required: true,
                    message: formatMessage(intlMsg.passwordRequired),
                  }],
                  onChange: e => this.passwordChange(e.target.value, key),
                })}
              />
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              <Button type="dashed" onClick={() => this.removeItem(key)}>
                <Icon type="delete"/>
              </Button>
            </FormItem>
          </Col>
        </Row>
      )
    })
  }

  render() {
    const { step } = this.state
    const { visible, onCancel, intl: { formatMessage } } = this.props
    return (
      <Modal
        width={750}
        title={formatMessage(intlMsg.rcModalTitle)}
        visible={visible}
        onCancel={onCancel}
        footer={this.renderFooter()}
        wrapClassName="right-cloud-host-modal"
        closable={false}
      >
        {
          step === 'first' ?
            <Transfer
              className="right-cloud-transfer"
              dataSource={this.state.filterData}
              showSearch
              filterOption={this.filterOption}
              operations={[ formatMessage(intlMsg.add), formatMessage(intlMsg.remove) ]}
              titles={[ formatMessage(intlMsg.optionalHost), formatMessage(intlMsg.selectedHost) ]}
              targetKeys={this.state.targetKeys}
              onChange={this.handleChange}
              render={this.renderItem}
              footer={this.renderTransferFooter}
              rowKey={record => record.id}
            />
            :
            <div className="right-cloud-table">
              {this.renderHeader()}
              <div className="host-list-box">
                {this.renderHostList()}
              </div>
            </div>
        }
      </Modal>
    )
  }
}

export default injectIntl(RightCloudModal, {
  withRef: true,
})
