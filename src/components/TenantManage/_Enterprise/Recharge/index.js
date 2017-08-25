/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Member Recharge
 *
 * v0.1 - 2017/6/26
 * @author XuLongcheng
 */

import React, { Component } from 'react'
import { InputNumber, Form } from 'antd'
import './style/MemberAccount.less'
import { MAX_CHARGE, CHARGE_NUMBERS }  from '../../../../constants'

let MemberRecharge = React.createClass({
  componentWillReceiveProps(nextProps) {
    if (!this.props.parentScope.state.visibleMember) {
      // reset form value
      this.props.form.resetFields()
    }
  },
  checkCharge(rule, value, callback) {
    const form = this.props.form
    const _this = this
    const { parentScope } = this.props
    if (typeof value == 'undefined') {
      callback(new Error('请输入数字    '))
      return
    }
    value = parseFloat(value)
    parentScope.setState({number: value})
    let itemBalance =  Number(parentScope.state.record.balance.replace('T',' '))
    if ((itemBalance + value) > MAX_CHARGE ){
      let isvisble = Math.floor((MAX_CHARGE - itemBalance))
      let visible = isvisble > 0 ? isvisble : 0
      callback([new Error(`成员名${parentScope.state.record.namespace}，最大可充值 ${visible}`)])
      return
    }
    callback()
  },
  otherNumber(e) {
    const { parentScope } = this.props
    let number = parseFloat(e.target.value)
    if (!/^\d+$/.test(number)) {
      number = 10
    }
    parentScope.setState({number})
  },
  render () {
    const { parentScope } = this.props
    const { record } = parentScope.state
    const { getFieldProps } = this.props.form
    const autoNumberProps = getFieldProps('autonNumber',{
      rules: [
        { validator: this.checkCharge },
      ],
      trigger: ['onChange'],
      initialValue: parseFloat(parentScope.state.number)
    })
    return(
      <div className="memberItem">
        <Form horizontal>
          <Form.Item
            label="成员名"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
          >
            {record.name}
          </Form.Item>
          <Form.Item
            label="成员类型"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
          >
            {record.style}
          </Form.Item>
          <Form.Item
            label="余额"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
          >
            {record.balance}
          </Form.Item>
          <Form.Item
            label="充值金额"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
          >
            <div className="list">
              {
                CHARGE_NUMBERS.map(num => (
                  <div
                    className={parentScope.state.number == num ? "pushMoney selected" : 'pushMoney'}
                    onClick={()=> parentScope.activeMenu(num)}
                    key={`charge-${num}`}
                  >
                    <span>{num}T</span>
                    <div className="triangle"></div>
                    <i className="anticon anticon-check"></i>
                  </div>
                ))
              }
              <div style={{float:'left', width:'100px'}}>
                <InputNumber {...autoNumberProps} size="large" onClick={(e)=> this.otherNumber(e)} min={0} step={50} max={MAX_CHARGE}/> T
              </div>
            </div>
          </Form.Item>
        </Form>
      </div>
    )
  }
})

MemberRecharge = Form.create()(MemberRecharge)

export default MemberRecharge