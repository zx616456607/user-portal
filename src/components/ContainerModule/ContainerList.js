/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerList component
 *
 * v0.1 - 2016-09-19
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Tooltip, Icon, Checkbox, Card, Menu, Dropdown, Button, Input, Spin, Pagination, Modal, Form, Select } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { camelize } from 'humps'
import './style/ContainerList.less'
import { loadContainerList, deleteContainers, updateContainerList } from '../../actions/app_manage'
import { loadProjectList, loadAllProject, loadRepositoriesTags } from '../../actions/harbor'
import { addTerminal, removeTerminal } from '../../actions/terminal'
import { LABEL_APPNAME, LOAD_STATUS_TIMEOUT, UPDATE_INTERVAL, DEFAULT_REGISTRY } from '../../constants'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { calcuDate } from '../../common/tools.js'
import { browserHistory } from 'react-router'
import ContainerStatus from '../TenxStatus/ContainerStatus'
import { addPodWatch, removePodWatch } from '../../containers/App/status'
import { instanceExport } from '../../actions/instance_export'
import NotificationHandler from '../../components/Notification'
import Title from '../Title'
import cloneDeep from 'lodash/cloneDeep'
import { TENX_STORE } from '../../../constants/index'
import ResourceBanner from '../../components/TenantManage/ResourceBanner'
import TenxIcon from '@tenx-ui/icon/es/_old'
import ContainerListIntl from './ContainerListIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
import { getDeepValue } from '../../../client/util/util';

