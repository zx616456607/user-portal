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
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { getClusterQuota, getClusterQuotaList, getGlobaleQuota, getGlobaleQuotaList, getResourceDefinition, getDevopsGlobaleQuotaList } from '../../../actions/quota'
import './style/index.less'
import _ from 'lodash'
import QueueAnim from 'rc-queue-anim'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN } from '../../../../constants'
import { toQuerystring } from '../../../../src/common/tools'
import { injectIntl, FormattedMessage } from 'react-intl'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../../AppModule/ServiceIntl'
import CommonIntlMessages from '../../../containers/CommonIntl'
import { STORAGE_BEFORE_EXPORT_FILE_FAILURE } from '../../../actions/storage';

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
  const { formatMessage } = window._intl
  const myProject = formatMessage(CommonIntlMessages.myProject)
  const { name, spaceName, userName, projectName, displayName, userID } = space
  if ( name === myProject) { //我的个人项目
    return { projectText: myProject, projectId: 'default', projectType: 1 } // projectType: 1: 我的个人项目
  }
  if ( userName ) { //个人项目
    return {  projectText: userName, projectId: userID, projectType: 2  } // projectType: 1: 个人项目
  }
  if (projectName) { //共享项目
    return { projectText: `(${displayName})${projectName}`, projectId: projectName, projectType: 3 } // projectType: 3: 共享项目项目
  }
}

