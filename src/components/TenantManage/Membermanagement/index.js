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
import { Row, Col, Alert, Button, Input, Select, Menu, Card, Spin, Icon, Table, Modal, Checkbox, Tooltip, Dropdown } from 'antd'
import SearchInput from '../../SearchInput'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import { loadUserList, createUser, deleteUser, checkUserName, updateUserActive } from '../../../actions/user'
import { chargeUser } from '../../../actions/charge'
import { Link } from 'react-router'
import { parseAmount } from '../../../common/tools'
import CreateUserModal from '../CreateUserModal'
import NotificationHandler from '../../../components/Notification'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants'
import MemberRecharge from '../../AccountModal/_Enterprise/Recharge'
import { MAX_CHARGE } from '../../../constants'
import Title from '../../Title'
import ChargeModal from './ChargeModal'
import CommonSearchInput from '../../CommonSearchInput'
// import DeleteModal from './DeleteModal'
import successPic from '../../../assets/img/wancheng.png'

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
      delBtnLoading: false,
      delErrorMsg: null,
      copyStatus: false,
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
  delMember() {
    const { scope } = this.props
    const record = this.state.userManage
    if (record.style === "系统管理员") {
      confirm({
        title: '不能删除系统管理员',
      });
      return
    }
    this.setState({ delBtnLoading: true })
    let notification = new NotificationHandler()
    const { page, pageSize, filter, sort } = scope.state
    scope.props.deleteUser(record.key, {
      success: {
        func: () => {
          notification.success('删除成功！')
          scope.props.loadUserList({
            page: page,
            size: pageSize,
            sort: sort,
            filter: filter,
          })
          this.setState({ delModal: false, delErrorMsg: null })
        },
        isAsync: true
      },
      failed: {
        func: err => {
          this.setState({
            delErrorMsg: err.message,
          })
          notification.error('删除失败！')
        }
      },
      finally: {
        func: () => {
          this.setState({ delBtnLoading: false })
        }
      }
    })

  },
  filtertypes(filters) {
    // member select filter type (0=>普通成员，1=>团队管理员，3=> 系统管理员)
    // return number
    let filter = ''
    let isSetFilter = false
    let protoDate = ['0', '1', '2']
    let typeData = ['1', '2']
    if (filters.style) {
      if (filters.style.length === 1) {
        isSetFilter = true
        filter = `role__eq,${filters.style[0]}`
      }
      if (filters.style.length == 2) {
        for (let i = 0; i < protoDate.length; i++) {
          let item = protoDate[i]
          if (filters.style.indexOf(item) < 0) {
            isSetFilter = true
            filter = `role__neq,${item}`
            break
          }
        }
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
    if (isSetFilter) {
      return filter
    }
    return protoDate.concat(typeData)
  },
  onTableChange(pagination, filters, sorter) {
    // 点击分页、筛选、排序时触发
    if (!filters.style && !filters.type) {
      return
    }
    let styleFilterStr = filters.style ? filters.style.toString() : ''
    let typeFilterStr = filters.type ? filters.type.toString() : ''
    if (styleFilterStr === this.styleFilter && typeFilterStr == this.typeFilterStr) {
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

    let filter = this.filtertypes(filters)
    query.filter = filter
    scope.setState({
      filter
    })
    loadUserList(query)
    this.styleFilter = styleFilterStr
    this.typeFilterStr = typeFilterStr
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
  handleMenuClick(record, { key }) {
    if (key === 'delete') {
      this.setState({ delModal: true, userManage: record })
      return
    }
    const notification = new NotificationHandler()
    const { active, name } = record
    const userId = record.key
    const { scope } = this.props
    const { updateUserActive, loadUserList } = scope.props
    const { page, pageSize, filter, sort } = scope.state
    const text = active === 2 ? '启用' : '停用'
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
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          notification.error(`${text}用户 ${name} 失败`)
        }
      }
    })
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
    let { selectedRowKeys, sortedInfo, filteredInfo, sort, delBtnLoading, delErrorMsg, copyStatus } = this.state
    const { searchResult, notFound } = this.props.scope.state
    const { data, scope } = this.props

    let userManageName = this.state.userManage ? this.state.userManage.name : ''

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
    let filterKey = [
      { text: '普通成员', value: 0 },
      { text: '团队管理员', value: 1 }
    ]
    let userStatusfilterKey = [
      { text: '不可用', value: 2 },
      { text: '可用', value: 1 },
    ]
    // if (userDetail.role === ROLE_SYS_ADMIN) {
    //   filterKey = [
    //     { text: '普通成员', value: 0 },
    //     { text: '团队管理员', value: 1 },
    //     { text: '系统管理员', value: 2 }
    //   ]
    // }

    let ldapFileter = [{ text: '是', value: 2 }, { text: '否', value: 1 }]

    let columns = [
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
        render: (text, record, index) => {
          if (userDetail.role === ROLE_SYS_ADMIN) {
            return (
              <Link to={`/tenant_manage/user/${record.key}`}>
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
          const color = active === 2 ? '#f23e3f' : '#33b867'
          const text = active === 2 ? '不可用' : '可用'
          return (
            <div style={{ color }}>
              <i className="fa fa-circle"></i>&nbsp;
              <span>{text}</span>
            </div>
          )
        }
      },
      // {
      //   title: '手机',
      //   dataIndex: 'tel',
      //   key: 'tel',
      //   width: '10%',
      // },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: '15%',
      },
      {
        title: '类型',
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
    if (userDetail.role === ROLE_SYS_ADMIN) {
      columns.push({
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record, index) => (
          <div className="action">
            <Dropdown.Button
              onClick={() => scope.memberRecharge(record)}
              overlay={
                <Menu
                  onClick={this.handleMenuClick.bind(this, record)}
                  style={{ width: '80px' }}
                >
                  <Menu.Item key="active">
                    {
                      record.active === 2 ? '启用' : '停用'
                    }
                  </Menu.Item>
                  <Menu.Item key="delete">删除</Menu.Item>
                </Menu>
              }
              type="ghost"
            >
              充值
            </Dropdown.Button>
            {/* <Button type="primary" className="setBtn" onClick={() => scope.memberRecharge(record)}>充值</Button>
            <Button className="delBtn setBtn" onClick={() => this.setState({ delModal: true, userManage: record })}>
              删除
            </Button> */}
          </div>
        ),
      })
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
        />
        <Modal title="删除成员操作"
          visible={this.state.delModal}
          onCancel={() => this.setState({ delModal: false, delErrorMsg: null })}
          wrapClassName="deleteMemberModal"
          footer={[
            <Button
              key="back"
              type="ghost"
              size="large"
              onClick={() => this.setState({ delModal: false, delErrorMsg: null })}
            >
              取 消
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              loading={delBtnLoading}
              onClick={() => this.delMember()}
            >
              确 定
            </Button>,
          ]}
        >
        {
          (delBtnLoading && !delErrorMsg) && (
            <div className="loadingBox"><Spin size="large" /></div>
          )
        }
        {
          (!delBtnLoading && !delErrorMsg) && (
            <div className="modalColor">
              <Row className="alertRow warningRow">
                <Col span={2} className="alertRowIcon">
                  <i className="fa fa-exclamation-triangle" aria-hidden="true" />
                </Col>
                <Col span={22}>
                  删除后可在已删除成员表单中查看，此操作不可恢复，且平台上不能再次创建同名成员
                </Col>
              </Row>
              <i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}></i>
              您是否确定要删除成员 {userManageName} ?
            </div>
          )
        }
        {
          (!delBtnLoading && delErrorMsg) && (
            <div>
              <Row className="alertRow warningRow">
                <Col span={2} className="alertRowIcon">
                  <i className="fa fa-exclamation-triangle" aria-hidden="true" />
                </Col>
                <Col span={22} className="alertRowDesc">
                  删除该成员任务失败，请查看以下日志
                </Col>
              </Row>
              <div className="delErrorMsg">
                <div className="delErrorMsgHeader" gutter={16}>
                  <div className="delErrorMsgText">日志</div>
                  <div className="delErrorMsgIcon">
                    <input style={{opacity:0}} id="delErrorMsg" value={delErrorMsg} />
                    <Tooltip title={copyStatus ? '复制成功' : '点击复制'}>
                      <Icon
                        type="copy"
                        onMouseLeave={this.returnDefaultTooltip}
                        onClick={this.copyText}
                      />
                    </Tooltip>
                  </div>
                </div>
                <div className="delErrorMsgBody">
                  <pre>
                    {delErrorMsg}
                  </pre>
                </div>
              </div>
            </div>
          )
        }
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
    if (userDetail.role !== ROLE_SYS_ADMIN) {
      return this.showInfo('普通成员没有权限创建新成员')
    }
    this.setState({
      visible: true,
    })
    setTimeout(function () {
      document.getElementById('newUser').focus()
    }, 500);
  }
  loadData = query => {
    const defaultQuery = {
      page: 1,
      size: 10,
      sort: "a,userName",
      filter: "",
    }
    this.props.loadUserList(Object.assign({}, defaultQuery, query))
  }
  componentWillMount() {
    this.loadData()
  }
  userOnSubmit(user) {
    const { createUser, loadUserList } = this.props
    let { page, pageSize, sort, filter, createUserErrorMsg } = this.state
    let notification = new NotificationHandler()
    notification.spin(`创建用户 ${user.userName} 中...`)
    createUser(user, {
      success: {
        func: (response) => {
          loadUserList({
            page,
            size: pageSize,
            sort,
            filter,
          })
          notification.close()
          if (response.data && response.data == "SEND_MAIL_ERROR") {
            createUserErrorMsg = '发送邮件失败'
          } else {
            createUserErrorMsg = null
          }
          this.setState({
            createUserErrorMsg,
            createUserSuccessModalVisible: true,
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`创建用户 ${user.userName} 失败`, err.message.message)
        }
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

  /* handleDeleteOk = (namespaces, amount) => {
    //
  } */

  render() {
    const { users, checkUserName, loadUserList, userDetail } = this.props
    const scope = this
    const { visible, memberList, hasSelected, createUserErrorMsg } = this.state
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
    return (
      <div id="Membermanagement">
        <Alert message={`成员是指公司内外共同协作管理和使用平台的人，每个成员创建后都会有一个个人的项目，可在项目中创建个人的资源；系统管理员可在『基础设施』中设置授权给个人项目使用的集群。系统管理员有创建并管理所有系统管理员、团队管理员、普通成员的权限；团队管理员有创建并管理普通成员和对其他团队管理员有查看、充值、加入团队、加入项目的权限`}
          type="info" />
        <Row>
          <Button type="primary" size="large" onClick={this.showModal} className="Btn">
            <i className='fa fa-plus' /> 创建新成员
          </Button>
          {
            userDetail.role === ROLE_SYS_ADMIN && (
              <Button type="ghost" size="large" className="Btn btn" onClick={() => this.setState({ chargeModalVisible: true })}>
                <Icon type="pay-circle-o" />批量充值
              </Button>
            )
          }
          <Button type="ghost" size="large" className="Btn btn" onClick={this.loadData}>
            <i className='fa fa-refresh' /> &nbsp;刷 新
          </Button>
          <Button type="dashed" size="large" className="Btn btn" onClick={() => this.setState({ deletedUserModalVisible: true })}>
            <Icon type="solution" />已删除成员
          </Button>
          {/* <Button type="ghost" size="large" className="Btn btn" onClick={() => this.setState({ deleteModalVisible: true })}>
            <Icon type="delete" />批量删除
          </Button> */}
          <SearchInput scope={scope} searchIntOption={searchIntOption} />
          <CreateUserModal
            visible={visible}
            scope={scope}
            onSubmit={this.userOnSubmit}
            funcs={funcs}
          />
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
            </div>
            <div className="alertRow">
              该成员不属于任何项目与团队，且无创建项目与团队权限。
              <p>1. 可将该成员添加到某团队；或将该成员添加到某项目中，并授予角色。</p>
              <p>2. 可在团队列表页将该成员授予可创建团队权限，或在项目列表页将该成员授予可创建项目权限。</p>
            </div>
          </Modal>
          <div className="total">共计 {this.props.total} 条&nbsp; </div>
        </Row>
        <Row className="memberList">
          <Card className="memberlist">
            <MemberTable scope={scope} data={users} />
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
          loadUserList={loadUserList}
        />
        <Modal
          title="已删除成员"
          visible={this.state.deletedUserModalVisible}
          wrapClassName="deletedUserModal"
          footer={null}
          onCancel={() => this.setState({deletedUserModalVisible: false})}
        >
          <div className="deletedUserModalBody">
            <div className="deletedUserModalHeader">
              <div className="deletedUserModalHeaderLeft">
                {/* <Checkbox>全选</Checkbox> */}
                <CommonSearchInput placeholder="输入用户名搜索"/>
              </div>
              <div className="deletedUserModalHeaderRight">
              </div>
            </div>
            <div className="deletedUserModalContent">
              body
            </div>
          </div>
        </Modal>

        {/* <DeleteModal
          visible={this.state.deleteModalVisible}
          data={users}
          onCancel={() => this.setState({ deleteModalVisible: false })}
          onOk={this.handleDeleteOk}
          loadUserList={loadUserList}
          loginUser={userDetail}
        /> */}
      </div>
    )
  }
}

function mapStateToProp(state) {
  let usersData = []
  let total = 0
  let data = []
  const users = state.user.users
  const userDetail = state.entities.loginUser.info
  if (users.result) {
    if (users.result.users) {
      usersData = users.result.users
      usersData.map((item, index) => {
        let role = ""
        if (item.role === ROLE_TEAM_ADMIN) {
          role = "团队管理员"
        } else if (item.role === ROLE_SYS_ADMIN) {
          role = "系统管理员"
        } else {
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
            role: userDetail.role,// user info into team list
            team: item.teamCount || '-',
            balance: parseAmount(item.balance).fullAmount,
            type: item.type,
            project: item[camelize('project_count')] || '-',
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
    total,
    userDetail
  }
}

export default connect(mapStateToProp, {
  loadUserList,
  createUser,
  deleteUser,
  checkUserName,
  chargeUser,
  updateUserActive,
})(Membermanagement)