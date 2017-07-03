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
import { ListRole, CreateRole, GetRole } from '../../../actions/role'
import { PermissionAndCount } from '../../../actions/permission'
import { chargeProject } from '../../../actions/charge'
import Notification from '../../../components/Notification'
import CommonSearchInput from '../../../components/CommonSearchInput'
const InputGroup = Input.Group;
import cloneDeep from 'lodash/cloneDeep'
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
      projectName: '',
      description: '',
      authorizedCluster: [],
      RoleKeys: []
    }
  }
  componentWillMount() {
    this.refresh('tableLoading')
  }
  updateProjectName(name) {
    this.setState({
      projectName:name
    })
  }
  componentWillReceiveProps(nextProps) {
    const step = nextProps.location.query.step || '';
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
    }
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
    let s = '';
    if (current === 0) {
      s = 'first';
    }else if(current === 1) {
      s = 'second';
    }else{
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
  handClickRow(record,index) {
    const { selected } = this.state;
    let newSelected = selected.slice(0);
    let result = newSelected.findIndex((value,ind)=> value === index)
    if (result > -1) {
      newSelected.splice(result,1)
    }else {
      newSelected.push(index)
    }
    this.setState({
      selected:newSelected
    })
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
      render: (text) => <Link to="/tenant_manage/project_manage/project_detail">{text}</Link>,
    }, {
      title: '项目角色',
      dataIndex: 'role',
      key: 'role',
      filters: [{
        text: '创建者',
        value: '创建者',
      }, {
        text: '项目管理员',
        value: '项目管理员',
      }, {
        text: '项目访客',
        value: '项目访客',
      }],
      onFilter: (value, record) => record.role.indexOf(value) === 0,
      render: (data) =>
        <div>
          <div>{data}</div>
        </div>
    }, {
      title: '备注',
      dataIndex: 'description',
      key: 'description',
    }, {
      title: '授权集群',
      dataIndex: 'clusterCount',
      key: 'clusterCount',
      sorter: (a, b) => a.clusterCount - b.clusterCount,
    }, {
      title: '成员',
      dataIndex: 'userCount',
      key: 'userCount',
      sorter: (a, b) => a.userCount - b.userCount,
    }, {
      title: '创建时间',
      dataIndex: 'creationTime',
      key: 'creationTime',
      filters: [{
        text: '2017',
        value: '2017',
      }, {
        text: '2016',
        value: '2016',
      }],
      onFilter: (value, record) => record.creationTime.indexOf(value) === 0,
      render: (data) =>
        <div>
          <div>{data}</div>
        </div>

    }, {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      sorter: (a, b) => a.balance - b.balance,
      render: (text)=><span className="balanceColor">{text ? text : 0}T</span>
    }, {
      title: '操作',
      key: 'operation',
      render: (text, record) => (
        <span>
          <Button type='primary' size='large' onClick={(e)=> this.paySingle(e,record)}>充值</Button>
          <Button type='ghost' size='large' style={{marginLeft:'10px'}} onClick={(e)=>this.delSingle(e,record)}>删除</Button>
        </span>
      ),
    }];
    const rowSelection = {
      selectedRowKeys: selected,
      onChange:(selectedRowKeys)=> this.onSelectChange(selectedRowKeys),
    };
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
            <dt>余额</dt><dd>{paySinglePro[0]&&paySinglePro[0].balance}T</dd>
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
        <Row className={classNames({'hidden': step !== ''})}>
          <Button type='primary' size='large'  className='addBtn' onClick={()=> browserHistory.replace('/tenant_manage/project_manage?step=first')}>
            <i className='fa fa-plus' /> 创建项目
          </Button>
          <Button type="ghost" icon="pay-circle-o" size="large" className="manageBtn" onClick={()=> this.pay()}>充值</Button>
          <Button type="ghost" icon={ this.state.loading ? 'loading' : "reload"}  size="large" className="manageBtn" onClick={()=> this.refresh('loading')}>刷新</Button>
          <Button type="ghost" icon="delete" size="large" className="manageBtn" onClick={()=> this.delProject()}>删除</Button>
          <CommonSearchInput placeholder="请输入项目名称进行搜索" size="large" onSearch={this.searchProject.bind(this)}/>
          <div className="total">共{projectList.length}个</div>
        </Row>
        <Row className={classNames("projectList",{'hidden': step !== ''})}>
          <Card>
            <Table
              loading={tableLoading}
              rowSelection={rowSelection}
              pagination={pagination}
              columns={columns}
              dataSource={projectList}
              onRowClick={(recode,index)=>this.handClickRow(recode,index)}
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
              <CreateStepFirst clusters = { clusters } step = {step} updateProjectName={this.updateProjectName.bind(this)} updateProjectDesc={this.updateProjectDesc.bind(this)} updateCluster={this.updateCluster.bind(this)}/>
          </div>
          <div className={classNames({'hidden' : step !=='second'})}>
            <CreateStepSecond scope={this} updateRole={this.updateRole.bind(this)}/>
          </div>
          <div className={classNames({'hidden' : step !=='third'})}>
            <CreateStepThird scope={this} updateRole={this.updateRole.bind(this)}/>
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
    const { updatePayNumber } = this.props;
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
          <span className="balanceColor">{text ? text : 0}T</span>
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
class CreateStepFirst extends Component{
  constructor(props) {
    super(props)
    this.state={
      dropVisible:false,
      selectedClusters: [],
      choosableClusters: []
    }
  }
  componentWillMount() {
    const { selectedClusters } = this.state;
    const { clusters, step } = this.props;
    if (step !== 'first') {
      this.setState({
        dropVisible:false
      })
    }
    if (selectedClusters.length === 0) {
      this.setState({
        choosableClusters:clusters
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    const { selectedClusters } = this.state;
    const { clusters, step } = nextProps;
    if (step !== 'first') {
      this.setState({
        dropVisible:false
      })
    }
    if (selectedClusters.length === 0) {
      this.setState({
        choosableClusters:clusters
      })
    }
  }
  addCluster(item,flag) {
    const { choosableClusters, selectedClusters } = this.state;
    const { updateCluster } = this.props;
    let newChoose = new Set(choosableClusters.slice(0))
    let newSelected = new Set(selectedClusters.slice(0))
    let clusterArr = []
    if (flag) {
      newSelected.add(item)
      newChoose.delete(item)
    }else {
      newSelected.delete(item)
      newChoose.add(item)
    }
    this.setState({
      choosableClusters: Array.from(newChoose),
      selectedClusters: Array.from(newSelected)
    },()=>{
      this.state.selectedClusters.forEach((value,index,arr)=>{
        clusterArr.push(value.clusterID)
      })
      updateCluster(clusterArr)
    })
  }
  toggleDrop() {
    this.setState({
      dropVisible:!this.state.dropVisible
    })
  }
  projectName(rule, value, callback) {
    let newValue = value.trim()
    if (!Boolean(newValue)) {
      callback(new Error('请输入名称'))
      return
    }
    if (newValue.length < 3 || newValue.length > 21) {
      callback(new Error('请输入3~21个字符'))
      return
    }
    callback()
  }
  updateProjectName() {
    const { updateProjectName } = this.props;
    const { getFieldValue } = this.props.form;
    let projectName = getFieldValue('projectName')
    updateProjectName(projectName)
  }
  projectDesc(rule, value, callback) {
    callback()
  }
  updateProjectDesc() {
    const { updateProjectDesc } = this.props;
    const { getFieldValue } = this.props.form;
    let projectName = getFieldValue('projectDesc')
    updateProjectDesc(projectName)
  }
  render() {
    const { dropVisible, selectedClusters, choosableClusters } = this.state;
    const { getFieldProps, getFieldValue } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 1 },
      wrapperCol: { span: 6 },
    };
    const menuTop = (
      [
        selectedClusters&&selectedClusters.map((item,index)=>{
          return(
            <dd className="topList" key={item.clusterID}>{item.clusterName}<Icon onClick={()=>this.addCluster(item,false)} type="cross-circle-o" className="pointer" /></dd>
          )
        })
      ]
    )
    const menuBottom = (
      [
        choosableClusters&&choosableClusters.map((item,index)=>{
          return (
            <dd onClick={()=>this.addCluster(item,true)} className="bottomList pointer" key={item.clusterID}>{item.clusterName}</dd>
          )
        })
      ]
    )
    return (
      <div id="projectCreateStepOne">
        <Form className="alarmAction" form={this.props.form}>
          <Form.Item label="名称" {...formItemLayout}>
            <Input placeholder="请输入名称" {...getFieldProps(`projectName`, {
              rules: [
                { validator: (rules,value)=>this.projectName(rules,value,this.updateProjectName.bind(this))}
              ],
              initialValue:  ''
            }) }
            />
          </Form.Item>
          <Form.Item label="描述" {...formItemLayout}>
            <Input type="textarea" {...getFieldProps(`projectDesc`, {
              rules: [
                { validator: (rules,value)=>this.projectDesc(rules,value,this.updateProjectDesc.bind(this))}
              ],
              initialValue: '',
            }) }/>
          </Form.Item>
        </Form>
        <div className="inputBox" id="clusterDrop" style={{position:'relative'}}>
          <span>授权集群 :</span>
          <div className="dropDownBox">
            <span className="pointer" onClick={()=>{this.toggleDrop()}}>请选择授权集群<i className="fa fa-caret-down pointer" aria-hidden="true"/></span>
            <div className={classNames("dropDownInnerBox",{'hide':!dropVisible})}>
              <dl className="dropDownTop">
                <dt className="topHeader">已申请集群（{selectedClusters&&selectedClusters.length}）</dt>
                {menuTop}
              </dl>
              <dl className="dropDownBottom">
                <dt className="bottomHeader">可申请集群（{choosableClusters&&choosableClusters.length}）</dt>
                {menuBottom}
              </dl>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
CreateStepFirst = Form.create()(CreateStepFirst)

function mapStateToFristProp(state, props) {
  
  return {
  
  }
}

CreateStepFirst = connect(mapStateToFristProp, {

})(CreateStepFirst)

class CreateStepSecond extends Component{
  constructor(props){
    super(props)
    this.state={
      targetKeys: [],
      characterModal: false,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      selectedList: [],
      choosableList: [],
      allPermission: []
    }
  }
  componentWillMount() {
    this.loadRoleList()
     this.getPermission()
  }
  componentWillReceiveProps(nextProps) {
    const { allPermission } = this.state;
    this.loadRoleList()
    if (!allPermission) {
      this.getPermission()
    }
  }
  generateDatas = (_tns ) => {
    const tns = _tns;
    const children = [];
    for (let i = 0; i < tns.length; i++) {
      const key = `${tns[i].id}`;
      tns[i] = Object.assign(tns[i],{title: tns[i].desc,key: tns[i].id})
        children.push(key);
    }
    children.forEach((key, index) => {
      if (tns[index].children.length !== 0) {
        return this.generateDatas(tns[index].children);
      }
    });
  };
  loadRoleList() {
    const { ListRole, scope } = this.props;
    const targetKeys = [];
    const roleList = [];
    ListRole({
      success: {
        func: (res)=> {
          if (res.data.statusCode === 200) {
            let result = res.data.data.items;
            for (let i = 0 ; i < result.length; i++) {
              const data = {
                key: `${result[i].id},${result[i].comment}`,
                title: result[i].comment,
                description: result[i].comment,
                chosen: false,
              };
              const newData = Object.assign(result[i],data);
              if (newData.chosen) {
                targetKeys.push(data.key);
              }
              roleList.push(newData)
            }
            if (scope.state.RoleKeys.length > 0) {
              this.setState({
                targetKeys: scope.state.RoleKeys.slice(0)
              })
            } else {
              this.setState({
                choosableList:roleList,
                targetKeys
              })
            }
          }
        },
        isAsync: true
      }
    })
  }
  onExpand(expandedKeys) {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck(checkedKeys) {
    this.setState({
      checkedKeys
    });
  }
  onSelect(selectedKeys, info) {
    this.setState({ selectedKeys });
  }
  filterOption(inputValue, option) {
    return option.description.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys,d,m) {
    const { updateRole } = this.props;
    this.setState({ targetKeys });
    updateRole(targetKeys)
  }
  cancelModal() {
    this.setState({characterModal:false})
  }
  okCreateModal() {
    const { CreateRole } = this.props;
    const { checkedKeys } = this.state;
    const { getFieldValue } = this.props.form;
    let notify = new Notification()
    let roleDesc = getFieldValue('roleDesc')
    let roleName = getFieldValue('roleName')
    CreateRole({
      name: roleName,
      comment: roleDesc,
      permission: checkedKeys
    },{
      success:{
        func: (res) => {
          if (res.data.statusCode === 200) {
            notify.success('创建角色成功')
            this.loadRoleList()
            this.setState({characterModal:false})
          }
        },
        isAsync: true
      }
    })
  }
  openCreateModal() {
    this.setState({
      characterModal:true
    })
  }
  getPermission() {
    const { PermissionAndCount } = this.props;
    PermissionAndCount({},{
      success:{
        func: (res)=>{
          if (res.data.statusCode === 200) {
            let result = res.data.data.permission;
            this.setState({
              allPermission:result
            },()=>{
              this.generateDatas(this.state.allPermission)
            })
          }
        },
        isAsync: true
      }
    })
  }
  roleName(rule, value, callback) {
    let newValue = value.trim()
    if (!Boolean(newValue)) {
      callback(new Error('请输入名称'))
      return
    }
    if (newValue.length < 3 || newValue.length > 21) {
      callback(new Error('请输入3~21个字符'))
      return
    }
    callback()
  }
  roleDesc(rule, value, callback) {
    let newValue = value.trim()
    if (!Boolean(newValue)) {
      callback(new Error('请输入描述'))
      return
    }
    if (newValue.length < 3 || newValue.length > 21) {
      callback(new Error('请输入3~21个字符'))
      return
    }
    callback()
  }
  renderItem(item) {
    return(
      <Row>
        <Col span={20}>{item&&item.comment}</Col>
        <Col span={4}>{item&&item.count}</Col>
      </Row>
    )
  }
  render() {
    const TreeNode = Tree.TreeNode;
    const { scope } = this.props;
    const { choosableList, targetKeys, allPermission } = this.state;
    const { getFieldProps, getFieldValue } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15 },
    };
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.title}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.title} />;
    });
    return (
      <div id="projectCreateStepSecond" className="projectCreateStepSecond">
        <Modal title="创建角色" wrapClassName="createCharacterModal" visible={this.state.characterModal} width={570}
          onCancel={()=> this.cancelModal()}
          onOk={()=> this.okCreateModal()}
        >
          <Form className="createRoleForm" form={this.props.form}>
            <Form.Item label="名称" {...formItemLayout}>
              <Input placeholder="请输入名称" {...getFieldProps(`roleName`, {
                rules: [
                  { validator: (rules,value,callback)=>this.roleName(rules,value,callback)}
                ],
                initialValue:  ''
              }) }
              />
            </Form.Item>
            <Form.Item label="描述" {...formItemLayout}>
              <Input type="textarea" {...getFieldProps(`roleDesc`, {
                rules: [
                  { validator: (rules,value,callback)=>this.roleDesc(rules,value,callback)}
                ],
                initialValue: '',
              }) }/>
            </Form.Item>
          </Form>
          <div className="authChoose">
            <span>权限选择 :</span>
            <div className="authBox inlineBlock">
              <div className="authTitle clearfix">可选权限 <div className="pull-right"><span style={{color:'#59c3f5'}}>14</span> 个权限</div></div>
              <div className="treeBox">
                {
                  allPermission.length > 0 &&
                  <Tree
                    checkable
                    onExpand={this.onExpand.bind(this)} expandedKeys={this.state.expandedKeys}
                    autoExpandParent={this.state.autoExpandParent}
                    onCheck={this.onCheck.bind(this)} checkedKeys={this.state.checkedKeys}
                    onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
                  >
                    {loop(allPermission)}
                  </Tree>
                }
              </div>
            </div>
          </div>
        </Modal>
        <div className="inputBox">
          <span>项目名称</span>
          <input type="text" className="projectName" disabled={true} value={scope.state.projectName}/>
        </div>
        <div className="inputBox">
          <span>角色</span>
          <Button type="primary" size="large" onClick={()=>this.openCreateModal()}>创建新角色</Button>
        </div>
        <Transfer
          dataSource={choosableList}
          className="roleTrans"
          showSearch
          listStyle={{
            width: 300,
            height: 255,
          }}
          searchPlaceholde="请输入策略名搜索"
          titles={['包含权限（个）', '包含权限（个）']}
          operations={[ '添加','移除']}
          filterOption={this.filterOption.bind(this)}
          targetKeys={targetKeys}
          onChange={this.handleChange.bind(this)}
          render={(item)=>this.renderItem(item)}
        />
      </div>
    )
  }
}

