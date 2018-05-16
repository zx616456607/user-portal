/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016-11-03
 * @author zhouhaitao
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button,Icon,Table,Input,Pagination,Row,Col,Modal,Select } from 'antd';
import {GetProjectsApprovalClusters, searchProjectsClusterApproval,UpdateProjectsApprovalCluster} from '../../actions/project';
import { calcuDate } from '../../common/tools';
import NotificationHandler from '../../components/Notification'
import moment from 'moment';
import './style/ClusterAuthorization.less';
import {browserHistory} from "react-router";

const notification = new NotificationHandler()
const InputGroup = Input.Group
const Option = Select.Option

class ClusterAuthorization extends Component{
  constructor(props){
    super(props)
    this.state={
      confirmPassModal:false,//控制点击通过时候对话框的显示隐藏
      current:1,//当前页
      size:5,//每页多少条
      sort:'',//排序参数
      columns:[
        {
          title:'状态',
          dataIndex:'status',
          filters:[
            {
              text:'未申请',
              value:0
            },
            {
              text:'待审批',
              value:1
            },
            {
              text:'已通过',
              value:2
            },
            {
              text:'已拒绝',
              value:3
            },
          ],
          filterMultiple:false,
          render:(status) => this.statusTag(status)
        },
        {
          title:'申请人',
          dataIndex:'applicant'
        },
        {
          title:'申请项目',
          dataIndex:'projectName'
        },
        {
          title:'申请集群',
          dataIndex:'clusterName'
        },
        {
          title:'申请时间',
          dataIndex:'requestTime',
          render:( time ) => <div>{calcuDate(time)}</div>,
          sorter:true
        },
        {
          title:'审批人',
          dataIndex:'approver'
        },
        {
          title:'审批时间',
          dataIndex:'acceptTime',
          sorter:true,
          render:( time,row ) => {
            if(row.status !== (0 || 1)){
              return <div>{ moment(time).format('YYYY-MM-DD HH:mm:ss') }</div>
            }
            return null

          }
        },
        {
          title:'操作',
          dataIndex:'operation',
          render:( col,row,index ) => {
            return this.buttonGroup(row)
          }
        }
      ],//表头
      filter:'',//表格筛选
      searchContent:'',//搜索内容
      passContent:'',
      searchField:'tenx_users.user_name,'
    };
    this.statusTag = this.statusTag.bind(this);
    this.tableChange = this.tableChange.bind(this);
    this.handleOption = this.handleOption.bind(this);
    this.handlePass = this.handlePass.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.changePage = this.changePage.bind(this);
    this.reload = this.reload.bind(this);
    this.searchItem = this.searchItem.bind(this);
    this.handleSearchApplicantOrProject = this.handleSearchApplicantOrProject.bind(this);
  }

  componentDidMount(){
    let query = {
      size:this.state.size,
      from:(this.state.current-1) * this.state.size,
    }
    this.props.GetProjectsApprovalClusters(query)
  }
  //0为未申请，1为未审核，2为已通过，3为已拒绝
  //将状态标识转换为文字 status(状态)
  statusTag(status){
    let statusDom = (className,statusType)=><span className={`status-tag ${className}`}>{ statusType }</span>
    switch (status){
      case 0:
        return statusDom('not-yet','未申请');
      case 1:
        return statusDom('pending','待审批');
      case 2:
        return statusDom('authorized','已通过');
      case 3:
        return statusDom('rejected','已拒绝');
    }
  }

  //分页处理 page(当前页)
  changePage(page){
    this.setState({
      current:page
    },()=>{
      let query = {
        filter:this.state.filter,
        size:this.state.size,
        from:(this.state.current-1) * this.state.size,
        sort:this.state.sort
      };
      this.props.GetProjectsApprovalClusters(query)
    });

  }

  //刷新
  reload(current){

    this.setState({
      current:current?current:1,
      size:5,
      sort:'',
      filter:''
    });
    let query = {
      size:this.state.size,
      from:current?(current-1) * this.state.size : 0,
    };
    this.props.GetProjectsApprovalClusters(query)

  }
  //根据状态渲染哪一组操作按钮 status(状态)
  buttonGroup(row){
    const btns = ( leftType,rightType,leftText,rightText,eventName ) => {
      return <div className="authorization-operation">
        <Button type={leftType} style={{ marginRight:10 }} onClick={(e) => { this.handleOption(row,e) }}>{ leftText }</Button>
        <Button type={rightType} onClick={(e) => { this.handleOption(row,e) }}>{ rightText }</Button>
      </div>
    };
    switch (row.status){
      case 1:
        return btns('primary','danger','通过','拒绝');
      case 2:
        return btns('primary','danger','撤销','清除');
      case 3:
        return btns('primary','danger','撤销','清除')
    }
  }
  //表格数据变化时候触发，触发分页，筛选状态，排序；pagination(分页)；status(状态)，sorter(排序)
  tableChange(pagination, status, sorter){
    console.log(status.status, sorter);
    //过滤状态
    let filter = '';
    let timeOrder = sorter.columnKey === 'requestTime'?'tenx_project_resource_ref.request_time':'tenx_project_resource_ref.accept_time';
    if(status.status.length !== 0){
      filter = 'status,' + status.status[0]
    }

    //过滤排序
    if(sorter.order !== undefined){
      this.setState({
        sort:sorter.order === "descend" ? `d,${timeOrder}`:`a,${timeOrder}`,
        filter
      },()=>{
        let query = {
          filter:this.state.filter,
          size:this.state.size,
          from:(this.state.current-1) * this.state.size,
          sort:this.state.sort
        };

        this.props.GetProjectsApprovalClusters(query)
      });
    }else{
      let query = {
        filter,
        size:this.state.size,
        from:(this.state.current-1) * this.state.size,
        sort:''
      };
      console.log(999);
      this.props.GetProjectsApprovalClusters(query)

    }


  }

