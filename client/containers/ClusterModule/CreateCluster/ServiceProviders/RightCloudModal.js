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
import { Modal, Transfer, Button, Row, Col } from 'antd'
import './style/RightCloudModal.less'

export default class RightCloudModal extends React.PureComponent {
  state = {
    step: 'first',
    mockData: [],
    targetKeys: [],
  }
  componentDidMount() {
    this.getMock()
  }

  getMock = () => {
    const targetKeys = [];
    const mockData = [];
    for (let i = 0; i < 20; i++) {
      const data = {
        key: i,
        instanceName: `内容${i + 1}`,
        innerIp: `内容${i + 1}的描述`,
        cloudEnvName: `环境${i + 1}`,
        chosen: Math.random() * 2 > 1,
      };
      if (data.chosen) {
        targetKeys.push(data.instanceName);
      }
      mockData.push(data);
    }
    this.setState({ mockData, targetKeys });
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
    const { onCancel, onChange } = this.props
    if (onChange) {
      onChange()
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

  renderItem = item => {
    return (
      <Row className="transfer-item">
        <Col span={8}>{item.instanceName}</Col>
        <Col span={8}>{item.innerIp}</Col>
        <Col span={8}>{item.cloudEnvName}</Col>
      </Row>
    )
  }

  renderHeader = () => {
    return (
      <Row className="host-header">
        <Col span={6}>主机名（主机 IP）</Col>
        <Col span={6} offset={1}>主机用户名</Col>
        <Col span={6} offset={1}>主机密码</Col>
        <Col span={3} offset={1}>操作</Col>
      </Row>
    )
  }

  renderHostList = () => {
    // const { mockData, targetKeys } = this.state
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
              dataSource={this.state.mockData}
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
