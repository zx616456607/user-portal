/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateModel component
 *
 * v0.1 - 2016-09-18
 * @author GaoJian
 * changeBy baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Card, Button, Form, Select, Menu, Tooltip } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/CreateModel.less'
import { connect } from 'react-redux'
import { GetProjectsAllClusters, ListProjects } from '../../../actions/project'
import { setCurrent } from '../../../actions/entities'
import { MY_SPACE } from '../../../constants'
import image from '../../../assets/img/app/image.png'
import imageHover from '../../../assets/img/app/imageHover.png'
import appStore from '../../../assets/img/app/appStore.png'
import appStoreHover from '../../../assets/img/app/appStoreHover.png'
import wrapManageHover from '../../../assets/img/app/wrapManageHover.png'
import wrapManage from '../../../assets/img/app/wrapManage.png'
import stackIcon from '../../../assets/img/app/stackIcon.svg'
import stackIconHover from '../../../assets/img/app/stackIconHover.svg'
import { genRandomString } from '../../../common/tools'

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option;

function loadProjects(props, callback) {
  const { ListProjects, loginUser } = props
  ListProjects({ size: 0 }, callback)
}

class CreateModel extends Component {
  constructor(props) {
    super(props)
    this.selectCreateModel = this.selectCreateModel.bind(this)
    this.spaceNameCheck = this.spaceNameCheck.bind(this)
    this.clusterNameCheck = this.clusterNameCheck.bind(this)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.handleClusterChange = this.handleClusterChange.bind(this)

    this.serviceSum = 0
    this.configureServiceKey = this.genConfigureServiceKey()
    this.state = {
      createModel: "quick",
      linkUrl: "quick_create",
      disabled: false,
      moreService: false
    }
  }

  componentWillMount() {
    const { form, current, location } = this.props
    loadProjects(this.props)
    form.setFieldsValue({
      'spaceFormCheck': current.space.namespace,
      'clusterFormCheck': current.cluster.clusterID,
    })
    const { appName, action, fromDetail } = location.query
    if (appName) {
      this.setState({moreService: true})
    }
  }