const confirm = Modal.confirm
const Option = Select.Option

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  getInitialState(){
    return {
      exportImageModalVisible: false,
      previewImageAddress: false,
      exportImageModalSuccess: false,
      exportImageName: '',
      exportContainerName: '',
      ModalLoadidng: false,
      containerErrorModal: false,
      imageNameEqual: false,
      imageTagEqual: false,
    };
  },
  /*onchange: function (e) {
    e.stopPropagation();
    const { value, checked } = e.target
    const { parentScope } = this.props
    const { containerList } = parentScope.state
    containerList.map((contaienr) => {
      if (contaienr.metadata.name === value) {
        contaienr.checked = checked
      }
    });
    parentScope.setState({
      containerList
    });
  },*/
  containerOperaClick: function (name, status, e) {
    //this function for user click opera menu
    switch (e.key) {
      case 'deleteContainer':
        //this is delete the container
        this.deleteContainer(name);
        return;
      case 'exportImage':
        this.setState({
          imageNameEqual: false,
          imageTagEqual: false,
        })
        this.exportImageModal(name, status)
        return
      case 'forceDelete':
        return this.deleteContainer(name, 'force')
      default:
        return
    }
  },
  exportImageModal(name, status){
    if(status == 'Running'){
      const { form, harbor } = this.props
      const { setFieldsValue } = form
      setFieldsValue({
        'exportImageName': undefined,
        'harborProjectName': '',
        'exportImageVersion': 'latest',
      })
      this.props.funcs.loadProjectList(DEFAULT_REGISTRY, { page_size: 100, harbor })
      this.setState({
        exportImageModalVisible: true,
        exportContainerName: name
      })
      return
    }
    this.setState({
      containerErrorModal: true
    })
  },
  apiInstanceExport(values){
    const { formatMessage } = this.props
    const { instanceExport, clusterID } = this.props
    const { exportContainerName } = this.state
    let Notification = new NotificationHandler()
    let body = {
      body:{
        imagename: values.exportImageName,
        tag: values.exportImageVersion,
        projectname: values.harborProjectName.split('/detail/')[0],
      },
      clusterID,
      containers:exportContainerName
    }
    instanceExport(body,{
      success: {
        func: (res) => {
          if(res.statusCode && res.statusCode == 204){
            Notification.error(formatMessage(ContainerListIntl.exportImageFailure))
            this.setState({
              exportImageModalVisible: false,
              exportContainerName: '',
              ModalLoadidng:false
            })
            return
          }
          this.setState({
            exportImageModalVisible: false,
            exportImageModalSuccess: true,
            exportContainerName: '',
            ModalLoadidng: false
          })
        }
      },
      failed: {
        func: (res) => {
          if(res.message && res.message.message == "The exportInstance operation against timeout could not be completed at this time, please try again."){
            Notification.error(formatMessage(ContainerListIntl.exportImageTimeOut))
            return
          }
          Notification.error(formatMessage(ContainerListIntl.exportImageFailure))
          this.setState({
            exportImageModalVisible: false,
            exportContainerName: '',
            ModalLoadidng:false
          })
        }
      }
    })
  },
  handleConfirmExportImage(){
    const { form } = this.props
    this.setState({
      ModalLoadidng: true
    })
    form.validateFields((errors, values) => {
      if(errors){
        if(Object.keys(errors).length == 1 && errors.exportImageName && errors.exportImageName.errors[0].message == "名称已存在，使用会覆盖已有镜像"){
          return this.apiInstanceExport(values)
        }
        this.setState({
          ModalLoadidng: false
        })
        return
      }
      this.apiInstanceExport(values)
    })
  },
  hanldeCancleExportImage(){
    this.setState({
      exportImageModalVisible : false
    })
  },
  formatImageInfo(){
    const { form } = this.props
    const { formatMessage } = this.props
    const { getFieldValue } = form
    let imageName = getFieldValue('exportImageName') ? getFieldValue('exportImageName') : formatMessage(ContainerListIntl.imageName)
    let imageTag = getFieldValue('exportImageVersion') ? getFieldValue('exportImageVersion') : 'latest'
    return {
      imageName,
      imageTag
    }
  },
  handleInfoOK(){
    this.setState({
      containerErrorModal: false
    })
  },
  handleInfoCancel(){
    this.setState({
      containerErrorModal: false
    })
  },
  handleViewImageStore(){
    this.setState({
      exportImageModalSuccess : false
    })
    browserHistory.push(`/app_center/projects/detail/${this.state.projectId}`)
  },
  hanldeClose(){
    this.setState({
      exportImageModalSuccess : false
    })
  },
  checkImageNameEqual(exportImageName, callback){
    const { loadAllProject, loadRepositoriesTags, harbor } = this.props
    loadAllProject(DEFAULT_REGISTRY, {q: exportImageName, harbor},{
      success: {
        func: (res) => {
          const { form } = this.props
          let projectName = form.getFieldValue('harborProjectName').split('/detail/')[0]
          if(!projectName){
            return
          }
          if(callback){
            callback()
          }
          let imageName = projectName + '/' + exportImageName
          let imageNameArray = res.data.repository || []
          this.setState({
            imageNameEqual: false
          })
          for(let i = 0; i < imageNameArray.length; i++){
            if(imageName === imageNameArray[i].repositoryName){
              this.setState({
                imageNameEqual: true
              })
              loadRepositoriesTags(harbor, DEFAULT_REGISTRY, imageName, {
                success: {
                  func: (res) => {
                    let imageTag = form.getFieldValue('exportImageVersion')
                    let imageTagArray = res.data
                    this.setState({
                      imageTagEqual: false,
                    })
                    if(imageTagArray.indexOf(imageTag) > -1){
                      this.setState({
                        imageTagEqual: true,
                      })
                    }
                  }
                }
              })
              break
            }
          }
        },
        isAsync: true
      }
    })
  },
  checkImageName(rule, value, callback){
    const { formatMessage } = this.props
    const { form } = this.props
    let projectName = form.getFieldValue('harborProjectName').split('/detail/')[0]
    if(!value){
      return callback(formatMessage(ContainerListIntl.pleaseInputImageAddress))
    }
    if(!/^([a-z0-9]+((?:[._]|__|[-]*)[a-z0-9]+)*)?$/.test(value)){
      return callback(formatMessage(ContainerListIntl.consistOfLowercaseAndNum))
    }
    if(value.length > 128){
      return callback(formatMessage(ContainerListIntl.atMost128Character))
    }
    if(projectName){
      return this.checkImageNameEqual(value, callback)
    }
    return callback()
  },
  checkImageVersion(rule, value, callback){
    const { loadRepositoriesTags, form, harbor } = this.props
    if(!value){
      return callback(formatMessage(ContainerListIntl.pleaseInputImageVersion))
    }
    if(!/^([\w][\w.-]*)?$/.test(value)){
      return callback(formatMessage(ContainerListIntl.consistOfLowercaseAndNum))
    }
    if(value.length > 128){
      return callback(formatMessage(ContainerListIntl.atMost128Character))
    }
    if(this.state.imageNameEqual){
      let projectName = form.getFieldValue('harborProjectName').split('/detail/')[0]
      let exporImageName = form.getFieldValue('exportImageName')
      let imageName = projectName + '/' + exporImageName
      loadRepositoriesTags(harbor, DEFAULT_REGISTRY, imageName, {
        success: {
          func: (res) => {
            let imageTagArray = res.data
            this.setState({
              imageTagEqual: false,
            })
            if(imageTagArray.indexOf(value) > -1){
              this.setState({
                imageTagEqual: true,
              })
            }
          }
        }
      })
    }
    return callback()
  },
  selectChange(projects){
    const { form } = this.props
    const { getFieldValue } = form
    let exportImageName = getFieldValue("exportImageName")
    let exportImageTag = getFieldValue("exportImageVersion")
    let projectId = projects.split('/detail/')[1]
    this.setState({projectId})
    if(!exportImageName || !exportImageTag){
      return
    }
    this.checkImageNameEqual(exportImageName)
  },
  selectContainerDetail: function (name, e) {
    //this function for user click app detail ,and then this app will be selected
    //when user click the menu button will trigger the function
    //so the first thing should estimate
    //the event target is the menu button or others
    //if the target is menu button , the function will be return null
    let stopPro = e._dispatchInstances;
    if (stopPro.length != 2) {
      const { parentScope } = this.props
      const { containerList } = parentScope.state
      containerList.map((contaienr) => {
        if (contaienr.metadata.name === name) {
          contaienr.checked = !contaienr.checked
        }
      });
      parentScope.setState({
        containerList
      });
    }
  },
  openTerminalModal: function (item, e) {
    //this function for user open the terminal modal
    const { funcs } = this.props
    e.stopPropagation();
    funcs.openTerminal(item);
  },
  deleteContainer: function (name, type) {
    const { config, funcs } = this.props
    const { confirmDeleteContainer } = funcs
    const container = {
      metadata: {
        name
      }
    }
    if (type === 'force') {
      confirmDeleteContainer([container], 'force')
      return
    }
    confirmDeleteContainer([container])
  },
  handleDropdown: function (e) {
    e.stopPropagation()
  },
  getImages(item) {
    let images = []
    item.spec.containers.map((container) => {
      images.push(container.image)
    })
    return images.join(', ')
  },
  render: function () {
    const { scope, config, loading, form, exportimageUrl } = this.props
    const { getFieldProps, getFieldValue, isFieldValidating, getFieldError } = form
    const { formatMessage } = this.props
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length < 1) {
      return (
        <div className='loadingBox'>
          <Icon type="frown"/>&nbsp;{formatMessage(ContainerListIntl.noData)}
        </div>
      )
    }
    const items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.containerOperaClick.bind(this, item.metadata.name, item.status.phase)}
          style={{ width: '100px' }}
          >
          <Menu.Item key='exportImage'>
            <span>{formatMessage(ContainerListIntl.exportImage)}</span>
          </Menu.Item>
          <Menu.Item key='forceDelete'>
            <span>{formatMessage(ContainerListIntl.forceDelete)}</span>
          </Menu.Item>
          <Menu.Item key='deleteContainer'>
            <span>{formatMessage(ContainerListIntl.reDistribution)}</span>
          </Menu.Item>
        </Menu>
      );
      const images = this.getImages(item)
      const status = item.status || {};
      const isLock = getDeepValue(item, [ 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ]) && true || false
      return (
        <div className={item.checked ? 'selectedContainer containerDetail' : 'containerDetail'}
          key={item.metadata.name}
          onClick={this.selectContainerDetail.bind(this, item.metadata.name)}
          >
          <div className='selectIconTitle commonData'>
            <Checkbox
              value={item.metadata.name}
              checked={item.checked} />
          </div>
          <div className='containerName commonData'>
            <Tooltip placement='topLeft' title={item.metadata.name}>
              <Link to={`/app_manage/container/${item.metadata.name}`} >
                {item.metadata.name}
              </Link>
            </Tooltip>
            {
              item.istioOn &&
              <Tooltip title={'已开启服务网格'}>
              <TenxIcon type="mesh" style={{ color: '#2db7f5', height: '16px', width: '16px' }}/>
              </Tooltip>
            }
          </div>
          <div className='containerStatus commonData'>
            <ContainerStatus container={item} />
          </div>
          <div className='serviceName commonData'>
            <Tooltip placement='topLeft' title={item.metadata.labels[LABEL_APPNAME] || ''}>
              {
                item.metadata.labels[LABEL_APPNAME]
                  ? (<Link to={`/app_manage/detail/${item.metadata.labels[LABEL_APPNAME]}`}>{item.metadata.labels[LABEL_APPNAME]}</Link>)
                  : (<span>-</span>)
              }
            </Tooltip>
          </div>
          <div className='imageName commonData'>
            <Tooltip placement='topLeft' title={images}>
              <span>{images}</span>
            </Tooltip>
            {
              isLock ?
                <Tooltip placement='top' title={'固定实例 IP，保持 IP 不变'}>
                  <Icon type="lock" style={{ marginLeft: 3 }}/>
                </Tooltip>
                : null
            }
          </div>
          <div className='visitIp commonData'>
            <Tooltip placement='topLeft' title={status.podIP}>
              <span>{status.podIP || '-'}</span>
            </Tooltip>
          </div>
          <div className='createTime commonData'>
            <Tooltip placement='topLeft' title={calcuDate(item.metadata.creationTimestamp)}>
              <span>{calcuDate(item.metadata.creationTimestamp)}</span>
            </Tooltip>
          </div>
          <div className='actionBox commonData'>
            <Dropdown.Button
              overlay={dropdown} type='ghost'
              onClick={this.openTerminalModal.bind(this, item)}>
              <TenxIcon type="terminal" size={12} className="terminal"/>
              <span style={{ marginLeft: '18px' }}>{formatMessage(ContainerListIntl.Terminal)}</span>
            </Dropdown.Button>
          </div>
          <div style={{ clear: 'both', width: '0' }}></div>
        </div >
      );
    });
    const harborProjectProps = getFieldProps('harborProjectName', {
      rules: [
        { message: formatMessage(ContainerListIntl.pleaseChoiceHarbor), required: true },
      ],
      initialValue:'',
      onChange: this.selectChange
    })
    const exportImageName = getFieldProps('exportImageName',{
      rules :  [{
        validator: this.checkImageName
      }],
    })
    const exportImageVersion = getFieldProps('exportImageVersion',{
      rules: [{
        validator: this.checkImageVersion
      }],
      initialValue: 'latest'
    })
    return (
      <div className='dataBox'>
        {items}
        <Modal
          title={formatMessage(ContainerListIntl.exportImage)}
          visible={this.state.exportImageModalVisible}
          width="570px"
          maskClosable={false}
          wrapClassName="exportImage"
          okText={formatMessage(ContainerListIntl.exportImageToHarbor)}
          footer={[
            <Button key="cancel" size='large' onClick={this.hanldeCancleExportImage}>{formatMessage(ContainerListIntl.cancel)}</Button>,
            <Button key="ok" type="primary" size="large" onClick={this.handleConfirmExportImage} loading={this.state.ModalLoadidng}>{formatMessage(ContainerListIntl.exportToImageHarbor)}</Button>
          ]}
          onOk={this.handleConfirmExportImage}
          onCancel={this.hanldeCancleExportImage}
        >
          <div className='alertRow'>
            {formatMessage(ContainerListIntl.choiceHarborAndInputImageAddress)}
          </div>
          <div className='header'>
            <Form>
              <div className='float imagename'>{formatMessage(ContainerListIntl.choiceHarborGroup)}</div>
              <div className='float imageAddress'>
                <Form.Item>
                  <Select showSearch {...harborProjectProps} size='large'>
                    {
                      (this.props.harborProjects.list || []).map(project => {
                        const currentRoleId = project[camelize('current_user_role_id')]
                        return (
                          <Option key={project.name + `/detail/${project.projectId}`} disabled={currentRoleId === 3 || project.name === TENX_STORE}>
                            {project.name} {currentRoleId == 3 && formatMessage(ContainerListIntl.visitor)}
                          </Option>
                        )}
                      )
                    }
                  </Select>
                </Form.Item>
              </div>
              <div style={{clear: 'both', height: '15px'}}></div>
              <div className='float imagename'>{formatMessage(ContainerListIntl.imageName)}&nbsp;&nbsp;&nbsp;&nbsp;</div>
              <div className='float imageAddress'>
                <Form.Item
                  help={isFieldValidating('exportImageName') ? formatMessage(ContainerListIntl.verifying) : (getFieldError('exportImageName') || []).join(', ')}
                >
                  <Input {...exportImageName} placeholder={formatMessage(ContainerListIntl.inputImageName)}  />
                </Form.Item>
              </div>
              <div className='float point'>:</div>
              <div className='float previewImageAddress'>
                <Form.Item>
                  <Input {...exportImageVersion} placeholder={formatMessage(ContainerListIntl.pleaseInputTag)}/>
                </Form.Item>
              </div>
            </Form>
          </div>
          <div className="main">
            <div className='preview'>{formatMessage(ContainerListIntl.preview)}：</div>
            <div className='address'>
              <span>
                {
                  exportimageUrl
                  ? <span>{exportimageUrl.registryConfig && exportimageUrl.registryConfig.server && xportimageUrl.registryConfig.server.substring(exportimageUrl.registryConfig.server.indexOf('://') + 3)}/{getFieldValue('harborProjectName').split('/detail/')[0] || formatMessage(ContainerListIntl.HarborGroupName)}/</span>
                  : <Spin></Spin>
                }
              </span>
              <span className='imagecolor'>{this.formatImageInfo().imageName}</span>
              <span>:</span>
              <span className='imagecolor'>{this.formatImageInfo().imageTag}</span><br/>
              {
                this.state.imageNameEqual && this.state.imageTagEqual && <div className='tips'><i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>{formatMessage(ContainerListIntl.nameAlreadyExistCoverImage)}</div>
              }
            </div>
          </div>
          <div className='footer'>
            <div className='item'>{formatMessage(ContainerListIntl.currentContainerMapVolume)}<span className='color'>{formatMessage(ContainerListIntl.excludeVolumeStorage)}</span></div>
          </div>
        </Modal>

        <Modal
          title={formatMessage(ContainerListIntl.exportImage)}
          visible={this.state.exportImageModalSuccess}
          width="570px"
          maskClosable={false}
          wrapClassName="exportImageSuccess"
          okText={formatMessage(ContainerListIntl.checkImageHarbor)}
          cancelText={formatMessage(ContainerListIntl.close)}
          onOk={this.handleViewImageStore}
          onCancel={this.hanldeClose}
        >
          <div className='container'>
            <div className='header'>
              <div>
                <Icon type="check-circle-o" className='icon'/>
              </div>
              <div className='tips'>
                {formatMessage(ContainerListIntl.operationSuccess)}
              </div>
            </div>
            <div className='footer'>
              <div className='lineone'>
                {formatMessage(ContainerListIntl.pushingToImage, { exportImageName: this.state.exportImageName })}
              </div>
              <div>{formatMessage(ContainerListIntl.maybeSpentSomeTime)}<span className='item'>『{formatMessage(ContainerListIntl.deliveryCenter)}→{formatMessage(ContainerListIntl.imageHarbor)}』</span>
              {formatMessage(ContainerListIntl.check)}
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          title={formatMessage(ContainerListIntl.prompt)}
          visible={this.state.containerErrorModal}
          width="570px"
          maskClosable={true}
          wrapClassName="WarningModal"
          onOk={this.handleInfoOK}
          onCancel={this.handleInfoCancel}
          okText={formatMessage(ContainerListIntl.gotIt)}
        >
         <div><i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>{formatMessage(ContainerListIntl.containerNoExportImage)}</div>
        </Modal>
      </div>
    );
  }
})

