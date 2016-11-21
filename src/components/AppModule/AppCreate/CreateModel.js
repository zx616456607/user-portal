/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateModel component
 *
 * v0.1 - 2016-09-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card, Button, Form, Select, Menu, } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/CreateModel.less'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../../actions/user'
import { loadTeamClustersList } from '../../../actions/team'
import { setCurrent } from '../../../actions/entities'

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option;

class CreateModel extends Component {
  constructor(props) {
    super(props)
    this.selectCreateModel = this.selectCreateModel.bind(this)
    this.spaceNameCheck = this.spaceNameCheck.bind(this)
    this.clusterNameCheck = this.clusterNameCheck.bind(this)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.handleClusterChange = this.handleClusterChange.bind(this)
    this.state = {
      createModel: "fast",
      linkUrl: "fast_create",
      disabled: false,
    }
  }

  componentWillMount() {
    const { loadUserTeamspaceList, form, current } = this.props
    loadUserTeamspaceList('default', { size: 100 })
    form.setFieldsValue({
      'spaceFormCheck': current.space.namespace,
      'clusterFormCheck': current.cluster.clusterID,
    })
  }

  componentWillReceiveProps(nextProps) {
    const { form, current, loadTeamClustersList } = nextProps
    if (current.space.namespace === this.props.current.space.namespace && current.cluster.clusterID === this.props.current.cluster.clusterID) {
      return
    }
    loadTeamClustersList(current.space.teamID, { size: 100 })
    form.setFieldsValue({
      'spaceFormCheck': current.space.namespace,
      'clusterFormCheck': current.cluster.clusterID,
    })
  }

  selectCreateModel(currentSelect) {
    //user select current create model,so that current selected model's css will be change
    let linkUrl = "";
    if (currentSelect == "fast") {
      linkUrl = "fast_create"
    } else if (currentSelect == "store") {
      linkUrl = "app_store"
    } else if (currentSelect == "layout") {
      linkUrl = "compose_file"
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
    const { teamspaces, loadTeamClustersList, setCurrent, form, current } = this.props
    teamspaces.map(space => {
      if (space.namespace === value) {
        setCurrent({
          space,
          team: {
            teamID: space.teamID
          }
        })
        loadTeamClustersList(space.teamID, { size: 100 }, {
          success: {
            func: (result) => {
              form.setFieldsValue({
                'clusterFormCheck': result.data[0].clusterID,
              })
            },
            isAsync: true
          }
        })
      }
    })
  }

  handleClusterChange(value) {
    const { teamClusters, setCurrent } = this.props
    teamClusters.map((cluster) => {
      if (cluster.clusterID === value) {
        setCurrent({
          cluster
        })
      }
    })
  }

  render() {
    const {
      form,
      isTeamspacesFetching,
      teamspaces,
      isTeamClustersFetching,
      teamClusters
    } = this.props
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = form
    const {
      createModel,
      linkUrl,
    } = this.state
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
              <div className={createModel == "fast" ? "fastCreate commonBox selectedBox" : "fastCreate commonBox"} onClick={this.selectCreateModel.bind(this, "fast")}>
                <svg className="commonImg">
                  <use xlinkHref="#appcreatefast" />
                </svg>
                <div className="infoBox">
                  <p>镜像仓库</p>
                  <span>通过镜像仓库创建应用</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={createModel == "store" ? "appStore commonBox selectedBox" : "appStore commonBox"} onClick={this.selectCreateModel.bind(this, "store")}>
                <svg className="commonImg">
                  <use xlinkHref="#appstore" />
                </svg>
                <div className="infoBox">
                  <p>应用商店</p>
                  <span>通过应用商店创建应用</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={createModel == "layout" ? "layout commonBox selectedBox" : "layout commonBox"} onClick={this.selectCreateModel.bind(this, "layout")}>
                <svg className="commonImg">
                  <use xlinkHref="#appcreatelayout" />
                </svg>
                <div className="infoBox">
                  <p>编排文件</p>
                  <span>通过编排文件创建应用</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className="envirBox">
                <Form>
                  <FormItem hasFeedback key="space">
                    <span>部署环境</span>
                    <Select size="large"
                      placeholder="请选择空间"
                      style={{ width: 150 }}
                      {...spaceFormCheck}>
                      <Option value="default">我的空间</Option>
                      {
                        teamspaces.map(space => {
                          return (
                            <Option value={space.namespace}>
                              {space.spaceName}
                            </Option>
                          )
                        })
                      }
                    </Select>
                  </FormItem>
                  <FormItem hasFeedback key="cluster">
                    <Select size="large"
                      placeholder="请选择集群"
                      style={{ width: 150 }}
                      {...clusterFormCheck}>
                      {
                        teamClusters.map(cluster => {
                          return (
                            <Option value={cluster.clusterID}>
                              {cluster.clusterName}
                            </Option>
                          )
                        })
                      }
                    </Select>
                  </FormItem>
                </Form>
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
          </div>
          <div className="bottomBox">
            <Link to="/app_manage">
              <Button size="large">
                取消
              </Button>
            </Link>
            <Link to={`/app_manage/app_create/${linkUrl}`}>
              <Button size="large" type="primary" disabled={this.state.disabled}>
                下一步
                </Button>
            </Link>
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
  const { teamspaces } = state.user
  const { teamClusters } = state.team
  return {
    current,
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
  }
}

export default connect(mapStateToProps, {
  loadUserTeamspaceList,
  loadTeamClustersList,
  setCurrent,
})(CreateModel)