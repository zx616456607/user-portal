/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Charge for user
 *
 * v0.1 - 2017-07-13
 * @author Zhangpc
 */

import React from 'react'
import { Row, Col, InputNumber, Table, Modal, Button } from 'antd'
import { parseAmount } from '../../../common/tools'
import { MAX_CHARGE } from '../../../constants'
import './style/ChargeModal.less'

const CHARGE_NUMBERS = [ 10, 20, 50, 100 ]

export default class ChargeModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedRowKeys: [],
      number: CHARGE_NUMBERS[0],
      users: [],
    }
  }

  componentDidMount() {
    this.props.loadUserList({size: 0}, {
      success: {
        func: res => {
          this.setState({
            users: res.users,
          })
        }
      }
    })
  }

  onRowClick = record => {
    let { selectedRowKeys } = this.state
    const namespace = record.namespace
    const index = selectedRowKeys.indexOf(namespace)
    let newSelectedRowKeys = []
    if (index > -1) {
      selectedRowKeys.splice(index, 1)
    } else {
      selectedRowKeys = selectedRowKeys.concat(namespace)
    }
    this.setState({
      selectedRowKeys,
    })
  }

  render() {
    const { onCancel, onOk, loginUser } = this.props
    const { selectedRowKeys, number, users } = this.state
    const rowSelection = {
      selectedRowKeys,
      onChange: selectedRowKeys => this.setState({ selectedRowKeys }),
    }
    const columns = [{
      title: '成员名',
      dataIndex: 'userName',
      width: '55%'
    }, {
      title: '余额',
      dataIndex: 'balance',
      render: (text, record, index) => {
        const { fullAmount } = parseAmount(text)
        if (selectedRowKeys && selectedRowKeys.indexOf(record.namespace) > -1) {
          return (
            <div>
              <span>{fullAmount}</span>
              <span className="plus"> + {number}T </span>
            </div>
          )
        }
        return fullAmount
      }
    }]
    return (
      <Modal
        {...this.props}
        title="批量成员充值"
        wrapClassName="ChargeModal"
        footer={[
          <div key="number" className="selectedNumber">
            {
              selectedRowKeys.length > 0 && (
                <span>
                  已选中<span className="number"> {selectedRowKeys.length}</span> 个
                </span>
              )
            }
          </div>,
          <Button key="back" type="ghost" size="large" onClick={onCancel}>取 消</Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            onClick={onOk.bind(this, selectedRowKeys, number)}
            disabled={selectedRowKeys.length === 0}
          >
            确 认
          </Button>
        ]}
      >
        <div className="alertRow marginBottom">注：可全选为所有成员批量充值</div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={users}
          pagination={false}
          scroll={{y: 300}}
          onRowClick={this.onRowClick}
          className="marginBottom"
          rowKey={record => record.namespace}
        />
        <Row>
          <Col span={4} className="numberTitle">充值金额</Col>
          <Col span={20} className="numberList">
          {
            CHARGE_NUMBERS.map(_number => (
              <div
                className={number === _number ? "pushMoney selected" : 'pushMoney'}
                onClick={() => this.setState({number: _number})}
              >
                <span>{_number}T</span>
                <div className="triangle"></div>
                <i className="anticon anticon-check"></i>
              </div>
            ))
          }
            <InputNumber
              size="large"
              min={1}
              step={50}
              max={MAX_CHARGE}
              placeholder="自定义"
              value={number}
              onChange={number => this.setState({number})}
            /> T
          </Col>
        </Row>
      </Modal>
    )
  }
}
