/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *  server and app some port in card
 *
 * v0.1 - 2017/03/24
 * @author Zhangchengzheng
 */
import React, { Component } from 'react'
import { Button, Input, Table, Dropdown, Menu, Icon, Popover, Modal, Form, Card, Pagination } from 'antd'
import './style/AlarmGroup.less'
import QueueAnim from 'rc-queue-anim'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import CreateAlarm from '../../AppModule/AlarmModal/CreateGroup'
const InputGroup = Input.Group

class AlarmGroup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      createGroup: false
    }
  }
  dropdowns (record){
    // Dropdown delete btn
    return(
      <Menu onClick={()=> this.hnadDelete(record)}
          style={{ width: '80px' }}
      >
      <Menu.Item key="delete">
        <span>删除</span>
      </Menu.Item>
      <Menu.Item key="edit">
        <span>修改</span>
      </Menu.Item>

    </Menu>

    )
  }

  tableSvgEmail(){
    return (
      <div className='alarmGroupContentEmailPopOver'>
        <div className='alarmGroupContentEmailPopOveritem'>123456789@qq.com<span className='alarmGroupContentEmailPopOverspan'>(备注:xiaowenzi)</span></div>
        <div className='alarmGroupContentEmailPopOveritem'>123456789@qq.com<span className='alarmGroupContentEmailPopOverspan'>(备注:xiaowenzi)</span></div>
        <div className='alarmGroupContentEmailPopOveritem'>123456789@qq.com<span className='alarmGroupContentEmailPopOverspan'>(备注:xiaowenzi)</span></div>
        <div className='alarmGroupContentEmailPopOveritem'>123456789@qq.com<span className='alarmGroupContentEmailPopOverspan'>(备注:xiaowenzi)</span></div>
        <div className='alarmGroupContentEmailPopOveritem'>123456789@qq.com<span className='alarmGroupContentEmailPopOverspan'>(备注:xiaowenzidadasdasdadadada)</span></div>
      </div>
    )
  }

  tableSvgRelation(){
    return (
      <div className='alarmGroupContentRealtionPopOver'>
        <div className='alarmGroupContentRealtionPopOveritem'>123456789@qq.com<span className='alarmGroupContentRealtionPopOverspan'>(备注:xiaowenzi)</span></div>
        <div className='alarmGroupContentRealtionPopOveritem'>123456789@qq.com<span className='alarmGroupContentRealtionPopOverspan'>(备注:xiaowenzi)</span></div>
        <div className='alarmGroupContentRealtionPopOveritem'>123456789@qq.com<span className='alarmGroupContentRealtionPopOverspan'>(备注:xiaowenzi)</span></div>
        <div className='alarmGroupContentRealtionPopOveritem'>123456789@qq.com<span className='alarmGroupContentRealtionPopOverspan'>(备注:xiaowenzi)</span></div>
        <div className='alarmGroupContentRealtionPopOveritem'>123456789@qq.com<span className='alarmGroupContentRealtionPopOverspan'>(备注:xiaowenzi)</span></div>
        <div className='alarmGroupContentRealtionPopOveritem'>123456789@qq.com<span className='alarmGroupContentRealtionPopOverspan'>(备注:xiaowenzi)</span></div>
        <div className='alarmGroupContentRealtionPopOveritem'>123456789@qq.com<span className='alarmGroupContentRealtionPopOverspan'>(备注:xiaowenzi111111)</span></div>
      </div>
    )
  }
  handSearch() {
    let search = document.getElementById('AlarmGroupInput').value
    console.log('search', search)
  }
  render() {
    const modalFunc=  {
      scope : this,
    }
    const tableColumns = [{
      title:'名称',
      dataIndex:'name',
      width:'10%',
    },{
      title:'描述',
      dataIndex:'description',
      width:'16%',
    },{
      title:'邮箱',
      dataIndex:'email',
      width:'30%',
      render:text => (
          <div>
            {text}
            <Popover placement="rightTop" content={this.tableSvgEmail()} trigger="click">
              <svg className='more' >
                <use xlinkHref='#more'/>
              </svg>
            </Popover>
          </div>
      )
    },{
      title:'创建时间',
      dataIndex:'bulidtime',
      width:'20%',
    },{
      title:'关联策略',
      dataIndex:'relation',
      width:'15%',
      render:text => (
        <div>
          {text}
          <Popover placement="rightTop" content={this.tableSvgRelation()} trigger="click">
            <svg className='more' >
              <use xlinkHref='#more' />
            </svg>
          </Popover>
        </div>
      )
    },{
      title:'操作',
      dataIndex:'handle',
      width:'10%',
      render:text => <Dropdown.Button type="ghost" overlay={ this.dropdowns(text) } onClick={()=> this.setState({lookModel: true})}>删除</Dropdown.Button>
    }]

    const tableData = [{
      key:'1',
      name:'tongzhi1',
      description:'woshixiaomingshu',
      email:'123456789@qq.com',
      bulidtime:'2016-07-18 16:50:10',
      relation:'niub1qun',
      handle:'shanchu'
    },{
      key:'2',
      name:'tongzhi2',
      description:'fuwutongzhi',
      email:'123456789@qq.com(备注:xiaowenzi)',
      bulidtime:'',
      relation:'描述',
      handle:'shanchu'
    },{
      key:'3',
      name:'tongzhi3',
      description:'woshixiaomingshu',
      email:'123456789@qq.com',
      bulidtime:'2016-07-18 16:50:10',
      relation:'描述',
      handle:'shanchu'
    },{
      key:'4',
      name:'tongzhi4',
      description:'woshixiaomingshu',
      email:'123456789@qq.com',
      bulidtime:'2016-07-18 16:50:10',
      relation:'描述',
      handle:'shanchu'
    },{
      key:'5',
      name:'tongzhi5',
      description:'woshixiaomingshu',
      email:'123456789@qq.com',
      bulidtime:'2016-07-18 16:50:10',
      relation:'描述',
      handle:'shanchu'
    },{
      key:'6',
      name:'tongzhi6',
      description:'woshixiaomingshu',
      email:'123456789@qq.com',
      bulidtime:'2016-07-18 16:50:10',
      relation:'描述',
      handle:'shanchu'
    }]

    const rowSelection = {
      // getCheckboxProps: record => ({
      //   disabled: record.name === '胡彦祖',    // 配置无法勾选的列
      // }),
    }

    return (
      <QueueAnim  className="alarmGroup">
        <div id="AlarmGroup" key="demo">
          <div className='alarmGroupHeader'>
            <Button size="large" type="primary" icon="plus" onClick={()=> this.setState({createGroup:true})}>创建</Button>
            <Button size="large" icon="reload" type="ghost">刷新</Button>
            <Button size="large" icon="delete" type="ghost">删除</Button>
            <Button size="large" icon="edit" type="ghost">修改</Button>
            <div className="Search">
              <Input size="large" id="AlarmGroupInput" onPressEnter={()=> this.handSearch()} />
              <i className="fa fa-search" onClick={()=> this.handSearch()} />
            </div>
            <div className="rightPage pageBox">
              <span className='totalPage'>共 {tableData.length} 条</span>
              <div className='paginationBox'>
                <Pagination
                  simple
                  className='inlineBlock'
                  onChange={(page)=> this.onPageChange(page)}
                  current={DEFAULT_PAGE}
                  pageSize={DEFAULT_PAGE_SIZE}
                  total={ tableData.length } />
              </div>
            </div>
          </div>
          <Card className='alarmGroupContent'>
            <Table
              className="strategyTable"
              columns={tableColumns}
              dataSource={tableData}
              pagination={false}
              rowSelection={rowSelection}
            >
            </Table>
          </Card>
          <Modal title="创建新通知组" visible={this.state.createGroup}
            width={560}
            maskClosable={false}
            closable={false}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
            <CreateAlarm funcs={modalFunc}/>
          </Modal>

        </div>
      </QueueAnim>
    )
  }
}


export default AlarmGroup