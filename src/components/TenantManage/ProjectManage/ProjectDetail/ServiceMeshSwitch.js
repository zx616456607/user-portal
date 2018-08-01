import React from 'react';
import ServiceMeshForm from './ServiceMeshForm';
import { Switch, Tooltip, Icon  } from 'antd';
import { connect } from 'react-redux';
import { getDeepValue } from '../../../../../client/util/util'
import * as projectActions from '../../../../actions/serviceMesh';

const mapStatetoProps = (state) => {
  // const role = getDeepValue( state, ['entities','loginUser','info', 'role'] )
  const msaConfig = getDeepValue( state, ['entities','loginUser','info','msaConfig', 'url'])
  return ({
    msaConfig,
  })
}
@connect(mapStatetoProps, {
  checkProInClusMesh: projectActions.checkProInClusMesh,
  checkClusterIstio: projectActions.checkClusterIstio,
})
export default class ServiceMeshSwitch extends React.Component {
  state = {
    Switchchecked: false,
    serviceMesh: false,
    userType: undefined,
  }
  componentDidMount = async () => {
    const { checkProInClusMesh, checkClusterIstio } = this.props
    const { msaConfig, clusterId, projectDetail} = this.props
    if (!msaConfig) {
      this.setState({ userType: 2 })
      return
    }
    const result2 = await checkClusterIstio({ clusterID: clusterId })
    const statusCode = getDeepValue(result2, ['response', 'result', 'data', 'code'])
    console.log('statusCode', statusCode)
    if (statusCode !== 200) {
      this.setState({ userType: 3 })
      return
    }
    const newNameSpace = projectDetail && projectDetail.namespace;
    const result1 = await checkProInClusMesh({ clusterID: clusterId, namespace: newNameSpace });
    console.log('result1', result1)
    const result1Data = getDeepValue(result1, ['response', 'result',]);
    console.log('result1Data', result1Data)
    if (result1Data.data === true) {
      this.setState({ Switchchecked: true, userType: 1 })
      return
    }
    if(result1Data.data === false){
      this.setState({ Switchchecked: false, userType: 1 })
    }

  }
  SwitchOnChange = checked => {
    this.setState({ Switchchecked: checked})
    this.setState({ serviceMesh: true })
  }
  render() {
    const { Switchchecked, serviceMesh, userType = 1 } = this.state
    const { clusterId } = this.props
    return (
      <div>
        {
          userType === 1 &&
            <div><Switch checkedChildren="开" unCheckedChildren="关" checked={Switchchecked}
              onChange={this.SwitchOnChange}/>
              <span style={{ paddingLeft: '12px', fontSize: '14px' }}>
                <Tooltip title="项目开通服务网格，表示项目中所有服务均被开启服务网格，项目中所有服务服务
                              将由服务网格代理，使用微服务中心提供的治理功能">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
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
        clusterId={ clusterId }
        />
      </div>
    )
  }
}