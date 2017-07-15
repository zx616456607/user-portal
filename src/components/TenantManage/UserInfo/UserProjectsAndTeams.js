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
import { Tabs, Table, Button, Icon, Input, Modal, Row, Col } from 'antd'
import { Link, browserHistory } from 'react-router'
import { formatDate } from '../../../common/tools'
import './style/UserProjectsAndTeams.less'

const TabPane = Tabs.TabPane

export default class UserProjectsAndTeams extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projectSortedInfo: null,
      teamSortedInfo: null,
      removeMemberModalVisible: false,
      currentTeam: {},
    }
  }

  handleTeamChange = (pagination, filters, sorter) => {
    this.setState({
      teamSortedInfo: sorter,
    })
  }

  removeMember = () => {
    //
  }

  render() {
    const { teams, userDetail } = this.props
    let { teamSortedInfo, removeMemberModalVisible, currentTeam } = this.state
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
                <Button type="primary"><i className='fa fa-undo' /> &nbsp;加入其它项目</Button>
                <Button type="ghost"><Icon type="delete" />移出项目</Button>
              </div>
              <div className="projectsContent">
                <Table columns={projectColumns} dataSource={teams} onChange={this.handleTeamChange} pagination={false} />
              </div>
            </div>
          </TabPane>
          <TabPane tab="所属团队" key="teams">
            <div className="teams">
              <div className="teamsTitle">
                <Button type="primary"><i className='fa fa-undo' /> &nbsp;加入其它团队</Button>
                {/**
                 * <Button type="ghost"><Icon type="delete" />移出团队</Button>
                 */}
                <span className="searchInput">
                  <Input size='large' placeholder='搜索' size="default" />
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
      </div>
    )
  }
}