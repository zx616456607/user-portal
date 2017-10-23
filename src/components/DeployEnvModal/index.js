/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Deployment environment modal
 *
 * v0.1 - 2017-05-03
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Modal, Form, Select } from 'antd'
import { connect } from 'react-redux'
import { getProjectVisibleClusters, ListProjects } from '../../actions/project'
import { setCurrent } from '../../actions/entities'
import { MY_SPACE } from '../../constants'
import './style/index.less'

const FormItem = Form.Item
const createForm = Form.create
const Option = Select.Option

function loadProjects(props, callback) {
  const { ListProjects } = props
  ListProjects({ size: 0 }, callback)
}
let DeployEnvModal = React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
  },

  defaultProps: {
    title: '选择部署环境',
    visible: false,
  },
  componentWillMount() {
    loadProjects(this.props)
  },
  componentWillReceiveProps(nextProps) {
    const { form, current } = nextProps
    if (current.space.namespace === this.props.current.space.namespace && current.cluster.clusterID === this.props.current.cluster.clusterID) {
      return
    }
    form.setFieldsValue({
      'spaceFormCheck': current.space.namespace,
      'clusterFormCheck': current.cluster.clusterID,
    })
  },
  spaceNameCheck(rule, value, callback) {
    if (!value) {
      this.setState({
        disabled: true
      })
      callback([new Error('请选择空间')])
      return
    }
    this.setState({
      disabled: false
    })
    callback()
  },

  clusterNameCheck(rule, value, callback) {
    if (!value) {
      this.setState({
        disabled: true
      })
      callback([new Error('请选择集群')])
      return
    }
    this.setState({
      disabled: false
    })
    callback()
  },

  handleSpaceChange(value) {
    const { projects, getProjectVisibleClusters, setCurrent, form, current } = this.props
    let newTeamspaces = ([MY_SPACE]).concat(projects)
    newTeamspaces.map(project => {
      if (project.namespace === value) {
        setCurrent({
          space: project,
          team: {
            teamID: project.teamID
          }
        })
        getProjectVisibleClusters(project.projectName, {
          success: {
            func: (result) => {
              if (!result.data || result.data.clusters.length === 0) {
                form.resetFields(['clusterFormCheck'])
                return
              }
              form.setFieldsValue({
                'clusterFormCheck': result.data.clusters[0].clusterName,
              })
            },
            isAsync: true
          }
        })
      }
    })
  },
  
  handleClusterChange(value) {
    const { projectClusters, setCurrent } = this.props
    projectClusters.map((cluster) => {
      if (cluster.clusterID === value) {
        setCurrent({
          cluster
        })
      }
    })
  },

  render() {
    const {
      title, visible, onCancel,
      onOk, form, projects,
      projectClusters, current,
    } = this.props
    const { getFieldProps } = form
    const spaceFormCheck = getFieldProps('spaceFormCheck', {
      rules: [
        { validator: this.spaceNameCheck }
      ],
      onChange: this.handleSpaceChange,
      initialValue: current.space.namespace,
    })
    const clusterFormCheck = getFieldProps('clusterFormCheck', {
      rules: [
        { validator: this.clusterNameCheck }
      ],
      onChange: this.handleClusterChange,
      initialValue: current.cluster.clusterName,
    })
    return (
      <Modal
        title={title}
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        className="deployEnvModal"
      >
        <div className="tips">
          请为创建的应用选择部署环境
        </div>
        <Form inline>
          <FormItem
            key="space"
            className="firstFormItem"
            style={{ minWidth: '220px', marginRight: "21px" }}
          >
            <span style={{marginRight: "30px"}}>部署环境</span>
            <Select size="large"
              placeholder="请选择空间"
              style={{ width: 180 }}
              {...spaceFormCheck}>
              <Option value="default">我的个人项目</Option>
              {
                projects.map(project => {
                  return (
                    <Option key={project.namespace} value={project.namespace}>
                      {project.projectName}
                    </Option>
                  )
                })
              }
            </Select>
          </FormItem>
          <FormItem key="cluster">
            <Select size="large"
              placeholder="请选择集群"
              style={{ width: 180 }}
              {...clusterFormCheck}>
              {
                projectClusters.map(cluster => {
                  return (
                    <Option key={cluster.clusterName} value={cluster.clusterName}>
                      {cluster.clusterName}
                    </Option>
                  )
                })
              }
            </Select>
          </FormItem>
        </Form>
      </Modal>
    )
  }
})

DeployEnvModal = createForm()(DeployEnvModal)

function mapStateToProps(state, props) {
  const { current } = state.entities
  const { projectList, projectVisibleClusters } = state.projectAuthority
  const projects = projectList.data || []
  const currentNamespace = current.space.namespace
  const currentProjectClusterList = projectVisibleClusters[currentNamespace] || {}
  const projectClusters = currentProjectClusterList.data || []
  return {
    current,
    isProjectsFetching: projectList.isFetching,
    projects,
    isProjectClustersFetching: currentProjectClusterList.isFetching,
    projectClusters,
  }
}

export default connect(mapStateToProps, {
  getProjectVisibleClusters, 
  ListProjects,
  setCurrent,
})(DeployEnvModal)
