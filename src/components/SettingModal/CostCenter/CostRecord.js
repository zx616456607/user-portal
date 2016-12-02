/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/30
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Icon, Button, } from 'antd'
import './style/CostRecord.less'
import PopSelect from '../../PopSelect'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../../actions/user'
import { loadTeamClustersList } from '../../../actions/team'
import { setCurrent, loadLoginUserDetail } from '../../../actions/entities'
import { getCookie } from '../../../common/tools'
import { USER_CURRENT_CONFIG } from '../../../../constants'
import TeamCost from './TeamCost'

class CostRecord extends Component{
  constructor(props){
    super(props)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.state = {
      spacesVisible: false,
      currentSpaceName: '我的空间',
      currentTeamName: '',
    }
  }
  handleSpaceChange(space) {
    const { loadTeamClustersList,loadUserTeamspaceList, setCurrent, current, loginUser } = this.props
    // this.setState({
      // isTeamspacesFetching: true
    // })
    console.log('space',space)
    // loadUserTeamspaceList(loginUser.info.userID,{ size: 100 }, {
    //   success: {
    //     func:()=>{
    //       this.setState({
    //         isTeamspacesFetching: false,
    //       })
    //     },
    //     isAsync: true
    //   }
    // })
    this.setState({
      spacesVisible: false,
      currentSpaceName: space.spaceName,
      currentTeamName: space.teamName,
    })
  }
  componentWillMount() {
    const {
      loadTeamClustersList,
      loadLoginUserDetail,
      loadUserTeamspaceList,
      loginUser,
      userDetail,
      teamspaces,
    } = this.props
    loadUserTeamspaceList(loginUser.info.userID||userDetail.userID,{ size: -1 }, {
      success: {
        func:()=>{
          console.log('teamspaces',teamspaces)
        },
        isAsync: true
      }
    })
  }
  render(){
    const {
      current,
      loginUser,
      teamspaces,
      teamClusters,
    } = this.props
    let {
      spacesVisible,
      currentSpaceName,
      currentTeamName,
    } = this.state
    console.log('---------------------------')
    console.log('current: ',current)
    console.log('loginUser: ',loginUser)
    console.log('teamspaces: ',teamspaces)
    console.log('teamClusters: ',teamClusters)
    console.log('currentSpaceName: ',currentSpaceName)
    console.log('currentTeamName: ',currentTeamName)
    console.log('---------------------------')
    return (
      <div id='CostRecord'>
        <Card style={{marginBottom: '20px'}}>
          <i className='fa fa-cube' style={{marginRight:'10px'}}/>
          <div style={{display:'inline-block'}}>
            <PopSelect
              title="选择项目空间"
              btnStyle={false}
              special={true}
              visible={spacesVisible}
              list={teamspaces}
              loading={false}
              onChange={this.handleSpaceChange}
              selectValue={ currentSpaceName }
          />
          </div>
        </Card>
        {
          (loginUser.info.role === 1 && currentTeamName)?
          <TeamCost currentSpaceName = {currentSpaceName} currentTeamName={currentTeamName}/>:
          <div></div>
        }
        <Card>
        </Card>
      </div>
    )
  }
}
function mapStateToProps (state,props) {
  const { current, loginUser } = state.entities
  const { teamspaces,userDetail } = state.user

  return {
    current,
    loginUser,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    userDetail: userDetail.result.data
  }
}
export default connect (mapStateToProps,{
  loadUserTeamspaceList,
  loadTeamClustersList,
  loadLoginUserDetail,
})(CostRecord) 