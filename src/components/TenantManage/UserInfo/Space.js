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
import './style/Space.less'
import { browserHistory } from 'react-router'
import { setCurrent } from '../../../actions/entities'
import { loadTeamClustersList } from '../../../actions/team'
import { connect } from 'react-redux'
import PopContent from '../../PopSelect/Content'
import NotificationHandler from '../../../common/notification_handler'
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
            <span className="infImgTxt">应数： {appCount}个</span>
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

let TeamSpace = React.createClass({
  getInitialState() {
    return {
      currentSpace: null
    }
  },
  handleVisibleChange(teamspace, visible) {
    if (!visible) {
      return
    }
    const { loadTeamClustersList } = this.props
    loadTeamClustersList(teamspace.teamID)
    this.setState({
      currentSpace: teamspace
    })
  },
  handleClusterChange(cluster) {
    const { setCurrent } = this.props
    const { currentSpace } = this.state
    let notification = new NotificationHandler()
    setCurrent({
      team: {
        teamID: currentSpace.teamID
      },
      space: currentSpace,
      cluster,
    })
    let msg = `已进入空间 ${currentSpace.spaceName}（集群：${cluster.clusterName}）`
    notification.success(msg)
    browserHistory.push('/')
  },
  render: function () {
    let firstRow = true
    let className = ""
    let Search = false
    const { userDetail } = this.props
    const {
      teamspaces,
      isTeamClustersFetching,
      teamClusters,
      teamID,
    } = this.props
    let items = teamspaces.map((teamspace, index) => {
      if (firstRow) {
        className = "contentList firstItem"
        firstRow = false
      } else {
        className = "contentList"
      }
      let text = <span>请选择集群</span>
      let contentClusterList = []
      if (teamID === teamspace.teamID) {
        contentClusterList = teamClusters
      }
      return (
        <Row className={className} key={teamspace.spaceName}>
          <Col span={4}>{teamspace.spaceName}</Col>
          <Col span={5}>{teamspace.teamName}</Col>
          <Col span={2}>{teamspace.appCount}</Col>
          <Col span={2}>{teamspace.serviceCount}</Col>
          <Col span={2}>{teamspace.containerCount}</Col>
          <Col span={3}>{parseAmount(teamspace.balance).fullAmount}</Col>
          <Col span={6}>
            <Popover
              placement="right"
              title={text}
              content={
                <PopContent
                  Search={Search}
                  list={contentClusterList}
                  onChange={this.handleClusterChange}
                  loading={isTeamClustersFetching} />
              }
              trigger="click"
              getTooltipContainer={() => document.getElementsByClassName('contentTop')[0]}
              onVisibleChange={this.handleVisibleChange.bind(this, teamspace)}>
              <Button type="primary">进入空间</Button>
            </Popover>
            {(userDetail.role == ROLE_SYS_ADMIN) ?
              <Button type="primary" style={{marginLeft:'20px'}} onClick={()=>　this.props.scope.btnRecharge(index)}>充值</Button>
              :null
            }
          </Col>
        </Row>
      )
    })
    return (
      <div>
        <Row className="contentTop">
          <Col span={4}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingname" />
            </svg>
            <span className="infSvgTxt">空间名称</span>
          </Col>
          <Col span={5}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingownteam" />
            </svg>
            <span className="infSvgTxt">空间所属团队</span>
          </Col>
          <Col span={2}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingapp" />
            </svg>
            <span className="infSvgTxt">应用</span>
          </Col>
          <Col span={2}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingservice" />
            </svg>
            <span className="infSvgTxt">服务</span>
          </Col>
          <Col span={2}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingcontainer" />
            </svg>
            <span className="infSvgTxt">容器</span>
          </Col>
          <Col span={3}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingbalance" />
            </svg>
            <span className="infSvgTxt">余额</span>
          </Col>
          <Col span={6}>
            <svg className="infSvg" style={{ marginRight: 8 }}>
              <use xlinkHref="#settingopt" />
            </svg>
            <span className="infSvgTxt">操作</span>
          </Col>
        </Row>
        {items}
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { current } = state.entities
  const { teamClusters } = state.team
  const userDetail = state.entities.loginUser.info
  return {
    userDetail,
    current,
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
    teamID: (teamClusters.result ? teamClusters.result.teamID : null),
  }
}

TeamSpace = connect(mapStateToProps, {
  loadTeamClustersList,
  setCurrent,
})(TeamSpace)


export default class Space extends Component {
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
    const {userDetail, appCount, serviceCount, containerCount, teamspaces} = this.props
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