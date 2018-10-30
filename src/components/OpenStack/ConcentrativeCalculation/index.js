/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Concentrative Calculation component
 *
 * v0.1 - 2017-7-28
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Menu } from 'antd'
import { connect } from 'react-redux'
import './style/index.less'
// import { setOperationLogs } from '../../../actions/manage_monitor'
import ConcentrativeCalculationImg from '../../../../static/img/baseStation/ConcentrativeCalculation.png'
import Title from '../../Title'

const SubMenu = Menu.SubMenu;

class ConcentrativeCalculation extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  // componentWillMount() {
  //   this.props.setOperationLogs({
  //     operationType: 2,
  //     resourceType: 68, //集中式计算
  //     resourceName: 'ConcentrativeCalculation',
  //     status: 200
  //   })
  // }

  render() {
    return(
      <div id='concentrative_calculation'>
        <div className='title'>集中式计算</div>
        <Title title="集中式计算" />
        <div className='body'>
          <div>
            <div className='left_col'>
              <img src={ConcentrativeCalculationImg}/>
            </div>
            <div className='right_col'>
              <div className="tips">
                云资源管理系统对一体化"国网云"中集中式架构下资源池进行统一管理。
              </div>
              <div className='menu_box'>
                <Menu
                  mode='inline'
                >
                  <SubMenu key="sub1" title={<div className='label'>主要功能如下:</div>}>
                    <Menu.Item key="1" className='reset_menu_item_style'>· 服务申请：在集中式计算池申请计算资源；</Menu.Item>
                    <Menu.Item key="2" className='reset_menu_item_style'>· 资源操作：对于集中式计算池的计算资源进行操作，包括启动、停止、暂停、资源释放、资源变更；</Menu.Item>
                    <Menu.Item key="3" className='reset_menu_item_style'>· 告警信息：查询计算资源告警信息，并显示资源详情。</Menu.Item>
                  </SubMenu>
                </Menu>
              </div>
            </div>
            <div className="checkbox"></div>
          </div>
          <div>
            <div className='left_col login_in'></div>
            <div className='login_in_button right_col'>
              <a href={this.props.puhua.centralizedComputing} className='login_button' target="_blank">登录管理</a>
            </div>
            <div className="checkbox"></div>
          </div>

        </div>
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  const { loginUser } = state.entities
  const { puhua } = loginUser.info
  return {
    puhua: puhua || {}
  }
}

export default connect(mapStateToProp, {
  // setOperationLogs
})(ConcentrativeCalculation)