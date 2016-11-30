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

function loadSpaces(props, callback) {
  const { loadUserTeamspaceList } = props
  loadUserTeamspaceList('default', { size: 100 }, callback)
}
class CostRecord extends Component{
  constructor(props){
    super(props)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.state = {
      spacesVisible: false,
      clustersVisible: false,
      focus: false,
    }
  }
  handleSpaceChange(space) {
    const { loadTeamClustersList, setCurrent, current } = this.props
    setCurrent({
      team: { teamID: space.teamID },
      space,
    })
    loadTeamClustersList(space.teamID, { size: 100 }, {
      success: {
        func: (result) => {
          if (result.data.length < 1) {
            setCurrent({
              cluster: {}
            })
          }
        },
        isAsync: true
      }
    })
    this.setState({
      spacesVisible: false,
      clustersVisible: true,
    })
  }
  componentWillMount() {
    const {
      loadTeamClustersList,
      setCurrent,
      loadLoginUserDetail,
      loginUser,
    } = this.props
    const config = getCookie(USER_CURRENT_CONFIG)
    const [teamID, namespace, clusterID] = config.split(',')
    setCurrent({
      team: { teamID },
      space: { namespace },
      cluster: { clusterID },
    })
    const self = this
    loadSpaces(this.props, {
      success: {
        func: (resultT) => {
          let defaultSpace = resultT.teamspaces[0] || {}
          if (namespace === 'default') {
            defaultSpace = {
              spaceName: '我的空间',
              namespace: 'default',
              teamID,
            }
          } else {
            resultT.teamspaces.map(space => {
              if (space.namespace === namespace) {
                defaultSpace = space
              }
            })
          }
          setCurrent({
            space: defaultSpace
          })
          loadTeamClustersList(defaultSpace.teamID, { size: 100 }, {
            success: {
              func: (resultC) => {
                if (!resultC.data) {
                  resultC.data = []
                }
                let defaultCluster = resultC.data[0] || {}
                resultC.data.map(cluster => {
                  if (cluster.clusterID === clusterID) {
                    defaultCluster = cluster
                  }
                })
                setCurrent({ cluster: defaultCluster })
              },
              isAsync: true
            }
          })
        },
        isAsync: true
      }
    })
  }
  render(){
    const {
      current,
      loginUser,
      isTeamspacesFetching,
      teamspaces,
      isTeamClustersFetching,
      teamClusters,
    } = this.props
    const {
      spacesVisible,
      clustersVisible,
    } = this.state
    teamspaces.map((space) => {
      space.name = space.spaceName
    })
    teamClusters.map((cluster) => {
      cluster.name = cluster.clusterName
    })
    return (
      <div id='CostRecord'>
        <Card>
          <PopSelect
              title="选择项目空间"
              btnStyle={false}
              special={true}
              visible={spacesVisible}
              list={teamspaces}
              loading={isTeamspacesFetching}
              onChange={this.handleSpaceChange}
              selectValue={current.space.spaceName || '...'}
          />
        </Card>
      </div>
    )
  }
}
function mapStateToProps (state,props) {
  const { current, loginUser } = state.entities
  const { teamspaces } = state.user
  const { teamClusters } = state.team
  return {
    current,
    loginUser,
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
  }
}
export default connect (mapStateToProps,{
  loadUserTeamspaceList,
  loadTeamClustersList,
  setCurrent,
  loadLoginUserDetail,
})(CostRecord) 