MyComponent = Form.create()(MyComponent)

class ContainerList extends Component {
  constructor(props) {
    super(props)
    this.loadData = this.loadData.bind(this)
    this.onAllChange = this.onAllChange.bind(this)
    this.searchContainers = this.searchContainers.bind(this)
    this.batchDeleteContainers = this.batchDeleteContainers.bind(this)
    this.confirmDeleteContainer = this.confirmDeleteContainer.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.sortCreateTime = this.sortCreateTime.bind(this)
    this.openTerminal = this.openTerminal.bind(this)
    this.state = {
      containerList: props.containerList,
      searchInputValue: props.name,
      searchInputDisabled: false,
      TerminalLayoutModal: false,
      currentContainer: [],
      checkedContainerList: [],
      forceDeleteVisble: false,
    }
  }

  loadData(nextProps, options) {
    const selt = this
    const {
      loadContainerList, cluster, page,
      size, name, sortOrder,
    } = nextProps || this.props
    const query = { page, size, name, sortOrder }
    query.customizeOpts = options
    loadContainerList(cluster, query, {
      success: {
        func: (result) => {
          // Add pod status watch, props must include statusWatchWs!!!
          addPodWatch(cluster, selt.props, result.data)
          // For fix issue #CRYSTAL-2079(load list again for update status)
          clearTimeout(self.loadStatusTimeout)
          query.customizeOpts = {
            keepChecked: true,
          }
          self.loadStatusTimeout = setTimeout(() => {
            loadContainerList(cluster, query)
          }, LOAD_STATUS_TIMEOUT)
        },
        isAsync: true
      }
    })
  }

