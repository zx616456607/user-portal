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
import { loadProjectList, createProject, deleteProject, updateProject, updateProjectPublicity, loadSysteminfo } from '../../../../actions/harbor'
import NotificationHandler from '../../../../components/Notification'
import { DEFAULT_REGISTRY, SEARCH } from '../../../../constants'
import indexIntl from './intl/index'
import { injectIntl } from 'react-intl'

const RadioGroup = Radio.Group
const notification = new NotificationHandler()
const DEFAULT_QUERY = {
  page: 1,
  page_size: 10,
}
let isLoaded = false

class CreateItem extends Component {
  constructor(props) {
    super()
  }
  handCancel() {
    const { form,func } = this.props
    form.resetFields()
    func.scope.setState({createItem:false})
  }
  projectNameExists(role, value, callback) {
    const { formatMessage } = this.props.intl
    if (!Boolean(value)) {
      return callback(formatMessage(indexIntl.nameValidateMsg1))
    }
    if (value.length <3) {
      return callback(formatMessage(indexIntl.nameValidateMsg2))
    }
    if (value.length >30) {
      return callback(formatMessage(indexIntl.nameValidateMsg3))
    }
    if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(value)) {
      callback(formatMessage(indexIntl.nameValidateMsg4))
      return
    }
    callback()
  }
  handOk() {
    const { form, func, harbor, intl } = this.props
    const { formatMessage } = intl
    form.validateFields((error, values)=> {
      if (!!error) {
        return
      }
      func.createProject(harbor, DEFAULT_REGISTRY, values, {
        success: {
          func: () => {
            notification.success(formatMessage(indexIntl.createSuccessMsg, { name: values.project_name}))
            func.loadData()
            func.scope.setState({ createItem:false, currentPage: 1 })
            form.resetFields()
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            const { statusCode } = err
            if (statusCode === 409) {
              notification.error(formatMessage(indexIntl.hasBeenCreated, { name: values.project_name}))
              return
            } else if (statusCode === 400) {
              notification.error(formatMessage(indexIntl.requestErr, { name: values.project_name}))
              return
            }
            notification.error(formatMessage(indexIntl.createFail, { name: values.project_name, statusCode}))
          },
        }
      })
    })
  }

  render() {
    const { getFieldProps } = this.props.form
    const { formatMessage } = this.props.intl
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    }
    const itemName= getFieldProps('project_name',{
      rules: [
        { validator: this.projectNameExists },
      ],
    })
    const projectPublic = getFieldProps('public',{
      rules: [
        { required: true },
      ],
      initialValue: 0,
    })
    return (
      <Modal
        title={formatMessage(indexIntl.newRepoBtn)}
        visible={this.props.visible}
        onOk={()=> this.handOk()}
        onCancel={()=> this.handCancel()}
        okText={formatMessage(indexIntl.okText)}
        cancelText={formatMessage(indexIntl.cancelText)}
      >
        <Form className="itemCreateFrom">
          <Form.Item label={formatMessage(indexIntl.repoGroupName)} {...formItemLayout} className="createForm">
            <Input placeholder={formatMessage(indexIntl.placeholder)} {...itemName}/>
          </Form.Item>
          <Form.Item label={formatMessage(indexIntl.repoGroupType)} {...formItemLayout} className="createForm">
            <RadioGroup {...projectPublic}>
              <Radio value={0}>{formatMessage(indexIntl.privateType)}</Radio>
              <Radio value={1}>{formatMessage(indexIntl.publicType)}</Radio>
            </RadioGroup>
          </Form.Item>
          <div className="alertRow">
            {formatMessage(indexIntl.newRepoGroupMessage)}
            </div>
        </Form>
      </Modal>
    )
  }
}

CreateItem = Form.create()(CreateItem)
CreateItem = injectIntl(CreateItem, {withRef: true})

