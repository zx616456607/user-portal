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
import { Link } from 'react-router'
import './style/sider.less'
import { beforeUploadFile, uploading, mergeUploadingIntoList, getUploadFileUlr, uploadFileOptions, getVolumeBindInfo, changeStorageDetail } from '../../../actions/storage'
import cloneDeep from 'lodash/cloneDeep'
import QueueAnim from 'rc-queue-anim'
import NotificationHandler from '../../../components/Notification'
// import { loadUserDetail } from '../../../actions/user'
import { ROLE_USER, ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN,  } from '../../../../constants'
import { NEED_BUILD_IMAGE, SHOW_BILLING } from '../../../constants'

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
      currentSelectedMenu: null
    }
  }

  componentWillMount() {
    const { pathname } = this.props
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
    this.setState({
      currentKey: currentKey,
      currentOpenMenu: currentOpenMenu,
      currentSelectedMenu: currentSelectedMenu
    })
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
      this.setState({
        currentKey: currentKey,
        currentOpenMenu: currentOpenMenu,
        currentSelectedMenu: currentSelectedMenu
      })
    }
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

  getUploadData() {
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
  }

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

  render() {
    const { siderStyle, role,backColor,oemInfo, loginUser } = this.props
    const { currentKey } = this.state
    const { billingConfig } = loginUser
    const { enabled: billingEnabled } = billingConfig
    const scope = this
    return (
      <div id='sider' className={`oemMenu-drek-${backColor}`}>
        <Modal title='上传文件' wrapClassName='vertical-center-modal' footer=''
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
        </Modal>
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
                <Tooltip placement='right' title='总览'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/'>
                    <svg className='home commonImg'>
                      <use xlinkHref='#home' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('app_manage')}
                className={currentKey == 'app_manage' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='应用管理'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app_manage'>
                    <svg className='app commonImg'>
                      <use xlinkHref='#app' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('app_center')}
                className={currentKey == 'app_center' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='交付中心'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app_center/projects'>
                    <svg className='center commonImg'>
                      <use xlinkHref='#center' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('ci_cd')}
                className={currentKey == 'ci_cd' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='CI/CD'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/ci_cd'>
                    <svg className='cicd commonImg'>
                      <use xlinkHref='#cicd' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('database_cache')}
                className={currentKey == 'database_cache' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='数据库与缓存'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/database_cache/mysql_cluster'>
                    <svg className='database commonImg'>
                      <use xlinkHref='#database' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              {role == ROLE_SYS_ADMIN ?
              <li onClick={()=> this.selectModel('integration')}
                className={currentKey == 'integration' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='集成中心'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/integration'>
                    <svg className='system commonImg'>
                      <use xlinkHref='#system' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>:''
              }
              <li onClick={()=> this.selectModel('manange_monitor')}
                className={currentKey == 'manange_monitor' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='管理与监控'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/manange_monitor'>
                    <svg className='manageMoniter commonImg'>
                      <use xlinkHref='#managemoniter' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={()=> this.selectModel('account')}
                className={currentKey == 'account' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='帐户中心'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/account'>
                    <svg className='account commonImg'>
                     <use xlinkHref='#message' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, 'tenant_manage', '#tenant_manage')}
                className={currentKey == 'tenant_manage' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='租户管理'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/tenant_manage'>
                    <svg className='commonImg'>
                     <use xlinkHref='#tenantmanagement' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, 'setting', '#setting')}
                className={currentKey == 'setting' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='系统设置'
                  getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/setting'>
                    <svg className='setting commonImg'>
                      <use xlinkHref='#setting' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              {role == ROLE_SYS_ADMIN ?
                [
                  <li onClick={()=> this.selectModel('cluster')}
                    className={currentKey == 'cluster' ? 'selectedLi' : ''}>
                    <Tooltip placement='right' title='基础设施'
                      getTooltipContainer={() => document.getElementById('siderTooltip')}>
                      <Link to='/cluster'>
                        <svg className='setting commonImg'>
                          <use xlinkHref='#siderinfrastructure' />
                        </svg>
                      </Link>
                    </Tooltip>
                  </li>
                ] : null
              }
              <div style={{ clear: 'both' }}></div>
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
                    <svg className='home commonImg'>
                      <use xlinkHref='#home' />
                    </svg>
                    <span>总览</span>
                  </Link>
                </Menu.Item>
                <SubMenu key='app_manage'
                  title={
                    <span>
                      <svg className='app commonImg'>
                        <use xlinkHref='#app' />
                      </svg>
                      <span className='commonSiderSpan'>应用管理</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='app_manage_default'>
                    <Link to='/app_manage'>
                      <span><div className='sideCircle'></div> 应用</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='service'>
                    <Link to='/app_manage/service'>
                      <span><div className='sideCircle'></div> 服务</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='container'>
                    <Link to='/app_manage/container'>
                      <span><div className='sideCircle'></div> 容器</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='storage'>
                    <Link to='/app_manage/storage'>
                      <span><div className='sideCircle'></div> 存储</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='snapshot'>
                    <Link to='/app_manage/snapshot'>
                      <span><div className='sideCircle'></div> 独享存储快照</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='configs'>
                    <Link to='/app_manage/configs'>
                      <span><div className='sideCircle'></div> 服务配置</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='load_balance'>
                    <Link to='/app_manage/load_balance'>
                      <span><div className='sideCircle'></div> 应用负载均衡</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='network_isolation'>
                    <Link to='/app_manage/network_isolation'>
                      <span><div className='sideCircle'></div> 网络隔离</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='auto_scale'>
                    <Link to='/app_manage/auto_scale'>
                      <span><div className='sideCircle'></div> 自动伸缩策略</span>
                    </Link>
                  </Menu.Item>
                  {
                    (this.props.loginUser.vmWrapConfig && this.props.loginUser.vmWrapConfig.enabled)
                    ? [
                      <Menu.Item key='vm_wrap'>
                        <Link to='/app_manage/vm_wrap'>
                          <span><div className='sideCircle'></div> 传统应用</span>
                        </Link>
                      </Menu.Item>,
                      <Menu.Item key='vm_list'>
                        <Link to='/app_manage/vm_list'>
                          <span><div className='sideCircle'></div> 传统应用环境</span>
                        </Link>
                      </Menu.Item>
                    ]
                    : <Menu.Item key="none-footer" style={{ display: 'none' }}></Menu.Item>
                  }
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='app_center'
                  title={
                    <span>
                      <svg className='center commonImg'>
                        <use xlinkHref='#center' />
                      </svg>
                      <span className='commonSiderSpan'>交付中心</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='app_template'>
                    <Link to='/app_center/template'>
                      <span><div className='sideCircle'></div> 应用模板</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='projects'>
                    <Link to='/app_center/projects'>
                      <span><div className='sideCircle'></div> 镜像仓库</span>
                    </Link>
                  </Menu.Item>
                  {/*<Menu.Item key='image_store'>*/}
                    {/*<Link to='/app_center/image_store'>*/}
                      {/*<span><div className='sideCircle'></div> 应用商店</span>*/}
                    {/*</Link>*/}
                  {/*</Menu.Item>*/}
                  <Menu.Item key='wrap_manage'>
                    <Link to='/app_center/wrap_manage'>
                      <span><div className='sideCircle'></div> 应用包管理</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='stack_center'>
                    <Link to='/app_center/stack_center'>
                      <span><div className='sideCircle'></div> 编排文件</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='wrap_store'>
                    <Link to='/app_center/wrap_store'>
                      <span><div className='sideCircle'/> 应用商店</span>
                    </Link>
                  </Menu.Item>
                  {role === ROLE_SYS_ADMIN ?
                    <Menu.Item key='wrap_check'>
                      <div className="adminBox">
                        <Tooltip title="仅系统管理员可见" placement="right">
                          <svg className="start forAdmin">
                            <use xlinkHref='#start' />
                          </svg>
                        </Tooltip>
                        <Link to='/app_center/wrap_check'>
                        <span>发布审核</span>
                        </Link>
                      </div>
                    </Menu.Item> : <Menu.Item key="none-setting" style={{ display: 'none' }}/>
                  }
                  <div className='sline'/>
                </SubMenu>
                <SubMenu key='ci_cd'
                  title={
                    <span>
                      <svg className='center commonImg'>
                        <use xlinkHref='#cicd' />
                      </svg>
                      <span className='commonSiderSpan'>CI/CD</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='ci_cd_default'>
                    <Link to='/ci_cd'>
                      <span><div className='sideCircle'></div> 代码仓库</span>
                    </Link>
                  </Menu.Item>
                  {NEED_BUILD_IMAGE ?
                    <Menu.Item key='build_image'>
                      <Link to='/ci_cd/build_image'>
                        <span><div className='sideCircle'></div> 构建镜像</span>
                      </Link>
                    </Menu.Item> : <Menu.Item key='integration-none' style={{ display: 'none' }}></Menu.Item>
                  }
                  <Menu.Item key='tenx_flow'>
                    <Link to='/ci_cd/tenx_flow'>
                      <span><div className='sideCircle'></div> TenxFlow</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='docker_file'>
                    <Link to='/ci_cd/docker_file'>
                      <span><div className='sideCircle'></div> Dockerfile</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='cached_volumes'>
                    <Link to='/ci_cd/cached_volumes'>
                      <span><div className='sideCircle'></div> 缓存卷</span>
                    </Link>
                  </Menu.Item>
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='database_cache'
                  title={
                    <span>
                      <svg className='database commonImg'>
                        <use xlinkHref='#database' />
                      </svg>
                      <span className='commonSiderSpan'>数据库与缓存</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='database_cache_default'>
                    <Link to='/database_cache/mysql_cluster'>
                      <span><div className='sideCircle'></div> MySQL集群</span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='redis_cluster'>
                    <Link to='/database_cache/redis_cluster'>
                      <span><div className='sideCircle'></div> Redis集群</span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='zookeeper_cluster'>
                    <Link to='/database_cache/zookeeper_cluster'>
                      <span><div className='sideCircle'></div> ZooKeeper集群</span>
                    </Link>
                  </Menu.Item>

                  <Menu.Item key='elasticsearch_cluster'>
                  <Link to='/database_cache/elasticsearch_cluster'>
                    <span><div className='sideCircle'></div> ElasticSearch集群</span>
                  </Link>
                </Menu.Item>

                {/* <Menu.Item key='etcd_cluster'>
                  <Link to='/database_cache/etcd_cluster'>
                    <span><div className='sideCircle'></div> Etcd集群</span>
                  </Link>
                </Menu.Item> */}

                  <div className='sline'></div>
                </SubMenu>
                {(role == ROLE_SYS_ADMIN) ?
                <Menu.Item key='integration'>
                  <Link to='/integration'>
                    <span>
                      <svg className='system commonImg'>
                        <use xlinkHref='#system' />
                      </svg>
                      <span className='commonSiderSpan'>集成中心</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  </Link>
                </Menu.Item>
                : <Menu.Item key="none-config" style={{ display: 'none' }}></Menu.Item>
                }
                <SubMenu key='manange_monitor'
                  title={
                    <span>
                      <svg className='manageMoniter commonImg'>
                        <use xlinkHref='#managemoniter' />
                      </svg>
                      <span className='commonSiderSpan'>管理与监控</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='audit'>
                    <Link to='/manange_monitor/audit'>
                      <span><div className='sideCircle'></div> 操作审计</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='query_log'>
                    <Link to='/manange_monitor/query_log'>
                      <span><div className='sideCircle'></div> 日志查询</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='panel'>
                    <Link to='/manange_monitor/panel'>
                      <span><div className='sideCircle'></div> 监控面板</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='alarm_setting'>
                    <Link to='/manange_monitor/alarm_setting'>
                      <span><div className='sideCircle'></div> 告警设置</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='alarm_record'>
                    <Link to='/manange_monitor/alarm_record'>
                      <span><div className='sideCircle'></div> 告警记录</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='alarm_group'>
                    <Link to='/manange_monitor/alarm_group'>
                      <div className='sideCircle'></div> 告警通知组
                    </Link>
                  </Menu.Item>
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='account'
                  title={
                    <span>
                      <svg className='account commonImg'>
                        <use xlinkHref='#message' />
                      </svg>
                      <span className='commonSiderSpan'>帐户中心</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='account_default'>
                    <Link to='/account'>
                      <span><div className='sideCircle'></div> 我的帐户</span>
                    </Link>
                  </Menu.Item>
                  {/*<Menu.Item key='cost'>
                   <Link to='/account/cost'>
                   <span><div className='sideCircle'></div> 费用中心</span>
                   </Link>
                   </Menu.Item>*/}
                  { billingEnabled ?
                    [<Menu.Item key='costCenter#consumptions'>
                      <Link to='/account/costCenter#consumptions'>
                        <span><div className='sideCircle'></div> 消费记录</span>
                      </Link>
                    </Menu.Item>,
                    <Menu.Item key='costCenter#payments'>
                      <Link to='/account/costCenter#payments'>
                        <span><div className='sideCircle'></div> 充值记录</span>
                      </Link>
                    </Menu.Item>]
                    :
                    <Menu.Item key="none-cost" style={{ display: 'none' }}></Menu.Item>
                  }
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='tenant_manage'
                  title={
                    <span>
                      <svg className='commonImg'>
                        <use xlinkHref='#tenantmanagement' />
                      </svg>
                      <span className='commonSiderSpan'>租户管理</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='tenant_manage_default'>
                    <Link to='/tenant_manage'>
                      <span><div className='sideCircle'></div> 概览</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="user">
                    <Link to='/tenant_manage/user'>
                      <span><div className='sideCircle'></div> 成员管理</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="team">
                    <Link to='/tenant_manage/team'>
                      <span><div className='sideCircle'></div> 团队管理</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='project_manage'>
                    <Link to='/tenant_manage/project_manage'>
                      <span><div className='sideCircle'></div> 项目管理</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='rolemanagement'>
                    <Link to='/tenant_manage/rolemanagement'>
                      <span><div className='sideCircle'></div> 项目角色</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='allpermissions'>
                    <Link to='/tenant_manage/allpermissions'>
                      <span><div className='sideCircle'></div> 项目权限</span>
                    </Link>
                  </Menu.Item>
                  {role == ROLE_SYS_ADMIN ?
                    <Menu.Item key='ldap'>
                      <div className="adminBox">
                        <Tooltip title="仅系统管理员可见" placement="right">
                          <svg className="start forAdmin">
                            <use xlinkHref='#start' />
                          </svg>
                        </Tooltip>
                        <Link to='/tenant_manage/ldap'>
                          <span>
                            集成企业目录
                          </span>
                        </Link>
                      </div>
                    </Menu.Item> : <Menu.Item key="none-ldap" style={{ display: 'none' }}></Menu.Item>
                  }
                  <div className='sline'></div>
                </SubMenu>
                <SubMenu key='setting'
                  title={
                    <span>
                      <svg className='setting commonImg'>
                        <use xlinkHref='#setting' />
                      </svg>
                      <span className='commonSiderSpan'>系统设置</span>
                      <div style={{ clear: 'both' }}></div>
                    </span>
                  }
                >
                  <Menu.Item key='version'>
                    <Link to='/setting/version'>
                      <span><div className='sideCircle'></div> 平台版本</span>
                    </Link>
                  </Menu.Item>
                  {role == ROLE_SYS_ADMIN ?
                    <Menu.Item key='license'>
                      <div className="adminBox">
                        <Tooltip title="仅系统管理员可见" placement="right">
                          <svg className="start forAdmin">
                            <use xlinkHref='#start' />
                          </svg>
                        </Tooltip>
                        <Link to='/setting/license'>
                          <span>
                            授权管理
                          </span>
                        </Link>
                      </div>
                    </Menu.Item> : <Menu.Item key="none-setting" style={{ display: 'none' }}></Menu.Item>
                  }
                  <Menu.Item key='API'>
                    <Link to='/setting/API'>
                      <span><div className='sideCircle'></div> 开放 API</span>
                    </Link>
                  </Menu.Item>
                  {role == ROLE_SYS_ADMIN ?
                    [<Menu.Item key='globalConfig'>
                      <div className="adminBox">
                        <Tooltip title="仅系统管理员可见" placement="right">
                          <svg className="start forAdmin">
                            <use xlinkHref='#start' />
                          </svg>
                        </Tooltip>
                        <Link to='/setting/globalConfig'>
                          <span>
                            全局配置
                          </span>
                        </Link>
                      </div>
                    </Menu.Item>,
                    <Menu.Item key='advancedSetting'>
                      <div className="adminBox">
                        <Tooltip title="仅系统管理员可见" placement="right">
                          <svg className="start forAdmin">
                            <use xlinkHref='#start' />
                          </svg>
                        </Tooltip>
                        <Link to='/setting/advancedSetting'>
                          <span>
                            高级设置
                          </span>
                        </Link>
                      </div>
                    </Menu.Item>,
                    <Menu.Item key='personalized'>
                      <div className="adminBox">
                        <Tooltip title="仅系统管理员可见" placement="right">
                          <svg className="start forAdmin">
                            <use xlinkHref='#start' />
                          </svg>
                        </Tooltip>
                        <Link to='/setting/personalized'>
                          <span>
                            个性外观
                          </span>
                        </Link>
                      </div>
                    </Menu.Item>,
                    <Menu.Item key='cleaningTool'>
                      <div className="adminBox">
                        <Tooltip title="仅系统管理员可见" placement="right">
                          <svg className="start forAdmin">
                            <use xlinkHref='#start' />
                          </svg>
                        </Tooltip>
                        <Link to='/setting/cleaningTool'>
                          <span>
                            清理工具
                          </span>
                        </Link>
                      </div>
                    </Menu.Item>
                    ]
                    :
                    <Menu.Item key="none-config" style={{ display: 'none' }}></Menu.Item>
                  }
                  <div className='sline'></div>
                </SubMenu>
                {role == ROLE_SYS_ADMIN ?
                  <Menu.Item key='cluster'>
                    <Link to='/cluster'>
                      <span>
                        <svg className='system commonImg'>
                          <use xlinkHref='#siderinfrastructure' />
                        </svg>
                        <span className='commonSiderSpan'>基础设施</span>
                        <div style={{ clear: 'both' }}></div>
                      </span>
                    </Link>
                  </Menu.Item> : <Menu.Item key="none-footer" style={{ display: 'none' }}></Menu.Item>
                }
              </Menu>
            </div>
          </QueueAnim>
        ] : null
        }
        <ul className="changeSiderUl" >
          <Tooltip placement='right' title={siderStyle == 'mini' ? '展开导航栏' : null}
            getTooltipContainer={() => document.getElementById('siderTooltip')}>
            <li className={`changeStyleBox oemMenu-shallow-${backColor}`} onClick={ this.props.changeSiderStyle }>
              <span>
                {siderStyle == 'mini' ? [<i key='fa-indent' className='fa fa-indent'></i>] : [<i key='fa-outdent'
                  className='fa fa-outdent'></i>]}
              </span>
              {siderStyle == 'bigger' ? [<span>收起</span>] : null}
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
  let role = ROLE_USER
  const { entities } = state
  if (entities && entities.loginUser && entities.loginUser.info && entities.loginUser.info) {
    role = entities.loginUser.info.role
  }
  const oemInfo = entities.loginUser.info.oemInfo || {}

  let backColor = 1
  if (oemInfo.colorThemeID) {
    backColor = oemInfo.colorThemeID
  }

  return {
    uploadFileOptions: state.storage.uploadFileOptions,
    beforeUploadState: state.storage.beforeUploadFile,
    storageDetail: state.storage.storageDetail,
    role,
    backColor,
    loginUser: entities && entities.loginUser && entities.loginUser.info,
    oemInfo: oemInfo || {}
  }
}

export default connect(mapStateToProp, {
  beforeUploadFile,
  uploading,
  mergeUploadingIntoList,
  changeUploadFileOptions: uploadFileOptions,
  getVolumeBindInfo,
  changeStorageDetail,
  // loadUserDetail,
})(Sider)