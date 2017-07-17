/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Project Manage
 *
 * v0.1 - 2017-06-02
 * @author zhangxuan
 */
import React, { Component } from 'react'
import classNames from 'classnames';
import './style/ProjectManage.less'
import { Row, Col, Button, Input, Select, Card, Icon, Table, Modal, Checkbox, Tooltip, Steps, Transfer, InputNumber, Tree, Dropdown, Menu, Spin, Form } from 'antd'
import { browserHistory, Link } from 'react-router'
import { connect } from 'react-redux'
import { ListProjects, DeleteProjects, UpdateProjects } from '../../../actions/project'
import { chargeProject } from '../../../actions/charge'
import { parseAmount } from '../../../common/tools'
import Notification from '../../../components/Notification'
import CommonSearchInput from '../../../components/CommonSearchInput'
import CreateStepFirst from './CreateStepFirst'
import CreateStepSecond from './CreateStepSecond'
import CreateStepThird from './CreateStepThird'
class ProjectManage extends Component{
  constructor(props) {
    super(props)
    this.state= {
      delModal: false,
      delSingle: false,
      paySingle: false,
      payModal: false,
      loading: false,
      tableLoading: false,
      current: 0,
      payNumber: 10,
      selected: [],
      projectList: [],
      deleteArr: [],
      deleteSinglePro: [],
      payArr: [],
      paySinglePro: [],
      projectName: undefined,
      description: '',
      authorizedCluster: [],
      RoleKeys: [],
      rightModal: false,
      mockData: [],
      targetKeys: [],
    }
  }
  componentWillMount() {
    this.refresh('tableLoading')
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
  componentWillReceiveProps(nextProps) {
    const step = nextProps.location.query.step;
    if (step) {
      let newStep;
      if (step === 'first') {
        newStep = 0
      } else if (step === 'second') {
        newStep = 1
      } else {
        newStep = 2
      }
      this.setState({
        current: newStep
      })
    } else {
      this.setState({
        projectName: undefined,
        description: undefined,
        authorizedCluster: [],
        RoleKeys: []
      })
    }
  }
  updateProjectName(name) {
    this.setState({
      projectName:name
    })
  }
  updateProjectDesc(desc) {
    this.setState({
      description:desc
    })
  }
  updateCluster(arr) {
    this.setState({
      authorizedCluster:arr
    })
  }
  updateRole(Role) {
    this.setState({
      RoleKeys:Role
    })
  }
  goStep(current) {
    const { projectName, authorizedCluster, RoleKeys} = this.state;
    let notify = new Notification()
    let s = '';
    if (current === 0) {
      s = 'first';
    }else if(current === 1) {
      if (!projectName) {
        return notify.info('请输入项目名称')
      } else if (authorizedCluster.length === 0) {
        return notify.info('请选择授权集群')
      }
      s = 'second';
    }else{
      if (RoleKeys.length === 0) {
        return notify.info('请选择项目角色')
      }
      s = 'third'
    }
    browserHistory.replace(`/tenant_manage/project_manage?step=${s}`);
    this.setState({ current });
  }
  next() {
    let current = this.state.current + 1;
    if (current === 3) {
      current = 0;
    }
    this.goStep(current)
  }
  goBack() {
    let current = this.state.current - 1;
    if (current === -1) {
      current = 2;
    }
    this.goStep(current)
  }
  delProject() {
    this.setState({delModal: true})
  }
  delSingle(e,record) {
    e.stopPropagation()
    this.setState({
      delSingle: true,
      deleteSinglePro: [record]
    })
  }
  singleCancel() {
    this.setState({delSingle: false})
  }
  pay() {
    this.setState({payModal: true})
  }
  payCancel() {
    this.setState({payModal: false})
  }
  paySingle(e,record) {
    e.stopPropagation()
    this.setState({
      paySingle: true,
      paySinglePro:[record]
    })
  }
  paySingleCancel() {
    this.setState({paySingle: false})
  }
  paySingleOk() {
    const { chargeProject } = this.props;
    const { paySinglePro, payNumber } = this.state;
    let notify = new Notification()
    chargeProject({
      namespaces:[paySinglePro[0].projectName],
      amount:payNumber
    },{
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            notify.success('充值成功')
            this.setState({paySingle:false})
            this.refresh('tableLoading')
          }
        },
        isAsync: true
      }
    })
  }
  refresh(loading) {
    const { ListProjects } = this.props;
    this.setState({[loading]:true})
    ListProjects({},{},{
      success:{
        func: (result)=>{
          if (result.statusCode === 200) {
            this.setState({projectList:result.data})
            this.setState({[loading]:false})
          }
        },
        isAsync:true
      }
    })
  }
  changePayNumber(payNumber) {
    this.setState({payNumber})
  }
  onSelectChange(keys) {
    const { selected } = this.state;
    this.setState({selected:keys})
  }
  deleteProject(modal) {
    const { DeleteProjects } = this.props;
    const { deleteArr } = this.state;
    let notify = new Notification()
    DeleteProjects({
      body:{
        projects:deleteArr,
      }
    },{
      success:{
        func: (res) => {
          if (res.statusCode === 200) {
            this.refresh('tableLoading')
            notify.success('项目删除成功')
            this.setState({[modal]:false})
          }
        },
        isAsync:true
      }
    })
  }
  updateDeleteArr(deleteArr) {
    this.setState({
      deleteArr
    })
  }
  updatePayNumber(payNumber) {
    this.setState({
      payNumber
    })
  }
  updatePayArr(payArr) {
    this.setState({
      payArr
    })
  }
  updatePayCharge() {
    const { chargeProject } = this.props;
    const { payArr,payNumber } = this.state;
    let notify = new Notification()
    if (payArr.length < 1) {
      return notify.info('请选择您要充值的项目')
    }
    chargeProject({
      namespaces:payArr,
      amount:payNumber
    },{
      success: {
        func: (res) => {
          if (res.statusCode === 200) {
            notify.success('充值成功')
            this.setState({payModal:false})
            this.refresh('tableLoading')
          }
        },
        isAsync: true
      }
    })
  }
  searchProject(value) {
    const { ListProjects } = this.props;
    this.setState({tableLoading:true})
    let filter =  'name,' + value
    ListProjects({},{
     filter
    },{
      success:{
        func: (result)=>{
          if (result.statusCode === 200) {
            this.setState({projectList:result.data})
            this.setState({tableLoading:false})
          }
        },
        isAsync:true
      }
    })
  }
  openRightModal() {
    this.setState({
      rightModal: true
    })
  }
  cancelRightModal() {
    this.setState({
      rightModal: false
    })
  }
  confirmRightModal() {
    this.setState({
      rightModal: false
    })
  }
  filterOption(inputValue, option) {
    return option.description.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys) {
    this.setState({ targetKeys });
  }
  render() {
    const step = this.props.location.query.step || '';
    const { payNumber, selected, projectList, delModal, deleteSinglePro, delSingle, tableLoading, payModal, paySinglePro,projectName } = this.state;
    const { clustersFetching, clusters } = this.props;
    const pagination = {
      simple: true,
      total:  projectList && projectList.length,
      showSizeChanger: true,
      defaultPageSize: 10,
      defaultCurrent: 1,
      pageSizeOptions: ['5', '10', '15', '20'],
    };
    const columns = [{
      title: '项目名',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text) => <Link to={`/tenant_manage/project_manage/project_detail?name=${text}`}>{text}</Link>,
    }, {
      title: '项目角色',
      dataIndex: 'role',
      key: 'role',
      filters: [{
        text: '系统管理员',
        value: 'admin',
      }, {
        text: '管理员',
        value: 'manager',
      }, {
        text: '访客',
        value: 'advisor',
      }, {
        text: '创建者',
        value: 'creator',
      }],
      onFilter: (value, record) => record.role.indexOf(value) === 0,
      render: (data) =>
        <div>
          <div>
            {data === 'admin' ? '系统管理员' : ''}
            {data === 'manager' ? '管理员' : ''}
            {data === 'creator' ? '创建者' : ''}
            {data === 'advisor' ? '访客' : ''}
          </div>
        </div>
    },
    //   {
    //   title: '备注',
    //   dataIndex: 'description',
    //   key: 'description',
    // },
      {
      title: '授权集群',
      dataIndex: 'clusterCount',
      key: 'clusterCount',
      sorter: (a, b) => a.clusterCount - b.clusterCount,
      render: (text) => <span>{text ? text : 0}</span>
    }, {
      title: '成员',
      dataIndex: 'userCount',
      key: 'userCount',
      sorter: (a, b) => a.userCount - b.userCount,
    }, {
      title: '项目管理员',
      render: (text,record) =>
        <span>1</span>
    }, {
      title: '创建时间',
      dataIndex: 'creationTime',
      key: 'creationTime',
      // filters: [{
      //   text: '2017',
      //   value: '2017',
      // }, {
      //   text: '2016',
      //   value: '2016',
      // }],
      // onFilter: (value, record) => record.creationTime.indexOf(value) === 0,
      render: (data) =>
        <div>
          <div>{data}</div>
        </div>

    }, {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      sorter: (a, b) => a.balance - b.balance,
      render: (text)=><span className="balanceColor">{parseAmount(text,4).fullAmount}</span>
    }, {
      title: '操作',
      key: 'operation',
      render: (text, record) => (
        <span>
          <Button type='primary' size='large' onClick={(e)=> this.paySingle(e,record)}>充值</Button>
          <Button type='ghost' size='large' style={{marginLeft:'10px'}} onClick={(e)=>this.delSingle(e,record)}>删除</Button>
        </span>
      ),
    }]
    return (
      <div id="account_projectManage">
        <div className='alertRow'>项目之间是项目隔离的，通过创建项目实现按照角色关联对象（成员、团队），并根据授予的权限，使用项目中资源及功能。系统管理员有创建和管理所有项目的权限
        （创建、删除、充值、授权集群、编辑备注、添加角色、为角色关联/取消对象、移除角色），团队管理员有管理项目的某些权限（充值、添加角色、删除角色、为角色关联/取消对象）。
        </div>
        <Modal title="删除项目" visible={delModal} width={610} height={570}
          onCancel={()=> this.setState({delModal: false})}
          onOk={()=> this.deleteProject('delModal')}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
            <span>将永久删除一下项目，包括项目中的所有资源。您确定要删除一下项目？</span>
          </div>
          <DelProjectTable delData={projectList} updateDeleteArr={this.updateDeleteArr.bind(this)} visible={delModal}/>
        </Modal>
        <Modal title="删除项目" visible={delSingle} width={610}
          onCancel={()=> this.singleCancel()}
          onOk={()=> this.deleteProject('delSingle')}
        >
          <DelProjectTable delData={deleteSinglePro} updateDeleteArr={this.updateDeleteArr.bind(this)} visible={delSingle}/>
        </Modal>
        <Modal title="项目充值" visible={payModal} width={610}
          onCancel={()=> this.payCancel()}
          onOk={()=> this.updatePayCharge()}
        >
          <PayTable data={projectList} updatePayArr={this.updatePayArr.bind(this)} visible={payModal} updatePayCharge={this.updatePayCharge.bind(this)} updatePayNumber={this.updatePayNumber.bind(this)}/>
        </Modal>
        <Modal title="项目充值" visible={this.state.paySingle} width={580}
          onCancel = {()=> this.paySingleCancel()}
          onOk = {()=> this.paySingleOk()}
        >
          <dl className="paySingleList">
            <dt>项目名</dt><dd>{paySinglePro[0]&&paySinglePro[0].projectName}</dd>
          </dl>
          <dl className="paySingleList">
            <dt>余额</dt><dd>{parseAmount(paySinglePro[0]&&paySinglePro[0].balance,4).fullAmount}</dd>
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
        <Modal title="选择可以创建项目的成员" width={760} visible={this.state.rightModal}
          onCancel = {()=> this.cancelRightModal()}
          onOk = {()=> this.confirmRightModal()}
        >
          <div className="alertRow">可创建项目的成员能创建项目并有管理该项目的权限</div>
          <Transfer
            dataSource={this.state.mockData}
            listStyle={{
              width: 300,
              height: 270,
            }}
            operations={['添加', '移除']}
            titles={['可选成员名','可创建项目成员']}
            searchPlaceholder="按成员名搜索"
            showSearch
            filterOption={this.filterOption}
            targetKeys={this.state.targetKeys}
            onChange={this.handleChange}
            render={item => item.title}
          />
        </Modal>
        <Row className={classNames({'hidden': step !== ''})}>
          <Button type='primary' size='large'  className='addBtn' onClick={()=> browserHistory.replace('/tenant_manage/project_manage?step=first')}>
            <i className='fa fa-plus' /> 创建项目
          </Button>
          <Button type="ghost" size="large" className="manageBtn" onClick={()=> this.openRightModal()}><i className="fa fa-mouse-pointer" aria-hidden="true"/> 哪些人可以创建项目</Button>
          <Button type="ghost" icon="pay-circle-o" size="large" className="manageBtn" onClick={()=> this.pay()}>充值</Button>
          <Button type="ghost" icon={ this.state.loading ? 'loading' : "reload"}  size="large" className="manageBtn" onClick={()=> this.refresh('loading')}>刷新</Button>
          {/*<Button type="ghost" icon="delete" size="large" className="manageBtn" onClick={()=> this.delProject()}>删除</Button>*/}
          <CommonSearchInput placeholder="请输入项目名称进行搜索" size="large" onSearch={this.searchProject.bind(this)}/>
          <div className="total">共{projectList.length}个</div>
        </Row>
        <Row className={classNames("projectList",{'hidden': step !== ''})}>
          <Card>
            <Table
              loading={tableLoading}
              pagination={pagination}
              columns={columns}
              dataSource={projectList}
            />
          </Card>
        </Row>
        <div className={classNames("goBackBox",{'hidden': step === ''})}>
          <span className="goBackBtn pointer" onClick={()=> browserHistory.replace('/tenant_manage/project_manage')}>返回</span>
          <i/>
          创建项目
        </div>
        <div className={classNames('createBox',{'hidden': step === ''})}>
          <ul className="stepBox">
            <li className={classNames({'active' : step === 'first'})}><span>1</span>项目基础信息</li>
            <li className={classNames({'active' : step === 'second'})}><span>2</span>为项目添加角色</li>
            <li className={classNames({'active' : step === 'third'})}><span>3</span>为角色关联对象</li>
          </ul>
          <div className="alertRow createTip">
            {
              step === 'first' ? '请填写项目名称、备注、并为该项目授权集群' : ''
            }
            {
              step === 'second' ? '为该项目添加需要的角色，角色是提前创建好的，也可在此创建新角色后继续添加' : ''
            }
            {
              step === 'third' ? '为添加的角色关联对象，即可为关联的对象授予相应角色应有的权限；关联的对象可为（成员/团队/成员&团队组合）。' : ''
            }
          </div>
          <div className={classNames({'hidden' : step !=='first'})}>
              <CreateStepFirst clusters = { clusters } scope = {this} step = {step} updateProjectName={this.updateProjectName.bind(this)} updateProjectDesc={this.updateProjectDesc.bind(this)} updateCluster={this.updateCluster.bind(this)}/>
          </div>
          <div className={classNames({'hidden' : step !=='second'})}>
            <CreateStepSecond scope={this} step = {step}  updateRole={this.updateRole.bind(this)}/>
          </div>
          <div className={classNames({'hidden' : step !=='third'})}>
            <CreateStepThird scope={this} step = {step}  updateRole={this.updateRole.bind(this)}/>
          </div>
        </div>
        
        <div className={classNames('createBtnBox',{'hidden': step === ''})}>
          <Button size="large" onClick={()=> browserHistory.replace('/tenant_manage/project_manage')}>取消</Button>
          <Button size="large" className={classNames({'hidden': step === '' || step === 'first'})} onClick={()=> this.goBack()}>上一步</Button>
          <Button size="large" className={classNames({'hidden': step === 'third'})} onClick={()=> this.next()}>下一步</Button>
          <Button type="primary" size="large" onClick={()=> browserHistory.replace('/tenant_manage/project_manage')} style={{display: step === 'third' ? 'inline-block' : 'none'}}>创建</Button>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { teamClusters } = state.team || { teamClusters : {}};
  let defaultTeamClusters = {
    isFetching: false,
    result:{
      data: []
    }
  }
  const { isFetching, result} = teamClusters || defaultTeamClusters;
  const { data } = result || [];
  return {
    clusters: data,
    clustersFetching: isFetching
  }
}
export default connect(mapStateToProps,{
  ListProjects,
  DeleteProjects,
  UpdateProjects,
  chargeProject,
})(ProjectManage);

