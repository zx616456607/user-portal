/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * IaasTab Tab1
 *
 * v0.1 - 2018-04-08
 * @author rensiwei
 */
import React from 'react'
import {
  Spin, Button, Table, Menu, Dropdown,
  Card, Pagination, Modal, Input, Select,
} from 'antd'
import classNames from 'classnames'
import sortBy from 'lodash/sortBy'
import '../style/StrategyTab.less'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import Tab1Modal from './StrategyTabModal'
import Tab2Modal from '../../../IaasModule/Modal'
import NotificationHandler from '../../../../../src/components/Notification'
import filter from 'lodash/filter'
import cloneDeep from 'lodash/cloneDeep'

const notify = new NotificationHandler()
const Option = Select.Option

let tableData = []
let _tab1modal

class Tab1 extends React.Component {
  state = {
    isSearchFocus: false, // 搜索框选中状态
    searchValue: '', // 搜索框值
    current: 1, // 当前页
    currentData: tableData[0] || {}, // 点击名称缓存当前选中行元素
    isShowTab1List: true, // 伸缩策略中显示第一页， false第二页
    selectedRowKeys: [], // 选中行元素的keys
    isTab1ModalShow: false, // 新建策略modal 显示状态
    isTab2ModalShow: false, // 新建配置modal 显示状态
    isEdit: false,
    deleteLoading: false, // 删除确定按钮
    submitTab1Loading: false,
    isShowDelModal: false,
    searchType: '1',
    resList: [],
  }

  openModalByAdd = () => {
    this.setState({ isTab1ModalShow: true, isEdit: false, currentData: {} })
  }
  dropDown = (key, rowData) => {
    switch (key) {
      case 'edit':
        this.edit(rowData)
        break
      case 'changeStatus':
        this.onOffItem(rowData)
        break
      case 'del':
        this.showDelModal(rowData)
        break
      default:
        break
    }
  }
  edit = rowData => {
    this.setState({
      isTab1ModalShow: true,
      isEdit: true,
      currentData: rowData,
    })
  }
  showDelModal = rowData => {
    this.setState({
      currentData: rowData,
      isShowDelModal: true,
    })
  }

  onCancel = () => {
    this.setState({
      currentData: '',
      isShowDelModal: false,
    })
  }
  del = () => {
    const common = () => {
      this.setState({
        isShowDelModal: false,
        currentData: '',
        deleteLoading: false,
      })
    }
    this.setState({
      deleteLoading: true,
    },
    () => {
      const { currentData } = this.state
      this.props.deleteApp({ cluster: currentData.cluster, type: currentData.iaasType }, {
        success: {
          func: () => {
            // 刷新列表
            this.loadData()
            notify.success(`策略 ${currentData.name} 删除成功`)
            common()
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            const { message } = err
            notify.warn(`删除策略 ${currentData.name} 失败， ${message.message || message}`)
            common()
          },
          isAsync: true,
        },
      })
    })
  }

  onOffItem = rowData => {
    this.props.changeAppStatus({ cluster: rowData.cluster, type: rowData.iaasType }, {
      success: {
        func: () => {
          notify.success(`策略 ${rowData.name} ${rowData.status === 'on' ? '停用' : '启用'} 成功`)
          this.loadData()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { message } = err
          notify.warn(`${rowData.status === 'on' ? '停用' : '启用'} 失败， ${message.message || message}`)
        },
      },
    })
  }
  reflesh = () => {
    this.loadData()
  }

