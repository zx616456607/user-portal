/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016-11-03
 * @author zhouhaitao
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button,Icon,Table,Input,Pagination,Row,Col,Modal } from 'antd';
import { GetProjectsApprovalClusters } from '../../actions/project';
import { calcuDate } from '../../common/tools';
import moment from 'moment';
import './style/ClusterAuthorization.less';

class ClusterAuthorization extends Component{
  constructor(props){
    super(props)
    this.state={
      confirmPassModal:false,
      current:1,
      size:5,
      from:0,
      sort:'',
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
          render:( time ) => <div>{ moment(time).format('YYYY-MM-DD HH:mm:ss') }</div>
        },
        {
          title:'操作',
          dataIndex:'operation',
          render:( col,row,index ) => {
            return this.buttonGroup(row)
          }
        }
      ],
      filter:''
    };
    this.statusTag = this.statusTag.bind(this);
    this.tableChange = this.tableChange.bind(this);
    this.buttonGroup = this.buttonGroup.bind(this);
    this.handleApproveAndReject = this.handleApproveAndReject.bind(this);
    this.handleUndoAndClear = this.handleUndoAndClear.bind(this);
    this.handlePass = this.handlePass.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentWillMount(){
    let query = {
      size:this.state.size,
      from:this.state.from,
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

  //根据状态渲染哪一组操作按钮 status(状态)
  buttonGroup(row){
    const btns = ( leftType,rightType,leftText,rightText,eventName ) => {
      return <div className="authorization-operation">
          <Button type={leftType} style={{ marginRight:10 }} onClick={() => { this[eventName](row,'left') }}>{ leftText }</Button>
          <Button type={rightType} onClick={() => { this[eventName](row,'right') }}>{ rightText }</Button>
        </div>
    };
    switch (row.status){
      case 1:
        return btns('primary','danger','通过','拒绝','handleApproveAndReject');
      case 2:
        return btns('primary','danger','撤销','清除','handleUndoAndClear')
    }
  }
  //表格数据变化时候触发，触发分页，筛选状态，排序；pagination(分页)；status(状态)，sorter(排序)
  tableChange(pagination, status, sorter){

    //过滤状态
    let filter = '';
    if(status.status[0] == 5){
      filter = 'status__neq,1,status__neq,0'
    }else if(!status.status[0]){
      filter = ""
    }else {
      filter = 'status,' + status.status[0]
    }
    //过滤排序
    let timeOrder = sorter.columnKey === 'requestTime'?'tenx_project_resource_ref.request_time':'tenx_project_resource_ref.accept_time'
    this.setState({
      sort:sorter.order === "descend"? `d,${timeOrder}`:`a,${timeOrder}`,
      filter
    },()=>{
      let query = {
        filter:this.state.filter,
        size:this.state.size,
        from:this.state.from,
        sort:this.state.sort
      };
      this.props.GetProjectsApprovalClusters(query)
    });

  }

  //处理审核和拒绝，参数为id，按钮标志
  handleApproveAndReject(row,flag){

    if(flag === 'left'){
      this.setState({
        confirmPassModal:true
      })
    }

  }
  handleUndoAndClear(row,flag){

  }

  //确认通过审批
  handlePass(){
    this.setState({
      confirmPassModal:false
    })
  }
  handleCancel(){
    this.setState({
      confirmPassModal:false
    })
  }

  render(){
    const tableData = this.props.projectsApprovalClustersList.approvalData;//表格数据
    const isLoading = this.props.projectsApprovalClustersList.isFetching;
    return (
      <div id='clusterAuthorization'>
        <Row className="authorization-option" type="flex" justify="space-between">
          <Row>
            <Col span={6}>
              <Button type="primary" icon="reload">刷新</Button>
            </Col>
            <Col span={6}>
              <Button type="default" icon="minus-circle-o">清除审批记录</Button>
            </Col>
            <Col span={6} push={3}>
              <div className="search-box">
                <Input
                  placeholder="按申请人或申请项目搜索"
                  onSearch={value => console.log(value)}
                  style={{ width: 200 }}
                />
                <div className="search-btn">
                  <i className='fa fa-search' />
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <div className="authorization-pagination">
              <span className="total-page">共计7条</span>
              <Pagination
                simple
                total={20}
                pageSize={5}
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
            isLoading = { isLoading }
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
  GetProjectsApprovalClusters
})(ClusterAuthorization)