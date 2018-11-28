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
import { Button, Table, Card, Pagination, Modal, Input, notification } from 'antd'
// import classNames from 'classnames'
import * as autoScalerActions from '../../actions/clusterAutoScaler'
import { connect } from 'react-redux'
import './style/index.less'
import '../ClusterModule/ClusterAutoScale/style/StrategyTab.less'
import IaasModal from './Modal.js'
import NotificationHandler from '../../../src/components/Notification'
import Title from '../../../src/components/Title'

const notify = new NotificationHandler()

class Iaas extends React.Component {
  state = {
    isSearchFocus: false, // 搜索框选中状态
    selectedRowKeys: [],
    searchValue: '',
    current: 1, // 当前页
    isShowModal: false,
    tableData: [],
    isEdit: false,
    currData: '', // 编辑时当前行数据
    deleteLoading: false, // 删除确定按钮
    isShowDelModal: false,
    sort: 'd',
  }
  reflesh = () => {
    this.loadData()
  }
  edit = rowData => {
    this.setState({ isShowModal: true, isEdit: true, currData: rowData })
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
      deleteServer(rowData.id, { cluster: rowData.cluster, type: rowData.iaas }, {
        success: {
          func: () => {
            this.loadData()
            notify.close()
            notify.success('删除成功')
            this.setState({
              isShowDelModal: false,
            })
            delCallBack && delCallBack()// 删除之后 刷新 tab1列表
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            if (err) {
              notify.close()
              if (err.statusCode === 403) {
                this.setState({
                  isShowDelModal: false,
                })
                const key = `open${Date.now()}`;
                const btnClick = () => {
                  notification.close(key);
                };
                const btn = (
                  <Button type="primary" onClick={btnClick}>
                    知道了
                  </Button>
                );
                notification.open({
                  description: <div>
                    <i style={{ top: '33%' }} className="ant-notification-notice-icon ant-notification-notice-icon-warning anticon anticon-exclamation-circle-o"></i>
                    <div style={{ fontSize: 14, color: '#666', paddingLeft: 50 }}>该资源池已被集群伸缩策略使用，不支持删除。</div>
                    <div style={{ paddingLeft: 50 }}>请在「集群伸缩策略」页面删除相应的策略后，方可删除该资源池</div>
                  </div>,
                  btn,
                  key,
                  duration: null,
                });
                return
              }
              notify.warn('删除失败', err.message.message || err.message)
              this.setState({
                deleteLoading: false,
              })
              return
            }
          },
          isAsync: true,
        },
        finally: {
          func: () => {
            this.setState({
              deleteLoading: false,
            })
          },
        },
      })
    })
  }
  // 顶部按钮事件
  openModal = () => {
    this.setState({ isShowModal: true, isEdit: false, currData: '' })
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
  onPageChange = current => {
    this.setState({ current })
  }
  onTab2ModalCancel = _cb => {
    this.setState({ isShowModal: false, currData: '' }, function() {
      !!_cb && typeof _cb === 'function' && _cb()
    })
  }
  onCancel = () => {
    this.setState({ isShowDelModal: false })
  }
  loadData = () => {
    const { getServerList } = this.props
    const { searchValue, sort } = this.state
    const query = {
      sort: sort + ',create_time',
      from: 0,
      size: 999,
    }
    if (searchValue) {
      query.filter = 'name,' + searchValue
    }
    getServerList(query)
  }
  loadDataDidMount = () => {
    this.props.getServerList({})
    // this.props.getServerList({}).then((res) => {
    //   setInterval(() => {
    //     this.props.getServerList({});
    //   }, LOAD_INSTANT_INTERVAL)
    // });;
  }
  onTableChange = (pagination, filters, sorter) => {
    const temp = {}
    if (sorter.order === 'ascend') {
      temp.sort = 'a'
    } else {
      temp.sort = 'd'
    }
    this.setState(temp, () => {
      this.loadData()
    })
  }
  render() {
    const { isFetching, serverList } = this.props
    const { current, isShowDelModal, deleteLoading,
      currData, isShowModal, isEdit, searchValue } = this.state
    const columns = (() => {
      const _that = this
      const renderOperation = (text, rowData) => {
        return (
          <div>
            <Button type="primary" style={{ marginRight: '10px' }} onClick={() => { _that.edit(rowData) }}>编辑</Button>
            <Button type="ghost" onClick={() => { _that.showDelModal(rowData) }}>删除</Button>
          </div>
        )
      }
      return [{
        title: '资源池名称',
        dataIndex: 'name',
        width: 100,
        render: text => {
          return text
        },
      }, {
        title: 'IaaS',
        dataIndex: 'iaasType',
        width: 100,
        render: text => {
          return text
        },
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
        dataIndex: 'userName',
        width: 100,
        render: text => text || '-',
      }, {
        title: '创建时间',
        dataIndex: 'date',
        width: 100,
        sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
        // sorter: (a, b) => {
        //   const da = new Date(a.createdTime),
        //     db = new Date(b.createdTime); return da.getTime() - db.getTime()
        // },
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
      <div className="iaasWrapper sliderIn">
        <Title title="资源池" />
        <div className="btnPanel">
          <Button type="primary" size="large" onClick={this.openModal}>
            <i className="fa fa-plus" />&nbsp;添加资源池
          </Button>
          <Button type="ghost" className="refreshBtn" size="large" onClick={this.reflesh}>
            <i className="fa fa-refresh" />&nbsp;刷新
          </Button>
          <div className="rightBox">
            <div className="littleLeft" onClick={this.loadData}>
              <i className="fa fa-search" />
            </div>
            <div className="littleRight">
              <Input
                size="large"
                onChange={this.handleInputChange}
                value={searchValue}
                placeholder="按资源池名称搜索"
                style={{ paddingRight: 28 }}
                onPressEnter={this.loadData} />
            </div>
          </div>
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
                current={current}
                pageSize={10}
                total={total} />
            </div>
          </div>}
          <div style={{ clear: 'both' }}></div>
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
                onChange={this.onTableChange}
              />
            </div>
          </Card>
        </div>
        {/* }*/}

        {
          isShowModal ?
            <IaasModal
              visible={isShowModal}
              onCancel={this.onTab2ModalCancel}
              onClose={this.onTab2ModalCancel}
              isEdit={isEdit}
              currData={currData}
              scope={func}
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
            是否确定删除 [{currData.name}] 资源池 ?
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
  deleteServer: autoScalerActions.deleteServer,
})(Iaas)
