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
import { Card, message, Button, Tooltip, Popover, Icon, Menu, Modal, Radio, Upload, Badge } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import './style/sider.less'
import { beforeUploadFile, uploading, mergeUploadingIntoList, getUploadFileUlr, uploadFileOptions, getVolumeBindInfo, changeStorageDetail } from '../../actions/storage'
import { cloneDeep } from 'lodash'
import QueueAnim from 'rc-queue-anim'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const RadioGroup = Radio.Group

function checkUrlSelectedKey(scope) {
  //this function for check the pathname and return the selected key of menu
  const { pathname } = scope.props;
  let pathList = pathname.split('/');
  if(pathList.length == 2) {
    return [pathList[1], pathList[1] + '_default']
  } else {
    return [pathList[1], pathList[2]]
  }
}

function checkUrlOpenKeys(scope) {
  //this function for check the pathname and return the opened key of menu
  const { pathname } = scope.props;
  let pathList = pathname.split('/');
  if(pathList.length == 2) {
    return [pathList[1], pathList[1] + '_default']
  } else {
    return [pathList[1], pathList[2]]
  }
}

class Slider extends Component {
  constructor(props) {
    super(props);
    this.selectModel = this.selectModel.bind(this);
    this.changeSiderStyle = this.changeSiderStyle.bind(this);
    this.state = {
      currentKey: checkCurrentPath(this.props.pathname),
      isUnzip: false
    }
  }
  
  changeSiderStyle() {
    //this function for user change the sider style to 'mini' or 'bigger'
    const { scope, siderStyle } = this.props;
    if(siderStyle == 'mini') {
      scope.setState({
        siderStyle: 'bigger'
      });
    } else {
      scope.setState({
        siderStyle: 'mini'
      });
    }
  }
  
  handleCancel() {
    const currentOptions = cloneDeep(this.props.uploadFileOptions)
    currentOptions.visible = false
    this.props.changeUploadFileOptions(currentOptions)
  }
  
  selectModel(currentKey, currentIcon, event) {
    this.setState({
      currentKey: currentKey,
    });
  }
  
  changeRadioValue(e) {
    this.setState({
      isUnzip: e.target.value
    })
  }

