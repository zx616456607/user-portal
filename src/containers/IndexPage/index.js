import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Breadcrumb } from 'antd'
import "./style/IndexPage.less"

export default class IndexPage extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="home">
      <div className="leftBox">
        <div className="app commonImg">
        	<img src="/img/test/app.png" />
        </div>
        <div className="docker commonImg">
        	<img src="/img/test/docker.png" />
        </div>
        <div className="todayLog commonImg">
        	<img src="/img/test/todayLog.png" />
        </div>
        <div className="storage commonImg">
        	<img src="/img/test/storage.png" />
        </div>      
      </div>
      <div className="rightBox">
        <div className="image commonImg">
        	<img src="/img/test/image.png" />
        </div>
        <div className="alert commonImg">
        	<img src="/img/test/alert.png" />
        </div>        
      </div>
        <div className="resource commonImg">
        	<img src="/img/test/resource.png" />
        </div>
        <div className="checkLog commonImg">
        	<img src="/img/test/checkLog.png" />
        </div>
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
