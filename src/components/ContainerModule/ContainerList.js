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
import { Tooltip, Icon, Checkbox, Card, Menu, Dropdown, Button, Input, Spin, Pagination, Modal } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/ContainerList.less'
import { loadContainerList, deleteContainers } from '../../actions/app_manage'
import { DEFAULT_CLUSTER, LABEL_APPNAME } from '../../constants'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { tenxDateFormat } from '../../common/tools.js'
import { browserHistory } from 'react-router'
import TerminalModal from '../TerminalModal'
import parseServiceDomain from '../parseDomain'

const ButtonGroup = Button.Group
const confirm = Modal.confirm

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
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
  containerOperaClick: function (name, e) {
    //this function for user click opera menu
    switch (e.key) {
      case 'deleteContainer':
        //this is delete the container
        this.deleteContainer(name);
        break;
    }
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
  onShowSizeChange: function (page, size) {
    if (size === this.props.size) {
      return
    }
    const query = {}
    if (page !== DEFAULT_PAGE) {
      query.page = page
    }
    if (size !== DEFAULT_PAGE_SIZE) {
      query.size = size
    }
    const { name } = this.props
    if (name) {
      query.name = name
    }
    const { pathname } = this.props
    browserHistory.push({
      pathname,
      query
    })
  },
  openTerminalModal: function (item, e) {
    //this function for user open the terminal modal
    e.stopPropagation();
    const { parentScope } = this.props;
    parentScope.setState({
      currentContainer: item,
      TerminalLayoutModal: true
    });
  },
  deleteContainer: function (name) {
    const { confirmDeleteContainer } = this.props.funcs
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
  render: function () {
    const { scope, config, loading, page, size, total } = this.props
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
        <Menu onClick={this.containerOperaClick.bind(this, item.metadata.name)}
          style={{ width: '100px' }}
          >
          <Menu.Item key='deleteContainer'>
            <span>重新分配</span>
          </Menu.Item>
        </Menu>
      );
      const domain = parseServiceDomain(item)
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
            <i className={item.status.phase == 'Running' ? 'normal fa fa-circle' : 'error fa fa-circle'}></i>
            <span className={item.status.phase == 'Running' ? 'normal' : 'error'} >{item.status.phase}</span>
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
            <Tooltip placement='topLeft' title={item.images.join(', ')}>
              <span>{item.images.join(', ')}</span>
            </Tooltip>
          </div>
          <div className='visitIp commonData'>
            <Tooltip placement='topLeft' title={item.status.podIP}>
              <span>{item.status.podIP}</span>
            </Tooltip>
            <br />
            <Tooltip placement='topLeft' title={domain}>
              {
                domain ?
                  (<a target="_blank" href={domain}>{domain}</a>) : (<span>-</span>)
              }
            </Tooltip>
          </div>
          <div className='createTime commonData'>
            <Tooltip placement='topLeft' title={tenxDateFormat(item.metadata.creationTimestamp)}>
              <span>{tenxDateFormat(item.metadata.creationTimestamp)}</span>
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
    return (
      <div className='dataBox'>
        {items}
      </div>
    );
  }
})

function loadData(props) {
  const { loadContainerList, cluster, page, size, name } = props
  loadContainerList(cluster, { page, size, name })
}

class ContainerList extends Component {
  constructor(props) {
    super(props)
    this.onAllChange = this.onAllChange.bind(this)
    this.searchContainers = this.searchContainers.bind(this)
    this.closeTerminalLayoutModal = this.closeTerminalLayoutModal.bind(this)
    this.batchDeleteContainers = this.batchDeleteContainers.bind(this)
    this.confirmDeleteContainer = this.confirmDeleteContainer.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.state = {
      containerList: props.containerList,
      searchInputValue: props.name,
      searchInputDisabled: false,
      TerminalLayoutModal: false,
      currentContainer: null
    }
  }

  onAllChange(e) {
    const { checked } = e.target
    const { containerList } = this.state
    containerList.map((container) => container.checked = checked)
    this.setState({
      containerList
    })
  }

  componentWillMount() {
    document.title = '容器列表 | 时速云'
    loadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    let { page, size, name, containerList } = nextProps
    this.setState({
      containerList
    })
    if (page === this.props.page && size === this.props.size && name === this.props.name) {
      return
    }
    this.setState({
      searchInputDisabled: false
    })
    loadData(nextProps)
  }

