/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppSider component
 *
 * v0.1 - 2016-09-06
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, Button, Tooltip, Popover, Icon, Menu, Modal, Radio, Upload, Badge } from 'antd'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import './style/index.less'
import { beforeUploadFile, uploading, mergeUploadingIntoList, getUploadFileUlr, uploadFileOptions, getVolumeBindInfo, changeStorageDetail } from '../../../actions/storage'
import { GetProjectsApprovalClustersWithoutTypes } from '../../../actions/project'
import { checkApplyRecordWithoutTypes } from '../../../../client/actions/applyLimit'
import cloneDeep from 'lodash/cloneDeep'
import QueueAnim from 'rc-queue-anim'
import TenxIcon from '@tenx-ui/icon/es/_old'
// import NotificationHandler from '../../../components/Notification'
// import { loadUserDetail } from '../../../actions/user'
import { ROLE_USER, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN, ROLE_SYS_ADMIN  } from '../../../../constants'
import { NEED_BUILD_IMAGE, SHOW_BILLING } from '../../../constants'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessages from './Intl'
import filter from 'lodash/filter'
import { getDeepValue } from '../../../../client/util/util'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const RadioGroup = Radio.Group

function checkUrlSelectedKey(pathname) {
  //this function for check the pathname and return the selected key of menu and return the opened key of menu
  let pathList = pathname.split('/')
  if (pathList.length == 2) {
    if (pathList[1].length == 0) {
      return ['home', 'home']
    }
    return [pathList[1], pathList[1] + '_default']
  } else {
    if (pathList[1] == 'app_manage' && pathList[2] == 'app_create') {
      return [pathList[1], pathList[1] + '_default']
    }
    if (pathList[1] == 'app_manage' && pathList[2] == 'detail') {
      return [pathList[1], pathList[1] + '_default']
    }
    if (pathList[1] == 'account' && pathList[2] == 'user') {
      return [pathList[1], 'member']
    }
    if (pathList[1] == 'database_cache' && pathList[2] == 'mysql_cluster'){
      return [pathList[1], pathList[1] + '_default']
    }
    if (pathList[2] == 'coderepo') {
      return [pathList[1], pathList[1] + '_default']
    }
    if (pathList[2] == 'beginner_guidance') {
      return [pathList[1], pathList[1] + '_default']
    }
    if (pathList[2].indexOf('CID')>=0) {
      return [pathList[1], pathList[1] + '_default']
    }
    return [pathList[1], pathList[2]]
  }
}

class Sider extends Component {
  constructor(props) {
    super(props)
    this.onSelectMenu = this.onSelectMenu.bind(this)
    this.onOpenBigMenu = this.onOpenBigMenu.bind(this)
    this.onCloseBigMenu = this.onCloseBigMenu.bind(this)
    this.state = {
      currentKey: 'home',
      isUnzip: false,
      currentOpenMenu: null,
      currentSelectedMenu: null,
      isShowApprovalLimits: false,
      isShowApprovalClusters: false,
    }
  }

