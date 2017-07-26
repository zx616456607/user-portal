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
import { Input, Icon, Form } from 'antd'
import { connect } from 'react-redux'
import { CheckProjects } from '../../../actions/project'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { validateK8sResourceForServiceName } from '../../../common/naming_validation'

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
    const { clusters } = this.props;
    if (selectedClusters.length === 0) {
      this.setState({
        choosableClusters:clusters
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    const { selectedClusters } = this.state;
    const { clusters, step, form, scope } = nextProps;
    if (scope.state.closeCreateProject) {
      this.setState({
        dropVisible:false,
        choosableClusters:clusters,
        selectedClusters:[]
      })
    }
    if (step !== 'first') {
      this.setState({
        dropVisible:false
      })
    }
    if (!step) {
      form.resetFields()
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
    const { CheckProjects } = this.props;
    let newValue = value.trim()
    if (!Boolean(newValue)) {
      callback(new Error('请输入名称'))
      return
    }
    if (!validateK8sResourceForServiceName(newValue)) {
      return callback('服务名称可由3~24位小写字母、数字、中划线组成，以小写字母开头，小写字母或者数字结尾')
    }
    clearTimeout(this.projectNameCheckTimeout)
    this.projectNameCheckTimeout = setTimeout(()=>{
      CheckProjects({
        projectsName: value
      },{
        success: {
          func: (res) => {
            this.updateProjectName(value)
            callback()
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            return callback(new Error('该项目名称已经存在'))
          }
        }
      })
    },ASYNC_VALIDATOR_TIMEOUT)
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
    return (
      <div id="projectCreateStepOne">
        <Form className="projectCreateFirstForm" form={this.props.form}>
          <Form.Item label="名称"
                     {...formItemLayout}
                     hasFeedback
                     help={isFieldValidating('projectName') ? '校验中...' : (getFieldError('projectName') || []).join(', ')}
          >
            <Input  autoComplete="off" placeholder="请输入名称" {...getFieldProps(`projectName`, {
              rules: [
                { validator: this.projectName.bind(this)}
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

export default CreateStepFirst = connect(mapStateToFristProp, {
  CheckProjects
})(CreateStepFirst)