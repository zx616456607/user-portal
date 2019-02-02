/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2018-04-17
 * @author rensiwei
 */
import React from 'react'
import { Modal, Button, Input, Row, Popover, Col, Form, Spin, Icon } from 'antd'
import classNames from 'classnames'
import './style/ProjectManage.less'
import { CheckProjects, CheckDisplayName } from '../../../actions/project'
import { loadClusterList } from '../../../actions/cluster'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { serviceNameCheck } from '../../../common/naming_validation'
import { ListRole } from '../../../actions/role'
import { connect } from 'react-redux';
import _ from 'lodash';
import NotificationHandler from '../../../components/Notification';
import { PROJECT_VISISTOR_ROLE_ID, PROJECT_MANAGE_ROLE_ID } from '../../../../constants'

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
let targetKeys = [],roleMap;//默认角色, role Map
const notify = new NotificationHandler();
const FormItem = Form.Item;

class CreateModal extends React.Component {
  state = {
    isPasswordReadOnly: true, //防止密码填充表单
    submitLoading: false,
    selectedClusters: [],
    choosableClusters: [],
    authorizedCluster: []
  }
  componentDidMount() {
    setTimeout(() => document.getElementById('displayName').focus(), 100)
  }
  getAllClusters = () => {
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
  }
  addCluster = (item,flag) => {
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
      //updateCluster(clusterArr)
/*  */      //console.log(clusterArr);
      this.setState({
        authorizedCluster: clusterArr,
      })
    })
  }
  loadRoleList() {
    const { ListRole } = this.props;
    targetKeys = [];
    ListRole({
      size: -1
    },{
      success: {
        func: (res)=> {
          if (res.data.statusCode === 200) {
            let result = res.data.data.items;
            for (let i = 0 ; i < result.length; i++) {
              const data = {
                key: `${result[i].id},${result[i].name}`,
                title: result[i].name,
                description: result[i].comment,
                chosen: [PROJECT_VISISTOR_ROLE_ID, PROJECT_MANAGE_ROLE_ID].includes(result[i].id),
                // chosen: ['RID-LFJKCKtKzCrd', 'RID-ggNW6A2mwgEX'].includes(result[i].id),
              };
              const newData = Object.assign({},result[i],data);
              if (newData.chosen) {
                targetKeys.push(data.key);
              }
            }
          }
        },
        isAsync: true
      }
    })
  }
  projectName = (rule, value, callback) => {
    const { CheckProjects } = this.props;
    let newValue = value && value.trim()
    if (!newValue) callback('命名空间不能为空')
    const msg = serviceNameCheck(newValue, 'namesapce')
    if (msg !== 'success') {
      return callback(msg)
    }
    clearTimeout(this.projectNameCheckTimeout)
    this.projectNameCheckTimeout = setTimeout(()=>{
      CheckProjects({
        projectsName: value
      },{
        success: {
          func: res => {
            if (res.data === false) {
              this.updateProjectName(value)
              callback()
            } else if (res.data === true) {
              callback(new Error('该名称已在项目或成员列表中存在'))
            }
          },
          isAsync: true
        },
        failed: {
          func: () => {
            callback()
          },
          isAsync: true
        }
      })
    },ASYNC_VALIDATOR_TIMEOUT)
  }
  displayName = (rule, value, callback) => {
    const { CheckDisplayName } = this.props;
    let newValue = value && value.trim()
    if (!newValue) {
      return callback('项目名称不能为空')
    }
    clearTimeout(this.displayNameTimeout)
    this.displayNameTimeout = setTimeout(()=>{
      CheckDisplayName({
        displayName: value
      },{
        success: {
          func: res => {
            if (res.data === false) {
              this.updateDisplayName(value)
              callback()
            } else if (res.data === true) {
              callback(new Error('该名称已在项目或成员列表中存在'))
            }
          },
          isAsync: true
        },
        failed: {
          func: () => {
            callback()
          },
          isAsync: true
        }
      })
    },ASYNC_VALIDATOR_TIMEOUT)
  }
  updateProjectName = () => {
    const { updateProjectName } = this.props;
    const { getFieldValue } = this.props.form;
    let projectName = getFieldValue('projectName')
    //updateProjectName(projectName)
  }
  updateDisplayName = () => {
    const { updateProjectName } = this.props;
    const { getFieldValue } = this.props.form;
    let projectName = getFieldValue('projectName')
    //updateProjectName(projectName)
  }
  updateProjectDesc = () => {
    const { updateProjectDesc } = this.props;
    const { getFieldValue } = this.props.form;
    let projectName = getFieldValue('projectDesc')
    //updateProjectDesc(projectName)
  }
  projectDesc = (rule, value, callback) => {
    callback()
  }
  onCancel = () => {
    this.props.onCancel();
  }
  onOk = () => {
    this.props.form.validateFields(['projectName', 'displayName'], (error, values) => {
      if(!!error){
        console.log(error);
        return;
      }
      if(this.state.authorizedCluster.length < 1){ // 将集群授权校验移到项目名称等的校验之后
        notify.warn("请选择集群");
        return;
      }
      this.setState({
        submitLoading: true,
      }, () => {
        let roleBinds = {}
        for (let i = 0; i < targetKeys.length; i++) {
          roleBinds[targetKeys[i].split(',')[0]] = []
          for (let j in roleMap) {
            if (targetKeys[i].split(',')[0] === j) {
              roleBinds[j] = roleMap[j]
            }
          }
        }
        let params = Object.assign({}, this.props.form.getFieldsValue(), {authorizedCluster: this.state.authorizedCluster,roleBinds :roleBinds});

        this.props.onOk(params, () => {
          this.setState({
            submitLoading: false,
            authorizedCluster: [],
          },() => {
            this.props.form.resetFields();
          })
        });
      })
    })
  }
  render(){
    const { selectedClusters, choosableClusters } = this.state;
    const { roleNum, form } = this.props
    const { getFieldProps, getFieldValue, isFieldValidating, getFieldError } = form;
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
      <Modal
        visible={this.props.visible}
        onOk={this.onOk}
        onCancel={this.onCancel}
        onClose={this.onCancel}
        title="创建项目"
        width="550"
        maskClosable={false}
        confirmLoading={this.state.submitLoading}
        footer={[
          <Button key="back" type="ghost" size="large" onClick={this.onCancel}>
          取 消
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={this.state.submitLoading}
            onClick={this.onOk}
            disabled={roleNum !== 1 && roleNum !== 2}
          >
            保 存
          </Button>,
        ]}
      >
        <Form>
          <div id="projectCreateStepOne">
            {
              (roleNum !== 1 && roleNum !== 2) &&
              <div className="deleteRow">
                <i className="fa fa-exclamation-triangle" style={{ marginRight: 8 }}></i>
                当前帐号无创建项目权限，联系管理员进行授权后再进行操作！
              </div>
            }
            <div className="alertRow createTip">请填写项目名称、描述，并为该项目授权集群</div>
            <div className="projectCreateFirstForm">
              <Form.Item label="项目名称"
                         {...formItemLayout}
                         hasFeedback
                         help={isFieldValidating('displayName') ? '校验中...' : (getFieldError('displayName') || []).join(', ')}
              >
                <Input  autoComplete="off" placeholder="请输入项目名称" {...getFieldProps('displayName', {
                  rules: [
                    { validator: this.displayName}
                  ]
                }) }
                />
              </Form.Item>
              <Form.Item label="命名空间"
                  {...formItemLayout}
                  hasFeedback
                  help={isFieldValidating('projectName') ? '校验中...' : (getFieldError('projectName') || []).join(', ')}
              >
                <Input  autoComplete="off" placeholder="请输入命名空间" {...getFieldProps('projectName', {
                  rules: [
                    { validator: this.projectName}
                  ]
                }) }
                />
              </Form.Item>
              <Form.Item label="描述" {...formItemLayout}>
                <Input type="textarea" {...getFieldProps('projectDesc', {
                  rules: [
                    { validator: (rules,value)=>this.projectDesc(rules,value,this.updateProjectDesc)}
                  ],
                  initialValue: '',
                }) }/>
              </Form.Item>
            </div>
            <div className="inputBox" id="clusterDrop" style={{position:'relative'}}>
              <Row className="dropBox">
                <Col span={4}>
                  <span className="dropText">授权集群 :</span>
                </Col>
                <Col span={20}>
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
                </Col>
              </Row>
            </div>
          </div>
        </Form>
      </Modal>
    )
  }
  componentWillMount() {
    const { userInfo } = this.props;
    this.getAllClusters();
    this.loadRoleList();
    roleMap = {
      [PROJECT_MANAGE_ROLE_ID]: [userInfo.userID]
    }
  }
};

CreateModal = Form.create()(CreateModal);

const mapStateToProps = state => {
  const { info } = state.entities.loginUser
  return {
    userInfo: info
  }
}

export default CreateModal = connect(mapStateToProps, {
  CheckDisplayName,
  CheckProjects,
  loadClusterList,
  ListRole,
})(CreateModal)
