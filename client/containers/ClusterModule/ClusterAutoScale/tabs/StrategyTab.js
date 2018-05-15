/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 *StrategyTab tab2
 *
 * v0.1 - 2018-04-08
 * @author rensiwei
 */
import React, { Component } from 'react';
import { Button, Icon, Input, Table, Menu, Dropdown, Card, Select, Pagination, Timeline, Row, Col, Spin, Modal} from 'antd';
import moment from 'moment'
import classNames from 'classnames'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler';
import { connect } from 'react-redux';
import '../style/IaasTab.less';
import '../style/StrategyTab.less';
import { LOAD_INSTANT_INTERVAL } from '../../../../../src/constants/index';
import Tab2Modal from './StrategyTabModal.js';
import NotificationHandler from '../../../../../src/components/Notification';

const notify = new NotificationHandler();

let formData = {};
let allClusterIds = "";//所有行元素的id集合
let getServerList;
let tableData = [];
class Tab2 extends React.Component {
  state = {
    isSearchFocus: false, //搜索框选中状态
    selectedRowKeys: [],
    searchValue: "",
    pagination: {
      current: 1,
      defaultCurrent: 1,
      pageSize: 5,
    }, //分页配置
    paginationCurrent: 1, //当前页
    isTab2ModalShow: false,
    tableData: [],
    isEdit: false,
    currData: "",//编辑时当前行数据
    deleteLoading: false, //删除确定按钮
    isShowDelModal: false,
  }
  reflesh = () => {
    let selectedRowKeys = this.state.selectedRowKeys.join(",");
    console.log("reflesh", selectedRowKeys);
    this.loadData();
  }
  edit = (rowData) => {
    console.log("edit", rowData);
    this.setState({isTab2ModalShow: true, isEdit: true, currData: rowData});
  }
  showDelModal = (rowData) => {
    console.log("showDelModal", arguments);
    this.setState({
      currData: rowData,
      isShowDelModal: true,
    });
  }
  del = async () => {
    const rowData = this.state.currData;
    const { deleteServer } = this.props;
    this.setState({
      deleteLoading: true,
    }, async () => {
      notify.spin('配置删除中');
      const result = await deleteServer({cluster: rowData.cluster});
      if (result.error) {
        notify.close();
        notify.warn('删除失败', result.error.message.message || result.error.message);
        this.setState({
          deleteLoading: false,
        });
        return;
      }
      this.loadData();
      notify.close();
      notify.success('删除成功');
      this.props.delCallBack();//删除之后 刷新 tab1列表
      this.setState({
        deleteLoading: false,
        isShowDelModal: false,
      });
    });
  }
  //顶部按钮事件
  openModal = () => {
    this.setState({isTab2ModalShow: true, isEdit: false, currData: ""});
  }
  delitems = () => {
    let selectedRowKeys = this.state.selectedRowKeys.join(",");
    console.log("delItems", selectedRowKeys);
  }
  clickTableRowName = (rowData) => {
    //console.log(rowData);
    const temp = JSON.parse(JSON.stringify(rowData));
    this.setState({currentData: temp,isShowTab1: false});
  }
  //search focus事件
  handleFocusBlur = (e) => {
    this.setState({
      isSearchFocus: e.target === document.activeElement,
    });
  }
  //search
  handleSearch = (e) => {
    getServerList({keyword: this.state.searchValue});
  }
  handleInputChange = (e) => {
    this.setState({searchValue: e.target.value});
  }
  onRowChange = (selectedRowKeys, selectedRowsData) => {
    this.setState({selectedRowKeys: selectedRowKeys})
  }
  //行操作列点击事件
  // tableExdClick = () => {
  //   console.log(arguments);
  // }
  // cloneClick = () => {
  //   console.log("clone", arguments);
  // }
  onPageChange = (page) => {
    let pagination = JSON.parse(JSON.stringify(this.state.pagination));
    pagination.current = page;
    this.setState({pagination: pagination, paginationCurrent: page});
  }
  onTab2ModalCancel = (_cb) => {
    this.setState({isTab2ModalShow: false, currData: ""}, function(){
      !!_cb && _cb();
    });
  }
  onCancel = () => {
    this.setState({isShowDelModal: false});
  }
  loadData = () => {
    this.props.getServerList({});
  }
  loadDataDidMount = () => {
    this.props.getServerList({});
    // console.log(LOAD_INSTANT_INTERVAL)
    // this.props.getServerList({}).then((res) => {
    //   setInterval(() => {
    //     this.props.getServerList({});
    //   }, LOAD_INSTANT_INTERVAL)
    // });;
  }
  render() {
    const { serverList, isFetching } = this.props;
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.isSearchFocus,
    });
    const columns = (() => {
      const clickTableRowName = this.clickTableRowName.bind(this);
      const _that = this;
      const renderOperation = (text, rowData) => {
        return (
          <div>
            <Button type="primary" style={{marginRight: "10px"}} onClick={() => {_that.edit(rowData)}}>编辑</Button>
            <Button onClick={() => {_that.showDelModal(rowData)}}>删除</Button>
          </div>
        )
      }
      return [{
        title: 'IaaS',
        dataIndex: 'iaas',
        width: 100,
        //render: text => <a href="#">{text}</a>,
        render: (text, rowData) => {
          return text;
        }
      }, {
        title: '对应集群',
        dataIndex: 'clustername',
        width: 100,
      }, {
        title: '地址',
        dataIndex: 'server',
        width: 100,
      }, {
        title: '账号',
        dataIndex: 'name',
        width: 100,
      }, {
        title: '创建时间',
        dataIndex: 'date',
        width: 100,
        sorter: (a, b) => {let da = new Date(a.createdTime), db = new Date(b.createdTime); return da.getTime() - db.getTime();},
      }, {
        title: '操作',
        // dataIndex: 'operation',
        width: 120,
        render: renderOperation,
      }];
    }).bind(this)();
    const isbtnDisabled = !!!this.state.selectedRowKeys.length;
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.searchValue.trim(),
    });
    let total = tableData.length;

    const rowSelection = {
      onChange: this.onRowChange,
      onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        console.log(selected, selectedRows, changeRows);
      },
    };
    if(!!this.props.serverList){
      // tableData = [].concat(this.props.serverList,this.props.serverList,this.props.serverList,this.props.serverList,this.props.serverList);
      // total = this.props.serverList.length*5;
      tableData = this.props.serverList;
      total = this.props.serverList.length;
      allClusterIds = this.props.serverList.map( item => item.cluster );
    }else{
      tableData = [];
      total = 0;
      allClusterIds = [];
    }
    const func = {
      scope: this,
      loadData: this.loadData,
    };
    return (
      <div className="tab2Content sliderIn">
        <div className="btnPanel">
          <Button type="primary" size="large" onClick={this.openModal} style={{ marginRight: "10px" }}>
            <i className="fa fa-plus" />新建资源池配置
          </Button>
          <Button className="refreshBtn" size='large' onClick={this.reflesh}>
            <i className='fa fa-refresh' />刷新
          </Button>
          {/*<Button className="btnItem" onClick={this.openModal} type="primary" ><Icon type="plus" />新建资源池配置</Button>*/}
          {/*<Button className="btnItem" onClick={this.delitems} type="ghost" disabled={isbtnDisabled} ><Icon type="delete" />删除</Button>*/}
          {/*<Input.Group className={searchCls}>
            <Input size='large' placeholder='请输入配置名称搜索' value={this.state.searchValue} onChange={this.handleInputChange}
              onFocus={this.handleFocusBlur} onBlur={this.handleFocusBlur} onPressEnter={this.handleSearch}
            />
            <div className="ant-input-group-wrap">
              <Button type="ghost" icon="search" className={btnCls} onClick={this.handleSearch} />
            </div>
          </Input.Group>
          */}

          { total !== 0 && <div className='pageBox'>
            <span className='totalPage'>共 {total} 条</span>
            <div className='paginationBox'>
              <Pagination
                simple
                className='inlineBlock'
                onChange={this.onPageChange}
                // onShowSizeChange={this.onShowSizeChange}
                current={this.state.paginationCurrent}
                pageSize={this.state.pagination.pageSize}
                total={total} />
            </div>
          </div>}
        </div>
        {/*{
          isFetching ?
          <div className="loadingBox">
            <Spin size="large"/>
          </div>
        : */}
          <div className="tablePanel">
            <Card>
              <div className="reset_antd_table_header">
              <Table columns={columns} loading={isFetching} dataSource={tableData} pagination={this.state.pagination} />
              </div>
            </Card>
          </div>
       {/* }*/}

        {
          this.state.isTab2ModalShow ?
            <Tab2Modal
              visible={this.state.isTab2ModalShow}
              onCancel={this.onTab2ModalCancel}
              onClose={this.onTab2ModalCancel}
              isEdit={this.state.isEdit}
              currData={this.state.currData}
              funcTab2={func}
              allClusterIds={allClusterIds}
              ref="tab2MC"/>
            :
            null
        }

        <Modal
          visible={this.state.isShowDelModal}
          onOk={this.del}
          onCancel={this.onCancel}
          onClose={this.onCancel}
          confirmLoading={this.state.deleteLoading}
          title="删除资源池配置"
          okText="确定"
          maskClosable={false} >
          <div style={{color: "#00a0ea"}}>是否删除 {this.state.currData.clustername} 集群的 {this.state.currData.iaas} 资源池配置 ?</div>
        </Modal>
      </div>
    )
  }
  componentDidMount() {
    this.loadDataDidMount();
  }
}

const mapStateToProps = state => {
  const { appAutoScaler } = state;
  const { getServerList } = appAutoScaler;
  const { serverList, isFetching } = getServerList || {serverList: [], isFetching: false};
  return {
    serverList,
    isFetching,
  };
};

export default connect(mapStateToProps, {
  getServerList: autoScalerActions.getServerList,
  updateServer: autoScalerActions.updateServer,
  deleteServer: autoScalerActions.deleteServer,
})(Tab2);