  onAllChange(e) {
    const {checked} = e.target
    const {containerList} = this.state
    containerList.map((container) => container.checked = checked)
    this.setState({
      containerList
    })
  }

  componentWillMount() {
    this.loadData()
  }

  componentDidMount() {
    // Reload list each UPDATE_INTERVAL
    this.upStatusInterval = setInterval(() => {
      this.loadData(null, { keepChecked: true })
    }, UPDATE_INTERVAL)
  }

  componentWillUnmount() {
    const {
      cluster,
      statusWatchWs,
    } = this.props
    removePodWatch(cluster, statusWatchWs)
    clearTimeout(this.loadStatusTimeout)
    clearInterval(this.upStatusInterval)
  }

  componentWillReceiveProps(nextProps) {
    let { page, size, name, containerList, sortOrder } = nextProps
    this.setState({
      containerList
    })
    if (page === this.props.page && size === this.props.size && name === this.props.name
      && sortOrder == this.props.sortOrder) {
      return
    }
    this.setState({
      searchInputDisabled: false
    })
    this.loadData(nextProps)
  }

  batchDeleteContainers(type) {
    const {containerList} = this.state
    const checkedContainerList = containerList.filter((container) => container.checked)
    this.confirmDeleteContainer(checkedContainerList, type)
  }

