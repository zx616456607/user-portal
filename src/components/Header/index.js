/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Header component
 *
 * v0.1 - 2016-09-06
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Icon, Badge, Modal, Menu, Dropdown } from 'antd'
import { browserHistory } from 'react-router'
import "./style/header.less"
import PopSelect from '../PopSelect'
import { connect } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import { getProjectVisibleClusters, ListProjects } from '../../actions/project'
import { getStorageClassType } from '../../actions/storage'
import { setCurrent, loadLoginUserDetail } from '../../actions/entities'
import { checkVersion } from '../../actions/version'
import {
  getCookie, isEmptyObject, getVersion, getPortalRealMode, toQuerystring,
  setCookie,
} from '../../common/tools'
import {
  USER_CURRENT_CONFIG, ROLE_SYS_ADMIN,ROLE_PLATFORM_ADMIN, INTL_COOKIE_NAME,
} from '../../../constants'
import { MY_SPACE, SESSION_STORAGE_TENX_HIDE_DOT_KEY, LITE, API_URL_PREFIX } from '../../constants'
import { Link } from 'react-router'
import NotificationHandler from '../../components/Notification'
import UserPanel from './UserPanel'
import backOldBtn from '../../assets/img/headerBackOldArrow.png'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessages from './Intl'
import AppIntlMessages from '../../containers/App/Intl'
import { getDeepValue } from '../../../client/util/util'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
const standardFlag = standard === mode
const SubMenu = Menu.SubMenu
let reLocationPath = ''

// The following routes RegExp will show select space or select cluster
export const SPACE_CLUSTER_PATHNAME_MAP = {
  space: [
    /^\/$/,
    /\/app_manage/,
    /\/database_cache/,
    /^\/app_center\/?$/,
    /\/app_center\/stack_center/,
    /\/app_center\/wrap_manage/,
    /\/ci_cd/,
    /\/manange_monitor\/alarm_record/, //  告警记录去掉上方导航的"项目"
    /\/manange_monitor\/alarm_setting\/resource/, // 告警设置去掉上方导航的"项目"
    /\/manange_monitor\/alarm_setting\/log/,
    /\/manange_monitor\/alarm_group/,
    /\/manange_monitor\/panel/,
    /\/app_center\/template/,
    /\/ai\-deep\-learning\/?/,
    /\/app_center\/projects/,
    /\/app_center\/wrap_store/,
    /\/middleware_center\/app\/config/,
    /\/middleware_center\/deploy/,
    /\/middleware_center\/deploy\/detail\/?$/,
    /\/account\/noticeGroup/,
    /\/app\-stack\//,
    /\/net\-management/,
    /\/storage\-management/,
    /\/app\-stack\-pro\/?$/,
    /\/app\-stack\-pro\/templates/,
    /\/app\-stack\-pro\/designer/,
  ],
  cluster: [
    /^\/$/,
    /\/app_manage/,
    /\/database_cache/,
    /\/manange_monitor\/alarm_record/,
    /\/manange_monitor\/alarm_setting\/resource\/?$/,
    /\/manange_monitor\/alarm_setting\/log\/?$/,
    /\/manange_monitor\/panel/,
    /\/app_center\/template\/create/,
    /\/ai\-deep\-learning\/?/,
    /\/app_center\/projects/,
    /\/app_center\/wrap_store/,
    /\/middleware_center\/app\/config/,
    /\/middleware_center\/deploy/,
    /\/middleware_center\/deploy\/detail\/?$/,
    /\/app\-stack\//,
    /\/net\-management/,
    /\/storage\-management/,
    /\/app\-stack\-pro\/?$/,
  ],
  loadProjectAndClusterNeeded: [
    /\/overView/,
    /^\/manange_monitor\/query_log$/,
    /\/manange_monitor\/audit/,
    /\/account\/costCenter/,
  ],
  isReturn: [
    /\/work-order/,
  ]
}

async function loadProjects(props, callback) {
  const { ListProjects, loginUser } = props
  return await ListProjects({ size: 0 }, callback)
}

function getHideDot() {
  if (!sessionStorage) {
    return false
  }
  if (!sessionStorage[SESSION_STORAGE_TENX_HIDE_DOT_KEY]) {
    return false
  }
  return true
}

function setHideDot() {
  if (!sessionStorage) {
    return false
  }
  sessionStorage.setItem(SESSION_STORAGE_TENX_HIDE_DOT_KEY, Date.now())
}

