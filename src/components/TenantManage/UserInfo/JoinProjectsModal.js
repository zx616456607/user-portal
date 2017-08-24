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
import { Modal, Transfer, Button, Menu, Row, Col, Checkbox, Spin } from 'antd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { GetProjectsDetail } from '../../../actions/project'
import './style/JoinProjectsModal.less'

// const TabPane = Tabs.TabPane
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

class JoinProjectsModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      currentProjectKey: null,
      selectedKeys: [],
    }

    this.renderStep = this.renderStep.bind(this)
    this.getProjectsByKeys = this.getProjectsByKeys.bind(this)
    this.onProjectClick = this.onProjectClick.bind(this)
    this.onRoleCheckChange = this.onRoleCheckChange.bind(this)
    this.onCancel = this.onCancel.bind(this)

    this.projectsDetailInit = {}
  }

  renderStep() {
    const { step, currentProjectKey, selectedKeys } = this.state
    const { allProjects, projectTargetKeys, handleProjectTransferChange, projectsDetail } = this.props
    const targetProjects = this.getProjectsByKeys(projectTargetKeys)
    // if (step === 1) {
    //   return (
    //     <Transfer
    //       dataSource={allProjects}
    //       showSearch
    //       listStyle={{
    //         width: 250,
    //         height: 300,
    //       }}
    //       titles={['选择项目', '已选择项目']}
    //       operations={['添加', '移除']}
    //       targetKeys={projectTargetKeys}
    //       onChange={handleProjectTransferChange}
    //       render={item => item && item.projectName}
    //     />
    //   )
    // }
    const stepOneClass = classNames({
      'hide': step !== 1,
    })
    const stepTwoClass = classNames({
      'hide': step !== 2,
    })
    const currentRelatedRoles = this.getRelatedRoles(projectsDetail, currentProjectKey).relatedRoles
    return (
      <div style={{ height: "300px" }}>
        {/* <Tabs>
          {
            a.map(i => <TabPane tab={`选项卡${i}`} key={i}>选项卡{i}内容</TabPane>)
          }
        </Tabs> */}
        <Transfer
          className={stepOneClass}
          dataSource={allProjects}
          showSearch
          listStyle={{
            width: 250,
            height: 300,
          }}
          titles={['选择项目', '已选择项目']}
          operations={['添加', '移除']}
          targetKeys={projectTargetKeys}
          onChange={handleProjectTransferChange}
          render={item => item && item.projectName}
        />
        <div className={stepTwoClass}>
          <Row gutter={16} className="selectedProjectsHeader">
            <Col span={6}>
              已选项目
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
                  onClick={this.onProjectClick} selectedKeys={selectedKeys}
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
                      {
                        !isFetching && relatedRoles.map(role => (
                          <div className="checkRole">
                            <Checkbox onChange={this.onRoleCheckChange.bind(this, role, project)}>
                              {role.roleName}
                            </Checkbox>
                          </div>
                        ))
                      }
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

  onRoleCheckChange(role, project, e) {
  }

  onCancel() {
    this.props.onCancel()
    this.setState({
      step: 1,
    })
  }

  render() {
    const { onCancel, projectTargetKeys } = this.props
    const { step } = this.state
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
              onClick={() => this.setState({step: 2})}
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
            disabled={true}
          >
            确 定(need api)
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
      {
        this.renderStep()
      }
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    projectsDetail: state.projectAuthority.projectsDetail,
  }
}

export default connect(mapStateToProps, {
  GetProjectsDetail,
})(JoinProjectsModal)
