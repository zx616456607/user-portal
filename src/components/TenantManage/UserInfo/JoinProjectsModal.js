/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Join projects modal
 *
 * v0.1 - 2017-07-18
 * @author Zhangpc
 */

import React from 'react'
import { Modal, Table, Button, Menu, Row, Col, Checkbox, Spin, Form } from 'antd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { GetProjectsDetail, hadnleProjectRoleBinding } from '../../../actions/project'
import NotificationHandler from '../../../components/Notification'
import './style/JoinProjectsModal.less'

const CheckboxGroup = Checkbox.Group
const STEPS = [
  {
    step: 1,
    desc: '将成员添加到项目',
  },
  {
    step: 2,
    desc: '为成员授予在项目中的角色',
  },
]
const FormItem = Form.Item
class JoinProjectsModalComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      currentProjectKey: null,
      selectedKeys: [],
      roleCheckGroupValue: {},
      submitBtnLoading: false,
    }

    this.renderStep = this.renderStep.bind(this)
    this.getProjectsByKeys = this.getProjectsByKeys.bind(this)
    this.onProjectClick = this.onProjectClick.bind(this)
    this.onRoleCheckChange = this.onRoleCheckChange.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.renderItem = this.renderItem.bind(this)
    this.next = this.next.bind(this)
    this.submitJoinProject = this.submitJoinProject.bind(this)

    this.projectsDetailInit = {}
  }

  renderItem(item) {
    const { joinedProjectKeys } = this.props
    if (item) {
      if (joinedProjectKeys.indexOf(item.key) > -1) {
        return `${item.projectName}（原项目不能移除）`
      }
      return item.projectName
    }
  }

  handleRowClick = row => {
    const { projectTargetKeys, handleProjectTransferChange } = this.props
    const keysSet = new Set(projectTargetKeys)
    if (keysSet.has(row.projectID)) {
      keysSet.delete(row.projectID)
    } else {
      keysSet.add(row.projectID)
    }
    handleProjectTransferChange([...keysSet])
  }

  renderStep() {
    const { step, currentProjectKey, selectedKeys, roleCheckGroupValue } = this.state
    const {
      allProjects,
      projectTargetKeys,
      handleProjectTransferChange,
      projectsDetail,
      joinedProjects,
      defaultTargetKeys,
    } = this.props
    const targetProjects = this.getProjectsByKeys(projectTargetKeys)
    const stepOneClass = classNames({
      'hide': step !== 1,
    })
    const stepTwoClass = classNames({
      'hide': step !== 2,
    })
    const currentRelatedRoles = this.getRelatedRoles(projectsDetail, currentProjectKey).relatedRoles
    const { getFieldProps } = this.props.form
    const columns = [{
      title: '项目名称',
      dataIndex: 'projectName',
    }]
    const rowSelection = {
      selectedRowKeys: projectTargetKeys,
      onChange: handleProjectTransferChange,
    }
    return (
      <div style={{ height: "300px", overflow: 'hidden auto' }}>
        <Table
          dataSource={allProjects.filter(pro => !defaultTargetKeys.includes(pro.projectID))}
          columns={columns}
          rowSelection={rowSelection}
          rowKey={record => record.projectID}
          pagination={false}
          className={stepOneClass}
          onRowClick={this.handleRowClick}
        />
        <div className={stepTwoClass}>
          <Row gutter={16} className="selectedProjectsHeader">
            <Col span={6}>
              已加入项目
            </Col>
            <Col span={18}>
              选择在项目中的角色（已选择1个，共{currentRelatedRoles.length}个）
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <div className="selectedProjects">
                <Menu
                  mode="inline"
                  onClick={this.onProjectClick}
                  selectedKeys={selectedKeys}
                  onSelect={({ item, key, selectedKeys }) => this.setState({selectedKeys})}
                >
                  {
                    targetProjects.map(project => (
                      <Menu.Item key={project.projectName}>
                        {project.projectName}
                      </Menu.Item>
                    ))
                  }
                </Menu>
              </div>
            </Col>
            <Col span={18}>
              {
                targetProjects.map(project => {
                  const { projectName } = project
                  const projectRolesClass = classNames({
                    'roles': true,
                    'hide': currentProjectKey !== projectName,
                  })
                  const { relatedRoles, isFetching } = this.getRelatedRoles(projectsDetail, projectName)
                  const checkboxGroupOpts = (relatedRoles || []).map(role => ({
                    label: role.roleName,
                    value: role.roleId,
                  }))
                  return (
                    <div className={projectRolesClass}>
                      {
                        isFetching && (
                          <div className="loadingBox">
                            <Spin />
                          </div>
                        )
                      }
                      {
                        (!isFetching && relatedRoles.length === 0) && (
                          <div className="loadingBox">
                            {projectName} 项目下还没有角色
                          </div>
                        )
                      }
                        <div className="checkRole">
                          <FormItem>
                            <CheckboxGroup
                              options={checkboxGroupOpts}
                              {
                                ...getFieldProps(`roles-${project.projectID}`, {
                                  onChange: (val) => {
                                    this.onRoleCheckChange(project, val)
                                  },
                                  rules: [
                                    { required: true, message: `至少在${projectName}项目中设置一个角色` },
                                  ],
                                  initialValue: roleCheckGroupValue[project.projectName] || []
                                })
                              }
                            />
                          </FormItem>
                        </div>
                    </div>
                  )
                })
              }
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  getProjectsByKeys(keys) {
    const { allProjects } = this.props
    return allProjects.filter(project => keys.indexOf(project.projectID || project.ProjectID) > -1)
  }

  onProjectClick({item, key, keyPath}) {
    this.setState({
      currentProjectKey: key,
    })
    if (this.projectsDetailInit[key]) {
      return
    }
    const { GetProjectsDetail } = this.props
    GetProjectsDetail({ projectsName: key })
    this.projectsDetailInit[key] = true
  }

  getRelatedRoles(projectsDetail, projectName) {
    const projectDetail = projectsDetail[projectName] && projectsDetail[projectName] || {}
    const { isFetching } = projectDetail
    const relatedRoles = projectDetail.data && projectDetail.data.data.relatedRoles || []
    return {
      isFetching,
      relatedRoles,
    }
  }

  onRoleCheckChange = (project, value) => {
    const { roleCheckGroupValue } = this.state
    this.setState({
      roleCheckGroupValue: Object.assign(
        {},
        roleCheckGroupValue,
        { [project.projectName]: value },
      )
    })
  }

  onCancel() {
    this.props.onCancel()
    this.setState({
      step: 1,
    })
  }

  next() {
    const { projectTargetKeys, joinedProjects } = this.props
    const targetProjects = this.getProjectsByKeys(projectTargetKeys)
    const firstTargetKey = targetProjects[0].projectName
    this.setState({
      step: 2,
      selectedKeys: [ firstTargetKey ],
      roleCheckGroupValue: this.getOldJoinedRoleValue(joinedProjects),
    })
    this.onProjectClick({ key: firstTargetKey })
  }

  getOldJoinedRoleValue(joinedProjects) {
    const roleCheckGroupValue = {}
    joinedProjects.forEach(project => {
      const { projectName, roles } = project
      roleCheckGroupValue[projectName] = roles && roles.map(role => role.id)
    })
    return roleCheckGroupValue
  }

  submitJoinProject() {
    const {
      joinedProjects,
      allProjects,
      hadnleProjectRoleBinding,
      loadProjectsData,
      form,
    } = this.props
    const userID = parseInt(this.props.userId)
    const notification = new NotificationHandler()
    const { roleCheckGroupValue } = this.state
    const rolebinding = { bindings: [] }
    const roleUnbind = { bindings: [] }
    const oldJoinedRoleValue = this.getOldJoinedRoleValue(joinedProjects)
    const { validateFields } = form
    validateFields((err) => {
      if (!err) {
        const getProjectByName = name => {
          for (let i = 0; i < allProjects.length; i++) {
            const project = allProjects[i]
            if (project.projectName === name) {
              return project
            }
          }
        }
        Object.keys(roleCheckGroupValue).map(key => {
          const projectRoles = roleCheckGroupValue[key] || []
          const oldProjectRoles = oldJoinedRoleValue[key] || []
          const project = getProjectByName(key)
          projectRoles.forEach(role => {
            if (oldProjectRoles.indexOf(role) < 0) {
              rolebinding.bindings.push({
                userID,
                scopeID: project.projectID,
                roleID: role,
              })
            }
          })
          oldProjectRoles.forEach(role => {
            if (projectRoles.indexOf(role) < 0) {
              roleUnbind.bindings.push({
                userID,
                scopeID: project.projectID,
                roleID: role,
              })
            }
          })
        })
        let msg = '加入其它项目'
        if (rolebinding.bindings.length === 0) {
          if (roleUnbind.bindings.length === 0) {
            notification.warn('您未做任何修改，请选择角色')
            return
          }
          msg = '您未加入新的项目，已有项目修改'
        }
        this.setState({
          submitBtnLoading: true,
        })
        hadnleProjectRoleBinding({ rolebinding, roleUnbind }, {
          success: {
            func: () => {
              notification.success(`${msg}成功`)
              this.onCancel()
              loadProjectsData()
            },
            isAsync: true,
          },
          failed: {
            func: () => {
              notification.error(`${msg}失败`)
            },
            isAsync: true,
          },
          finally: {
            func: () => {
              this.setState({
                submitBtnLoading: false,
              })
            },
          },
        })
      }
    })
  }

  render() {
    const { onCancel, projectTargetKeys } = this.props
    const { step, submitBtnLoading } = this.state
    const { getFieldProps } = this.props.form
    return (
      <Modal
        {...this.props}
        title="加入项目"
        wrapClassName="JoinProjectsModal"
        onCancel={this.onCancel}
        footer={[
          <Button
            key="back"
            type="ghost"
            size="large"
            onClick={this.onCancel}
          >
            取 消
          </Button>,
          step === 1
          ? (
            <Button
              key="next"
              type="primary"
              size="large"
              disabled={projectTargetKeys.length === 0}
              onClick={this.next}
            >
              下一步
            </Button>
          )
          : [
          <Button
            key="prev"
            type="primary"
            size="large"
            disabled={projectTargetKeys.length === 0}
            onClick={() => this.setState({ step: 1, currentProjectKey: null, selectedKeys: [] })}
          >
            上一步
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            loading={submitBtnLoading}
            onClick={this.submitJoinProject}
          >
            确 定
          </Button>
          ],
        ]}
      >
      <div className="topStep">
        {
          STEPS.map(step => (
            <span className={step.step <= this.state.step ? 'step active' : 'step'}>
              <span className="number">{step.step}</span>
              {step.desc}
            </span>
          ))
        }
      </div>
      <Form>
        {
          this.renderStep()
        }
      </Form>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    projectsDetail: state.projectAuthority.projectsDetail,
  }
}
const JoinProjectsModal = Form.create()(JoinProjectsModalComponent)
export default connect(mapStateToProps, {
  GetProjectsDetail,
  hadnleProjectRoleBinding,
})(JoinProjectsModal)
