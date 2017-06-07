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
import { Row, Col, Button, Input, Select, Card, Icon, Table, Modal, Checkbox, Tooltip, Steps, Transfer, InputNumber, Tree, Switch, Alert} from 'antd'
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
    }
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
              <span className="active btnList">10T</span>
              <span className="btnList">20T</span>
              <span className="btnList">50T</span>
              <span className="btnList">100T</span>
              <InputNumber size="large" min={10}/>
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
                <span> T币</span>
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
                      <Select
                        multiple
                        style={{ width: '50%' }}
                        placeholder="编辑授权集群"
                        defaultValue={['a10', 'c12']}
                        onChange={handleChange}
                      >
                        {children}
                      </Select>
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
        <div>
          <Card title="项目中角色关联的对象">
            <div className="connectLeft pull-left">
              <span className="leftTitle">已添加角色</span>
              <ul className="characterListBox">
                <li>开发123 <Icon type="delete" className="pointer"/></li>
                <li>开发123 <Icon type="delete" className="pointer"/></li>
                <li>开发123 <Icon type="delete" className="pointer"/></li>
                <li>开发123 <Icon type="delete" className="pointer"/></li>
              </ul>
              <Button type="primary" size="large" icon="plus">添加已有角色</Button><br/>
              <Button type="ghost" size="large" icon="plus">创建新角色</Button>
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
                  <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}/>
                </div>
              </div>
              
            </div>
          </Card>
        </div>
      </div>
    )
    
  }
}

export default ProjectDetail;