  onRowChange = selectedRowKeys => {
    this.setState({ selectedRowKeys })
  }
  // search focus事件
  handleFocusBlur = e => {
    this.setState({
      isSearchFocus: e.target === document.activeElement,
    })
  }
  // search
  handleSearchChange = e => {
    this.setState({ searchValue: e.target.value })
  }
  onPageChange = page => {
    const pagination = JSON.parse(JSON.stringify(this.state.pagination))
    pagination.current = page
    this.setState({ current: page })
  }
  clickTableRowName = rowData => {
    const temp = JSON.parse(JSON.stringify(rowData))
    this.setState({ currentData: temp, isShowTab1List: false })
    const { getResList, getLogList } = this.props
    getLogList({ cluster: rowData.cluster })
    getResList(temp.iaasId, {
      type: temp.iaasType,
    }, {
      success: {
        func: res => {
          this.setState({
            resList: res.data,
          })
        },
        isAsync: true,
      },
    })
  }
  returnPart1 = () => {
    this.setState({ isShowTab1List: true })
  }
  onTab1ModalCancel = () => {
    this.setState({ isTab1ModalShow: false })
  }
  onTab1ModalOk = params => {
    this.setState({
      submitTab1Loading: true,
    }, () => {
      const { addApp, updateApp } = this.props
      const { isEdit } = this.state
      const resetState = {
        isTab1ModalShow: false,
        isEdit: false,
        current: 1,
      }
      params.duration = params.duration + ''// 转字符串
      // 新增、修改接口
      if (isEdit) {
        updateApp(params, {
          success: {
            func: () => {
              notify.success(`策略 ${params.name} 更新成功`)
              this.loadData()
              this.setState(resetState)
            },
            isAsync: true,
          },
          failed: {
            func: err => {
              const { message } = err
              notify.warn(`更新策略 ${params.name} 失败，${message || message.message}`)
            },
          },
          finally: {
            func: () => this.setState({ submitTab1Loading: false }),
          },
        })
      } else {
        addApp(params,
          {
            success: {
              func: () => {
                notify.success(`策略 ${params.name} 新建成功`)
                this.loadData()
                this.setState(resetState)
              },
              isAsync: true,
            },
            failed: {
              func: err => {
                const { statusCode, message } = err
                notify.warn(`新建策略 ${params.name} 失败，错误代码: ${statusCode}， ${message.message}`)
              },
            },
            finally: {
              func: () => this.setState({ submitTab1Loading: false }),
            },
          })
      }
    })
  }