class Header extends Component {
  constructor(props) {
    super(props)
    this._checkLiteVersion = this._checkLiteVersion.bind(this)
    this.handleProjectChange = this.handleProjectChange.bind(this)
    this.handleClusterChange = this.handleClusterChange.bind(this)
    this.showUpgradeVersionModal = this.showUpgradeVersionModal.bind(this)
    this.renderCheckVersionContent = this.renderCheckVersionContent.bind(this)
    this.handleDocVisible = this.handleDocVisible.bind(this)
    this.handleSpaceVisibleChange = this.handleSpaceVisibleChange.bind(this)
    this.loadStorageClassType = this.loadStorageClassType.bind(this)
    this.state = {
      spacesVisible: false,
      clustersVisible: false,
      focus: false,
      version: getVersion(),
      type: getPortalRealMode(),
      checkVersionErr: null,
      hideDot: getHideDot(),
      upgradeVersionModalVisible: false,
      visible: false,
      collapseDefaultActiveKey: null,
    }
    const { formatMessage } = this.props.intl
    this.team = mode === standard ? '团队' : formatMessage(IntlMessages.project)
    this.zone = mode === standard ? '区域' : formatMessage(IntlMessages.cluster)
    this.selectTeam = mode === standard ? '选择团队' : formatMessage(IntlMessages.selectProject)
    this.selectZone = mode === standard ? '选择区域' : formatMessage(IntlMessages.selectCluster)
    this.isSysAdmin = props.loginUser.role === ROLE_SYS_ADMIN || props.loginUser.role === ROLE_PLATFORM_ADMIN
    this.locale = getCookie(INTL_COOKIE_NAME)
  }

  handleDocVisible(){
    const { visible } = this.state
    this.setState({
      visible: !visible
    })
  }

  _checkLiteVersion() {
    const { checkVersion } = this.props
    const { version, type } = this.state
    if (type !== LITE) {
      return
    }
    checkVersion({version, type}, {
      failed: {
        func: (err) => {
          this.setState({
            checkVersionErr: err,
          })
        }
      }
    })
  }

  loadStorageClassType(cluster){
    if(!cluster){
      return
    }
    const { getStorageClassType, setCurrent } = this.props
    const defalutStorageCLassType = {
      private: false,
      share: false,
      host: false,
    }
    Object.assign(cluster, { storageClassType: defalutStorageCLassType })
    setCurrent({
      cluster,
    })
    const { clusterID } = cluster
    if (!clusterID || clusterID === 'undefined') {
      return
    }
    getStorageClassType(clusterID, {
      success: {
        func: res => {
          Object.assign(cluster,{ storageClassType: res.data})
          setCurrent({
            cluster,
          })
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          setCurrent({
            cluster,
          })
        },
        isAsync: true,
      }
    })
  }

  handleProjectChange(project, showClusterControl) {
    const { getProjectVisibleClusters, setCurrent, current, showCluster } = this.props
    let notification = new NotificationHandler()
    // sys admin select the user list
    /* if (project.userName) {
      project.projectName = 'default'
    } */
    this.setState({
      spacesVisible: false,
      clustersVisible: true,
    })
    const { formatMessage } = this.props.intl
    getProjectVisibleClusters(project.projectName, {
      success: {
        func: clustersRes => {
          let { clusters } = clustersRes.data
          // clusters = clusters.map(cluster => cluster.cluster || cluster)
          clusters = clusters.map(cluster => {
            if (cluster.cluster) {
              cluster = cluster.cluster
            }
            cluster.name = cluster.clusterName
            return cluster
          })
          if (!clusters || clusters.length < 1) {
            /* const msg = formatMessage(IntlMessages.emptyClustersTip, {
              project: this.team,
              projectName: project.projectName,
              cluster: this.zone,
            })
            notification.warn(msg)
            this.setState({
              spacesVisible: true,
              clustersVisible: false,
            }) */
            // notification.warn('项目暂无授权的集群，请先申请『授权集群』或选择其他项目')
            project.noClustersFlag = true
            setCurrent({
              space: project,
              cluster: {},
            })
            this.setState({
              spacesVisible: false,
              clustersVisible: false,
            })
            return
          }
          // select first cluster by default
          let firstCluster = clusters[0]
          if (firstCluster.cluster) {
            firstCluster = firstCluster.cluster
          }
          firstCluster.namespace = project.namespace
          setCurrent({
            team: { teamID: project.userName },
            space: project,
            cluster: firstCluster,//切换之后默认选中第一个集群
          })
          // get storageClassType
          this.loadStorageClassType(firstCluster)
          this.props.setSwitchSpaceOrCluster()
          let isShowCluster = !!showCluster
          if (clusters.length === 1) {
            isShowCluster = false
          }
          if (showClusterControl !== undefined) {
            isShowCluster = showClusterControl
          }
          this.setState({
            spacesVisible: false,
            clustersVisible: isShowCluster,
          })
        },
        isAsync: true
      }
    })
  }

