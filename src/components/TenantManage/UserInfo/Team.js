/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2017/06/26
 * @author XuLongcheng
 */
import React, { Component } from 'react'
import { Row, Modal, Input, Table, Tabs, Icon, Col, Button, } from 'antd'
import { Link } from 'react-router'
import './style/Team.less'

let TeamList = React.createClass ({
  getInitialState(){
    return {
      sortedInfo: null,
      Removeteam: false,
      Removeobjects: {teamName:null},
    }
  },
  handleChange(pagination, filters, sorter) {
    this.setState({
      sortedInfo: sorter,
    });
  },
  Removeteam(e,record) {
    
    this.setState({
      Removeteam: true,
      Removeobjects:record,
    })
  },
  render: function () {
    let firstRow = true
    let className = ""
    const { teams, user } = this.props
    let { sortedInfo } = this.state;
    sortedInfo = sortedInfo || {};
    const columns = [
      {
        title:"团队名",  
        dataIndex: 'teamName',
        key: 'teamName',
        width: '25%',
        render: (text, record, index) => (
          <Link>{record.teamName}</Link>
        )
      },
      {
        title: '成员数',
        dataIndex: 'userCount',
        key: 'userCount',
        width: '25%',
        sorter: (a, b) => a.userCount - b.userCount,
        sortOrder: sortedInfo.columnKey === 'userCount' && sortedInfo.order,
      },
      {
        title: '进团时间',
        dataIndex: 'creationTime',
        key: 'creationTime',
        width: '25%',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (e,record) => (
          <div className="action">
            <Button type="primary" className="setBtn">查看团队</Button>
            <Button onClick={(e)=>this.Removeteam(e.key,record)} className="delBtn setBtn">移出团队</Button>
          </div>
        ),
      },
    ]
    return (
      <div>
        <Table columns={columns} dataSource={teams} onChange={this.handleChange} />
        <Modal title="移出团队" visible={this.state.Removeteam} onOk={()=> this.setState({Removeteam: false})} onCancel={()=> this.setState({Removeteam: false})} >
          <p className="createRol"><div className="mainbox"><i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
            确定要从团队{this.state.Removeobjects.teamName}中移出成员{user.userName}么？</div></p>
        </Modal>
      </div>
    )
  }
})

export default class Team extends Component{
  constructor(props){
    super(props)
    this.state = {
      Joinother: false,
    }
  }
  componentDidMount() {
    
  }

  render(){
    const { teams, userDetail } = this.props
    return (
      <div id='Teams'>
        <Tabs className="Projectteam" type="line">
          <Tabs.TabPane tab="参与项目" key="1">参与项目</Tabs.TabPane>
          <Tabs.TabPane tab="所属团队" key="2">
            <Row className="teamWrap">
              <div className="teamTitle">
                <Button onClick={()=> this.setState({Joinother: true})} type="primary"><i className='fa fa-undo' /> &nbsp;加入其它团队</Button>
                <Button type="ghost"><Icon type="delete" />移出团队</Button>
                <div className='littleRight'>
                  <Input
                    size='large'
                    placeholder='搜索'
                    style={{paddingRight: '28px'}}/>
                    <div className='littleLeft'>
                      <i className='fa fa-search' />
                    </div>
                </div>
              </div>
              <div className="teamContent">
                <TeamList teams={teams} user={userDetail}/>
              </div>
            </Row>
          </Tabs.TabPane>
        </Tabs>
        <Modal title="移出团队" visible={this.state.Joinother} onOk={()=> this.setState({Joinother: false})} onCancel={()=> this.setState({Joinother: false})} >
          <p className="createRol"></p>
        </Modal>
      </div>
    )
  }
}