/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Project Detail
 *
 * v0.1 - 2017-06-06
 * @author zhangxuan
 */

import React, { Component } from 'react'
import classNames from 'classnames';
import './style/ProjectDetail.less'
import {
  Row, Col, Button, Input, Table, Collapse, Card, Icon, Modal, Checkbox, Tooltip,
  Transfer, InputNumber, Tree, Alert, Form, Tabs, Popover, Select, Dropdown, Menu, Spin, Switch
 } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { browserHistory, Link } from 'react-router'
import { connect } from 'react-redux'
import { GetProjectsDetail, UpdateProjects, GetProjectsAllClusters, UpdateProjectsCluster, CheckDisplayName,
  UpdateProjectsRelatedRoles, DeleteProjectsRelatedRoles, GetProjectsMembers, getPluginStatus } from '../../../../actions/project'
import { chargeProject } from '../../../../actions/charge'
import { loadNotifyRule, setNotifyRule } from '../../../../actions/consumption'
import { ListAllRole, CreateRole, ExistenceRole, GetRole, roleWithMembers, usersAddRoles, usersLoseRoles } from '../../../../actions/role'
import { permissionOverview, PermissionResource } from '../../../../actions/permission'
import { parseAmount } from '../../../../common/tools'
import Notification from '../../../../components/Notification'
import TreeComponent from '../../../TreeForMembers'
import intersection from 'lodash/intersection'
import xor from 'lodash/xor'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'
import CreateRoleModal from '../CreateRole'
import RoleEditModal from './RoleEdit'
import {
  PROJECT_VISISTOR_ROLE_ID,
  PROJECT_MANAGE_ROLE_ID,
  ROLE_SYS_ADMIN,
  ROLE_PLATFORM_ADMIN
} from '../../../../../constants'
import ResourceQuota from '../../../ResourceLimit'
import { formatDate } from '../../../../common/tools'
import { getGlobaleQuota, getGlobaleQuotaList, getClusterQuota } from '../../../../actions/quota'
import { loadClusterList } from '../../../../actions/cluster'
import {ASYNC_VALIDATOR_TIMEOUT, REG} from '../../../../constants'
import ResourceModal from './ResourceModal'
import PermissionOverview from './PermissionOverview'
import ServiceMeshForm from './ServiceMeshForm';
import ServiceMeshSwitch from './ServiceMeshSwitch';
import * as SEMeshActions from '../../../../actions/serviceMesh'
import DubboSwitch from './DubboSwitch/DubboSwitch'
import TenxIcon from '@tenx-ui/icon/es/_old'
import ContainerSecurityPolicy from './ContainerSecurityPolicy'


let checkedKeysDetail = []
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const Option = Select.Option;

class ProjectDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editComment: false,
      editDisplayName: false,
      paySingle: false,
      switchState: false,
      balanceWarning: false,
      addCharacterModal: false,
      mockData: [],
      targetKeys: [],
      characterModal: false,
      payNumber: 10,
      projectDetail: {},
      UnRequest: 0,
      comment: '',
      displayName: '',
      currentRoleInfo: {},
      currentRolePermission: [],
      choosableList: [],
      createRoleName: '',
      createRoleDesc: '',
      createRolePer: [],
      currentMembers: [],
      allMembers: [],
      memberCount: 0,
      connectModal: false,
      memberArr: [],
      existentMember: [],
      selectedMembers: [],
      selectedKeys: [],
      deleteRoleModal: false,
      currentDeleteRole: {},
      deleteClusterModal: false,
      totalMemberCount: 0,
      roleMember: 0,
      memberType: 'user',
      filterFlag: true,
      quotaData: [],
      quotauseData: [],
      filterLoading: false,
      popoverVisible: false,
      tabsKey: '',
      currpermissionPolicyType: 1,
      isShowperallEditModal: false,
      currPRO: [],//permission/resource-operations
      currResourceType: "",
      isShowResourceModal: false,
      selectedCluster: "",
      isChangeCluster: false,
      projectLoading: true,
      initialList: ['all', 'a~d', 'e~h', 'i~l', 'm~p', 'q~t', 'u~x', 'y~z'],
      currentMemberFilter: 'all',
      letterArr: [],
    }
  }
  componentDidMount() {
    const { loadClusterList, getPluginStatus, clusterID } = this.props
    this.getProjectDetail()
    this.getClustersWithStatus();
    // this.getProjectMember();
    // this.loadRoleList()
    const key = this.props.location.query
    this.setState({
      tabsKey: key.tabs
    })

    loadClusterList()

  }
  componentWillUnmount() {
    // 用户可能在项目详情页做了一些项目以及集群相关的操作，退出页面时应该重新选择下当前项目及集群
    window._reselect_current_project_cluster && window._reselect_current_project_cluster()
  }
  getClustersWithStatus() {
    const { name } = this.props.location.query;
    const { GetProjectsAllClusters } = this.props;
    GetProjectsAllClusters({
      projectsName: name
    },{
      success: {
        func: (res) => {
          const cluster0 = !!_.filter(res.data.clusters, {status: 2}) && _.filter(res.data.clusters, {status: 2})[0] || {};
          this.setState({
            selectedCluster: cluster0.clusterID
          })
        }
      }
    })
  }
  loadRoleList(roleId) {
    const { ListAllRole } = this.props;
    const { projectDetail } = this.state;
    const targetKeys = [];
    const roleList = [];
    ListAllRole({
      size: -1
    }, {
        success: {
          func: (res) => {
            if (res.data.statusCode === 200) {
              let result = res.data.data;
              let relatedRoles = projectDetail.relatedRoles;
              for (let i = 0; i < result.length; i++) {
                let flag = false;
                if (relatedRoles && relatedRoles.length > 0) {
                  for (let j = 0; j < relatedRoles.length; j++) {
                    if (result[i].id === relatedRoles[j].roleId) {
                      flag = true;
                    }
                  }
                }
                const data = {
                  key: `${result[i].id},${result[i].name}`,
                  title: result[i].name,
                  description: result[i].name,
                  chosen: flag,
                };
                const newData = Object.assign({}, result[i], data);
                if (newData.chosen) {
                  targetKeys.push(data.key);
                }
                roleList.push(newData)
              }
              //currentRoleInfo
              let tempState = {
                choosableList: roleList,
                targetKeys
              };
              if(!!roleId){
                const currRoleInfo = _.filter(roleList, {id: roleId})[0];
                tempState.currentRoleInfo = currRoleInfo;
              }
              this.setState(tempState);
            }
          },
          isAsync: true
        }
      })
  }
  getProjectDetail() {
    const { name } = this.props.location.query;
    const { GetProjectsDetail } = this.props;
    const { currentRoleInfo } = this.state;
    GetProjectsDetail({
      projectsName: name
    }, {
        success: {
          func: (res) => {
            if (res.statusCode === 200) {
              if (!isEmpty(currentRoleInfo)) {
                this.getCurrentRole(currentRoleInfo.id)
              } else {
                this.setState({
                  currentRolePermission: [],
                  currentRoleInfo: {}
                })
              }
              this.setState({
                projectDetail: res.data,
                comment: res.data.description,
                projectLoading: false,
              }, () => {
                const { projectDetail } = this.state;
                this.loadRoleList()
                this.getCurrentRole(projectDetail.relatedRoles && projectDetail.relatedRoles[0].roleId)
              })
            }
            let roleIdArr = []
            let roleNameArr = []
            res.data.outlineRoles.forEach(item => {
              if (item.indexOf('RID-') !== -1) {
                roleIdArr.push(item)
              }
            })
            const { relatedRoles } = res.data
            roleIdArr.length && relatedRoles && relatedRoles.length && relatedRoles.forEach(item => {
              if (roleIdArr.includes(item.roleId)) {
                roleNameArr.push(item.roleName)
              }
            })
            this.setState({
              roleNameArr,
              projectDetail: res.data,
              comment: res.data.description,
              displayName: res.data.displayName,
              isManager: res.data.outlineRoles.includes('manager')
            }, () => {
              const { projectDetail } = this.state;
              this.loadRoleList()
              this.getCurrentRole(projectDetail.relatedRoles && projectDetail.relatedRoles[0].roleId)
            })
          },
          isAsync: true
        }
      })
  }
  filterOption(inputValue, option) {
    return option.description.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys) {
    let roleIdArr = []
    let notify = new Notification()
    targetKeys.forEach(item => roleIdArr.push(item.split(',')[0]))
    if (!roleIdArr.includes(PROJECT_MANAGE_ROLE_ID) || !roleIdArr.includes(PROJECT_VISISTOR_ROLE_ID)) {
      notify.info('项目管理员和项目访客不允许移出')
      return
    }
    this.setState({ targetKeys });
  }
  editComment() {
    this.setState({ editComment: true })
  }
  editDisplayName() {
    this.setState({ editDisplayName: true })
  }
  cancelEdit() {
    const { setFieldsValue } = this.props.form
    const { projectDetail } = this.state;
    let oldComment = projectDetail.description;
    this.setState({ editComment: false }, () => {
      setFieldsValue({ 'comment': oldComment })
    })
  }
  cancelDisplayNameEdit() {
    const { setFieldsValue } = this.props.form
    const { projectDetail } = this.state;
    this.setState({ editDisplayName: false }, () => {
      setFieldsValue({ displayName: projectDetail.displayName })
    })
  }
  saveComment() {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const { name } = this.props.location.query;
    const { UpdateProjects, GetProjectsDetail } = this.props;
    const { projectDetail } = this.state;
    let notify = new Notification()
    let comment = getFieldValue('comment');
    let oldComment = projectDetail.description;
    if (!comment || (comment === oldComment)) { return this.setState({ editComment: false }) }
    UpdateProjects({
      projectName: projectDetail.projectName,
      body: {
        description: comment
      }
    }, {
        success: {
          func: (res) => {
            if (res.statusCode === 200) {
              notify.success('修改备注成功')
              GetProjectsDetail({
                projectsName: name
              }, {
                  success: {
                    func: res => {
                      this.setState({
                        projectDetail: res.data,
                        comment: res.data.description,
                        editComment: false
                      })
                    },
                    isAsync: true
                  }
                })
            }
          },
          isAsync: true
        }
      })
  }
  saveDisplayName() {
    const { getFieldValue, getFieldError } = this.props.form;
    const { projectDetail } = this.state;
    let comment = getFieldValue('displayName');
    let oldComment = projectDetail.displayName;
    if (!comment) { return this.setState({ editDisplayName: false }) }
    if (getFieldError('displayName') || (comment === oldComment)) return
    this.props.CheckDisplayName({
      displayName: comment
    },{
      success: {
        func: res => {
          if (res.data === false) {
            this.updateProjects({
              projectName: projectDetail.projectName,
              body: {
                displayName: comment
              }
            })
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {},
        isAsync: true
      }
    })

  }
  updateProjects = (fetchBody) => {
    const { GetProjectsDetail, UpdateProjects } = this.props
    const { name } = this.props.location.query;
    let notify = new Notification()
    UpdateProjects(fetchBody, {
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            notify.success('修改项目名称成功')
            GetProjectsDetail({
              projectsName: name
            }, {
              success: {
                func: res => {
                  this.setState({
                    projectDetail: res.data,
                    displayName: res.data.displayName,
                    editDisplayName: false
                  })
                },
                isAsync: true
              }
            })
          }
        },
        isAsync: true
      }
    })
  }
  paySingle() {
    this.setState({ paySingle: true })
  }
  paySingleCancel() {
    this.setState({ paySingle: false })
  }
  paySingleOk() {
    const { chargeProject } = this.props;
    const { projectDetail, payNumber } = this.state;
    let notify = new Notification()
    chargeProject({
      namespaces: [projectDetail.projectName],
      amount: payNumber
    }, {
        success: {
          func: (res) => {
            if (res.statusCode === 200) {
              this.getProjectDetail()
              this.setState({ paySingle: false })
              notify.success('充值成功')
            }
          },
          isAsync: true
        }
      })
  }
  switchChange(checked) {
    this.setState({ switchState: checked })
  }
  warningCancel() {
    this.setState({ balanceWarning: false })
  }
  warningSubmit() {
    this.setState({ balanceWarning: false })
  }
  onExpand = (expandedKeys) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck = (checkedKeys) => {
    this.setState({
      checkedKeys,
    });
  }
  onSelect = (selectedKeys, info) => {
    this.setState({ selectedKeys });
  }
  addCharacterOk(roleid) {
    const { UpdateProjectsRelatedRoles } = this.props;
    const { projectDetail, targetKeys } = this.state;
    let notify = new Notification()
    let updateRoles = []
    for (let i = 0; i < targetKeys.length; i++) {
      let key = targetKeys[i].split(',')[0]
      updateRoles.push(key)
    }
    //roleid 添加角色时 返回role id 直接关联到已添加角色
    !!roleid && updateRoles.push(roleid);
    UpdateProjectsRelatedRoles({
      projectsName: projectDetail.projectName,
      body: {
        roles: updateRoles
      }
    }, {
        success: {
          func: (res) => {
            if (res.statusCode === 200) {
              this.getProjectDetail()
              notify.success('操作成功')
              this.setState({ addCharacterModal: false, targetKeys: [] })
            }
          },
          isAsync: true
        }
      })
  }
  addCharacterCancel() {
    this.setState({ addCharacterModal: false })
  }
  changePayNumber(payNumber) {
    this.setState({ payNumber })
  }
  clusterStatus(status, flag) {
    return (
      <span className={`projectDetailClusterStatus projectDetailClusterStatus${status}`}>
        {status === 1 ? flag ? '（申请中...）' : '申请中...' : ''}
        {status === 2 ? flag ? '（已授权）' : '已授权' : ''}
        {status === 3 ? flag ? '（已拒绝）' : '已拒绝' : ''}
      </span>
    )
  }
  updateProjectClusters(id, status) {
    const { UpdateProjectsCluster } = this.props;
    const { name } = this.props.location.query;
    UpdateProjectsCluster({
      projectsName: name,
      body: {
        clusters: {
          [id]: status
        }
      }
    }, {
        success: {
          func: (res) => {
            if (res.statusCode === 200) {
              this.getClustersWithStatus()
            }
          },
          isAsync: true
        }
      })
  }
  generateDatas(_tns) {
    if (!_tns) return
    const tns = _tns;
    const children = [];
    for (let i = 0; i < tns.length; i++) {
      const key = `${tns[i].id}`;
      tns[i] = Object.assign(tns[i], { title: tns[i].desc, key: `${key}` })
      children.push(key);
      checkedKeysDetail.push(key)
    }
    children.forEach((key, index) => {
      if (tns[index]['children'] !== undefined) {
        return this.generateDatas(tns[index].children);
      }
    });
  }
  getPermissionOverview = () => {
    const { permissionOverview, location } = this.props
    const { currentRoleInfo, selectedCluster } = this.state
    permissionOverview({

      roleId: currentRoleInfo.id,
      clusterId: selectedCluster,
      headers: {
        project: location.query.name
      }
    })
  }
  getPermissionResource = () => {
    const { PermissionResource, currentRoleInfo, location } = this.props
    const headers = { project: location.query.name }
    PermissionResource(headers, {
      success: {
        func: res => {
          this.setState({
            currPRO: res.data
          })
        },
      },
      failed: {
        func: res => {
          this.setState({
            currPRO: []
          })
        },
      },
    })
  }
  getCurrentRole(id, type) {
    if (!id) return
    const { GetRole, roleWithMembers, PermissionResource } = this.props;
    const { projectDetail, selectedCluster, currentRoleInfo } = this.state;
    checkedKeysDetail.length = 0;
    let permissionPolicyType = 1;
    this.setState({
      checkedKeys: [],
      expandedKeys: [],
      //currentRoleInfo: {},
      currentRolePermission: [],
      currentMembers: [],
      allMembers: [],
      getRoleLoading: true
    }, () => {
      GetRole({
        roleId: type === "click" ? id : !!currentRoleInfo && JSON.stringify(currentRoleInfo) !== "{}" ? currentRoleInfo.id : id
      }, {
          success: {
            func: (res) => {
              if (res.data.statusCode === 200) {
                let result = res.data.data;
                this.generateDatas(result.permissions)
                permissionPolicyType = result.permissionPolicyType
                this.setState({
                  currentRoleInfo: result,
                  currentRolePermission: result.permissions,
                  expandedKeys: checkedKeysDetail,
                  checkedKeys: checkedKeysDetail,
                  currpermissionPolicyType: permissionPolicyType,
                }, () => {
                  if(permissionPolicyType === 2){
                    this.getPermissionResource()
                    this.getPermissionOverview()
                  }
                })
              }
            },
            isAsync: true
          }
        })
      roleWithMembers({
        roleID: type === "click" ? id : !!currentRoleInfo && JSON.stringify(currentRoleInfo) !== "{}" ? currentRoleInfo.id : id,
        scope: 'project',
        scopeID: `${projectDetail.pid}`
      }, {
          success: {
            func: res => {
              let member = []
              let exist = []
              if (res.data.data && res.data.data.length > 0) {
                res.data.data.forEach(item => {
                  exist.push(item.userId)
                })
                member = res.data.data.slice(0)
              }
              this.formatArr(member)
              this.setState({
                currentMembers: member,
                allMembers: member,
                currentMemberFilter: 'all',
                existentMember: exist,
                memberCount: member.length > 0 ? member.length : 0,
                getRoleLoading: false
              }, () => this.setState({
                letterArr: this.generateLetterArr(),
              }))
            },
            isAsync: true
          },
          failed: {
            func: res => {
              this.setState({
                currentMembers: [],
                allMembers: [],
                existentMember: [],
                memberCount: 0,
                getRoleLoading: false
              })
            },
            isAsync: true
          }
        });
      })
  }
  getProjectMember(type, name, flag) {
    const { GetProjectsMembers } = this.props;
    const { projectDetail } = this.state
    let query = { type, pid: projectDetail.pid }
    if (name) {
      query = Object.assign(query, { filter: `name,${name}` })
    }
    return new Promise((resolve) => {
      GetProjectsMembers(query, {
        success: {
          func: (res) => {
            if (res.statusCode === 200) {
              let newArr = res.data.iteams || []
              this.formatMember(newArr)
              this.setState({
                memberArr: newArr,
                filterFlag: flag,
                totalMemberCount: res.data.listMeta.total,
                connectModal: true,
                memberType: type,
              })
            }
            resolve()
          },
          isAsync: true
        }
      })
    })
  }
  formatMember(arr) {
    arr.forEach(item => {
      if (item.teamId) {
        Object.assign(item, { id: item.teamId }, { children: item.users.map(record => { return Object.assign(record, { parent: item.teamId }) }) })
        this.formatMember(item.users)
      } else {
        Object.assign(item, { id: item.userID ? item.userID : item.userId })
      }
    })
  }
  formatArr(arr) {
    arr.forEach(item => {
      Object.assign(item, { key: item.userId }, { name: item.userName })
    })
  }
  renderItem(item) {
    return (
      <Row key={item && item.key}>
        <Col span={20}>{item && item.name}</Col>
        {/*<Col span={4}>{item&&item.count}</Col>*/}
      </Row>
    )
  }
  openCreateModal() {
    this.setState({
      characterModal: true
    })
  }
  deleteRole(e, item) {
    e.stopPropagation()
    this.setState({
      currentDeleteRole: item
    }, () => {
      this.setState({
        deleteRoleModal: true
      })
    })
  }
  cancelDeleteRole() {
    this.setState({
      deleteRoleModal: false
    })
  }
  confirmDeleteRole() {
    const { DeleteProjectsRelatedRoles } = this.props;
    const { projectDetail, currentDeleteRole, currentRoleInfo } = this.state;
    let deleteArr = []
    let notify = new Notification()
    deleteArr.push(currentDeleteRole.roleId)
    DeleteProjectsRelatedRoles({
      projectsName: projectDetail.projectName,
      body: {
        Roles: deleteArr
      }
    }, {
        success: {
          func: () => {
            this.setState({
              deleteRoleModal: false,
              currentRoleInfo: currentRoleInfo.id === currentDeleteRole.roleId ? {} : currentRoleInfo
            }, () => {
              this.getProjectDetail()
              notify.success('删除角色成功')
            })
          },
          isAsync: true
        },
        failed: {
          func: () => {
            if(err.statusCode === 403){
              notify.warn(`删除角色失败, 用户没有权限`)
            }
            else{
              notify.warn(`删除角色失败`)
            }
            this.setState({
              deleteRoleModal: false
            })
          },
          isAsync: true
        }
      })
  }
  closeMemberModal() {
    this.setState({
      connectModal: false,
      memberType: 'user'
    })
  }
  submitMemberModal() {
    const { selectedMembers, existentMember, currentRoleInfo } = this.state;
    let notify = new Notification()
    if (currentRoleInfo.id === PROJECT_MANAGE_ROLE_ID && (selectedMembers.length < 1)) {
      return notify.info('至少有一个项目管理员在项目中')
    }
    let diff = xor(existentMember, selectedMembers);
    let del = intersection(existentMember, diff)
    let add = intersection(selectedMembers, diff)
    if (!del.length && !add.length) {
      this.setState({
        connectModal: false,
        memberType: 'user'
      })
    } else if (del.length && !add.length) {
      this.delMember(del, true)
    } else if (!del.length && add.length) {
      this.addMember(add, true)
    } else {
      this.addMember(add)
      this.delMember(del, true)
    }
  }
  addMember(add, flag) {
    const { currentRoleInfo, projectDetail } = this.state;
    const { usersAddRoles } = this.props;
    let notify = new Notification()
    usersAddRoles({
      roleID: currentRoleInfo.id,
      scope: 'project',
      scopeID: `${projectDetail.pid}`,
      body: {
        userIDs: add
      }
    }, {
        success: {
          func: () => {
            if (flag) {
              this.getCurrentRole(currentRoleInfo.id)
              this.getProjectDetail()
              notify.success('关联成员操作成功')
              this.setState({
                connectModal: false,
                memberType: 'user'
              })
            }
          },
          isAsync: true
        },
        failed: {
          func: () => {
            if (flag) {
              if(err.statusCode === 403){
                notify.warn(`关联成员操作失败, 用户没有权限`)
              }
              else{
                notify.warn(`关联成员操作失败`)
              }
              this.setState({
                connectModal: false,
                memberType: 'user'
              })
            }
          },
          isAsync: true
        }
      })
  }
  delMember(del, flag) {
    const { currentRoleInfo, projectDetail } = this.state;
    const { usersLoseRoles } = this.props;
    let notify = new Notification()
    usersLoseRoles({
      roleID: currentRoleInfo.id,
      scope: 'project',
      scopeID: `${projectDetail.pid}`,
      body: {
        userIDs: del
      }
    }, {
        success: {
          func: () => {
            if (flag) {
              this.getCurrentRole(currentRoleInfo.id)
              this.getProjectDetail()
              notify.success('关联成员操作成功')
              this.setState({
                connectModal: false,
                memberType: 'user'
              })
            }
          },
          isAsync: true
        },
        failed: {
          func: () => {
            if (flag) {
              notify.success('关联成员操作成功')
              this.setState({
                connectModal: false,
                memberType: 'user'
              })
            }
          },
          isAsync: true
        }
      })
  }
  updateCurrentMember(member) {
    this.setState({
      selectedMembers: member
    })
  }
  changeMemberType = value => {
    this.getProjectMember(value)
  }
  filterMember = value => {
    const { memberType, filterFlag } = this.state
    this.setState({
      filterLoading: true
    }, () => {
      this.getProjectMember(memberType, value, !filterFlag).then(() => {
        this.setState({
          filterLoading: false
        })
      })
    })
  }
  popoverChange(visible) {
    const { roleNum } = this.props
    const { isManager } = this.state
    if ((roleNum !== ROLE_SYS_ADMIN) && (!isManager)) {
      this.setState({
        popoverVisible: false
      })
      return
    }
    this.setState({
      popoverVisible: visible
    })
  }
  perallEditModalOpen = () => {
    this.setState({
      isShowperallEditModal: true,
    })
  }
  perallEditModalOk = () => {

  }
  perallEditModalCancel = () => {
    this.setState({
      isShowperallEditModal: false,
    })
  }
  getPanelHeader = (title) => {
    let titleCn = "xx";
    switch(title){
      case "application":
        titleCn = "应用";
        break;
      case "configuration":
        titleCn = "配置";
        break;
      case "container":
        titleCn = "容器";
        break;
      case "service":
        titleCn = "服务";
        break;
      case "volume":
        titleCn = "存储";
        break;
    }
    return (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={4} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">{titleCn}</span>
          </Col>
          <Col span={20} key="right">
            <div className="desc"></div>
          </Col>
        </Row>
      </div>
    )
  }
  checkDisplayName = (rule, value, callback) => {
    const { CheckDisplayName } = this.props;
    let newValue = value && value.trim()
    if (newValue === '') {
      return callback('项目名称不能为空')
    }
    clearTimeout(this.displayNameTimeout)
    this.displayNameTimeout = setTimeout(()=>{
      CheckDisplayName({
        displayName: value
      },{
        success: {
          func: res => {
            if (res.data === false) {
              // this.updateDisplayName(value)
              callback()
            } else if (res.data === true) {
              callback(new Error('该项目名称已存在'))
            }
          },
          isAsync: true
        },
        failed: {
          func: () => {
            callback()
          },
          isAsync: true
        }
      })
    },ASYNC_VALIDATOR_TIMEOUT)
  }
  editPermission = (currResourceType) => {
    this.setState({
      currResourceType: currResourceType,
      isShowResourceModal: true,
    })
  }
  closeResourceModal = () => {
    this.setState({
      isShowResourceModal: false,
    })
  }

  changeCluster = e => {
    if(e.key === this.state.selectedCluster) return;
    this.setState({
      selectedCluster: e.key,
      isChangeCluster: true,
    }, () => {
      this.getPermissionOverview();
      this.setState({
        isChangeCluster: false,
      })
    })
  }
  getPermission = (tempPermission, type) => {
    let permission = _.cloneDeep(tempPermission);
    switch (type) {
      case "application":
        permission = _.without(permission, _.filter(permission, {name: "创建应用"})[0])
        break;
      case "volume":
        permission = _.without(permission, _.filter(permission, {name: "创建存储"})[0])
        break;
      case "configuration":
        permission = _.without(permission, _.filter(permission, {name: "创建配置组"})[0])
        break;
      case "secret":
        permission = _.without(permission, _.filter(permission, {name: "创建加密配置"})[0])
        break;
      case "applicationPackage":
        permission = _.without(permission, _.filter(permission, {name: "上传包文件"})[0])
        break;
      case "snapshot":
        break;
    }
    return permission;
  }
  generateLetterArr = () => {
    const { currentMembers } = this.state
    const letterArr = [{index: "all"}]
    const letters = []
    for (let i = 0; i< 26; i++) {
      if (i % 4 === 0 && i <= 24) {
        const item = []
        const limit = i === 24 ? 2 : 4
        for (let k = 0; k < limit; k ++) {
          const key = String.fromCharCode(65 + i + k).toLowerCase()
          item.push(key)
        }
        const index = `${item[0]}~${item[item.length-1]}`
        letterArr.push({index, list: item})
        letters.push(item)
      }
    }
    currentMembers.forEach(v => {
      const initlalChar = v.userName[0]
      letterArr.forEach((j, m) => {
        if(j.list && j.list.some(item => item === initlalChar)) {
          v.key = j.index
        }
      })
    })
    this.setState({currentMembers})
    return letterArr

  }
  filterMemberByInitial = v => {
    const { allMembers } = this.state
    if (v === 'all') {
      this.setState({
        currentMembers: allMembers,
        currentMemberFilter: v
      })
      return
    }
    const newMembers = allMembers.filter(k => k.key === v)
    this.setState({
      currentMembers: newMembers,
      currentMemberFilter: v
    })

  }

  render() {
    const { payNumber, projectDetail, editComment, editDisplayName, comment, displayName, currentRolePermission, choosableList, targetKeys, memberType,
      currentRoleInfo, currentMembers, memberCount, memberArr, existentMember, connectModal, characterModal, currentDeleteRole, totalMemberCount,
      filterFlag, isManager, roleNameArr, getRoleLoading, filterLoading, quotaData, quotauseData, popoverVisible, currentCluster, selectedCluster,
      dubboSwitchChecked
    } = this.state;
    const TreeNode = Tree.TreeNode;
    const { form, roleNum, projectClusters, location, billingEnabled } = this.props;
    const isAble = roleNum === 2
    const { getFieldProps } = form;
    // const quota = location.query.tabs
    // const url = quota ? '/tenant_manage/cluster_authorization' : '/tenant_manage/project_manage'
    const loopFunc = data => data.length > 0 && data.map((item) => {
      return <TreeNode key={item.key} title={item.userName} disableCheckbox={true} />;
    });
    const disabledArr = [PROJECT_VISISTOR_ROLE_ID, PROJECT_MANAGE_ROLE_ID]
    const loop = data => data.map((item) => {
      if (item['children'] !== undefined) {
        return (
          <TreeNode key={item.key} title={item.title} disableCheckbox={true}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.title} disableCheckbox={true} />;
    });
    let alertMessage = (
      <div style={{ color: '#137bb8', lineHeight: '28px', }}>
        <Icon type="smile" style={{ marginRight: 10 }} /> 温馨提示: <br />
        <p>1. 每个有权限管理该项目的人都可设置该项目的余额预警提醒，该设置的提醒只针对设置者本人，以对设置者发邮件的方式提醒，方便及时为项目充值。</p>
        <p>2. 当项目余额小于该值时，每天邮件提醒一次。</p>
      </div>
    )
    const applying = (flag) => {
      return [
        projectClusters.length > 0 && projectClusters.map((item, index) => {
          if (item.status === 1) {
            if (flag) {
              return (
                <div className="clusterStatus applyingStatus" key={`${item.clusterID}-status`}>
                  <span>{item.clusterName}</span>
                  {this.clusterStatus(item.status, true)}
                </div>
              )
            }
            return (
              <dd className="topList" key={item.clusterID}>
                <span>{item.clusterName}</span>
                <div>
                  {this.clusterStatus(item.status)}
                  <Icon type="cross-circle-o" className="pull-right pointer" style={{ marginLeft: '10px' }} onClick={() => this.updateProjectClusters(item.clusterID, 0)} />
                </div>
              </dd>
            )
          }
        })
      ]
    }
    const applied = (flag) => {
      return [
        projectClusters.length > 0 && projectClusters.map((item, index) => {
          if (item.status === 2) {
            if (flag) {
              return (
                <Row gutter={6}>
                  <Col span={8}>
                    <div className="clusterStatus appliedStatus" key={`${item.clusterID}-status`} >
                      <span >{item.clusterName}</span>
                      {this.clusterStatus(item.status, true)}
                      {
                        (isAble || isManager) &&
                        <Tooltip title="移除集群">
                          <i className="anticon anticon-cross" onClick={() => this.setState({ deleteClusterModal: true, currentCluster: item })} />
                        </Tooltip>
                      }
                      <Modal title="移除集群" visible={this.state.deleteClusterModal}
                        onCancel={() => this.setState({ deleteClusterModal: false })}
                        onOk={() => { this.updateProjectClusters(currentCluster.clusterID, 0); this.setState({ deleteClusterModal: false }) }}
                      >
                        <div className="modalColor">
                          <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
                          移除集群后，该集群下的资源也将被移除，此操作不可逆，是否确定移除已授权的集群{currentCluster && currentCluster.clusterName}？
                        </div>
                      </Modal>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="gutter-box">
                          {/* {roleNameArr && roleNameArr.length ? roleNameArr.join(', ') : '-'} */}
                          {
                          (this.state.displayName || this.state.projectDetail && this.state.projectDetail.namespace) &&
                          <ServiceMeshSwitch clusterId={item.clusterID} projectDetail={this.state.projectDetail}
                          clusterName={item.clusterName} displayName={this.state.displayName} projectName={this.props.name}/>
                          }
                      </div>
                  </Col>

                    <Col span={8} className="dubbo-switch">
                      <DubboSwitch clusterID={item.clusterID} projectName={this.props.name}/>
                    </Col>

                </Row>
              )
            }
            return (
              <dd className="topList" key={item.clusterID} >
                <span >{item.clusterName}</span>
                <div>
                  {this.clusterStatus(item.status)}
                  {/*<Icon type="cross-circle-o" className="pull-right pointer" style={{marginLeft:'10px'}} onClick={()=>this.updateProjectClusters(item.clusterID,0)}/>*/}
                </div>
              </dd>
            )
          }
        })
      ]
    }
    const reject = (flag) => {
      return [
        projectClusters.length > 0 && projectClusters.map((item, index) => {
          if (item.status === 3) {
            if (flag) {
              return (
                <div className="clusterStatus rejectStatus" key={`${item.clusterID}-status`}>
                  <span>{item.clusterName}</span>
                  {this.clusterStatus(item.status, true)}
                </div>
              )
            }
            return (
              <dd className="topList" key={item.clusterID}>
                <span>{item.clusterName}</span>
                <div>
                  {this.clusterStatus(item.status)}
                  <Tooltip placement="top" title='重新申请'>
                    <i className="fa fa-pencil-square-o pull-right fa-lg pointer" aria-hidden="true" onClick={() => this.updateProjectClusters(item.clusterID, 1)} />
                  </Tooltip>
                  <Icon type="cross-circle-o" className="pull-right pointer" style={{ marginLeft: '10px' }} onClick={() => this.updateProjectClusters(item.clusterID, 0)} />
                </div>
              </dd>
            )
          }
        })
      ]
    }
    let bottomLength = 0
    const menuBottom = (
      [
        projectClusters.length > 0 && projectClusters.map((item, index) => {
          if (item.status === 0) {
            bottomLength++
            return (
              <dd className="topList lastList pointer" key={item.clusterID} onClick={() => this.updateProjectClusters(item.clusterID, 1)}>
                <span>{item.clusterName}</span>
                <div>
                  {this.clusterStatus(item.status)}
                </div>
              </dd>
            )
          }
        })
      ]
    )

    const roleList = projectDetail.relatedRoles && projectDetail.relatedRoles.map((item, index) => {
      return (
        <li key={item.roleId} className={classNames({ 'active': currentRoleInfo && currentRoleInfo.id === item.roleId })} onClick={() => this.getCurrentRole(item.roleId, "click")}>{item.roleName}
          {
            (isAble || isManager) && !includes(disabledArr, item.roleId) &&
            <Tooltip placement="top" title="删除角色">
              <Icon type="delete" className="pointer" onClick={(e) => this.deleteRole(e, item)} />
            </Tooltip>
          }
        </li>
      )
    })
    const appliedLenght = projectClusters.length - bottomLength
    const content = (
      <div className={classNames("dropDownInnerBox")}>
        <dl className="dropDownTop">
          <dt className="topHeader">{`已申请集群（${appliedLenght}）`}</dt>
          {applying(false)}
          {applied(false)}
          {reject(false)}
          {
            !appliedLenght &&
            <dd className="topList" style={{ color: '#999' }}>已申请集群为空</dd>
          }
        </dl>
        <dl className="dropDownBottom">
          <dt className="bottomHeader">{`可申请集群（${bottomLength}）`}</dt>
          {menuBottom}
          {
            !bottomLength &&
            <dd className="topList lastList" style={{ color: '#999' }}>可申请集群为空</dd>
          }
        </dl>
      </div>
    );
    let items;
    this.state.currentMembers.length ?
    items = this.state.currentMembers.map(item =><Tooltip title={item.userName}><div className="item">{item.userName}</div></Tooltip>)
    :
    items = (
      <div className="nodata">暂无成员</div>
    )
    const clusters = _.filter(projectClusters, {status: 2});
    const clusterMenu = (
      <Menu onClick={this.changeCluster}>
        {
          !!clusters && clusters.length > 0 && clusters.map(item => {
            return (
              <Menu.Item key={item.clusterID}>
                {item.clusterName}
              </Menu.Item>
            )
          })
        }
      </Menu>
    )
    return (
      <QueueAnim>
        <div key='projectDetailBox' className="projectDetailBox">
          <div className="goBackBox">
              <span className="back"
                  onClick={() => this.props.history.go(-1)}>
                <span className="backjia"></span>
                <span className="btn-back">返回</span>
              </span>
            <i />
            项目详情
          </div>

          <Modal title="删除角色" visible={this.state.deleteRoleModal}
            onCancel={() => this.cancelDeleteRole()}
            onOk={() => this.confirmDeleteRole()}
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
              是否确定从项目{projectDetail && projectDetail.projectName}中移除角色{currentDeleteRole.roleName}？
            </div>
          </Modal>
          <Modal title="项目充值" visible={this.state.paySingle} width={580}
            onCancel={() => this.paySingleCancel()}
            onOk={() => this.paySingleOk()}
          >
            <dl className="paySingleList">
              <dt>项目名</dt><dd>{projectDetail && projectDetail.projectName}</dd>
            </dl>
            <dl className="paySingleList">
              <dt>余额</dt><dd>{parseAmount(projectDetail && projectDetail.balance, 4).fullAmount}</dd>
            </dl>
            <dl className="paySingleList">
              <dt>充值金额</dt>
              <dd className="payBtn">
                <span className={classNames('btnList', { 'active': payNumber === 10 })} onClick={() => { this.changePayNumber(10) }}>10T<div className="triangle"><i className="anticon anticon-check" /></div></span>
                <span className={classNames('btnList', { 'active': payNumber === 20 })} onClick={() => { this.changePayNumber(20) }}>20T<div className="triangle"><i className="anticon anticon-check" /></div></span>
                <span className={classNames('btnList', { 'active': payNumber === 50 })} onClick={() => { this.changePayNumber(50) }}>50T<div className="triangle"><i className="anticon anticon-check" /></div></span>
                <span className={classNames('btnList', { 'active': payNumber === 100 })} onClick={() => { this.changePayNumber(100) }}>100T<div className="triangle"><i className="anticon anticon-check" /></div></span>
                <InputNumber value={payNumber} onChange={(value) => this.setState({ payNumber: value })} size="large" min={10} />
                <b>T</b>
              </dd>
            </dl>
          </Modal>
          <Modal visible={this.state.balanceWarning}
            title='设置提醒'
            wrapClassName='remindModal'
            onOk={this.warningSubmit.bind(this)}
            onCancel={this.warningCancel.bind(this)}
            width='610px' >
            <div>
              <Alert message={alertMessage} type="info" />
              <Row style={{ color: '#333333', height: 35 }}>
                <Icon type="pay-circle-o" style={{ marginRight: 10 }} />
                余额不足提醒
              </Row>
              <Row style={{ paddingLeft: '22px', height: 35 }}>
                <Col span={4} style={{ color: '#7a7a7a' }}>提醒规则</Col>
                <Col span={20} style={{ color: '#666666' }}>我的空间可用余额小于&nbsp;
                  <InputNumber />
                  <span> T</span>
                  &nbsp;时发送提醒
                </Col>
              </Row>
              <Row style={{ paddingLeft: '22px', height: 28 }}>
                <Col span={4} style={{ color: '#7a7a7a' }}>提醒方式</Col>
                <Col span={20}>
                  <Checkbox style={{ color: '#7a7a7a', fontSize: '14px' }} >邮件(123456@qq.com)</Checkbox>
                </Col>
              </Row>
            </div>
          </Modal>
          <Card title="基本信息" bordered={false} style={{ width: '100%' }}>
            <Row>
              <Col span={12}>
                <div className="basicInfoLeft">
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        项目名称
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        <div className="example-input commonBox project-detail-displayName">
                          <Form.Item className={'project-detail-input-displayName'}>
                            <Input
                              size="large"
                              disabled={!editDisplayName}
                              placeholder="请输入项目名称"
                              {...getFieldProps('displayName', {
                                initialValue: displayName || (projectDetail && projectDetail.namespace),
                                rules: [{
                                  validator: this.checkDisplayName,
                                }]
                              }) }
                            />
                          </Form.Item>
                          {
                            editDisplayName ?
                              [
                                <Tooltip title="取消">
                                  <i className="anticon anticon-minus-circle-o pointer project-detail-edit-cancel" onClick={() => this.cancelDisplayNameEdit()} />
                                </Tooltip>,
                                <Tooltip title="保存">
                                  <i className="anticon anticon-save pointer" onClick={() => this.saveDisplayName()} />
                                </Tooltip>
                              ] :
                              (isAble|| isManager) &&
                              <Tooltip title="编辑">
                                <i className="anticon anticon-edit pointer" onClick={() => this.editDisplayName()} />
                              </Tooltip>
                          }
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        命名空间
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        {projectDetail && projectDetail.namespace}
                      </div>
                    </Col>
                  </Row>
                  {
                    billingEnabled &&
                    <Row gutter={16}>
                      <Col className='gutter-row' span={4}>
                        <div className="gutter-box">
                          余额
                        </div>
                      </Col>
                      <Col className='gutter-row' span={20}>
                        <div className="gutter-box">
                          <span style={{ marginRight: '30px' }}>{parseAmount(projectDetail && projectDetail.balance, 4).fullAmount}</span>
                          {
                            isAble && <Button type="primary" size="large" onClick={this.paySingle.bind(this)}>充值</Button>
                          }
                        </div>
                      </Col>
                    </Row>
                  }
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        项目角色
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        {roleNameArr && roleNameArr.length ? roleNameArr.join(', ') : '-'}
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        备注
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box ">
                        <div className="example-input commonBox remark">
                          <Input size="large" disabled={editComment ? false : true} type="textarea" placeholder="备注" {...getFieldProps('comment', {
                            initialValue: comment
                          }) } />
                          {
                            editComment ?
                              [
                                <Tooltip title="取消">
                                  <i className="anticon anticon-minus-circle-o pointer" onClick={() => this.cancelEdit()} />
                                </Tooltip>,
                                <Tooltip title="保存">
                                  <i className="anticon anticon-save pointer" onClick={() => this.saveComment()} />
                                </Tooltip>
                              ] :
                              (isAble|| isManager) &&
                              <Tooltip title="编辑">
                                <i className="anticon anticon-edit pointer" onClick={() => this.editComment()} />
                              </Tooltip>
                          }
                        </div>
                      </div>
                    </Col>
                  </Row>
                  {/*<Row gutter={16}>*/}
                  {/*<Col className='gutter-row' span={4}>*/}
                  {/*<div className="gutter-box">*/}
                  {/*余额预警*/}
                  {/*</div>*/}
                  {/*</Col>*/}
                  {/*<Col className='gutter-row' span={20}>*/}
                  {/*<div className="gutter-box">*/}
                  {/*<Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={false}  onChange={(checked)=>this.switchChange(checked)}/>*/}
                  {/*{*/}
                  {/*this.state.switchState ?*/}
                  {/*<span>*/}
                  {/*<span className="balanceTip">项目余额小于 <span className="themeColor">2T</span> 时预警</span>*/}
                  {/*<span className="alertBtn themeColor pointer" onClick={()=>this.setState({balanceWarning:true})}>修改</span>*/}
                  {/*</span>*/}
                  {/*: ''*/}
                  {/*}*/}
                  {/*</div>*/}
                  {/*</Col>*/}
                  {/*</Row>*/}
                </div>
              </Col>
              <Col span={12}>
                <div className="basicInfoRight">
                  <Row>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        创建时间
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        {projectDetail && projectDetail.createTime && formatDate(projectDetail.createTime)}
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        更新时间
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box">
                        {projectDetail && projectDetail.updateTime && formatDate(projectDetail.updateTime)}
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col className='gutter-row' span={4}>
                      <div className="gutter-box">
                        授权集群
                      </div>
                    </Col>
                    <Col className='gutter-row' span={20}>
                      <div className="gutter-box" id="popBox">
                        <Popover
                          content={content}
                          visible={popoverVisible}
                          trigger="click"
                          overlayClassName="projectDetailPop"
                          getTooltipContainer={() => document.getElementById('popBox')}
                          onVisibleChange={this.popoverChange.bind(this)}
                        >
                          {
                            (roleNum !== ROLE_SYS_ADMIN) && (!isManager)?
                              <Tooltip title="请联系「该项目的项目管理员」编辑">
                                <div className="dropDownBox">
                                  <span className="pointer" /*onClick={() => { roleNum === 1 || isManager ? this.toggleDrop() : null }}*/>编辑授权集群<i className="fa fa-caret-down pointer" aria-hidden="true" /></span>
                                </div>
                              </Tooltip>
                              :
                                <div className="dropDownBox">
                                  <span className="pointer" /*onClick={() => { roleNum === 1 || isManager ? this.toggleDrop() : null }}*/>编辑授权集群<i className="fa fa-caret-down pointer" aria-hidden="true" /></span>
                                </div>
                          }
                        </Popover>
                        {/*<div className="dropDownBox">*/}
                        {/*<span className="pointer" onClick={() => { roleNum === 1 || isManager ? this.toggleDrop() : null }}>编辑授权集群<i className="fa fa-caret-down pointer" aria-hidden="true" /></span>*/}
                        {/*<div className={classNames("dropDownInnerBox", { 'hide': !dropVisible })}>*/}
                        {/*<dl className="dropDownTop">*/}
                        {/*<dt className="topHeader">{`已申请集群（${appliedLenght}）`}</dt>*/}
                        {/*{applying(false)}*/}
                        {/*{applied(false)}*/}
                        {/*{reject(false)}*/}
                        {/*{*/}
                        {/*!appliedLenght &&*/}
                        {/*<dd className="topList" style={{ color: '#999' }}>已申请集群为空</dd>*/}
                        {/*}*/}
                        {/*</dl>*/}
                        {/*<dl className="dropDownBottom">*/}
                        {/*<dt className="bottomHeader">{`可申请集群（${bottomLength}）`}</dt>*/}
                        {/*{menuBottom}*/}
                        {/*{*/}
                        {/*!bottomLength &&*/}
                        {/*<dd className="topList lastList" style={{ color: '#999' }}>可申请集群为空</dd>*/}
                        {/*}*/}
                        {/*</dl>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col className='gutter-row' span={24} >
                      {
                        appliedLenght > 0 &&
                        <div className="clusterWithStatus">
                          <Row>
                            <Col span={8}><span className="item">已授权集群</span></Col>
                            <Col span={8}><span className="item">启用服务网格</span></Col>
                            <Col span={8}><span className="item">启用 Dubbo 服务</span></Col>
                          </Row>
                          {/* {applying(true)} */}
                          {applied(true)}
                          {/* {reject(true)} */}
                        </div>
                      }
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Card>
          {/* <div className="projectResource">
            <Card title="项目资源">
              <Row gutter={16}>
                <Col className='gutter-row' span={8}>
                  <div className="gutter-box">
                    <i className="inlineBlock appNum" />
                    <span>应用数：{projectDetail && projectDetail.appCount}个</span>
                  </div>
                </Col>
                <Col className='gutter-row' span={8}>
                  <div className="gutter-box">
                    <i className="inlineBlock serverNum" />
                    <span>服务数：{projectDetail && projectDetail.serviceCount}个</span>
                  </div>
                </Col>
                <Col className='gutter-row' span={8}>
                  <div className="gutter-box">
                    <i className="inlineBlock containerNum" />
                    <span>容器数：{projectDetail && projectDetail.containerCount}个</span>
                  </div>
                </Col>
              </Row>
            </Card>
          </div> */}
          <Modal
            visible={this.state.addCharacterModal}
            title='添加已有角色'
            wrapClassName='addCharacterModal'
            onOk={this.addCharacterOk.bind(this)}
            onCancel={this.addCharacterCancel.bind(this)}
            width='760px'
          >
            <Transfer
              dataSource={choosableList}
              className="projectDetailRoleTrans"
              showSearch
              listStyle={{
                width: 300,
                height: 255,
              }}
              searchPlaceholder="请输入搜索内容"
              titles={['可选角色', '已选角色']}
              operations={['添加', '移除']}
              filterOption={this.filterOption.bind(this)}
              targetKeys={targetKeys}
              onChange={this.handleChange.bind(this)}
              rowKey={item => item.key}
              render={(item) => this.renderItem(item)}
            />
          </Modal>
          <CreateRoleModal
            form={form}
            scope={this}
            characterModal={characterModal}
            loadData={this.loadRoleList.bind(this)}
          />
          <Modal title="角色成员管理" width={765} visible={connectModal}
            onCancel={() => this.closeMemberModal()}
            onOk={() => this.submitMemberModal()}
          >
            {
              <TreeComponent
                outPermissionInfo={memberArr}
                filterLoading={filterLoading}
                permissionInfo={[]}
                existMember={existentMember.length > 0 ? existentMember.slice(0) : []}
                text='对象'
                memberCount={totalMemberCount}
                roleMember={memberCount}
                connectModal={connectModal}
                getTreeRightData={this.updateCurrentMember.bind(this)}
                changeSelected={this.changeMemberType}
                modalStatus={connectModal}
                memberType={memberType}
                filterFlag={filterFlag}
                filterUser={(value) => this.filterMember(value)}
              />
            }
          </Modal>
          {
            this.state.isShowResourceModal ?
            <ResourceModal
              getPermission={this.getPermission}
              visible={this.state.isShowResourceModal}
              onCancel={this.closeResourceModal}
              currResourceType={this.state.currResourceType}
              scope={this}
              onOk={this.getPermissionOverview}
            />
            : null
          }

          <div className="projectMember">
            <Tabs className="clearfix connectCard" defaultActiveKey={this.state.tabsKey}>
              <TabPane tab="项目角色及关联成员" key="project">
                <Spin spinning={this.state.projectLoading}>
                  {/* <Card title="项目中角色关联的对象" className="clearfix connectCard"> */}
                  <div className="project">
                    <div className="title">项目角色</div>
                    <div className="connectLeft pull-left">
                      <ul className={classNames("characterListBox", { 'borderHide': projectDetail.relatedRoles === null })}>
                        {roleList}
                      </ul>
                      {
                        (() => {
                          //console.log("b",roleNum === 1 || isManager);
                          return (isAble || isManager) && <Button key="createRole" type="primary" size="large" icon="plus" onClick={() => this.openCreateModal()}>创建新角色</Button>
                        })()
                      }
                      {/*
                        [
                          <Button key="addRoles" type="primary" size="large" icon="plus" onClick={() => this.setState({ addCharacterModal: true })}> 添加已有角色</Button>,
                          <br />,
                          <Button key="createRole" type="ghost" size="large" icon="plus" onClick={() => this.openCreateModal()}>创建新角色</Button>
                        ]
                      */}
                    </div>
                    <div className="connectRight pull-left">
                      <div className="title">
                        <span>该角色成员</span>
                        {
                          (isAble || isManager) ? <span className="manageMembers" onClick={() => this.getProjectMember('user')}><a><Icon type="setting" />角色成员</a></span>
                          : null
                        }
                      </div>
                      <div className="bottom-line"></div>
                      <div className="memberContainer">
                        <div className="filterBox">
                          <div className="title">成员：</div>
                          {
                            this.state.letterArr.map(v => <div
                              className={this.state.currentMemberFilter === v.index ? "actived" : ""}
                              onClick={() => this.filterMemberByInitial(v.index)}
                              key={v.index}>{v.index}</div>)
                          }
                        </div>
                        <div className="members">
                          {
                            items
                          }

                        </div>
                      </div>
                      <div className="permissionContainer">
                        <div className="titleContainer">
                          <span className="title">该角色权限</span>
                          <span className="clusterTitle">
                            <TenxIcon type="cluster"/>
                            集群
                          </span>
                          {
                            this.state.currpermissionPolicyType === 1 ? <span className="zanwu">所有已授权集群</span> :
                            !selectedCluster ?
                            <span className="zanwu">暂无集群</span>
                            :
                            <Dropdown overlay={clusterMenu} trigger={['click']}>
                              <a className="ant-dropdown-link" href="#">
                                {
                                  (() => {
                                    return !!clusters && clusters.length > 0 && !!_.filter(clusters, {clusterID: selectedCluster})[0] && [_.filter(clusters, {clusterID: selectedCluster})[0].clusterName , <Icon type="down" />]
                                  })()
                                }
                              </a>
                            </Dropdown>
                          }
                          <span className="desc">
                            <TenxIcon type="permission"/>
                            授权方式：{this.state.currpermissionPolicyType === 1 ? "所有资源统一授权" : "指定资源授权"}
                          </span>
                        </div>

                        <div className="bottom-line"></div>
                        {
                          this.state.currpermissionPolicyType === 1?
                          <div className="type1">
                            <div className="btnContainer">
                              <Button disabled={currentRoleInfo && (currentRoleInfo.name === "项目管理员" || currentRoleInfo.name === "项目访客") || (!isManager && !isAble)} type="primary" size="large" icon="plus" onClick={this.perallEditModalOpen}>授权资源</Button><span className="hint">以下权限对项目内所有资源生效</span>
                            </div>
                            <div className="permissionType1Container">
                              <div className="authBox inlineBlock">
                                <p className="authTitle">该角色共 <span style={{ color: '#59c3f5' }}>{currentRoleInfo && currentRoleInfo.total || 0}</span> 个权限</p>
                                <div className="treeBox">
                                  {
                                    currentRolePermission &&
                                    <Tree
                                      checkable
                                      onExpand={this.onExpand.bind(this)} expandedKeys={this.state.expandedKeys}
                                      autoExpandParent={this.state.autoExpandParent}
                                      onCheck={this.onCheck.bind(this)} checkedKeys={this.state.checkedKeys}
                                      onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
                                    >
                                      {loop(currentRolePermission)}
                                    </Tree>
                                  }
                                </div>
                              </div>
                            </div>
                            {/* <Modal
                              visible={this.state.isShowperallEditModal}
                              onOk={this.perallEditModalOk}
                              onCancel={this.perallEditModalCancel}
                            >
                                  todo
                            </Modal>*/}
                            {
                              this.state.isShowperallEditModal ?
                              <RoleEditModal
                                form={form}
                                scope={this}
                                isAdd={false}
                                isTotal={true}
                                totalSelected={currentRoleInfo && currentRoleInfo.total}
                                roleId={currentRoleInfo && currentRoleInfo.id}
                                visible={this.state.isShowperallEditModal}
                                isDetail={true}
                              /> : null
                            }
                          </div>
                          :
                          <div className="type2">
                            <div className="hint">该角色成员可操作的资源</div>
                            <div className="panelStyle">
                              {/* {perPanels} */}
                              {
                                this.state.isChangeCluster || !selectedCluster ?
                                  <div className="zanwuDiv"><span className="">暂无可操作资源</span></div>
                                  :
                                  <PermissionOverview
                                    project={location.query.name}
                                    clusterID={selectedCluster}
                                    roleId={currentRoleInfo && currentRoleInfo.id}
                                    openPermissionModal={this.editPermission}
                                    callback={this.getPermissionOverview}
                                    isDisabled={!(isAble || isManager)}
                                    getPermission={this.getPermission}
                                  />
                              }
                            </div>
                          </div>
                        }
                      </div>
                      {/*<div className="rightContainer">
                        <div className="authBox inlineBlock">
                          <p className="authTitle">该角色共 <span style={{ color: '#59c3f5' }}>{currentRoleInfo && currentRoleInfo.total || 0}</span> 个权限</p>
                          <div className="treeBox">
                            {
                              currentRolePermission &&
                              <Tree
                                checkable
                                onExpand={this.onExpand.bind(this)} expandedKeys={this.state.expandedKeys}
                                autoExpandParent={this.state.autoExpandParent}
                                onCheck={this.onCheck.bind(this)} checkedKeys={this.state.checkedKeys}
                                onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
                              >
                                {loop(currentRolePermission)}
                              </Tree>
                            }
                          </div>
                        </div>
                        <div className="memberBox inlineBlock">
                          <div className="memberTitle">
                            <span className="connectMemberCount">该角色已关联 <span className="themeColor">{memberCount}</span> 个对象</span>
                            {
                              (roleNum === 1 || isManager) && !getRoleLoading && currentMembers.length > 0 && <Button type="primary" size="large" onClick={() => this.getProjectMember('user')}>继续关联成员</Button>
                            }
                          </div>
                          <div className="memberTableBox">
                            {
                              !getRoleLoading ? currentMembers.length > 0 ?
                                <Tree
                                  checkable multiple
                                  checkedKeys={currentMembers.map(item => `${item.key}`)}
                                >
                                  {loopFunc(currentMembers)}
                                </Tree>
                                :
                                (roleNum === 1 || isManager) && <Button type="primary" size="large" className="addMemberBtn" onClick={() => this.getProjectMember('user')}>关联成员</Button>
                                : null
                            }
                          </div>
                        </div>
                      </div>
                      */}
                    </div>
                  </div>
                  {/* </Card> */}
                </Spin>
              </TabPane>

              <TabPane tab="资源配额管理" key="quota">
                {
                  projectDetail.projectName &&
                  <ResourceQuota isProject={true} projectName={projectDetail.projectName}
                                 outlineRoles={projectDetail.outlineRoles}
                                 showProjectName={ { displayName: projectDetail.displayName,
                                   namespace: projectDetail.namespace } } roleNameArr={roleNameArr} />

                }
              </TabPane>
              <TabPane tab="容器安全策略" key="containerSecurityPolicy">
                {
                  (projectDetail.projectName && <ContainerSecurityPolicy
                    projectDetail={projectDetail}
                    roleNum = {this.props.roleNum}
                    />)
                }
              </TabPane>
            </Tabs>

          </div>
        </div>
      </QueueAnim>
    )
  }
}