  confirmDeleteContainer(checkedContainerList, type) {
    // change to handleOk()
    this.setState({
      checkedContainerList,
    })
    if (type === 'force') {
      this.setState({
        forceDeleteVisble: true,
      })
      return
    }
    this.setState({Relocating: true})
  }
  handleOk(query = {}) {
    const {cluster, deleteContainers, updateContainerList, removeTerminal, terminalList } = this.props
    const allContainers = this.props.containerList
    const containerNames = this.state.checkedContainerList.map((container) => container.metadata.name)
    if(terminalList.length){
      const deleteList = cloneDeep(this.state.checkedContainerList)
      deleteList.forEach(item => {
        removeTerminal(cluster, item)
      })
    }
    this.setState({
      Relocating: false,
      forceDeleteVisble: false,
    })
    return new Promise((resolve) => {
      deleteContainers(cluster, containerNames, query, {
        success: {
          func: () => {
            // loadData(self.props)
            resolve()
            allContainers.map(container => {
              if (containerNames.indexOf(container.metadata.name) > -1) {
                container.status.phase = 'Rebuilding'
                container.status.progress = {
                  percent: 25
                }
              }
            })
            updateContainerList(cluster, allContainers)
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            console.log(res);
            //this.loadData();
          },
          isAsync: true
        }
      })
    });
  }
  searchContainers(e) {
    const {name, pathname, sortOrder } = this.props
    const {searchInputValue} = this.state
    if (searchInputValue === name) {
      return
    }
    this.setState({
      searchInputDisabled: true
    })
    const query = {}
    if (searchInputValue) {
      query.name = searchInputValue
    }
    query.sortOrder = sortOrder
    browserHistory.push({
      pathname,
      query
    })
  }

