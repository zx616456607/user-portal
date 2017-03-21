/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Alarm Record component
 *
 * v0.1 - 2017-3-16
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Card, Icon, Spin, Table, Select, DatePicker, Menu, Button } from 'antd'
import QueueAnim from 'rc-queue-anim'
// import { connect } from 'react-redux'
// import { calcuDate } from '../../../common/tools.js'
import './style/AlarmRecord.less'

class AlarmRecord extends Component {
  constructor(props) {
    super(props);
  }
  render () {
    const columns = [
      {
      title: '告警时间',
      dataIndex: 'time',
      render: text => <a href="#">{text}</a>,
      }, {
        title: '策略名称',
        dataIndex: 'name',
      }, {
        title: '持续时间',
        dataIndex: 'largeTime',
      },
      {
        title: '监控项目',
        dataIndex: 'item',
        render: (text)=> {
          if (text == 1) {
            return <div style={{color:'#33b867'}}><i className="fa fa-circle" /> &nbsp;cpu 50%</div>
          }
          return <div style={{color:'#f23e3f'}}><i className="fa fa-circle" /> &nbsp;cpu 90%</div>
        }
      },
      {
        title: '触发规则',
        dataIndex: 'target',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (text)=> {
          if (text == 1) {
            return <div style={{color:'#33b867'}}><i className="fa fa-circle" /> &nbsp;已查看</div>
          }
          if (text == 2) {
            return <div style={{color:'#f23e3f'}}><i className="fa fa-circle" /> &nbsp;已停用</div>
          }
          if (text == 3) {
            return <div style={{color:'orange'}}><i className="fa fa-circle" /> &nbsp;已忽略</div>
          }
          return <div style={{color:'#f23e3f'}}><i className="fa fa-circle" /> &nbsp;未操作</div>
        }
      }
    ];

    const data = [
      {
        app: 'func',
        name: '大事业部',
        status: 1,
        target:1,
        time:'5分钟',
        largeTime: '2017-03-06 15:35:21',
      }, {
        app: 'wrap',
        name: 'test It',
        status: 1,
        target:2,
        time:'15分钟',
        largeTime: '2017-03-03 10:35:21',
      }, {
        app: 'fun2',
        name: '统计',
        time:'2分钟',
        largeTime: '2017-03-02 13:35:21',
        status:2,
        target:1,
      }
    ];
    return (
      <QueueAnim className="AlarmRecord" type="right">
        <div id="AlarmRecord">
          <div className="topRow">
            <Select style={{ width: 120 }} size="large" placeholder="选择告警策略">
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
            </Select>
            <Select style={{ width: 120 }} size="large" placeholder="选择类型">
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
            </Select>
            <Select style={{ width: 120 }} size="large" placeholder="选择告警对象">
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
            </Select>
            <Select style={{ width: 120 }} size="large" placeholder="选择告警状态">
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
            </Select>
            <DatePicker placeholder="选择起始日期" size="large"/>
            <DatePicker placeholder="选择结束日期" size="large"/>
            <Button icon="exception" size="large" type="primary">立即查询</Button>
            <Button icon="delete" size="large" >清除记录</Button>
          </div>
          <Card>
            <Table className="strategyTable" onRowClick={(record, index)=>console.log('click', record, index)} columns={columns} dataSource={data} pagination={false} />
          </Card>

        </div>
      </QueueAnim>
    )
  }

}
export default AlarmRecord