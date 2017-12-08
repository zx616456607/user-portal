/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageVersion component
 *
 * v0.1 - 2017-6-8
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Card, Spin, Tabs, Button, Table, Icon, Select, Input, Pagination, Dropdown, Menu, Modal } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { encodeImageFullname } from '../../../../common/tools'
import ServiceAPI from './ServiceAPI.js'
import './style/ImageVersion.less'
import NotificationHandler from '../../../../components/Notification'
import { loadRepositoriesTags, deleteAlone, loadProjectMembers } from '../../../../actions/harbor'
import { appStoreApprove } from '../../../../actions/app_store'
import isEmpty from 'lodash/isEmpty'
const TabPane = Tabs.TabPane
const Search = Input.Search
const Option = Select.Option
const MenuItem = Menu.Item

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      currentTag: null
    };
  },
  render() {
    const { loading } = this.props;
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let tagList = this.props.config
    if (!tagList || tagList.length == 0) {
      return (
        <div>镜像版本不存在</div>
      )
    }
    const fullname = this.props.fullname
    let items = tagList.map((item, index) => {
      return (
        <TabPane tab={<span><i className="fa fa-tag"></i>&nbsp;{item}</span>} className="imageDetail" key={`${item}@${index}`} >
          {<ServiceAPI imageTags={item} fullname={fullname} />}
        </TabPane>
      )
    })

    return (
      <div>{items}</div>
    )
  }
})

