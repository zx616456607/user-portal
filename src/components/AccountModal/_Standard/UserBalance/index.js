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
import { Icon, Button, Popover, Modal } from 'antd'
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
    this.closeTestingKnowModal = this.closeTestingKnowModal.bind(this)
    this.state = {
      currentTeam: {
        name: '团队帐户'
      },
      teamListVisible: false,
      testingKonwShow: false
    }
  }

  componentWillMount() {
    document.title = '充值/续费 | 时速云'
    const { currentTeamName, loadLoginUserDetail, loadUserTeamspaceList } = this.props
    let testingKnowFlag = window.localStorage.getItem('testingKnowFlag');
      console.log(!Boolean(testingKnowFlag))
    if(!Boolean(testingKnowFlag)) {
      this.setState({
        testingKonwShow: true
      });
      window.localStorage.setItem('testingKnowFlag', true);
    }
    loadLoginUserDetail()
    loadUserTeamspaceList('default', { size: 100 }).then(({response}) => {
      const { teamspaces } = response.result
      let currentTeam
      if (teamspaces) {
        teamspaces.map(teamspace => {
          if (teamspace.teamName == currentTeamName) {
            currentTeam = teamspace
          }
        })
        if (!currentTeam) {
          currentTeam = teamspaces[0]
        }
        this.setState({
          currentTeam,
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
  
  closeTestingKnowModal() {
    //this function for close test know modal
    this.setState({
      testingKonwShow: false
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
          <div className="topRow"><Icon type="user" className="typeIcon" />我的帐户</div>
          <div className="moneyRow">
            <div>余额：
              <span className="unit">￥</span>
              <span className="money">{balance}</span>
            </div>
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
              title="选择团队帐户"
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
              <div>余额：
                <span className="unit">￥</span>
                <span className="money">{spaceBalance}</span>
              </div>
            </div>
            :
            <div className="moneyRow text-center">
              <i className="fa fa-users" />
              <div className="notText">您还没有团队帐户，可以尝试创建团队</div>
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
              <div className="moneyRow">
                <span className="unit">￥</span>
                <span className="money">0/月</span>
              </div>
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
              <div className="moneyRow">
                <span className="unit">￥</span>
                <span className="money">99</span>/月
              </div>
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
        <Modal visible={this.state.testingKonwShow} className='testingKnowModal'>
          <div className='titleBox'>
            <img className='tagImg' src='/img/version/knowntag.png' />
            <p>时速云内测期间须知</p>
            <Icon className='closeBtn' type='cross' onClick={this.closeTestingKnowModal} />            
          </div>
          <div className='infoBox'>
            <p className='bigTitle'>更新须知</p>
            <div className='infoDetail'>
              <div className='num'>1</div>
              <span className='info'>旧平台中的『资源』待内测结束后，将为您逐渐稳步迁移到新平台</span>
            </div>
            <div className='infoDetail'>
              <div className='num'>2</div>
              <span className='info'>新平台与旧平台的『计费』是相对独立的，内测结束后会将两平台费用&消费整合统一管理</span>
            </div>
            <div className='infoDetail'>
              <div className='num'>3</div>
              <span className='info'>完成新版中『个人认证』或『企业认证』，可以获得体验金</span>
            </div>
            <div className='infoDetail'>
              <div className='num'>4</div>
              <span className='info'>若为 v2.0 专业版，在团队中『邀请新成员』，未注册过时速云账号的新成员可到时速云官网注册</span>
            </div>
          </div>
          <div className='btnBox'>
            <div className='knowBtn' onClick={this.closeTestingKnowModal}>
              <span>知道了</span>
            </div>
          </div>
        </Modal>
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
