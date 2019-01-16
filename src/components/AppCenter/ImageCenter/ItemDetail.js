/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */

import React, { Component } from 'react'
import { Modal, Tabs, Table, Icon, Button, Card, Input } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/Project.less'
import { Link, browserHistory } from 'react-router'
import Logs from './ImageItem/Logs'
import Management from './ImageItem/Management'
import CodeRepo from './ImageItem/CodeRepo'
import ImageUpdate from './ImageItem/ImageUpdate'
import LabelModule  from './Project/LabelModule'
import { loadProjectDetail, loadProjectMembers } from '../../../actions/harbor'
import { setCurrent } from '../../../actions/entities'
import { DEFAULT_REGISTRY } from '../../../constants'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN } from '../../../../constants'
import { camelize } from 'humps'
import NotificationHandler from '../../../components/Notification'
import find from 'lodash/find'
import imageDetailIntl from './intl/imageDetail'
import { injectIntl } from 'react-intl'

const notification = new NotificationHandler()
const TabPane = Tabs.TabPane

class PageItemDetail extends Component {
  constructor(props) {
    super()
    this.state = {
      isProject: true, // top project type
      sortedInfo: null,
      filteredInfo: null,
      isSettingCurrent: false,
      activeKey: 'repo',
    }
    this.currentUser = {}
  }
  handleClusterChange = () => {
    const { setCurrent, current, projectVisibleClusters, location } = this.props
    const { namespace } = current.space
    const clusterList = projectVisibleClusters[namespace].data || []
    const cluster = find(clusterList, { clusterID: location.query.clusterId })
    if (current.cluster.namespace === current.space.namespace
      && cluster.clusterID === current.cluster.clusterID) {
      return
    }
    this.setState({
      isSettingCurrent: true,
    })
    setCurrent({ cluster }, {
      success: {
        func: result => {
          this.fetchData()
          this.setState({
            isSettingCurrent: false,
          })
        },
        isAsync: true,
      }
    })
  }
   componentDidMount() {
     const { clusterId } = this.props.location.query
    clusterId ? this.handleClusterChange() : this.fetchData()
    const activeKey = this.props.location.query.key
    activeKey && this.setState({ activeKey })
  }
  fetchData = () => {
    const { loadProjectDetail, loadProjectMembers, params, harbor, intl } = this.props
    const { formatMessage } = intl
    loadProjectDetail(harbor, DEFAULT_REGISTRY, params.id)
    loadProjectMembers(DEFAULT_REGISTRY,  params.id, { harbor }, {
      failed: {
        func: err => {
          const { statusCode } = err
          this.currentUser = {}
          if (statusCode === 403) {
            return
          }
          notification.error(formatMessage(imageDetailIntl.fetchMemberFailure))
        }
      }
    })
  }

  renderRole(role) {
    const { formatMessage } = this.props.intl
    switch (role) {
      case 0:
        return formatMessage(imageDetailIntl.unknown)
      case 1:
        return formatMessage(imageDetailIntl.admin)
      case 2:
        return formatMessage(imageDetailIntl.developer)
      case 3:
        return formatMessage(imageDetailIntl.visitor)
      default:
        break;
    }
  }

