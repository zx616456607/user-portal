import React, { Component } from 'react';
import { Button, Icon, Input, Table, Menu, Dropdown, Card, Select, Pagination, Timeline, Row, Col} from 'antd';
import classNames from 'classNames';
import '../style/tab1.less';
import QueueAnim from 'rc-queue-anim';
import Tab1Modal from './tab1Modal';

const InputGroup = Input.InputGroup;

const tableExdClick = () => {
  console.log(arguments);
}
const clone = () => {
  console.log("clone", arguments);
}
const edit = () => {
  console.log("edit", arguments);
}
const delItem = () => {
  console.log("delItem", arguments);
}
const onItem = () => {
  console.log("delItem", arguments);
}

let tableData = [{
  id: 0,
  name: "名称1",
  isOn: 0,
  xxx1: "如果节点的 CPU 利用率在 5 分钟内最大值 >70，连续发生 3 次则触发扩容",
  xxx2: "集群1",
  xxx3: "200",
  xxx4: "500",
  xxx5: "告警通知组1",
  isSendEmail: 0,
},{
  id: 1,
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
    id: i + 2,
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

class Tab1 extends React.Component {
  state = {
    isSearchFocus: false, //搜索框选中状态
    searchValue: "", //搜索框值
    pagination: {
      current: 1,
      defaultCurrent: 1,
      pageSize: 5,
    },//分页配置
    paginationCurrent: 1,//当前页
    currentData: tableData[0] || {},//点击名称缓存当前选中行元素
    isShowTab1: true, //伸缩策略中显示第一页， false第二页
    selectedRowKeys: [], //选中行元素的keys
    isTab1ModalShow: false, //新建策略modal 显示状态
  }
  //顶部按钮事件
  add = () => {
    this.setState({isTab1ModalShow: true});
  }
  reflesh = () => {
    let selectedRowKeys = this.state.selectedRowKeys.join(",");
    console.log("reflesh", selectedRowKeys);
  }
  on = () => {
    let selectedRowKeys = this.state.selectedRowKeys.join(",");
    console.log("on", selectedRowKeys);
  }
  off = () => {
    let selectedRowKeys = this.state.selectedRowKeys.join(",");
    console.log("off", selectedRowKeys);
  }
  delItems = () => {
    let selectedRowKeys = this.state.selectedRowKeys.join(",");
    console.log("delItems", selectedRowKeys);
  }

  onRowChange = (selectedRowKeys, selectedRowsData) => {
    this.setState({selectedRowKeys: selectedRowKeys})
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
  clickTableRowName = (rowData) => {
    //console.log(rowData);
    const temp = JSON.parse(JSON.stringify(rowData));
    this.setState({currentData: temp,isShowTab1: false});
  }
  returnPart1 = () =>{
    this.setState({isShowTab1: true});
  }
  onqaEnd = () => {
    // debugger
  }
  onTab1ModalCancel = () => {
    this.setState({isTab1ModalShow: false});
  }
  onTab1ModalOk = () => {
    //新增、修改接口
    console.log("sendParams");
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
      onChange: this.onRowChange,
      onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        console.log(selected, selectedRows, changeRows);
      },
    };

    const columns = (() => {
      const clickTableRowName = this.clickTableRowName.bind(this);
      return [{
        title: '策略名称',
        dataIndex: 'name',
        width: 100,
        //render: text => <a href="#">{text}</a>,
        render: (text, rowData) => {
          return (
            <a href="#" onClick={() => {clickTableRowName(rowData)}} data-row={rowData}>{text}</a>
          )
        }
      }, {
        title: '开启状态',
        dataIndex: 'isOn',
        width: 100,
        render: isOn => isOn ? <div className="isOnCon"><i className="fa fa-circle"></i>开启</div> : <div className="isOffCon"><i className="fa fa-circle"></i>关闭</div>,
      }, {
        title: '阈值',
        dataIndex: 'xxx1',
        width: 100,
      }, {
        title: '集群',
        dataIndex: 'xxx2',
        width: 100,
      }, {
        title: '最小实例数',
        dataIndex: 'xxx3',
        width: 100,
      }, {
        title: '最大实例数',
        dataIndex: 'xxx4',
        width: 100,
      }, {
        title: '发送邮件',
        dataIndex: 'isSendEmail',
        width: 100,
        render: isSendEmail => isSendEmail ? <span>是</span> : <span>否</span>,
      }, {
        title: '告警通知组',
        dataIndex: 'xxx5',
        width: 100,
      }, {
        title: '操作',
        width: 100,
        render: function(text, rowData){
          const menu = (
            <Menu onClick={tableExdClick}>
              <Menu.Item onClick={() => {onItem(rowData.id)}} key="1">启用</Menu.Item>
              <Menu.Item onClick={() => {edit(rowData.id)}} key="2">编辑</Menu.Item>
              <Menu.Item onClick={() => {delItem(rowData.id)}} key="3">删除</Menu.Item>
            </Menu>
          )
          return (
            <div>
              <Dropdown.Button onClick={() => {clone(rowData.id)}} overlay={menu} type="ghost">
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
    }).bind(this)();
    const part1Class = classNames({
      'part1': true,
      'sliderIn': this.state.isShowTab1,
      'hidden': !this.state.isShowTab1,
    });
    const part2Class = classNames({
      'part2': true,
      'sliderIn': !this.state.isShowTab1,
      'hidden': this.state.isShowTab1,
    });
    const total = tableData.length;
    const currentData = this.state.currentData;
    //this.state.isShowTab1
    const isbtnDisabled = !!!this.state.selectedRowKeys.length;
    return (
      <div className="tab1Content">
          <QueueAnim>
            <div className={part1Class} key="part1">
              <div className="btnPanel">
                <Button className="btnItem" onClick={this.add} type="primary" ><Icon type="plus" />新建策略</Button>
                <Button className="btnItem" onClick={this.reflesh} type="ghost" ><Icon type="retweet" />刷新</Button>
                <Button className="btnItem" onClick={this.on} type="ghost" disabled={isbtnDisabled} ><Icon type="caret-right" />启用</Button>
                <Button className="btnItem" onClick={this.off} type="ghost" disabled={isbtnDisabled} ><Icon type="pause" />停用</Button>
                <Button className="btnItem" onClick={this.delItems} type="ghost" disabled={isbtnDisabled} ><Icon type="delete" />删除</Button>
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
            </div>
            <div className={part2Class} key="part2">
              <div className="titleContainer">
                <Button className="btnItem" type="primary" onClick={this.returnPart1}>返回</Button>
                <span className="line"></span>
                <span className="title">增加节点策略</span>
              </div>
              <div className="cardContainer">
                <Card className="left" title="基本属性" bordered={false}>
                  <div className="cardPart">
                    <p><span className="leftTitle">策略名称</span><span className="rightContent">{currentData.Name}</span></p>
                    <p><span className="leftTitle">开启状态</span>
                      {currentData.isOn?
                        <span className="rightContent isOnCon"><i className="fa fa-circle"></i>开启</span>
                        :
                        <span className="rightContent isOffCon"><i className="fa fa-circle"></i>关闭</span>
                      }
                    </p>
                    <p><span className="leftTitle">数据中心</span><span className="rightContent">office</span></p>
                    <p><span className="leftTitle">虚拟机模版</span><span className="rightContent">xxx</span></p>
                    <p><span className="leftTitle">计算资源池</span><span className="rightContent">xxx</span></p>
                    <p><span className="leftTitle">存储资源池</span><span className="rightContent">xxx</span></p>
                  </div>
                  <div className="cardPart">
                    <p><span className="leftTitle">最小实例数</span><span className="rightContent">{currentData.xxx3 + " 个"}</span></p>
                    <p><span className="leftTitle">最大实例数</span><span className="rightContent">{currentData.xxx4 + " 个"}</span></p>
                    <p><span className="leftTitle">阈值</span><span className="rightContent">{currentData.xxx1}</span></p>
                    <p><span className="leftTitle">伸缩活动</span><span className="rightContent">增加 x 台</span></p>
                  </div>
                  <div className="cardPart">
                    <p><span className="leftTitle">发送邮件</span><span className="rightContent">{currentData.isSendEmail ? "是" : "否"}</span></p>
                    <p><span className="leftTitle">邮件通知</span><span className="rightContent">{currentData.xxx5}</span></p>
                    <p><span className="leftTitle">策略冷却时间</span><span className="rightContent">120秒</span></p>

                  </div>
                  <div style={{clear: "both"}}></div>
                </Card>
                <Card className="right" title="伸缩日志" bordered={false}>
                  <Timeline>
                    <Timeline.Item>创建服务现场 2015-09-01</Timeline.Item>
                    <Timeline.Item>初步排除网络异常 2015-09-01</Timeline.Item>
                    <Timeline.Item>技术测试异常 2015-09-01</Timeline.Item>
                    <Timeline.Item color="green">网络异常正在修复 2015-09-01</Timeline.Item>
                  </Timeline>
                </Card>
              </div>
            </div>
          </QueueAnim>
          <Tab1Modal visible={this.state.isTab1ModalShow} onOk={this.onTab1ModalOk} onCancel={this.onTab1ModalCancel} onClose={this.onTab1ModalCancel}/>
      </div>
    )
  }
};
export default Tab1;
