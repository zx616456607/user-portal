/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Member Manage
 *
 * v0.1 - 2016/11/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import './style/Membermanagement.less'
import { Tag, Row, Col, Button, Menu, Card, Icon, Table, Modal, Tooltip, Dropdown } from 'antd'
import SearchInput from '../../SearchInput'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import { loadUserList, createUser, deleteUser, checkUserName, updateUserActive, loadAllUserList } from '../../../actions/user'
import { chargeUser } from '../../../actions/charge'
import { Link, browserHistory } from 'react-router'
import { parseAmount } from '../../../common/tools'
import CreateUserModal from '../CreateUserModal'
import NotificationHandler from '../../../components/Notification'
import { ROLE_PLATFORM_ADMIN, ROLE_SYS_ADMIN, ROLE_USER, ROLE_BASE_ADMIN } from '../../../../constants'
import MemberRecharge from '../_Enterprise/Recharge'
import { MAX_CHARGE, ACTIVE } from '../../../constants'
import Title from '../../Title'
import ChargeModal from './ChargeModal'
import CommonSearchInput from '../../CommonSearchInput'
// import DeleteModal from './DeleteModal'
import DeletedUsersModal from './DeletedUsersModal'
import DeleteUserModal from './DeleteUserModal'
import successPic from '../../../assets/img/wancheng.png'
import QueueAnim from 'rc-queue-anim'

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
      filter: "",
      selectedRowKeys: [],
      deactiveUserModal: false,
      deactiveUserBtnLoading: false
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
    const { page, pageSize, filter } = this.props.scope.state
    let sort = this.getSort(!sortTeam, 'teamCount')
    loadUserList({
      sort,
      page: page,
      size: pageSize,
      filter: filter,
    })
    this.setState({
      sortTeam: !sortTeam,
      sort,
    })
  },
  handleSortBalance() {
    const { loadUserList } = this.props.scope.props
    const { sortBalance } = this.state
    const { page, pageSize, filter } = this.props.scope.state
    let sort = this.getSort(!sortBalance, 'balance')
    loadUserList({
      sort,
      page: page,
      size: pageSize,
      filter: filter
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
  filtertypes(filters) {
    // member select filter type (0=>普通成员，3=> 系统管理员)
    // return number

    let filter = ''
    let isSetFilter = false
    let protoDate = ['0', '1', '2']
    let typeData = ['1', '2']
    if (filters.style) {
      if (filters.style.length) {
        isSetFilter = true
        let filterTypeArr = [ROLE_USER,ROLE_SYS_ADMIN,ROLE_PLATFORM_ADMIN,ROLE_BASE_ADMIN];
        let include =[];
        filterTypeArr.forEach(v => {
          if (filters.style.indexOf(`${v}`) >= 0) {
            include.push(v)
          }
        })

        include.forEach(item => {
          filter += `role__eq,${item},`
          if (item === include[include.length - 1]) {
            filter = filter.substring(0, filter.length - 1)
          }
        });
      }

    }
    if (filters.type) {
      if (filters.type.length == 1) {
        if (filter) {
          filter += `,type__eq,${filters.type[0]}`
        } else {
          filter = `type__eq,${filters.type[0]}`
        }

        isSetFilter = true
      }
    }
    if (filters.active) {
      if (filters.active.length == 1) {
        const constraint = filters.active[0] === '1' ? '__eq,1' : '__neq,1'
        if (filter) {
          filter += `,active${constraint}`
        } else {
          filter = `active${constraint}`
        }
        isSetFilter = true
      }
    }
    if (isSetFilter) {
      return filter
    }
    return ''
  },
  onTableChange(pagination, filters, sorter) {

    // 点击分页、筛选、排序时触发
    if (!filters.style && !filters.type && !filters.active) {
      return
    }
    let styleFilterStr = filters.style ? filters.style.toString() : ''
    let typeFilterStr = filters.type ? filters.type.toString() : ''
    let activeFilterStr = filters.active ? filters.active.toString() : ''
    if (styleFilterStr === this.styleFilter && typeFilterStr == this.typeFilterStr && activeFilterStr == this.activeFilterStr) {
      return
    }
    const { scope } = this.props
    const { loadUserList } = scope.props
    let { page, pageSize, sort, searchFilter } = scope.state
    const query = {
      page,
      size: pageSize,
      sort,
    }
    let filter = this.filtertypes(filters)

    if (searchFilter) {
      if (filter) {
        filter = `${searchFilter},${filter}`
      } else {
        filter = searchFilter
      }
    }
    query.filter = filter
    scope.setState({
      filter,
      tableFilter: this.filtertypes(filters),
    })

    loadUserList(query)
    this.styleFilter = styleFilterStr
    this.typeFilterStr = typeFilterStr
    this.activeFilterStr = activeFilterStr

  },
  onSelectChange(selectedRowKeys) {
    const { scope } = this.props
    this.setState({ selectedRowKeys })
    if (selectedRowKeys.length > 0) {
      scope.setState({
        hasSelected: true
      })
    } else {
      scope.setState({
        hasSelected: false
      })
    }
  },
  changeUserActive() {
    const notification = new NotificationHandler()
    const record = this.currentUser
    const { active, name } = record
    const userId = record.key
    const { scope } = this.props
    const { updateUserActive, loadUserList } = scope.props
    const { page, pageSize, filter, sort } = scope.state
    const text = active === ACTIVE ? '停用' : '启用'
    if (active === ACTIVE) {
      this.setState({
        deactiveUserBtnLoading: true,
      })
    }
    updateUserActive(userId, active, {
      success: {
        func: () => {
          notification.success(`${text}用户 ${name} 成功`)
          loadUserList({
            page: page,
            size: pageSize,
            sort: sort,
            filter: filter,
          })
          active === ACTIVE && this.setState({
            deactiveUserModal: false,
            deactiveUserBtnLoading: false,
          })
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          notification.error(`${text}用户 ${name} 失败`)
          active === ACTIVE && this.setState({
            deactiveUserBtnLoading: false,
          })
        }
      }
    })
  },
  handleMenuClick(record, { key }) {
    this.currentUser = record
    if (key === 'delete') {
      this.setState({ delModal: true })
      // const { scope } = this.props
      // const { loadUserTeams } = scope.props
      // loadUserTeams(record.key, { size: 100 })
      return
    }
    if (key === 'active') {
      if (record.active === 2) {
        this.setState({resetPasswordModal: true})
        return
      }
      const notification = new NotificationHandler()
      const { active, name } = record
      if (active === ACTIVE) {
        this.setState({
          deactiveUserModal: true,
        })
        return
      }
      this.changeUserActive()
    }
  },
  returnDefaultTooltip() {
    setTimeout(() => {
      this.setState({
        copyStatus: false
      })
    }, 500)
  },
  copyText() {
    let target = document.getElementById('delErrorMsg')
    target.select()
    document.execCommand('Copy', false)
    this.setState({
      copyStatus: true
    })
  },
  render() {

    let {
      selectedRowKeys,
      sortedInfo,
      filteredInfo,
      sort,
      delBtnLoading,
      delErrorMsg,
      copyStatus,
    } = this.state
    const { searchResult, notFound } = this.props.scope.state
    const { data, scope, loginUser, teams } = this.props
    let userManageName = this.currentUser ? this.currentUser.name : ''
    const { billingConfig } = loginUser
    const { enabled: billingEnabled } = billingConfig
    filteredInfo = filteredInfo || {}
    const pagination = {
      simple: true,
      total: this.props.scope.props.total,
      showSizeChanger: true,
      defaultPageSize: 10,
      defaultCurrent: 1,
      current: this.props.scope.state.current,
      pageSizeOptions: ['5', '10', '15', '20'],
      onShowSizeChange(current, pageSize) {
        scope.props.loadUserList({
          page: current,
          size: 10,
          sort,
          filter: scope.state.filter,
        })
        scope.setState({
          pageSize: 10,
          page: current,
          current: 1,
        })
      },
      onChange(current) {
        const { pageSize, page } = scope.state
        if (current === page) {
          return
        }
        scope.props.loadUserList({
          page: current,
          size: 10,
          sort,
          filter: scope.state.filter
        })
        scope.setState({
          pageSize: 10,
          page: current,
          current: current,
        })
      },
    }
    const { userDetail } = this.props.scope.props
    const checkAuth = userDetail.role === ROLE_SYS_ADMIN || userDetail.role === ROLE_PLATFORM_ADMIN
    let filterKey = [
      { text: '普通成员', value: ROLE_USER },
      { text: '系统管理员', value: ROLE_SYS_ADMIN },
      { text: '基础设施管理员', value: ROLE_BASE_ADMIN },
      { text: '平台管理员', value: ROLE_PLATFORM_ADMIN }
    ]

    let userStatusfilterKey = [
      { text: '不可用', value: 0 },
      { text: '可用', value: 1 },
    ]

    let ldapFileter = [{ text: '是', value: 2 }, { text: '否', value: 1 }]
    const cannotDelMember = record => {
      if(loginUser.role === ROLE_PLATFORM_ADMIN && record.role === ROLE_PLATFORM_ADMIN) {
        return true
      }
      if(loginUser.role === ROLE_PLATFORM_ADMIN && record.role === ROLE_SYS_ADMIN) {
        return true
      }
      if(loginUser.namespace === record.namespace) {
        return true
      }
      return false
    }
    let columns = [
      {
        title: (
          <div onClick={this.handleSortName} style={{display:'inline'}}>
            <span>成员名
            {
              checkAuth && (
                  <a href="javascript:void(0)">（{this.props.onlineTotal} 人在线）</a>
              )
            }</span>
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
        width: '20%',
        render: (text, record, index) => {
          if (checkAuth) {
            return (
              <Link to={`/tenant_manage/user/${record.key}`}>
                {
                  record.online
                  ? <Tag color="blue">在线</Tag>
                  : <Tag className="offlineTag">离线</Tag>
                }
                {text}
              </Link>
            )
          }
          return text
        },
      },
      {
        title: '状态',
        dataIndex: 'active',
        key: 'active',
        width: '10%',
        filters: userStatusfilterKey,
        render: active => {
          const color = active === ACTIVE ? '#33b867' : '#f03e3f'
          const text = active === ACTIVE ? '可用' : '不可用'
          return (
            <div style={{ color }}>
              <i className="fa fa-circle"></i>&nbsp;
              <span>{text}</span>
            </div>
          )
        }
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: '15%',
      },
      {
        title: '账号类型',
        dataIndex: 'style',
        key: 'style',
        filters: filterKey,
        width: '10%',
      },
      {
        title: (
          <div onClick={this.handleSortTeam}>
            所属团队
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
        title: '参与项目',
        dataIndex: 'project',
        key: 'project',
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
        title: 'LDAP',
        dataIndex: 'type',
        key: 'type',
        filters: ldapFileter,
        width: '10%',
        render: (text) => {
          if (text == 2) return '是'
          return '否'
        }
      },
    ]
    if (checkAuth) {
      columns.push({
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record, index) => {
          let disabled = false
          const loginRole = loginUser.role
          const memberRole = record.role
          if(loginRole === ROLE_PLATFORM_ADMIN || loginRole === ROLE_BASE_ADMIN) {
            if (memberRole !== ROLE_USER) disabled = true
          }
          if(record.namespace === loginUser.namespace) disabled = true
          return <div className="action">
            <Dropdown.Button
              onClick={() => {
                if (!billingEnabled) {
                  browserHistory.push(`/tenant_manage/user/${record.key}`)
                  return
                }
                scope.memberRecharge(record)
              }}
              overlay={
                <Menu
                  onClick={this.handleMenuClick.bind(this, record)}
                  style={{ width: '80px' }}
                >
                  <Menu.Item key="active" disabled={disabled}>
                    {record.active === ACTIVE ? '停用' : '启用'}
                  </Menu.Item>

                  <Menu.Item
                    key="delete"
                    disabled={cannotDelMember(record)}
                  >
                    删除
                  </Menu.Item>
                </Menu>
              }
              type="ghost"
            >
              { billingEnabled ? '充值' : '查看' }
            </Dropdown.Button>
          </div>

        }
      })
    }
    if (!billingEnabled) {
      columns.splice(6, 1)
    }
    if (notFound) {
      return (
        <div id="notFound">
          <div className="notFoundTip">没有查询到符合条件的记录，尝试其他关键字。</div>
          <a onClick={this.handleBack}>[返回成员管理列表]</a>
        </div>
      )
    }

    return (
      <div>
        <Table columns={columns}
          dataSource={searchResult.length === 0 ? data : searchResult}
          pagination={pagination}
          onChange={this.onTableChange}
          loading={this.props.usersIsFetching}
        />
        <DeleteUserModal
          visible={this.state.delModal}
          onCancel={() => this.setState({ delModal: false, delErrorMsg: null })}
          currentUser={this.currentUser}
          scope={scope}
        />

        <Modal title="该用户需重置密码"
          visible={this.state.resetPasswordModal}
          onCancel={() => this.setState({ resetPasswordModal: false })}
          wrapClassName="resetPasswordModal"
          footer={[
            <Button
              key="back"
              type="primary"
              size="large"
              onClick={() => this.setState({ resetPasswordModal: false })}
            >
              知道了
            </Button>
          ]}
        >
          <Row className="alertRow warningRow">
            <Col span={2} className="alertRowIcon">
              <i className="fa fa-exclamation-triangle" aria-hidden="true" />
            </Col>
            <Col span={22} className="alertRowDesc">
            该用户还未登录过平台，登录并重置密码后账号即为可用状态
            </Col>
          </Row>
        </Modal>

        <Modal title="停用成员操作"
          visible={this.state.deactiveUserModal}
          onCancel={() => this.setState({ deactiveUserModal: false })}
          wrapClassName="deactiveMemberModal"
          footer={[
            <Button
              key="back"
              type="ghost"
              size="large"
              onClick={() => this.setState({ deactiveUserModal: false })}
            >
              取 消
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              loading={this.state.deactiveUserBtnLoading}
              onClick={() => this.changeUserActive()}
            >
              确 定
            </Button>,
          ]}
        >
          <Row className="alertRow warningRow">
            <Col span={2} className="alertRowIcon">
              <i className="fa fa-exclamation-triangle" aria-hidden="true" />
            </Col>
            <Col span={22} className="alertRowDesc">
            停用该成员将不能登录平台，激活后可恢复使用
            </Col>
          </Row>
          <div className="modalColor">
            <i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}></i>
            您是否确定要停用成员 {this.currentUser && this.currentUser.name} ?
          </div>
        </Modal>
      </div>
    )
  },
})

class Membermanagement extends Component {
  constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.userOnSubmit = this.userOnSubmit.bind(this)
    this.loadData = this.loadData.bind(this)
    this.state = {
      searchResult: [],
      notFound: false,
      visible: false,
      visibleMember: false,// member account modal
      memberList: [],
      pageSize: 10,
      page: 1,
      sort: "a,userName",
      filter: "",
      current: 1,
      number: 10,
      hasSelected: false,
      chargeModalVisible: false,
      // deleteModalVisible: false,
      createUserSuccessModalVisible: false,
      createUserErrorMsg: null,
      deletedUserModalVisible: false,
      sendEmailSuccess: false,
      searchFilter: '',
      tableFilter: '',
      confirmLoading: false,
      manageRange: false,
      currentRole: ROLE_PLATFORM_ADMIN
    }
  }
  showInfo = (title, content) => {
    Modal.info({
      title,
      content,
      onOk() {},
    })
  }
  showModal() {
    const { userDetail } = this.props
    if (userDetail.role === ROLE_USER || userDetail.role === ROLE_BASE_ADMIN) {
      return this.showInfo('普通成员或基础设施管理员没有权限创建新成员')
    }
    this.setState({
      visible: true,
    })
  }
  loadData( query = {} ) {
    const { loadUserList } = this.props
    const { sort, page, pageSize, filter } = this.state
    const defaultQuery = {
      page,
      size: pageSize,
      sort,
      filter,
    }
    loadUserList(Object.assign({}, defaultQuery, query))
  }
  componentWillMount() {
    this.loadData()
  }
  userOnSubmit(user) {
    const { createUser, loadUserList } = this.props
    let { page, pageSize, sort, filter, createUserErrorMsg } = this.state
    let notification = new NotificationHandler()
    let sendEmailSuccess = false
    notification.spin(`创建用户 ${user.userName} 中...`)
    this.setState({ confirmLoading: true })
    createUser(user, {
      success: {
        func: (response) => {
          this.setState({
            page: 1,
            size: pageSize,
            sort: "a,userName",
            filter: "",
            visible: false,
            current: 1,
            searchFilter: '',
          }, () => {
            loadUserList({
              page: 1,
              size: 10,
              sort: "a,userName",
              filter: "",
            })
          })
          notification.close()
          if (response.data && response.data == "SEND_MAIL_ERROR") {
            createUserErrorMsg = '发送邮件失败'
          } else {
            createUserErrorMsg = null
            if (user.sendEmail) {
              sendEmailSuccess = true
            }
          }
          this.setState({
            createUserErrorMsg,
            createUserSuccessModalVisible: true,
            sendEmailSuccess,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`创建用户 ${user.userName} 失败`, err.message.message)
        }
      },
      finally: {
        func: () => this.setState({ confirmLoading: false })
      }
    })
  }
  memberRecharge(record) {
    this.setState({
      visibleMember: true,
      record
    })
  }
  activeMenu(number) {
    this.setState({ number })
  }
  btnCharge() {
    // user charge
    const body = {
      namespaces: [this.state.record.namespace],
      amount: parseInt(this.state.number)
    }
    let notification = new NotificationHandler()
    if (!body.amount || body.amount <= 0) {
      notification.info('请选择充值金额，且不能为负数')
      return
    }
    const _this = this
    const { page, pageSize, sort, filter } = this.state

    const { loadUserList, chargeUser } = this.props
    const oldBalance = parseFloat(this.state.record.balance)

    if (oldBalance + body.amount > MAX_CHARGE) {
      // balance (T) + charge memory not 200000
      let isnewBalance = Math.floor(MAX_CHARGE - oldBalance)
      let newBalance = isnewBalance > 0 ? isnewBalance : 0
      notification.info(`充值金额大于可充值金额，最多还可充值 ${newBalance}`)
      return
    }

    chargeUser(body, {
      success: {
        func: (ret) => {
          notification.success('成员充值成功')
          _this.setState({ visibleMember: false, number: 10 })
          loadUserList({
            page,
            size: pageSize,
            sort,
            filter,
          })
        },
        isAsync: true
      }
    })
  }
  handleChargeOk = (namespaces, amount) => {
    const notification = new NotificationHandler()
    const { loadUserList, chargeUser } = this.props
    const { page, pageSize, sort, filter } = this.state
    const body = {
      namespaces,
      amount,
    }
    chargeUser(body, {
      success: {
        func: () => {
          notification.success('批量充值成功')
          this.setState({
            chargeModalVisible: false,
          })
          loadUserList({
            page,
            size: pageSize,
            sort,
            filter,
          })
        },
        isAsync: true
      }
    })
  }
  showManageRange = role => {
    this.setState({
      manageRange: true,
      currentRole: role,
    })

  }
  closeManageRange = () => {
    this.setState({
      manageRange: false
    })
  }
  manageRange = () => {
    const infrastructure = <div className="infrastructureManageRange">
      <div className="name">
        基础设施管理员
      </div>
      <div className="bracket1">
        <div className="rangeNames">
          <div className="names name-item">基础设施资源</div>
          <div className="names name-item">集成中心</div>
          <div className="names">
            <div className="name-item">发布审核</div>
            <span>镜像和应用包</span>
          </div>
          <div className="names name-item">系统设置</div>
          <div className="names name-item">租户管理</div>
        </div>
      </div>
      <div className="bracket2">
        <div className="subRangeNames">
          <div className="subNames">平台版本</div>
          <div className="subNames">开放API</div>
          <div className="subNames">高级设置 ( 容器调度策略设置、仓库组创建权限、传统应用管理 )</div>
          <div className="subNames">清理工具</div>
        </div>
      </div>
      <div className="bracket3">
        <div className="subRangeNames">
          <div className="subNames">团队管理 ( 仅见自己所在团队 )</div>
          <div className="subNames">项目管理 ( 仅见自己所在项目 )</div>
        </div>
      </div>
    </div>
    const platform = <div className="platformManageRange">
      <div className="name">
        平台管理员
      </div>
      <div className="bracket1">
        <div className="rangeNames">
          <div className="names name-item">系统设置</div>
          <div className="names">
            <div className="name-item">发布审核</div>
            <span>镜像和应用包</span>
          </div>
          <div className="names name-item">租户管理</div>
        </div>
      </div>
      <div className="bracket2">
        <div className="subRangeNames">
          <div className="subNames">平台版本</div>
          <div className="subNames">开放API</div>
          <div className="subNames">高级设置 ( 计费功能开关 )</div>
          <div className="subNames">个性外观</div>
        </div>
      </div>
      <div className="bracket3">
        <div className="subRangeNames">
          <div className="subNames">成员管理 ( 管理所有成员 )</div>
          <div className="subNames">团队管理 ( 管理所有团队 )</div>
          <div className="subNames">项目管理 ( 管理所有项目 )</div>
          <div className="subNames">集群授权审批</div>
          <div className="subNames">集成企业目录</div>
        </div>
      </div>
    </div>
    if (this.state.currentRole === ROLE_PLATFORM_ADMIN) {
      return platform
    }else {
      return infrastructure
    }


  }
  /* handleDeleteOk = (namespaces, amount) => {
    //
  } */

  render() {
    const { users, checkUserName, loadAllUserList, userDetail, teams, onlineTotal, usersIsFetching } = this.props
    const scope = this
    const {
      visible, memberList, hasSelected, createUserErrorMsg,
      sendEmailSuccess, confirmLoading,
    } = this.state
    const { billingConfig } = userDetail
    const { enabled: billingEnabled } = billingConfig
    const searchIntOption = {
      addBefore: [
        { key: 'name', value: '成员名' },
        // { key: 'tel', value: '手机号' },
        { key: 'email', value: '邮箱' },
      ],
      defaultSearchValue: 'name',
      placeholder: '请输入关键词搜索',
    }
    const funcs = {
      checkUserName
    }
    const checkAuth = userDetail.role === ROLE_SYS_ADMIN || userDetail.role === ROLE_PLATFORM_ADMIN
    return (
      <QueueAnim>
        <div id="Membermanagement" key='Membermanagement'>
          <div className='alertTip'>
            成员是指公司内外共同协作使用平台的人。系统管理员有全平台最高权限；平台管理员
            <Tooltip title="点击查看平台管理员权限">
              <Icon type="question-circle-o" className='lbgroup_icon' onClick={() => this.showManageRange(ROLE_PLATFORM_ADMIN)}/>
            </Tooltip>
            有管理所有租户的权限，基础设施管理员
            <Tooltip title="点击查看基础设施管理员权限">
              <Icon type="question-circle-o" className='lbgroup_icon' onClick={() => this.showManageRange(ROLE_BASE_ADMIN)}/>
            </Tooltip>
            有管理所有资源相关的权限。
          </div>
          <Title title="成员管理"/>
          <Row>
            {
              checkAuth ?
              <Button type="primary" size="large" onClick={this.showModal} className="Btn">
                <i className='fa fa-plus' /> 创建新成员
              </Button>
                :
                ""
            }
            {
              billingEnabled && (checkAuth) && (
                <Button type="ghost" size="large" className="Btn btn" onClick={() => this.setState({ chargeModalVisible: true })}>
                  <Icon type="pay-circle-o" />批量充值
                </Button>
              )
            }
            <Button type="ghost" size="large" className="Btn btn" onClick={this.loadData}>
              <i className='fa fa-refresh' /> &nbsp;刷 新
            </Button>
            {
              checkAuth &&
              <Button type="dashed" size="large" className="Btn btn" onClick={() => this.setState({ deletedUserModalVisible: true })}>
                <Icon type="solution" />已删除成员
              </Button>
            }
            {/* <Button type="ghost" size="large" className="Btn btn" onClick={() => this.setState({ deleteModalVisible: true })}>
              <Icon type="delete" />批量删除
            </Button> */}
            <SearchInput scope={scope} searchIntOption={searchIntOption} />
            { visible && <CreateUserModal
              visible={visible}
              scope={scope}
              onSubmit={this.userOnSubmit}
              funcs={funcs}
              confirmLoading={confirmLoading}
            /> }
            <Modal
              title="创建成员成功"
              visible={this.state.createUserSuccessModalVisible}
              wrapClassName="createUserSuccessModal"
              okText="继续创建"
              cancelText="关闭"
              onOk={() => this.setState({createUserSuccessModalVisible: false, visible: true})}
              onCancel={() => this.setState({createUserSuccessModalVisible: false})}
            >
              <div className="textAlignCenter">
                <img src={successPic} alt="成功"/>
              </div>
              <div className="textAlignCenter successTitle">
                创建成功
                {
                  createUserErrorMsg && <span className="createUserErrorMsg">({createUserErrorMsg})</span>
                }
                {
                  sendEmailSuccess && <span className="createUserSucessMsg">(发送邮件成功)</span>
                }
              </div>
              <div className="alertRow">
                可将该成员添加到某团队；或将该成员添加到某项目中，并授予角色。
              </div>
            </Modal>
            { this.props.total !== 0 && <div className="total">共计 {this.props.total} 条&nbsp; </div>}
          </Row>
          <Row className="memberList">
            <Card className="memberlist">
              <MemberTable
                scope={scope}
                data={users}
                loginUser={userDetail}
                teams={teams}
                onlineTotal={onlineTotal}
                usersIsFetching={usersIsFetching}
              />
            </Card>
          </Row>
          {/* 充值modal */}
          <Modal title="成员充值" visible={this.state.visibleMember}
            onCancel={() => this.setState({ visibleMember: false, number: 10 })}
            onOk={() => this.btnCharge()}
            width={600}
          >
            <MemberRecharge parentScope={this} />
          </Modal>
          <ChargeModal
            visible={this.state.chargeModalVisible}
            data={users}
            onCancel={() => this.setState({ chargeModalVisible: false })}
            onOk={this.handleChargeOk}
            loadAllUserList={loadAllUserList}
          />
          <DeletedUsersModal
            title="已删除成员"
            visible={this.state.deletedUserModalVisible}
            wrapClassName="deletedUserModal"
            footer={null}
            onCancel={() => this.setState({deletedUserModalVisible: false})}
          />
          {/* <DeleteModal
            visible={this.state.deleteModalVisible}
            data={users}
            onCancel={() => this.setState({ deleteModalVisible: false })}
            onOk={this.handleDeleteOk}
            loadUserList={loadUserList}
            loginUser={userDetail}
          /> */}
          <Modal
            title='管理范围'
            visible = { this.state.manageRange }
            wrapClassName= "manageRangeWrapper"
            onOk = { this.closeManageRange }
            onCancel = { this.closeManageRange }
            footer={[
              <Button key="submit" type="primary" onClick={this.closeManageRange}>
                知道了
              </Button>,
            ]}
          >
            {
              this.manageRange()
            }
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProp(state) {
  let usersData = []
  let total = 0
  let onlineTotal = 0
  let data = []
  const users = state.user.users
  const userDetail = state.entities.loginUser.info
  if (users.result) {
    if (users.result.users) {
      usersData = users.result.users
      usersData.map((item, index) => {
        let role = ""
        if (item.role === ROLE_SYS_ADMIN) {
          role = "系统管理员"
        } else if(item.role === ROLE_PLATFORM_ADMIN){
          role = "平台管理员"
        }else if(item.role === ROLE_BASE_ADMIN){
          role = "基础设施管理员"
        }else {
          role = "普通成员"
        }
        data.push(
          {
            key: item.userID,
            name: item.displayName,
            namespace: item.namespace,
            tel: item.phone,
            active: item.active,
            email: item.email,
            style: role,
            role: item.role || 0,// user info into team list
            team: item.teamCount || '-',
            balance: parseAmount(item.balance).fullAmount,
            type: item.type,
            project: item[camelize('project_count')] || '-',
            online: item.online,
          }
        )
      })
    }
    if (users.result.total) {
      total = users.result.total
    }
    onlineTotal = users.result.onlineTotal
  }
  return {
    users: data,
    usersIsFetching: users.isFetching,
    total,
    onlineTotal,
    userDetail,
  }
}

export default connect(mapStateToProp, {
  loadUserList,
  createUser,
  deleteUser,
  checkUserName,
  chargeUser,
  updateUserActive,
  loadAllUserList,
})(Membermanagement)
