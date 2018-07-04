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
import { getClusterQuota, getClusterQuotaList, getGlobaleQuota, getGlobaleQuotaList, getResourceDefinition } from '../../../actions/quota'
import './style/index.less'
import _ from 'lodash'
import QueueAnim from 'rc-queue-anim'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN } from '../../../../constants'


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
function mapStateToProps(state, props) {
  const cluster = getDeepValue( state, ['entities','current','cluster'] )
  let { clusterName, namespace, clusterID } = cluster
  const role = getDeepValue( state, ['entities','loginUser','info', 'role'] )
  const space = getDeepValue( state, ['entities','current','space'] )
  return {clusterName, namespace, clusterID, role, ...(judgeProjectType(space))}
}
@connect(mapStateToProps, { getResourceDefinition, getClusterQuota, getClusterQuotaList, getGlobaleQuota, getGlobaleQuotaList, })
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
  componentDidMount = () => {
    const {getResourceDefinition, resourceType, clusterID, getGlobaleQuota, getGlobaleQuotaList,
      getClusterQuota, getClusterQuotaList,  } = this.props
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
                }
              },
              isAsync: true,
            })
            getGlobaleQuotaList({}, {
              success: {
                func: result => {
                  this.setState({ usedResource: result.data[resourceType] })
                },
              },
              isAsync: true,
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
                }
              },
              isAsync: true,
            })
            getClusterQuotaList(query, {
              success: {
                func: result => {
                  this.setState({ usedResource: result.data[resourceType] })
                }
              },
              isAsync: true,
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
  render () {
    const { clusterName, resourceType, clusterID, getResourceDefinition,role,projectText, projectId, projectType  } = this.props
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
    return(
      <QueueAnim>
        {
          setResource !== undefined && projectId !== undefined?
          <div className="ResourceBanner" key="ResourceBanner">
            <div>{`${projectText}项目在${clusterName}中${resourceName}配额使用情况`}</div>
          <div className="progress">
            <Progress percent={percent} strokeWidth={5} status="active" showInfo={false}/>
          </div>
          <div>{`${usedResource}/${setResource === null ? '无限制' : setResource }`}</div>
          {
            (role === ROLE_SYS_ADMIN || role === ROLE_PLATFORM_ADMIN) ?
            <div><Link to={link}><Icon type="plus" />编辑配额</Link></div> :
            <div><Link to={`/tenant_manage/applyLimit`}><Icon type="plus" />申请增加配额</Link></div>
          }
          </div> : null
        }
      </QueueAnim>

    )
  }
}
