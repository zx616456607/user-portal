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
import { Tooltip, Icon, Checkbox, Card, Menu, Dropdown, Button, Input, Spin, Pagination, Modal, Form } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/ContainerList.less'
import { loadContainerList, deleteContainers, updateContainerList } from '../../actions/app_manage'
import { addTerminal } from '../../actions/terminal'
import { LABEL_APPNAME, LOAD_STATUS_TIMEOUT, UPDATE_INTERVAL } from '../../constants'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { calcuDate } from '../../common/tools.js'
import { browserHistory } from 'react-router'
import ContainerStatus from '../TenxStatus/ContainerStatus'
import { addPodWatch, removePodWatch } from '../../containers/App/status'
import { instanceExport } from '../../actions/instance_export'
import NotificationHandler from '../../common/notification_handler'

const ButtonGroup = Button.Group
const confirm = Modal.confirm

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
      containerErrorModal: false
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
        this.exportImageModal(name, status)
        return
      default:
        return
    }
  },
  exportImageModal(name, status){
    if(status == 'Running'){
      const { form } = this.props
      const { setFieldsValue } = form
      setFieldsValue({
        'exportImageName': undefined,
        'exportImageVersion': 'laest',
      })
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
  handleConfirmExportImage(){
    const { form, instanceExport, clusterID } = this.props
    const { getFieldValue } = form
    const { exportContainerName } = this.state
    this.setState({
      ModalLoadidng: true
    })
    let imagename = getFieldValue('exportImageName')
    let tag = getFieldValue('exportImageVersion')
    let Notification = new NotificationHandler()
    if(imagename == undefined || tag == undefined){
      this.setState({
        ModalLoadidng: false
      })
      return Notification.error('请输入镜像名称和版本！')
    }
    if(!/^([a-z0-9]+((?:[._]|__|[-]*)[a-z0-9]+)*)?$/.test(imagename)){
      this.setState({
        ModalLoadidng: false
      })
      return Notification.error('请输入镜像名称不合法！')
    }
    if(!/^([\w][\w.-]{0,127})?$/.test(tag)){
      this.setState({
        ModalLoadidng: false
      })
      return Notification.error('请输入镜像版本不合法！')
    }
    let body = {
      body:{
        imagename,
        tag,
      },
      clusterID,
      containers:exportContainerName
    }
    instanceExport(body,{
      success: {
        func: (res) => {
          if(res.statusCode && res.statusCode == 204){
            Notification.error('导出镜像失败！当前平台镜像仓库不完整')
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
          Notification.error('导出镜像失败！')
          this.setState({
            exportImageModalVisible: false,
            exportContainerName: '',
            ModalLoadidng:false
          })
        }
      }
    })
  },
  hanldeCancleExportImage(){
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({
      'exportImageName': undefined,
      'exportImageVersion': 'laest',
    })
    this.setState({
      exportImageModalVisible : false
    })
  },
  formatImageInfo(){
    const { form } = this.props
    const { getFieldValue } = form
    let imageName = getFieldValue('exportImageName') ? getFieldValue('exportImageName') : '镜像名称'
    let imageTag = getFieldValue('exportImageVersion') ? getFieldValue('exportImageVersion') : '标签'
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
    browserHistory.push('/app_center')
  },
  hanldeClose(){
    this.setState({
      exportImageModalSuccess : false
    })
  },
  checkImageName(rule, value, callback){
    if(!value){
      return callback('请输入镜像地址')
    }
    if(!/^([a-z0-9]+((?:[._]|__|[-]*)[a-z0-9]+)*)?$/.test(value)){
      return callback('镜像地址只能为小写字母和数字')
    }
    return callback()
  },
  checkImageVersion(rule, value, callback){
    if(!value){
      return callback('请输入镜像版本')
    }
    if(!/^([\w][\w.-]{0,127})?$/.test(value)){
      return callback('镜像版本只能以数字或字母开头')
    }
    return callback()
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
  deleteContainer: function (name) {
    const { config, funcs } = this.props
    const { confirmDeleteContainer } = funcs
    const container = {
      metadata: {
        name
      }
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
    const { getFieldProps } = form
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
          暂无数据
        </div>
      )
    }
    const items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.containerOperaClick.bind(this, item.metadata.name, item.status.phase)}
          style={{ width: '100px' }}
          >
          <Menu.Item key='exportImage'>
            <span>导出镜像</span>
          </Menu.Item>
          <Menu.Item key='deleteContainer'>
            <span>重新分配</span>
          </Menu.Item>
        </Menu>
      );
      const images = this.getImages(item)
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
          </div>
          <div className='visitIp commonData'>
            <Tooltip placement='topLeft' title={item.status.podIP}>
              <span>{item.status.podIP || '-'}</span>
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
              <svg className='terminal'>
                <use xlinkHref='#terminal' />
              </svg>
              <span style={{ marginLeft: '20px' }}>终端</span>
            </Dropdown.Button>
          </div>
          <div style={{ clear: 'both', width: '0' }}></div>
        </div >
      );
    });
    const exportImageName = getFieldProps('exportImageName',{
      rules :  [{
        validator: this.checkImageName
      }]
    })
    const exportImageVersion = getFieldProps('exportImageVersion',{
      rules: [{
        validator: this.checkImageVersion
      }],
      initialValue: 'laest'
    })
    return (
      <div className='dataBox'>
        {items}
        <Modal
          title="导出镜像"
          visible={this.state.exportImageModalVisible}
          width="570px"
          confirmLoading={this.state.ModalLoadidng}
          maskClosable={false}
          wrapClassName="exportImage"
          okText="导出镜像到仓库"
          onOk={this.handleConfirmExportImage}
          onCancel={this.hanldeCancleExportImage}
        >
          <div className='header'>
            <Form>
              <div className='float imagename'>镜像名称</div>
              <div className='float imageAddress'>
                <Form.Item>
                  <Input {...exportImageName} placeholder='请填写镜像名称' />
                </Form.Item>
              </div>
              <div className='float point'>:</div>
              <div className='float previewImageAddress'>
                <Form.Item>
                  <Input {...exportImageVersion} placeholder='请填写标签'/>
                </Form.Item>
              </div>
            </Form>
          </div>
          <div className="main">
            <div className='preview'>预览：</div>
            <div className='address'>
              <span>
                {
                  exportimageUrl
                  ? <span>{exportimageUrl.registryConfig.server}/</span>
                  : <Spin></Spin>
                }
              </span>
              <span className='color'>{this.formatImageInfo().imageName}</span>
              <span className='point'>:</span>
              <span className='color'>{this.formatImageInfo().imageTag}</span>
            </div>
          </div>
          <div className='footer'>
            <div className='item'>当前容器有映射 Volume 目录，此次导出的镜像<span className='color'>不包含 Volume 的存储目录</span></div>
            <div><Icon type="exclamation-circle-o" style={{marginRight:'8px'}}/>
              系统会按照上面输入的镜像地址，将导出的镜像推送到对应的仓库中。</div>
          </div>
        </Modal>

        <Modal
          title='导出镜像'
          visible={this.state.exportImageModalSuccess}
          width="570px"
          maskClosable={false}
          wrapClassName="exportImageSuccess"
          okText="查看镜像仓库"
          cancelText="关闭"
          onOk={this.handleViewImageStore}
          onCancel={this.hanldeClose}
        >
          <div className='container'>
            <div className='header'>
              <div>
                <Icon type="check-circle-o" className='icon'/>
              </div>
              <div className='tips'>
                操作成功
              </div>
            </div>
            <div className='footer'>
              <div className='lineone'>
                正在推送 <span>{this.state.exportImageName}</span> 到镜像仓库
              </div>
              <div>可能会花一些时间，请稍后至<span className='item'>『交付中心→镜像仓库』</span>查看</div>
            </div>
          </div>
        </Modal>

        <Modal
          title='警告'
          visible={this.state.containerErrorModal}
          width="570px"
          maskClosable={true}
          wrapClassName="WarningModal"
          onOk={this.handleInfoOK}
          onCancel={this.handleInfoCancel}
        >
         <div><i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>容器运行状态不正常，不能导出镜像!</div>
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
      checkedContainerList: []
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
    document.title = '容器列表 | 时速云'
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
    let { page, size, name, containerList, cluster, sortOrder, currentCluster } = nextProps
    this.setState({
      containerList
    })
    if (currentCluster.clusterID !== this.props.currentCluster.clusterID || currentCluster.namespace !== this.props.currentCluster.namespace) {
      this.loadData(nextProps)
      return
    }
    if (page === this.props.page && size === this.props.size && name === this.props.name
      && sortOrder == this.props.sortOrder) {
      return
    }
    this.setState({
      searchInputDisabled: false
    })
    this.loadData(nextProps)
  }

  batchDeleteContainers(e) {
    const {containerList} = this.state
    const checkedContainerList = containerList.filter((container) => container.checked)
    this.confirmDeleteContainer(checkedContainerList)
  }

  confirmDeleteContainer(checkedContainerList) {
    // change to handleOk()
    this.setState({Relocating: true, checkedContainerList})
  }
  handleOk() {
    const {cluster, deleteContainers, updateContainerList } = this.props
    const allContainers = this.props.containerList
    const containerNames = this.state.checkedContainerList.map((container) => container.metadata.name)
    this.setState({Relocating: false})
    return new Promise((resolve) => {
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
      deleteContainers(cluster, containerNames, {
        success: {
          func: () => {
            // loadData(self.props)
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
    const {
      name, page, size,
      sortOrder, total, cluster,
      isFetching, instanceExport, exportimageUrl
    } = this.props
    const {containerList, searchInputValue, searchInputDisabled } = this.state
    const checkedContainerList = containerList.filter((app) => app.checked)
    const isChecked = (checkedContainerList.length > 0)
    let isAllChecked = (containerList.length === checkedContainerList.length)
    if (containerList.length === 0) {
      isAllChecked = false
    }
    const funcs = {
      confirmDeleteContainer: this.confirmDeleteContainer,
      openTerminal: this.openTerminal,
    }
    let oncache = this.state.currentContainer.map((item) => {
      return item.metadata.name;
    })
    return (
      <QueueAnim
        className='ContainerList'
        type='right'
        >
        <div id='ContainerList' key='ContainerList'>
          <div className='operationBox'>
            <div className='leftBox'>
              <Button
                type='primary' size='large'
                disabled={!isChecked}
                onClick={this.batchDeleteContainers}>
                <i className='fa fa-power-off'></i>
                重新分配
              </Button>
              <Button
                size='large'
                onClick={() => this.loadData(this.props)}>
                <i className='fa fa-refresh'></i>
                刷新
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
                  placeholder='按容器名称搜索'
                  style={{paddingRight: '28px'}}
                  disabled={searchInputDisabled}
                  onPressEnter={this.searchContainers} />
              </div>
            </div>
            <div className='pageBox'>
              <span className='totalPage'>共 {total}条</span>
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
            </div>
            <div className='clearDiv'></div>
          </div>
          <Modal title="重新分配操作" visible={this.state.Relocating}
            onOk={()=> this.handleOk()} onCancel={()=> this.setState({Relocating: false})} >
            <div className="confirm" style={{color: '#00a0ea'}}>
              <Icon type="question-circle-o" style={{ marginRight: '8px' }} />
              您是否确定要重新分配
              {
                this.state.checkedContainerList.length === 1
                ? `容器 ${this.state.checkedContainerList[0].metadata.name} ？`
                : `这${this.state.checkedContainerList.length}个容器？`
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
                容器名称
              </div>
              <div className='containerStatus commonTitle'>
                状态
              </div>
              <div className='serviceName commonTitle'>
                所属应用
              </div>
              <div className='imageName commonTitle'>
                镜像
              </div>
              <div className='visitIp commonTitle'>
                访问地址
              </div>
              <div className='createTime commonTitle' onClick={this.sortCreateTime}>
                创建时间
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
                操作
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
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadContainerList,
  deleteContainers,
  updateContainerList,
  addTerminal,
  instanceExport,
})(ContainerList)