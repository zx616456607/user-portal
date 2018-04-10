import React, { Component } from 'react';
import { Button, Icon, Input, Table, Menu, Dropdown, Card, Select, Pagination, Timeline, Row, Col, Spin, Modal} from 'antd';
import moment from 'moment'
import classNames from 'classNames'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler';
import { connect } from 'react-redux';
import '../style/tab1.less';
import '../style/tab2.less';
import Tab2Modal from './tab2Modal.js';
import NotificationHandler from '../../../../../src/components/Notification';

const notify = new NotificationHandler();

let formData = {};
let getServerList;
let tableData = [{
  cluster: "CID-80eb6ec3c47b",
  clustername: "",//对应集群
  configname: "autoscaler-server",
  iaas: "vmware",
  name: "名称1",
  password: "Dream008",
  server: "192.168.1.171",
  date: "2017-12-12 18:00:00",
}];
for(let i = 0; i < 20 ;i++){
  tableData.push({
    id: i + 1,
    name: "名称" + (2 + i),
    xxx: i + 1 ,
    ipAddr: "1.1.1.1",
    account: "账号" + (i + 2),
    date: "2017-12-12 18:00:" + ( (i+1 < 10) ? "0" : "") + (i+1),
  });
}
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
  edit = (rowData) => {
    console.log("edit", rowData);
    this.setState({isTab2ModalShow: true, isEdit: true, currData: rowData});
  }
  showDelModal = async (rowData) => {
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
      const result = await deleteServer({cluster: rowData.cluster, configname: rowData.configname});
      if (result.error) {
        notify.close();
        notify.warn('删除失败', result.error.message.message || result.error.message);
        this.setState({
          deleteLoading: false,
        });
      }
      this.loadData();
      notify.close();
      notify.success('删除成功');
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
  onTab2ModalCancel = () => {
    this.setState({isTab2ModalShow: false});
  }
  onCancel = () => {
    this.setState({isShowDelModal: false});
  }
  loadData() {
    getServerList({});
  }
  render() {
    const { serverList, isFetching } = this.props;
    getServerList = this.props.getServerList;
    if (isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"/>
        </div>
      );
    }
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
    if(!!this.props.serverList){ tableData = this.props.serverList; total = this.props.serverList.length}
    const func = {
      scope: this,
      loadData: this.loadData,
    };
    return (
      <div className="tab2Content">
        <div className="btnPanel">
          <Button className="btnItem" onClick={this.openModal} type="primary" ><Icon type="plus" />新建资源池配置</Button>
          <Button className="btnItem" onClick={this.delitems} type="ghost" disabled={isbtnDisabled} ><Icon type="delete" />删除</Button>
          <Input.Group className={searchCls}>
            <Input size='large' placeholder='请输入服务名搜索' value={this.state.searchValue} onChange={this.handleInputChange}
              onFocus={this.handleFocusBlur} onBlur={this.handleFocusBlur} onPressEnter={this.handleSearch}
            />
            <div className="ant-input-group-wrap">
              <Button type="ghost" icon="search" className={btnCls} onClick={this.handleSearch} />
            </div>
          </Input.Group>

          { total !== 0 && <div className='pageBox'>
            <span className='totalPage'>共 {total} 条</span>
            <div className='paginationBox'>
              <Pagination
                simple
                className='inlineBlock'
                onChange={this.onPageChange}
                // onShowSizeChange={this.onShowSizeChange}
                current={this.state.paginationCurrent}
                pageSize={5}
                total={total} />
            </div>
          </div>}
        </div>
        <div className="tablePanel">
          <Card>
            <Table rowSelection={rowSelection} columns={columns} dataSource={tableData} pagination={this.state.pagination}>
            </Table>
          </Card>
        </div>

        <Tab2Modal
          visible={this.state.isTab2ModalShow}
          onCancel={this.onTab2ModalCancel}
          onClose={this.onTab2ModalCancel}
          isEdit={this.state.isEdit}
          currData={this.state.currData}
          func={func}
          ref="tab2MC"/>

        <Modal
          visible={this.state.isShowDelModal}
          onOk={this.del}
          onCancel={this.onCancel}
          onClose={this.onCancel}
          confirmLoading={this.state.deleteLoading}
          title="删除资源池配置"
          okText="确定" >
          <div style={{color: "#00a0ea"}}>确定删除资源 {this.state.currData.name || ""} ?</div>
        </Modal>
      </div>
    )
  }
  componentDidMount() {
    this.loadData();
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
