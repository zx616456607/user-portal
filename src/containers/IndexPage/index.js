import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Breadcrumb } from 'antd'
import "./style/IndexPage.less"
import Admin from '../../components/Home/Admin'
import Ordinary from '../../components/Home/Ordinary'
import { setCurrent, loadLoginUserDetail } from '../../actions/entities'

class IndexPage extends Component {
  constructor(props) {
    super(props)
    
  }
  componentDidMount(){
    const {
      loadTeamClustersList,
      setCurrent,
      loadLoginUserDetail,
      loginUser,
    } = this.props
    if (!loginUser.info.userName) {
      loadLoginUserDetail()
    }
  }
  render() {
    const { loginUser,current } = this.props
    console.log('------------------------------------------------');
    console.log('current',current);
    console.log('loginUser.info.role',loginUser.info.role);
    console.log('current.space.spaceName',current.space.spaceName);
    console.log('------------------------------------------------');
    if(current.space.spaceName){
      if(loginUser.info.role === 1 && current.space.namespace !== 'default'){
        return (
          <div id="IndexPage">
            <Admin spaceName={current.space.spaceName}/>
            <Ordinary spaceName={current.space.spaceName} clusterName={current.cluster.clusterName}/>
          </div>
        )
      }
    }
    return (
      <div id="IndexPage">
        <Ordinary spaceName={current.space.spaceName} clusterName={current.cluster.clusterName}/>
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
export default connect (mapStateToProps,{
  setCurrent,
  loadLoginUserDetail,
})(IndexPage)
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
