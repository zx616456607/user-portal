import React from 'react';
import ServiceMeshForm from './ServiceMeshForm';
import { Switch, Tooltip, Icon, Spin  } from 'antd';
import { connect } from 'react-redux';
import { getDeepValue } from '../../../../../client/util/util'
import * as projectActions from '../../../../actions/serviceMesh';
import { checkPluginsInstallStatus } from '../../../../actions/project'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN } from '../../../../../constants/index'
import * as TprojectActions from '../../../../actions/project'
const mapStatetoProps = (state) => {
  // const role = getDeepValue( state, ['entities','loginUser','info', 'role'] )
  const msaConfig = getDeepValue( state, ['entities','loginUser','info','msaConfig', 'url'])
  const role = getDeepValue(state, ['entities','loginUser','info','role'])
  return ({
    msaConfig, role
  })
}
@connect(mapStatetoProps, {
  checkProInClusMesh: projectActions.checkProInClusMesh,
  checkPluginsInstallStatus,
  GetProjectsDetail: TprojectActions.GetProjectsDetail
})
export default class ServiceMeshSwitch extends React.Component {
  state = {
    currentSwitchchecked: false,
    Switchchecked: false,
    serviceMesh: false,
    userType: undefined,
    disabled: true,
  }
  async componentDidMount(){
    this.reload()
    if (this.props.role === ROLE_SYS_ADMIN || this.props.role === ROLE_PLATFORM_ADMIN) {
      return this.setState({ disabled: false })
    }
    const res = await this.props.GetProjectsDetail({ projectsName: this.props.projectName })
    const outlineRoles = getDeepValue(res, [ 'response', 'result', 'data', 'outlineRoles' ]) || []
    if (outlineRoles.includes('manager')) {
      this.setState({ disabled: false })
    }
  }
  reload = async () => {
    const { checkProInClusMesh, checkPluginsInstallStatus } = this.props
    const { msaConfig, clusterId, projectDetail, projectName } = this.props
    if (!msaConfig) {
      this.setState({ userType: 2 })
      return
    }
    const result2 = await checkPluginsInstallStatus({ clusterID: clusterId }, projectName)
    const statusCode = getDeepValue(result2, ['response', 'result', 'data', 'istio', 'code'])
    if (statusCode !== 200) {
      this.setState({ userType: 3 })
      return
    }
    const newNameSpace = projectDetail && projectDetail.namespace;
    const result1 = await checkProInClusMesh(newNameSpace, clusterId);
    const { istioEnabled = false } = (result1.response || {}).result
    if (istioEnabled === true) {
      this.setState({ Switchchecked: true, currentSwitchchecked: true, userType: 1 })
      return
    }
    this.setState({ Switchchecked: false, currentSwitchchecked: false, userType: 1 })
  }
  SwitchOnChange = checked => {
    this.setState({ Switchchecked: checked})
    this.setState({ serviceMesh: true })
  }
  render() {
    const { Switchchecked, serviceMesh, userType = 1, currentSwitchchecked } = this.state
    const { clusterId, projectDetail: { namespace } = {}, displayName, projectDetail } = this.props
    return (
      <div>
        {
          userType === 1 &&
            <div><Switch checkedChildren="开" unCheckedChildren="关" checked={currentSwitchchecked}
              onChange={this.SwitchOnChange}
              disabled={this.state.disabled}
              />
              {
                !currentSwitchchecked &&
              <span style={{ paddingLeft: '6px', fontSize: '14px' }}>
                <Tooltip title="开启后，将允许该项目的该集群中所有服务开启／关闭服务网格">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
              }
            </div>
        }
        {
          userType === 2 && <span>当前平台未配置微服务治理套件，请联系基础设施管理员配置
          </span>
        }
        {
          userType === 3 && <span>该集群未安装 istio，请联系基础设施管理员安装</span>
        }
        <ServiceMeshForm visible={serviceMesh} onClose={()=>this.setState({ serviceMesh: false})}
        ModalType={Switchchecked} SwitchOnChange={(value) => this.setState({ Switchchecked: value })}
        clusterId={ clusterId } namespace={namespace} clusterName={this.props.clusterName}
        reload={this.reload}
        />
      </div>
    )
  }
}
