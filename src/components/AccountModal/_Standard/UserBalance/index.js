/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User balance - Standard
 *
 * v0.1 - 2016-12-13
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Icon, Button, Popover, } from 'antd'
import PopContent from '../../../PopSelect/Content'
import { loadLoginUserDetail } from '../../../../actions/entities'
import { loadUserTeamList } from '../../../../actions/user'
import { loadTeamspaceList } from '../../../../actions/team'
import './style/balance.less'

class UserBalance extends Component {
  constructor(props) {
    super(props)
    this.handleTeamChange = this.handleTeamChange.bind(this)
    this.handleTeamListVisibleChange = this.handleTeamListVisibleChange.bind(this)
    this.state = {
      currentTeam: {
        name: '团队账户'
      },
      teamListVisible: false,
    }
  }

  componentWillMount() {
    const { loadLoginUserDetail, loadUserTeamList } = this.props
    loadLoginUserDetail()
    loadUserTeamList('default', { size: -1 })
  }

  handleTeamChange(team) {
    console.log(`team-----------`)
    console.log(team)
    const { loadTeamspaceList } = this.props
    this.setState({
      teamListVisible: false,
      currentTeam: team
    })
    loadTeamspaceList(team.id)
  }

  handleTeamListVisibleChange(visible) {
    this.setState({
      teamListVisible: visible
    })
  }

  render() {
    const { loginUser, isTeamsFetching, teams } = this.props
    const { currentTeam, teamListVisible } = this.state
    let { balance } = loginUser
    if (balance !== undefined) {
      balance = (balance / 100).toFixed(2)
    }
    return (
      <div id="UserBalance">
        <div className="myAccount">
          <div className="topRow"><Icon type="user" className="typeIcon" />我的账户</div>
          <div className="moneyRow">
            <div>余额：<span className="money">{balance || '-'}元</span></div>
            {/*<div>其中优惠券￥5元，充值金额￥100元 &nbsp;<Icon type="question-circle-o" /></div>*/}
          </div>
          <div className="rechargeRow">
            <Button type="primary" size="large" onClick={() => browserHistory.push('/account/balance/payment')}>立即充值</Button>
          </div>
        </div>

        <div className="myTeam">
          <div className="topRow">
            <Icon type="team" className="typeIcon" />
            <Popover
              placement="bottomLeft"
              title="选择团队账户"
              content={
                <PopContent
                  list={teams}
                  onChange={this.handleTeamChange}
                  loading={isTeamsFetching} />
              }
              trigger="click"
              getTooltipContainer={() => document.getElementById('UserBalance')}
              visible={teamListVisible}
              onVisibleChange={this.handleTeamListVisibleChange}
              >
              <span>{currentTeam.name} <Icon type="down" style={{ fontSize: '8px' }} /></span>
            </Popover>
          </div>
          {teams.length > 0 ?
            <div className="moneyRow">
              <div>余额：<span className="money">105元</span></div>
              <div>其中优惠券￥15元，充值金额￥1000元 &nbsp;<Icon type="question-circle-o" /></div>
            </div>
            :
            <div className="moneyRow text-center">
              <i className="fa fa-users" />
              <div className="notText">您还没有团队账户，可以尝试创建团队</div>
              <Button type="primary" onClick={() => browserHistory.push('/account/team')}>去创建</Button>
            </div>
          }
          {teams.length > 0 ?
            <div className="rechargeRow">
              <Button type="primary" size="large" onClick={() => browserHistory.push('/account/balance/payment')}>立即充值</Button>
            </div>
            : null
          }
        </div>

      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities, user, team } = state
  const { current, loginUser } = entities
  const { teams } = user
  return {
    current,
    loginUser: loginUser.info,
    isTeamsFetching: teams.isFetching,
    teams: (teams.result ? teams.result.data.data.items : [])
  }
}

export default connect(mapStateToProps, {
  loadLoginUserDetail,
  loadUserTeamList,
  loadTeamspaceList,
})(UserBalance)
