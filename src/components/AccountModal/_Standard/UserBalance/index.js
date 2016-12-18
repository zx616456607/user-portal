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
import { loadUserTeamspaceList } from '../../../../actions/user'
import { loadSpaceSummary } from '../../../../actions/consumption'
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
    const { loadLoginUserDetail, loadUserTeamspaceList } = this.props
    loadLoginUserDetail()
    loadUserTeamspaceList('default', { size: -1 })
  }

  handleTeamChange(team) {
    const { loadSpaceSummary } = this.props
    this.setState({
      teamListVisible: false,
      currentTeam: team
    })
    loadSpaceSummary(team.namespace)
  }

  handleTeamListVisibleChange(visible) {
    this.setState({
      teamListVisible: visible
    })
  }

  render() {
    let { loginUser, isTeamsFetching, teamspaces, isSpaceBalanceFetching, spaceBalance } = this.props
    const { currentTeam, teamListVisible } = this.state
    let { balance } = loginUser
    if (balance !== undefined) {
      balance = (balance / 100).toFixed(2)
    }
    if (spaceBalance !== undefined) {
      spaceBalance = (spaceBalance / 100).toFixed(2)
    }
    // show team name instand of space name in standard mode
    teamspaces.map(space => {
      space.name = space.teamName
    })
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
                  list={teamspaces}
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
          {teamspaces.length > 0 ?
            <div className="moneyRow">
              <div>余额：<span className="money">{isSpaceBalanceFetching ? <Icon type="loading" /> : spaceBalance}元</span></div>
              {/*<div>其中优惠券￥15元，充值金额￥1000元 &nbsp;<Icon type="question-circle-o" /></div>*/}
            </div>
            :
            <div className="moneyRow text-center">
              <i className="fa fa-users" />
              <div className="notText">您还没有团队账户，可以尝试创建团队</div>
              <Button type="primary" onClick={() => browserHistory.push('/account/team')}>去创建</Button>
            </div>
          }
          {teamspaces.length > 0 ?
            <div className="rechargeRow">
              <Button type="primary" size="large" onClick={() => browserHistory.push(`/account/balance/payment?team=${currentTeam.teamName}&namespace=${currentTeam.namespace}`)}>立即充值</Button>
            </div>
            : null
          }
        </div>

      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities, user, consumption } = state
  const { current, loginUser } = entities
  const { teamspaces } = user
  const { spaceSummary } = consumption
  return {
    current,
    loginUser: loginUser.info,
    isTeamsFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    isSpaceBalanceFetching: spaceSummary.isFetching,
    spaceBalance: spaceSummary.result ? spaceSummary.result.data.balance : 0
  }
}

export default connect(mapStateToProps, {
  loadLoginUserDetail,
  loadUserTeamspaceList,
  loadSpaceSummary,
})(UserBalance)
