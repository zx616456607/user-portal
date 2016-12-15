/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/10
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Alert, Card, Icon, Button, Table, Menu, Dropdown, Modal, Input, Transfer, } from 'antd'
import './style/TeamDetail.less'
import { Link } from 'react-router'
import { connect } from 'react-redux'

const data = [
  {key: '1',name: 'zhaoxy1',tel: '123',email:'1111@tenxcloud.com',role:1},
  {key: '2',name: 'zhaoxy2',tel: '123',email:'1111@tenxcloud.com',role:1},
  {key: '3',name: 'zhaoxy3',tel: '123',email:'1111@tenxcloud.com',role:1},
  {key: '4',name: 'zhaoxy4',tel: '123',email:'1111@tenxcloud.com',role:1},
]
class TeamDetail extends Component {
  constructor(props) {
    super(props)
    this.handleTableChange = this.handleTableChange.bind(this)
    this.getSort = this.getSort.bind(this)
    this.handleSortMemberName = this.handleSortMemberName.bind(this)
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      sortMemberName: false,
      sort: 'a,teamName',
      filter: '',
      pageSize: 5,
      page: 1,
      current: 1,
    }
  }
  handleTableChange(pagination, filters, sorter) {
    console.log('各类参数是', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }
  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  }
  handleSortMemberName() {
    const { sortMemberName } = this.state
    let sort = this.getSort(!sortMemberName, 'memberName')
    
    this.setState({
      sortMemberName: !sortMemberName,
      sort,
    })
  }
  componentWillMount() {
    
  }
  
  render() {
    const scope = this
    let { sortedInfo, filteredInfo, sortMemberName, sort,filter} = this.state
    const { teamName, teamID } = this.props
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}
    const columns = [
      {
        title: (
          <div onClick={this.handleSortMemberName}>
            成员名
            <div className="ant-table-column-sorter">
              <span className={sortMemberName ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!sortMemberName ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'memberName',
        width: '25%',
        render: (text, record, index) => (
          <Link to='###'>{text}</Link>
        )
      }, {
        title: '手机',
        dataIndex: 'tel',
        key: 'tel',
        width: '25%'
      }, {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: '25%'
      }, {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        width: '25%'
      }
    ]
    const pagination = {
      simple: {true},
      total: 1,
      sort,
      filter,
      showSizeChanger: true,
      defaultPageSize: 5,
      defaultCurrent: 1,
      current: this.state.current,
      onShowSizeChange(current, pageSize) {
        this.setState({
          page: current,
          pageSize: pageSize,
          current: 1,
        })
      },
      onChange(current) {
        this.setState({
          page: current,
          pageSize: this.state.pageSize,
          current: current,
        })
      },
    }
    return (
      <div id='TeamDetail'>
        <Row style={{ marginBottom: 20 }}>
          <Link className="back" to="/account/team">返回</Link>
          <span className="title">
            { teamName }
          </span>
        </Row>
        <Alert message="这里展示了该团队的团队成员信息，作为普通成员您可退出团队和跳转到“我的账户”。" />
        <Row className="memberOption">
          <Button icon='logout' className='quitTeamBtn'>
            退出团队
          </Button>
          <div className="total">共1个</div>
        </Row>
        <Card className="content">
          <Table columns={columns} dataSource={data} onChange={this.handleTableChange} pagination={pagination}/>
        </Card>
      </div>
    )
  }
}
function mapStateToProp(state, props) {
  const { team_id, team_name } = props.params
  return {
    teamName: team_name,
    teamID: team_id,
  }
}
export default connect(mapStateToProp, {
  
})(TeamDetail)