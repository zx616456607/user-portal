import React from 'react';
import {
  Spin, Button, Icon, Input, Table, Menu, Dropdown,
  Card, Select, Pagination, Row, Col, Timeline,
  Modal
} from 'antd';
import classNames from 'classNames';
import '../style/tab1.less';
import * as autoScalerActions from '../../../../actions/clusterAutoScaler';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import Tab1Modal from './tab1Modal';
import Tab2Modal from './tab2Modal';
import NotificationHandler from '../../../../../src/components/Notification';

const notify = new NotificationHandler();

const InputGroup = Input.InputGroup;
const TimelineItem = Timeline.Item;
const pageSize = 5;

let getAppList;
let tableData = [];
let _tab1modal;


class Tab1 extends React.Component {
  state = {
    isSearchFocus: false, //搜索框选中状态
    searchValue: "", //搜索框值
    pagination: {
      current: 1,
      defaultCurrent: 1,
      pageSize: pageSize,
    },//分页配置
    paginationCurrent: 1,//当前页
    currentData: tableData[0] || {},//点击名称缓存当前选中行元素
    isShowTab1List: true, //伸缩策略中显示第一页， false第二页
    selectedRowKeys: [], //选中行元素的keys
    isTab1ModalShow: false, //新建策略modal 显示状态
    isTab2ModalShow: false, //新建配置modal 显示状态
    isEdit: false,
    deleteLoading: false, //删除确定按钮
    isShowDelModal: false,
  }
  //顶部按钮事件
  add = () => {
    this.setState({isTab1ModalShow: true, isEdit: false, currentData: {}});
  }
  dropDown = (key, rowData) => {
    switch(key){
      case "edit":
        this.edit(rowData);
        break;
      case "onOff":
        this.onOffItem(rowData);
        break;
      case "del":
        this.showDelModal(rowData);
        break;
      }
  }
  edit = (rowData) => {
    this.setState({
      isTab1ModalShow: true,
      isEdit: true,
      currentData: rowData,
    })
  }
  showDelModal = (rowData) => {
    this.setState({
      currentData: rowData,
      isShowDelModal: true,
    });
  }

