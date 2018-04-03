import React, { Component } from 'react';
import { Button, Icon, Input, Table, Menu, Dropdown, Card, Select, Pagination,  } from 'antd';
import classNames from 'classNames';
import '../style/tab1.less';
const InputGroup = Input.InputGroup;

const tableExdClick = () => {
  console.log(arguments);
}
const cloneClick = () => {
  console.log("clone", arguments);
}

let tableData = [{
  name: "名称1",
  isOn: 0,
  xxx1: "阈值1",
  xxx2: "集群1",
  xxx3: "最小实例数1",
  xxx4: "最大实例数1",
  xxx5: "告警通知组1",
  isSendEmail: 0,
},{
  name: "名称2",
  isOn: 1,
  xxx1: "阈值2",
  xxx2: "集群2",
  xxx3: "最小实例数2",
  xxx4: "最大实例数2",
  xxx5: "告警通知组2",
  isSendEmail: 1,
}];
for(let i = 0; i < 20 ;i++){
  tableData.push({
    name: "名称" + (3 + i),
    isOn: 1,
    xxx1: "阈值" + (3 + i),
    xxx2: "集群" + (3 + i),
    xxx3: "最小实例数" + (3 + i),
    xxx4: "最大实例数" + (3 + i),
    xxx5: "告警通知组" + (3 + i),
    isSendEmail: 1,
  });
}
const columns = [{
  title: '策略名称',
  dataIndex: 'name',
  render: text => <a href="#">{text}</a>,
}, {
  title: '开启状态',
  dataIndex: 'isOn',
  render: isOn => isOn ? <div className="tableOnCon"><i className="fa fa-circle"></i>开启</div> : <div className="tableOffCon"><i className="fa fa-circle"></i>关闭</div>,
}, {
  title: '阈值',
  dataIndex: 'xxx1',
}, {
  title: '集群',
  dataIndex: 'xxx2',
}, {
  title: '最小实例数',
  dataIndex: 'xxx3',
}, {
  title: '最大实例数',
  dataIndex: 'xxx4',
}, {
  title: '发送邮件',
  dataIndex: 'isSendEmail',
  render: isSendEmail => isSendEmail ? <span>是</span> : <span>否</span>,
}, {
  title: '告警通知组',
  dataIndex: 'xxx5',
}, {
  title: '操作',
  render: function(){
    const menu = (
      <Menu onClick={tableExdClick}>
        <Menu.Item key="1">启用</Menu.Item>
        <Menu.Item key="2">编辑</Menu.Item>
        <Menu.Item key="3">删除</Menu.Item>
      </Menu>
    )
    return (
      <div>
        <Dropdown.Button onClick={cloneClick} overlay={menu} type="ghost">
          克隆
        </Dropdown.Button>
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

class Tab1 extends React.Component {
  //顶部按钮事件
  add = () => {
    console.log("add");
  }
  reflash = () => {
    console.log("reflash");
  }
  on = () => {
    console.log("on");
  }
  off = () => {
    console.log("off");
  }
  del = () => {
    console.log("del");
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
  //search onchange
  handleInputChange = () => {
    console.log(arguments[0].target.value);
  }
  //行操作列点击事件
  tableExdClick = () => {

  }
  onPageChange = (page) => {
    let pagination = JSON.parse(JSON.stringify(this.state.pagination));
    pagination.current = page;
    this.setState({pagination: pagination, paginationCurrent: page});
  }
  state = {
    isSearchFocus: false,
    searchValue: "",
    tablePage: 1,
    pagination: {
      current: 1,
      defaultCurrent: 1,
      pageSize: 5,
    },
    paginationCurrent: 1,
  }


  // 通过 rowSelection 对象表明需要行选择

  render() {
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.isSearchFocus,
    });
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.searchValue.trim(),
    });
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        console.log(selected, selectedRows, changeRows);
      },
    };
    const total = tableData.length;
    return (
      <div className="tab1Content">
        <div className="btnPanel">
          <Button className="btnItem" onClick={this.add} type="primary" ><Icon type="plus" />新建策略</Button>
          <Button className="btnItem" onClick={this.reflash} type="ghost" ><Icon type="retweet" />刷新</Button>
          <Button className="btnItem" onClick={this.on} type="ghost" ><Icon type="caret-right" />启用</Button>
          <Button className="btnItem" onClick={this.off} type="ghost" ><Icon type="pause" />停用</Button>
          <Button className="btnItem" onClick={this.del} type="ghost" ><Icon type="delete" />删除</Button>
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
      </div>
    )
  }
};
export default Tab1;
