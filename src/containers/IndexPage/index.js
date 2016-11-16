import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Breadcrumb } from 'antd'
import "./style/IndexPage.less"
import Admin from '../../components/Home/Admin'
import Ordinary from '../../components/Home/Ordinary'

export default class IndexPage extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="IndexPage">
        <Admin />
        <Ordinary />
      </div>
    )
  }
}

IndexPage.propTypes = {
  //
}

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
