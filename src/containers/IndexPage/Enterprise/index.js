/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * IndexPage
 *
 * v0.1 - 2018-08-28
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Breadcrumb, Spin } from 'antd'
import "./style/IndexPage.less"
import { GetPrivilege } from '../../../actions/overview_cluster'
import { setCurrent, loadLoginUserDetail } from '../../../actions/entities'
import Admin from '../../../components/Home/Enterprise/Admin'
import Ordinary from '../../../components/Home/Enterprise/Ordinary'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants'
import Footer from '../../../components/Home/Footer'
import Title from '../../../components/Title'
import noPermission from '../../../assets/img/noPermission.png'
import { isResourcePermissionError } from '../../../common/tools'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessages from './Intl'

class IndexPage extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    isLoading: true,
    isNoPermission: false,
  }
  async componentDidMount(){
    const {
      loadLoginUserDetail,
      loginUser,
      GetPrivilege,
      current,
    } = this.props

    let b = true
    await GetPrivilege({
      username: loginUser.info.userName,
      project: current.space.namespace,
    },{
      failed: {
        func: err => {
          if(isResourcePermissionError(err)){
            this.setState({
              isNoPermission: true,
            })
            b = false
          }
        }
      }
    })
    this.setState({
      isLoading: false,
    }, () => {
      if(b){
        if (!loginUser.info.userName) {
          loadLoginUserDetail()
        }
      }
    })
  }
  render() {
    const { isLoading, isNoPermission } = this.state
    if(isLoading){
      return <div className="loading">
        <Spin spinning={isLoading}>
        </Spin>
      </div>
    }
    if(isNoPermission){
      return (
        <div className="loading">
          <div className="noPermission">
            <img src={noPermission} />
            <div className="hint">
              <FormattedMessage {...IntlMessages.noAuth} />
            </div>
          </div>
        </div>
      )
    }
    const { current, intl } = this.props
    return (
      <div id="IndexPage">
        <Title title={intl.formatMessage(IntlMessages.overview)} />
        <Ordinary clusterName={current.cluster.clusterName} intl={intl} />
        <Footer />
      </div>
    )
  }
}

IndexPage.propTypes = {

}

function mapStateToProps(state,props) {
  const { current, loginUser } = state.entities
  return {
    current,
    loginUser,
  }
}
export default injectIntl(connect(mapStateToProps,{
  setCurrent,
  loadLoginUserDetail,
  GetPrivilege,
})(IndexPage), {
  withRef: true,
})
/*function mapStateToProps(state, props) {
  const { login, name } = props.params
  const {
    pagination: { stargazersByRepo },
    entities: { users, repos }
  } = state

  const fullName = `${login}/${name}`
  const stargazersPagination = stargazersByRepo[fullName] || { ids: [] }
  const stargazers = stargazersPagination.ids.map(id => users[id])

  return {
    fullName,
    name,
    stargazers,
    stargazersPagination,
    repo: repos[fullName],
    owner: users[login]
  }
}

export default connect(mapStateToProps, {
  loadRepo,
  loadStargazers
})(IndexPage)*/
