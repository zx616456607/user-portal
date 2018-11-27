/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Docker file modal editor: FROM
 * v0.1 - 2017-07-05
 * @author Zhangpc
 */

import React from 'react'
import { Form, Alert, Input, Select, Row, Col } from 'antd'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import { loadProjectList, loadProjectRepos, loadRepositoriesTags, loadRepositoriesTagConfigInfo } from '../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../constants'
import NotificationHandler from '../../../common/notification_handler'
import { SYSTEM_STORE } from '../../../../constants/index'

const FormItem = Form.Item
const Option = Select.Option
const notification = new NotificationHandler()
const PROJECT_ID = camelize('project_id')

const FROM = React.createClass({
  getInitialState() {
    return {}
  },
  componentWillMount() {
    const { loadProjectList, harbor } = this.props
    loadProjectList(DEFAULT_REGISTRY, { page_size: 100, harbor, }, {
      success: {
        func: () => this.loadHarbor(),
        isAsync: true,
      }
    })
  },
  componentWillReceiveProps(nextProps) {
    const { imageTagConfig, callback, form, modalVisible } = nextProps
    const { getFieldValue } = form
    let imageConfig = {}
    if (imageTagConfig) {
      const tag = getFieldValue('tag')
      if (imageTagConfig[tag]) {
        imageConfig = imageTagConfig[tag] || {}
        let mountPath = imageConfig.mountPath || {}
        mountPath = Object.keys(mountPath)
        callback({ mountPath, server: imageTagConfig.server })
      }
    }
    if (modalVisible && !this.props.modalVisible) {
      this.loadHarbor()
    }
  },
  loadHarbor() {
    const { form } = this.props
    const { getFieldValue } = form
    const harborProject = getFieldValue('harborProject')
    const image = getFieldValue('image')
    const tag = getFieldValue('tag')
    harborProject && this.onHarborProjectChange(harborProject, true)
    image && this.onImageChange(image, true)
  },
  onHarborProjectChange(value, unreset) {
    if (value === 'imageUrl') {
      return
    }
    const { form, harborProjects, loadProjectRepos, harbor } = this.props
    let targetProject
    (harborProjects.list || []).every(project => {
      if (project.name === value) {
        targetProject = project
        return false
      }
      return true
    })
    if (!targetProject) {
      notification.warn('项目未找到')
      return
    }
    !unreset && form.resetFields([ 'image', 'tag' ])
    loadProjectRepos(DEFAULT_REGISTRY, { page_size: 100, project_id: targetProject[PROJECT_ID], harbor })
  },
  onImageChange(image, unreset) {
    const { form, loadRepositoriesTags, harbor } = this.props
    const { getFieldProps, getFieldValue, resetFields } = form
    const harborProject = getFieldValue('harborProject')
    const imageName = `${harborProject}/${image}`
    !unreset && resetFields([ 'tag' ])
    loadRepositoriesTags(harbor, DEFAULT_REGISTRY, imageName)
  },
  onTagChange(tag) {
    const { form, loadRepositoriesTagConfigInfo, harbor } = this.props
    const { getFieldProps, getFieldsValue, resetFields } = form
    const { harborProject, image } = getFieldsValue([ 'harborProject', 'image' ])
    const imageName = `${harborProject}/${image}`
    loadRepositoriesTagConfigInfo(harbor, DEFAULT_REGISTRY, imageName, tag)
  },
  render() {
    const { formItemLayout, form, harborProjects, repos, imageTags, imageTagConfig } = this.props
    const { getFieldProps, getFieldValue } = form
    const harborProjectProps = getFieldProps('harborProject', {
      rules: [
        { required: true, message: '请选择仓库组' },
      ],
      onChange: this.onHarborProjectChange
    })
    const harborProject = getFieldValue('harborProject')
    let imageProps
    let tagProps
    let imageUrlProps
    let image
    let tag
    if (harborProject !== 'imageUrl') {
      imageProps = getFieldProps('image', {
        rules: [
          { required: true, message: '请选择该仓库组内镜像' },
        ],
        onChange: this.onImageChange,
      })
      tagProps = getFieldProps('tag', {
        rules: [
          { required: true, message: '请选择镜像版本' },
        ],
        onChange: this.onTagChange,
      })
      image = getFieldValue('image')
      tag = getFieldValue('tag')
    } else {
      imageUrlProps = getFieldProps('imageUrl', {
        rules: [
          { required: true, message: '请填写镜像地址' },
        ],
      })
    }
    let tags = []
    if (imageTags && imageTags[`${harborProject}/${image}`]) {
      tags = imageTags[`${harborProject}/${image}`].tag || []
    }
    let imageConfig = {}
    if (imageTagConfig && imageTagConfig[tag]) {
      imageConfig = imageTagConfig[tag] || {}
    }
    let cmd = imageConfig.cmd
    let containerPorts = imageConfig.containerPorts
    let mountPath = imageConfig.mountPath || {}
    mountPath = Object.keys(mountPath)
    return (
      <div>
        <FormItem
          {...formItemLayout}
          wrapperCol={{ span: 8 }}
          label="选择镜像(FROM)"
        >
          <Select
            placeholder="选择仓库组"
            {...harborProjectProps}
            showSearch
            optionFilterProp="children"
          >
            <Option key="imageUrl">填写镜像地址</Option>
            {
              (harborProjects.list || []).map(project =>  (
                  <Option key={project.name} disabled={project.name === SYSTEM_STORE}>
                    {project.name}
                  </Option>
                )
              )
            }
          </Select>
        </FormItem>
        {
          imageProps && (
            <Row>
              <Col span={formItemLayout.labelCol.span}></Col>
              <Col span={8}>
                <FormItem>
                  <Select
                    placeholder="选择该仓库组内镜像"
                    {...imageProps}
                    showSearch
                    optionFilterProp="children"
                  >
                    {
                      (repos.list || []).map(repo =>  {
                        repo = repo.replace(`${harborProject}/`, '')
                        return (
                          <Option key={repo}>
                            {repo}
                          </Option>
                        )}
                      )
                    }
                  </Select>
                </FormItem>
              </Col>
              <Col span={8} style={{paddingLeft: '16px'}}>
                <FormItem>
                  <Select
                    placeholder="选择镜像版本"
                    {...tagProps}
                    showSearch
                    optionFilterProp="children"
                  >
                    {
                      tags.map(tag => <Option key={tag}>{tag}</Option>)
                    }
                  </Select>
                </FormItem>
              </Col>
            </Row>
          )
        }
        {
          imageUrlProps && (
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 16 }}
              label=" "
            >
              <Input placeholder="填写镜像地址" {...imageUrlProps} />
            </FormItem>
          )
        }
        {
          tag && (
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 12 }}
              label=" "
            >
              <Alert
                message={
                  <div className="imageConfigs">
                    <p>
                      开放端口：
                      {
                        containerPorts && containerPorts.length > 0
                        ? containerPorts.join(', ')
                        : '无'
                      }
                    </p>
                    <p>
                      数据存储卷：
                      {
                        mountPath && mountPath.length > 0
                        ? mountPath.join(', ')
                        : '无'
                      }
                    </p>
                    <p>
                      命令：
                      {
                        cmd && cmd.length > 0
                        ? cmd.join(', ')
                        : '无'
                      }
                    </p>
                  </div>
                }
                type="success"
              />
            </FormItem>
          )
        }
      </div>
    )
  }
})

function mapStateToProps(state, ownProps) {
  const { harbor: stateHarbor, entities } = state
  const { projects, repos, imageTags, imageTagConfig } = stateHarbor
  const harborProjects = projects && projects[DEFAULT_REGISTRY] || {}

  const { cluster } =  entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    harborProjects,
    repos,
    imageTags: imageTags && imageTags[DEFAULT_REGISTRY] || {},
    imageTagConfig: imageTagConfig && imageTagConfig[DEFAULT_REGISTRY] || {},
    harbor,
  }
}

export default connect(mapStateToProps, {
  loadProjectList,
  loadProjectRepos,
  loadRepositoriesTags,
  loadRepositoriesTagConfigInfo,
})(FROM)