  getUploadData() {
    const options = this.props.uploadFileOptions
    const volumeName = options.volumeName
    const self = this
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
          message.error('超出存储卷可用大小')
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
          message.success('文件上传成功')
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
          message.error('文件上传失败')
        }
      }
    }
  }
  
  render() {
    const { siderStyle } = this.props
    const { currentKey } = this.state
    const scope = this
    const noticeModel = (
      <Card className='noticeModel' title='Card title' style={{ width: 300 }}>
        <p>{this.state.currentKey}</p>
        <p>Card content</p>
        <p>Card contasdfasdfasdfwaetgqwreent</p>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>)
    return (
      <div id='sider'>
        <Modal title='上传文件' wrapClassName='vertical-center-modal' footer='' visible={this.props.uploadFileOptions.visible} onCancel={() => this.handleCancel()}>
          <div className='uploadModal'>
            <RadioGroup onChange={(e) => { this.changeRadioValue(e) } } value={this.state.isUnzip}>
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
        { siderStyle == 'mini' ? [
        <QueueAnim type='left'>
          <div key='miniSider' className='miniSider'>
            <ul className='siderTop'>
              <li className='logoItem'>
                <Link to='/'>
                  <img className='logo' src='/img/sider/logo@2x.png' />
                </Link>
              </li>
              <li onClick={this.selectModel.bind(this, '1', '#home')} className={currentKey == '1' ? 'selectedLi' : ''} >
                <Tooltip placement='right' title='总览' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/'>
                    <svg className='home commonImg'>
                      {currentKey == '1' ? [<use xlinkHref='#homeselected' />] : [<use xlinkHref='#home' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, '2', '#app')} className={currentKey == '2' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='应用管理' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app_manage'>
                    <svg className='app commonImg'>
                      { currentKey == '2' ? [<use xlinkHref='#appselected' />] : [<use xlinkHref='#app' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, '3', '#appCenter')} className={currentKey == '3' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='交付中心' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app_center'>
                    <svg className='center commonImg'>
                      { currentKey == '3' ? [<use xlinkHref='#centerselected' />] : [<use xlinkHref='#center' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, '6', '#system')} className={currentKey == '6' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='CI/CD' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/ci_cd'>
                    <svg className='cicd commonImg'>
                      { currentKey == '6' ? [<use xlinkHref='#cicdselected' />] : [<use xlinkHref='#cicd' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, '4', '#database')} className={currentKey == '4' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='数据库与缓存' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/database_cache'>
                    <svg className='database commonImg'>
                      { currentKey == '4' ? [<use xlinkHref='#database-selected' />] : [<use xlinkHref='#database' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, '5', '#system')} className={currentKey == '5' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='集成中心' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/integration'>
                    <svg className='system commonImg'>
                      <use xlinkHref='#system' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, '7', '#manage')} className={currentKey == '7' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='管理与监控' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/manange_monitor'>
                    <svg className='manageMoniter commonImg'>
                      <use xlinkHref='#managemoniter' />
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <div style={{ clear: 'both' }}></div>
            </ul>
            <ul className='siderBottom'>
              <li onClick={this.selectModel.bind(this, '9', '#addNewApp')} className={currentKey == '9' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='创建应用' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/app_manage/app_create'>
                    <svg className='add commonImg'>
                      { currentKey == '9' ? [<use xlinkHref='#addselected' />] : [<use xlinkHref='#add' />] }
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <li>
                <Tooltip placement='right' title='通知中心'>
                  <Popover placement='rightBottom' content={noticeModel} trigger='click'>
                    <Link to='/'>
                      <Badge dot>
                        <svg className='message commonImg'>
                          <use href='#message' />
                        </svg>
                      </Badge>
                    </Link>
                  </Popover>
                </Tooltip>
              </li>
              <li onClick={this.selectModel.bind(this, '8', '#setting')} className={currentKey == '8' ? 'selectedLi' : ''}>
                <Tooltip placement='right' title='系统设置' getTooltipContainer={() => document.getElementById('siderTooltip')}>
                  <Link to='/setting'>
                    <svg className='setting commonImg'>
                      {currentKey == '8' ? [<use xlinkHref='#settingselected' />] : [<use xlinkHref='#setting' />]}
                    </svg>
                  </Link>
                </Tooltip>
              </li>
              <div style={{ clear: 'both' }}></div>
            </ul>
          </div>
        </QueueAnim>
        ] : null }
        { siderStyle == 'bigger' ? [
        <QueueAnim type='left' className='siderBiggerBox'>
          <div key='siderBigger' className='siderBigger'>
            <div className='logBox'>
              <Link to='/'>
                <img className='logo' src='/img/sider/logo@2x.png' />
              </Link>
            </div>
            <Menu
              style={{ width: '100%', backgroundColor: '#222222', color: '#c4c4c4' }}
              mode='inline'
              theme='dark'
              selectedKeys={checkUrlSelectedKey(scope)}
              openKeys={checkUrlOpenKeys(scope)}
            > 
              <Menu.Item key='0'>
                <Link to='/'>
                  <svg className='home commonImg'>
                    {currentKey == '1' ? [<use xlinkHref='#homeselected' />] : [<use xlinkHref='#home' />]}
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
                      <span>应用</span>
                    </Link>
                  </Menu.Item>
                   <Menu.Item key='service'>
                    <Link to='/app_manage/service'>
                      <span>服务</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='container'>
                    <Link to='/app_manage/container'>
                      <span>容器</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='storage'>
                    <Link to='/app_manage/storage'>
                      <span>存储</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='configs'>
                    <Link to='/app_manage/configs'>
                      <span>服务配置</span>
                    </Link>
                  </Menu.Item>
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
                <Menu.Item key='app_center_default'>
                  <Link to='/app_center'>
                    <span>镜像仓库</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='image_store'>
                  <Link to='/app_center/image_store'>
                    <span>应用商店</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='stack_center'>
                  <Link to='/app_center/stack_center'>
                    <span>编排文件</span>
                  </Link>
                </Menu.Item>
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
                    <span>代码仓库</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='tenx_flow'>
                  <Link to='/ci_cd/tenx_flow'>
                    <span>TenxFlow</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='docker_file'>
                  <Link to='/ci_cd/docker_file'>
                    <span>Dockerfile</span>
                  </Link>
                </Menu.Item>
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
                  <Link to='/database_cache'>
                    <span>MySQL集群</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='mongo_cluster'>
                  <Link to='/database_cache/mongo_cluster'>
                    <span>Mongo集群</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='redis_cluster'>
                  <Link to='/database_cache/redis_cluster'>
                    <span>Redis集群</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='database_storage'>
                  <Link to='/database_cache/database_storage'>
                    <span>存储</span>
                  </Link>
                </Menu.Item>
              </SubMenu>
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
              <SubMenu key='sub6' 
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
                <Menu.Item key='manange_monitor_default'>
                  <Link to='/manange_monitor'>
                    <span>操作审计</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='query_log'>
                  <Link to='/manange_monitor/query_log'>
                    <span>日志查询</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='monitor'>
                  <Link to='/manange_monitor/monitor'>
                    <span>监控管理</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='formCenter'>
                  <span>报表中心</span>
                </Menu.Item>
              </SubMenu>
              <Menu.Item key='addApp'>
                <Link to='/setting/member'>
                  <span>
                    <svg className='add commonImg'>
                      <use xlinkHref='#add' />
                    </svg>
                    <span>创建应用</span>
                  </span>
                </Link>
              </Menu.Item>
              <Menu.Item key='message'>
                <Link to=''>
                  <span>
                    <svg className='message commonImg'>
                      <use xlinkHref='#message' />
                    </svg>
                    <span>通知中心</span>
                  </span>
                </Link>
              </Menu.Item>
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
                <Menu.Item key='setting_default'>
                  <Link to='/setting'>
                    <span>我的信息</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='member'>
                  <Link to='/setting/member'>
                    <span>成员管理</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='team'>
                  <Link to='/setting/team'>
                    <span>团队管理</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='note'>
                  <Link to='/setting/note'>
                    <span>通知设置</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='API'>
                  <Link to='/setting/API'>
                    <span>开放API</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='version'>
                  <Link to='/setting/version'>
                    <span>平台版本</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key='license'>
                  <Link to='/setting/license'>
                    <span>授权管理</span>
                  </Link>
                </Menu.Item>
              </SubMenu>
            </Menu>
          </div>
        </QueueAnim>
        ] : null
        }
        <ul className='changeSiderUl'>
          <Tooltip placement='right' title={siderStyle == 'mini' ? '展开导航栏' : null} getTooltipContainer={() => document.getElementById('siderTooltip')}>
            <li onClick={this.changeSiderStyle}>
              <span>
                { siderStyle == 'mini' ? [<i className='fa fa-indent'></i>] : [<i className='fa fa-outdent'></i>]}
              </span>
              { siderStyle == 'bigger' ?[<span>收起</span>] : null }
            </li>
          </Tooltip>
        </ul>
      </div>
    )
  }
}

function checkCurrentPath(pathname) {
  let ManageMonitorCheck = new RegExp('manange_monitor', 'gi');
  if (ManageMonitorCheck.test(pathname)) {
    return '7';
  }
  let DatabaseCheck = new RegExp('database_cache', 'gi');
  let CICDCheck = new RegExp('ci_cd', 'gi');
  if (CICDCheck.test(pathname)) {
    return '6';
  }
  if (DatabaseCheck.test(pathname)) {
    return '4';
  }
  let AppCenterCheck = new RegExp('app_center', 'gi');
  if (AppCenterCheck.test(pathname)) {
    return '3';
  }
  let ApplicationCheck = new RegExp('app_manage', 'gi');
  if (ApplicationCheck.test(pathname)) {
    return '2';
  }
  let addApplicationCheck = new RegExp('app_manage/app_create', 'gi')
  if (ApplicationCheck.test(pathname)) {
    return '9';
  }
  let homeCheck = new RegExp('/', 'gi');
  if (homeCheck.test(pathname)) {
    return '1';
  }
}

function mapStateToProp(state) {
  return {
    uploadFileOptions: state.storage.uploadFileOptions,
    beforeUploadState: state.storage.beforeUploadFile,
    storageDetail: state.storage.storageDetail
  }
}

export default connect(mapStateToProp, {
  beforeUploadFile,
  uploading,
  mergeUploadingIntoList,
  changeUploadFileOptions: uploadFileOptions,
  getVolumeBindInfo,
  changeStorageDetail
})(Slider)