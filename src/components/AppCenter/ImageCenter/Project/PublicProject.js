/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Table,  Button, Card, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import '../style/Project.less'
import { Link } from 'react-router'
import DataTable from './DataTable'
import { connect } from 'react-redux'
import { loadProjectList } from '../../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../constants'
import NotificationHandler from '../../../../components/Notification'

const DEFAULT_QUERY = {
  page: 1,
  page_size: 10,
  is_public: 1,
}

class PublicProject extends Component {
  constructor(props) {
    super()
    this.loadData = this.loadData.bind(this)
    this.searchProjects = this.searchProjects.bind(this)
    this.state = {
      searchInput: '',
    }
  }
  componentDidUpdate() {
    let inputSearch = document.getElementsByClassName('search')[0];
    inputSearch && inputSearch.focus()
  }
  loadData(query) {
    const { loadProjectList, harbor } = this.props
    let notify = new NotificationHandler()
    loadProjectList(DEFAULT_REGISTRY, Object.assign({}, DEFAULT_QUERY, query, { harbor }), {
      failed: {
        func: res => {
          if (res.statusCode === 500) {
            notify.error('请求错误', '镜像仓库暂时无法访问，请联系管理员')
          }
        }
      }
    })
  }

  searchProjects() {
    this.loadData({ project_name: this.state.searchInput })
  }

  componentWillMount() {
    this.loadData({
      is_public: 1,
    })
  }

  render() {
    const { harborProjects, loginUser } = this.props
    const func = {
      scope: this,
      loadData: this.loadData
    }
    return (
      <div className="imageProject">
        <br />
        <QueueAnim>
          <div key="projects">

            <Card className="project">
              <div className="topRow">
                <Input
                  placeholder="按仓库组名称搜索"
                  className="search"
                  size="large"
                  onChange={e => this.setState({ searchInput: e.target.value })}
                  onPressEnter={this.searchProjects}
                />
                <i className="fa fa-search" onClick={this.searchProjects}></i>
                {/*{harborProjects.total >0?
                <span className="totalPage">共计：{harborProjects.total} 条</span>
                :null
                }*/}
              </div>
              <DataTable loginUser={loginUser} from="public" dataSource={harborProjects} func={func}/>
            </Card>

          </div>
        </QueueAnim>
      </div>
    )
  }
}


function mapStateToProps(state, props) {
  const { harbor: stateHarbor, entities } = state
  let harborProjects = stateHarbor.projects && stateHarbor.projects[DEFAULT_REGISTRY] || {}

  const { cluster } =  entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    harborProjects,
    loginUser: entities.loginUser.info,
    harbor,
  }
}

export default connect(mapStateToProps, {
  loadProjectList,
})(PublicProject)