  handleClusterChange(cluster) {
    this.setState({
      clustersVisible: false,
    })
    const { setCurrent, current } = this.props
    if (current.cluster.namespace === current.space.namespace
      && cluster.clusterID === current.cluster.clusterID) {
      return
    }
    const { formatMessage } = this.props.intl
    cluster.namespace = current.space.namespace
    // get  storageType
    this.loadStorageClassType(cluster)
    this.props.setSwitchSpaceOrCluster()
    let msg = `${this.zone} ${formatMessage(IntlMessages.switchSuccessfully)} [${cluster.clusterName}]`
    if (current.cluster.namespace !== current.space.namespace) {
      const teamName = current.space.userName ||current.space. name || current.space.namespace
      msg = `${this.team} ${formatMessage(IntlMessages.switchSuccessfully)} [${teamName}]，${msg}`
    }
    let notification = new NotificationHandler()
    notification.success(msg)
  }

  componentWillMount() {
    window._reselect_current_project_cluster = () => this.componentDidMount()
  }

  async componentDidMount() {
    this._checkLiteVersion()
    const notification = new NotificationHandler()
    const {
      setCurrent,
      loadLoginUserDetail,
      loginUser,
      getProjectVisibleClusters,
    } = this.props
    const { formatMessage } = this.props.intl
    const config = getCookie(USER_CURRENT_CONFIG) || ''
    const [ username, namespace, clusterID ] = config.split(',')
    const projectsRes = await loadProjects(this.props, { failed: {} }) || {}
    if (projectsRes.error) {
      notification.warn(formatMessage(IntlMessages.loadProjectsFailedTip))
      return
    }
    const projects = getDeepValue(projectsRes, [ 'response', 'result', 'data', 'projects' ]) || []
    let defaultProject = projects[0]
    projects.map(project => {
      if (project.namespace === namespace) {
        defaultProject = project
      }
    })
    if (!defaultProject) {
      notification.warn(formatMessage(AppIntlMessages.noProjetsTip))
      // browserHistory.push('/tenant_manage/project_manage')
      setCurrent({
        space: { noProjectsFlag: true },
      })
      return
    }
    setCurrent({
      space: defaultProject
    })
    const clustersRes = await getProjectVisibleClusters(defaultProject.projectName, { failed: {} }) || {}
    if (clustersRes.error) {
      notification.warn(formatMessage(IntlMessages.loadClustersFailedTip))
      return
    }
    const clusters = getDeepValue(clustersRes, [ 'response', 'result', 'data', 'clusters' ]) || []
    let defaultCluster = clusters[0]
    clusters.map(cluster => {
      if (cluster.clusterID === clusterID) {
        defaultCluster = cluster
      }
    })
    if (!defaultCluster) {
      // notification.warn(formatMessage(AppIntlMessages.noClustersTip))
      // browserHistory.push(`/tenant_manage/project_manage/project_detail?name=${defaultProject.projectName}`)
      defaultProject.noClustersFlag = true
      setCurrent({
        space: defaultProject,
      })
      return
    }
    this.loadStorageClassType(defaultCluster)
  }

  showUpgradeVersionModal() {
    this.setState(({
      upgradeVersionModalVisible: true,
      hideDot: true,
    }))
    this._checkLiteVersion()
    setHideDot()
  }

  // 公有云部分，不做国际化
  renderCheckVersionContent() {
    const { checkVersionContent, isCheckVersion } = this.props
    const { checkVersionErr } = this.state
    if (isCheckVersion) {
      return (
        <div>
          <Icon type="loading" /> 努力检查新版本中...
        </div>
      )
    }
    if (!isEmptyObject(checkVersionContent)) {
      const { isLatest, latestVerion, link } = checkVersionContent
      if (isLatest) {
        return <div><Icon type="smile" /> 当前已是最新版本</div>
      }
      return (
        <div>
          <Icon type="meh" /> 发现新版本 {latestVerion}，点击&nbsp;
          <a href={link} target="_blank">{link}</a> 查看详情
        </div>
      )
    }
    if (!checkVersionErr) {
      return
    }
    const { message, statusCode } = checkVersionErr
    if (statusCode >= 500) {
      return (
        <div>
          <Icon type="frown" /> 网络不可用，请稍后重试
        </div>
      )
    }
    return (
      <div>
        <Icon type="frown" /> 获取版本信息失败，请&nbsp;
        <a onClick={this._checkLiteVersion}>点击重试</a>
      </div>
    )
  }