// 根据space写出跳转到项目申请页的query
const formateQuery = ({ space: { displayName, namespace },  resourceType, clusterID}) => {
  // console.log('resourceType', resourceType)
  // console.log('clusterID', clusterID)
  let showDisplayName = {
    resourceType, clusterID,
  }
  if (namespace == 'default') {
    showDisplayName.displayName = undefined
    showDisplayName.namespace =  <FormattedMessage {...AppServiceDetailIntl.myPersonalItem}/>
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
  const { resourceType } = props
  // 增加resourceTypeArray字段, 作用是归一化resourceType字段
  // 当resourceType字段为字符串的情况也转化为数组的情况
  const resourceTypeArray = typeof resourceType === 'string' ? [resourceType] : resourceType
  return {clusterName, namespace, clusterID, role, ...(judgeProjectType(space)),
     showDisplayName: formateQuery({space, resourceType, clusterID}), flagManager,
     resourceTypeArray}
}
@connect(mapStateToProps, { getResourceDefinition, getClusterQuota, getClusterQuotaList,
  getGlobaleQuota, getGlobaleQuotaList, getDevopsGlobaleQuotaList })
class ResourceBanner extends React.Component {
  state = {
    LastResourceInfoList: [], // 用于渲染的信息
    resourceflay: 0, //零为全局资源, 1为集群资源
  }
  static propTypes = {
    // 资源类型
    resourceType: PropTypes.string.isRequired || PropTypes.array.isRequired,
  }
  timer = null
  reload =async () => {
    const {getResourceDefinition, resourceType, clusterID, getGlobaleQuota, getGlobaleQuotaList,
      getClusterQuota, getClusterQuotaList, getDevopsGlobaleQuotaList  } = this.props
    const [ ResourceDefinitionResult, GlobaleQuotaResult, ClusterQuotaResult ] =
     await Promise.all([ getResourceDefinition(), getGlobaleQuota({}), getClusterQuota({id: clusterID}) ])
    const { response: { result: { data:{ definitions } = {} } = {} } = {} } = ResourceDefinitionResult
    const { response: { result:{ data: GlobaleQuotaResultList } = {} } = {} } = GlobaleQuotaResult
    const { response: { result:{ data: ClusterQuotaResultList } = {} } = {} } = ClusterQuotaResult

    const ResourceInfoList = definitions.filter(({ children }) => typeof children === 'object')
      .map(({children}) => children)
      .reduce((current, next) => current.concat(next), [])
      .filter(({resourceType}) => this.props.resourceTypeArray.includes(resourceType))
    // 由于放在相同的Banner中的元素都统一是全局资源或者非全局资源, 所以只需要判断一个即可
    const resourceflay = !_.isEmpty(ResourceInfoList) && ResourceInfoList[0].clusterIndependent ? 0 : 1
    this.setState({ resourceflay })
    const resourcesString = this.props.resourceTypeArray.join(',')
    let QuotaList
    if (resourceflay === 0) QuotaList = await getGlobaleQuotaList({ resources: resourcesString })
    if (resourceflay === 1) QuotaList = await getClusterQuotaList({ id: clusterID,resources:resourcesString })
    const { response: { result: { data: NewQuotaList = {}} = {} } = {} } = QuotaList
    const LastResourceInfoList = ResourceInfoList
      .map((resourceInfo) => {
        const NewGlobaleQuotaResult = GlobaleQuotaResultList === null ? {} : GlobaleQuotaResultList
        const NewGlobaleQuotaResultOne = NewGlobaleQuotaResult[resourceInfo.resourceType] || null
        const NewClusterQuotaResult = ClusterQuotaResultList === null ? {} : ClusterQuotaResultList
        const NewClusterQuotaResultOne = NewClusterQuotaResult[resourceInfo.resourceType] || null
        return {
          ...resourceInfo,
          set: resourceInfo.clusterIndependent ? NewGlobaleQuotaResultOne : NewClusterQuotaResultOne,
          inuse: NewQuotaList[resourceInfo.resourceType]
        }
      })
    this.setState({ LastResourceInfoList })
  }
  componentDidMount = () => {
    this.reload()
    this.timer = setInterval(this.reload, 30000)
  }
  componentWillUnmount = () => {
    clearTimeout(this.timer)
  }
  render () {
    const { formatMessage } = this.props.intl
    const { clusterName, resourceType, clusterID, getResourceDefinition,role,projectText, projectId,
      projectType, showDisplayName, flagManager,} = this.props
    const { LastResourceInfoList, resourceflay } = this.state
    let { resourceName = '-', set:setResource = 0, inuse:usedResource= 0  } = LastResourceInfoList[0] || {}
    let percent = 0
    if (setResource) {
      percent = parseInt((usedResource / setResource) * 100)
    }
    if (percent > 100 || typeof percent !== 'number') { // fix LOT-1837
      percent = 100;
    }
    let link = '404'
    if (projectType === 1) { //我的个人项目
      link = `/account?${toQuerystring({ tabs: 'quota' })}`
    } else if (projectType === 2) { //个人项目
      link = `/tenant_manage/user/${projectId}?${toQuerystring({ tabs: 'quota' })}`
    } else if (projectType === 3) { // 共享项目
      link = `/tenant_manage/project_manage/project_detail?name=${projectId}&${toQuerystring({ tabs: 'quota' })}`
    }
    let flagManagerText = 'none'
    if ( flagManager ) {
      flagManagerText = 'block'
    }
    let resourceTypeText = 'none'
    if (resourceflay === 1) {
      resourceTypeText = 'inline'
    }
    return(
      <QueueAnim>
        {
          <div className="ResourceBannerWraper">
          <div className="ResourceBanner" key="ResourceBanner">
            <div>
              <span>{formatMessage(AppServiceDetailIntl.projectTextItem, { projectText })}</span>
              <span style={{ display: resourceTypeText }}>{formatMessage(AppServiceDetailIntl.inCluserName, { clusterName })}</span>
              <span>
              {formatMessage(AppServiceDetailIntl.inQuotauseCondition, { resourceName })}
              </span>
            </div>
          <div className="progress">
            <Progress percent={percent} strokeWidth={5} status="active" showInfo={false}/>
          </div>
          <div>
            {`${usedResource}/${setResource === null ? formatMessage(AppServiceDetailIntl.noLimit) : setResource }`}
            <span onClick={ this.reload } className="reload">{formatMessage(ServiceCommonIntl.refresh)}</span>
          </div>
            <div>
              {
            (role === ROLE_SYS_ADMIN || role === ROLE_PLATFORM_ADMIN) ?
            <div><Link to={link}><Icon type="plus" />{formatMessage(AppServiceDetailIntl.eidtQuota)}</Link></div> :
            <div style={{ display: flagManagerText }}><Link to={`/tenant_manage/applyLimit?${showDisplayName}`}><Icon type="plus" />{formatMessage(AppServiceDetailIntl.applyIncreaseQuota)}</Link></div>
              }
            </div>
          </div>
          <div className="moreInfo">
              {
                LastResourceInfoList.filter((_, index) => index !== 0)
                .map(({ resourceName='-',set, inuse  }) =>
                <span>{`「 ${resourceName} 」 配置: ${inuse}/${set=== null ?
                  formatMessage(AppServiceDetailIntl.noLimit) : set}`}</span>
                )
              }
          </div>
          </div>
        }
      </QueueAnim>

    )
  }
}

export default injectIntl(ResourceBanner, {withRef: true,})
