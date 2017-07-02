/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Project Detail
 *
 * v0.1 - 2017-06-06
 * @author zhangxuan
 */

import React, { Component } from 'react'
import classNames from 'classnames';
import './style/ProjectDetail.less'
import { Row, Col, Button, Input, Select, Card, Icon, Table, Modal, Checkbox, Tooltip, Steps, Transfer, InputNumber, Tree, Switch, Alert, Dropdown, Menu} from 'antd'
import { browserHistory, Link} from 'react-router'

const Option = Select.Option;
let children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

function handleChange(value) {
  console.log(`selected ${value}`);
}

const x = 3;
const y = 2;
const z = 1;
const gData = [];

const generateData = (_level, _preKey, _tns) => {
  const preKey = _preKey || '0';
  const tns = _tns || gData;
  
  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);



const columns = [{
  title: 'Name',
  dataIndex: 'name',
  render: text => <a href="#">{text}</a>,
}, {
  title: 'Age',
  dataIndex: 'age',
}];
const data = [{
  key: 1,
  name: 'John Brown sr.',
  age: 60,
  children: [{
    key: 11,
    name: 'John Brown',
    age: 42,
  }, {
    key: 12,
    name: 'John Brown jr.',
    age: 30,
    children: [{
      key: 121,
      name: 'Jimmy Brown',
      age: 16,
    }],
  }, {
    key: 13,
    name: 'Jim Green sr.',
    age: 72,
    children: [{
      key: 131,
      name: 'Jim Green',
      age: 42,
      children: [{
        key: 1311,
        name: 'Jim Green jr.',
        age: 25,
      }, {
        key: 1312,
        name: 'Jimmy Green sr.',
        age: 18,
      }],
    }],
  }],
}, {
  key: 2,
  name: 'Joe Black',
  age: 32,
}];
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  onSelect: (record, selected, selectedRows) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  },
};
class ProjectDetail extends Component{
  constructor(props){
    super(props)
    this.state={
      editComment:false,
      paySingle:false,
      switchState:false,
      balanceWarning:false,
      expandedKeys: ['0-0-0', '0-0-1'],
      autoExpandParent: true,
      checkedKeys: ['0-0-0'],
      selectedKeys: [],
      addCharacterModal:false,
      mockData: [],
      targetKeys: [],
      characterModal:false,
      payNumber:10
    }
  }
  componentDidMount() {
    this.getMock();
  }
  getMock() {
    const targetKeys = [];
    const mockData = [];
    for (let i = 0; i < 20; i++) {
      const data = {
        key: i,
        title: `内容${i + 1}`,
        description: `内容${i + 1}的描述`,
        chosen: Math.random() * 2 > 1,
      };
      if (data.chosen) {
        targetKeys.push(data.key);
      }
      mockData.push(data);
    }
    this.setState({ mockData, targetKeys });
  }
  filterOption(inputValue, option) {
    return option.description.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys) {
    this.setState({ targetKeys });
  }
  editComment() {
    this.setState({editComment:true})
  }
  saveComment() {
    this.setState({editComment:false})
  }
  paySingle() {
    this.setState({paySingle: true})
  }
  paySingleCancel() {
    this.setState({paySingle: false})
  }
  paySingleOk() {
    this.setState({paySingle: false})
  }
  switchChange(checked) {
    this.setState({switchState:checked})
  }
  warningCancel() {
    this.setState({balanceWarning:false})
  }
  warningSubmit() {
    this.setState({balanceWarning:false})
  }
  onExpand = (expandedKeys) => {
    console.log('onExpand', arguments);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck = (checkedKeys) => {
    this.setState({
      checkedKeys,
      selectedKeys: ['0-3', '0-4'],
    });
  }
  onSelect = (selectedKeys, info) => {
    console.log('onSelect', info);
    this.setState({ selectedKeys });
  }
  addCharacterOk() {
    this.setState({addCharacterModal:false})
  }
  addCharacterCancel() {
    this.setState({addCharacterModal:false})
  }
  cancelModal() {
    this.setState({characterModal:false})
  }
  createModal() {
    this.setState({characterModal:false})
  }
  changePayNumber(payNumber) {
    this.setState({payNumber})
  }
  handleMenuClick(e) {
    console.log(e)
  }
  clusterStatus(status) {
    return (
      <span className={`projectDetailClusterStatus projectDetailClusterStatus${status}`}>
        {status ===1 ? '申请中...' : ''}
        {status ===2 ? '已授权' : ''}
        {status ===3 ? '已拒绝' : ''}
      </span>
    )
  }
  render() {
    const { payNumber } = this.state;
    const TreeNode = Tree.TreeNode;
    const menu = (
        <Menu onClick={this.handleMenuClick} style={{maxWidth:'300px'}}>
          <Menu.Item key="-1" disabled style={{color:'#666',background:'#eee'}}>已选集群（2）</Menu.Item>
          <Menu.Item key="1">第一个菜单项
            {this.clusterStatus(1)}
            <Icon type="cross-circle-o" className="pull-right" style={{marginLeft:'10px'}}/>
            <Tooltip placement="top" title='重新申请' >
              <i className="fa fa-pencil-square-o pull-right fa-lg" aria-hidden="true"/>
            </Tooltip>
          </Menu.Item>
          <Menu.Item key="2">第二个菜单项
            {this.clusterStatus(2)}
            <Icon type="cross-circle-o" className="pull-right" style={{marginLeft:'10px'}}/>
            <Tooltip placement="top" title='重新申请' >
              <i className="fa fa-pencil-square-o pull-right fa-lg" aria-hidden="true"/>
            </Tooltip>
          </Menu.Item>
          <Menu.Item key="3">第三个菜单项
            {this.clusterStatus(3)}
            <Icon type="cross-circle-o" className="pull-right" style={{marginLeft:'10px'}}/>
            <Tooltip placement="top" title='重新申请' >
              <i className="fa fa-pencil-square-o pull-right fa-lg" aria-hidden="true"/>
            </Tooltip>
          </Menu.Item>
          <Menu.Item key="0" disabled style={{color:'#666',background:'#eee'}}>可选集群（2）</Menu.Item>
          <Menu.Item key="4">第四个菜单项</Menu.Item>
          <Menu.Item key="5">第五个菜单项</Menu.Item>
        </Menu>
    );
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.key} disableCheckbox={item.key === '0-0-0'}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.key} />;
    });
    let alertMessage = (
      <div style={{ color: '#137bb8', lineHeight: '28px', }}>
        <Icon type="smile" style={{ marginRight: 10 }} /> 温馨提示: <br />
        <p>1. 每个有权限管理该项目的人都可设置该项目的余额预警提醒，该设置的提醒只针对设置者本人，以对设置者发邮件的方式提醒，方便及时为项目充值。</p>
        <p>2. 当项目余额小于该值时，每天邮件提醒一次。</p>
      </div>
    )
    return(
      <div className="projectDetailBox">
        <div className="goBackBox">
          <span className="goBackBtn pointer" onClick={()=> browserHistory.push('/tenant_manage/project_manage')}>返回</span>
          <i/>
          创建项目
        </div>
        <Modal title="项目充值" visible={this.state.paySingle} width={580}
           onCancel = {()=> this.paySingleCancel()}
           onOk = {()=> this.paySingleOk()}
        >
          <dl className="paySingleList">
            <dt>项目名</dt><dd>nginx-test</dd>
          </dl>
          <dl className="paySingleList">
            <dt>余额</dt><dd>10T</dd>
          </dl>
          <dl className="paySingleList">
            <dt>充值金额</dt>
            <dd className="payBtn">
              <span className={classNames('btnList',{'active': payNumber === 10})} onClick={()=>{this.changePayNumber(10)}}>10T<div className="triangle"><i className="anticon anticon-check"/></div></span>
              <span className={classNames('btnList',{'active': payNumber === 20})} onClick={()=>{this.changePayNumber(20)}}>20T<div className="triangle"><i className="anticon anticon-check"/></div></span>
              <span className={classNames('btnList',{'active': payNumber === 50})} onClick={()=>{this.changePayNumber(50)}}>50T<div className="triangle"><i className="anticon anticon-check"/></div></span>
              <span className={classNames('btnList',{'active': payNumber === 100})} onClick={()=>{this.changePayNumber(100)}}>100T<div className="triangle"><i className="anticon anticon-check"/></div></span>
              <InputNumber value={payNumber} onChange={(value)=>this.setState({payNumber:value})} size="large" min={10}/>
              <b>T</b>
            </dd>
          </dl>
        </Modal>
        <Modal visible={this.state.balanceWarning}
               title='设置提醒'
               wrapClassName='remindModal'
               onOk={this.warningSubmit.bind(this)}
               onCancel={this.warningCancel.bind(this)}
               width='610px' >
          <div>
            <Alert message={alertMessage} type="info" />
            <Row style={{ color: '#333333', height: 35 }}>
              <Icon type="pay-circle-o" style={{ marginRight: 10 }} />
              余额不足提醒
            </Row>
            <Row style={{ paddingLeft: '22px', height: 35 }}>
              <Col span={4} style={{ color: '#7a7a7a' }}>提醒规则</Col>
              <Col span={20} style={{ color: '#666666' }}>我的空间可用余额小于&nbsp;
                <InputNumber/>
                <span> T</span>
                &nbsp;时发送提醒
              </Col>
            </Row>
            <Row style={{ paddingLeft: '22px', height: 28 }}>
              <Col span={4} style={{ color: '#7a7a7a' }}>提醒方式</Col>
              <Col span={20}>
                <Checkbox  style={{ color: '#7a7a7a', fontSize: '14px' }} >邮件(123456@qq.com)</Checkbox>
              </Col>
            </Row>
          </div>
        </Modal>
        <Card title="基本信息" bordered={false} style={{ width: '100%' }}>
          <Row>
            <Col span={12}>
              <div className="basicInfoLeft">
                <Row gutter={16}>
                  <Col className='gutter-row' span={4}>
                    <div className="gutter-box">
                      项目名称
                    </div>
                  </Col>
                  <Col className='gutter-row' span={20}>
                    <div className="gutter-box">
                      项目1
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className='gutter-row' span={4}>
                    <div className="gutter-box">
                      余额
                    </div>
                  </Col>
                  <Col className='gutter-row' span={20}>
                    <div className="gutter-box">
                      <span style={{marginRight:'30px'}}>58888T</span>
                      <Button type="primary" size="large" onClick={this.paySingle.bind(this)}>充值</Button>
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className='gutter-row' span={4}>
                    <div className="gutter-box">
                      余额预警
                    </div>
                  </Col>
                  <Col className='gutter-row' span={20}>
                    <div className="gutter-box">
                      <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={false}  onChange={(checked)=>this.switchChange(checked)}/>
                      {
                        this.state.switchState ?
                          <span>
                            <span className="balanceTip">项目余额小于 <span className="themeColor">2T</span> 时预警</span>
                            <span className="alertBtn themeColor pointer" onClick={()=>this.setState({balanceWarning:true})}>修改</span>
                          </span>
                          : ''
                      }
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className='gutter-row' span={4}>
                    <div className="gutter-box">
                      授权集群
                    </div>
                  </Col>
                  <Col className='gutter-row' span={20}>
                    <div className="gutter-box">
                      <Dropdown overlay={menu} trigger={['click']}>
                        <Button type="ghost" style={{ height:34, color:'#b0b0b0' }}>
                          编辑授权集群 <Icon type="down" />
                        </Button>
                      </Dropdown>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col span={12}>
              <div className="basicInfoRight">
                <Row gutter={16}>
                  <Col className='gutter-row' span={4}>
                    <div className="gutter-box">
                      项目角色
                    </div>
                  </Col>
                  <Col className='gutter-row' span={20}>
                    <div className="gutter-box">
                      创建者
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className='gutter-row' span={4}>
                    <div className="gutter-box">
                      创建时间
                    </div>
                  </Col>
                  <Col className='gutter-row' span={20}>
                    <div className="gutter-box">
                      2017-03-24
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className='gutter-row' span={4}>
                    <div className="gutter-box">
                      更新时间
                    </div>
                  </Col>
                  <Col className='gutter-row' span={20}>
                    <div className="gutter-box">
                      2017-03-24
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className='gutter-row' span={4}>
                    <div className="gutter-box">
                      备注
                    </div>
                  </Col>
                  <Col className='gutter-row' span={20}>
                    <div className="gutter-box">
                      <div className="example-input inlineBlock">
                        {
                          this.state.editComment ?
                            <div>
                              <Input size="large" placeholder="大尺寸" />
                              <i className="anticon anticon-save pointer" onClick={()=> this.saveComment()}/>
                            </div>
                            :
                            <div>
                              <span>我是一只小黄鱼</span>
                              <i className="anticon anticon-edit pointer" onClick={()=> this.editComment()}/>
                            </div>
                        }
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Card>
        <div className="projectResource">
          <Card title="项目资源">
            <Row gutter={16}>
              <Col className='gutter-row' span={8}>
                <div className="gutter-box">
                  <i className="inlineBlock appNum"/>
                  <span>应用数：12个</span>
                </div>
              </Col>
              <Col className='gutter-row' span={8}>
                <div className="gutter-box">
                  <i className="inlineBlock serverNum"/>
                  <span>服务数：12个</span>
                </div>
              </Col>
              <Col className='gutter-row' span={8}>
                <div className="gutter-box">
                  <i className="inlineBlock containerNum"/>
                  <span>容器数：12个</span>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
        <Modal
          visible={this.state.addCharacterModal}
          title='添加角色'
          wrapClassName='addCharacterModal'
          onOk={this.addCharacterOk.bind(this)}
          onCancel={this.addCharacterCancel.bind(this)}
          width='760px'
        >
          <Transfer
            dataSource={this.state.mockData}
            showSearch
            listStyle={{
              width: 300,
              height: 270,
            }}
            searchPlaceholde="请输入搜索内容"
            titles={['可选角色（个）', '已选角色（个）']}
            operations={['移除', '添加']}
            filterOption={this.filterOption.bind(this)}
            targetKeys={this.state.targetKeys}
            onChange={this.handleChange.bind(this)}
            render={item => item.title}
          />
        </Modal>
        <Modal title="创建角色" wrapClassName="createCharacterModal" visible={this.state.characterModal} width={570}
               onCancel={()=> this.cancelModal()}
               onOk={()=> this.createModal()}
        >
          <CreateCharacter/>
        </Modal>
        <div className="projectMember">
          <Card title="项目中角色关联的对象" className="clearfix">
            <div className="connectLeft pull-left">
              <span className="leftTitle">已添加角色</span>
              <ul className="characterListBox">
                <li>开发123 <Icon type="delete" className="pointer"/></li>
                <li>开发123 <Icon type="delete" className="pointer"/></li>
                <li>开发123 <Icon type="delete" className="pointer"/></li>
                <li>开发123 <Icon type="delete" className="pointer"/></li>
              </ul>
              <Button type="primary" size="large" icon="plus" onClick={()=>this.setState({addCharacterModal:true})}>添加已有角色</Button><br/>
              <Button type="ghost" size="large" icon="plus" onClick={()=>this.setState({characterModal:true})}>创建新角色</Button>
            </div>
            <div className="connectRight pull-left">
              <p className="rightTitle">角色关联对象</p>
              <div className="rightContainer">
                <div className="authBox inlineBlock">
                  <p className="authTitle">开发角色共 <span style={{color:'#59c3f5'}}>14</span> 个权限</p>
                  <div className="treeBox">
                    <Tree
                      checkable
                      onExpand={this.onExpand.bind(this)} expandedKeys={this.state.expandedKeys}
                      autoExpandParent={this.state.autoExpandParent}
                      onCheck={this.onCheck.bind(this)} checkedKeys={this.state.checkedKeys}
                      onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
                    >
                      {loop(gData)}
                    </Tree>
                  </div>
                </div>
                <div className="memberBox inlineBlock">
                  <div className="memberTitle">
                    <span>开发角色已关联 <span className="themeColor">10</span> 个对象</span>
                    <Button type="primary" size="large">继续关联对象</Button>
                  </div>
                  <div className="memberTableBox">
                    <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}/>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
    
  }
}
const gDatas = [];

