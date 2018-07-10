/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.js page
 *
 * @author zhangtao
 * @date Wednesday June 20th 2018
 */
import * as React from 'react'
import { Progress, Icon } from 'antd'
import { Link } from 'react-router'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getDeepValue } from '../../../../client/util/util'
import { getClusterQuota, getClusterQuotaList, getGlobaleQuota, getGlobaleQuotaList, getResourceDefinition, getDevopsGlobaleQuotaList } from '../../../actions/quota'
import './style/index.less'
import _ from 'lodash'
import QueueAnim from 'rc-queue-anim'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN } from '../../../../constants'
import { toQuerystring } from '../../../../src/common/tools'


const findQuotaChinsesName = ({ resourceType, resourceList }) => {
  const { definitions } = resourceList
  for ( const resource of definitions ) {
    if (resource.resourceType === resourceType) {
      return resource.resourceName
    }
    if ( resource.children ) {
      for ( const childResource of resource.children) {
        if ( childResource.resourceType === resourceType ) {
          return childResource.resourceName
        }
      }
    }
  }
  return 'not find QuotaChinsesName'
}

// 根据state下面的entities > current > space字段判断项目类型
const judgeProjectType = (space = {}) => {
  const { name, spaceName, userName, projectName, displayName, userID } = space
  if ( name === '我的个人项目') { //我的个人项目
    return { projectText: '我的个人项目', projectId: 'default', projectType: 1 } // projectType: 1: 我的个人项目
  }
  if ( userName ) { //个人项目
    return {  projectText: userName, projectId: userID, projectType: 2  } // projectType: 1: 个人项目
  }
  if (projectName) { //共享项目
    return { projectText: `(${displayName})${projectName}`, projectId: projectName, projectType: 3 } // projectType: 3: 共享项目项目
  }
}

// 根据space写出跳转到项目申请页的query
const formateQuery = ({ displayName, namespace }) => {
  let showDisplayName = {}
  if (namespace == 'default') {
    showDisplayName.displayName = undefined
    showDisplayName.namespace =  '我的个人项目'
  } else {
    showDisplayName.displayName = displayName,
    showDisplayName.namespace = namespace
  }
  return toQuerystring(showDisplayName)
}

// 根据entities/current/space下面字段的特征判断该用户是否有权限申请配额
const judgeapplyLimit = ({namespace, outlineRoles = [] }) => {
  let flagManager
  if (namespace === 'default') { // 我的个人项目
    flagManager = true
    return flagManager
  }
  flagManager =  outlineRoles.includes('manager')
  return flagManager
}

function mapStateToProps(state, props) {
  const cluster = getDeepValue( state, ['entities','current','cluster'] )
  let { clusterName, namespace, clusterID } = cluster
  const role = getDeepValue( state, ['entities','loginUser','info', 'role'] )
  const space = getDeepValue( state, ['entities','current','space'] )
  const flagManager = judgeapplyLimit(space)
  return {clusterName, namespace, clusterID, role, ...(judgeProjectType(space)),
     showDisplayName: formateQuery(space), flagManager}
}
@connect(mapStateToProps, { getResourceDefinition, getClusterQuota, getClusterQuotaList,
  getGlobaleQuota, getGlobaleQuotaList, getDevopsGlobaleQuotaList })
export default class ResourceBanner extends React.Component {
  state = {
    setResource: undefined, // 默认资源未定义
    usedResource: 0, // 默认使用零个
    resourceName: '', // 名称为空
  }
  static propTypes = {
    // 资源类型
    resourceType: PropTypes.string.isRequired,
  }
  timer = null
  reload = () => {
    const {getResourceDefinition, resourceType, clusterID, getGlobaleQuota, getGlobaleQuotaList,
      getClusterQuota, getClusterQuotaList, getDevopsGlobaleQuotaList  } = this.props
    getResourceDefinition({
      success: {
        func: (result) => {
          const resourceList = result.data
          this.setState( { resourceName: findQuotaChinsesName({ resourceType, resourceList}).trim() } )
          if ( Object.values(result.data.globalResource).find(n => n === resourceType) ) { //全局资源
            getGlobaleQuota( {} ,{
              success: {
                func: (result) => {
                  let resource = null
                  if ( result.data ) {
                    resource = result.data[resourceType]
                  }
                  if (resource === undefined) {
                    resource = null
                  }
                  this.setState({ setResource: resource }) // null表示无限制
                  // this.setState({ setResource: result.data})
                },
                isAsync: true,
              },
            })
            getGlobaleQuotaList({}, {
              success: {
                func: result => {
                  if (result.data[resourceType]) {
                    this.setState({ usedResource: result.data[resourceType] })
                  }
                },
                isAsync: true,
              },
              isAsync: true,
            })
            getDevopsGlobaleQuotaList({}, { // devops/Globale 只会在cicd去拉去, 所以这个地方不用拉取
              success: {
                func: result => {
                  if (result.result[resourceType]) {
                    this.setState({ usedResource: result.result[resourceType] })
                  }
                },
                isAsync: true,
              }
            })
          } else {
            let query = { id: clusterID }
            getClusterQuota(query, {
              success: {
                func: result => {
                  let resource = null
                  if ( result.data ) {
                    resource = result.data[resourceType]
                  }
                  if (resource === undefined) {
                    resource = null
                  }
                  this.setState({ setResource: resource }) // null表示无限制
                },
                isAsync: true,
              },
            })
            getClusterQuotaList(query, {
              success: {
                func: result => {
                  this.setState({ usedResource: result.data[resourceType] })
                },
                isAsync: true,
              },
            })
          }
        },
        isAsync: true,
      },
      failed: {
        func: () => {
        },
        isAsync: true,
      },
    })
  }
  componentDidMount = () => {
    this.reload()
    this.timer = setInterval(this.reload, 10000)
  }
  componentWillUnmount = () => {
    clearTimeout(this.timer)
  }
  render () {
    const { clusterName, resourceType, clusterID, getResourceDefinition,role,projectText, projectId,
      projectType, showDisplayName, flagManager  } = this.props
    const { setResource, usedResource, resourceName } = this.state
    let percent = 0
    if (setResource) {
      percent = parseInt((usedResource / setResource) * 100)
    }
    let link = '404'
    if (projectType === 1) { //我的个人项目
      link = '/account'
    } else if (projectType === 2) { //个人项目
      link = `/tenant_manage/user/${projectId}`
    } else if (projectType === 3) { // 共享项目
      link = `/tenant_manage/project_manage/project_detail?name=${projectId}`
    }
    let flagManagerText = 'none'
    if ( flagManager ) {
      flagManagerText = 'block'
    }
    return(
      <QueueAnim>
        {
          setResource !== undefined && projectId !== undefined?
          <div className="ResourceBanner" key="ResourceBanner">
            <div>{`「${projectText}」项目在「${clusterName}」中「${resourceName}」配额使用情况`}</div>
          <div className="progress">
            <Progress percent={percent} strokeWidth={5} status="active" showInfo={false}/>
          </div>
          <div>
            {`${usedResource}/${setResource === null ? '无限制' : setResource }`}
            <span onClick={ this.reload } className="reload">刷新</span>
          </div>
          {
            (role === ROLE_SYS_ADMIN || role === ROLE_PLATFORM_ADMIN) ?
            <div><Link to={link}><Icon type="plus" />编辑配额</Link></div> :
            <div style={{ display: flagManagerText }}><Link to={`/tenant_manage/applyLimit?${showDisplayName}`}><Icon type="plus" />申请增加配额</Link></div>
          }
          </div> : null
        }
      </QueueAnim>

    )
  }
}