  componentWillMount() {
    const { pathname, role } = this.props
    let currentKey = pathname.split('/')[1]
    if (!Boolean(currentKey)) {
      currentKey = 'home'
    }
    let currentOpenMenu = checkUrlSelectedKey(pathname)
    let currentSelectedMenu = currentOpenMenu
    if (pathname.indexOf('/account/costCenter') > -1) {
      currentOpenMenu = ['account', 'costCenter#consumptions']
      currentSelectedMenu = ['account', 'costCenter#consumptions']
      if (pathname.indexOf('#') > -1) {
        currentOpenMenu = ['account', `costCenter#${pathname.split('#')[1]}`]
        currentSelectedMenu = ['account', `costCenter#${pathname.split('#')[1]}`]
      }
    }
    if (pathname.indexOf('app_center/template') > -1) {
      currentOpenMenu = ['app_center', 'app_template']
      currentSelectedMenu = currentOpenMenu
    }
    if (pathname.includes('middleware_center/app')) {
      currentOpenMenu = ['middleware_center', 'middleware_center_default']
      currentSelectedMenu = currentOpenMenu
    }
    this.setState({
      currentKey: currentKey,
      currentOpenMenu: currentOpenMenu,
      currentSelectedMenu: currentSelectedMenu
    })
    this.getPonitFunc(this.props)
  }
  getPonitFunc = props => {
    const { role } = props
    const isNeedGet = role !== ROLE_USER && role !== ROLE_BASE_ADMIN
    const { isShowClusterPoint, isShowLimitPoint } = props
    if (isNeedGet) {
      const { GetProjectsApprovalClustersWithoutTypes, checkApplyRecordWithoutTypes } = props
      !isShowClusterPoint && GetProjectsApprovalClustersWithoutTypes({
        filter: `status__neq,2,status__neq,3`,
        size: 10,
        from: 0,
        sort: `d,tenx_project_resource_ref.request_time`,
      }, {
        success: {
          func: res => {
            !!res && !!res.data && !!res.data.projects && this.setState({
              isShowApprovalClusters: filter(res.data.projects, { status: 1 }).length > 0
            })
          }
        }
      })
      !isShowLimitPoint && checkApplyRecordWithoutTypes({
        from: 0, size: 10, filter: "project_type,public,status,0"
      }, {
        success: {
          func: res => {
            !!res && !!res.data && !!res.data.records && this.setState({
              isShowApprovalLimits: filter(res.data.records, { status: 0 }).length > 0
            })
          }
        }
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { pathname } = nextProps
    const oldPathname = this.props.pathname
    if (pathname != oldPathname) {
      let currentKey = pathname.split('/')[1]
      if (!Boolean(currentKey)) {
        currentKey = 'home'
      }
      let currentOpenMenu = checkUrlSelectedKey(pathname)
      let currentSelectedMenu = currentOpenMenu
      if (pathname.indexOf('/account/costCenter') > -1) {
        currentOpenMenu = ['account', 'costCenter#consumptions']
        currentSelectedMenu = ['account', 'costCenter#consumptions']
        if (pathname.indexOf('#') > -1) {
          currentOpenMenu = ['account', `costCenter#${pathname.split('#')[1]}`]
          currentSelectedMenu = ['account', `costCenter#${pathname.split('#')[1]}`]
        }
      }
      if (pathname.indexOf('app_manage/detail/') > -1) {
        currentOpenMenu = ['app_manage','app_manage_default']
        currentSelectedMenu = currentOpenMenu
      }
      if (pathname.indexOf('app_manage/deploy_wrap') > -1) {
        currentOpenMenu = ['app_manage','app_manage_default']
        currentSelectedMenu = currentOpenMenu
      }
      if (pathname.indexOf('app_center/template') > -1) {
        currentOpenMenu = ['app_center', 'app_template']
        currentSelectedMenu = currentOpenMenu
      }
      if (pathname.includes('middleware_center/app')) {
        currentOpenMenu = ['middleware_center', 'middleware_center_default']
        currentSelectedMenu = currentOpenMenu
      }
      if (pathname.includes('/cluster/createWorkLoad')) {
        currentOpenMenu = ['cluster', 'cluster_default']
        currentSelectedMenu = currentOpenMenu
      }
      this.setState({
        currentKey: currentKey,
        currentOpenMenu: currentOpenMenu,
        currentSelectedMenu: currentSelectedMenu
      })
    }
    // this.getPonitFunc(nextProps)
  }

  handleCancel() {
    const currentOptions = cloneDeep(this.props.uploadFileOptions)
    currentOptions.visible = false
    this.props.changeUploadFileOptions(currentOptions)
  }

  selectModel(currentKey) {
    this.setState({
      currentKey: currentKey,
    })
  }

  changeRadioValue(e) {
    this.setState({
      isUnzip: e.target.value
    })
  }

  onSelectMenu(e) {
    //this function for user select the menu item and change the current key
    const { keyPath } = e
    if (keyPath.length > 1) {
      let currentKey = keyPath[1]
      this.setState({
        currentKey: currentKey,
        currentSelectedMenu: keyPath
      })
    } else {
      let currentKey = keyPath[0]
      this.setState({
        currentKey: currentKey,
        currentSelectedMenu: keyPath
      })
    }
  }

  /* getUploadData() {
    const options = this.props.uploadFileOptions
    const volumeName = options.volumeName
    const self = this
    let notification = new NotificationHandler()
    return {
      showUploadList: false,
      data: {
        isUnzip: self.state.isUnzip,
        volumeName: volumeName,
        pool: options.pool,
        cluster: options.cluster,
        backupId: self.props.beforeUploadState.backupId
      },
      beforeUpload: (file) => {
        const fileSize = file.size
        if ((fileSize / 1024 / 1024).toFixed(2) > (self.props.storageDetail.StorageInfo.size - self.props.storageDetail.StorageInfo.consumption)) {
          notification.error('超出存储卷可用大小')
          return false
        }
        self.props.uploading(0)
        file.isUnzip = self.state.isUnzip
        return new Promise(function (resolve, reject) {
          self.props.beforeUploadFile(options.pool, options.cluster, volumeName, file, {
            success: {
              isAsync: true,
              func() {
                self.props.mergeUploadingIntoList(self.props.beforeUploadState)
                const currentOptions = cloneDeep(options)
                currentOptions.uploadFile = false
                currentOptions.visible = false
                currentOptions.uploadFileStatus = 'active',
                  currentOptions.fileSize = file.size
                self.props.changeUploadFileOptions(currentOptions)
                resolve(true)
              }
            }
          })
        })
      },
      action: getUploadFileUlr(options.pool, options.cluster, volumeName),
      onChange(info) {
        if (info.event) {
          self.props.uploading(info.event.percent.toFixed(2))
        }
        if (info.file.status === 'done') {
          const fileInfo = cloneDeep(self.props.beforeUploadState)
          fileInfo.status = 'Complete'
          self.props.mergeUploadingIntoList(fileInfo)
          self.props.uploading(100)
          const currentOptions = cloneDeep(self.props.uploadFileOptions)
          currentOptions.uploadFile = true
          currentOptions.uploadFileStatus = 'success'
          self.props.changeUploadFileOptions(currentOptions)
          notification.success('文件上传成功')
          const storageInfo = cloneDeep(self.props.storageDetail.StorageInfo)
          storageInfo.consumption = parseFloat(storageInfo.consumption) + parseFloat((currentOptions.fileSize / 1024 / 1024).toFixed(2))
          self.props.changeStorageDetail(storageInfo)
        } else if (info.file.status === 'error') {
          // self.props.uploading(100)
          const currentOptions = cloneDeep(self.props.uploadFileOptions)
          currentOptions.uploadFile = true
          currentOptions.uploadFileStatus = 'exception'
          self.props.changeUploadFileOptions(currentOptions)
          const fileInfo = cloneDeep(self.props.beforeUploadState)
          fileInfo.status = 'Failure'
          self.props.mergeUploadingIntoList(fileInfo)
          notification.error('文件上传失败')
        }
      }
    }
  } */

  onOpenBigMenu(e) {
    //this function for show only one menu opened
    let currentOpenMenu = checkUrlSelectedKey(e.key + '/' + e.key)
    this.setState({
      currentOpenMenu: currentOpenMenu
    })
  }

  onCloseBigMenu(e) {
    //this function for close big menu callback
    this.setState({
      currentOpenMenu: []
    })
  }

  menuItemTip(role) {
    const { formatMessage } = this.props.intl
    switch (role) {
      case ROLE_PLATFORM_ADMIN :
        return formatMessage(IntlMessages.onlyPlatformAndAdmin)
      case ROLE_BASE_ADMIN:
        return formatMessage(IntlMessages.onlyInfraAndAdmin)
      case ROLE_USER:
        return ''
      default:
        return '管理员可见'
    }
  }
  render() {
    const { siderStyle, role,backColor,oemInfo, loginUser, intl } = this.props
    const { formatMessage } = intl
    const { currentKey, currentSelectedMenu } = this.state
    const { billingConfig = {} } = loginUser
    const { enabled: billingEnabled } = billingConfig
    const scope = this
    let isShowLimitSubPoint = this.state.isShowApprovalLimits && (
      !(currentSelectedMenu.indexOf('tenant_manage') > -1) ||
        (currentSelectedMenu.length === 1)
      )
    let isShowApprovalLimits = this.state.isShowApprovalLimits &&
    (currentSelectedMenu.length === 1 || !(currentSelectedMenu.indexOf('approvalLimit') > -1)) //非选中时

    let isShowClusterSubPoint = this.state.isShowApprovalClusters && (
      !(currentSelectedMenu.indexOf('tenant_manage') > -1) ||
        (currentSelectedMenu.length === 1)
      )
    let isShowApprovalClusters = this.state.isShowApprovalClusters &&
    (currentSelectedMenu.length === 1 || !(currentSelectedMenu.indexOf('cluster_authorization') > -1)) //非选中时
    const tenantMenu_admin = [
      <Menu.Item key='tenant_manage_default'>
        <Link to='/tenant_manage'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.tenantOverview} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key="user">
        <Link to='/tenant_manage/user'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.tenantUser} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key="team">
        <Link to='/tenant_manage/team'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.tenantTeam} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='project_manage'>
        <Link to='/tenant_manage/project_manage'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.tenantProject} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='allpermissions'>
        <Link to='/tenant_manage/allpermissions'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.tenantProjectPermossions} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='cluster_authorization'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip(ROLE_PLATFORM_ADMIN)} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to={'/tenant_manage/cluster_authorization' + ( isShowApprovalClusters ? '?link_status=1' : '')}>
            <FormattedMessage {...IntlMessages.tenantClusterAuth} />
            { isShowApprovalClusters && <span className="topRightPoint"><strong>●</strong></span> }
          </Link>
        </div>
      </Menu.Item>,
      <Menu.Item key='approvalLimit'>
      <div className="adminBox">
        <Tooltip title={this.menuItemTip(ROLE_PLATFORM_ADMIN)} placement="right">
          <TenxIcon type='star' className='star forAdmin'/>
        </Tooltip>
        <Link to={'/tenant_manage/approvalLimit' + ( isShowApprovalLimits ? '?link_status=0' : '')}>
          <FormattedMessage {...IntlMessages.tenantResourcequotaAuth} />
          { isShowApprovalLimits && <span className="topRightPoint"><strong>●</strong></span> }
        </Link>
      </div>
    </Menu.Item>,
      <Menu.Item key='ldap'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip(ROLE_PLATFORM_ADMIN)} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to='/tenant_manage/ldap'>
            <FormattedMessage {...IntlMessages.tenantLdap} />
          </Link>
        </div>
      </Menu.Item>,
    ]
    const tenantMenu_platform = tenantMenu_admin;
    const tenantMenu_base = [
      <Menu.Item key="team">
        <Link to='/tenant_manage/team'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.tenantTeam} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='project_manage'>
        <Link to='/tenant_manage/project_manage'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.tenantProject} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='allpermissions'>
        <Link to='/tenant_manage/allpermissions'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.tenantProjectPermossions} />
          </span>
        </Link>
      </Menu.Item>,
      // applyLimit
      <Menu.Item key='applyLimit'>
        {
          role === ROLE_USER?
            <div className="userBox">
              <Link to='/tenant_manage/applyLimit'>
                <span>
                  <div className='sideCircle'></div>&nbsp;
                  <FormattedMessage {...IntlMessages.tenantResourcequotaApply} />
                </span>
              </Link>
            </div>
            :
            <div className="usrBox">
              <Tooltip title='基础设施管理员、普通用户可见' placement="right">
                <TenxIcon type='star' className='star forAdmin'/>
              </Tooltip>
              <Link to='/tenant_manage/applyLimit'>
                <FormattedMessage {...IntlMessages.tenantResourcequotaApply} />
              </Link>
            </div>
        }
    </Menu.Item>,
    ]
    const tenantMenu_user = tenantMenu_base;
    const tenantMenu = (roleCode)=>{
      switch (roleCode) {
        case ROLE_SYS_ADMIN:
          return tenantMenu_admin
        case ROLE_PLATFORM_ADMIN:
          return tenantMenu_platform
        case ROLE_BASE_ADMIN:
          return tenantMenu_base
        case ROLE_USER:
          return tenantMenu_user
      }
    };
    const settingMenu_admin = [
      <Menu.Item key='version'>
        <Link to='/setting/version'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.version} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='license'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip(ROLE_PLATFORM_ADMIN)} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to='/setting/license'>
            <FormattedMessage {...IntlMessages.license} />
          </Link>
        </div>
      </Menu.Item>,
      <Menu.Item key='API'>
        <Link to='/setting/API'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.openApi} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='advancedSetting'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip()} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to='/setting/advancedSetting'>
            <FormattedMessage {...IntlMessages.advancedSetting} />
          </Link>
        </div>
      </Menu.Item>,
      <Menu.Item key='personalized'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip(ROLE_PLATFORM_ADMIN)} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to='/setting/personalized'>
            <FormattedMessage {...IntlMessages.personalized} />
          </Link>
        </div>
      </Menu.Item>,

      <Menu.Item key='cleaningTool'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip(ROLE_BASE_ADMIN)} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to='/setting/cleaningTool'>
            <FormattedMessage {...IntlMessages.cleaningTool} />
          </Link>
        </div>
      </Menu.Item>
    ]
    const settingMenu_platform = [
      <Menu.Item key='version'>
        <Link to='/setting/version'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.version} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='license'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip(ROLE_PLATFORM_ADMIN)} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to='/setting/license'>
            <FormattedMessage {...IntlMessages.license} />
          </Link>
        </div>
      </Menu.Item>,
      <Menu.Item key='API'>
        <Link to='/setting/API'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.openApi} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='advancedSetting'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip()} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to='/setting/advancedSetting'>
            <FormattedMessage {...IntlMessages.advancedSetting} />
          </Link>
        </div>
      </Menu.Item>,
      <Menu.Item key='personalized'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip(ROLE_PLATFORM_ADMIN)} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to='/setting/personalized'>
            <FormattedMessage {...IntlMessages.personalized} />
          </Link>
        </div>
      </Menu.Item>,

    ]
    const settingMenu_base = [
      <Menu.Item key='version'>
        <Link to='/setting/version'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.version} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='API'>
        <Link to='/setting/API'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.openApi} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='advancedSetting'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip()} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to='/setting/advancedSetting'>
            <FormattedMessage {...IntlMessages.advancedSetting} />
          </Link>
        </div>
      </Menu.Item>,
      <Menu.Item key='cleaningTool'>
        <div className="adminBox">
          <Tooltip title={this.menuItemTip(ROLE_BASE_ADMIN)} placement="right">
            <TenxIcon type='star' className='star forAdmin'/>
          </Tooltip>
          <Link to='/setting/cleaningTool'>
            <FormattedMessage {...IntlMessages.cleaningTool} />
          </Link>
        </div>
      </Menu.Item>
    ]
    const settingMenu_user = [
      <Menu.Item key='version'>
        <Link to='/setting/version'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.version} />
          </span>
        </Link>
      </Menu.Item>,
      <Menu.Item key='API'>
        <Link to='/setting/API'>
          <span>
            <div className='sideCircle'></div>&nbsp;
            <FormattedMessage {...IntlMessages.openApi} />
          </span>
        </Link>
      </Menu.Item>,
    ]
    const settingMenu = (roleCode)=>{
      switch (roleCode) {
        case ROLE_SYS_ADMIN:
          return settingMenu_admin
        case ROLE_PLATFORM_ADMIN:
          return settingMenu_platform
        case ROLE_BASE_ADMIN:
          return settingMenu_base
        case ROLE_USER:
          return settingMenu_user
      }
    }

    const tenantIndexPage = (roleCode)=>{
      switch (roleCode) {
        case ROLE_SYS_ADMIN:
          return '/tenant_manage'
        case ROLE_PLATFORM_ADMIN:
          return '/tenant_manage'
        case ROLE_BASE_ADMIN:
          return '/tenant_manage/team'
        case ROLE_USER:
          return '/tenant_manage/team'
      }
    }
    return (
      <div id='sider' className={`oemMenu-drek-${backColor}`}>
        {/* <Modal title='上传文件' wrapClassName='vertical-center-modal' footer=''
          visible={this.props.uploadFileOptions.visible} onCancel={() => this.handleCancel()}>
          <div className='uploadModal'>
            <RadioGroup onChange={(e) => {
              this.changeRadioValue(e)
            }} value={this.state.isUnzip}>
              <Radio key='a' value={false}>直接上传</Radio>
              <Radio key='b' value={true}>上传并解压</Radio>
            </RadioGroup>
            <p>
              <Upload {...this.getUploadData() }>
                <Button type='primary'>
                  <Icon type='upload' /> 选择文件
                </Button>
              </Upload>
            </p>
            <p>或将文件拖到这里</p>
          </div>
          <ul className='uploadhint'>
            <li>1、支持任何格式文件，大小不超过600M</li>
            <li>2、仅支持 zip 格式文件解压，导入时会覆盖存储卷内[同文件名]</li>
            <li style={{ color: 'red' }}>* 请先停止挂载该存储卷的服务再进行文件导入</li>
          </ul>
        </Modal> */}
        {siderStyle == 'mini' ? [
          <div key='miniSider' className='miniSider'>
            <ul className='siderTop'>
              <li className='logoItem'>
                <Link to='/'>
                  <img src={oemInfo.naviShrink} className="logo" />
                </Link>
              </li>
              <li onClick={()=> this.selectModel('home')}
                className={currentKey == 'home' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.overview)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/'>
                    <TenxIcon className="commonImg" type="instrument-o" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('app_manage')}
                className={currentKey == 'app_manage' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.appManage)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app_manage'>
                    <TenxIcon className="commonImg" type="apps-o" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('app_stack')}
                className={currentKey == 'app_stack' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.appStack)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app-stack'>
                    <TenxIcon className="commonImg" type="app-stack" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('net_management')}
                className={currentKey == 'net_management' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.netManagement)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/net-management'>
                    <TenxIcon className="commonImg" type="network" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('storage_management')}
                className={currentKey == 'storage_management' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.storageManagement)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/storage-management'>
                    <TenxIcon className="commonImg" type="storage-manage-o" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('app_center')}
                className={currentKey == 'app_center' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.appCenter)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app_center/template'>
                    <TenxIcon className="commonImg" type="center-o" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('ci_cd')}
                className={currentKey == 'ci_cd' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='CI/CD'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/ci_cd/overview'>
                    <TenxIcon className="commonImg" type="lift-card-o" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('middleware_center')}
                  className={currentKey == 'middleware_center' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={intl.formatMessage(IntlMessages.middlewareCenter)}
                         getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/middleware_center/app'>
                    <TenxIcon className="commonImg" type="middleware"/>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('database_cache')}
                className={currentKey == 'database_cache' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.databaseCache)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/database_cache/mysql_cluster'>
                    <TenxIcon className="commonImg" type="database-o" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('ai-deep-learning')}
                className={currentKey == 'ai-deep-learning' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.aiDeepLearning)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/ai-deep-learning/notebook'>
                    <TenxIcon className="commonImg" type="ai" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('manange_monitor')}
                className={currentKey == 'manange_monitor' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.manangeMonitor)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/manange_monitor'>
                    <TenxIcon className="commonImg" type="manage-monitor" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('account')}
                className={currentKey == 'account' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.account)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/account'>
                    <TenxIcon className="commonImg" type="user-o" />
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, 'tenant_manage', '#tenant_manage')}
                className={currentKey == 'tenant_manage' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.tenant)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to={tenantIndexPage(role)}>
                    <TenxIcon className="commonImg" type="user-private" />
                    { (isShowLimitSubPoint || isShowClusterSubPoint) && <span className="topRightPoint"><strong>●</strong></span> }
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, 'setting', '#setting')}
                className={currentKey == 'setting' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title={formatMessage(IntlMessages.setting)}
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/setting'>
                    <TenxIcon className="commonImg" type="setting-o" />
                  </Link>
                </Tooltip>
              </li>
              { role !== ROLE_USER && role !==  ROLE_PLATFORM_ADMIN?
                <li onClick={() => this.selectModel('cluster')}
                    className={currentKey == 'cluster' ? 'selectedLi' : ''}>
                    <Tooltip placement='right' title={formatMessage(IntlMessages.cluster)}
                      getTooltipContainer={() => document.getElementById('siderTooltip')}>
                      <Link to='/cluster'>
                        <TenxIcon className="commonImg" type="infrastructure" />
                      </Link>
                    </Tooltip>
                  </li>
                 : null
              }
              {/* role !== ROLE_USER && role !== ROLE_PLATFORM_ADMIN ?
                <li onClick={() => this.selectModel('backup')}
                    className={currentKey == '.' ? 'selectedLi' : ''}>
                    <Tooltip placement='right' title='平台数据备份'
                      getTooltipContainer={() => document.getElementById('siderTooltip')}>
                      <Link
                        onClick={() => {
                          try {
                            browserHistory.push('/backup')
                            if (window.monitorPortalHistory) {
                              window.monitorPortalHistory.replace('/backup')
                            }
                          } catch (error) {
                            //
                          }
                        }}
                      >
                        <TenxIcon type="backup" className="commonImg" />
                      </Link>
                    </Tooltip>
                  </li>
                 : null */
              }
              <li style={{ clear: 'both' }}></li>
            </ul>
            {/*<ul className='siderBottom'>
             <li style={{ display: 'none' }} onClick={this.selectModel.bind(this, 'app_manage/app_create', '#addNewApp')} className={currentKey == 'app_manage/app_create' ? 'selectedLi' : ''}>
             <Tooltip placement='right' title='创建应用' getTooltipContainer={() => document.getElementById('siderTooltip')}>
             <Link to='/app_manage/app_create'>
             <svg className='add commonImg'>
             { currentKey == 'app_manage/app_create' ? [<use xlinkHref='#addselected' />] : [<use xlinkHref='#add' />] }
             </svg>
             </Link>
             </Tooltip>
             </li>
             <div style={{ clear: 'both' }}></div>
             </ul>*/}
          </div>
        ] : null}
        {siderStyle == 'bigger' ? [
          <QueueAnim type='left' className='siderBiggerBox'>
            <div key='siderBigger' className='siderBigger'>
              <div className='logBox'>
                <Link to='/'>
                  <img className='logo' src={oemInfo.naviExpand} />
                </Link>
              </div>
              <Menu
                style={{ width: '100%', color: '#c4c4c4' }}
                mode='inline'
                theme='dark'
                selectedKeys={this.state.currentSelectedMenu}
                openKeys={this.state.currentOpenMenu}
                onClick={this.onSelectMenu}
                onOpen={this.onOpenBigMenu}
                onClose={this.onCloseBigMenu}
                className={`oemMenu-drek-${backColor}`}
              >
                <Menu.Item key='home'>
                  <Link to='/'>
                    <span>
                      <TenxIcon className="commonImg" type='instrument-o'/>
                      <span className='commonSiderSpan'>
                        <FormattedMessage {...IntlMessages.overview} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  </Link>
                </Menu.Item>
                <SubMenu key='app_manage'
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="apps-o" />
                      <span className='commonSiderSpan'>
                        <FormattedMessage {...IntlMessages.appManage} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='app_manage_default'>
                    <Link to='/app_manage'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.apps} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='service'>
                    <Link to='/app_manage/service'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.services} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='container'>
                    <Link to='/app_manage/container'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.containers} />
                      </span>
                    </Link>
                  </Menu.Item>
                  {/* <Menu.Item key='storage'>
                    <Link to='/app_manage/storage'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.storage} />
                      </span>
                    </Link>
                  </Menu.Item> */}
                  {/* <Menu.Item key='snapshot'>
                    <Link to='/app_manage/snapshot'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.snapshot} />
                      </span>
                    </Link>
                  </Menu.Item> */}
                  <Menu.Item key='configs'>
                    <Link to='/app_manage/configs'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.configs} />
                      </span>
                    </Link>
                  </Menu.Item>
                  {/* <Menu.Item key='discover'>
                    <Link to='/app_manage/discover'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.discover} />
                      </span>
                    </Link>
                  </Menu.Item> */}
                  {/* <Menu.Item key='security_group'>
                    <Link to='/app_manage/security_group'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.securityGroup} />
                      </span>
                    </Link>
                  </Menu.Item> */}
                  {/* <Menu.Item key='load_balance'>
                    <Link to='/app_manage/load_balance'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.loadBalance} />
                      </span>
                    </Link>
                  </Menu.Item> */}
                  <Menu.Item key='auto_scale'>
                    <Link to='/app_manage/auto_scale'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.autoScale} />
                      </span>
                    </Link>
                  </Menu.Item>
                  {
                    (this.props.loginUser.vmWrapConfig && this.props.loginUser.vmWrapConfig.enabled)
                    ? [
                      <Menu.Item key='vm_wrap'>
                        <Link to='/app_manage/vm_wrap'>
                          <span>
                            <div className='sideCircle'></div>&nbsp;
                            <FormattedMessage {...IntlMessages.vmWrap} />
                          </span>
                        </Link>
                      </Menu.Item>,
                      <Menu.Item key='vm_list'>
                        <Link to='/app_manage/vm_list'>
                          <span>
                            <div className='sideCircle'></div>&nbsp;
                            <FormattedMessage {...IntlMessages.vmList} />
                          </span>
                        </Link>
                      </Menu.Item>
                    ]
                    : <Menu.Item key="none-footer" style={{ display: 'none' }}></Menu.Item>
                  }
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key="app-stack"
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="app-stack" />
                      <span className='commonSiderSpan'>
                      <FormattedMessage {...IntlMessages.appStack} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                 <Menu.Item key='Deployment'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/app-stack/Deployment')
                          if (window.appStackPortalHistory) {
                            window.appStackPortalHistory.replace('/Deployment')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        Deployment
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='StatefulSet'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/app-stack/StatefulSet')
                          if (window.appStackPortalHistory) {
                            window.appStackPortalHistory.replace('/StatefulSet')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        StatefulSet
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='Job'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/app-stack/Job')
                          if (window.appStackPortalHistory) {
                            window.appStackPortalHistory.replace('/Job')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        Job
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='CronJob'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/app-stack/CronJob')
                          if (window.appStackPortalHistory) {
                            window.appStackPortalHistory.replace('/CronJob')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        CronJob
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='Pod'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/app-stack/Pod')
                          if (window.appStackPortalHistory) {
                            window.appStackPortalHistory.replace('/Pod')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        Pod
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='Design'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/app-stack/Design')
                          if (window.appStackPortalHistory) {
                            window.appStackPortalHistory.replace('/app-stack')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.AppStackDesign} />
                        <sup>Beta</sup>
                      </span>
                    </Link>
                  </Menu.Item>

                  <div className='sline'></div>
                </SubMenu>

                <SubMenu key="net-management"
                  title={
                    <span>
                      {/* <TenxIcon className="commonImg" type="net-management" /> */}
                      {/* TODO: ICON 设计还没出好 */}
                      <TenxIcon className="commonImg" type="network" />
                      <span className='commonSiderSpan'>
                      <FormattedMessage {...IntlMessages.netManagement} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='Service'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/net-management/Service')
                          if (window.appStackPortalHistory) {
                            window.appStackPortalHistory.replace('/Service')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.discover} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='appLoadBalance'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/net-management/appLoadBalance')
                          // if (window.appStackPortalHistory) {
                          //   window.appStackPortalHistory.replace('/app-stack/Job')
                          // }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.loadBalance} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='dnsRecord'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/net-management/dnsRecord')
                          // if (window.appStackPortalHistory) {
                          //   window.appStackPortalHistory.replace('/app-stack/CronJob')
                          // }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.dnsRecord} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='securityGroup'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/net-management/securityGroup')
                          // if (window.appStackPortalHistory) {
                          //   window.appStackPortalHistory.replace('/app-stack/CronJob')
                          // }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.securityGroup} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <div className='sline'></div>
                </SubMenu>

                <SubMenu key="storage-management"
                  title={
                    <span>
                      {/* <TenxIcon className="commonImg" type="storage-management" /> */}
                      <TenxIcon className="commonImg" type="storage-manage-o" />
                      <span className='commonSiderSpan'>
                      <FormattedMessage {...IntlMessages.storageManagement} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='privateStorage'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/storage-management/privateStorage')
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.privateStorage} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='snapshot'>
                    <Link to='/storage-management/snapshot'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.snapshot} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='shareStorage'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/storage-management/shareStorage')
                          // if (window.appStackPortalHistory) {
                          //   window.appStackPortalHistory.replace('/app-stack/Job')
                          // }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.shareStorage} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='localStorage'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/storage-management/localStorage')
                          // if (window.appStackPortalHistory) {
                          //   window.appStackPortalHistory.replace('/app-stack/CronJob')
                          // }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.localStorage} />
                      </span>
                    </Link>
                  </Menu.Item>

                  {/* <Menu.Item key='customStorage'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/storage-management/customStorage')
                          // if (window.appStackPortalHistory) {
                          //   window.appStackPortalHistory.replace('/app-stack/CronJob')
                          // }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        自定义存储
                      </span>
                    </Link>
                  </Menu.Item> */}
                  <div className='sline'></div>
                </SubMenu>

                <SubMenu key='app_center'
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="center-o" />
                      <span className='commonSiderSpan'>
                        <FormattedMessage {...IntlMessages.appCenter} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                 <Menu.Item key='app_template'>
                    <Link to='/app_center/template'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.appTemplate} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='projects'>
                    <Link to='/app_center/projects'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.imageProjects} />
                      </span>
                    </Link>
                  </Menu.Item>
                  {/*<Menu.Item key='image_store'>*/}
                    {/*<Link to='/app_center/image_store'>*/}
                      {/*<span>
                      <div className='sideCircle'></div>&nbsp;
                      应用商店</s
                    pan>*/}
                    {/*</Link>*/}
                  {/*</Menu.Item>*/}
                  <Menu.Item key='wrap_manage'>
                    <Link to='/app_center/wrap_manage'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.wrapManage} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='stack_center'>
                    <Link to='/app_center/stack_center'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.stackCenter} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='wrap_store'>
                    <Link to='/app_center/wrap_store'>
                      <span>
                        <div className='sideCircle'/>&nbsp;
                        <FormattedMessage {...IntlMessages.wrapStore} />
                      </span>
                    </Link>
                  </Menu.Item>
                  {role === ROLE_SYS_ADMIN || role === ROLE_BASE_ADMIN ?
                    <Menu.Item key='wrap_check'>
                      <div className="adminBox">
                        <Tooltip title={this.menuItemTip()} placement="right">
                          <TenxIcon type='star' className='star forAdmin'/>
                        </Tooltip>
                        <Link to='/app_center/wrap_check'>
                          {/* <span><div className='sideCircle'></div>&nbsp; </span>*/}
                          <FormattedMessage {...IntlMessages.wrapCheck} />
                        </Link>
                      </div>
                    </Menu.Item> : <Menu.Item key="none-setting" style={{ display: 'none' }}/>
                  }
                  <div className='sline'/>
                </SubMenu>
                <SubMenu key='ci_cd'
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="lift-card-o" />
                      <span className='commonSiderSpan'>CI/CD</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='overview'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/ci_cd/overview')
                          if (window.devFlowPortalHistory) {
                            window.devFlowPortalHistory.replace('/devops/pandect')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.cicdOverview} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='ci_cd_default'>
                    <Link to='/ci_cd'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.cicdCodeRepos} />
                      </span>
                    </Link>
                  </Menu.Item>
                  {NEED_BUILD_IMAGE ?
                    <Menu.Item key='build_image'>
                      <Link to='/ci_cd/build_image'>
                        <span>
                          <div className='sideCircle'></div>&nbsp;
                          <FormattedMessage {...IntlMessages.buildImage} />
                        </span>
                      </Link>
                    </Menu.Item> : <Menu.Item key='integration-none' style={{ display: 'none' }}></Menu.Item>
                  }
                  {/* <Menu.Item key='tenx_flow'>
                    <Link to='/ci_cd/tenx_flow'>
                      <span>
                      <div className='sideCircle'></div>&nbsp;
                      流水线
                    </span>
                    </Link>
                  </Menu.Item> */}
                  <Menu.Item key='pipelines'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/ci_cd/pipelines')
                          if (window.devFlowPortalHistory) {
                            window.devFlowPortalHistory.replace('/devops/pipelines')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.pipelines} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='docker_file'>
                    <Link to='/ci_cd/docker_file'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.Dockerfile} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='cached_volumes'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/ci_cd/cached_volumes')
                          if (window.devFlowPortalHistory) {
                            window.devFlowPortalHistory.replace('/devops/volumes/rbd')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.cachedVolumes} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='thirdparty'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/ci_cd/thirdparty')
                          if (window.devFlowPortalHistory) {
                            window.devFlowPortalHistory.replace('/devops/thirdparty')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.thirdparty} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key="middleware_center"
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="middleware"/>
                      <span className="commonSiderSpan">
                        {intl.formatMessage(IntlMessages.middlewareCenter)}
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='middleware_center_default'>
                    <Link to='/middleware_center/app'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.apps} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='deploy'>
                    <Link to='/middleware_center/deploy'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.deployManage} />
                      </span>
                    </Link>
                  </Menu.Item>
                </SubMenu>
                <SubMenu key='database_cache'
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="database-o" />
                      <span className='commonSiderSpan'>
                        <FormattedMessage {...IntlMessages.databaseCache} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='database_cache_default'>
                    <Link to='/database_cache/mysql_cluster'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.mysqlCluster} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='redis_cluster'>
                    <Link to='/database_cache/redis_cluster'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.redisCluster} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='zookeeper_cluster'>
                    <Link to='/database_cache/zookeeper_cluster'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.zookeeperCluster} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='elasticsearch_cluster'>
                  <Link to='/database_cache/elasticsearch_cluster'>
                    <span>
                      <div className='sideCircle'></div>&nbsp;
                      <FormattedMessage {...IntlMessages.elasticsearchCluster} />
                    </span>
                  </Link>
                </Menu.Item>

                {/* <Menu.Item key='etcd_cluster'>
                  <Link to='/database_cache/etcd_cluster'>
                    <span>
                    <div className='sideCircle'></div>&nbsp;
                    Etcd集群
                  </span>
                  </Link>
                </Menu.Item> */}

                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key="ai-deep-learning"
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="ai" />
                      <span className='commonSiderSpan'>
                        <FormattedMessage {...IntlMessages.aiDeepLearning} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='notebook'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/ai-deep-learning/notebook')
                          if (window.aiPortalHistory) {
                            window.aiPortalHistory.replace('/ai-deep-learning/notebook')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.Notebook} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='large-scale-train'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/ai-deep-learning/large-scale-train')
                          if (window.aiPortalHistory) {
                            window.aiPortalHistory.replace('/ai-deep-learning/largeScaleTrain')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.largeScaleTrain} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='data-set'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/ai-deep-learning/data-set')
                          if (window.aiPortalHistory) {
                            window.aiPortalHistory.replace('/ai-deep-learning/dataSet')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.dataSet} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='model-set'>
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/ai-deep-learning/model-set')
                          if (window.aiPortalHistory) {
                            window.aiPortalHistory.replace('/ai-deep-learning/modelSet')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.modelSet} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='ai-model-service'>
                    <Link to='/ai-deep-learning/ai-model-service'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.aiModelService} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='manange_monitor'
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="manage-monitor" />
                      <span className='commonSiderSpan'>
                        <FormattedMessage {...IntlMessages.manangeMonitor} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='audit'>
                    <Link to='/manange_monitor/audit'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.audit} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='query_log'>
                    <Link to='/manange_monitor/query_log'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.queryLog} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='panel'>
                    <Link to='/manange_monitor/panel'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.monitorPanel} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='alarm_setting'>
                    <Link to='/manange_monitor/alarm_setting'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.alarmSetting} />
                      </span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='alarm_record'>
                    <Link to='/manange_monitor/alarm_record'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.alarmRecord} />
                      </span>
                    </Link>
                  </Menu.Item>

                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='account'
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="user-o" />
                      <span className='commonSiderSpan'>
                        <FormattedMessage {...IntlMessages.account} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='account_default'>
                    <Link to='/account'>
                      <span>
                        <div className='sideCircle'></div>&nbsp;
                        <FormattedMessage {...IntlMessages.myAccount} />
                      </span>
                    </Link>
                  </Menu.Item>
                  {/*<Menu.Item key='cost'>
                   <Link to='/account/cost'>
                   <span>
                   <div className='sideCircle'></div>&nbsp;
                   费用中心
                  </span>
                   </Link>
                   </Menu.Item>*/}
                  { billingEnabled ?
                    [<Menu.Item key='costCenter#consumptions'>
                      <Link to='/account/costCenter#consumptions'>
                        <span>
                          <div className='sideCircle'></div>&nbsp;
                          <FormattedMessage {...IntlMessages.consumptions} />
                        </span>
                      </Link>
                    </Menu.Item>,
                    <Menu.Item key='costCenter#payments'>
                      <Link to='/account/costCenter#payments'>
                        <span>
                          <div className='sideCircle'></div>&nbsp;
                          <FormattedMessage {...IntlMessages.payments} />
                        </span>
                      </Link>
                    </Menu.Item>]
                    :
                    <Menu.Item key="none-cost" style={{ display: 'none' }}></Menu.Item>
                  }
                  <Menu.Item key='noticeGroup'>
                    <Link to='/account/noticeGroup'>
                      <span><div className='sideCircle'></div> <FormattedMessage {...IntlMessages.noticeGroup} /></span>
                    </Link>
                  </Menu.Item>
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='tenant_manage'
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="user-private" />
                      <span className='commonSiderSpan'>
                        <FormattedMessage {...IntlMessages.tenant} />
                        { (isShowClusterSubPoint || isShowLimitSubPoint) && <span className="topRightPoint"><strong>●</strong></span> }
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  {tenantMenu(role)}
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='setting'
                  title={
                    <span>
                      <TenxIcon className="commonImg" type="setting-o" />
                      <span className='commonSiderSpan'>
                        <FormattedMessage {...IntlMessages.setting} />
                      </span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  {
                    settingMenu(role)
                  }
                  <div className='sline'></div>
                </SubMenu>

                {role !== ROLE_USER && role !== ROLE_PLATFORM_ADMIN ?
                  <SubMenu key='cluster'
                    title={
                      <span>
                        <TenxIcon className="commonImg" type="infrastructure" />
                        <span className='commonSiderSpan'>
                          <FormattedMessage {...IntlMessages.cluster} />
                        </span>
                        <div style={{ clear: 'both' }}></div>
                      </span>
                    }
                  >
                  <Menu.Item key='cluster_default'>
                    <div className="adminBox">
                      <Tooltip title={this.menuItemTip(ROLE_BASE_ADMIN)} placement="right">
                        <TenxIcon type='star' className='star forAdmin'/>
                      </Tooltip>
                      <Link to='/cluster'>
                        <FormattedMessage {...IntlMessages.clusterManage} />
                      </Link>
                    </div>
                  </Menu.Item>
                  <Menu.Item key='globalConfig'>
                      <div className="adminBox">
                        <Tooltip title={this.menuItemTip(ROLE_BASE_ADMIN)} placement="right">
                          <TenxIcon type='star' className='star forAdmin'/>
                        </Tooltip>
                        <Link to='/cluster/globalConfig'>
                          <FormattedMessage {...IntlMessages.globalConfig} />
                        </Link>
                      </div>
                    </Menu.Item>
                  <Menu.Item key='cluster_autoscale'>
                      <div className="adminBox">
                        <Tooltip title={this.menuItemTip(ROLE_BASE_ADMIN)} placement="right">
                          <TenxIcon type='star' className='star forAdmin'/>
                        </Tooltip>
                        <Link to='/cluster/cluster_autoscale'>
                          <FormattedMessage {...IntlMessages.clusterAutoscale} />
                        </Link>
                      </div>
                    </Menu.Item>
                  <Menu.Item key='monitor'>
                    <div className="adminBox">
                      <Tooltip title={this.menuItemTip(ROLE_BASE_ADMIN)} placement="right">
                        <TenxIcon type='star' className='star forAdmin'/>
                      </Tooltip>
                      <Link
                        onClick={() => {
                          try {
                            browserHistory.push('/cluster/monitor')
                            if (window.monitorPortalHistory) {
                              window.monitorPortalHistory.replace('/cluster/monitor')
                            }
                          } catch (error) {
                            //
                          }
                        }}
                      >
                        <FormattedMessage {...IntlMessages.clusterMonitor} />
                      </Link>
                    </div>
                  </Menu.Item>
                  <Menu.Item key='backup'>
                    <div className="adminBox">
                      <Tooltip title={this.menuItemTip(ROLE_BASE_ADMIN)} placement="right">
                        <TenxIcon type='star' className='star forAdmin'/>
                      </Tooltip>
                      <Link
                        onClick={() => {
                          try {
                            browserHistory.push('/cluster/backup')
                            if (window.monitorPortalHistory) {
                              window.monitorPortalHistory.replace('/backup')
                            }
                          } catch (error) {
                            //
                          }
                        }}
                      >
                        <FormattedMessage {...IntlMessages.clusterBackup} />
                      </Link>
                    </div>
                  </Menu.Item>
                  <Menu.Item key='integration'>
                    <div className="adminBox">
                      <TenxIcon className="star forAdmin" type="star" />
                      <Link to='/cluster/integration'>
                        <FormattedMessage {...IntlMessages.integration} />
                      </Link>
                    </div>
                  </Menu.Item>
                  </SubMenu>
                   :
                  <Menu.Item key="none-footer" style={{ display: 'none' }}></Menu.Item>
                }
                {/* role !== ROLE_USER && role !== ROLE_PLATFORM_ADMIN
                  ? <Menu.Item key="backup">
                    <Link
                      onClick={() => {
                        try {
                          browserHistory.push('/backup')
                          if (window.monitorPortalHistory) {
                            window.monitorPortalHistory.replace('/backup')
                          }
                        } catch (error) {
                          //
                        }
                      }}
                    >
                      <span>
                        <TenxIcon type="backup" className="menuIcon" style={{ marginLeft: 20 }} />
                        <span className='commonSiderSpan'>平台数据备份</span>
                        <div style={{ clear: 'both' }}></div>
                      </span>
                    </Link>
                  </Menu.Item>
                  : <Menu.Item key="none-footer" style={{ display: 'none' }}></Menu.Item> */
                }
              </Menu>
            </div>
          </QueueAnim>
        ] : null
        }
        <ul className="changeSiderUl" >
          <Tooltip placement='right' title={siderStyle == 'mini' ? <FormattedMessage {...IntlMessages.outdentMenu} /> : null}
            getTooltipContainer={() => document.getElementById('siderTooltip')}>
            <li className={`changeStyleBox oemMenu-shallow-${backColor}`} onClick={ this.props.changeSiderStyle }>
              <span>
                {siderStyle == 'mini' ? <i key='fa-indent' className='fa fa-indent'></i> : <i key='fa-outdent'
                  className='fa fa-outdent'></i>}
              </span>
              {siderStyle == 'bigger' ? <FormattedMessage {...IntlMessages.indentMenu} /> : null}
            </li>
          </Tooltip>
        </ul>

      </div>

    );
  }
}