  renderLineItem = (item, i, isLast) => {
    // let color = '#2fba67'
    // if (item.diff) {
    //   color = '#2cb8f6'
    // }
    const className = 'ant-timeline-item ' + (isLast ? 'ant-timeline-item-last' : '')
    return <li className={className} key={i}>
      <div className="ant-timeline-item-tail"></div>
      <div className="ant-timeline-item-head ant-timeline-item-head-custom ant-timeline-item-head-blue">
        <i className="anticon anticon-exclamation-circle"></i>
      </div>
      <div className="ant-timeline-item-content">
        <span className="message">{item.message}</span>
        <span>{item.date}</span>
      </div>
    </li>
  }
  closeTab1Modal = tab1modal => {
    _tab1modal = tab1modal
    this.setState({
      isTab1ModalShow: false,
    }, () => {
      this.setState({
        isTab2ModalShow: true,
      })
    })
  }
  onTab2ModalCancel = _cb => {
    this.setState({ isTab2ModalShow: false, isTab1ModalShow: true }, () => {
      _tab1modal.resetState()
      !!_cb && _cb()
    })
  }
  loadData = () => {
    const { searchValue, searchType } = this.state
    const query = {
      from: 0,
      size: 999,
    }
    if (searchValue) {
      if (searchType === '1') {
        query.name = encodeURIComponent(searchValue)
      } else {
        query.resource_pool = encodeURIComponent(searchValue)
      }
    }
    this.props.getAppList(query)
  }
  onSelectChange = searchType => {
    this.setState({
      searchType,
    })
  }
  render() {
    const { appList, isTab1Fetching, logList, isLogFetching } = this.props
    const { isShowDelModal, deleteLoading, currentData, current,
      isShowTab1List, isEdit, searchValue, searchType, resList,
      submitTab1Loading, isTab1ModalShow, isTab2ModalShow } = this.state
    const _that = this
    const columns = (() => {
      const clickTableRowName = this.clickTableRowName.bind(this)
      return [{
        title: '策略名称',
        dataIndex: 'name',
        width: 100,
        render: (text, rowData) => {
          return (
            <a onClick={() => { clickTableRowName(rowData) }} data-row={rowData}>{text}</a>
          )
        },
      },
      {
        title: '开启状态',
        dataIndex: 'status',
        width: 100,
        render: status => (status === 'on' ? <div className="isOnCon"><i className="fa fa-circle"></i>启用</div> : <div className="isOffCon"><i className="fa fa-circle"></i>停用</div>),
      },
      {
        title: '集群',
        dataIndex: 'clustername',
        width: 100,
      },
      {
        title: '资源池',
        dataIndex: 'iaasName',
        width: 100,
      },
      {
        title: 'Iaas',
        dataIndex: 'iaasType',
        width: 100,
      },
      {
        title: '最少保留',
        dataIndex: 'min',
        width: 100,
      }, {
        title: '最大扩展',
        dataIndex: 'max',
        width: 100,
      },
      {
        title: 'Email',
        dataIndex: 'email',
        width: 100,
        render: email => (email ? email : '-'),
      },
      {
        title: '操作',
        width: 100,
        render(text, rowData) {
          const menu = (
            <Menu className="tab1DropdownMenu" onClick={e => { _that.dropDown(e.key, rowData) }}>
              <Menu.Item key="changeStatus">{ rowData.status === 'on' ? '停用' : '启用'}</Menu.Item>
              <Menu.Item key="del">删除</Menu.Item>
            </Menu>
          )
          return (
            <div>
              <Dropdown.Button onClick={() => { _that.dropDown('edit', rowData) }} overlay={menu} type="ghost">
              编辑
              </Dropdown.Button>
            </div>
          )
        },
      }]
    })()
    const part1Class = classNames({
      part1: true,
      sliderIn: isShowTab1List,
      hidden: !isShowTab1List,
    })
    const part2Class = classNames({
      part2: true,
      sliderIn: !isShowTab1List,
      hidden: isShowTab1List,
    })
    let total = tableData.length
    if (appList) {
      const temp = cloneDeep(appList)
      tableData = temp.slice((current - 1) * 10, current * 10)
      total = appList.length
    } else {
      tableData = []
      total = 0
    }
    let loglen = 0,
      linelist = <div className="noLogs">暂无数据</div>
    if (!!logList && logList.log) {
      loglen = logList.log.length
      const sortlogList = sortBy(logList.log, o => new Date(o.date))
      linelist = sortlogList.reverse().map((item, i) => {
        const isLast = loglen === (i + 1)
        const line = this.renderLineItem(item, i, isLast)
        return line
      })
    }
    const func = {
      scope: this,
    }

    const selectBefore = (
      <Select value={searchType} style={{ width: 90 }} onChange={this.onSelectChange}>
        <Option value="1">策略名称</Option>
        <Option value="2">资源池名称</Option>
      </Select>
    )
    return (
      <div className="tab1Content">
        <QueueAnim>
          <div className={part1Class} key="part1">
            <div className="btnPanel">
              <Button type="primary" size="large" onClick={this.openModalByAdd} style={{ marginRight: '10px' }}>
                <i className="fa fa-plus" />&nbsp;新建策略
              </Button>
              <Button type="ghost" className="refreshBtn" size="large" onClick={this.reflesh}>
                <i className="fa fa-refresh" />&nbsp;刷新
              </Button>
              { total !== 0 && <div className="pageBox">
                <span className="totalPage">共 {total} 条</span>
                <div className="paginationBox">
                  <Pagination
                    simple
                    className="inlineBlock"
                    onChange={this.onPageChange}
                    current={current}
                    defaultCurrent={1}
                    pageSize={10}
                    total={total} />
                </div>
              </div>}
              <div className="rightBox">
                <div className="littleLeft" onClick={this.loadData}>
                  <i className="fa fa-search" />
                </div>
                <div className="littleRight">
                  <Input
                    className="selectInp"
                    addonBefore={selectBefore}
                    size="large"
                    onChange={this.handleSearchChange}
                    value={searchValue}
                    placeholder={searchType === '1' ? '按策略名称搜索' : '按照资源池名称搜索'}
                    style={{ paddingRight: 28 }}
                    onPressEnter={this.loadData} />
                </div>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className="tablePanel">
              <Card>
                {/* {
                    !!isTab1Fetching ?
                    <div className="loadingBox">
                      <Spin size="large"/>
                    </div>
                :*/}
                <div className="reset_antd_table_header">
                  <Table
                    columns={columns}
                    loading={isTab1Fetching}
                    dataSource={tableData} />
                </div>
                {/* }*/}
              </Card>
            </div>
          </div>
          <div className={part2Class} key="part2">
            <div className="titleContainer">
              {/* <Button className="btnItem" type="primary" onClick={this.returnPart1}>返回</Button>
                <span className="line"></span>
                <span className="title">增加节点策略</span>*/}
              <div className="goBackBox">
                <span className="goBackBtn pointer" onClick={this.returnPart1}>返回</span>
                <i />
                  增加节点策略
              </div>
            </div>
            <div className="cardContainer">
              <Card className="left" title="基本属性" bordered={false}>
                <div className="cardPart">
                  <p><span className="leftTitle">策略名称</span><span className="rightContent">{currentData.name}</span></p>
                  <p><span className="leftTitle">开启状态</span>
                    {currentData.status === 'on' ?
                      <span className="rightContent isOnCon"><i className="fa fa-circle"></i>启用</span>
                      :
                      <span className="rightContent isOffCon"><i className="fa fa-circle"></i>停用</span>
                    }
                  </p>
                  <p><span className="leftTitle">集群</span><span className="rightContent">{currentData.clustername}</span></p>
                  <p><span className="leftTitle">资源池名称</span><span className="rightContent">{currentData.iaasName}</span></p>
                  <p><span className="leftTitle">IaaS平台</span><span className="rightContent">{(() => {
                    if (currentData.iaasType === 'vmware') {
                      return 'vmware'
                    } else if (currentData.iaasType === 'openstack') {
                      return 'openstack'
                    }
                  })()}</span></p>
                </div>
                <div className="cardPart">
                  {
                    (() => {
                      if (currentData.iaasType === 'vmware') {
                        return [
                          <p><span className="leftTitle">数据中心</span><span className="rightContent">{currentData.datacenter}</span></p>,
                          <p><span className="leftTitle">虚拟机模版</span><span className="rightContent">{currentData.templatePath}</span></p>,
                          <p><span className="leftTitle">计算资源池</span><span className="rightContent">{currentData.resourcePoolPath}</span></p>,
                          <p><span className="leftTitle">存储资源池</span><span className="rightContent">{currentData.datastorePath}</span></p>,
                        ]
                      } else if (currentData.iaasType === 'openstack') {
                        return [
                          <p><span className="leftTitle">可用域</span><span className="rightContent">{currentData.zoneName}</span></p>,
                          <p><span className="leftTitle">镜像</span><span className="rightContent">{resList && resList.images && resList.images.length ? filter(resList.images, { id: currentData.image })[0].name : currentData.image}</span></p>,
                          <p><span className="leftTitle">镜像初始密码</span><span className="rightContent">{currentData.loginPass}</span></p>,
                          <p><span className="leftTitle">配置规格 (类型) </span><span className="rightContent">{resList && resList.flavors && resList.flavors.length ? filter(resList.flavors, { id: currentData.flavor })[0].name : currentData.flavor}</span></p>,
                          <p><span className="leftTitle">网络</span><span className="rightContent">{currentData.networkName}</span></p>,
                          <p><span className="leftTitle">安全组</span><span className="rightContent">{currentData.secgroups}</span></p>,
                        ]
                      }
                    })()
                  }
                </div>
                <div className="cardPart">
                  <p><span className="leftTitle">最少保留</span><span className="rightContent">{currentData.min + ' 个'}</span></p>
                  <p><span className="leftTitle">最大扩展</span><span className="rightContent">{currentData.max + ' 个'}</span></p>
                  {/* <p><span className="leftTitle">阈值</span>
                    <span className="rightContent">{currentData.xxx1}</span></p> */}
                  {/* <p><span className="leftTitle">伸缩活动</span>
                    <span className="rightContent">{"增加 " + currentData.max + " 台"}</span></p> */}
                </div>
                <div className="cardPart">
                  <p><span className="leftTitle">Email</span><span className="rightContent">{currentData.email ? currentData.email : '-'}</span></p>
                  <p><span className="leftTitle">策略冷却时间</span><span className="rightContent">{currentData.duration}</span></p>

                </div>
                <div style={{ clear: 'both' }}></div>
              </Card>
              <Card className="right" title={(() => {
                return (
                  [
                    <span>伸缩日志</span>,
                    <span style={{ fontSize: '12px', color: '#d9d9d9', fontWeight: 'normal' }}>&nbsp;日志暂只支持保留一小时</span>,
                  ]
                )
              })()} bordered={false}>
                <div className="appAutoScaleLogs">
                  {
                    (() => {
                      let rele
                      if (isLogFetching) {
                        rele = <div className="loadingBox">
                          <Spin size="large"/>
                        </div>
                      } else {
                        if (logList) {
                          rele = <ul className="ant-timeline">
                            {linelist}
                          </ul>
                        } else {
                          rele = <div style={{ textAlign: 'center' }}>暂无数据</div>
                        }
                      }
                      return rele
                    })()
                  }
                </div>
              </Card>
            </div>
          </div>
        </QueueAnim>
        {
          isTab1ModalShow ?
            <Tab1Modal
              isEdit={isEdit}
              allData={appList}
              currentData={currentData}
              confirmLoading={submitTab1Loading}
              func={func}
              closeTab1Modal={this.closeTab1Modal}
              visible={isTab1ModalShow}
              onOk={this.onTab1ModalOk}
              onCancel={this.onTab1ModalCancel}
              onClose={this.onTab1ModalCancel}/>
            :
            null
        }
        {
          isTab2ModalShow ?
            <Tab2Modal
              visible={isTab2ModalShow}
              onCancel={this.onTab2ModalCancel}
              onClose={this.onTab2ModalCancel}
              isEdit={false}
              currData={null}
              funcTab1={func}
              ref="tab2MC"/>
            :
            null
        }
        {
          isShowDelModal ?
            <Modal
              visible={isShowDelModal}
              onOk={this.del}
              onCancel={this.onCancel}
              onClose={this.onCancel}
              confirmLoading={deleteLoading}
              title="删除伸缩策略"
              okText="确定"
              maskClosable={false}
            >
              <div className="deleteRow">
                <i className="fa fa-exclamation-triangle"/>
                确定删除策略 {currentData.name || ''} ?
              </div>
            </Modal>
            :
            null
        }
      </div>
    )
  }
  componentDidUpdate(prevProps) {
    if (!prevProps.isTab2Deleted && this.props.isTab2Deleted) {
      this.loadData()
    }
  }
  componentDidMount() {
    this.loadData()
  }
}
const mapStateToProps = state => {
  const { appAutoScaler } = state
  const { getAppList, getLogList } = appAutoScaler
  const { appList, isTab1Fetching } = getAppList || { appList: [], isTab1Fetching: false }
  const { logList, isLogFetching } = getLogList || { logList: [], isLogFetching: false }
  return {
    appList,
    isTab1Fetching,
    logList,
    isLogFetching,
  }
}

export default connect(mapStateToProps, {
  getAppList: autoScalerActions.getAutoScalerAppList,
  getLogList: autoScalerActions.getAutoScalerLogList,
  addApp: autoScalerActions.createApp,
  updateApp: autoScalerActions.updateApp,
  deleteApp: autoScalerActions.deleteApp,
  changeAppStatus: autoScalerActions.changeAppStatus,
  getResList: autoScalerActions.getAutoScalerResList,
})(Tab1)
