import React from 'react'
import { Switch, Modal, Tooltip } from 'antd'
import { connect } from 'react-redux'
import './style/dubboSwitch.less'
import { getPluginStatus, pluginTurnOff, pluginTurnOn, checkPluginsInstallStatus } from '../../../../../actions/project'

@connect(state => state, {
  getPluginStatus,
  pluginTurnOn,
  pluginTurnOff,
  checkPluginsInstallStatus
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
    }

  }
  componentDidMount() {
    const { clusterID, getPluginStatus, projectName, checkPluginsInstallStatus } = this.props
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
    checkPluginsInstallStatus({ clusterID }, projectName, {
      success: {
        func: res => {
          if (res.data.dubboOperator.message === "uninstalled") {
            this.setState({ dubboOperatorDisabled: true })
          }
        }
      }
    })
  }
  dubboSwitchChange = () => {
    this.setState({
      dubboModal: true,
    })
    let turnOnContent
    if (!this.state.dubboSwitchChecked) {
      turnOnContent = {
        title: '开启操作',
        text: '开启后，项目对应集群支持创建 Dubbo 服务。',
        isConfirm: '确认是否开启'
      }
    }else {
      turnOnContent = {
        title: '关闭操作',
        text: '关闭后，项目对应集群不支持创建 Dubbo 服务。',
        isConfirm: '确认是否关闭'
      }
    }
    this.setState({
      dubboModalContent: turnOnContent
    })

  }
  confirmChangeDubbo = () => {
    const { pluginTurnOff, pluginTurnOn, clusterID, projectName } = this.props
    if (this.state.dubboSwitchChecked) {
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
        dubboOperatorDisabled ?
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            checked={this.state.dubboSwitchChecked}
            onChange={ e => {this.dubboSwitchChange(e)}}
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
          </div>
        }
      </Modal>
    </div>
  }
}

export default DubboSwitch
