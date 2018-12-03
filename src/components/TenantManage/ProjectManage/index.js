/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Project Manage
 *
 * v0.1 - 2017-06-02
 * @author zhangxuan
 */
import React, {Component} from 'react'
import classNames from 'classnames';
import './style/ProjectManage.less'
import {Row, Col, Button, Card, Table, Modal, Transfer, InputNumber, Pagination, Checkbox, Form, Menu, Dropdown,} from 'antd'
import QueueAnim from 'rc-queue-anim'
import {browserHistory, Link} from 'react-router'
import {connect} from 'react-redux'
import intersection from 'lodash/intersection'
import xor from 'lodash/xor'
import {ListProjectsAndStatistics, DeleteProjects, UpdateProjects, CreateProjects} from '../../../actions/project'
import {usersAddRoles, roleWithMembers, usersLoseRoles} from '../../../actions/role'
import {loadUserList} from '../../../actions/user'
import {chargeProject} from '../../../actions/charge'
import {parseAmount} from '../../../common/tools'
import Notification from '../../../components/Notification'
import CommonSearchInput from '../../../components/CommonSearchInput'
import CreateStepFirst from './CreateStepFirst'
import CreateStepSecond from './CreateStepSecond'
import CreateStepThird from './CreateStepThird'
import {CREATE_PROJECTS_ROLE_ID, ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN} from '../../../../constants'
import isEmpty from 'lodash/isEmpty'
import { formatDate } from '../../../common/tools'
import Title from '../../Title'
import CreateModal from './CreateModal'
import TimeHover from '@tenx-ui/time-hover/lib'

