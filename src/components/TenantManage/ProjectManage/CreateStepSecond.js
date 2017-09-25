/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateStepSecond
 *
 * v0.1 - 2017-07-12
 * @author zhangxuan
 */
import React, { Component } from 'react'
import './style/ProjectManage.less'
import { Row, Col, Button, Input, Transfer, Form } from 'antd'
import { connect } from 'react-redux'
import { ListRole, CreateRole, ExistenceRole } from '../../../actions/role'
import CreateRoleModal from  './CreateRole'
import Notification from '../../../components/Notification'
import { PROJECT_VISISTOR_ROLE_ID, PROJECT_MANAGE_ROLE_ID } from '../../../../constants'

class CreateStepSecond extends Component{
  constructor(props){
    super(props)
    this.state={
      targetKeys: [],
      characterModal: false,
      choosableList: []
    }
  }
  componentWillMount() {
    this.loadRoleList()
  }
  componentWillReceiveProps(nextProps) {
    const { step, scope } = nextProps;
    const { choosableList } = this.state;
    if (scope.state.closeCreateProject) {
      this.setState({
        targetKeys: [],
        choosableList: []
      })
    }
    if (this.props.step && step && this.props.step !== 'second' && step === 'second' && !choosableList.length) {
      this.loadRoleList()
    }
  }
  componentWillUnmount() {
    clearTimeout(this.roleNameTime)
  }
  loadRoleList() {
    const { ListRole, updateRole } = this.props;
    const targetKeys = [];
    const roleList = [];
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
              roleList.push(newData)
            }
            if (targetKeys.length > 0) {
              updateRole(targetKeys)
            }
            this.setState({
              choosableList:roleList,
              targetKeys
            })
          }
        },
        isAsync: true
      }
    })
  }
  
  filterOption(inputValue, option) {
    return option.title.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys) {
    const { updateRole } = this.props;
    let roleIdArr = []
    let notify = new Notification()
    targetKeys.forEach(item => roleIdArr.push(item.split(',')[0]))
    if (!roleIdArr.includes(PROJECT_MANAGE_ROLE_ID) || !roleIdArr.includes(PROJECT_VISISTOR_ROLE_ID)) {
      notify.info('项目管理员和项目访客不允许移出')
      return
    }
    this.setState({ targetKeys });
    updateRole(targetKeys)
  }
  openCreateModal() {
    this.setState({
      characterModal:true
    })
  }
  
  renderItem(item) {
    return(
      <Row key={item&&item.key}>
        <Col span={20}>{item&&item.name}</Col>
        {/*<Col span={4}>{item&&item.count}</Col>*/}
      </Row>
    )
  }
  render() {
    const { scope, form } = this.props;
    const { choosableList, targetKeys, characterModal } = this.state;
    const projectNameLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15, offset: 1 },
    };
    return (
      <div id="projectCreateStepSecond" className="projectCreateStepSecond">
        <CreateRoleModal
          form={form}
          scope={this}
          characterModal={characterModal}
          loadData={this.loadRoleList.bind(this)}
        />
        <div className="inputBox" style={{marginBottom:0}}>
          <Form.Item label="项目名称" {...projectNameLayout}>
            <Input disabled value={scope.state.projectName}
            />
          </Form.Item>
        </div>
        <div className="inputBox">
          <span style={{textIndent: '24px'}}>角色：</span>
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
          searchPlaceholder="请输入搜索内容"
          titles={['可选角色', '已选角色']}
          operations={[ '添加','移除']}
          filterOption={this.filterOption.bind(this)}
          targetKeys={targetKeys}
          onChange={this.handleChange.bind(this)}
          rowKey={item => item.key}
          render={(item)=>this.renderItem(item)}
        />
      </div>
    )
  }
}

function mapStateToSecondProp(state, props) {
  
  return {
  
  }
}

export default CreateStepSecond = connect(mapStateToSecondProp, {
  ListRole,
  CreateRole,
  ExistenceRole,
})(CreateStepSecond)