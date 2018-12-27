import React from 'react'
import { Switch, Modal, Tooltip } from 'antd'
import { connect } from 'react-redux'
import './style/DubboSwitch.less'
import { getPluginStatus, pluginTurnOff, pluginTurnOn, checkPluginsInstallStatus } from '../../../../../actions/project'
import { getRegisteredServiceList } from '../../../../../actions/cluster'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN } from '../../../../../../constants'
import Ellipsis from '@tenx-ui/ellipsis/lib/index'
import '@tenx-ui/ellipsis/assets/index.css'
import {getDeepValue} from "../../../../../../client/util/util";

@connect(state => {
  const role = getDeepValue(state, ['entities','loginUser','info','role'])
  return {
    role
  }
}, {
  getPluginStatus,
  pluginTurnOn,
  pluginTurnOff,
  checkPluginsInstallStatus,
  getRegisteredServiceList
})
class DubboSwitch extends React.Component {
  state = {
    dubboSwitchChecked: false,
    dubboOperatorDisabled: false,
    dubboModal: false,
    dubboModalContent: {
      title: '关闭操作',
      text: '关闭后，项目对应集群不支持创建 Dubbo 服务。',
      isConfirm: '确认是否关闭'
    },
    dubboServices: [],
    disabled: true,

  }
  async componentDidMount() {
    const { clusterID, getPluginStatus, projectName, checkPluginsInstallStatus, role } = this.props
    checkPluginsInstallStatus({ clusterID }, projectName, {
      success: {
        func: res => {
          if (res.data.dubboOperator.message === "uninstalled") {
            this.setState({ dubboOperatorDisabled: true })
          } else {
            setTimeout(() => {
              getPluginStatus({ clusterID }, projectName, {
                success: {
                  func: res => {
                    if (res.data.dubboOperator) {
                      this.setState({dubboSwitchChecked: true})
                    } else {
                      this.setState({dubboSwitchChecked: false})
                    }
                  }
                }
              })
            })

          }
        }
      }
    })
    if (role === ROLE_SYS_ADMIN || role === ROLE_PLATFORM_ADMIN) {
      return this.setState({ disabled: false })
    }
    const res = await this.props.GetProjectsDetail({ projectsName: this.props.projectName })
    const outlineRoles = getDeepValue(res, [ 'response', 'result', 'data', 'outlineRoles' ]) || []
    if (outlineRoles.includes('manager')) {
      this.setState({ disabled: false })
    }

  }
  dubboSwitchChange = () => {
    const { clusterID, projectName, getRegisteredServiceList } = this.props
    this.setState({
      dubboModal: true,
    })
    let content
    if (!this.state.dubboSwitchChecked) {
      content = {
        title: '开启操作',
        text: '开启后，项目对应集群支持创建 Dubbo 服务。',
        isConfirm: '确认是否开启'
      }
    }else {
      content = {
        title: '关闭操作',
        text: '加载服务列表中...',
        isConfirm: '请稍后'
      }
      getRegisteredServiceList(clusterID, projectName, {
        success: {
          func: res => {
            this.setState({
              dubboServices: res.data
            }, () => {
              if (this.state.dubboServices.length !== 0) {
                content = {
                  title: '关闭操作',
                  text: '项目对应的集群中存在以下Dubbo服务， 请删除这些服务后，方可执行关闭操作',
                  isConfirm: '',
                  services: this.state.dubboServices
                }
              } else {
                content = {
                  title: '关闭操作',
                  text: '关闭后，项目对应集群不支持创建 Dubbo 服务。',
                  isConfirm: '确认是否关闭'
                }
              }
              this.setState({
                dubboModalContent: content
              })
            })
          }
        }
      })
    }
    this.setState({
      dubboModalContent: content
    })

  }
  confirmChangeDubbo = () => {
    const { pluginTurnOff, pluginTurnOn, clusterID, projectName } = this.props
    const { dubboServices } = this.state
    if (this.state.dubboSwitchChecked) {
      if (dubboServices.length !== 0) {
        this.setState({
          dubboModal: false,
        })
        return
      }
      pluginTurnOff('dubbo-operator', { clusterID }, projectName, {
        success: {
          func: res => {
            if (res.status === 'Success') {
              this.setState({
                dubboSwitchChecked: false,
              })
            }
          }
        },
      })
    } else {
      pluginTurnOn('dubbo-operator', { clusterID }, projectName, {
        success: {
          func: res => {
            if (res.status === 'Success') {
              this.setState({
                dubboSwitchChecked: true,
              })
            }
          }
        },
      })
    }
    this.setState({
      dubboModal: false,
    })
  }

  render() {
    const { dubboOperatorDisabled, dubboModal, dubboModalContent, dubboSwitchChecked } = this.state
    return <div className="dubboSwitch">
      {
        !dubboOperatorDisabled ?
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            checked={this.state.dubboSwitchChecked}
            onChange={ e => {this.dubboSwitchChange(e)}}
            disabled={this.state.disabled}
          />
          :
          <Tooltip title="该集群未安装 dubbo-operator 插件，请联系基础设施管理员安装">
            <span className="dubbo-operator-tip">
              该集群未安装 dubbo-operator 插件，请联系基础设施管理员安装
            </span>
          </Tooltip>
      }
      <Modal
        visible={dubboModal}
        title={dubboModalContent.title}
        onOk={this.confirmChangeDubbo}
        onCancel={() => this.setState({dubboModal: false})}
      >
        {
          dubboModal &&
          <div className="projectDetailDubboSwitchModal">
            <div className={dubboSwitchChecked ? "alert turnOff" : "alert"}>
              <div>
                <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
              </div>
              <div>
                <div>{dubboModalContent.text}</div>
                <div>{dubboModalContent.isConfirm}</div>
              </div>
            </div>
            {
              dubboModalContent.services && <div className="services-wrapper">
                <h4>服务名</h4>
                <ul className="services">
                  {
                    dubboModalContent.services.map(v => <li key={v}>
                      <Ellipsis>
                         <span>{v}</span>
                         </Ellipsis>
                      </li>)
                  }

                </ul>
              </div>
            }

          </div>
        }
      </Modal>
    </div>
  }
}

export default DubboSwitch