CreateStepSecond = Form.create()(CreateStepSecond)
function mapStateToSecondProp(state, props) {
  
  return {
  
  }
}

CreateStepSecond = connect(mapStateToSecondProp, {
  ListRole,
  CreateRole,
  PermissionAndCount
})(CreateStepSecond)
let checkedKeysThird = []
const expandedKeysThird = []
class CreateStepThird extends Component{
  constructor(props){
    super(props)
    this.state={
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      connectModal: false,
      mockData: [],
      targetKeys: [],
      currentRoleInfo: {},
      currentRolePermission: []
    }
  }
  componentDidMount() {
    this.getMock();
  }
  componentWillReceiveProps(nextProps) {
    const { scope } = nextProps;
    let RoleKeys = scope.state.RoleKeys;
    if ((RoleKeys.length > 0)) {
        this.getCurrentRole(RoleKeys[0].split(',')[0])
    } else {
      this.setState({
        currentRolePermission: [],
        currentRoleInfo: {}
      })
    }
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
  onExpand(expandedKeys) {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheckThird(checkedKeys){
    this.setState({
      checkedKeys,
      // selectedKeys: ['0-3', '0-4'],
    });
  }
  onSelect(selectedKeys, info) {
    this.setState({ selectedKeys });
  }
  closeModal() {
    this.setState({connectModal: false})
  }
  submitModal() {
    this.setState({connectModal: false})
  }
  filterOption(inputValue, option) {
    return option.description.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys) {
    this.setState({ targetKeys });
  }
  generateDatas (_tns){
    const tns = _tns;
    const children = [];
    for (let i = 0; i < tns.length; i++) {
      const key = `${tns[i].id}`;
      tns[i] = Object.assign(tns[i],{title: tns[i].desc,key: `${key}`})
      children.push(key);
      checkedKeysThird.push(key)
    }
    children.forEach((key, index) => {
      if (tns[index].children&&(tns[index].children.length !== null)) {
        return this.generateDatas(tns[index].children);
      }
    });
  };
  getCurrentRole(id) {
    const { GetRole } = this.props;
    checkedKeysThird.length=0
    this.setState({
      checkedKeys:[],
      expandedKeys: [],
      currentRoleInfo: {},
      currentRolePermission: []
    },()=>{
      GetRole({
        id
      },{
        success: {
          func: (res) =>{
            if (res.data.statusCode === 200) {
              let result = res.data.data;
              this.generateDatas(result.permission.permission)
              this.setState({
                currentRoleInfo: result,
                currentRolePermission: result.permission.permission,
                expandedKeys: checkedKeysThird,
                checkedKeys: checkedKeysThird
              })
            }
          },
          isAsync: true
        }
      })
    })
  }
  deleteRole(e,item) {
    checkedKeysThird.length = 0
    e.stopPropagation()
    const { scope, updateRole} = this.props;
    let roleList = scope.state.RoleKeys.slice(0);
    let roleSet = new Set(roleList);
    roleSet.delete(item);
    updateRole(Array.from(roleSet))
  }
  render() {
    const { scope } = this.props;
    const TreeNode = Tree.TreeNode;
    const { currentRolePermission, currentRoleInfo } = this.state;
    const roleList = scope.state.RoleKeys.length > 0 ? scope.state.RoleKeys.map((item,index)=>{
        return (
          <li onClick={()=>this.getCurrentRole.call(this,item.split(',')[0])} key={item.split(',')[1]}>{item.split(',')[1]}<Icon type="delete" onClick={(e)=>this.deleteRole(e,item)} className="pointer"/></li>
        )
      }) : <li className="pointer" onClick={()=>browserHistory.replace('/tenant_manage/project_manage?step=second')}>请选择角色</li>
    
    const loop = data => data.length >0 && data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.title} disableCheckbox={true}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.title} disableCheckbox={true}/>;
    });
    return (
      <div id="projectCreateStepThird">
        <div className="inputBox">
          <span>项目名称</span>
          <input type="text" className="projectName" disabled={true} value={'xx项目'}/>
        </div>
        <div className="clearfix characterWrapper">
          <span className="pull-left">已添加角色</span>
          <div className="pull-left characterBox">
            <ul className="characterListBox pull-left">
              {roleList}
            </ul>
            <div className="inlineBlock pull-left rightBox">
              <div className="authBox inlineBlock">
                <p className="authTitle">{currentRoleInfo.role && currentRoleInfo.role.comment || '--' }共 <span style={{color:'#59c3f5'}}>{currentRolePermission.length > 0 && currentRolePermission.length || '--'}</span> 个权限</p>
                <div className="treeBox">
                  {
                    currentRolePermission.length > 0 && (
                      <Tree
                        checkable
                        onExpand={this.onExpand.bind(this)} expandedKeys={this.state.expandedKeys}
                        autoExpandParent={this.state.autoExpandParent}
                        onCheck={this.onCheckThird.bind(this)} checkedKeys={this.state.checkedKeys}
                        onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
                      >
                        {loop(currentRolePermission)}
                      </Tree>
                    )
                  }
                </div>
              </div>
              <div className="connectMemberBox inlineBlock">
                <Button type="primary" size="large" onClick={()=> this.setState({connectModal:true})}>关联对象</Button>
              </div>
            </div>
          </div>
        </div>
        <Modal title="关联对象" width={765} visible={this.state.connectModal}
          onCancel={()=> this.closeModal()}
          onOk={()=> this.submitModal()}
        >
          <Transfer
            dataSource={this.state.mockData}
            showSearch
            listStyle={{
              width: 300,
              height: 290,
            }}
            searchPlaceholde="请输入搜索内容"
            titles={['可选对象（个）', '已选对象（个）']}
            operations={['移除', '添加']}
            filterOption={this.filterOption.bind(this)}
            targetKeys={this.state.targetKeys}
            onChange={this.handleChange.bind(this)}
            render={item => item.title}
          />
        </Modal>
      </div>
    )
  }
}

function mapStateToThirdProp(state, props) {
  
  return {
  
  }
}

CreateStepThird = connect(mapStateToThirdProp, {
  GetRole
})(CreateStepThird)
