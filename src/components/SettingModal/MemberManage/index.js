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
import './style/MemberManage.less'
import { Row, Col, Button, Input, Select, Card, Icon, Table, Modal, Checkbox, Tooltip, message, notification, } from 'antd'
import SearchInput from '../../SearchInput'
import { connect } from 'react-redux'
import { loadUserList, createUser, deleteUser } from '../../../actions/user'
import { Link } from 'react-router'
import { USERNAME_REG_EXP } from '../../../constants'
import CreateUserModal from '../CreateUserModal'

const confirm = Modal.confirm

let MemberTable = React.createClass({
  getInitialState() {
    return {
      filteredInfo: null,
      pagination: {},
      loading: false,
      sortName: true,
      sortTeam: true,
      sortBalance: true,
      sort: "a,userName",
      filter: ""
    }
  },

  getSort(order, column) {
    var query = {}
    var orderStr = 'a,'
    if (!order) {
      orderStr = 'd,'
    }
    return orderStr + column
  },
  handleSortName() {
    const { loadUserList } = this.props.scope.props
    const { sortName } = this.state
    const { page, pageSize, filter } = this.props.scope.state
    let sort = this.getSort(!sortName, 'userName')
    loadUserList({
      page: page,
      size: pageSize,
      sort,
      filter: filter,
    })
    this.setState({
      sortName: !sortName,
      sort,
    })
  },
  handleSortTeam() {
    const { loadUserList } = this.props.scope.props
    const { sortTeam } = this.state
    let sort = this.getSort(!sortTeam, 'teamCount')
    loadUserList({
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter: this.state.filter,
    })
    this.setState({
      sortTeam: !sortTeam,
      sort,
    })
  },
  handleSortBalance() {
    const { loadUserList } = this.props.scope.props
    const { sortBalance } = this.state
    let sort = this.getSort(!sortBalance, 'balance')
    loadUserList({
      page: this.state.page,
      size: this.state.pageSize,
      sort,
      filter: this.state.filter,
    })
    this.setState({
      sortBalance: !sortBalance,
      sort,
    })
  },
  handleBack() {
    const { scope } = this.props
    scope.setState({
      notFound: false,
    })
  },
  delMember(record) {
    const { scope } = this.props
    confirm({
      title: '您是否确认要删除这项内容',
      onOk() {
        scope.props.deleteUser(record.key, {
          success: {
            func: () => {
              scope.props.loadUserList({
                page: 1,
                size: scope.state.pageSize,
                sort: scope.state.sort,
                filter: scope.state.filter,
              })
              scope.setState({
                current: 1
              })
            },
            isAsync: true
          },
        })
      },
      onCancel() { },
    });
  },
  onTableChange(pagination, filters, sorter) {
    // 点击分页、筛选、排序时触发
    if (!filters.style) {
      return
    }
    let styleFilterStr = filters.style.toString()
    if (styleFilterStr === this.styleFilter) {
      return
    }
    const { scope } = this.props
    const { loadUserList } = scope.props
    let { page, pageSize, sort } = scope.state
    const query = {
      page,
      size: pageSize,
      sort,
    }
    let filter
    if (filters.style.length === 1) {
      filter = `role,${filters.style[0]}`
      query.filter = filter
    }
    scope.setState({
      filter
    })
    loadUserList(query)
    this.styleFilter = styleFilterStr
  },
  render() {
    let { sortedInfo, filteredInfo } = this.state
    const { searchResult, notFound } = this.props.scope.state
    const { data, scope } = this.props
    filteredInfo = filteredInfo || {}
    const pagination = {
      total: this.props.scope.props.total,
      showSizeChanger: true,
      defaultPageSize: 5,
      defaultCurrent: 1,
      current: this.props.scope.state.current,
      pageSizeOptions: ['5', '10', '15', '20'],
      onShowSizeChange(current, pageSize) {
        console.log('Current: ', current, '; PageSize: ', pageSize);
        scope.props.loadUserList({
          page: current,
          size: pageSize,
          sort: scope.state.sort,
          filter: scope.state.filter,
        })
        scope.setState({
          pageSize: pageSize,
          page: current,
          current: 1,
        })
      },
      onChange(current) {
        const { pageSize, page } = scope.state
        if (current === page) {
          return
        }
        console.log('Current: ', current);
        scope.props.loadUserList({
          page: current,
          size: pageSize,
          sort: scope.state.sort,
          filter: scope.state.filter
        })
        scope.setState({
          pageSize: pageSize,
          page: current,
          current: current,
        })
      },
    }
    const columns = [
      {
        title: (
          <div onClick={this.handleSortName}>
            成员名
            <div className="ant-table-column-sorter">
              <span className={this.state.sortName ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortName ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'memberName',
        width: '15%',
        render: (text, record, index) => (
          <Link to={`/setting/user/${record.key}`}>
            {text}
          </Link>
        ),
      },
      {
        title: '手机',
        dataIndex: 'tel',
        key: 'tel',
        width: '15%',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: '15%',
      },
      {
        title: '类型',
        /* (
         <span>
           <div className="ant-dropdown ant-dropdown-placement-bottomLeft"
                style={{left: '816.208px', top: '196.438px'}}>
             <div className="ant-table-filter-dropdown">
               <ul className="ant-dropdown-menu ant-dropdown-menu-vertical  ant-dropdown-menu-root" role="menu" aria-activedescendant="" tabindex="0">
                 <li className="ant-dropdown-menu-item" role="menuitem" aria-selected="false">
                   <label className="ant-checkbox-wrapper">
                     <span className="ant-checkbox">
                     <span className="ant-checkbox-inner"></span>
                     <input type="checkbox" className="ant-checkbox-input" value="on"/>
                   </span>
                   </label>
                   <span>团队管理员</span>
                 </li>
                 <li className="ant-dropdown-menu-item" role="menuitem" aria-selected="false">
                   <label className="ant-checkbox-wrapper">
                     <span className="ant-checkbox">
                       <span className="ant-checkbox-inner"></span>
                       <input type="checkbox" className="ant-checkbox-input" value="on"/>
                     </span>
                   </label>
                   <span>普通成员</span>
                 </li>
               </ul>
               <div className="ant-table-filter-dropdown-btns">
                 <a className="ant-table-filter-dropdown-link confirm">确定</a>
                 <a className="ant-table-filter-dropdown-link clear">重置</a>
               </div>
             </div>
           </div>
           <i className="anticon anticon-filter" title="筛选"/>
         </span>
       ),*/
        dataIndex: 'style',
        key: 'style',
        filters: [
          { text: '普通成员', value: 0 },
          { text: '团队管理员', value: 1 },
        ],
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortTeam}>
            团队
            <div className="ant-table-column-sorter">
              <span className={this.state.sortTeam ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortTeam ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'team',
        key: 'team',
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortBalance}>
            余额
            <div className="ant-table-column-sorter">
              <span className={this.state.sortBalance ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.sortBalance ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'balance',
        key: 'balance',
        width: '10%',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 180,
        render: (text, record, index) => (
          <div>
            <Link to={`/setting/user/${record.key}`}>
              <Button icon="setting" className="setBtn">
                管理
            </Button>
            </Link>
            <Button icon="delete" className="delBtn" onClick={() => this.delMember(record)}>
              删除
            </Button>
          </div>
        ),
      },
    ]
    if (notFound) {
      return (
        <div id="notFound">
          <div className="notFoundTip">没有查询到符合条件的记录，尝试其他关键字。</div>
          <a onClick={this.handleBack}>[返回成员管理列表]</a>
        </div>
      )
    } else {
      return (
        <Table columns={columns}
          dataSource={searchResult.length === 0 ? data : searchResult}
          pagination={pagination}
          onChange={this.onTableChange} />
      )
    }
  },
})

class MemberManage extends Component {
  constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.userOnSubmit = this.userOnSubmit.bind(this)
    this.state = {
      searchResult: [],
      notFound: false,
      visible: false,
      memberList: [],
      pageSize: 5,
      page: 1,
      sort: "a,userName",
      filter: "",
      current: 1,
    }
  }
  showModal() {
    this.setState({
      visible: true,
    })
  }
  componentWillMount() {
    this.props.loadUserList({
      page: 1,
      size: 5,
      sort: "a,userName",
      filter: "",
    })
  }
  userOnSubmit(user) {
    const { createUser, loadUserList } = this.props
    const { page, pageSize, sort, filter } = this.state
    const hide = message.loading('正在执行中...', 0)
    createUser(user, {
      success: {
        func: () => {
          loadUserList({
            page,
            size: pageSize,
            sort,
            filter,
          })
          hide()
          notification.success({
            message: `创建用户 ${user.userName} 成功`
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          hide()
          notification.error({
            message: `创建用户 ${user.userName} 失败`,
            description: err.message.message,
            duration: 0
          })
        }
      }
    })
  }
  render() {
    const { users } = this.props
    const scope = this
    const { visible, memberList } = this.state
    const searchIntOption = {
      width: '280px',
      position: 'right',
      height: '50px',
      addBefore: [
        { key: 'name', value: '用户名' },
        { key: 'tel', value: '手机号' },
        { key: 'email', value: '邮箱' },
      ],
      defaultValue: 'name',
      placeholder: '请输入关键词搜索',
    }
    return (
      <div id="MemberManage">
        <Row>
          <Button type="primary" size="large" onClick={this.showModal} className="addBtn">
            <i className='fa fa-plus' /> 添加新成员
          </Button>
          <SearchInput scope={scope} searchIntOption={searchIntOption} />
          <CreateUserModal visible={visible} scope={scope} onSubmit={this.userOnSubmit} />
        </Row>
        <Row className="memberList">
          <Card>
            <MemberTable scope={scope} data={users} />
          </Card>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state) {
  let usersData = []
  let total = 0
  let data = []
  const users = state.user.users
  if (users.result) {
    if (users.result.users) {

      usersData = users.result.users
      console.log('usersData', usersData);
      usersData.map((item, index) => {
        data.push(
          {
            key: item.userID,
            name: item.displayName,
            tel: item.phone,
            email: item.email,
            style: item.role === 1 ? '团队管理员' : '普通成员',
            team: item.teamCount,
            balance: item.balance,
          }
        )
      })
    }
    if (users.result.total) {
      total = users.result.total
    }
  }

  return {
    users: data,
    total
  }
}

export default connect(mapStateToProp, {
  loadUserList,
  createUser,
  deleteUser,
})(MemberManage)