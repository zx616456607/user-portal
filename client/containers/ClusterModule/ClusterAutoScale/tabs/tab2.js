import React, { Component } from 'react';
import { Button, Icon, Input, Table, Menu, Dropdown, Card, Select, Pagination, Timeline, Row, Col, Spin, Modal} from 'antd';
import moment from 'moment'
import classNames from 'classNames'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler';
import { connect } from 'react-redux';
import '../style/tab1.less';
import '../style/tab2.less';
import Tab2ModalContent from './tab2ModalContent.js';

// {
//   "cluster": "CID-80eb6ec3c47b",    //集群id（不需要展示）
//   "clustername": "gyw测试集群",     //集群名字
//   "configname": "cloud-provider",  //配置名字（不需要展示）
//   "date": "2018/10/09 11:11:05",   //创建时间
//   "issa": "vmware",                //issa
//   "name": "gaoyawei",              //账号
//   "password": "Dream008",          //密码（不需要展示）
//   "server": "192.168.1.171"        //地址
// }
let tableData = [{
  cluster: "CID-80eb6ec3c47b",
  clustername: "",//对应集群
  configname: "autoscaler-server",
  issa: "vmware",
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
  }

  edit = (rowData) => {
    console.log("edit", rowData);
    // todo;
  }
  delItem = () => {
    console.log("delItem", arguments);
  }
  //顶部按钮事件
  openModal = () => {
    this.setState({isTab2ModalShow: true});
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
    const { getServerList } = this.props;
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
  onTab2ModalOk = () => {
    //新增、修改接口
    console.log("sendParams",this.refs["tab2MC"]);
    debugger
    //this.props.addServer(this.refs)
  }
  render() {
    const { serverList, isFetching, getServerList } = this.props;
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
            <Button onClick={() => {_that.delItem(rowData)}}>删除</Button>
          </div>
        )
      }
      return [{
        title: 'IaaS',
        dataIndex: 'issa',
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

        <Modal
          visible={this.state.isTab2ModalShow}
          onOk={this.onTab2ModalOk}
          onCancel={this.onTab2ModalCancel}
          onClose={this.onTab2ModalCancel}
          title="新建资源池配置"
          okText="保存"
          width="550"
          >
            <Tab2ModalContent ref="tab2MC" isShow={this.state.isTab2ModalShow}/>
        </Modal>
      </div>
    )
  }
  componentDidMount() {
    const { getServerList } = this.props;
    getServerList({});
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
  addServer: autoScalerActions.createServer,
  updateServer: autoScalerActions.updateServer,
  deleteServer: autoScalerActions.deleteServer,
})(Tab2);