  batchDeleteContainers(e) {
    const { containerList } = this.state
    const checkedContainerList = containerList.filter((container) => container.checked)
    this.confirmDeleteContainer(checkedContainerList)
  }

  confirmDeleteContainer(containerList) {
    const self = this
    const { cluster, deleteContainers } = this.props
    const containerNames = containerList.map((container) => container.metadata.name)
    confirm({
      title: `您是否确认要重新分配这${containerNames.length}个容器`,
      content: containerNames.join(', '),
      onOk() {
        return new Promise((resolve) => {
          deleteContainers(cluster, containerNames, {
            success: {
              func: () => loadData(self.props),
              isAsync: true
            }
          })
          resolve()
        });
      },
      onCancel() { },
    });
  }

  searchContainers(e) {
    const { name, pathname } = this.props
    const { searchInputValue } = this.state
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
    browserHistory.push({
      pathname,
      query
    })
  }

  closeTerminalLayoutModal() {
    //this function for user close the terminal modal
    this.setState({
      TerminalLayoutModal: false
    });
  }
  
  onPageChange(page) {
    if (page === this.props.page) {
      return ;
    }
    const { pathname, size, name } = this.props
    const query = {}
    if (page !== 1) {
      query.page = page
      query.size = size
    }
    if (name) {
      query.name = name
    }
    browserHistory.push({
      pathname,
      query
    })
  }

  render() {
    const parentScope = this
    const { name, pathname, page, size, total, cluster, containerList, isFetching } = this.props
    const { searchInputValue, searchInputDisabled } = this.state
    const checkedContainerList = containerList.filter((app) => app.checked)
    const isChecked = (checkedContainerList.length > 0)
    let isAllChecked = (containerList.length === checkedContainerList.length)
    if (containerList.length === 0) {
      isAllChecked = false
    }
    const funcs = {
      confirmDeleteContainer: this.confirmDeleteContainer,
    }
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
            </div>
            <div className='rightBox'>
              <div className='littleLeft' onClick={this.searchContainers}>
                <i className='fa fa-search'></i>
              </div>
              <div className='littleRight'>
                <Input
                  onChange={(e) => {
                    this.setState({
                      searchInputValue: e.target.value
                    })
                  } }
                  value={searchInputValue}
                  placeholder='输入容器名回车搜索'
                  disabled={searchInputDisabled}
                  onPressEnter={this.searchContainers} />
              </div>
            </div>
            <div className='pageBox'>
              <span className='totalPage'>共{total}条</span>
              <div className='paginationBox'>
                <Pagination
                  simple
                  className='inlineBlock'
                  onChange={this.onPageChange}
                  defaultCurrent={page}
                  pageSize={size}
                  total={total} />
              </div>
            </div>
            <div className='clearDiv'></div>
          </div>
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
              <div className='createTime commonTitle'>
                创建时间
              <i className='fa fa-sort'></i>
              </div>
              <div className='actionBox commonTitle'>
                操作
              </div>
            </div>
            <MyComponent
              funcs={funcs}
              size={size} total={total} pathname={pathname} page={page} name={name}
              config={containerList} loading={isFetching} parentScope={parentScope} />
          </Card>
        </div>
        <Modal
          visible={this.state.TerminalLayoutModal}
          className='TerminalLayoutModal'
          transitionName='move-down'
          onCancel={this.closeTerminalLayoutModal}
          >
          <TerminalModal scope={parentScope} config={this.state.currentContainer} />
        </Modal>
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
}

function mapStateToProps(state, props) {
  const { query, pathname } = props.location
  let { page, size, name } = query
  page = parseInt(page || DEFAULT_PAGE)
  size = parseInt(size || DEFAULT_PAGE_SIZE)
  if (isNaN(page) || page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const defaultContainers = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    size,
    total: 0,
    containerList: []
  }
  const {
    containerItems
  } = state.containers
  const { cluster, containerList, isFetching, total } = containerItems[DEFAULT_CLUSTER] || defaultContainers

  return {
    cluster,
    pathname,
    page,
    size,
    total,
    name,
    containerList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadContainerList,
  deleteContainers,
})(ContainerList)