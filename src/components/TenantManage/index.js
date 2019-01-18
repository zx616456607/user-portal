/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Tuesday July 10th 2018
 */
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Tenant management
 *
 * v0.1 - 2017-07-17
 * @author ZhaoYanBei
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Row, Card, Col, Modal, Button, Icon, Table } from 'antd'
import './style/tenantManage.less'
import Title from '../Title'
import { fetchinfoList } from '../../actions/tenant_overview'
import { GetProjectsApprovalClustersWithoutTypes } from '../../actions/project'
import ReactEcharts from 'echarts-for-react'
import QueueAnim from 'rc-queue-anim'
import TenxIcon from '@tenx-ui/icon/es/_old'
import ApprovalOperation from './ApprovalOperation'
import { calcuDate } from '../../common/tools'
import { checkApplyRecord } from '../../../client/actions/applyLimit'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { checkResourcequotaDetail } from '../../../client/actions/applyLimit'
import { getResourceDefinition } from '../../../src/actions/quota'
import { getDevopsGlobaleQuotaList } from '../../../src/actions/quota'
import * as userActions from '../../actions/user'
import cloneDeep from 'lodash/cloneDeep'
import * as projectActions from '../../actions/project'
import filter from 'lodash/filter'
import NotificationHandler from '../Notification'

const notification = new NotificationHandler()