  onPageChange(page) {
    const {size, sortOrder } = this.props
    this.updateBrowserHistory(page, size, sortOrder)
  }

  onShowSizeChange(page, size) {
    const {sortOrder} = this.props
    this.updateBrowserHistory(page, size, sortOrder)
  }

  updateBrowserHistory(page, size, sortOrder) {
    if (page === this.props.page &&
      size === this.props.size &&
      sortOrder === this.props.sortOrder) {
      return
    }

    const query = {}
    if (page !== DEFAULT_PAGE) {
      query.page = page
    }
    if (size !== DEFAULT_PAGE_SIZE) {
      query.size = size
    }
    const {name} = this.props
    if (name) {
      query.name = name
    }
    query.sortOrder = sortOrder
    const {pathname} = this.props
    browserHistory.push({
      pathname,
      query
    })
  }

  sortCreateTime() {
    let { page, size, sortOrder } = this.props
    if (sortOrder == 'asc') {
      sortOrder = 'desc'
    } else {
      sortOrder = 'asc'
    }
    this.updateBrowserHistory(page, size, sortOrder)
  }

  openTerminal(item) {
    const { addTerminal, cluster } = this.props
    addTerminal(cluster, item)
    this.setState({
      TerminalLayoutModal: true,
    })
  }

  render() {
    const parentScope = this
    const { formatMessage } = this.props.intl
    const {
      name, page, size,
      sortOrder, total, cluster,
      isFetching, instanceExport, exportimageUrl,
      loadProjectList, harborProjects, loadAllProject, loadRepositoriesTags,
      harbor,
    } = this.props
    const { containerList, searchInputValue, searchInputDisabled, forceDeleteVisble } = this.state
    const checkedContainerList = containerList.filter((app) => app.checked)
    const isChecked = (checkedContainerList.length > 0)
    let isAllChecked = (containerList.length === checkedContainerList.length)
    if (containerList.length === 0) {
      isAllChecked = false
    }
    const funcs = {
      confirmDeleteContainer: this.confirmDeleteContainer,
      openTerminal: this.openTerminal,
      loadProjectList,
    }
    let oncache = this.state.currentContainer.map((item) => {
      return item.metadata.name;
    })
    return (
      <QueueAnim
        className='ContainerList'
        type='right'
        >
        <Title title={formatMessage(ContainerListIntl.containList)}/>
        <div id='ContainerList' key='ContainerList'>
          <div className='operationBox'>
            <ResourceBanner resourceType='container'/>
            <div className='leftBox'>
              <Button
                type='primary' size='large'
                disabled={!isChecked}
                onClick={this.batchDeleteContainers}>
                <i className='fa fa-undo' />
                {formatMessage(ContainerListIntl.reDistribution)}
              </Button>
              <Button
                size="large"
                disabled={!isChecked}
                type="ghost"
                className="refresh"
                onClick={() => this.batchDeleteContainers('force')}
              >
                <i className='fa fa-trash-o'></i>
                {formatMessage(ContainerListIntl.forceDelete)}
              </Button>
              <Button
                size='large'
                className="refresh"
                onClick={() => this.loadData(this.props)}>
                <i className='fa fa-refresh'></i>
                {formatMessage(ContainerListIntl.refresh)}
              </Button>
            </div>
            <div className='rightBox'>
              <div className='littleLeft' onClick={this.searchContainers}>
                <i className='fa fa-search'></i>
              </div>
              <div className='littleRight'>
                <Input
                  size='large'
                  onChange={(e) => {
                    this.setState({
                      searchInputValue: e.target.value
                    })
                  } }
                  value={searchInputValue}
                  placeholder={formatMessage(ContainerListIntl.searchByContainerName)}
                  style={{paddingRight: '28px'}}
                  disabled={searchInputDisabled}
                  onPressEnter={this.searchContainers} />
              </div>
            </div>
            { total !== 0 && <div className='pageBox'>
              <span className='totalPage'>{formatMessage(ContainerListIntl.totals, { total })}</span>
              <div className='paginationBox'>
                <Pagination
                  simple
                  className='inlineBlock'
                  onChange={this.onPageChange}
                  onShowSizeChange={this.onShowSizeChange}
                  current={page}
                  pageSize={size}
                  total={total} />
              </div>
            </div>}
            <div className='clearDiv'></div>
          </div>
          <Modal title={formatMessage(ContainerListIntl.reDistributionOperation)} visible={this.state.Relocating}
            onOk={()=> this.handleOk()} onCancel={()=> this.setState({Relocating: false})} >
            <div className="confirm" style={{color: '#00a0ea'}}>
              <Icon type="question-circle-o" style={{ marginRight: '8px' }} />
              {formatMessage(ContainerListIntl.makeSureDistribution)}
              {
                this.state.checkedContainerList.length === 1
                ? formatMessage(ContainerListIntl.containerName, { name:this.state.checkedContainerList[0].metadata.name  })
                : formatMessage(ContainerListIntl.thisNumContainer, {length : this.state.checkedContainerList.length})
              }
           </div>
          </Modal>
          <Modal
            title={formatMessage(ContainerListIntl.forceDeleteOperation)}
            visible={forceDeleteVisble}
            closable={true}
            onOk={() => this.handleOk({force: true})}
            onCancel={() => this.setState({forceDeleteVisble: false})}
          >
            <div className="deleteRow" style={{ color: 'red' }}>
              <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
              {formatMessage(ContainerListIntl.makeSureForceDelete)}
              {
                this.state.checkedContainerList.length === 1
                  ? formatMessage(ContainerListIntl.containerName, { name:this.state.checkedContainerList[0].metadata.name  })
                  : formatMessage(ContainerListIntl.thisNumContainer, {length : this.state.checkedContainerList.length})
              }
            </div>
          </Modal>
          <Card className='containerBox'>
            <div className='containerTitle'>
              <div className='selectIconTitle commonTitle'>
                <Checkbox
                  checked={isAllChecked}
                  onChange={this.onAllChange}
                  disabled={containerList.length < 1} />
              </div>
              <div className='containerName commonTitle'>
                {formatMessage(ContainerListIntl.container)}
              </div>
              <div className='containerStatus commonTitle'>
                {formatMessage(ContainerListIntl.state)}
              </div>
              <div className='serviceName commonTitle'>
                {formatMessage(ContainerListIntl.belongApp)}
              </div>
              <div className='imageName commonTitle'>
                {formatMessage(ContainerListIntl.image)}
              </div>
              <div className='visitIp commonTitle'>
                {formatMessage(ContainerListIntl.visitAddress)}
              </div>
              <div className='createTime commonTitle' onClick={this.sortCreateTime}>
                {formatMessage(ContainerListIntl.createTime)}
                <div className="ant-table-column-sorter">
                  <span className={sortOrder == 'asc' ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                    <i className="anticon anticon-caret-up" />
                  </span>
                  <span className={sortOrder == 'desc' ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                    <i className="anticon anticon-caret-down" />
                  </span>
                </div>
              </div>
              <div className='actionBox commonTitle'>
                {formatMessage(ContainerListIntl.operation)}
              </div>
            </div>
            <MyComponent
              funcs={funcs}
              name={name}
              config={containerList}
              loading={isFetching}
              parentScope={parentScope}
              instanceExport={instanceExport}
              clusterID={cluster}
              exportimageUrl={exportimageUrl}
              harborProjects={harborProjects}
              loadAllProject={loadAllProject}
              loadRepositoriesTags={loadRepositoriesTags}
              harbor={harbor}
              formatMessage={formatMessage}
            />
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

ContainerList.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  containerList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadContainerList: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  sortOrder: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
  const {query, pathname } = props.location
  let {page, size, name, sortOrder } = query
  if (sortOrder != 'asc' && sortOrder != 'desc') {
    sortOrder = 'desc'
  }
  page = parseInt(page || DEFAULT_PAGE)
  size = parseInt(size || DEFAULT_PAGE_SIZE)
  if (isNaN(page) || page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const {cluster} = state.entities.current
  const {loginUser} = state.entities
  const {statusWatchWs} = state.entities.sockets
  const { terminal } = state
  const terminalList = terminal.list[cluster.clusterID] || []
  const defaultContainers = {
    isFetching: false,
    cluster: cluster.clusterID,
    size,
    total: 0,
    containerList: []
  }
  const {
    containerItems
  } = state.containers
  const {containerList, isFetching, total } = containerItems[cluster.clusterID] || defaultContainers
  const harborProjects = state.harbor.projects && state.harbor.projects[DEFAULT_REGISTRY] || {}
  const list = harborProjects.list || []
  const newList = []
  const visitorList = []
  list.forEach(project => {
    const currentRoleId = project[camelize('current_user_role_id')]
    if (currentRoleId === 3) {
      visitorList.push(project)
      return
    }
    newList.push(project)
  })
  harborProjects.list = newList.concat(visitorList)

  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    cluster: cluster.clusterID,
    exportimageUrl: loginUser.info,
    currentCluster: cluster,
    statusWatchWs,
    pathname,
    page,
    size,
    total,
    name,
    sortOrder,
    containerList,
    terminalList,
    isFetching,
    harborProjects,
    harbor,
  }
}

export default injectIntl(connect(mapStateToProps, {
  loadContainerList,
  deleteContainers,
  updateContainerList,
  addTerminal,
  instanceExport,
  loadProjectList,
  loadAllProject,
  loadRepositoriesTags,
  removeTerminal,
})(ContainerList),  { withRef: true })