  onCancel = () => {
    this.setState({
      currentData: "",
      isShowDelModal: false,
    });
  }
  del = () => {
    const common = () => {
      this.setState({
        isShowDelModal: false,
        currentData: "",
      })
    }
    this.props.deleteApp({ cluster: this.state.currentData.cluster }, {
      success: {
        func: () => {
          notify.success(`策略 ${this.state.currentData.name} 删除成功`);
            //刷新列表
          this.loadData();
          common();
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode, message } = err;
          notify.error(`删除策略 ${this.state.currentData.name} 失败，错误代码: ${statusCode}， ${message.message}`);
          common();
        },
      }
    });
  }
  clone = () => {
    console.log("clone", arguments);
  }

  onOffItem = (rowData) => {
    console.log("changeAppStatus", arguments);
    this.props.changeAppStatus({ cluster: rowData.cluster },{
      success: {
        func: () => {
          notify.success(`策略 ${rowData.name} ${rowData.status === "on" ? "停用" : "启用"} 成功`);
            this.loadData();
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode, message } = err
          notify.error(`删除策略 ${rowData.name} 失败，错误代码: ${statusCode}， ${message}`)
        },
      }
    });
  }
  reflesh = () => {
    let selectedRowKeys = this.state.selectedRowKeys.join(",");
    console.log("reflesh", selectedRowKeys);
    this.loadData();
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
  onPageChange = (page) => {
    let pagination = JSON.parse(JSON.stringify(this.state.pagination));
    pagination.current = page;
    this.setState({pagination: pagination, paginationCurrent: page});
  }
  clickTableRowName = (rowData) => {
    //console.log(rowData);
    const temp = JSON.parse(JSON.stringify(rowData));
    this.setState({currentData: temp,isShowTab1List: false});
    this.props.getLogList({cluster: rowData.cluster});
  }
  returnPart1 = () =>{
    this.setState({isShowTab1List: true});
  }
  onTab1ModalCancel = () => {
    this.setState({isTab1ModalShow: false});
  }
  onTab1ModalOk = (params) => {
    //add
    const { addApp, updateApp } = this.props;
    const resetState = {
      isTab1ModalShow:false,
      pagination: {
        current: 1,
        defaultCurrent: 1,
        pageSize: pageSize,
        currentData: {},
        isEdit: false,
      }, //分页配置
      paginationCurrent: 1,
    }
    params.duration = params.duration + "";//转字符串
    //新增、修改接口
    if(this.state.isEdit){
      updateApp(params,{
        success: {
          func: () => {
            notify.success(`策略 ${params.name} 更新成功`);
              this.loadData();
              this.setState(resetState);
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            const { statusCode, message } = err
            notify.error(`更新策略 ${params.name} 失败，错误代码: ${statusCode}， ${message}`)
          },
        }
      })
    }else{
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
              const { statusCode, message } = err;
              notify.error(`新建策略 ${params.name} 失败，错误代码: ${statusCode}， ${message}`)
            },
          }
        })
    }
    console.log("sendParams", params);
  }

  renderLineItem = (item, i, isLast) => {
    let color = "#2fba67";
    if (item.diff) {
      color = "#2cb8f6";
    }
    const className = "ant-timeline-item " + (isLast ? "ant-timeline-item-last" : "" );
    return <li className={className}>
        <div className="ant-timeline-item-tail"></div>
        <div className="ant-timeline-item-head ant-timeline-item-head-custom ant-timeline-item-head-blue">
          <i className="anticon anticon-exclamation-circle" style={{ fontSize: 16, color: "#2cb8f6" }}></i>
        </div>
        <div className="ant-timeline-item-content">
          <span style={{ color: "#2cb8f6" }}>{item.message}</span>
          <span>{item.date}</span>
        </div>
      </li>
  }
  closeTab1Modal = (tab1modal) => {
    _tab1modal = tab1modal;
    this.setState({
      isTab1ModalShow:false
    },() => {
      this.setState({
        isTab2ModalShow:true
      })
    })
  }
  onTab2ModalCancel = () => {
    this.setState({isTab2ModalShow: false, isTab1ModalShow: true}, () => {
      _tab1modal.resetState();
    });
  }
  loadData() {
    getAppList({});
  }
  render() {
    const { appList, isTab1Fetching, logList, isLogFetching } = this.props;
    getAppList = this.props.getAppList;
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.isSearchFocus,
    });
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.searchValue,
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
    const _that = this;
    const columns = (() => {
      const clickTableRowName = this.clickTableRowName.bind(this);
      return [{
        title: '策略名称',
        dataIndex: 'name',
        width: 100,
        render: (text, rowData) => {
          return (
            <a href="#" onClick={() => {clickTableRowName(rowData)}} data-row={rowData}>{text}</a>
          )
        }
      },
      {
        title: '开启状态',
        dataIndex: 'status',
        width: 100,
        render: status => status === "on" ? <div className="isOnCon"><i className="fa fa-circle"></i>启用</div> : <div className="isOffCon"><i className="fa fa-circle"></i>停用</div>,
      },
      // {
      //   title: '阈值',
      //   dataIndex: 'yuzhi',
      //   width: 100,
      // },
      {
        title: '集群',
        dataIndex: 'clustername',
        width: 100,
      }, {
        title: '最小实例数',
        dataIndex: 'min',
        width: 100,
      }, {
        title: '最大实例数',
        dataIndex: 'max',
        width: 100,
      }, {
        title: 'Email',
        dataIndex: 'email',
        width: 100,
        render: email => email ? email : "-",
      },
      {
        title: '操作',
        width: 100,
        render: function(text, rowData){
          const menu = (
            <Menu onClick={(e) => {_that.dropDown(e.key, rowData)}}>
              <Menu.Item key="onOff">{ rowData.status === "on" ? "停用" : "启用"}</Menu.Item>
              {/*<Menu.Item key="clone">克隆</Menu.Item>*/}
              <Menu.Item key="del">删除</Menu.Item>
            </Menu>
          )
          return (
            <div>
              <Dropdown.Button onClick={() => {_that.dropDown("edit", rowData)}} overlay={menu} type="ghost">
              编辑
              </Dropdown.Button>
            </div>
          )
        },
      }];
    }).bind(this)();
    const part1Class = classNames({
      'part1': true,
      'sliderIn': this.state.isShowTab1List,
      'hidden': !this.state.isShowTab1List,
    });
    const part2Class = classNames({
      'part2': true,
      'sliderIn': !this.state.isShowTab1List,
      'hidden': this.state.isShowTab1List,
    });
    let total = tableData.length;
    const currentData = this.state.currentData;
    //this.state.isShowTab1List
    const isbtnDisabled = !!!this.state.selectedRowKeys.length;
    if(!!appList){
      tableData = appList;
      total = appList.length;
    }
    let loglen = 0,linelist = <div style={{ textAlign: 'center' }}>暂无数据</div>;
    if(!!logList && logList.log){
      loglen = logList.log.length;
      linelist = logList.log.reverse().map((item, i) =>
        {
          const isLast = loglen === (i + 1);
          const line = this.renderLineItem(item, i, isLast)
          return line;
      });
    }
    const func = {
      scope: this,
    }
    const funcTab1 = {
      scope: this,
    }
    return (
      <div className="tab1Content">
          <QueueAnim>
            <div className={part1Class} key="part1">
              <div className="btnPanel">
                <Button type="primary" size="large" onClick={this.add} style={{ marginRight: "10px" }}>
                  <i className="fa fa-plus" />新建策略
                </Button>
                <Button className="refreshBtn" size='large' onClick={this.reflesh}>
                  <i className='fa fa-refresh' />刷新
                </Button>
                {/*<Button className="btnItem" onClick={this.add} type="primary" ><Icon type="plus" />新建策略</Button>
                <Button className="btnItem" onClick={this.reflesh} type="ghost" ><Icon type="retweet" />刷新</Button>*/}
                {/*<Button className="btnItem" onClick={this.on} type="ghost" disabled={isbtnDisabled} ><Icon type="caret-right" />启用</Button>
                <Button className="btnItem" onClick={this.off} type="ghost" disabled={isbtnDisabled} ><Icon type="pause" />停用</Button>
                <Button className="btnItem" onClick={this.delItems} type="ghost" disabled={isbtnDisabled} ><Icon type="delete" />删除</Button>*/}
                {/*<Input.Group className={searchCls}>
                  <Input size='large' placeholder='请输入策略名称搜索' value={this.state.searchValue} onChange={this.handleInputChange}
                    onFocus={this.handleFocusBlur} onBlur={this.handleFocusBlur} onPressEnter={this.handleSearch}
                  />
                  <div className="ant-input-group-wrap">
                    <Button type="ghost" icon="search" className={btnCls} onClick={this.handleSearch} />
                  </div>
                </Input.Group>*/}

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
                {
                    !!isTab1Fetching ?
                    <div className="loadingBox">
                      <Spin size="large"/>
                    </div>
                    :
                    <div className='reset_antd_table_header'>
                      <Table columns={columns} dataSource={tableData} pagination={this.state.pagination} />
                    </div>
                }
                </Card>
              </div>
            </div>
            <div className={part2Class} key="part2">
              <div className="titleContainer">
                {/*<Button className="btnItem" type="primary" onClick={this.returnPart1}>返回</Button>
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
                      {currentData.isOn?
                        <span className="rightContent isOnCon"><i className="fa fa-circle"></i>启用</span>
                        :
                        <span className="rightContent isOffCon"><i className="fa fa-circle"></i>停用</span>
                      }
                    </p>
                    <p><span className="leftTitle">数据中心</span><span className="rightContent">{currentData.datacenter}</span></p>
                    <p><span className="leftTitle">虚拟机模版</span><span className="rightContent">{currentData.templatePath}</span></p>
                    <p><span className="leftTitle">计算资源池</span><span className="rightContent">{currentData.resourcePoolPath}</span></p>
                    <p><span className="leftTitle">存储资源池</span><span className="rightContent">{currentData.datastorePath}</span></p>
                  </div>
                  <div className="cardPart">
                    <p><span className="leftTitle">最小实例数</span><span className="rightContent">{currentData.min + " 个"}</span></p>
                    <p><span className="leftTitle">最大实例数</span><span className="rightContent">{currentData.max + " 个"}</span></p>
                    {/* <p><span className="leftTitle">阈值</span><span className="rightContent">{currentData.xxx1}</span></p> */}
                    <p><span className="leftTitle">伸缩活动</span><span className="rightContent">{"增加 " + currentData.max + " 台"}</span></p>
                  </div>
                  <div className="cardPart">
                    <p><span className="leftTitle">Email</span><span className="rightContent">{currentData.email ? currentData.email : "-"}</span></p>
                    <p><span className="leftTitle">策略冷却时间</span><span className="rightContent">{currentData.duration}</span></p>

                  </div>
                  <div style={{clear: "both"}}></div>
                </Card>
                <Card className="right" title="伸缩日志" bordered={false}>
                  <div className="appAutoScaleLogs">
                    {
                      isLogFetching ?
                      <div className="loadingBox">
                        <Spin size="large"/>
                      </div>
                      :
                      !!logList ?
                        <ul className="ant-timeline">
                          {linelist}
                        </ul>
                        : <div style={{ textAlign: 'center' }}>暂无数据</div>
                    }

                    {/*<Timeline>
                      {linelist}
                    </Timeline>*/}
                  </div>
                </Card>
              </div>
            </div>
          </QueueAnim>
          <Tab1Modal
            isEdit={this.state.isEdit}
            currentData={this.state.currentData}
            func={func} closeTab1Modal={this.closeTab1Modal} visible={this.state.isTab1ModalShow} onOk={this.onTab1ModalOk} onCancel={this.onTab1ModalCancel} onClose={this.onTab1ModalCancel}/>
          <Tab2Modal
            visible={this.state.isTab2ModalShow}
            onCancel={this.onTab2ModalCancel}
            onClose={this.onTab2ModalCancel}
            isEdit={false}
            currData={null}
            funcTab1={funcTab1}
            ref="tab2MC"/>
          <Modal
            visible={this.state.isShowDelModal}
            onOk={this.del}
            onCancel={this.onCancel}
            onClose={this.onCancel}
            confirmLoading={this.state.deleteLoading}
            title="删除伸缩策略"
            okText="确定" >
            <div style={{color: "#00a0ea"}}>确定删除策略 {this.state.currentData.name || ""} ?</div>
          </Modal>
      </div>
    )
  }
  componentDidMount() {
    this.loadData();
  }
};
const mapStateToProps = state => {
  const { appAutoScaler } = state;
  const { getAppList, getLogList } = appAutoScaler;
  const { appList, isTab1Fetching } = getAppList || {appList: [], isTab1Fetching: false};
  const { logList, isLogFetching } = getLogList || {logList: [], isLogFetching: false};
  return {
    appList,
    isTab1Fetching,
    logList,
    isLogFetching,
  };
};

export default connect(mapStateToProps, {
  getAppList: autoScalerActions.getAutoScalerAppList,
  getLogList: autoScalerActions.getAutoScalerLogList,
  addApp: autoScalerActions.createApp,
  updateApp: autoScalerActions.updateApp,
  deleteApp: autoScalerActions.deleteApp,
  changeAppStatus: autoScalerActions.changeAppStatus,
})(Tab1);