let ProjectManage = React.createClass({

  getInitialState() {
    return {
      delModal: false,
      delSingle: false,
      paySingle: false,
      payModal: false,
      tableLoading: false,
      current: 0,
      payNumber: 10,
      projectList: {},
      deleteSinglePro: [],
      payArr: [],
      paySinglePro: [],
      projectName: undefined,
      description: '',
      authorizedCluster: [],
      RoleKeys: [],
      rightModal: false,
      userList: [],
      targetKeys: [],
      roleWithMember: {},
      closeCreateProject: false,
      originalKeys: [],
      deleteSingleChecked: false,
      confirmLoading: false,
      userCountSort: undefined,
      clusterCountSort: undefined,
      balanceSort: undefined,
      creation_timeSort: undefined,
      sort: 'a,name',
      roleFilter: '',
      clearInput: false,
      searchName: '',
      filteredInfo: {},
      currentPage: 1,
      isShowCreateModal: false,
    }
  },

  componentDidMount() {
    this.loadProjectList()
    //const step = this.props.location.query.step;
    //const {projectName, authorizedCluster} = this.state;
    // if (step) {
    //   if ((!projectName || authorizedCluster.length === 0) && step !== 'first') {
    //     browserHistory.replace('/tenant_manage/project_manage?step=first')
    //   }
    // }
  },

  componentWillReceiveProps(nextProps) {
    const step = nextProps.location.query.step;
    if (step) {
      let newStep;
      if (step === 'first') {
        newStep = 0
      } else if (step === 'second') {
        newStep = 1
      } else {
        newStep = 2
      }
      this.setState({
        current: newStep
      })
    } else {
      this.setState({
        projectName: undefined,
        description: undefined,
        authorizedCluster: [],
        RoleKeys: []
      })
    }
  },

  componentWillUnmount() {
    // 用户可能在项目列表页做了一些项目以及集群相关的操作（例如删除项目），退出页面时应该重新选择下当前项目及集群
    window._reselect_current_project_cluster && window._reselect_current_project_cluster()
  },

  updateProjectName(name) {
    this.setState({
      projectName: name
    })
  },

  updateProjectDesc(desc) {
    this.setState({
      description: desc
    })
  },

  updateCluster(arr) {
    this.setState({
      authorizedCluster: arr
    })
  },

  updateRole(Role) {
    this.setState({
      RoleKeys: Role
    })
  },

  updateRoleWithMember(roleWithMember) {
    this.setState({
      roleWithMember
    })
  },

  goStep(current) {
    const {projectName, authorizedCluster, RoleKeys} = this.state;
    const { validateFields } = this.props.form;
    let notify = new Notification()
    let s = '';
    validateFields(['projectName'],(errors,values)=> {
      if (!!errors) {
        return
      }
      if (current === 0) {
        s = 'first';
      } else if (current === 1) {
        if (!projectName) {
          return notify.info('请输入项目名称')
        } else if (authorizedCluster.length === 0) {
          return notify.info('请选择授权集群')
        }
        s = 'second';
      } else {
        if (RoleKeys.length === 0) {
          return notify.info('请选择项目角色')
        }
        s = 'third'
      }
      browserHistory.replace(`/tenant_manage/project_manage?step=${s}`);
      this.setState({current});
    })

  },

  next() {
    let current = this.state.current + 1;
    if (current === 3) {
      current = 0;
    }
    this.goStep(current)
  },

  goBack() {
    let current = this.state.current - 1;
    if (current === -1) {
      current = 2;
    }
    this.goStep(current)
  },

  delSingle(e, record) {
    // e.stopPropagation()
    this.setState({
      delSingle: true,
      deleteSinglePro: [record]
    })
  },

  singleCancel() {
    this.setState({delSingle: false, deleteSingleChecked: false})
  },

  pay() {
    this.setState({payModal: true})
  },

  payCancel() {
    this.setState({payModal: false})
  },

  paySingle(e, record) {
    e.stopPropagation()
    this.setState({
      paySingle: true,
      paySinglePro: [record]
    })
  },

  paySingleCancel() {
    this.setState({
      paySingle: false,
      payNumber: 10
    })
  },

  paySingleOk() {
    const {chargeProject} = this.props;
    const {paySinglePro, payNumber} = this.state;
    let notify = new Notification()
    chargeProject({
      namespaces: [paySinglePro[0].projectName],
      amount: payNumber
    }, {
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            notify.success('充值成功')
            this.setState({
              paySingle: false,
              payNumber: 10
            })
            this.loadProjectList()
          }
        },
        isAsync: true
      }
    })
  },

  changePayNumber(payNumber) {
    this.setState({payNumber})
  },

  deleteProject(modal) {
    const {DeleteProjects} = this.props;
    const { deleteSinglePro, currentPage } = this.state;
    let notify = new Notification()
    this.setState({ confirmLoading: true })
    DeleteProjects({
      body: {
        projects: [deleteSinglePro[0].projectName],
      }
    }, {
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            this.loadProjectList(currentPage)
            notify.success('项目删除成功')
            this.setState({[modal]: false, deleteSingleChecked: false})
          }
        },
        isAsync: true
      },
      failed: {
        func: err => {
          if (err.statusCode === 500 && err.message === "project balance must not less than zero") {
            notify.warn('该项目余额为负数，请充正后再试')
          } else {
            notify.warn('项目删除失败')
          }
        },
        isAsync: true,
      },
      finally: {
        func: () => this.setState({ confirmLoading: false })
      }
    })
  },

  updatePayNumber(payNumber) {
    this.setState({
      payNumber
    })
  },

  updatePayArr(payArr) {
    this.setState({
      payArr
    })
  },

  updatePayCharge() {
    const {chargeProject} = this.props;
    const {payArr, payNumber} = this.state;
    let notify = new Notification()
    if (payArr.length < 1) {
      return notify.info('请选择您要充值的项目')
    }
    chargeProject({
      namespaces: payArr,
      amount: payNumber
    }, {
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            notify.success('充值成功')
            this.setState({payModal: false})
            this.loadProjectList(null)
          }
        },
        isAsync: true
      }
    })
  },

  loadProjectList(n) {
    const {ListProjectsAndStatistics, roleNum} = this.props;
    const {sort, roleFilter, searchName} = this.state;
    this.setState({tableLoading: true})
    let page = n - 1 || 0
    let filter = searchName ? `name,${searchName}` : ''
    filter = roleFilter ? `role,${roleFilter}` : filter
    let obj = {
      from: page * 10,
      size: 10
    }
    obj = !filter ? obj : Object.assign(obj, {filter})
    obj = sort === '' ? obj : Object.assign(obj, {sort})

    ListProjectsAndStatistics(obj, {
      success: {
        func: (result) => {
          if (result.statusCode === 200) {
            if (!result['data']) {
              this.setState({
                projectList: {},
                tableLoading: false
              })
              return
            }
            result.data.projects.forEach(item => {
              let role = ''
              if (item.outlineRoles) {
                if (roleNum === 1) {
                  if (item.outlineRoles.includes('no-participator')) {
                    role = '非项目成员'
                  } else {
                    role = '项目成员'
                  }
                } else {
                  if (item.outlineRoles.includes('manager')) {
                    role = '管理者'
                  } else {
                    role = '参与者'
                  }
                }
              }
              Object.assign(item,{role})
            })
            this.setState({
              projectList: result.data,
              tableLoading: false,
              currentPage: n || 1,
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          this.setState({
            projectList: {},
            tableLoading: false
          })
          let notify = new Notification()
          notify.warn("读取项目列表失败：" + res.message.message)
        },
      }
    })
  },

  formatUserList(users) {
    for (let i = 0; i < users.length; i++) {
      Object.assign(users[i], {key: users[i].userID, title: users[i].namespace, chosen: false})
    }
  },
  getSystemAdmin(users) {
    let adminIdArr = []
    users.forEach(item => {
      item.role === ROLE_SYS_ADMIN && adminIdArr.push(item.userID)
    })
    return adminIdArr
  },
  openRightModal() {
    const {loadUserList, roleWithMembers} = this.props;
    loadUserList({
      size: 0
    }, {
      success: {
        func: (res) => {
          this.formatUserList(res.users)
          const systemRoleID = this.getSystemAdmin(res.users)
          this.setState({
            userList: res,
            systemRoleID
          }, () => {
            roleWithMembers({
              roleID: CREATE_PROJECTS_ROLE_ID,
              scope: 'global',
              scopeID: 'global'
            }, {
              success: {
                func: res => {
                  this.setState({
                    targetKeys: res.data.data ? res.data.data.map(item => {
                      return item.userId
                    }) : [],
                    originalKeys: res.data.data ? res.data.data.map(item => {
                      return item.userId
                    }) : [],
                    rightModal: true
                  })
                  this.setState((prevState) => {
                    return {
                      targetKeys: Array.from(new Set(prevState.targetKeys.concat(systemRoleID))),
                      originalKeys: Array.from(new Set(prevState.targetKeys.concat(systemRoleID))),
                    }
                  })
                },
                isAsync: true
              }
            })
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {

        },
        isAsync: true
      }
    })
  },

  cancelRightModal() {
    this.setState({
      rightModal: false
    })
  },

  confirmRightModal() {
    const {targetKeys, originalKeys} = this.state;
    let diff = xor(originalKeys, targetKeys)
    let add = intersection(targetKeys, diff)
    let del = intersection(originalKeys, diff)
    if (!del.length && !add.length) {
      this.setState({
        rightModal: false
      })
    } else if (del.length && !add.length) {
      this.removeMember(del, true)
    } else if (!del.length && add.length) {
      this.addMember(add, true)
    } else {
      this.addMember(add)
      this.removeMember(del, true)
    }
  },

  addMember(add, flag) {
    const {usersAddRoles} = this.props;
    let notify = new Notification()
    usersAddRoles({
      roleID: CREATE_PROJECTS_ROLE_ID,
      scope: 'global',
      scopeID: 'global',
      body: {
        userIDs: add
      }
    }, {
      success: {
        func: () => {
          if (flag) {
            notify.success('操作成功')
            this.setState({
              rightModal: false
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          if (flag) {
            if(err.statusCode === 403){
              notify.warn(`操作失败, 用户没有权限`)
            }
            else{
              notify.warn(`操作失败`)
            }
            this.setState({
              rightModal: false
            })
          }
        },
        isAsync: true
      }
    })
  },

  removeMember(del, flag) {
    const {usersLoseRoles} = this.props;
    let notify = new Notification()
    usersLoseRoles({
      roleID: CREATE_PROJECTS_ROLE_ID,
      scope: 'global',
      scopeID: 'global',
      body: {
        userIDs: del
      }
    }, {
      success: {
        func: () => {
          if (flag) {
            notify.success('操作成功')
            this.setState({
              rightModal: false
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          if (flag) {
            if(err.statusCode === 403){
              notify.warn(`操作失败, 用户没有权限`)
            }
            else{
              notify.warn(`操作失败`)
            }
            this.setState({
              rightModal: false
            })
          }
        },
        isAsync: true
      }
    })
  },

  filterOption(inputValue, option) {
    return option.title.indexOf(inputValue) > -1;
  },

  handleChange(targetKeys) {
    const { systemRoleID, originalKeys } = this.state
    let diff = xor(originalKeys,targetKeys)
    let del = intersection(originalKeys,diff)
    const result = systemRoleID.some(item => del.includes(item))
    let notify = new Notification()
    if (result) {
      return notify.info('禁止移除系统管理员')
    }
    this.setState({targetKeys});
  },

  createProject() {
    const {CreateProjects} = this.props;
    const {projectName, description, authorizedCluster, RoleKeys, roleWithMember} = this.state;
    let notify = new Notification()
    let roleBinds = {}
    for (let i = 0; i < RoleKeys.length; i++) {
      roleBinds[RoleKeys[i].split(',')[0]] = []
      for (let j in roleWithMember) {
        if (RoleKeys[i].split(',')[0] === j) {
          roleBinds[j] = roleWithMember[j]
        }
      }
    }
    CreateProjects({
      body: {
        projectName,
        description,
        authorizedCluster,
        roleBinds
      }
    }, {
      success: {
        func: res => {
          notify.success('创建项目成功')
          this.setState({
            projectName: undefined,
            description: undefined,
            authorizedCluster: [],
            RoleKeys: [],
            roleWithMember: {},
            closeCreateProject: true
          })
          this.loadProjectList()
          browserHistory.replace('/tenant_manage/project_manage')
        },
        isAsync: true
      },
      failed: {
        func: err => {
          if(err.statusCode === 403){
            notify.warn(`创建项目失败, 用户没有权限`)
          }
          else{
            notify.warn(`创建项目失败`)
          }
        },
        isAsync: true
      }
    })
  },

  closeProjectCreate() {
    this.setState({
      closeCreateProject: true
    }, () => {
      browserHistory.push('/tenant_manage/project_manage')
    })
  },

  startCreateProject() {
    // this.setState({
    //   closeCreateProject: false
    // }, () => {
    //   browserHistory.replace('/tenant_manage/project_manage?step=first')
    // })
    this.setState({
      isShowCreateModal: true,
    })
  },

  deleteProjectFooter() {
    const { deleteSingleChecked, confirmLoading } = this.state;
    return (
      <div>
        <Button type="ghost" size="large" onClick={this.singleCancel}>取消</Button>
        <Button type="primary" size="large" disabled={!deleteSingleChecked} loading={confirmLoading}
                onClick={() => this.deleteProject('delSingle')}>确认</Button>
      </div>
    )
  },

  refreshTeamList() {
    const { currentPage } = this.state
    this.loadProjectList(currentPage)
    //this.setState({
    //  userCountSort: undefined,
    //  clusterCountSort: undefined,
    //  balanceSort: undefined,
    //  creation_timeSort: undefined,
    //  sort: 'a,name',
    //  clearInput: true,
    //  searchName: ''
    //}, () => {
    //  this.loadProjectList()
    //})
  },

  handleSort(sortStr) {
    let currentSort = this.state[sortStr]
    let sort = this.getSort(currentSort, sortStr)
    this.setState({
      [sortStr]: !currentSort,
      sort
    }, () => {
      this.loadProjectList()
    })
  },

  getSort(flag, sort) {
    let str = 'a,'
    if (flag) {
      str = 'd,'
    }
    return str + sort.slice(0, sort.length - 4)
  },

  projectFilter(pagination, filters, sorter) {
    let role
    this.setState({
      roleFilter: (role = filters.role).length && role.length === 1 ? role[0] : '',
      filteredInfo: filters
    }, () => {
      this.loadProjectList()
    })
  },

  projectNameSearch(value) {
    this.setState({
      searchName: value
    }, () => {
      this.loadProjectList()
    })
  },
  createModalCancel(){
    this.setState({
      isShowCreateModal: false,
    })
  },
  createModalOk(values, _cb){
    const {CreateProjects} = this.props;
    let notify = new Notification();
    CreateProjects({
      body: {
        projectName: values.projectName,
        displayName: values.displayName,
        description: values.projectDesc,
        authorizedCluster: values.authorizedCluster,
        roleBinds: values.roleBinds
      }
    }, {
      success: {
        func: res => {
          notify.success('创建项目成功');
          this.setState({
            isShowCreateModal: false,
          }, () => {
            this.loadProjectList();
            !!_cb && _cb();
            browserHistory.replace('/tenant_manage/project_manage/project_detail?name=' + values.projectName);
          })
        },
        isAsync: true
      },
      failed: {
        func: err => {
          if(err.statusCode === 403){
            notify.warn(`创建项目失败, 用户没有权限`)
          }else{
            this.setState({
              isShowCreateModal:false
            })
            notify.warn(`创建项目失败`)
          }
          !!_cb && _cb();
        },
        isAsync: true
      }
    })
  },
  render() {
    const step = this.props.location.query.step || '';
    const {roleNum, roleCode, billingEnabled} = this.props;
    const {payNumber, projectList, delModal, deleteSinglePro, delSingle, tableLoading, payModal,
      paySinglePro, userList, deleteSingleChecked, filteredInfo, systemRoleID, currentPage,
    } = this.state;
    const isAble = roleCode === ROLE_SYS_ADMIN || roleCode === ROLE_PLATFORM_ADMIN;
    const couleCreateProject = roleCode === ROLE_SYS_ADMIN || roleCode === ROLE_PLATFORM_ADMIN || roleCode === ROLE_BASE_ADMIN;
    const pageOption = {
      simple: true,
      total: !isEmpty(projectList) && projectList['listMeta'].total || 0,
      defaultPageSize: 10,
      defaultCurrent: 1,
      onChange: (n) => this.loadProjectList(n),
      current: currentPage,
    };
    const adminFilter = [{
      text: '项目成员',
      value:'participator'
    }, {
      text: '非项目成员',
      value: 'no-participator'
    }]
    const roleCol = {
      title: '我是',
      dataIndex: 'role',
      key: 'role',
      width: '10%',
      filters: adminFilter,
      filteredValue: filteredInfo.role,
    }
    let columns = [{
      title: '项目名',
      // dataIndex: 'projectName',
      key: 'projectName',
      width: '15%',
      render: (data) => <Link to={`/tenant_manage/project_manage/project_detail?name=${data.projectName}`}>{
        data.displayName ? `${data.displayName}( ${data.projectName} )` : data.projectName
      }</Link>,
    }, {
      title: (
        <div onClick={() => this.handleSort('clusterCountSort')}>
          授权集群
          <div className="ant-table-column-sorter">
            <span
              className={this.state.clusterCountSort === true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'}
              title="↑">
              <i className="anticon anticon-caret-up"/>
            </span>
            <span
              className={this.state.clusterCountSort === false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'}
              title="↓">
              <i className="anticon anticon-caret-down"/>
            </span>
          </div>
        </div>
      ),
      dataIndex: 'clusterCount',
      key: 'clusterCount',
      width: '10%',
      render: text => text ? text : 0
    }, {
      title: (
        <div onClick={() => this.handleSort('userCountSort')}>
          成员
          <div className="ant-table-column-sorter">
          <span
            className={this.state.userCountSort === true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'}
            title="↑">
            <i className="anticon anticon-caret-up"/>
          </span>
            <span
              className={this.state.userCountSort === false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'}
              title="↓">
            <i className="anticon anticon-caret-down"/>
          </span>
          </div>
        </div>
      ),
      dataIndex: 'userCount',
      key: 'userCount',
      width: '10%',
      render: text => text ? text : 0
    }, {
      title: (
        <div onClick={() => this.handleSort('creation_timeSort')}>
          创建时间
          <div className="ant-table-column-sorter">
            <span
              className={this.state.creation_timeSort === true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'}
              title="↑">
              <i className="anticon anticon-caret-up"/>
            </span>
            <span
              className={this.state.creation_timeSort === false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'}
              title="↓">
              <i className="anticon anticon-caret-down"/>
            </span>
          </div>
        </div>
      ),
      dataIndex: 'creationTime',
      key: 'creationTime',
      width: '15%',
      render: text => <TimeHover time={text} />
    }, {
      title: (
        <div onClick={() => this.handleSort('balanceSort')}>
          余额
          <div className="ant-table-column-sorter">
          <span
            className={this.state.balanceSort === true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'}
            title="↑">
            <i className="anticon anticon-caret-up"/>
          </span>
            <span
              className={this.state.balanceSort === false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'}
              title="↓">
            <i className="anticon anticon-caret-down"/>
          </span>
          </div>
        </div>
      ),
      dataIndex: 'balance',
      key: 'balance',
      width: '10%',
      render: (text) => <span className="balanceColor">{parseAmount(text, 4).fullAmount}</span>
    }, {
      title: '操作',
      key: 'operation',
      width: '15%',
      render: (text, record) => {
        const { roleCode }= this.props
        const menu = (
          <Menu onClick={(e) => this.delSingle(e, record)} style={{ width: 80 }}>
            <Menu.Item disabled={roleNum !==1 && record.role === 'participator'} key="delete">
              删除
            </Menu.Item>
          </Menu>
        );
        return(
          <span>
              {
                roleNum === 1 ?
                  <Dropdown.Button
                    overlay={menu} type="ghost"
                    onClick={(e) => {
                      if (!billingEnabled || roleCode === 4 ) {
                        browserHistory.push(`/tenant_manage/project_manage/project_detail?name=${record.projectName}`)
                        return
                      }
                      this.paySingle(e, record)
                    }} >
                    { billingEnabled && roleCode !== 4? '充值' : '查看' }
                  </Dropdown.Button> :
                  <Button disabled={record.role === '参与者'}
                          type='ghost' style={{marginLeft: '10px'}}
                          onClick={(e) => this.delSingle(e, record)}>删除</Button>
              }
          </span>
        )
      }
    }]
    if (roleNum === 1) {
      columns.splice(1, 0, roleCol)
      columns.splice(5, 1)
    } else {
      columns.splice(4, 1)
    }
    return (
      <QueueAnim>
        <div key='account_projectManage' id="account_projectManage">
          <Title title="项目管理"/>
          <div className='alertRow' style={{ fontSize: 14 }}>
            项目之间是相互隔离的，通过创建项目实现一些人在项目中有一些权限。创建项目时应为项目申请授权集群，系统管理员在『租户管理』中审批通过后为已授权状态即可使用。系统管理员可将普通成员设置为『可以创建项目』的人，项目创建者为项目管理者，项目中也可添加其他的项目管理者。
          </div>
          <Modal title="删除项目" visible={delModal} width={610} height={570}
                 onCancel={() => this.setState({delModal: false})}
                 onOk={() => this.deleteProject('delModal')}
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
              <span>将永久删除以下项目，包括项目中的所有资源。您确定要删除以下项目？</span>
            </div>
          </Modal>
          <Modal title="删除项目" visible={delSingle} width={610}
                 onCancel={this.singleCancel}
                 footer={this.deleteProjectFooter()}
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
              <div style={{width: "280px"}}>
                <span>删除后该项目的资源也将被清理，此操作不能恢复。</span>
                <span>{`您是否确定要删除项目${deleteSinglePro && deleteSinglePro[0] && deleteSinglePro[0].projectName}？`}</span>
              </div>
            </div>
            {/*<div className="themeColor" style={{marginBottom: '15px'}}>
              <i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}/>
              {`您是否确定要删除项目${deleteSinglePro && deleteSinglePro[0] && deleteSinglePro[0].projectName}？`}
            </div>*/}
            <Checkbox checked={deleteSingleChecked} onChange={() => {
              this.setState({deleteSingleChecked: !deleteSingleChecked})
            }}>选中此框以确认您要删除此项目。</Checkbox>
          </Modal>
          {
            payModal && <Modal title="项目充值" visible={payModal} width={610}
                onCancel={() => this.payCancel()}
                onOk={() => this.updatePayCharge()}
              >
                <PayTable data={projectList && projectList.projects} updatePayArr={this.updatePayArr}
                          visible={payModal} updatePayCharge={this.updatePayCharge}
                          currentPage={currentPage} ListProjectsAndStatistics={this.props.ListProjectsAndStatistics}
                          updatePayNumber={this.updatePayNumber}/>
              </Modal>
          }
          <Modal title="项目充值" visible={this.state.paySingle} width={580}
                 onCancel={() => this.paySingleCancel()}
                 onOk={() => this.paySingleOk()}
          >
            <dl className="paySingleList">
              <dt>项目名</dt>
              <dd>{paySinglePro[0] && paySinglePro[0].projectName}</dd>
            </dl>
            <dl className="paySingleList">
              <dt>余额</dt>
              <dd>{parseAmount(paySinglePro[0] && paySinglePro[0].balance, 4).fullAmount}</dd>
            </dl>
            <dl className="paySingleList">
              <dt>充值金额</dt>
              <dd className="payBtn">
                <span className={classNames('btnList', {'active': payNumber === 10})} onClick={() => {
                  this.changePayNumber(10)
                }}>10T<div className="triangle"><i className="anticon anticon-check"/></div></span>
                <span className={classNames('btnList', {'active': payNumber === 20})} onClick={() => {
                  this.changePayNumber(20)
                }}>20T<div className="triangle"><i className="anticon anticon-check"/></div></span>
                <span className={classNames('btnList', {'active': payNumber === 50})} onClick={() => {
                  this.changePayNumber(50)
                }}>50T<div className="triangle"><i className="anticon anticon-check"/></div></span>
                <span className={classNames('btnList', {'active': payNumber === 100})} onClick={() => {
                  this.changePayNumber(100)
                }}>100T<div className="triangle"><i className="anticon anticon-check"/></div></span>
                <InputNumber value={payNumber} onChange={(value) => this.setState({payNumber: value})} size="large"
                             min={1}/>
                <b>T</b>
              </dd>
            </dl>
          </Modal>
          <Modal title="选择可以创建项目的成员" width={760} visible={this.state.rightModal}
                 onCancel={() => this.cancelRightModal()}
                 onOk={() => this.confirmRightModal()}
          >
            <div className="alertRow">可创建项目的成员能创建项目并有管理该项目的权限</div>
            <Transfer
              dataSource={userList.users}
              listStyle={{
                width: 300,
                height: 270,
              }}
              operations={['添加', '移除']}
              titles={['可选成员名', '可创建项目成员']}
              searchPlaceholder="按成员名搜索"
              showSearch
              filterOption={this.filterOption}
              targetKeys={this.state.targetKeys}
              onChange={this.handleChange}
              render={item => item && item.title}
            />
          </Modal>
          <Row className={classNames('btnBox', {'hidden': step !== ''})}>
            {
              // (roleNum == 1 || roleNum == 2)&&
              <Button type='primary' size='large' className='addBtn' onClick={this.startCreateProject}>
                <i className='fa fa-plus'/> 创建项目
              </Button>
            }
            {
              isAble &&
              <Button type="ghost" size="large" className="manageBtn" onClick={() => this.openRightModal()}>
                <svg id="chosenCreator">
                  {/*@#mouse-point*/}
                  <use xlinkHref='#chosencreator' />
                </svg> 哪些人可以创建项目</Button>
            }
            {
              billingEnabled && isAble&&
              <Button type="ghost" icon="pay-circle-o" size="large" className="manageBtn" onClick={() => this.pay()}>批量充值</Button>
            }
            <Button type="ghost" size="large" className="manageBtn" onClick={() => this.refreshTeamList()}><i
              className="fa fa-refresh" aria-hidden="true" style={{marginRight: '5px'}}/>刷新</Button>
            <CommonSearchInput clearInput={this.state.clearInput} placeholder="按命名空间搜索" size="large"
                               onSearch={(value) => this.projectNameSearch(value)}/>
            { !isEmpty(projectList) && projectList.listMeta.total !== 0 && <Pagination {...pageOption}/>}
            { !isEmpty(projectList) && projectList.listMeta.total !== 0 && <div className="total">共计 {!isEmpty(projectList) && projectList.listMeta.total || 0} 个</div>}
          </Row>
          <Row className={classNames("projectList", {'hidden': step !== ''})}>
            <Card>
              <Table
                loading={tableLoading}
                pagination={false}
                columns={columns}
                dataSource={!isEmpty(projectList) ? projectList.projects : []}
                onChange={this.projectFilter}
              />
            </Card>
          </Row>
          {/*
            <div className={classNames("goBackBox", {'hidden': step === ''})}>
              <span className="goBackBtn pointer" onClick={() => browserHistory.replace('/tenant_manage/project_manage')}>返回</span>
              <i/>
              创建项目
            </div>
            <div className={classNames('createBox', {'hidden': step === ''})}>
              <ul className="stepBox">
                <li className={classNames({'active': step === 'first'})}><span>1</span>项目基础信息</li>
                <li className={classNames({'active': step === 'second'})}><span>2</span>为项目添加角色</li>
                <li className={classNames({'active': step === 'third'})}><span>3</span>为角色关联对象</li>
              </ul>
              <div className="alertRow createTip">
                {
                  step === 'first' ? '请填写项目名称、描述，并为该项目授权集群' : ''
                }
                {
                  step === 'second' ? '为该项目添加需要的角色，角色是提前创建好的，也可在此创建新角色后继续添加' : ''
                }
                {
                  step === 'third' ? '为添加的角色关联对象，即可为关联的对象授予相应角色应有的权限；关联的对象可为（成员/团队/成员&团队组合）。' : ''
                }
              </div>
              <Form>
                <div className={classNames({'hidden': step !== 'first'})}>
                  <CreateStepFirst scope={this} step={step} updateProjectName={this.updateProjectName}
                                  updateProjectDesc={this.updateProjectDesc}
                                  updateCluster={this.updateCluster} form={this.props.form}/>
                </div>
                <div className={classNames({'hidden': step !== 'second'})}>
                  <CreateStepSecond scope={this} step={step} updateRole={this.updateRole} form={this.props.form}/>
                </div>
                <div className={classNames({'hidden': step !== 'third'})}>
                  <CreateStepThird scope={this} step={step} updateRole={this.updateRole}
                                  updateRoleWithMember={this.updateRoleWithMember} form={this.props.form}/>
                </div>
              </Form>
            </div>
            <div className={classNames('createBtnBox', {'hidden': step === ''})}>
              <Button size="large" onClick={this.closeProjectCreate}>取消</Button>
              <Button size="large" className={classNames({'hidden': step === '' || step === 'first'})}
                      onClick={() => this.goBack()}>上一步</Button>
              <Button size="large" className={classNames({'hidden': step === 'third'})}
                      onClick={() => this.next()}>下一步</Button>
              <Button type="primary" size="large" onClick={this.createProject}
                      style={{display: step === 'third' ? 'inline-block' : 'none'}}>创建</Button>
            </div>
          */}
        </div>
        <CreateModal
          visible={this.state.isShowCreateModal}
          onOk={this.createModalOk}
          onCancel={this.createModalCancel}
          onClose={this.createModalCancel}
          roleNum={roleNum}
        />
      </QueueAnim>
    )
  }
})

function mapStateToProps(state, props) {
  const {loginUser} = state.entities
  const {globalRoles, role, billingConfig} = loginUser.info || {globalRoles: [], role: 0}
  const { enabled: billingEnabled } = billingConfig
  let roleCode = role
  let roleNum = 0
  if (role === ROLE_SYS_ADMIN || role === ROLE_PLATFORM_ADMIN) {
    roleNum = 1
  } else if (globalRoles.length) {
    for (let i = 0; i < globalRoles.length; i++) {
      if (globalRoles[i] === 'project-creator') {
        roleNum = 2;
        break
      } else {
        roleNum = 3
      }
    }
  }
  return {
    roleNum,
    billingEnabled,
    roleCode
  }
}

export default connect(mapStateToProps, {
  ListProjectsAndStatistics,
  DeleteProjects,
  UpdateProjects,
  chargeProject,
  loadUserList,
  CreateProjects,
  usersAddRoles,
  roleWithMembers,
  usersLoseRoles
})(Form.create()(ProjectManage));

class PayTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedRowKeys: [],  // 这里配置默认勾选列
      payNumber: 10,
      payArr: [],
      currentPage: 1,
      projectList: [],
      tableLoading: false,
    }
  }

  componentWillMount() {
    const {updatePayNumber} = this.props;
    updatePayNumber(10)
    this.loadProjectList(1)
  }

  componentWillReceiveProps(nextProps) {
    const {visible} = nextProps;
    const {updatePayNumber} = nextProps;
    if (!visible) {
      this.setState({
        selectedRowKeys: [],
        payArr: [],
        payNumber: 10
      })
      updatePayNumber(10)
    }
  }

  onSelectChange(selectedRowKeys) {
    const {updatePayArr} = this.props;
    this.setState({selectedRowKeys});//报错
    updatePayArr(selectedRowKeys)
  }

  onRowClick = (record, index) => {
    const { updatePayArr } = this.props
    const { selectedRowKeys } = this.state
    const projectName = record.namespace
    let newKeys = selectedRowKeys.slice(0)
    if (newKeys.includes(projectName)) {
      newKeys.splice(newKeys.indexOf(projectName), 1)
    } else {
      newKeys.push(projectName)
    }
    updatePayArr(newKeys)
    this.setState({
      selectedRowKeys: newKeys
    })
  }
  changePayNumber(payNumber) {
    const {updatePayNumber} = this.props;
    this.setState({payNumber})
    updatePayNumber(payNumber)
  }
  loadProjectList(n) {
    const { ListProjectsAndStatistics } = this.props;
    this.setState({tableLoading: true}, () => {
      let page = n - 1 || 0
      let obj = {
        from: page * 10,
        size: 10,
        sort: 'a,name',
      }
      ListProjectsAndStatistics(obj, {
        success: {
          func: (result) => {
            if (result.statusCode === 200) {
              if (!result['data']) {
                this.setState({
                  projectList: {},
                  tableLoading: false
                })
                return
              }
              this.setState({
                projectList: result.data,
                tableLoading: false,
                currentPage: n || 1,
              })
            }
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            this.setState({
              projectList: {},
              tableLoading: false
            })
            let notify = new Notification()
            notify.warn("读取项目列表失败：" + res.message.message)
          },
        }
      })
    })
  }
  render() {
    const {payNumber, selectedRowKeys, currentPage, projectList, tableLoading} = this.state;
    const pageOption = {
      simple: true,
      total: !isEmpty(projectList) && projectList['listMeta'].total || 0,
      defaultPageSize: 10,
      defaultCurrent: 1,
      onChange: (n) => this.loadProjectList(n),
      current: currentPage,
    };
    const data = !isEmpty(projectList) && projectList['projects'];
    const columns = [{
      title: '项目名',
      dataIndex: 'projectName',
      width: '45%'
    }, {
      title: '余额',
      dataIndex: 'balance',
      width: '45%',
      render: (text, record) => {
        return (
          <span className="balanceColor">{parseAmount(text, 4).fullAmount}</span>
        )
      }
    }];
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys)=>this.onSelectChange(selectedRowKeys),
    };
    return (
      <div className="payModal">
        <div className="alertRow">
          注：可为项目充值，全选可为项目充值
        </div>
        <div className="tablePagination">
          { !isEmpty(projectList) && projectList.listMeta.total !== 0 && <Pagination {...pageOption}/>}
          { !isEmpty(projectList) && projectList.listMeta.total !== 0 && <div className="total">共计 {!isEmpty(projectList) && projectList.listMeta.total || 0} 个</div>}
          <div style={{ clear: 'both' }}></div>
        </div>
        <Table loading={tableLoading} scroll={{y: 300}} rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}
               onRowClick={(recode, index) => this.onRowClick(recode, index)} rowKey={record => record.namespace}
               rowClassName={(recode, index) => 'payTableRow'}/>
        <dl className="payBtnBox">
          <dt>充值金额</dt>
          <dd className="payBtn">
            <span className={classNames('btnList', {'active': payNumber === 10})} onClick={() => {
              this.changePayNumber(10)
            }}>10T<div className="triangle"><i className="anticon anticon-check"/></div></span>
            <span className={classNames('btnList', {'active': payNumber === 20})} onClick={() => {
              this.changePayNumber(20)
            }}>20T<div className="triangle"><i className="anticon anticon-check"/></div></span>
            <span className={classNames('btnList', {'active': payNumber === 50})} onClick={() => {
              this.changePayNumber(50)
            }}>50T<div className="triangle"><i className="anticon anticon-check"/></div></span>
            <span className={classNames('btnList', {'active': payNumber === 100})} onClick={() => {
              this.changePayNumber(100)
            }}>100T<div className="triangle"><i className="anticon anticon-check"/></div></span>
            <InputNumber value={payNumber} onChange={(value) => this.changePayNumber(value)} size="large" min={1}/>
            <b>T</b>
          </dd>
        </dl>
      </div>
    )
  }
}




