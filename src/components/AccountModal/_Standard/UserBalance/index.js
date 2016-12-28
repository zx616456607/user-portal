/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
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
import { parseAmount } from '../../../../common/tools'
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
    document.title = '充值/续费 | 时速云'
    const { currentTeamName, loadLoginUserDetail, loadUserTeamspaceList } = this.props
    loadLoginUserDetail()
    loadUserTeamspaceList('default', { size: 100 }).then(({response}) => {
      const { teamspaces } = response.result
      if (teamspaces) {
        teamspaces.map(teamspace => {
          if (teamspace.teamName == currentTeamName) {
            let currentTeam = teamspace
            this.setState({
              currentTeam,
            })
          }
        })
      }
    })
  }

  handleTeamChange(team) {
    this.setState({
      teamListVisible: false,
      currentTeam: team
    })
  }

  handleTeamListVisibleChange(visible) {
    this.setState({
      teamListVisible: visible
    })
  }

  render() {
    let { loginUser, isTeamsFetching, teamspaces, } = this.props
    const { currentTeam, teamListVisible } = this.state
    let { balance, envEdition } = loginUser
    let spaceBalance = currentTeam.balance
    if (balance !== undefined) {
      balance = parseAmount(balance).amount
    }
    if (spaceBalance !== undefined) {
      spaceBalance = parseAmount(spaceBalance).amount
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
              <div>余额：<span className="money">{spaceBalance}元</span></div>
              {/*<div>其中优惠券￥15元，充值金额￥1000元 &nbsp;<Icon type="question-circle-o" /></div>*/}
            </div>
            :
            <div className="moneyRow text-center">
              <i className="fa fa-users" />
              <div className="notText">您还没有团队账户，可以尝试创建团队</div>
              <Button type="primary" onClick={() => browserHistory.push('/account/teams')}>去创建</Button>
            </div>
          }
          {teamspaces.length > 0 ?
            <div className="rechargeRow">
              <Button type="primary" size="large" onClick={
                () => browserHistory.push({
                  pathname: '/account/balance/payment',
                  query: { team: currentTeam.teamName }
                })
              }>
                立即充值
              </Button>
            </div>
            : null
          }
        </div>
        {
          envEdition == 0
          ? (
            <div className="version">
              <div className="topRow">
                <img className="edition" alt="升级专业版" title="升级专业版" src="/img/version/proIcon-gray.png"/>
                &nbsp;标准版
              </div>
              <div className="moneyRow"><span className="money">0元/月</span></div>
              <div className="rechargeRow">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => browserHistory.push('/account/balance/payment#upgrade')}>
                  升级专业版
                </Button>
              </div>
            </div>
          )
          : (
            <div className="version">
              <div className="topRow">
                <img className="edition" alt="专业版" title="专业版" src="/img/version/proIcon.png"/>
                &nbsp;专业版
              </div>
              <div className="moneyRow"><span className="money">99元/月</span></div>
              <div className="rechargeRow">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => browserHistory.push('/account/balance/payment#renewals')}>
                  续费专业版
                </Button>
              </div>
            </div>
          )
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  let currentTeamName = ""
  if (props.location && props.location.query) {
     currentTeamName = props.location.query.team
  }
  const { entities, user } = state
  const { current, loginUser } = entities
  const { teamspaces } = user
  return {
    current,
    currentTeamName,
    loginUser: loginUser.info,
    isTeamsFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
  }
}

export default connect(mapStateToProps, {
  loadLoginUserDetail,
  loadUserTeamspaceList,
})(UserBalance)
