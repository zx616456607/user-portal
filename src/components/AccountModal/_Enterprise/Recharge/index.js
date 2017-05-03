/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Member Recharge
 *
 * v0.1 - 2017/2/22
 * @author BaiYu
 */

import React, { Component } from 'react'
import { InputNumber } from 'antd'
import './style/MemberAccount.less'

class MemberRecharge extends Component {
  constructor(props){
    super(props)
  }

  render () {
    const { parentScope } = this.props
    const { record } = parentScope.state
    return(
      <div className="memberItem">
        <div className="list"><span className="itemKey">成员名</span>{record.name}</div>
        <div className="list"><span className="itemKey">成员类型</span>{record.style}</div>
        <div className="list"><span className="itemKey">余额</span>{record.balance}</div>
        <div className="list">
          <span className="itemKey">充值金额</span>
          <div className={parentScope.state.number ==10 ? "pushMoney selected" : 'pushMoney'} onClick={()=> parentScope.activeMenu(10)}><span>10T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <div className={parentScope.state.number ==20 ? "pushMoney selected" : 'pushMoney'} onClick={()=> parentScope.activeMenu(20)}><span>20T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <div className={parentScope.state.number ==50 ? "pushMoney selected" : 'pushMoney'} onClick={()=> parentScope.activeMenu(50)}><span>50T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <div className={parentScope.state.number ==100 ? "pushMoney selected" : 'pushMoney'} onClick={()=> parentScope.activeMenu(100)}><span>100T</span><div className="triangle"></div><i className="anticon anticon-check"></i></div>
          <div className=""><InputNumber size="large"  onClick={(e)=> parentScope.setState({number: e.target.value})} min={0} step={50} max={99999} onChange={(value)=>parentScope.activeMenu(value) }/> T</div>
        </div>
      </div>
    )
  }
}

export default MemberRecharge