const generateDatas = (_level, _preKey, _tns) => {
  const preKey = _preKey || '0';
  const tns = _tns || gDatas;
  
  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateDatas(level, key, tns[index].children);
  });
};
generateDatas(z);
class CreateCharacter extends Component{
  constructor(props) {
    super(props)
    this.state={
      expandedKeys: ['0-0-0', '0-0-1'],
      autoExpandParent: true,
      checkedKeys: ['0-0-0'],
      selectedKeys: [],
    }
  }
  
  onExpand(expandedKeys) {
    console.log('onExpand', arguments);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck(checkedKeys) {
    this.setState({
      checkedKeys,
      selectedKeys: ['0-3', '0-4'],
    });
  }
  onSelect(selectedKeys, info) {
    console.log('onSelect', info);
    this.setState({ selectedKeys });
  }
  render() {
    const TreeNode = Tree.TreeNode;
  
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.key} disableCheckbox={item.key === '0-0-0'}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.key} />;
    });
    return(
      <div>
        <div className="inputBox">
          <span>角色名称</span>
          <Input size="large" placeholder="请填写角色名称"/>
        </div>
        <div className="inputBox">
          <span>备注</span>
          <Input size="large"/>
        </div>
        <div className="authChoose">
          <span>权限选择</span>
          <div className="authBox inlineBlock">
            <div className="authTitle clearfix">可选权限 <div className="pull-right"><span style={{color:'#59c3f5'}}>14</span> 个权限</div></div>
            <div className="treeBox">
              <Tree
                checkable
                onExpand={this.onExpand.bind(this)} expandedKeys={this.state.expandedKeys}
                autoExpandParent={this.state.autoExpandParent}
                onCheck={this.onCheck.bind(this)} checkedKeys={this.state.checkedKeys}
                onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
              >
                {loop(gDatas)}
              </Tree>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default ProjectDetail;