function checkCurrentPath(pathname) {
  let pathList = pathname.split('/')
  let currentPath = pathList[0]
  if (currentPath.length > 0) {
    return currentPath
  } else {
    return 'home'
  }
}

function mapStateToProp(state) {
  let role
  const { entities } = state
  if (entities && entities.loginUser && entities.loginUser.info && entities.loginUser.info) {
    role = entities.loginUser.info.role ?entities.loginUser.info.role : 0
  }

  const oemInfo = entities.loginUser.info.oemInfo || {}

  let backColor = 1
  if (oemInfo.colorThemeID) {
    backColor = oemInfo.colorThemeID
  }

  const { projectAuthority } = state
  const { projectsApprovalClustersList } = projectAuthority
  const projects = getDeepValue(projectsApprovalClustersList, ['approvalData', 'projects']) || []
  const isShowClusterPoint = filter(projects, { status: 1 }).length > 0

  const limits = getDeepValue(state, ['applyLimit', 'resourcequoteRecord', 'data']) || []
  const isShowLimitPoint = filter(limits, { status: 0 }).length > 0

  return {
    uploadFileOptions: state.storage.uploadFileOptions,
    beforeUploadState: state.storage.beforeUploadFile,
    storageDetail: state.storage.storageDetail,
    role,
    backColor,
    loginUser: entities && entities.loginUser && entities.loginUser.info,
    oemInfo: oemInfo || {},
    isShowClusterPoint,
    isShowLimitPoint,
  }
}

export default injectIntl(connect(mapStateToProp, {
  beforeUploadFile,
  uploading,
  mergeUploadingIntoList,
  changeUploadFileOptions: uploadFileOptions,
  getVolumeBindInfo,
  changeStorageDetail,
  GetProjectsApprovalClustersWithoutTypes,
  checkApplyRecordWithoutTypes,
  // loadUserDetail,
})(Sider), {
  withRef: true,
})
