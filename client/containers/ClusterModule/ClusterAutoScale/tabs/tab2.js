import React, { Component } from 'react';
import { Button, Icon, Input, Table, Menu, Dropdown, Card, Select, Pagination, Timeline} from 'antd';
import moment from 'moment'
import classNames from 'classNames'
import '../style/tab1.less';
import '../style/tab2.less';
import Tab2Modal from './tab2Modal.js';

const edit = () => {
  console.log("edit", arguments);
  // todo;
}
const delItem = () => {
  console.log("delItem", arguments);
}
let tableData = [{
  id: 0,
  name: "名称1",
  xxx: 0,
  ipAddr: "1.1.1.1",
  account: "账号1",
  createdTime: "2017-12-12 18:00:00",
}];
for(let i = 0; i < 20 ;i++){
  tableData.push({
    id: i + 1,
    name: "名称" + (2 + i),
    xxx: i + 1 ,
    ipAddr: "1.1.1.1",
    account: "账号" + (i + 2),
    createdTime: "2017-12-12 18:00:" + ( (i+1 < 10) ? "0" : "") + (i+1),
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
    },//分页配置
    paginationCurrent: 1,//当前页
    isTab2ModalShow: false,
  }
  //顶部按钮事件
  add = () => {
    console.log("add");
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
    console.log("sendParams");
  }
  render() {
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.isSearchFocus,
    });
    const columns = (() => {
      const clickTableRowName = this.clickTableRowName.bind(this);
      return [{
        title: 'laaS',
        dataIndex: 'name',
        width: 100,
        //render: text => <a href="#">{text}</a>,
        render: (text, rowData) => {
          return text;
        }
      }, {
        title: '对应集群',
        dataIndex: 'xxx',
        width: 100,
      }, {
        title: '地址',
        dataIndex: 'ipAddr',
        width: 100,
      }, {
        title: '账号',
        dataIndex: 'account',
        width: 100,
      }, {
        title: '创建时间',
        dataIndex: 'createdTime',
        width: 100,
        sorter: (a, b) => {let da = new Date(a.createdTime), db = new Date(b.createdTime); return da.getTime() - db.getTime();},
      }, {
        title: '操作',
        width: 120,
        render: function(text, rowData){
          return (
            <div>
              <Button type="primary" style={{marginRight: "10px"}} onClick={() => {edit(rowData.id)}}>编辑</Button>
              <Button onClick={() => {delItem(rowData.id)}}>删除</Button>
            </div>
            // <Select defaultValue="lucy" style={{ width: 120 }} onChange={handleChange}>
            //   <Option value="jack">Jack</Option>
            //   <Option value="lucy">Lucy</Option>
            //   <Option value="disabled" disabled>Disabled</Option>
            //   <Option value="yiminghe">yiminghe</Option>
            // </Select>
          )
        },
      }];
    }).bind(this)();
    const isbtnDisabled = !!!this.state.selectedRowKeys.length;
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.searchValue.trim(),
    });
    const total = tableData.length;

    const rowSelection = {
      onChange: this.onRowChange,
      onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        console.log(selected, selectedRows, changeRows);
      },
    };
    return (
      <div className="tab2Content">
        <div className="btnPanel">
          <Button className="btnItem" onClick={this.add} type="primary" ><Icon type="plus" />新建资源池配置</Button>
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
        <Tab2Modal visible={this.state.isTab2ModalShow} onOk={this.onTab2ModalOk} onCancel={this.onTab2ModalCancel} onClose={this.onTab2ModalCancel}/>
      </div>
    )
  }
}

export default Tab2;