class ImageVersion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      serverIp: '',
      dataAry: [],
      aryName: [],
      edition: '',
      delValue: '',
      isBatchDel: false,
      warehouseName: [],
      deleteVisible: false,
      detailVisible: false,
      imageDetail: null,
      processedName: '',
    }
  }

  componentWillMount() {
    const { loadRepositoriesTags, loadRepositoriesTagConfigInfo } = this.props
    const imageDetail = this.props.config
    let processedName = encodeImageFullname(imageDetail.name)
    this.setState({
      processedName,
    })
    loadRepositoriesTags(DEFAULT_REGISTRY, processedName)
  }

  componentWillReceiveProps(nextPorps) {
    //this function mean when the user change show image detail
    //it will be check the old iamge is different from the new one or not
    //if the different is true,so that the function will be request the new one's tag
    const oldImageDatail = this.props.config;
    const newImageDetail = nextPorps.config;
    const tableData = nextPorps.detailAry
    this.setState({
      serverIp: nextPorps.scope.props.server,
    })
    const { loadRepositoriesTags } = this.props
    this.fetchData(tableData)
    if (newImageDetail.name != oldImageDatail.name) {
      let processedName = encodeImageFullname(newImageDetail.name)
      loadRepositoriesTags(DEFAULT_REGISTRY, processedName)
    }
  }

  fetchData(data) {
    const curData = []
    if (data && data.length) {
      data.forEach((item, index) => {
        const curColums = {
          id: index,
          edition: item,
        }
        curData.push(curColums)
      })
    }
    this.setState({
      dataAry: curData,
    })
  }

  handleClose() {
    this.setState({
      detailVisible: false,
    })
  }

  handleDelClose() {
    this.setState({
      deleteVisible: false,
    })
  }

  handleDetail(record) {
    this.setState({
      edition: record.edition,
      detailVisible: true,
    })
  }

  handleDelete(value) {
    this.setState({
      isBatchDel: false,
      delValue: value,
      deleteVisible: true,
    })
  }

  handleOk() {
    const { deleteAlone, scopeDetail, loadRepositoriesTags, config, isWrapStore } = this.props
    const { processedName, aryName, delValue, isBatchDel } = this.state
    let notify = new NotificationHandler()
    if (isWrapStore) {
      this.offShelfImage()
      return
    }
    const query = {
      tagName: isBatchDel ? aryName.trim() : delValue,
      registry: DEFAULT_REGISTRY,
      repoName: processedName,
    }

    deleteAlone(query, {
      success: {
        func: res => {
          if (isBatchDel) {
            notify.success(`批量删除成功`)
          } else {
            notify.success(`删除 ${processedName} 成功`)
          }
          this.setState({
            deleteVisible: false,
          })
          // scopeDetail.setState({
          //   imageDetailModalShow: false,
          // })
          scopeDetail.loadRepos()
          loadRepositoriesTags(DEFAULT_REGISTRY, config.name)
        },
        isAsync: true
      }, failed: {
        func: err => {
          if (isBatchDel) {
            notify.error(`批量删除失败`)
          } else {
            notify.error(`删除 ${processedName} 失败`)
          }
        },
        isAsync: true
      }
    })
  }

  offShelfImage() {
    const { appStoreApprove, config, scopeDetail, loadRepositoriesTags } = this.props
    const { delValue } = this.state
    let notify = new NotificationHandler()
    let offshelfId
    let versions = config.versions
    for (let i = 0; i < versions.length; i++) {
      if (versions[i].tag === delValue) {
        offshelfId = versions[i].iD
        break
      }
    }
    const body = {
      id: offshelfId,
      type: 2,
      status: 4,
      imageTagName: `${config.resourceName}:${delValue}`
    }
    appStoreApprove(body, {
      success: {
        func: () => {
          notify.success('删除成功')
          scopeDetail.setState({
            imageDetailModalShow: false,
          })
          this.setState({
            deleteVisible: false,
          })
          scopeDetail.props.getStoreList()
          scopeDetail.props.getAppsHotList()
          let processedName = encodeImageFullname(config.name)
          this.setState({
            processedName,
          })
          loadRepositoriesTags(DEFAULT_REGISTRY, processedName)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.error('删除失败')
        }
      }
    })
  }

  handleBatchDel() {
    const { warehouseName } = this.state
    let names = ''
    if (warehouseName) {
      warehouseName.forEach(item => {
        names += `,${item}`
      })
      this.setState({
        aryName: names.replace(',', ''),
        isBatchDel: true,
        deleteVisible: true,
      })
    }
  }

  handleDeploy(value) {
    const { serverIp, processedName } = this.state
    browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${serverIp}&imageName=${processedName}&tag=${value}`)
  }

  handleMenu(record, e) {
    if (e.key === 'deploy') {
      this.handleDeploy(record.edition)
    } if (e.key === 'del') {
      this.handleDelete(record.edition)
    }
  }

  onSelectChange(selectedRowKeys, selectedRows) {
    const aryData = []
    selectedRows.forEach(item => {
      aryData.push(item.edition)
    })
    this.setState({
      warehouseName: aryData
    })
  }

  handleRefresh() {
    const { config } = this.props
    loadRepositoriesTags(DEFAULT_REGISTRY, config.name)
  }

  render() {
    const { isFetching, detailAry, isAdminAndHarbor, isWrapStore } = this.props
    const { edition, dataAry, delValue, aryName, isBatchDel } = this.state
    const imageDetail = this.props.config
    const rowSelection = {
      onChange: this.onSelectChange.bind(this)
    }

    const columns = [{
      id: 'id',
      title: '版本',
      dataIndex: 'edition',
      key: 'edition',
      width: '70%',
    }, {
      title: '操作',
      dataIndex: 'comment',
      render: (text, record) => <div>
        <Dropdown.Button
          overlay={
            <Menu style={{ width: '115px' }} onClick={this.handleMenu.bind(this, record)} >
              <MenuItem key='deploy'>
                <i className="anticon anticon-appstore-o"></i> 部署镜像
              </MenuItem>
              {
                isAdminAndHarbor ?
                  <MenuItem key='del'>
                    <Icon type="delete" /> {isWrapStore ? '下架（删除）' : '删除'}
                  </MenuItem> : ''
              }
            </Menu>
          } type="ghost" onClick={this.handleDetail.bind(this, record)}>
          <Icon type="eye-o" />查看详情
          </Dropdown.Button>
      </div >
    }]

    // {
    //   title: '安全扫描',
    //   dataIndex: 'scanning',
    //   key: 'scanning',
    //   render: (text, record) => <div>
    //     <svg className='notscanning'>
    //       <use xlinkHref='#notscanning' />
    //     </svg>
    //     <span style={{ marginLeft: 5 }}>未扫描, <a>开始扫描</a></span>
    //   </div>
    // }, {
    //   title: '大小',
    //   dataIndex: 'size',
    //   key: 'size',
    // }, {
    //   title: '版本来源',
    //   dataIndex: 'source',
    //   key: 'source',
    // },

    const selectBefore = (
      <Select defaultValue="全部版本" style={{ width: 100 }}>
        <Option value="全部版本">全部版本</Option>
        <Option value="已代码分支名命名">已代码分支名命名</Option>
        <Option value="已时间数命名">已时间数命名</Option>
        <Option value="自定义版本名">自定义版本名</Option>
      </Select>)
    const pageOption = {
      simple: true,
    }
    return (
      <Card className="ImageVersion" >
        {/* {<MyComponent loading={isFetching} config={imageDetailTag} fullname={imageDetail.name ? imageDetail.name : imageDetail} />} */}
        < div className="table" >
          <div className="top">
            {
              isAdminAndHarbor && !isWrapStore ?
                <Button className="delete" disabled={this.state.warehouseName.length === 0} onClick={this.handleBatchDel.bind(this)} ><Icon type="delete" />删除</Button> : ''
            }
            <Button className="refresh" onClick={this.handleRefresh.bind(this)}><i className='fa fa-refresh' /> &nbsp;刷新</Button>
            {/* <div className='SearchInput' style={{ width: 280 }}>
              <div className='littleLeft'>
                <i className='fa fa-search' onClick={this.handleSearch} />
              </div>
              <div className='littleRight'>
                <Input
                  style={{ width: '80%' }}
                  // addonBefore={selectBefore}
                  onChange={this.handleInt}
                  placeholder={"请输入关键词搜索"}
                  onPressEnter={this.handleSearch}
                />
              </div>
            </div> */}
            <div className="right">
              <span style={{ verticalAlign: 'super' }}>共计 {dataAry.length} 条</span>
              {/* <Pagination className="pag" {...pageOption} /> */}
            </div>
          </div>
          <div className="body">
            <Table
              columns={columns}
              dataSource={dataAry}
              loading={false}
              pagination={pageOption}
              rowSelection={isWrapStore ? null : rowSelection}
            />
          </div>
        </div>
        <Modal title="镜像版本详情" visible={this.state.detailVisible} style={{ paddingRight: 5 }}
          onCancel={this.handleClose.bind(this)}
          wrapClassName="image-detail-modal"
          footer={[
            <Button key="back" type="primary" size="large" onClick={this.handleClose.bind(this)}>知道了</Button>,
          ]}>
          <ServiceAPI imageTags={edition} fullname={imageDetail.name ? imageDetail.name : imageDetail} />
        </Modal>
        <Modal title="删除版本" visible={this.state.deleteVisible}
          onCancel={this.handleDelClose.bind(this)}
          onOk={this.handleOk.bind(this)}>
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            <span>确认要删除镜像版本 {isBatchDel ? aryName : delValue} ？</span>
          </div>
        </Modal>
      </Card>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultImageDetailTag = {
    isFetching: false,
    server: '',
    tag: [],
  }
  const { location } = props
  const { pathname } = location || { pathname: '' }
  const { imageTags } = state.harbor
  let processedName = encodeImageFullname(props.config.name)
  let targetImageTag = {}
  if (imageTags[DEFAULT_REGISTRY]) {
    targetImageTag = imageTags[DEFAULT_REGISTRY][processedName] || {}
  }
  let isWrapStore = false
  if (pathname === '/app_center/wrap_store') {
    isWrapStore = true
  }
  const { tag, server } = targetImageTag || defaultImageDetailTag
  return {
    detailAry: tag,
    isFetching: targetImageTag.isFetching,
    isWrapStore
  }
}

export default connect(mapStateToProps, {
  deleteAlone,
  loadRepositoriesTags,
  loadProjectMembers,
  appStoreApprove
})(ImageVersion)