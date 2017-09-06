/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2017/6/26
 * @author XuLongcheng
 */
import React, { Component } from 'react'
import { Row, Col, Button, Popover, Spin, Modal } from 'antd'
import './style/PersonalResource.less'
import { browserHistory } from 'react-router'
import { setCurrent } from '../../../actions/entities'
import { loadTeamClustersList } from '../../../actions/team'
import { connect } from 'react-redux'
import PopContent from '../../PopSelect/Content'
import NotificationHandler from '../../../components/Notification'
import { parseAmount } from '../../../common/tools'
import servicenumberImg from '../../../../static/img/servicenumber.svg'
import applicationnumberImg from '../../../../static/img/applicationnumber.svg'
import containercountImg from '../../../../static/img/containercount.svg'
import SpaceRecharge from '../_Enterprise/Recharge/SpaceRecharge'
import { ROLE_SYS_ADMIN } from '../../../../constants'


let PersonalSpace = React.createClass({
  getInitialState() {
    return {

    }
  },
  render: function () {
    let { appCount, serviceCount, containerCount } = this.props
    return (
      <div>
        <Row className="contentTop">
          <Col span={7}>
            <div className="infImg">
              <img style={{width:'100%'}} src={applicationnumberImg}/>
            </div>
            <span className="infImgTxt">应用数： {appCount}个</span>
          </Col>
          <Col span={7}>
            <div className="infImg">
              <img style={{width:'100%'}} src={servicenumberImg}/>
            </div>
            <span className="infImgTxt">服务数： {serviceCount}个</span>
          </Col>
          <Col span={7}>
            <div className="infImg">
              <img style={{width:'100%'}} src={containercountImg}/>
            </div>
            <span className="infImgTxt">容器数： {containerCount}个</span>
          </Col>
        </Row>
      </div>
    )
  }
})


export default class PersonalResource extends Component {
  constructor(props) {
    super(props)
    this.state = {
      spaceVisible: false,
      selected: []
    }
  }
  btnRecharge(index) {
    this.setState({selected: [index], spaceVisible: true})
  }
  render() {
    const {userDetail, appCount, serviceCount, containerCount} = this.props
    return (
      <div id='Spaces'>
        <div className="Essentialinformation">个人项目资源</div>
        <Row className="spaceWrap">
          <div className="spaceContent">
            <PersonalSpace appCount={appCount}
              serviceCount={serviceCount}
              containerCount={containerCount} />
          </div>
        </Row>
      </div>
    )
  }
}