  componentWillReceiveProps(nextProps) {
    const { form, current, loadTeamClustersList } = nextProps
    if (current.space.namespace === this.props.current.space.namespace && current.cluster.clusterID === this.props.current.cluster.clusterID) {
      return
    }
    form.setFieldsValue({
      'spaceFormCheck': current.space.namespace,
      'clusterFormCheck': current.cluster.clusterID,
    })
  }
  genConfigureServiceKey() {
    this.serviceSum ++
    return `${this.serviceSum}-${genRandomString('0123456789')}`
  }
  selectCreateModel(currentSelect) {
    //user select current create model,so that current selected model's css will be change
    let linkUrl = ""
    // compose_file
    switch(currentSelect) {
      case 'quick_create': {
        linkUrl = 'quick_create'
        break
      }
      case 'store': {
        linkUrl = "app_store"
        break
      }
      case 'layout': {
        linkUrl = "compose_file"
        break
      }
      case 'deploy_wrap': {
        linkUrl = "deploy_wrap"
        break
      }
      default: linkUrl = 'quick_create'
    }

    const parentScope = this.props.scope;
    this.setState({
      createModel: currentSelect,
      linkUrl: linkUrl
    });
    parentScope.setState({
      createModel: currentSelect
    });
  }

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
  }

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
  }

  handleSpaceChange(value) {
    const { projects, GetProjectsAllClusters, setCurrent, form, current } = this.props
    let newProjects = ([MY_SPACE]).concat(projects)
    newProjects.map(project => {
      if (project.namespace === value) {
        setCurrent({
          space: project,
          team: {
            teamID: project.teamID
          }
        })
        GetProjectsAllClusters({ projectsName: project.projectName }, {
          success: {
            func: (result) => {
              if (!result.data || result.data.clusters.length === 0) {
                form.resetFields(['clusterFormCheck'])
                return
              }
              form.setFieldsValue({
                'clusterFormCheck': result.data.clusters[0].clusterID,
              })
            },
            isAsync: true
          }
        })
      }
    })
  }

  handleClusterChange(value) {
    const { projectClusters, setCurrent } = this.props
    projectClusters.map((cluster) => {
      if (cluster.clusterID === value) {
        setCurrent({
          cluster
        })
      }
    })
  }

  handleNextStep(linkUrl, e) {
    e.preventDefault()
    const { form, location } = this.props
    const { validateFields, resetFields } = form
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      let url = `/app_manage/app_create/${linkUrl}`
      const { appName, action, fromDetail } = location.query
      const urlQuery = `&action=${action}&fromDetail=${fromDetail}`
      if (this.state.moreService) {
        url+=`?appName=${appName}${urlQuery}`
      }
      if (linkUrl === 'deploy_wrap') {
        url = '/app_manage/app_create/quick_create?addWrap=true'
        if (this.state.moreService) {
          url+=`&appName=${appName}${urlQuery}`
        }
      }
      browserHistory.push(url)
    })
  }

  render() {
    const {
      form,
      projects,
      projectClusters
    } = this.props
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = form
    const { createModel, linkUrl, moreService} = this.state
    const spaceFormCheck = getFieldProps('spaceFormCheck', {
      rules: [
        { validator: this.spaceNameCheck }
      ],
      onChange: this.handleSpaceChange
    })
    const clusterFormCheck = getFieldProps('clusterFormCheck', {
      rules: [
        { validator: this.clusterNameCheck }
      ],
      onChange: this.handleClusterChange
    })
    return (
      <QueueAnim
        id="CreateModel"
        type="right"
        >
        <div className="CreateModel" key="CreateModel">
          <div className="topBox">
            <div className="contentBox">
              <div className={createModel == "quick" ? "fastCreate commonBox selectedBox" : "fastCreate commonBox"} onClick={this.selectCreateModel.bind(this, "quick")}>
                <img src={createModel == "quick" ? imageHover : image} />
                <div className="infoBox">
                  <p>镜像仓库</p>
                  <span>通过镜像仓库创建应用</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              { moreService ?
              <Tooltip title='添加服务暂不支持应用商店方式'>
              <div className="appStore disabled">
                <img src={appStore} />
                <div className="infoBox">
                  <p>应用商店</p>
                  <span>通过应用商店创建应用</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              </Tooltip>
              :
              <div className={createModel == "store" ? " commonBox selectedBox" : " commonBox"} onClick={this.selectCreateModel.bind(this, "store")}>
                <img src={createModel == "store" ? appStoreHover : appStore} />
                <div className="infoBox">
                  <p>应用商店</p>
                  <span>通过应用商店创建应用</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>

              }
              <div className={createModel == "deploy_wrap" ? "deploy_wrap commonBox selectedBox" : "deploy_wrap commonBox"} onClick={this.selectCreateModel.bind(this, "deploy_wrap")}>
                <img src={createModel == "deploy_wrap" ? wrapManageHover : wrapManage} />
                <div className="infoBox">
                  <p>应用包部署</p>
                  <span>通过应用包文件创建应用</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              {moreService ?
              <Tooltip title='添加服务暂不支持编排文件方式'>
              <div className='otherStack'>
                <img src={stackIcon} className="stackIcon" />
                编排文件
              </div>
              </Tooltip>
              :
              <Button type={createModel=='layout' ? 'primary':'ghost'} className='stack' onClick={()=> this.selectCreateModel('layout')}>
                <img src={createModel == 'layout' ? stackIconHover : stackIcon} className="stackIcon" />
                编排文件
              </Button>
              }

            </div>
          </div>
          <div className="envirBox">
            <Form>
              <FormItem hasFeedback key="space" style={{ minWidth: '220px' }}>
                <span>部署环境</span>
                <Select size="large"
                  placeholder="请选择项目"
                  style={{ width: 150 }}
                  disabled={moreService}
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
              <FormItem hasFeedback key="cluster">
                <Select size="large"
                  placeholder="请选择集群"
                  disabled={moreService}
                  style={{ width: 150 }}
                  {...clusterFormCheck}>
                  {
                    projectClusters.map(cluster => {
                      return (
                        <Option key={cluster.clusterID} value={cluster.clusterID}>
                          {cluster.clusterName}
                        </Option>
                      )
                    })
                  }
                </Select>
              </FormItem>
            </Form>
          </div>
          <div className="bottomBox">
            <Link to="/app_manage">
              <Button size="large">
                取消
              </Button>
            </Link>
            <Button onClick={this.handleNextStep.bind(this, linkUrl)} size="large" type="primary" disabled={this.state.disabled}>
              下一步
            </Button>
          </div>
        </div>
      </QueueAnim>
    )
  }
}

CreateModel.propTypes = {
  // Injected by React Router
}
CreateModel = createForm()(CreateModel)

function mapStateToProps(state, props) {
  const { current } = state.entities
  const { projectList, projectClusterList } = state.projectAuthority
  const projects = projectList.data || []
  const currentNamespace = current.space.namespace
  const currentProjectClusterList = projectClusterList[currentNamespace] || {}
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
  GetProjectsAllClusters,
  ListProjects,
  setCurrent,
})(CreateModel)