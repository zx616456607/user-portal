/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App Template list component
 *
 * v0.1 - 2017-11-7
 * @author Baiyu
 */


import React from 'react'
import { Modal, Table, Icon, Button, Card, Input,Tooltip,
  Dropdown, Menu } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import '../style/AppWrapManage.less'
import NotificationHandler from '../../../common/notification_handler'
import { formatDate } from '../../../common/tools'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../../constants'
import { API_URL_PREFIX } from '../../../constants'
import './style/index.less'
import Title from '../../Title'
const notificat = new NotificationHandler()



class AppTemplate extends React.Component {
  constructor() {
    super()
    this.state = {
      page: 1,
    }
  }
  getList = (e)=> {
    const inputValue = this.refs.wrapSearch.refs.input.value
    if (!e || inputValue == '') {
      this.loadData()
      return
    }
    this.props.wrapManageList()
  }
  loadData(current) {
    current = current || this.state.page
    this.setState({page: current})
    let from = {
      from: (current-1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE
    }
    this.props.wrapManageList(from)
  }

  deleteAction(status,id) {
    if (status) {
      id = [id]
      this.setState({delAll: true,id})
      return
    }
    this.setState({delAll: false})
  }

  handleAction(e,rows) {
    const { func } = this.props
    if (e.key == 'edit') {
      func.scope.setState({uploadModal: true, editor: true, rows})
      return
    }
    this.deleteAction(true, rows.id)
  }

  render() {
    const dataSource = {pkgs:[
      {name:'test',count:'2',createTime:'2017-11-89',id:'1'}
    ],total:1}
    const { func,rowCheckbox, entryPkgID } = this.props
    const columns = [
      {
        title: '模板名称',
        dataIndex: 'name',
        key: 'name',
        width: '20%',
      }, {
        title: '服务数量',
        dataIndex: 'count',
        key: 'tag',
        width: '20%',
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'creationTime',
        render: text => formatDate(text)
      }, {
        title: '操作',
        dataIndex: 'actions',
        key: 'actions',
        width:'150px',
        render: (e,row,index) => {
          const menu = (
            <Menu onClick={(e)=> this.handleAction(e, row)} style={{width:'80px'}}>
              <Menu.Item key="delete">删除</Menu.Item>
              <Menu.Item key="edit">修改</Menu.Item>
              <Menu.Item key="issue">克隆</Menu.Item>
            </Menu>
          )
          return <Dropdown.Button trigger={['click']}  type="ghost" overlay={menu}>部署</Dropdown.Button>

        }

      }
    ]
    const paginationOpts = {
      simple: true,
      pageSize: DEFAULT_PAGE_SIZE,
      current: this.state.page,
      total: dataSource.total,
      onChange: current => this.loadData(current),
      // showTotal: total => `共计： ${total} 条 `,
    }
    const _this = this
    let rowSelection = {
      selectedRowKeys: this.props.selectedRowKeys, // 控制checkbox是否选中
      onChange(selectedRowKeys, selectedRows) {
        const ids = selectedRows.map(row => {
          return row.id
        })
      }
    }

    return (
      <QueueAnim id="appTemplate">
        <div key="appTemplate" className="appTemplate" style={{position:'relative'}}>
          <Title title="应用模板" />
          <div className="btnRow">
            <Button size="large" type="primary" onClick={() => browserHistory.push('/app_center/app_template/create')}><i className="fa fa-plus" aria-hidden="true"></i> 创建模板</Button>
            <Button size="large" style={{ margin: '0 10px' }} onClick={()=> this.getList()}><i className='fa fa-refresh' />&nbsp;刷 新</Button>
            <Button size="large" icon="delete" onClick={()=> this.getList()}>删除</Button>
            <Input placeholder="请输入模板名称搜索" size="large" id="searchInput" style={{width:180,marginLeft:10}} onPressEnter={() => this.searchIP()}/>
            <i className='fa fa-search btn-search' onClick={() => this.searchIP()}></i>
          </div>
          <Card>
          <Table className="strategyTable" loading={this.props.isFetching} rowSelection={rowSelection} dataSource={dataSource.pkgs} columns={columns} pagination={paginationOpts} />
          { dataSource.total && dataSource.total >0?
            <span className="pageCount" style={{position:'absolute',right:'170px',top:'-40px'}}>共计 {dataSource.total} 条</span>
            :null
          }
          </Card>
          <Modal title="删除操作" visible={this.state.delAll}
            onCancel={()=> this.deleteAction(false)}
            onOk={this.deleteVersion}
            >
            <div className="alertRow">确定要删除当前模板？</div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state,props) {
  const { wrapList } = state.images
  const { current } = state.entities
  const { space } = current
  const list = wrapList || {}
  let datalist = {pkgs:[],total:0}
  if (list.result) {
    datalist = list.result.data
  }
  return {
    space,
    wrapList: datalist,
    isFetching: list.isFetching
  }
}

export default connect(null,{

})(AppTemplate)