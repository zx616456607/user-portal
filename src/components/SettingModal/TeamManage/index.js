/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Button, Icon, Card, Table, Modal, Input, Tooltip } from 'antd'
import './style/TeamManage.less'
import { Link } from 'react-router'
import SearchInput from '../../SearchInput'
import { connect } from 'react-redux'
import { loadUserTeamList } from '../../../actions/user'
import { createTeam, deleteTeam } from '../../../actions/team'

function loadData(props) {
  const { loadUserTeamList,} = props
  loadUserTeamList('default')
}

let TeamTable = React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,
      sortedInfo: null,
    }
  },
  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  },
  handleBack(){
    const { scope } = this.props
    scope.setState({
      notFound: false,
    })
  },
  render() {
    let { sortedInfo, filteredInfo } = this.state
    const { searchResult, notFound } = this.props.scope.state
    const { data } = this.props
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    let pageTotal = searchResult.length === 0 ? data.length : searchResult.length
    const pagination = {
      total: pageTotal,
      showSizeChanger: true,
      defaultPageSize: 5,
      pageSizeOptions: ['5','10','15','20'],
      onShowSizeChange(current, pageSize) {
        //console.log('Current: ', current, '; PageSize: ', pageSize);
      },
      onChange(current) {
        //console.log('Current: ', current);
      },
    }
    const columns = [
      {
        title: '团队名',
        dataIndex: 'team',
        key: 'team',
        width: '20%',
        className: 'teamName',
        render: (text,record,index) => (
          <Link to={`setting/detail/${text}`}>{text}</Link>
        )
      },
      {
        title: '成员',
        dataIndex: 'member',
        key: 'member',
        width: '20%',
        sorter: (a, b) => a.member - b.member,
        sortOrder: sortedInfo.columnKey === 'member' && sortedInfo.order,
      },
      {
        title: '在用集群',
        dataIndex: 'cluster',
        key: 'cluster',
        width: '20%',
        sorter: (a, b) => a.cluster - b.cluster,
        sortOrder: sortedInfo.columnKey === 'cluster' && sortedInfo.order,
      },
      {
        title: '团队空间',
        dataIndex: 'space',
        key: 'space',
        width: '20%',
        sorter: (a, b) => a.space - b.space,
        sortOrder: sortedInfo.columnKey === 'space' && sortedInfo.order,
      },
      {
        title: '操作',
        key: 'operation',
        width: '20%',
        render: (text,record,index) => (
          <div>
            <Button icon="plus" className="addBtn">添加成员</Button>
            <Button icon="delete" className="delBtn">删除</Button>
          </div>
        )
      },
    ]
    if(notFound){
      return (
        <div id="notFound">
          <div className="notFoundTip">没有查询到符合条件的记录，尝试其他关键字。</div>
          <a onClick={this.handleBack}>[返回成员管理列表]</a>
        </div>
      )
    } else {
      return (
        <Table columns={columns}
               dataSource={searchResult.length === 0?data : searchResult}
               pagination={pagination}
               onChange={this.handleChange} />
      )
    }
  },
})
let NewTeamForm = React.createClass({
  render() {
    return (
        <Row>
          <Col span={4}>名称</Col>
          <Col span={20}>
            <Input placeholder="新团队名称"/>
          </Col>
        </Row>
    )
  },
})

class TeamManage extends Component {
  constructor(props){
    super(props)
    this.showModal = this.showModal.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.state = {
      searchResult: [],
      notFound: false,
      visible: false,
    }
  }
  showModal() {
    this.setState({
      visible: true,
    })
  }
  handleOk() {
    this.setState({
      visible: false,
    })
  }
  handleCancel(e) {
    e.preventDefault();
    this.setState({
      visible: false,
    })
  }
  componentWillMount(){
    loadData(this.props)
  }
  render(){
    const scope = this
    const { visible } = this.state
    const { teams } = this.props
    let data = []
    if(teams.length !== 0){
      teams.map((item,index) => {
        data.push(
          {
            key: index,
            team: item.teamName,
            member: item.userCount,
            cluster: item.clusterCount,
            space: item.spaceCount,
          }
        )
      })
    }
    const searchIntOption = {
      placeholder: '搜索',
      defaultSearchValue: 'team',
    }
    return (
      <div id="TeamManage">
        <Alert message="团队, 由若干个成员组成的一个集体, 可等效于公司的部门、项目组、或子公司，
        包含『团队空间』这一逻辑隔离层， 以实现对应您企业内部各个不同项目， 或者不同逻辑组在云平台上操作对象的隔离， 团队管理员可见对应团队的所有空间的应用等对象。"
               type="info"/>
        <Row className="teamOption">
          <Button icon="plus" type="primary" size="large" onClick={this.showModal} className="plusBtn">
            创建团队
          </Button>
            <Modal title="创建团队" visible={visible}
                   onOk={this.handleOk} onCancel={this.handleCancel}
                   wrapClassName="NewTeamForm"
                   width="463px"
            >
              <NewTeamForm />
            </Modal>
          <Button className="viewBtn">
            <Icon type="picture" />
            查看成员&团队图例
          </Button>
          <SearchInput searchIntOption={searchIntOption} scope={scope} data={data}/>
        </Row>
        <Row className="teamList">
          <Card>
            <TeamTable data={data} scope={scope}/>
          </Card>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state) {
  let teamsData = []
  let total = 0
  const teams = state.user.teams
  if (teams.result) {
    if (teams.result.teams) {
      teamsData = teams.result.teams
    }
    if (teams.result.total) {
      total = teams.result.total
    }
  }
  return {
    teams: teamsData,
    total
  }
}

export default connect(mapStateToProp, {
  loadUserTeamList,
  createTeam,
  deleteTeam,
})(TeamManage)