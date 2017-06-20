/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * project component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Icon, Button,Form,Radio, Card, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import '../style/Project.less'
import DataTable from './DataTable'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import { loadProjectList, createProject, deleteProject, updateProject, loadSysteminfo } from '../../../../actions/harbor'
import NotificationHandler from '../../../../common/notification_handler'
import { DEFAULT_REGISTRY } from '../../../../constants'

const RadioGroup = Radio.Group
const notification = new NotificationHandler()
const DEFAULT_QUERY = {
  page: 1,
  page_size: 10,
}

class CreateItem extends Component {
  constructor(props) {
    super()
  }
  handCancel() {
    const { form,func } = this.props
    form.resetFields()
    func.scope.setState({createItem:false})
  }
  handOk() {
    const { form, func } = this.props
    form.validateFields((error, values)=> {
      if (!!error) {
        return
      }
      func.createProject(DEFAULT_REGISTRY, values, {
        success: {
          func: () => {
            func.loadData()
            func.scope.setState({ createItem:false })
            form.resetFields()
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            const { statusCode } = err
            if (statusCode === 409) {
              notification.error(`仓库组名称 ${values.project_name} 已存在`)
              return
            } else if (statusCode === 400) {
              notification.error(`请求错误，请检查仓库名称： ${values.project_name}`)
              return
            }
            notification.error(`创建仓库组 ${values.project_name} 失败，错误代码: ${statusCode}`)
          },
        }
      })
    })
  }

  render() {
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    }
    const itemName= getFieldProps('project_name',{
      rules: [
        { required: true, min: 3, message: '仓库组至少为3个字符' },
        // { validator: this.nameExists },
      ],
    })
    const projectPublic = getFieldProps('public',{
      rules: [
        { required: true },
      ],
      initialValue: 0,
    })
    return (
      <Modal title="新建仓库组" visible={this.props.visible} onOk={()=> this.handOk()} onCancel={()=> this.handCancel()}>
        <Form className="itemCreateFrom">
          <Form.Item label="仓库组名称" {...formItemLayout} className="createForm">
            <Input placeholder="请输入仓库组名称" {...itemName}/>
          </Form.Item>
          <Form.Item label="仓库组类型" {...formItemLayout} className="createForm">
            <RadioGroup {...projectPublic}>
              <Radio value={0}>私有</Radio>
              <Radio value={1}>公开</Radio>
            </RadioGroup>
          </Form.Item>

          <div className="alertRow">当仓库组设为公开后，所有人都有读取该仓库组内镜像的权限。命令行操作下无需“docker login”即可以拉取该仓库组内的所有镜像。</div>
        </Form>
      </Modal>
    )
  }
}

CreateItem = Form.create()(CreateItem)

class Project extends Component {
  constructor(props) {
    super()
    this.state = {
      createItem: false,// create modal
      deleteItem: false,// delte modal
      selectedRows:[],
      searchInput: '',
    }
    this.loadData = this.loadData.bind(this)
    this.searchProjects = this.searchProjects.bind(this)
    this.deleteItemOk = this.deleteItemOk.bind(this)
  }

  loadData(query) {
    const { loadProjectList } = this.props
    loadProjectList(DEFAULT_REGISTRY, Object.assign({}, DEFAULT_QUERY, query))
  }

  componentWillMount() {
    this.loadData()
    this.props.loadSysteminfo(DEFAULT_REGISTRY)
  }

  searchProjects() {
    this.loadData({ project_name: this.state.searchInput })
  }

  deleteItemOk() {
    // go delete item
    const { deleteProject } = this.props
    const { selectedRows } = this.state
    const doSuccess = () => {
      notification.success(`仓库组 ${selectedRows[0].name} 删除成功`)
      this.setState({
        deleteItem: false,
      })
      this.loadData()
    }
    deleteProject(DEFAULT_QUERY, selectedRows[0][camelize('project_id')], {
      success: {
        func: () => {
          doSuccess()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode === 404) {
            doSuccess()
            return
          }
          if (statusCode === 412) {
            notification.error(`仓库组包含规则，删除失败`)
            return
          }
          notification.error(`仓库组删除失败`)
        },
      }
    })
  }
  openCreateModal() {
    this.setState({createItem: true},()=>{
      document.getElementById('project_name').focus()
    })
  }
  render() {
    const { harborProjects, harborSysteminfo, createProject, updateProject, loginUser } = this.props
    const func = {
      scope: this,
      loadData: this.loadData,
      createProject,
      updateProject,
    }
    const isAdmin = loginUser.harbor[camelize('has_admin_role')] == 1
    const isShowCreateBtn = harborSysteminfo[camelize('project_creation_restriction')] === 'everyone' || isAdmin
    return (
      <div className="imageProject">
        <br />
        <div className="alertRow">镜像仓库用于存放镜像，您可关联第三方镜像仓库，使用公开云中私有空间镜像；关联后，该仓库也用于存放通过 TenxFlow 构建出来的镜像</div>
        <QueueAnim>
          <div key="projects">

            <Card className="project">
              <div className="topRow">
                {
                  isShowCreateBtn &&
                  <Button
                    type="primary"
                    size="large"
                    icon="plus"
                    onClick={this.openCreateModal.bind(this)}
                  >
                    新建仓库组
                  </Button>
                }
                {/*<Button type="ghost" disabled={this.state.selectedRows.length==0} onClick={()=> this.setState({deleteItem:true})} size="large" icon="delete">删除</Button>*/}
                <Input
                  placeholder="搜索"
                  className="search"
                  size="large"
                  onChange={e => this.setState({ searchInput: e.target.value })}
                  onPressEnter={this.searchProjects}
                />
                <i className="fa fa-search" onClick={this.searchProjects}></i>
                <div className="alertRow inlineBlock" style={{marginLeft:'20px'}}>此处需要先搜索仓库组，进入仓库组后再搜索具体的镜像</div>
                {/*{harborProjects.total >0 ?
                <span className="totalPage">共计：{harborProjects.total} 条</span>
                :null
                }*/}
              </div>
              <DataTable loginUser={loginUser} dataSource={harborProjects} func={func}/>
            </Card>
            {/* 创建仓库组 Modal */}
            <CreateItem visible={this.state.createItem} func={func}/>

            {/* 删除仓库组 Modal */}
            <Modal title="删除仓库组" visible={this.state.deleteItem}
              onCancel={()=> this.setState({deleteItem:false})}
              onOk={()=> this.deleteItemOk()}
            >
              <div className="confirmText" style={{lineHeight:'30px'}}>删除仓库组后，仓库组内的镜像将全部删除。</div>
              <div className="confirmText">您确认删除 {this.state.selectedRows.map(item=> item.name).join(',')} 仓库组?</div>
            </Modal>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { harbor, entities } = state
  let harborProjects = harbor.projects && harbor.projects[DEFAULT_REGISTRY] || {}
  let harborSysteminfo = harbor.systeminfo && harbor.systeminfo[DEFAULT_REGISTRY] && harbor.systeminfo[DEFAULT_REGISTRY].info || {}
  return {
    harborProjects,
    harborSysteminfo,
    loginUser: entities.loginUser.info,
  }
}

export default connect(mapStateToProps, {
  loadProjectList,
  createProject,
  deleteProject,
  updateProject,
  loadSysteminfo,
})(Project)