const getColumns = ({ toggleApprovalModal, allUsers }) => {
  return [{
    title: '项目',
    dataIndex: 'item',
    render: (text, record) => {
      let link
      let projectId = 'cannot find'
      for (const value of allUsers) {
        if (value.namespace === record.namespace) {
          projectId = value.userID
        }
      }
      if (record.applier === record.namespace) { // 这个代表个人项目
        link = `/tenant_manage/user/${projectId}`
      } else {
        link = `/tenant_manage/project_manage/project_detail?name=${record.namespace
        }`
      }
      return (
        <Link to={link}>{record.item}</Link>
      )
    },
    width: 100,
  }, {
    title: '申请时间',
    dataIndex: 'approvalTime',
    width: 100,
  }, {
    title: '操作',
    dataIndex: 'detail',
    render: (text, record ) => {
      return (
        <div onClick={toggleApprovalModal.bind(null, record) }>
          {/* <TenxIcon type="circle-arrow-right-o" className="checkDetail"/> */}
          <Button type="primary" size="small"><span className="goApplay" >审批</span></Button>
        </div>
      )
    },
    width:100,
  }];
}
class TenantManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      member: 0,
      team: 0,
      project: 0,
      role: 0,
      user_supperAdmin: 0, //超级管理员
      user_platformAdmin: 0, //平台管理员
      user_infrastructureAdmin: 0, //基础设施管理员
      user_commonUser: 0,
      project_createByUser: 0,
      role_allCreated: 0,
      role_createdByUser: 0,
      role_defaultSet: 0,
      team_createdByUser: 0,
      dataRow: '',
      iconState: true,
      classindex: 0,
      showApprovalModal: false, // 显示审批弹出框
      operationNav: false, //显示操作引导弹窗
      personItem: {}, //当前个人项目以及个数
      publicItem: {}, //当前共享项目以及个数
      definitions: undefined, // 后台定义的资源类型
      globaleDevopsQuotaList: undefined, // devops
      allUsers: [], // 当前所有用户信息
      clusterApprovalData: [],
      clusterFetching: false,
      confirmPassModal: false, // 控制点击通过时候对话框的显示隐藏
      passContent: '',
    }
  }
  record = {}
  componentWillMount = () => {
    const { checkApplyRecord, loadUserList } = this.props
    this.loadInfosList()
    if (localStorage.getItem('state')) {
      this.setState({
        iconState: localStorage.getItem('state') == 'true' ? true : false
      })
    }
    // 先请求共享项目
    let query = { from: 0, size: 100, filter: 'project_type,public,status,0', sort:'d,create_time'  }
    checkApplyRecord(query, {
      success: {
        func: ({ data }) => {
          this.setState({ publicItem: formateProjectData(data)})
        },
        isAsync: true
      }
    })
    // 再请求个人项目
    query = { from: 0, size: 100, filter: 'project_type,person,status,0',  sort:'d,create_time'  }
    checkApplyRecord(query, {
      success: {
        func: ({ data }) => {
          this.setState({ personItem: formateProjectData(data)})
        },
        isAsync: true
      }
    })
    const newUserQuery = { size: 0 }
    loadUserList(newUserQuery, {
      success: {
        func: res => {
          this.setState({ allUsers: cloneDeep(res.users || []) })
        },
      },
    }) // 获取所有成员
    this.getClusterApprovalData()
  }
  getClusterApprovalData = () => {
    const { GetProjectsApprovalClustersWithoutTypes } = this.props
    this.setState({
      clusterFetching: true,
    }, () => {
      GetProjectsApprovalClustersWithoutTypes({
        filter: 'status__neq,2,status__neq,3',
        size: 10,
        from: 0,
        sort: 'd,tenx_project_resource_ref.request_time',
      }, {
        success: {
          func: res => {
            if (!!res && !!res.data && !!res.data.projects) {
              this.setState({
                clusterApprovalData: filter(res.data.projects, { status: 1 }),
              })
            } else {
              this.setState({
                clusterApprovalData: [],
              })
            }
          },
        },
        finally: {
          func: () => {
            this.setState({
              clusterFetching: false,
            })
          },
        },
      })
    })
  }
  // componentDidMount = () => {
  //   const { GetProjectsApprovalClusters } = this.props
  //   GetProjectsApprovalClusters()
  // }
  reload = () => {
    const { checkApplyRecord } = this.props
    // let query = { from: 0, size: 100, filter: 'status,0'  }
    // checkApplyRecord(query)
        // 先请求共享项目
        let query = { from: 0, size: 100, filter: 'project_type,public,status,0', sort:'d,create_time'  }
        checkApplyRecord(query, {
          success: {
            func: ({ data }) => {
              this.setState({ publicItem: formateProjectData(data)})
            },
            isAsync: true
          }
        })
        // 再请求个人项目
        query = { from: 0, size: 100, filter: 'project_type,person,status,0',  sort:'d,create_time'  }
        checkApplyRecord(query, {
          success: {
            func: ({ data }) => {
              this.setState({ personItem: formateProjectData(data)})
            },
            isAsync: true
          }
        })
  }
  loadInfosList() {
    const { fetchinfoList } = this.props
    fetchinfoList(null, {
      success: {
        func: res => {
          if (res.code === 200) {
            this.setState({
              member: res.data.user.total,
              team: res.data.team.total,
              project: res.data.project.total,
              role: res.data.role.total,
              user_supperAdmin: res.data.user.supperAdmin, //超级管理员
              user_platformAdmin: res.data.user.platformAdmin, //平台管理员
              user_infrastructureAdmin: res.data.user.infrastructureAdmin, //基础设施管理员
              user_commonUser: res.data.user.commonUser,
              project_createByUser: res.data.project.createByUser,
              role_allCreated: res.data.role.allCreated,
              role_createdByUser: res.data.role.createdByUser,
              role_defaultSet: res.data.role.defaultSet,
              team_createdByUser: res.data.team.createdByUser
            })
          }
        },
        isAsycn: true
      }
    })
  }

  handleOnLi(index) {
    let getS = [{ key: 'Menber' }, { key: 'Team' }, { key: 'Project' }, { key: 'Role' }]
    return localStorage.getItem(getS[index].key)
  }

  itemNav(index) {
    return index === this.state.classindex ? 'active' : '';
  }

  itemCon(index) {
    return index === this.state.classindex ? 'active' : '';
  }

  /**
   * 引导地址
   * @param {*} name
   */
  handleNav(e) {
    let id = e.currentTarget.getAttribute('data-index')
    switch (id) {
      case '0':
        localStorage.setItem('Menber', 'true')
        browserHistory.push('/tenant_manage/user')
        return
      case '1':
        localStorage.setItem('Team', 'true')
        browserHistory.push('tenant_manage/team')
        return
      case '2':
        localStorage.setItem('Project', 'true')
        browserHistory.push('tenant_manage/project_manage')
        return
      case '3':
        localStorage.setItem('Role', 'true')
        browserHistory.push('tenant_manage/rolemanagement')
        return
    }
  }

  /**
   * 引导
   */
  handleIco() {
    let is = this.state.iconState
    if (is) {
      this.setState({
        iconState: false
      })
      localStorage.setItem('state', false)
    } else {
      this.setState({
        iconState: true
      })
      localStorage.setItem('state', true)
    }
  }
  toggleApprovalModal = ( record, type, e ) => {
    const { showApprovalModal } = this.state
    const { checkResourcequotaDetail, getResourceDefinition, getDevopsGlobaleQuotaList, personNamespace } = this.props
    this.setState({ showApprovalModal: !showApprovalModal })
    if ( type !== 'success' ) {
      this.getDetailRecord(record)
      checkResourcequotaDetail(record.id)
      let newquery = { header: {}}
      if (record.applier === record.namespace) { // 如果是个人项目
        newquery.header.onbehalfuser = record.namespace
      } else {
        newquery.header.teamspace = record.namespace
      }
      getDevopsGlobaleQuotaList(newquery, {
        success: {
          func: res => {
            this.setState({
              globaleDevopsQuotaList: res.result,
            })
          },
          isAsync: true,
        },
      })
      getResourceDefinition({
        success: {
          func: ({data: resourceList}) => {
            this.setState({
              definitions: resourceList.definitions,
            })
          },
          isAsync: true,
        }
      })
    }
  }
  cancelApprovalModal = () => {
    this.setState({showApprovalModal: false  })
  }
  showOperationNav = () => {
    this.setState({
      operationNav: true
    })
  }
  closeOperationNav = () => {
      this.setState({
        operationNav: false
      })
  }
  renderModalFooter = () => <Button type="primary" onClick={this.closeOperationNav}>知道了</Button>
  getDetailRecord = record => {
    this.record = record
  }
  // 处理操作，row(点击所在的行数据) e(事件对象)
  handleOption(row, e, text) {
    // const text = e.target.innerText
    let wannaStatus = 0
    switch (text) {
      case '通过':
        wannaStatus = 2
        break
      case '拒绝':
        wannaStatus = 3
        break
      default:
        return null
    }
    const updateClusterData = {
      clusterInfo: [
        {
          project: row.projectId,
          clusters: {
            [row.resourceID]: wannaStatus,
          },
        },
      ],
    }

    this.props.UpdateProjectsApprovalCluster(updateClusterData, {
      success: {
        func: () => {
          notification.success(text.replace(/\s/g, '') + '成功')
          this.getClusterApprovalData()
          if (text === '通过') {
            this.setState({
              confirmPassModal: true,
              passContent: Object.assign({}, row),
            })
          }
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          notification.warn(text + '失败')
        },
        isAsync: true,
      },
    })

  }
  // 根据状态渲染哪一组操作按钮 status(状态)
  buttonGroup(row) {
    const btns = (leftType, rightType, leftText, rightText, leftClass, rightClass) => {
      return <div className="authorization-operation">
        <Button type={leftType} style={{ marginRight: 10 }}
          className={`${leftClass}`}
          onClick={e => { this.handleOption(row, e, leftText) }}
        >
          { leftText }
        </Button>
        <Button type={rightType}
          className={`${rightClass}`}
          onClick={e => { this.handleOption(row, e, rightText) }}>
          { rightText }
        </Button>
      </div>
    }
    switch (row.status) {
      case 1:
        return btns('primary', 'default', '通过', '拒绝', 'pass-btn', 'reject-btn')
      default:
        return null
    }
  }
  // 确认通过审批
  handlePass = () => {
    this.setState({
      confirmPassModal: false,
    }, () => {
      browserHistory.push(`/tenant_manage/project_manage/project_detail?name=${this.state.passContent.projectName}&&tabs=quota`)
    })
  }
  handleCancel = () => {
    this.setState({
      confirmPassModal: false,
    })
  }
  render() {
    const ListLi = [{
      id: 1,
      text: '创建新成员',
      itemName: '创建新成员',
      item: '成员是指公司内外共同协作管理和使用平台的人，每个成员创建后都会有一个个的项目，可在项目中创建个人的资源'
    }, {
      id: 2,
      text: '创建团队并添加成员',
      itemName: '创建团队',
      item: '团队，由若干个成员组成的一个集体，可等效于公司的部门、小组、或子公司，以实现可将一批人统一管理，统一加到某个项目中并授予角色'
    }, {
      id: 3,
      text: '创建角色',
      itemName: '创建角色',
      item: '角色是指一组权限的集合，您可以创建一个有若干权限的角色，在某项目中添加角色并为该角色关联对象（成员或团队）'
    }, {
      id: 4,
      text: '创建项目',
      itemName: '创建项目',
      item: '项目之间是项目隔离的，通过创建项目实现按照角色关联对象（成员、团队），并根据授予的权限，使用项目中资源及功能'
    }]
    const { user_supperAdmin, user_platformAdmin, user_infrastructureAdmin, user_commonUser,
      project_createByUser, role_allCreated, role_createdByUser, clusterApprovalData, clusterFetching,
      role_defaultSet, team_createdByUser, showApprovalModal, personItem, publicItem, definitions,
      globaleDevopsQuotaList, allUsers, confirmPassModal, passContent } = this.state
    // let u_supperUser = user_supperUser, u_commonUser = user_commonUser
    let p_createByUser = project_createByUser
    let r_allCreated = role_allCreated, r_createdByUser = role_createdByUser, r_defaultSet = role_defaultSet
    let t_createdByUser = team_createdByUser
    const toggleApprovalModal = this.toggleApprovalModal

    const { tabisFetching, personTabData, shareTabDate, tabDataLength, resourceInuse } = this.props
    const global = { ...(resourceInuse && resourceInuse.global), ...globaleDevopsQuotaList }
    if (!_.isEmpty(resourceInuse)) {
      resourceInuse.global = global
    }
    resourceInuse.global = { ...resourceInuse.global, ...globaleDevopsQuotaList }
    let memberOption = {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '55%',
        top: 'middle',
        data: [{ name: '系统管理员' }, { name: '基础设施管理员' }, { name: '平台管理员' }, { name: '普通成员' }],
        formatter: function (name) {
          if (name === '系统管理员') {
            return name + ' ' + user_supperAdmin + ' 个'
          } else if (name === '基础设施管理员') {
            return name + ' ' + user_infrastructureAdmin + ' 个'
          } else if (name === '平台管理员') {
            return name + ' ' + user_platformAdmin + ' 个'
          } else if (name === '普通成员') {
            return name + ' ' + user_commonUser + ' 个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#2db7f5', '#2abe84', '#B0E2FF', '#7ce4bb'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['60', '0'],
        center: ['30%', '48%'],
        data: [
          { value: user_supperAdmin, name: '系统管理员' },
          { value: user_infrastructureAdmin, name: '基础设施管理员' },
          { value: user_platformAdmin, name: '平台管理员' },
          { value: user_commonUser, name: '普通成员', selected: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: false,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let teamOption = {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '55%',
        top: 'middle',
        data: ['我创建', '其他'],
        formatter: name => {
          if (name === '我创建') {
            return name + ' ' + t_createdByUser + ' 个'
          }
          return '其他 ' + (this.state.team - Number(t_createdByUser)) + ' 个'

        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#2db7f5', '#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['60', '0'],
        center: ['30%', '48%'],
        data: [
          { value: t_createdByUser, name: '我创建' },
          { value: this.state.team - Number(t_createdByUser), name: '其他' },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: false,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';//param.percent.toFixed(0)
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let projectOption = {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '55%',
        top: 'middle',
        data: ['我创建', '其他'],
        formatter: name => {
          if (name === '我创建') {
            return name + ' ' + p_createByUser + '个'
          }
          return '其他 ' + (this.state.project - Number(p_createByUser)) + '个'
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#2db7f5', '#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['60', '0'],
        center: ['30%', '48%'],
        data: [
          { value: p_createByUser, name: '我创建' },
          { value: this.state.project - Number(p_createByUser), name: '其他' },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            show: false,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let roleOption = {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: "{b} : {c}({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: '55%',
        top: 'middle',
        data: [{ name: '系统默认' }, { name: '共创建' }, { name: '我创建' }],
        formatter: function (name) {
          if (name === '系统默认') {
            return name + ' ' + r_defaultSet + ' 个'
          } else if (name === '共创建') {
            return name + ' ' + r_allCreated + ' 个'
          } else if (name === '我创建') {
            return name + ' ' + r_createdByUser + ' 个'
          }
        },
        textStyle: {
          fontSize: 13,
          color: '#666'
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#2db7f5', '#2abe84', '#B0E2FF'],
      series: {
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 0,
        radius: ['60', '0'],
        center: ['30%', '48%'],
        data: [
          { value: r_defaultSet, name: '系统默认' },
          { value: r_allCreated, name: '共创建' },
          { value: r_createdByUser, name: '我创建', selected: true },
        ],
        label: {
          normal: {
            position: 'center',
            show: false,
          },
          emphasis: {
            // formatter: '{b}:{c}<br/>({d}%)',
            show: false,
            position: 'center',
            formatter: function (param) {
              return param.percent.toFixed(0) + '%';
            },
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
      },
    }
    let images = [
      { src: require('../../assets/img/tenantManage/tenatDetail.png') },
      { src: require('../../assets/img/tenantManage/guide.png') },
    ]
    const btnStyle = {
      visibility: this.state.iconState ? 'inherit' : 'hidden',
      marginTop: -5
    }
    const itemStyle = {
      visibility: this.state.iconState ? 'hidden' : 'inherit'
    }
    const waitTotal = personItem.total + publicItem.total
    const clusterApprovalColumns = [
      {
        title: '申请人',
        dataIndex: 'applicant',
        width: '15%',
      },
      {
        title: '申请项目',
        dataIndex: 'projectName',
        width: '15%',
        render: val => <div
          style={{ color: '#59c2f9', cursor: 'pointer' }}
          onClick={() => { browserHistory.push(`/tenant_manage/project_manage/project_detail?name=${val}`) } }
        >{val}</div>,
      },
      {
        title: '申请集群',
        dataIndex: 'clusterName',
        width: '15%',
      },
      {
        title: '申请时间',
        dataIndex: 'requestTime',
        width: '15%',
        render: time => <div>{calcuDate(time)}</div>,
        sorter: true,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '40%',
        render: (col, row) => {
          return this.buttonGroup(row)
        },
      },
    ]
    return (
      <QueueAnim>
        <div id="tenantManage" key='tenantManage'>
          <Title title="概览" />
          <Row className="title">
            控制权限概览
            <Button style={btnStyle} className="bGuide" onClick={this.showOperationNav}><img src={images[1].src} />操作引导</Button>
          </Row>
          <div className="alertRow">
            <span style={{ fontSize: 14 }}>租户管理满足细粒度的权限控制需求，帮助企业做好权限分配和管理，同时处理好授权方面的一些难题。按需为用户分配最小权限，从而降低企业的信息安全风险。</span>
          </div>
          <Row gutter={24}>
            {/* <Col span={16}>
              <Row className="content" gutter={16} > */}
            <Col span={8}>
              <div style={{ marginBottom: '16px'}}>
                <Card title="成员" extra={<div><span>共</span><span style={{ color: '#2db7f5' }}> {this.state.member} </span><span>个</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px', }}>
                  <ReactEcharts
                    notMerge={true}
                    option={memberOption}
                    style={{ height: '180px' }}
                  />
                </Card>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: '16px'}}>
                <Card title="团队" extra={<div><span>共</span><span style={{ color: '#2db7f5' }}> {this.state.team} </span><span>个</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px', }}>
                  <ReactEcharts
                    notMerge={true}
                    option={teamOption}
                    style={{ height: '180px' }}
                  />
                </Card>
              </div>
            </Col>
            <Col span={8}>
              <Card title="项目" extra={<div><span>共</span><span style={{ color: '#2db7f5' }}> {this.state.project} </span><span>个</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
                <ReactEcharts
                  notMerge={true}
                  option={projectOption}
                  style={{ height: '180px' }}
                />
              </Card>
            </Col>
            {/* <Col span={12}>
              <Card title="角色" extra={<div><span>共</span><span>{this.state.role}</span><span>个</span></div>} bordered={false} bodyStyle={{ height: 180, padding: '0px' }}>
                <ReactEcharts
                  notMerge={true}
                  option={roleOption}
                  style={{ height: '180px' }}
                />
              </Card>
            </Col> */}
              {/* </Row>
            </Col> */}
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Card
                title={<span style={{ color: '#666'}}>
                  <span>资源配额申请概览  (待处理)</span>
                  <span>&nbsp;&nbsp;&nbsp;共 <span style={{ color: '#2db7f5' }}>{isNaN(waitTotal) ? '' : waitTotal}</span> 个</span>
                </span>}
                // extra={<span>共 <span style={{ color: '#2db7f5' }}>{isNaN(waitTotal) ? '' : waitTotal}</span> 个</span>}
                extra={<Link to="/tenant_manage/approvalLimit">审批记录>></Link>}
                bordered={false}
                bodyStyle={{ height: 180, padding: '0px' }}
              >
                <Row>
                  <Col span={24} className="shareProject">
                    <Table columns={getColumns({ toggleApprovalModal, allUsers })} dataSource={[].concat(publicItem.tabDataIndex || [], personItem.tabDataIndex || [])} size="middle" pagination={false}
                      loading={tabisFetching} scroll={{ y: 360 }} />
                      {/* <div className="shareProjectFooter"><Link to="/tenant_manage/approvalLimit">审批记录>></Link></div> */}
                  </Col>
                </Row>
                <ApprovalOperation title="资源配额审批" visible={showApprovalModal} toggleVisable={toggleApprovalModal}
                  record={this.record} reload={this.reload} resourceDefinitions={definitions}
                  resourceInuseProps={resourceInuse} globaleDevopsQuotaList={globaleDevopsQuotaList}
                  cancelApprovalModal = {this.cancelApprovalModal}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={
                  <span style={{ color: '#666'}}>
                    <span>集群授权申请概览  (待处理)</span>
                    <span>&nbsp;&nbsp;&nbsp;共 <span style={{ color: '#2db7f5' }}>{clusterApprovalData.length}</span> 个</span>
                  </span>
                }
                extra={<Link to="/tenant_manage/cluster_authorization">审批记录>></Link>}
                bordered={false}
                bodyStyle={{ height: 180, padding: '0px' }}
              >
                <Row>
                  <Col span={24} className="shareProject">
                    <Table
                      columns={clusterApprovalColumns}
                      dataSource={clusterApprovalData}
                      size="middle"
                      pagination={false}
                      loading={clusterFetching}
                      scroll={{ y: 360 }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Modal
            title="操作引导"
            visible={this.state.operationNav}
            onOk={this.closeOperationNav}
            onCancel={this.closeOperationNav}
            wrapClassName="operationModal"
            footer={this.renderModalFooter()}
          >
            <div className="content">
              <div className="infos">
                <div className="tagItems" id="tagItems">
                  <div className="tagImg">
                    <img src={images[0].src} />
                  </div>
                  <div className="tagDesc">
                    <div className="tagInfo">
                      <TenxIcon type="user" size={14}/> &nbsp;
                      <span>成员：平台上的成员</span>
                    </div>
                    <div className="tagInfo">
                      <TenxIcon type="team" size={14}/> &nbsp;
                      <span>团队：由n个成员组成</span>
                    </div>
                    <div className="tagInfo">
                      <TenxIcon type="authority" size={14}/> &nbsp;
                      <span>权限：平台上每个功能模块权限的细粒度划分</span>
                    </div>
                    <div className="tagInfo">
                      <div className="role"></div>
                      <span>角色：在项目中添加，由n个权限组成</span>
                    </div>
                    <div className="tagInfo">
                      <div className="project"></div>
                      <span>项目：实现哪些人在项目中可以使用哪些资源的权限</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
          {
            confirmPassModal ?
              <Modal
                title="通过审批"
                visible={confirmPassModal}
                onOk={this.handlePass}
                onCancel={this.handleCancel}
                okText="设置资源配额"
              >
                <div className="confirm-pass-box">
                  <div className="broadcast">
                    <div className="confirm-icon">
                      <Icon type="check-circle-o"/>
                    </div>
                    <div className="confirm-text">
                      <div>通过审批操作成功</div>
                      <div>可前往项目详情设置项目在该集群的资源配额</div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <td>申请项目</td>
                          <td>申请集群</td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{this.state.passContent.projectName}</td>
                          <td>{this.state.passContent.clusterName}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Modal>
              :
              null
          }
        </div>
      </QueueAnim>
    )
  }
}
// 整理返回的数据,将未审批的用户, 分为个人用户和共享项目
// const formateTabData = ({ tabData }) => {
//   const personTabData = []
//   const shareTabDate = []
//   let tabDataIndex = personTabData
//   console.log('tabData', tabData)
//   console.log('UserNameSpace', UserNameSpace)
//   for ( const o of tabData ) {
//     if ( o.applier === UserNameSpace ) {
//       tabDataIndex = personTabData
//     } else {
//       tabDataIndex = shareTabDate
//     }
//     tabDataIndex.push({
//       item: o.displayName,
//       approvalTime: calcuDate(o.createTime),
//       id: o.id,
//     })
//   }
//   const tabDataLength = tabData.length
//   return { tabDataLength, personTabData, shareTabDate }
// }

// 整理个人项目和共享项目数据结构
const formateProjectData = ({ records, total }) => {
  const tabDataIndex = []
  for ( const o of records ) {
    tabDataIndex.push({
      item: o.displayName,
      approvalTime: calcuDate(o.createTime),
      id: o.id,
      namespace: o.namespace,
      applier: o.applier
    })
  }
  return { tabDataIndex, total }
}

function mapStateToProps(state, props) {
  const tabData = getDeepValue(state, [ 'applyLimit', 'resourcequoteRecord', 'data' ]) || []
  const isFetching = getDeepValue(state, [ 'applyLimit', 'resourcequoteRecord', 'isFetching' ])
  const UserNameSpace = getDeepValue(state, [ 'entities', 'loginUser', 'info', 'namespace' ])
  // const {tabDataLength, personTabData, shareTabDate} = formateTabData({  tabData, UserNameSpace  })
  const detailData = getDeepValue(state, [ 'applyLimit', 'resourcequotaDetail' ])
  const personNamespace = state.entities.loginUser.info.namespace
  const { data: recordData = {} } = detailData
  const { resourceInuse = {} } = recordData
  return { tabisFetching: isFetching, personNamespace, resourceInuse}
}

export default connect(mapStateToProps, {
  fetchinfoList, checkApplyRecord, checkResourcequotaDetail, getResourceDefinition, getDevopsGlobaleQuotaList,
  loadUserList: userActions.loadUserList,
  GetProjectsApprovalClusters: projectActions.GetProjectsApprovalClusters,
  searchProjectsClusterApproval: projectActions.searchProjectsClusterApproval,
  UpdateProjectsApprovalCluster: projectActions.UpdateProjectsApprovalCluster,
  GetProjectsApprovalClustersWithoutTypes,
})(TenantManage)