  render() {
    if (this.state.isSettingCurrent) return <div></div>
    const { projectDetail, params, projectMembers, loginUser, registry, location, role, intl } = this.props
    const { formatMessage } = intl
    const { name, projectId } = projectDetail
    const members = projectMembers.list || []
    const isAdmin = loginUser.harbor[camelize('has_admin_role')] == 1
    let currentMember = {}
    members.every(member => {
      if (member.entityName === loginUser.userName) {
        currentMember = member
        return false
      }
      return true
    })
    if (isAdmin) {
      this.currentUser = loginUser.harbor
    } else {
      this.currentUser = currentMember
    }
    const currentUserRole = currentMember[camelize('role_id')]
    const isAdminAndHarbor = (isAdmin && (role === ROLE_SYS_ADMIN || role === ROLE_PLATFORM_ADMIN || role === ROLE_BASE_ADMIN))
      || (currentUserRole === 1)
    const tabPanels = [
      <TabPane tab={formatMessage(imageDetailIntl.imageRepo)} key="repo">
        <CodeRepo currentUserRole={currentUserRole} registry={DEFAULT_REGISTRY} {...this.props} isAdminAndHarbor={isAdminAndHarbor}/>
      </TabPane>,
    ]
    if (currentUserRole > 0 || isAdmin) {
      tabPanels.push(<TabPane tab={formatMessage(imageDetailIntl.auditLog)} key="log"><Logs params={this.props.params}/></TabPane>)
      tabPanels.push(
        <TabPane tab={formatMessage(imageDetailIntl.authorityManagement)} key="role">
          <Management
            {...params}
            registry={DEFAULT_REGISTRY}
            members={projectMembers}
            currentUser={this.currentUser}
          />
        </TabPane>
      )
    }
    if (isAdmin) {
      tabPanels.push(
        <TabPane tab={formatMessage(imageDetailIntl.imageAsync)} key="sync">
          <ImageUpdate
            registry={registry}
            location={location}
          />
        </TabPane>
      )
    }
    if (isAdminAndHarbor) {
      tabPanels.push(
        <TabPane tab={formatMessage(imageDetailIntl.tagManagement)} key="tag">
          <LabelModule
            scope="p"
            projectId={projectId}
          />
        </TabPane>
      )
    }
    return (
      <div className="imageProject">
        <br />
        <QueueAnim>
          <div key="Item">
            <Card>
              <div className="topNav">
                <span className="back" onClick={() => browserHistory.goBack()}>
                  <span className="backjia"></span>
                  <span className="btn-back">{formatMessage(imageDetailIntl.returnTxt)}</span>
                </span>
                <span className="itemName">{name || ''}</span>
                <span>{
                  (() => {
                    let res
                    if(!isNaN(projectDetail.public)){
                      if (projectDetail.public === 0) {
                        res = formatMessage(imageDetailIntl.privateRepoGroup)
                      }else{
                        res = formatMessage(imageDetailIntl.publicRepoGroup)
                      }
                    } else if(!!projectDetail.metadata && !!projectDetail.metadata.public){
                      if(projectDetail.metadata.public === "true"){
                        res = formatMessage(imageDetailIntl.publicRepoGroup)
                      } else {
                        res = formatMessage(imageDetailIntl.privateRepoGroup)
                      }
                    }
                    return res
                  })()
                } </span>
                {
                  (currentUserRole > 0) && (
                    <span className="margin">|</span>,
                    <span className="role">
                      <span className="role-key">
                        {formatMessage(imageDetailIntl.myRole)}&nbsp;
                      </span>
                      {this.renderRole(currentUserRole)}
                    </span>
                  )
                }
              </div>
              <br />
              <Tabs
                activeKey={this.state.activeKey}
                onChange={activeKey => this.setState({ activeKey })}
              >
                { tabPanels }
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}
const ItemDetail = injectIntl(PageItemDetail, {
  withRef: true
})
function mapStateToProps(state, props) {
  const { harbor: stateHarbor, entities, projectAuthority } = state
  const { location } = props
  const { loginUser } = entities
  const { role } = loginUser.info

  const { cluster } =  entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    projectDetail: stateHarbor.detail.data || {},
    projectMembers: stateHarbor.members || {},
    loginUser: entities.loginUser.info,
    registry: DEFAULT_REGISTRY,
    location,
    role,
    harbor,
    current: entities.current,
    projectVisibleClusters: projectAuthority.projectVisibleClusters,
  }
}

export default connect(mapStateToProps, {
  loadProjectDetail,
  loadProjectMembers,
  setCurrent,
})(ItemDetail)
