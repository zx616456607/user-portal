/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Alarm Setting component
 *
 * v0.1 - 2017-3-16
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { Card, Input, Modal, InputNumber, Checkbox, Progress, Icon, Spin, Table, Select, Dropdown, DatePicker, Menu, Button, Pagination } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { deleteRecords } from '../../actions/alert'
import CreateAlarm from '../AppModule/AlarmModal'
import CreateGroup from '../AppModule/AlarmModal/CreateGroup'
import no_alarm from '../../assets/img/no_data/no_alarm.png'
// import { calcuDate } from '../../../common/tools.js'
import './style/AlarmRecord.less'
import cloneDeep from 'lodash/cloneDeep'
const Option = Select.Option

const MyComponent = React.createClass({
  getInitialState() {
    return {
      data: this.props.data || [],
      lookModel: false
    }
  },
  hnadDelete(key,record) {
    // Dropdown delete action
    const { scope } = this.props
    console.log('index  in...',key, record)
    this.setState({record})
    switch(key) {
      case 'delete': {
        scope.setState({deleteModal: true})
        return
      }
      case 'edit': {
        console.log('edit--')
        return
      }
      case 'start': {
        console.log('start--')
        return
      }
      case 'list': {
        console.log('list---')
        return
      }
      case 'clear': {
        this.setState({clearModal: true})
        return
      }
      default: return console.log('default')
    }
  },
  clearRecords() {
    console.log(this.state.record)
    const {funcs} = this.props
    // funcs.deleteRecords()
    // func is delete record list
  },
  dropdowns (record){
    // Dropdown delete btn
    return(
      <Menu onClick={(e)=> this.hnadDelete(e.key, record)}
          style={{ width: '80px' }}
      >
      <Menu.Item key="delete">
        <span>删除</span>
      </Menu.Item>
      <Menu.Item key="edit">
        <span>修改</span>
      </Menu.Item>
      <Menu.Item key="stop">
        <span>停用</span>
      </Menu.Item>
      <Menu.Item key="start">
        <span>启用</span>
      </Menu.Item>
      <Menu.Item key="list">
        <span>查看记录</span>
      </Menu.Item>
      <Menu.Item key="clear">
        <span>清除记录</span>
      </Menu.Item>
    </Menu>

    )
  },
  formatStatus(text){
    if (text ==1) {
      return <span className="running"><i className="fa fa-circle" /> 启用</span>
    }
    if (text ==2) {
      return <span className="stop"><i className="fa fa-circle" /> 停用</span>
    }
    if (text ==3) {
      return <span className="stop"><i className="fa fa-circle" /> 忽略</span>
    }
    return <span className="unknown"><i className="fa fa-circle" /> 告警</span>
  },
  handOverlook() {
    lookModel: true
  },
  sorterData(sorter) {
    const newData = this.state.data.sort((a, b) => {
      if (sorter == 'up') {
        return Date.parse(b.createTime) - Date.parse(a.createTime)
      }
      return Date.parse(a.createTime) - Date.parse(b.createTime)
    })
    this.setState({
      data: newData,
      sorter,
    })
  },
  changeAll(e) {
    const oldData = cloneDeep(this.state.data)
    const newData = oldData.map((item, index)=> {
      item.checked = e.target.checked
      return item
    })
    const { scope } = this.props
    scope.setState({isDelete: !e.target.checked})
    this.setState({
      data: newData
    })
  },
  changeChecked(e, ins) {
    const oldData = cloneDeep(this.state.data)
    let isDelete = true
    const newData = oldData.map((item, index)=> {
      if (index == ins) {
        item.checked = !item.checked
        return item
      }
      // item.checked = false
      return item
    })
    newData.forEach((list)=> {
      if (list.checked) {
        isDelete= false;
      }
    })
    const { scope } = this.props
    scope.setState({isDelete})
    this.setState({
      data: newData
    })
  },
  tableListMore(list) {
    const oldData = cloneDeep(this.state.data)
    const newData = oldData.map((item, index)=> {
      if (index == list) {
        item.active = !item.active
        return item
      }
      // item.active = false
      return item
    })
    this.setState({
      data: newData
    })
  },
  childerList() {
    return (
      <div className="wrapChild">
        <div className="leftName">
          节点名称（5分钟内数据）
        </div>
        <div className="rightList">
          <div className="lists">
            <span className="keys">内存</span>
            <Progress percent={30} strokeWidth={8} format={ percent => percent + '%'} className="progress"/>
          </div>
          <div className="lists">
            <span className="keys">CPU</span>
            <Progress percent={60} status="exception" strokeWidth={8} format={ percent => percent + '%'}  className="progress" />
          </div>
          <div className="lists">
            <span className="keys">流量</span>
            <span className="keys">
              <Icon type="arrow-up" />
                1280M
            </span>
            <span className="keys">
              <Icon type="arrow-down" />
              50M
            </span>
          </div>
        </div>
      </div>
    )
  },
  render() {
    const { data } = this.state
    // let data = []
    if (!data || data.length ==0) {
      return (<div className="text-center"><img src={no_alarm} />
        <div>您还没有告警设置，创建一个吧！<Button onClick={()=> this.props.scope.setState({alarmModal: true})} type="primary" size="large">创建</Button></div>
      </div>)
    }
    const lists = data.map((list, index)=> {
      if (list.active) {
        return (
            [<tr key={`list${index}`}>
              <td style={{width:'5%',textAlign:'center'}}><Checkbox checked={list.checked} onChange={(e)=> this.changeChecked(e, index)} /></td>
              <td onClick={()=> this.tableListMore(index)}><Link to={`/manange_monitor/alarm_setting/${list.key}`}>{list.name}</Link></td>
              <td onClick={()=> this.tableListMore(index)}>{list.type}</td>
              <td onClick={()=> this.tableListMore(index)}>{list.bindObject}</td>
              <td onClick={()=> this.tableListMore(index)}>{this.formatStatus(list.status)}</td>
              <td onClick={()=> this.tableListMore(index)}>{list.time}</td>
              <td onClick={()=> this.tableListMore(index)}>{list.createTime}</td>
              <td onClick={()=> this.tableListMore(index)}>{list.editUser}</td>
              <td><Dropdown.Button type="ghost" overlay={ this.dropdowns(list) } onClick={()=> this.setState({lookModel: true})}>忽略</Dropdown.Button></td>
            </tr>,
            <tr key={`list-${index}`} className="ant-table-expanded">
              <td style={{width:'5%',textAlign:'center'}}></td>
              <td colSpan="9">
                {this.childerList(list)}
              </td>
            </tr>]
        )

      }
      return (
        <tr key={`list${index}`}>
            <td style={{width:'5%',textAlign:'center'}}><Checkbox checked={list.checked} onChange={(e)=> this.changeChecked(e, index)} /></td>
            <td onClick={()=> this.tableListMore(index)}><Link to={`/manange_monitor/alarm_setting/${list.key}`}>{list.name}</Link></td>
            <td onClick={()=> this.tableListMore(index)}>{list.type}</td>
            <td onClick={()=> this.tableListMore(index)}>{list.bindObject}</td>
            <td onClick={()=> this.tableListMore(index)}>{this.formatStatus(list.status)}</td>
            <td onClick={()=> this.tableListMore(index)}>{list.time}</td>
            <td onClick={()=> this.tableListMore(index)}>{list.createTime}</td>
            <td onClick={()=> this.tableListMore(index)}>{list.editUser}</td>
            <td><Dropdown.Button type="ghost" overlay={ this.dropdowns(list) } onClick={()=> this.setState({lookModel: true})}>忽略</Dropdown.Button></td>
          </tr>
      )
    })
    return (
      <Card className="ant-table" style={{clear: 'both'}}>
        <table className="ant-table-table strategyTable">
          <thead className="ant-table-thead">
            <tr>
              <th style={{width:'5%',textAlign:'center'}}><Checkbox onChange={(e)=> this.changeAll(e)} /></th>
              <th>策略名称</th>
              <th>类型</th>
              <th>告警对象</th>
              <th>状态</th>
              <th>监控周期</th>
              <th>创建时间
                <div className="ant-table-column-sorter">
                <span className={this.state.sorter =='up' ? "ant-table-column-sorter-up on": 'ant-table-column-sorter-up off'} title="↑" onClick={()=> this.sorterData('up')}><i className="anticon anticon-caret-up"></i></span>
                <span className={this.state.sorter =='down' ? "ant-table-column-sorter-down on" : 'ant-table-column-sorter-down off'} title="↓" onClick={()=> this.sorterData('down')}><i className="anticon anticon-caret-down"></i></span>
                </div>
              </th>
              <th>最后修改人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody className="ant-table-tbody">
          { lists }
          </tbody>
        </table>
        <Modal title="忽略" visible={this.state.lookModel}
          onOk={()=> this.handOverlook()} onCancel={()=> this.setState({lookModel: false})}
          okText="提交"
        >
          <div className="alertRow">注意：在忽略时间内我们将不会发送告警邮件通知！</div>
          <div className="modalParams">
            <span className="keys">忽略时长</span>
            <InputNumber size="large" min={1} style={{margin:'0 10px'}}/>
            <Select style={{width: 80}} size="large" defaultValue={'minute'}>
              <Option value="hour">小时</Option>
              <Option value="minute">分钟</Option>
              <Option value="second">秒</Option>
            </Select>
          </div>
        </Modal>
        <Modal title="清除策略告警记录" visible={this.state.clearModal}
          onCancel={()=> this.setState({clearModal: false})}
          onOk={()=> this.clearRecords()}
        >
        <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>您的操作将会清空该策略所有告警记录，并且重置告警次数，是否清空？</div>
        </Modal>
      </Card>
    )
  }
})