ProjectDetail = Form.create()(ProjectDetail)
function mapStateToThirdProp(state, props) {
  const { query } = props.location
  const { name } = query
  const { loginUser, current } = state.entities
  const { globalRoles, role, billingConfig } = loginUser.info || { globalRoles: [], role: 0 }
  const { enabled: billingEnabled } = billingConfig

  let roleNum = 0
  if (role === ROLE_SYS_ADMIN || role === ROLE_PLATFORM_ADMIN) {
    roleNum = 2
  } else if (globalRoles.length) {
    for (let i = 0; i < globalRoles.length; i++) {
      if (globalRoles[i] === 'project-creator') {
        roleNum = 4;
        break
      } else {
        roleNum = 3
      }
    }
  }
  const { projectClusterList } = state.projectAuthority
  const currentProjectClusterList = projectClusterList[name] || {}
  const projectClusters = currentProjectClusterList.data || []
  const { clusters } = state.cluster

  const { clusterID } = current.cluster
  return {
    name,
    roleNum,
    projectClusters,
    billingEnabled,
    clusterID
  }
}

export default ProjectDetail = connect(mapStateToThirdProp, {
  CheckDisplayName,
  GetProjectsDetail,
  UpdateProjects,
  GetProjectsAllClusters,
  UpdateProjectsCluster,
  chargeProject,
  ListAllRole,
  CreateRole,
  ExistenceRole,
  UpdateProjectsRelatedRoles,
  DeleteProjectsRelatedRoles,
  GetProjectsMembers,
  GetRole,
  roleWithMembers,
  usersAddRoles,
  usersLoseRoles,
  getGlobaleQuota,
  getGlobaleQuotaList,
  permissionOverview,
  loadClusterList,
  PermissionResource,
  getPluginStatus,
  ToggleServiceMesh: SEMeshActions.ToggleServiceMesh,
})(ProjectDetail)