class Project extends Component {
  constructor(props) {
    super()
    this.state = {
      createItem: false,// create modal
      deleteItem: false,// delte modal
      selectedRows:[],
      searchInput: '',
      currentPage: 1,
    }
    this.loadData = this.loadData.bind(this)
    this.searchProjects = this.searchProjects.bind(this)
    this.deleteItemOk = this.deleteItemOk.bind(this)
  }
  loadData(query = {}) {
    const { loadProjectList, harbor } = this.props
    const { formatMessage } = this.props.intl
    let notify = new NotificationHandler()
    loadProjectList(DEFAULT_REGISTRY, Object.assign({}, DEFAULT_QUERY, { harbor }, query), {
      failed: {
        func: res => {
          if (res.statusCode === 500) {
            notify.error(formatMessage(indexIntl.loadDataErr))
          }
        }
      }
    })
  }
  componentWillMount() {
    this.loadData()
  }
  componentWillReceiveProps(nextProps) {
    if(!!nextProps.harbor && !isLoaded){
      isLoaded = true
      this.props.loadSysteminfo(DEFAULT_REGISTRY)
    }
    if(nextProps.harbor !== this.props.harbor){
      this.loadData({ harbor: nextProps.harbor })
    }
  }
  componentDidUpdate() {
    let searchInput = document.getElementsByClassName('search')[0]
    searchInput && searchInput.focus()
  }
  searchProjects() {
    this.loadData({ project_name: this.state.searchInput.replace(SEARCH,"") })
  }
  deleteItemOk() {
    // go delete item
    const { deleteProject, harbor } = this.props
    const { formatMessage } = this.props.intl
    const { selectedRows } = this.state
    const doSuccess = () => {
      notification.success(formatMessage(indexIntl.deleteRepoOk, { name: selectedRows[0].name }))
      this.setState({
        deleteItem: false,
      })
      const { currentPage } = this.state
      this.loadData({page: currentPage})
    }
    deleteProject(harbor, DEFAULT_QUERY, selectedRows[0][camelize('project_id')], {
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
            notification.error(formatMessage(indexIntl.cannotDel))
            this.setState({
              deleteItem: false,
            })
            return
          }
          notification.error(formatMessage(indexIntl.deleteFailed))
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
    const { getFieldProps } = this.props.form
    const { harborProjects, harborSysteminfo, createProject, updateProject, updateProjectPublicity, loginUser, harbor, intl } = this.props
    const { formatMessage } = intl
    const { currentPage } = this.state
    const func = {
      scope: this,
      loadData: this.loadData,
      createProject,
      updateProject,
      updateProjectPublicity,
    }
    const isAdmin = loginUser.harbor[camelize('has_admin_role')] == 1
    const isShowCreateBtn = harborSysteminfo[camelize('project_creation_restriction')] === 'everyone' || isAdmin
    return (
      <div className="imageProject">
        <br />
        <QueueAnim>
          <div key="projects">
            <Card className="project">
              <div className="topRow">
                {
                  isShowCreateBtn &&
                  <Button
                    type="primary"
                    size="large"
                    onClick={this.openCreateModal.bind(this)}
                  >
                    <i className='fa fa-plus'/>&nbsp;
                    {formatMessage(indexIntl.newRepoBtn)}
                  </Button>
                }
                {/*<Button type="ghost" disabled={this.state.selectedRows.length==0} onClick={()=> this.setState({deleteItem:true})} size="large" icon="delete">删除</Button>*/}
                <Input
                  placeholder={formatMessage(indexIntl.searchPlaceholder)}
                  className="search"
                  size="large"
                  onChange={e => this.setState({ searchInput: e.target.value })}
                  onPressEnter={this.searchProjects}
                />
                <i className="fa fa-search" onClick={this.searchProjects}></i>
                {/*{harborProjects.total >0 ?
                <span className="totalPage">共计：{harborProjects.total} 条</span>
                :null
                }*/}
              </div>
              <DataTable loginUser={loginUser} dataSource={harborProjects} func={func} harbor={harbor} from="private" currentPage={currentPage}/>
            </Card>
            {/* 创建仓库组 Modal */}
            <CreateItem visible={this.state.createItem} func={func} harbor={harbor}/>

            {/* 删除仓库组 Modal */}
            <Modal
              title={formatMessage(indexIntl.deleteRepoModalTitle)}
              visible={this.state.deleteItem}
              onCancel={()=> this.setState({deleteItem:false})}
              onOk={()=> this.deleteItemOk()}
              okText={formatMessage(indexIntl.okText)}
              cancelText={formatMessage(indexIntl.cancelText)}
            >
              <div className="deleteRow">
                <i className="fa fa-exclamation-triangle"/>
                { formatMessage(indexIntl.deleteConfirmText, {name: this.state.selectedRows.map(item=> item.name).join(',')}) }
              </div>
            </Modal>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

Project = Form.create()(Project)
Project = injectIntl(Project, {withRef: true})
function mapStateToProps(state, props) {
  const { harbor: stateHarbor, entities } = state
  let harborProjects = stateHarbor.projects && stateHarbor.projects[DEFAULT_REGISTRY] || {}
  let harborSysteminfo = stateHarbor.systeminfo && stateHarbor.systeminfo[DEFAULT_REGISTRY] && stateHarbor.systeminfo[DEFAULT_REGISTRY].info || {}

  const { cluster } =  entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    harborProjects,
    harborSysteminfo,
    loginUser: entities.loginUser.info,
    harbor,
  }
}

export default connect(mapStateToProps, {
  loadProjectList,
  createProject,
  deleteProject,
  updateProject,
  updateProjectPublicity,
  loadSysteminfo,
})(Project)
