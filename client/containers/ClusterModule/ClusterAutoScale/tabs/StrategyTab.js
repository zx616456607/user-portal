/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * StrategyTab tab2
 *
 * v0.1 - 2018-04-08
 * @author rensiwei
 */
import React from 'react'
import { Button, Table, Card, Pagination, Modal } from 'antd'
// import classNames from 'classnames'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler'
import { connect } from 'react-redux'
import '../style/IaasTab.less'
import '../style/StrategyTab.less'
import Tab2Modal from './StrategyTabModal.js'
import NotificationHandler from '../../../../../src/components/Notification'

const notify = new NotificationHandler()

class Tab2 extends React.Component {
  state = {
    isSearchFocus: false, // 搜索框选中状态
    selectedRowKeys: [],
    searchValue: '',
    pagination: {
      current: 1,
      defaultCurrent: 1,
      pageSize: 5,
    }, // 分页配置
    paginationCurrent: 1, // 当前页
    isTab2ModalShow: false,
    tableData: [],
    isEdit: false,
    currData: '', // 编辑时当前行数据
    deleteLoading: false, // 删除确定按钮
    isShowDelModal: false,
  }
  reflesh = () => {
    this.loadData()
  }
  edit = rowData => {
    this.setState({ isTab2ModalShow: true, isEdit: true, currData: rowData })
  }
  showDelModal = rowData => {
    this.setState({
      currData: rowData,
      isShowDelModal: true,
    })
  }
  del = async () => {
    const rowData = this.state.currData
    const { deleteServer, delCallBack } = this.props
    this.setState({
      deleteLoading: true,
    }, async () => {
      notify.spin('配置删除中')
      const result = await deleteServer({ cluster: rowData.cluster, type: rowData.iaas })
      if (result.error) {
        notify.close()
        notify.warn('删除失败', result.error.message.message || result.error.message)
        this.setState({
          deleteLoading: false,
        })
        return
      }
      this.loadData()
      notify.close()
      notify.success('删除成功')
      delCallBack()// 删除之后 刷新 tab1列表
      this.setState({
        deleteLoading: false,
        isShowDelModal: false,
      })
    })
  }
  // 顶部按钮事件
  openModal = () => {
    this.setState({ isTab2ModalShow: true, isEdit: false, currData: '' })
  }
  clickTableRowName = rowData => {
    const temp = JSON.parse(JSON.stringify(rowData))
    this.setState({ currentData: temp, isShowTab1: false })
  }
  // search focus事件
  handleFocusBlur = e => {
    this.setState({
      isSearchFocus: e.target === document.activeElement,
    })
  }
  handleInputChange = e => {
    this.setState({ searchValue: e.target.value })
  }
  onRowChange = selectedRowKeys => {
    this.setState({ selectedRowKeys })
  }
  onPageChange = page => {
    const pagination = JSON.parse(JSON.stringify(this.state.pagination))
    pagination.current = page
    this.setState({ pagination, paginationCurrent: page })
  }
  onTab2ModalCancel = _cb => {
    this.setState({ isTab2ModalShow: false, currData: '' }, function() {
      !!_cb && typeof _cb === 'function' && _cb()
    })
  }
  onCancel = () => {
    this.setState({ isShowDelModal: false })
  }
  loadData = () => {
    const { getServerList } = this.props
    getServerList({})
  }
  loadDataDidMount = () => {
    this.props.getServerList({})
    // this.props.getServerList({}).then((res) => {
    //   setInterval(() => {
    //     this.props.getServerList({});
    //   }, LOAD_INSTANT_INTERVAL)
    // });;
  }
  render() {
    const { isFetching, serverList } = this.props
    const { paginationCurrent, isShowDelModal, deleteLoading,
      currData, isTab2ModalShow, isEdit, pagination } = this.state
    const columns = (() => {
      const _that = this
      const renderOperation = (text, rowData) => {
        return (
          <div>
            <Button type="primary" style={{ marginRight: '10px' }} onClick={() => { _that.edit(rowData) }}>编辑</Button>
            <Button onClick={() => { _that.showDelModal(rowData) }}>删除</Button>
          </div>
        )
      }
      return [{
        title: 'IaaS',
        dataIndex: 'iaas',
        width: 100,
        render: text => {
          return text
        },
      }, {
        title: '对应集群',
        dataIndex: 'clustername',
        width: 100,
      }, {
        title: '地址',
        dataIndex: 'server',
        width: 100,
      }, {
        title: '用户域',
        dataIndex: 'domainName',
        width: 100,
        render: text => text || '-',
      }, {
        title: '账号',
        dataIndex: 'name',
        width: 100,
      }, {
        title: '创建时间',
        dataIndex: 'date',
        width: 100,
        sorter: (a, b) => {
          const da = new Date(a.createdTime),
            db = new Date(b.createdTime); return da.getTime() - db.getTime()
        },
      }, {
        title: '操作',
        width: 120,
        render: renderOperation,
      }]
    })()
    let tableData = []
    let total = 0

    if (serverList) {
      tableData = serverList
      total = serverList.length
    }
    const func = {
      scope: this,
      loadData: this.loadData,
    }
    return (
      <div className="tab2Content sliderIn">
        <div className="btnPanel">
          <Button type="primary" size="large" onClick={this.openModal} style={{ marginRight: '10px' }}>
            <i className="fa fa-plus" />新建资源池配置
          </Button>
          <Button className="refreshBtn" size="large" onClick={this.reflesh}>
            <i className="fa fa-refresh" />刷新
          </Button>
          {/* <Button className="btnItem" onClick={this.openModal} type="primary" ><Icon type="plus" />
            新建资源池配置</Button>*/}
          {/* <Button className="btnItem" onClick={this.delitems} type="ghost" disabled={isbtnDisabled} >
            <Icon type="delete" />删除</Button>*/}
          {/* <Input.Group className={searchCls}>
            <Input size='large' placeholder='请输入配置名称搜索' value={this.state.searchValue} onChange={this.handleInputChange}
              onFocus={this.handleFocusBlur} onBlur={this.handleFocusBlur} onPressEnter={this.handleSearch}
            />
            <div className="ant-input-group-wrap">
              <Button type="ghost" icon="search" className={btnCls} onClick={this.handleSearch} />
            </div>
          </Input.Group>
          */}

          { total !== 0 && <div className="pageBox">
            <span className="totalPage">共 {total} 条</span>
            <div className="paginationBox">
              <Pagination
                simple
                className="inlineBlock"
                onChange={this.onPageChange}
                // onShowSizeChange={this.onShowSizeChange}
                current={paginationCurrent}
                pageSize={pagination.pageSize}
                total={total} />
            </div>
          </div>}
        </div>
        {/* {
          isFetching ?
          <div className="loadingBox">
            <Spin size="large"/>
          </div>
        : */}
        <div className="tablePanel">
          <Card>
            <div className="reset_antd_table_header">
              <Table
                columns={columns}
                loading={isFetching}
                dataSource={tableData}
                pagination={pagination} />
            </div>
          </Card>
        </div>
        {/* }*/}

        {
          isTab2ModalShow ?
            <Tab2Modal
              visible={isTab2ModalShow}
              onCancel={this.onTab2ModalCancel}
              onClose={this.onTab2ModalCancel}
              isEdit={isEdit}
              currData={currData}
              funcTab2={func}
              allClusterIds={tableData.map(item => item.cluster) || []}
              ref="tab2MC"/>
            :
            null
        }

        <Modal
          visible={isShowDelModal}
          onOk={this.del}
          onCancel={this.onCancel}
          onClose={this.onCancel}
          confirmLoading={deleteLoading}
          title="删除资源池配置"
          okText="确定"
          maskClosable={false} >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            是否删除 {currData.clustername} 集群的 {currData.iaas} 资源池配置 ?
          </div>
        </Modal>
      </div>
    )
  }
  componentDidMount() {
    this.loadData()
  }
}

const mapStateToProps = state => {
  const { appAutoScaler } = state
  const { getServerList } = appAutoScaler
  const { serverList, isFetching } = getServerList || { serverList: [], isFetching: false }
  return {
    serverList,
    isFetching,
  }
}

export default connect(mapStateToProps, {
  getServerList: autoScalerActions.getServerList,
  updateServer: autoScalerActions.updateServer,
  deleteServer: autoScalerActions.deleteServer,
})(Tab2)
