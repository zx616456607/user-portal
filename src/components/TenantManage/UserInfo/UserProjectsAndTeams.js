/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * User projects and teams
 *
 * v0.1 - 2017-07-14
 * @author Zhangpc
 */

import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Table, Button, Icon, Input, Modal, Row, Col, Transfer } from 'antd'
import { Link, browserHistory } from 'react-router'
import { formatDate } from '../../../common/tools'
import { loadUserTeamList } from '../../../actions/user'
import { removeTeamusers } from '../../../actions/team'
import { GetProjectsMembers } from '../../../actions/project'
import NotificationHandler from '../../../components/Notification'
import JoinProjectsModal from './JoinProjectsModal'
import './style/UserProjectsAndTeams.less'

const TabPane = Tabs.TabPane

class UserProjectsAndTeams extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projectSortedInfo: null,
      teamSortedInfo: null,
      removeMemberModalVisible: false,
      removeMemberBtnLoading: false,
      currentTeam: {},
      allTeams: [
        {
          key: 1,
          teamName: 'asdfasdfasdfasdfasdf',
        }
      ],
      teamTargetKeys: [],
      teamTransferModalVisible: false,
      joinProjectsModalVisible: false,
    }
    this.loadData = this.loadData.bind(this)
    this.handleTeamChange = this.handleTeamChange.bind(this)
    this.removeMember = this.removeMember.bind(this)
    this.handleTeamTransferChange = this.handleTeamTransferChange.bind(this)
  }

  loadData() {
    const { userId, loadUserTeamList, GetProjectsMembers } = this.props
    loadUserTeamList(userId, null, {
      success: {
        func: res => {
          const teamTargetKeys = []
          res.teams.map(team => {
            if (team.userCount > 0) {
              teamTargetKeys.push(team.teamID)
            }
          })
          this.setState({
            teamTargetKeys,
          })
        }
      }
    })
    GetProjectsMembers(null, {
      success: {
        func: res => {
          res.data.teamList.map(team => {
            team.key = team.teamId
          })
          this.setState({
            allTeams: res.data.teamList,
          })
        }
      }
    })
  }

  componentWillMount() {
    this.loadData()
  }

  handleTeamChange(pagination, filters, sorter) {
    this.setState({
      teamSortedInfo: sorter,
    })
  }

  removeMember() {
    const notification = new NotificationHandler()
    const { userId, removeTeamusers } = this.props
    const { currentTeam } = this.state
    this.setState({
      removeMemberBtnLoading: true,
    })
    const doSuccess = () => {
      notification.success("移除用户成功")
      this.loadData()
      this.setState({
        removeMemberModalVisible: false,
      })
    }
    removeTeamusers(currentTeam.teamID, userId, {
      success: {
        func: () => {
          doSuccess()
        },
        isAsync: true
      },
      failed: {
        func: err => {
          if (err.statusCode == 401) {
            notification.error("没有权限从团队中移除创建者")
          } else if (err.statusCode == 404) {
            doSuccess()
          } else {
            notification.error(err.message.message)
          }
        },
        isAsync: true
      },
      finally: {
        func: () => {
          this.setState({
            removeMemberBtnLoading: false,
          })
        }
      }
    })
  }

  handleTeamTransferChange(teamTargetKeys) {
    this.setState({ teamTargetKeys })
  }

  render() {
    const { teams, userDetail } = this.props
    let {
      teamSortedInfo, removeMemberModalVisible, currentTeam,
      teamTargetKeys, allTeams, teamTransferModalVisible,
      joinProjectsModalVisible,
    } = this.state
    const projectColumns = [
      {
        title: '项目名',
        dataIndex: 'teamName',
        key: 'teamName',
        width: '25%',
        render: (text, record, index) => (
          <Link to={`/tenant_manage/team/${record.teamName}/${record.teamID}`}>
            {record.teamName}
          </Link>
        )
      },
      {
        title: '项目角色',
        dataIndex: 'userCount',
        key: 'userCount',
        width: '25%',
      },
      {
        title: '参与时间',
        dataIndex: 'creationTime',
        key: 'creationTime',
        width: '25%',
        render: text => formatDate(text)
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (e, record) => (
          <div className="action">
            <Button
              type="primary"
              className="setBtn"
              onClick={() => browserHistory.push(`/tenant_manage/team/${record.teamName}/${record.teamID}`)}
            >
              查看项目
            </Button>
            <Button
              onClick={() => this.setState({ currentTeam: record, removeMemberModalVisible: true })}
              className="delBtn setBtn"
            >
              移出项目
            </Button>
          </div>
        ),
      },
    ]
    teamSortedInfo = teamSortedInfo || {}
    const teamColumns = [
      {
        title: "团队名",
        dataIndex: 'teamName',
        key: 'teamName',
        width: '25%',
        render: (text, record, index) => (
          <Link to={`/tenant_manage/team/${record.teamName}/${record.teamID}`}>
            {record.teamName}
          </Link>
        )
      },
      {
        title: '成员数',
        dataIndex: 'userCount',
        key: 'userCount',
        width: '25%',
        sorter: (a, b) => a.userCount - b.userCount,
        sortOrder: teamSortedInfo.columnKey === 'userCount' && teamSortedInfo.order,
      },
      {
        title: '进团时间',
        dataIndex: 'creationTime',
        key: 'creationTime',
        width: '25%',
        render: text => formatDate(text)
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (e, record) => (
          <div className="action">
            <Button
              type="primary"
              className="setBtn"
              onClick={() => browserHistory.push(`/tenant_manage/team/${record.teamName}/${record.teamID}`)}
            >
              查看团队
            </Button>
            <Button
              onClick={() => this.setState({ currentTeam: record, removeMemberModalVisible: true })}
              className="delBtn setBtn"
            >
              移出团队
            </Button>
          </div>
        ),
      },
    ]
    return (
      <div className="UserProjectsAndTeams">
        <Tabs type="line">
          <TabPane tab="参与项目" key="projects">
            <div className="projects">
              <div className="projectsTitle">
                <Button type="primary" onClick={() => this.setState({joinProjectsModalVisible: true})}>
                  <i className='fa fa-undo' /> &nbsp;加入其它项目
                </Button>
                {/* <Button type="ghost"><Icon type="delete" />移出项目</Button> */}
              </div>
              <div className="projectsContent">
                <Table columns={projectColumns} dataSource={teams} onChange={this.handleTeamChange} pagination={false} />
              </div>
            </div>
          </TabPane>
          <TabPane tab="所属团队" key="teams">
            <div className="teams">
              <div className="teamsTitle">
                <Button type="primary" onClick={() => this.setState({teamTransferModalVisible: true})}>
                  <i className='fa fa-undo' /> &nbsp;加入其它团队
                </Button>
                {/**
                 * <Button type="ghost"><Icon type="delete" />移出团队</Button>
                 */}
                <span className="searchInput">
                  <Input size='large' placeholder='搜索' />
                  <i className='fa fa-search' />
                </span>
              </div>
              <div className="teamsContent">
                <Table columns={teamColumns} dataSource={teams} onChange={this.handleTeamChange} pagination={false} />
              </div>
            </div>
          </TabPane>
        </Tabs>
        <Modal
          title="移出团队"
          visible={removeMemberModalVisible}
          wrapClassName="removeMemberModal"
          onCancel={() => this.setState({ removeMemberModalVisible: false })}
          onOk={this.removeMember}
          footer={[
            <Button
              key="back"
              type="ghost"
              size="large"
              onClick={() => this.setState({ removeMemberModalVisible: false })}
            >
              取 消
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              loading={this.state.removeMemberBtnLoading}
              onClick={this.removeMember}
            >
              确 定
            </Button>,
          ]}
        >
          <Row className="alertRow warningRow">
            <Col span={2} className="alertRowIcon">
              <i className="fa fa-exclamation-triangle" aria-hidden="true" />
            </Col>
            <Col span={22}>
              移出后该成员将无法进入该团队参与的项目，并无法使用团队所对应的项目的资源，
              确定将成员 {userDetail.userName} 移出团队 {currentTeam.teamName} 么？
          </Col>
          </Row>
        </Modal>
        <Modal
          title="添加到团队"
          visible={teamTransferModalVisible}
          wrapClassName="addMemberModal"
          onCancel={() => this.setState({teamTransferModalVisible: false})}
        >
          <Transfer
            dataSource={allTeams}
            showSearch
            listStyle={{
              width: 250,
              height: 300,
            }}
            titles={['未选择团队', '已选择团队']}
            operations={['添加', '移除']}
            targetKeys={teamTargetKeys}
            onChange={this.handleTeamTransferChange}
            render={item => item.teamName}
          />
        </Modal>
        <JoinProjectsModal
          visible={joinProjectsModalVisible}
          onCancel={() => this.setState({joinProjectsModalVisible: false})}
        />
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  let teamsData = []
  const { teams } = state.user
  if (teams.result) {
    if (teams.result.teams) {
      teamsData = teams.result.teams
    }
  }
  return {
    teams: teamsData,
  }
}

export default connect(mapStateToProp, {
  loadUserTeamList,
  removeTeamusers,
  GetProjectsMembers,
})(UserProjectsAndTeams)
