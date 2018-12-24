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
import { Modal, Transfer, Button, Row, Col, Form, Input, Icon } from 'antd'
import Ellipsis from '@tenx-ui/ellipsis/lib'
import './style/RightCloudModal.less'
import * as rcIntegrationActions from '../../../../actions/rightCloud/integration'
import { getDeepValue } from '../../../../util/util';
import isEmpty from 'lodash/isEmpty'

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
export default class RightCloudModal extends React.PureComponent {
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
        .filter(item => targetKeys.includes(item.instanceName))
        .map(item => {
          const port = getFieldValue(`port-${item.instanceName}`)
          const password = getFieldValue(`password-${item.instanceName}`)
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
    const { onCancel } = this.props
    return [
      <Button type={'ghost'} key={'cancel'} onClick={onCancel}>取消</Button>,
      step === 'first' && <Button type={'primary'} key={'next'} onClick={() => this.step('second')}>下一步</Button>,
      step === 'second' && [
        <Button type={'ghost'} key={'previous'} className="previous-btn" onClick={() => this.step('first')}>上一步</Button>,
        <Button type={'primary'} key={'confirm'} onClick={this.handleConfirm}>确定</Button>,
      ],
    ]
  }

  renderTransferFooter = () => {
    return (
      <Row className="transfer-title">
        <Col span={8}>主机名称</Col>
        <Col span={8}>主机 IP</Col>
        <Col span={8}>云环境</Col>
      </Row>
    )
  }

  renderCloudEnvName = envId => {
    const { envs } = this.props
    if (isEmpty(envs)) {
      return envs
    }
    const currentEnv = envs.filter(item => item.id === envId)[0]
    return currentEnv.cloudEnvName
  }

  renderItem = item => {
    return (
      <Row className="transfer-item">
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
    return (
      <Row className="host-header">
        <Col span={8}>主机名（主机 IP）</Col>
        <Col span={4} offset={1}>主机用户名</Col>
        <Col span={6} offset={1}>主机密码</Col>
        <Col span={3} offset={1}>操作</Col>
      </Row>
    )
  }

  renderHostList = () => {
    const { filterData, targetKeys } = this.state
    const { form } = this.props
    const { getFieldProps } = form
    return targetKeys.map(key => {
      const currentData = filterData.filter(item => item.instanceName === key)[0]
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
                        message: '不能为空',
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
                    message: '密码不能为空',
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
    const { visible, onCancel } = this.props
    return (
      <Modal
        width={750}
        title={'从云管平台--云星添加主机'}
        visible={visible}
        onCancel={onCancel}
        footer={this.renderFooter()}
        wrapClassName="right-cloud-host-modal"
      >
        {
          step === 'first' ?
            <Transfer
              className="right-cloud-transfer"
              dataSource={this.state.filterData}
              showSearch
              filterOption={this.filterOption}
              operations={[ '添加', '移出' ]}
              titles={[ '可选主机', '已选主机' ]}
              targetKeys={this.state.targetKeys}
              onChange={this.handleChange}
              render={this.renderItem}
              footer={this.renderTransferFooter}
              rowKey={record => record.instanceName}
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
