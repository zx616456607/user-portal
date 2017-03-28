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
import { Button, Input, Table, Select, Icon, Popover, Modal, Form, Checkbox } from 'antd'
import './style/AlarmGroup.less'

const InputGroup = Input.Group

class AlarmGroup extends Component {
  constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.state = {
      value:'',
      focus: false,
      visible:false,
      copySuccess:false
    }
  }

  showModal(){
    this.setState({
      visible: true,
    });
  }

  handleOk(){
    this.setState({
      visible : false
    })
  }

  handleCancel(){
    this.setState({
      visible : false
    })
  }

  handleSelect(){
    return (
      <div>
        <Select
          defaultValue='删除'
          style={{width:'100%'}}
        > 
          <Option value="delete">删除</Option>
          <Option value="modified">修改</Option>
        </Select>
      </div>
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

  render() {

    const tableColumns = [{
      title:'名称',
      dataIndex:'name',
      width:'10%',
      className:'fontstyle'
    },{
      title:'描述',
      dataIndex:'description',
      width:'16%',
      className:'fontstyle'
    },{
      title:'邮箱',
      dataIndex:'email',
      width:'30%',
      className:'fontstyle',
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
      className:'fontstyle'
    },{
      title:'关联策略',
      dataIndex:'relation',
      width:'15%',
      className:'fontstyle',
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
      className:'fontstyle',
      render:text => (<div>
                        <Select
                          defaultValue='删除'
                          style={{width:'56px'}}
                        >
                          <Select.Option value="delete">删除</Select.Option>
                          <Select.Option value="modified">修改</Select.Option>
                        </Select>
                      </div>)
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
      getCheckboxProps: record => ({
        disabled: record.name === '胡彦祖',    // 配置无法勾选的列
      }),
    }

    return (
      <div id="AlarmGroup">
        <div className='alarmGroupHeader'>
          <Button className='alarmGroupHeaderButton' type="primary" onClick={this.showModal}>
            <i className="fa fa-plus icon" aria-hidden="true"></i>
            创建
          </Button>
          <Button className='alarmGroupHeaderButton'>
            <i className="fa fa-undo icon" aria-hidden="true"></i>
            刷新
          </Button>
          <Button className='alarmGroupHeaderButton'>
            <i className="fa fa-trash-o icon" aria-hidden="true"></i>
            删除
          </Button>
          <Button className='alarmGroupHeaderButton'>
            <i className="fa fa-pencil-square-o icon" aria-hidden="true"></i>
            修改
          </Button>
          <InputGroup className='alarmGroupHeaderInput'>
            <Select
              combobox
              style={{width:'100%'}}
            >

            </Select>
            <div className="ant-input-group-wrap">
              <Button>
                <Icon type="search" />
              </Button>
            </div>
          </InputGroup>
        </div>
        <div className='alarmGroupContent'>
          <Table
            columns={tableColumns}
            dataSource={tableData}
            pagination={false}
            rowSelection={rowSelection}
          >
          </Table>
        </div>
      </div>
    )
  }
}


export default AlarmGroup