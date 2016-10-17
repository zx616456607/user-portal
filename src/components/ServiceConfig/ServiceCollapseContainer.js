/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  config group list
 *
 * v2.0 - 2016/9/23
 * @author ZhaoXueYu  BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Row, Icon, Input, Modal, Timeline, Spin, message, Button } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
// import ConfigFile from './ServiceConfigFile'
import { loadConfigName, updateConfigName, configGroupName, deleteConfigName } from '../../actions/configs'
import { connect } from 'react-redux'
import { DEFAULT_CLUSTER } from '../../constants'

class CollapseContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalConfigFile: false,
      configName: '',
      configtextarea: ''

    }
  }
  componentWillMount() {
    // 暂时不重新加载 group file 父组件已经返回了 
    // const { groupname } = this.props
    // this.props.loadConfigName(groupname) 

  }

  editConfigModal(group, configName) {
    const groups = { group, Name: configName }
    
    const self = this
    this.props.loadConfigName(groups, {
      success: {
        func: () => {
          self.setState({
            modalConfigFile: true,
            configName: configName,
            configtextarea: self.props.configDesc
          })
        },
        isAsync: true
      }
    })

  }
  editConfigFile(group) {
    const groups = { 
      group, name: this.state.configName,
      cluster: DEFAULT_CLUSTER,
      desc: this.state.configtextarea
    }
    const {parentScope} = this.props
    this.props.updateConfigName(groups, {
      success: {
        func: () => {
          this.setState({
            modalConfigFile: false,
          })
          message.success('修改配置文件成功')
        },
        isAsync: true
      }
    })
  }
  setInputValue(e) {
    this.setState({configtextarea: e.target.value})
  }
  deleteConfigFile(group, Name) {
    let configs = []
    configs.push(Name)
    const groups = {
      group,
      cluster: DEFAULT_CLUSTER,
      configs
    }
    const self = this
    const {parentScope} = this.props
    Modal.confirm({
      title: '您是否确认要删除这项内容',
      content: Name,
      onOk() {
        self.props.deleteConfigName(groups, {
          success: {
            func: () => {
              message.success('删除配置文件成功')
              self.props.configGroupName(groups, {
                success: {
                  func: ()=>{
                    parentScope.setState({
                      List: self.props.configName,
                      Size: self.props.configName.length
                    })
                  },
                  isAsync: true
                }
              })
            },
            isAsync: true
          }
        })

      },
      onCancel() {
        return
      }
    });
  }
  render() {
    const { collapseContainer } = this.props
    const configNameList = this.props.configName
    let configFileList
    if ( collapseContainer.length === 0) {
      // message.info(this.props.groupname + '未添加配置文件')
      return (
        <div className="li">未添加配置文件</div>
      )
    }
    if (!collapseContainer) {
      return(
        <div className="loadingBox">
          <Spin />
        </div>
      )
    }

    configFileList = collapseContainer.map((configFileItem) => {
      return (
        <Timeline.Item key={configFileItem.name}>
          <Row className="file-item">
            <div className="line"></div>
            <table>
              <tbody>
                <tr>
                  <td style={{ padding: "15px" }}>
                    <div style={{width:'180px'}} className="textoverflow"><Icon type="file-text" style={{ marginRight: "10px" }} />{configFileItem.name}</div>
                  </td>
                  <td style={{ padding: "15px" }}>
                    <Button type="primary" style={{ with: "30px", height: "30px", padding: "0 9px", marginRight: "5px" }}
                      onClick={() => this.editConfigModal(this.props.groupname, configFileItem.name)}>
                      <Icon type="edit" />
                    </Button>
                    <Button type="ghost" onClick={() => this.deleteConfigFile(this.props.groupname, configFileItem.name)} style={{ with: "30px", height: "30px", padding: "0 9px", backgroundColor: "#fff" }} className="config-cross">
                      <Icon type="cross" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </Row>
        </Timeline.Item>
      )

    })
    return (
      <Row className="file-list">
        <Timeline>
          {configFileList}
        </Timeline>
        {/*                     修改配置文件-弹出层-start     */}
        <Modal
          title="修改配置文件"
          wrapClassName="configFile-create-modal"
          visible={this.state.modalConfigFile}
          onOk={() => this.editConfigFile(this.props.groupname)}
          onCancel={() => { this.setState({ modalConfigFile: false }) } }
          >
          <div className="configFile-inf">
            <p className="configFile-tip" style={{ color: "#16a3ea" }}>
              <Icon type="info-circle-o" style={{ marginRight: "10px" }} />
              即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置
            </p>
            <span className="li">名称 : </span>
            <Input type="text" className="configName" disabled={true} value={this.state.configName} />
            <span className="li">内容 : </span>
            <Input type="textarea" style={{ minHeight: 100 }} value={this.state.configtextarea} onChange={(e)=> this.setInputValue(e)} />
          </div>
        </Modal>
        {/*              修改配置文件-弹出层-end                */}
      </Row>
    )
  }
}

CollapseContainer.propTypes = {
  // collapseContainer: PropTypes.array.isRequired,
  configGroupName: PropTypes.func.isRequired,
  loadConfigName: PropTypes.func.isRequired,
  deleteConfigName: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  groupname: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired
}
function mapStateToProps(state, props) {
  const defaultConfigList = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    configName: '',
    configDesc:''
  }
  const { configGroupName } = state.configReducers
  const { isFetching ,configName, configDesc} = configGroupName[DEFAULT_CLUSTER] || defaultConfigList
  return {
    configDesc,
    isFetching,
    configName,
  }
}
function mapDispatchToProps(dispatch) {
  return {
    loadConfigName: (obj, callback) => {
      dispatch(loadConfigName(obj, callback))
    },
    updateConfigName: (obj, callback) => {
      dispatch(updateConfigName(obj, callback))
    },
    deleteConfigName: (obj, callback) => {
      dispatch(deleteConfigName(obj, callback))
    },
    configGroupName: (obj, callback) => {
      dispatch(configGroupName(obj, callback))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CollapseContainer, {
  withRef: true,
}))