  handleSpaceVisibleChange(visible) {
    this.setState({
      spacesVisible: visible
    })
    if (visible) {
      loadProjects(this.props)
    }
  }

  changeLang(lang) {
    setCookie(INTL_COOKIE_NAME, lang)
    location.reload()
  }

  render() {
    const {
      current,
      loginUser,
      migrated,
      showSpace,
      showCluster,
      showReturn,
      pathname,
      checkVersionContent,
      projects,
      isProjectsFetching,
      projectClusters,
      isProjectClustersFetching,
    } = this.props
    const {
      spacesVisible,
      clustersVisible,
      upgradeVersionModalVisible,
      type,
      hideDot,
      visible,
      collapseDefaultActiveKey,
    } = this.state
    const msaUrl = loginUser.msaConfig && loginUser.msaConfig.url
    const { isLatest } = checkVersionContent
    var host = window.location.hostname
    var protocol = window.location.protocol
    var docUrl = protocol + '//' + host + ":9004"
    var faqUrl = docUrl + '/faq'
    const rotate = visible ? 'rotate180' : 'rotate0'
    let selectValue = mode === standard
      ? current.space.name
      : (current.space.name || current.space.userName)
    let Search = true
    const namespace = getDeepValue(current, ['space', 'namespace'])
    const clusterID = getDeepValue(current, ['cluster', 'clusterID'])
    // const content = (
    //   <div className='container'>
    //     {
    //       type === LITE &&
    //       <div>
    //         {/* <div className='item'><a href="http://docs.tenxcloud.com" target="_blank">文档中心</a></div> */}
    //         {/* <div className='item'><a href="http://docs.tenxcloud.com/faq" target="_blank">常见问题</a></div> */}
    //       </div>
    //     }
    //     {
    //       standardFlag &&
    //       <div>
    //         {/* <div className='item'><a href="http://docs.tenxcloud.com" target="_blank">文档中心</a></div> */}
    //         {/* <div className='item'><a href="http://docs.tenxcloud.com/faq" target="_blank">常见问题</a></div> */}
    //       </div>
    //     }
    //     {
    //       type !== LITE && !standardFlag &&
    //       <div>
    //         <div className='item'><a href={docUrl} target="_blank">文档中心</a></div>
    //         <div className='item'><a href={faqUrl} target="_blank">常见问题</a></div>
    //       </div>
    //     }
    //     <div className='item'><a href="https://api-doc.tenxcloud.com/" target="_blank">API文档</a></div>
    //   </div>
    // );
    const roleShowSpace = loginUser.role == ROLE_SYS_ADMIN || loginUser.role == ROLE_PLATFORM_ADMIN
    if(pathname.indexOf('work-order') > -1 ) {
      !!!reLocationPath ? reLocationPath = '/' : ''
    } else {
      reLocationPath = pathname
    }
    return (
      <div id="header">
        {
          false && showReturn && (
            <div className="returnBtn">
              <span className="goBackBtn pointer" onClick={() => browserHistory.push({
                pathname: reLocationPath,
              })}>返回控制台</span>
            </div>
          )
        }
        {
          showSpace && (
            <div className="space">
              <div className="spaceTxt">
                <TenxIcon type="cube"className='headercluster'/>
                <span style={{ marginLeft: 15 }}>{this.team}</span>
                </div>
                <div className="spaceBtn">
                  <PopSelect
                    isSysAdmin={this.isSysAdmin}
                    Search={Search}
                    title={this.selectTeam}
                    btnStyle={false}
                    special={true}
                    visible={spacesVisible}
                    list={projects}
                    loading={isProjectsFetching}
                    onChange={this.handleProjectChange}
                    selectValue={selectValue || '...'}
                    popTeamSelect={mode === standard}
                    onVisibleChange={this.handleSpaceVisibleChange}
                    collapseDefaultActiveKey={collapseDefaultActiveKey}
                  />
                </div>
            </div>
          )
        }
        {
          showCluster && (
            <div className="cluster">
              <div className="clusterTxt">
                <TenxIcon type="cluster" className='headercluster'/>
                <span style={{ marginLeft: 20 }}>{this.zone}</span>
              </div>
              <div className="envirBox">
                <PopSelect
                  title={this.selectZone}
                  btnStyle={false}
                  visible={clustersVisible}
                  list={projectClusters}
                  loading={isProjectClustersFetching}
                  onChange={this.handleClusterChange}
                  selectValue={current.cluster.clusterName || '...'}
                />
              </div>
            </div>
          )
        }
        <div className="rightBox">
        {/*
          standardFlag && migrated === 1 &&
          <a href='https://console.tenxcloud.com' target='_blank'>
            <div className='backVersion'>
              <div className='imgBox'>
                <img src={backOldBtn} />
              </div>
              <span className='backText'>返回旧版</span>
            </div>
          </a>
        */}
          {
            false && msaUrl && (
              <div className="docBtn quickentry">
                <Badge dot>
                  <Link to={`/work-order`}>
                    <a>工单</a>
                  </Link>
                </Badge>
              </div>
            )
          }
          {
            msaUrl && (
              <div className="docBtn quickentry">
                <a target="_blank"
                href={`${API_URL_PREFIX}/jwt-auth?${toQuerystring({
                  redirect: msaUrl,
                  userquery: encodeURIComponent(`redirectNamespace=${namespace}&redirectclusterID=${clusterID}`)
                   })}`}>
                  <FormattedMessage {...IntlMessages.msaPortal} />
                </a>
              </div>
            )
          }
          {/* <div className="docBtn quickentry border">
            <Link to={`/quickentry`}>
              <svg className='rocket'>
                <use xlinkHref='#rocket' />
              </svg>
              <span className='text'>快速入口</span>
            </Link>
          </div> */}
          {/* <div className="docBtn border">
            <Popover
              content={content}
              trigger="click"
              overlayClassName="helpdoc"
              placement="bottom"
              onVisibleChange={this.handleDocVisible}
            >
              <div className='doc'><Icon type="file-text" className='docicon'/>帮助文档<Icon type="down" className={rotate} style={{marginLeft:'4px'}}/></div>
            </Popover>
          </div> */}
          {
            // 公有云部分，不做国际化
            type === LITE &&
            <div className='upgradeVersion' onClick={this.showUpgradeVersionModal}>
              <div className='imgBox'>
                <img src={backOldBtn} />
              </div>
              <span className='backText'>
                <Badge dot={!hideDot && isLatest === false}>升级版本</Badge>
              </span>
            </div>
          }
          <Dropdown
            overlay={
              <Menu mode="horizontal" onClick={ ({ key }) => this.changeLang(key) }>
                <Menu.Item key={this.locale === 'zh' ? 'en' : 'zh'}>
                  { this.locale === 'zh' ? 'English' : '简体中文' }
                </Menu.Item>
              </Menu>
            }
            trigger={[ 'click' ]}
          >
            <div className="docBtn langSwitch border">
              { this.locale === 'zh' ? '中文' : 'EN' }
            </div>
          </Dropdown>
          <UserPanel loginUser={loginUser}/>
          {/* 公有云部分，不做国际化 */}
          <Modal
            title='升级版本'
            className='upgradeVersionModal'
            visible={upgradeVersionModalVisible}
            onOk={() => this.setState({upgradeVersionModalVisible: false})}
            onCancel={() => this.setState({upgradeVersionModalVisible: false})}>
            {this.renderCheckVersionContent()}
          </Modal>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { pathname } = props
  const { current, loginUser } = state.entities
  const { checkVersion } = state.version
  const { projectList, projectVisibleClusters } = state.projectAuthority
  let showSpace = false
  let showCluster = false
  let showReturn = false
  SPACE_CLUSTER_PATHNAME_MAP.space.every(path => {
    if (pathname.search(path) == 0) {
      showSpace = true
      return false
    }
    return true
  })
  SPACE_CLUSTER_PATHNAME_MAP.cluster.every(path => {
    if (pathname.search(path) == 0) {
      showCluster = true
      return false
    }
    return true
  })
  SPACE_CLUSTER_PATHNAME_MAP.isReturn.every(path => {
    if (pathname.search(path) == 0) {
      showReturn = true
      return false
    }
    return true
  })
  const projects = projectList.data || []
  const currentNamespace = current.space.namespace
  const currentProjectClusterList = projectVisibleClusters[currentNamespace] || {}
  const projectClusters = currentProjectClusterList.data || []
  return {
    current,
    loginUser: loginUser.info,
    migrated: loginUser.info.migrated || 0,
    isProjectsFetching: projectList.isFetching,
    projects,
    isProjectClustersFetching: currentProjectClusterList.isFetching,
    projectClusters,
    showSpace,
    showCluster,
    showReturn,
    checkVersionContent: checkVersion.data,
    isCheckVersion: checkVersion.isFetching,
  }
}

export default injectIntl(connect(mapStateToProps, {
  setCurrent,
  loadLoginUserDetail,
  checkVersion,
  ListProjects,
  getProjectVisibleClusters,
  getStorageClassType,
})(Header), {
  withRef: true,
})