class AlarmSetting extends Component {
  constructor(props) {
    super(props);
    this.nextStep = this.nextStep.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.state = {
      createGroup: false,
      step: 1, // first step create AlarmModal
      deleteModal: false, // delete alarm modal
      isDelete: true, // disabled delte btn
    }
  }
  componentWillMount() {
    document.title = '告警设置 | 时速云 '
  }
  handSearch() {
    // search data
    const search = document.getElementById('alarmSearch').value
  }
  description(rule) {
    // Dropdown more info
    return (
      <div>cpu is</div>
    )
  }
  cancelModal() {
    // cancel create Alarm modal
    this.setState({
      alarmModal: false,
      step:1
    })
  }
  nextStep(step) {
    this.setState({
      step: step
    })
  }
  deleteRecords() {
    console.log('delete in ^^&^^')
  }
  render() {

    const columns = [
      {
      title: '名称',
      dataIndex: 'name',
      key:'name',
      render: text => <a href="#">{text}</a>,
      }, {
        title: '类型',
        dataIndex: 'type',
        key:'type'
      }, {
        title: '绑定对象',
        dataIndex: 'bindObject',
        key:'bindObject',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key:'status',
      },
      {
        title: '监控周期',
        dataIndex: 'time'
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key:'createTime',
        sorter: (a, b) => Date.parse(a.createTime) - Date.parse(b.createTime),
      },
      {
        title: '最后修改人',
        dataIndex: 'editUser',
        key:'edit',
      },
      {
        title: '操作',
        dataIndex: 'name',
        key:'action',
        render: (text, record) => {
          return <Dropdown.Button type="ghost" overlay={ this.dropdowns(record) }>忽略</Dropdown.Button>
        }
      }
    ];

    const data = [
      {
        key:1,
        name: '大事业部',
        type:'1',
        bindObject:3,
        status: 1,
        time:'5分钟',
        createTime: '2017-03-06 15:35:21',
        editUser:'baiyu',
      }, {
        key:2,
        name: 'test It',
        type:'2',
        bindObject:2,
        status: 1,
        time:'15分钟',
        createTime: '2017-03-03 10:35:21',
        editUser:'admin',
      }, {
        key:3,
        name: '统计',
        type:'2',
        bindObject:1,
        status: 0,
        time:'2分钟',
        createTime: '2017-03-02 13:35:21',
        editUser:'baiyu',
      }
    ];
    // const rowSelection = {
    //   // checkbox select callback
    // }
    const _this = this
    const modalFunc=  {
      scope : this,
      cancelModal: this.cancelModal,
      nextStep: this.nextStep
    }
    return (
      <QueueAnim type="right" className="alarmSetting">
        <div id="AlarmRecord" key="AlarmRecord">
          <div className="topRow" style={{marginBottom: '20px'}}>
            <Button icon="plus" size="large" type="primary" onClick={()=> this.setState({alarmModal: true})}>创建</Button>
            <Button icon="reload" size="large" type="ghost">刷新</Button>
            <Button icon="caret-right" size="large" type="ghost">启用</Button>
            <Button size="large" type="ghost"><i className="fa fa-stop" /> &nbsp;停用</Button>
            <Button icon="delete" type="ghost" disabled={this.state.isDelete} onClick={()=> this.setState({deleteModal: true})} size="large">删除</Button>
            <Button icon="edit" type="ghost" disabled={this.state.isDelete} size="large" >修改</Button>
            <div className="inputGrop">
              <Input size="large" id="alarmSearch" placeholder="搜索" onPressEnter={()=> this.handSearch()}/>
              <i className="fa fa-search" onClick={()=> this.handSearch()}/>
            </div>
            <div className="rightPage pageBox">
              <span className='totalPage'>共计 {data.length} 条</span>
              <Pagination
                simple
                className='inlineBlock'
                onChange={(page)=> this.onPageChange(page)}
                current={DEFAULT_PAGE}
                pageSize={DEFAULT_PAGE_SIZE}
                total={ data.length } />
            </div>
          </div>
          <MyComponent data={data} scope={this} funcs= {{deleteRecords: this.props.deleteRecords}}/>
          <Modal title="创建告警策略" visible={this.state.alarmModal} width={580}
            className="alarmModal"
            onCancel={()=> this.setState({alarmModal:false})}
            maskClosable={false}
            footer={null}
          >
            <CreateAlarm funcs={modalFunc}/>
          </Modal>
          {/* 通知组 */}
          <Modal title="创建新通知组" visible={this.state.createGroup}
            width={560}
            maskClosable={false}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
            <CreateGroup funcs={modalFunc}/>
          </Modal>
          <Modal title="删除策略" visible={this.state.deleteModal}
            onCancel={()=> this.setState({deleteModal: false})}
            onOk={()=> this.deleteRecords()}
          >
            <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>策略删除后将不再发送邮件告警，是否确定删除？</div>
          </Modal>

          {/*<Card>
            <Table className="strategyTable"
              onRowClick={(record, index)=>console.log('click', record, index)}
              rowSelection={rowSelection}
              columns={columns}
              dataSource={data}
              pagination={false}
              expandedRowRender={ record =>_this.description(record) }
            />
          </Card>*/}
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { entities } = state
  const cluster = entities.current.cluster
  return {
    clusterID: cluster.clusterID
  }
}

export default connect(mapStateToProps, {
  deleteRecords
})(AlarmSetting)