  //处理操作，row(点击所在的行数据) e(事件对象)
  handleOption(row,e){
    let text = e.target.innerText;
    let wannaStatus = 0;
    switch (text){
      case '通 过':
        wannaStatus = 2;
        break;
      case '拒 绝':
        wannaStatus = 3;
        break;
      case '清 除':
        wannaStatus = 0;
        break;
      case '撤 销':
        wannaStatus = 1
        break;
    }
    let updateClusterData = {
      clusterInfo : [
        {
          project:row.projectId,
          clusters:{
            [row.resourceID]:wannaStatus
          }
        }
      ]
    };
    this.props.UpdateProjectsApprovalCluster(updateClusterData,{
      success: {
        func: () => {
          notification.success(text+'成功')
          if(text === '通 过'){
            this.setState({
              confirmPassModal:true,
              passContent:Object.assign({},row)
            })
          }else{
            this.reload(this.state.current)
          }

        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.warn(text+'失败')
        },
        isAsync: true
      }
    })

  }

  //切换搜索字段
  handleSearchApplicantOrProject(value){
    this.setState({
      searchField:value,
      searchContent:''
    })
  }
  searchItem(){
    let query = {
      size:this.state.size,
      from:0,
      filter:`${this.state.searchField}${this.state.searchContent}`
    };
    this.props.GetProjectsApprovalClusters(query)
    //this.props.searchProjectsClusterApproval(value)
  }
  //确认通过审批
  handlePass(){
    this.setState({
      confirmPassModal:false
    },()=>{
      browserHistory.push(`/tenant_manage/project_manage/project_detail?name=${this.state.passContent.projectName}&&tabs=quota`)
    })
  }
  handleCancel(){
    this.setState({
      confirmPassModal:false
    })
  }

  render(){
    let tableData = [];
    let total;

    if(this.props.projectsApprovalClustersList.approvalData){
      tableData = this.props.projectsApprovalClustersList.approvalData.projects;
      total  = this.props.projectsApprovalClustersList.approvalData.listMeta.total;
    }
    const isLoading = this.props.projectsApprovalClustersList.isFetching;
    const selectBefore = (
      <Select defaultValue="tenx_users.user_name," style={{ width: 90 }} onChange={this.handleSearchApplicantOrProject}>
        <Option value="tenx_users.user_name,">申请人</Option>
        <Option value="tenx_project.name,">申请项目</Option>
      </Select>
    );
    return (
      <div id='clusterAuthorization'>
        <Row className="authorization-option" type="flex" justify="space-between">
          <Row>
            <Col span={6}>
              <Button type="primary" icon="reload" onClick={() => this.reload()}>刷新</Button>
            </Col>
{/*            <Col span={6}>
              <Button type="default" icon="minus-circle-o">清除审批记录</Button>
            </Col>*/}
            <Col span={6} push={3}>
              <div className="search-box">
                <Input
                  size='large'
                  addonBefore={selectBefore}
                  onChange={(e)=>{
                    this.setState({
                      searchContent:e.target.value
                    })
                  }}
                  value={this.state.searchContent}
                  placeholder='申请人或申请项目名称'
                  style={{paddingRight: '28px',width:170}}
                  onPressEnter={ () => this.searchItem() } />
                <div className="search-btn" onClick={this.searchItem}>
                  <i className='fa fa-search' />
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <div className="authorization-pagination">
              <span className="total-page">共计{total}条</span>
              <Pagination
                simple
                total={total}
                current={this.state.current}
                pageSize={this.state.size}
                onChange={(page)=>{this.changePage(page)}}
              />
            </div>
          </Row>
        </Row>
        <div className="authorization-table">

          <Table
            columns={ this.state.columns }
            dataSource={ tableData }
            pagination = { false }
            loading = { isLoading }
            onChange = { this.tableChange }
          />
        </div>
        <Modal
          title="通过审批"
          visible={this.state.confirmPassModal}
          onOk={this.handlePass}
          onCancel={this.handleCancel}
          okText='设置资源配额'
        >
          <div className="confirm-pass-box">
            <div className="broadcast">
              <div className="confirm-icon">
                <Icon type="check-circle-o"/>
              </div>
              <div className="confirm-text">
                <div>通过审批操作成功</div>
                <div>可前往项目详情设置项目在该集群的资源配额</div>
              </div>
              <table>
                <thead>
                <tr>
                  <td>申请项目</td>
                  <td>申请集群</td>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>{this.state.passContent.projectName}</td>
                  <td>{this.state.passContent.clusterName}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}
function mapStateToProps(state,props) {
  const { projectAuthority } = state;
  const { projectsApprovalClustersList } = projectAuthority
  return {
    projectsApprovalClustersList
  }
}

export default connect(mapStateToProps,{
  GetProjectsApprovalClusters,
  searchProjectsClusterApproval,
  UpdateProjectsApprovalCluster
})(ClusterAuthorization)