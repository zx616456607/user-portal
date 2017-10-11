/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateStepFirst
 *
 * v0.1 - 2017-07-12
 * @author zhangxuan
 */
import React, { Component } from 'react'
import classNames from 'classnames';
import './style/ProjectManage.less'
import { Input, Icon, Form, Popover } from 'antd'
import { connect } from 'react-redux'
import { CheckProjects } from '../../../actions/project'
import { loadClusterList } from '../../../actions/cluster'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { serviceNameCheck } from '../../../common/naming_validation'

let CreateStepFirst = React.createClass({
  getInitialState() {
    return {
      selectedClusters: [],
      choosableClusters: []
    }
  },
  componentWillMount() {
    this.getAllClusters()
  },
  componentWillReceiveProps(nextProps) {
    const { choosableClusters, selectedClusters } = this.state;
    const { step, form, scope } = nextProps;
    if (!step) {
      form.resetFields()
      this.setState({
        selectedClusters: [],
        choosableClusters: []
      })
    }
    if (!choosableClusters.length && !selectedClusters.length) {
      this.getAllClusters()
    }
  },
  getAllClusters() {
    const { loadClusterList } = this.props;
    loadClusterList({},{
      success: {
        func: res => {
          this.setState({
            choosableClusters: res.data,
            selectedClusters: []
          })
        },
        isAsync: true
      }
    })
  },
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
  },
  projectName(rule, value, callback) {
    const { CheckProjects } = this.props;
    let newValue = value && value.trim()
    const msg = serviceNameCheck(newValue, '项目名称')
    if (msg !== 'success') {
      return callback(msg)
    }
    clearTimeout(this.projectNameCheckTimeout)
    this.projectNameCheckTimeout = setTimeout(()=>{
      CheckProjects({
        projectsName: value
      },{
        success: {
          func: () => {
            this.updateProjectName(value)
            callback()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            callback(new Error('该名称已在项目或成员列表中存在'))
          },
          isAsync: true
        }
      })
    },ASYNC_VALIDATOR_TIMEOUT)
  },
  updateProjectName() {
    const { updateProjectName } = this.props;
    const { getFieldValue } = this.props.form;
    let projectName = getFieldValue('projectName')
    updateProjectName(projectName)
  },
  projectDesc(rule, value, callback) {
    callback()
  },
  updateProjectDesc() {
    const { updateProjectDesc } = this.props;
    const { getFieldValue } = this.props.form;
    let projectName = getFieldValue('projectDesc')
    updateProjectDesc(projectName)
  },
  render() {
    const { selectedClusters, choosableClusters } = this.state;
    const { getFieldProps, getFieldValue, isFieldValidating, getFieldError } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 1 },
      wrapperCol: { span: 6 },
    };
    const menuTop = (
      [
        selectedClusters && selectedClusters.length > 0 ? selectedClusters.map((item,index)=>{
          return(
            <dd className="topList" key={item.clusterID}>{item.clusterName}<Icon onClick={()=>this.addCluster(item,false)} type="cross-circle-o" className="pointer" /></dd>
          )
        }): <dd className="topList" style={{color: '#999'}} key={1}>已申请集群为空</dd>
      ]
    )
    const menuBottom = (
      [
        choosableClusters && choosableClusters.length > 0 ? choosableClusters.map((item,index)=>{
          return (
            <dd onClick={()=>this.addCluster(item,true)} className="bottomList pointer" key={item.clusterID}>{item.clusterName}</dd>
          )
        }): <dd className="bottomList" style={{color: '#999'}} key={2}>可申请集群为空</dd>
      ]
    )
    const content = (
      <div className={classNames("dropDownInnerBox")}>
        <dl className="dropDownTop">
          <dt className="topHeader">已申请集群（{selectedClusters&&selectedClusters.length}）</dt>
          {menuTop}
        </dl>
        <dl className="dropDownBottom">
          <dt className="bottomHeader">可申请集群（{choosableClusters&&choosableClusters.length}）</dt>
          {menuBottom}
        </dl>
      </div>
    )
    return (
      <div id="projectCreateStepOne">
        <div className="projectCreateFirstForm">
          <Form.Item label="名称"
                     {...formItemLayout}
                     hasFeedback
                     help={isFieldValidating('projectName') ? '校验中...' : (getFieldError('projectName') || []).join(', ')}
          >
            <Input  autoComplete="off" placeholder="请输入名称" {...getFieldProps(`projectName`, {
              rules: [
                { validator: this.projectName}
              ]
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
        </div>
        <div className="inputBox" id="clusterDrop" style={{position:'relative'}}>
          <span>授权集群 :</span>
          <Popover
            trigger="click"
            overlayClassName="createClusterPop"
            content={content}
            getTooltipContainer={() => document.getElementById('clusterDrop')}
          >
            <div className="dropDownBox">
              <span className="pointer">请选择授权集群<i className="fa fa-caret-down pointer" aria-hidden="true"/></span>
            </div>
          </Popover>
        </div>
      </div>
    )
  }
})

function mapStateToFristProp(state, props) {

  return {

  }
}

export default CreateStepFirst = connect(mapStateToFristProp, {
  CheckProjects,
  loadClusterList
})(CreateStepFirst)