class DelProjectTable extends Component{
  constructor(props){
    super(props);
    this.state={
      selectedRowKeys: [],  // 这里配置默认勾选列
      loading: false,
      deleteArr: []
    }
  }
  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;
    if (!visible) {
      this.setState({
        deleteArr: [],
        selectedRowKeys: []
      })
    }
  }
  start() {
    this.setState({ loading: true });
    // 模拟 ajax 请求，完成后清空
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 1000);
  }
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys});//报错
  }
  handClickRow(record,index) {
    const { updateDeleteArr } = this.props;
    const { selectedRowKeys, deleteArr } = this.state;
    let newDeleteArr = deleteArr.slice(0);
    let newSelected = selectedRowKeys.slice(0);
    let result = newSelected.findIndex((value,ind)=> value === index)
    if (result > -1) {
      newDeleteArr.splice(result,1)
      newSelected.splice(result,1)
    }else {
      newDeleteArr.push(record.projectName)
      newSelected.push(index)
    }
    this.setState({
      selectedRowKeys:newSelected,
      deleteArr:newDeleteArr
    })
    updateDeleteArr(newDeleteArr)
  }
  render() {
    const columns = [{
      title: '项目名',
      dataIndex: 'projectName',
    }, {
      title: '备注',
      dataIndex: 'description',
    }];
    const { loading, selectedRowKeys } = this.state;
    const {delData}= this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
    };
    return (
      <div className="delProjectModal">
        <Table scroll={{y: 300}} rowSelection={rowSelection} columns={columns} dataSource={delData} pagination={false} onRowClick={(recode,index)=>this.handClickRow(recode,index)}/>
        <div className="delTipBox"><i className="fa fa-check-square"/>选中此框以确认您要删除这些项目。</div>
      </div>
    )
  }
}
class PayTable extends Component{
  constructor(props){
    super(props)
    this.state={
      selectedRowKeys: [],  // 这里配置默认勾选列
      payNumber: 10,
      payArr: []
    }
  }
  componentWillMount() {
    const { updatePayNumber } = this.props;
    updatePayNumber(10)
  }
  componentWillReceiveProps(nextProps){
    const { visible } = nextProps;
    const { updatePayNumber } = nextProps;
    if (!visible) {
      this.setState({
        selectedRowKeys: [],
        payArr: [],
        payNumber: 10
      })
      updatePayNumber(10)
    }
  }
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys});//报错
  }
  handClickRow(record,index) {
    const { updatePayArr } = this.props;
    const { selectedRowKeys, payArr } = this.state;
    let newSelected = selectedRowKeys.slice(0);
    let newPayArr = payArr.slice(0)
    let result = newSelected.findIndex((value,ind)=> value === index)
    if (result > -1) {
      newPayArr.splice(result,1)
      newSelected.splice(result,1)
    }else {
      newPayArr.push(record.projectName)
      newSelected.push(index)
    }
    this.setState({
      selectedRowKeys:newSelected,
      payArr: newPayArr
    })
    updatePayArr(newPayArr)
  }
  changePayNumber(payNumber) {
    const { updatePayNumber } = this.props;
    this.setState({payNumber})
    updatePayNumber(payNumber)
  }
  render() {
    const { payNumber, selectedRowKeys } = this.state;
    const {data}= this.props;
    const columns = [{
      title: '项目名',
      dataIndex: 'projectName',
      width: '45%'
    }, {
      title: '余额',
      dataIndex: 'balance',
      width: '45%',
      render:(text,record)=>{
        return (
          <span className="balanceColor">{parseAmount(text,4).fullAmount}</span>
        )
      }
    }];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
    };
    return (
      <div className="payModal">
        <div className="alertRow">
          注：可为项目充值，全选可为项目充值
        </div>
        <Table scroll={{y: 300}} rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false} onRowClick={(recode,index)=>this.handClickRow(recode,index)} rowClassName={(recode,index)=>'payTableRow'}/>
        <dl className="payBtnBox">
          <dt>充值金额</dt>
          <dd className="payBtn">
            <span className={classNames('btnList',{'active': payNumber === 10})} onClick={()=>{this.changePayNumber(10)}}>10T<div className="triangle"><i className="anticon anticon-check"/></div></span>
            <span className={classNames('btnList',{'active': payNumber === 20})} onClick={()=>{this.changePayNumber(20)}}>20T<div className="triangle"><i className="anticon anticon-check"/></div></span>
            <span className={classNames('btnList',{'active': payNumber === 50})} onClick={()=>{this.changePayNumber(50)}}>50T<div className="triangle"><i className="anticon anticon-check"/></div></span>
            <span className={classNames('btnList',{'active': payNumber === 100})} onClick={()=>{this.changePayNumber(100)}}>100T<div className="triangle"><i className="anticon anticon-check"/></div></span>
            <InputNumber value={payNumber} onChange={(value)=>{this.setState({payNumber:value})}} size="large" min={10}/>
            <b>T</b>
          </dd>
        </dl>
      </div>
    )
  }
}




