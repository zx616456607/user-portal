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
import { Row, Icon, Input, Form, Modal, Timeline, Spin, message, Button } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
// import ConfigFile from './ServiceConfigFile'
import { loadConfigName, updateConfigName, configGroupName, deleteConfigName, changeConfigFile } from '../../actions/configs'
import { loadAppList } from '../../actions/app_manage'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import unionWith from 'lodash/unionWith'
import isEqual from 'lodash/isEqual'

const FormItem = Form.Item

function formatLinkContainer(data, groupname, name) {
  let linkContainer = []
  if (data.length == 0) return
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].services.length; j++) {
      if (data[i].services[j].spec.template.spec.volumes) {
        for (let k = 0; k < data[i].services[j].spec.template.spec.volumes.length; k++) {
          if (data[i].services[j].spec.template.spec.volumes[k].configMap && data[i].services[j].spec.template.spec.volumes[k].configMap.name == groupname) {
            for (let l = 0; l < data[i].services[j].spec.template.spec.volumes[k].configMap.items.length; l++) {
              if (data[i].services[j].spec.template.spec.volumes[k].configMap.items[l].key == name) {
                linkContainer.push(data[i].name)
              }
            }
          }
        }
      }

    }
  }
  return linkContainer
}

function formatVolumeMounts(data, groupname, name) {
  let volumeMounts = []
  if (data.length == 0) return
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].services.length; j++) {
      if (data[i].services[j].spec.template.spec.volumes) {
        for (let k = 0; k < data[i].services[j].spec.template.spec.volumes.length; k++) {
          if (data[i].services[j].spec.template.spec.volumes[k].configMap && data[i].services[j].spec.template.spec.volumes[k].configMap.name == groupname) {
            for (let l = 0; l < data[i].services[j].spec.template.spec.volumes[k].configMap.items.length; l++) {
              if (data[i].services[j].spec.template.spec.volumes[k].configMap.items[l].key == name) {
                for (let v = 0; v < data[i].services[j].spec.template.spec.containers[l].volumeMounts.length; v++) {
                  let others = [
                    {
                      imageName: data[i].name,
                      serviceName: data[i].services[j].metadata.name,
                      mountPath: data[i].services[j].spec.template.spec.containers[l].volumeMounts[v].mountPath
                    }
                  ]
                  volumeMounts = unionWith(volumeMounts, others, isEqual)
                }
              }
            }
          }
        }
      }

    }
  }
  return volumeMounts
}

class CollapseContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalConfigFile: false,
      configName: '',
      configtextarea: '',
      checkConfigFile: false
      // collapseContainer: this.props.collapseContainer

    }
  }
  componentWillMount() {
    // 暂时不重新加载 group file 父组件已经返回了
    const { loadAppList ,cluster} = this.props
    // this.props.loadConfigName(groupname)
    loadAppList(cluster)

  }

  editConfigModal(group, configName) {
    const groups = { group, Name: configName }

    const self = this
    const { cluster } = this.props
    this.props.loadConfigName(cluster, groups, {
      success: {
        func: (res) => {
          self.setState({
            modalConfigFile: true,
            configName: configName,
            configtextarea: res.data
          })
        },
        isAsync: true
      }
    })

  }
  editConfigFile(group) {
    const configtextarea = this.state.configtextarea
    if (escape(configtextarea).indexOf('%u') > 0) {
      message.error('内容格式输入有误，请重新输入')
      return
    }
    const groups = {
      group, name: this.state.configName,
      cluster: this.props.cluster,
      desc: configtextarea
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
    this.setState({ configtextarea: e.target.value })
  }
  deleteConfigFile(group, Name) {
    let configs = []
    configs.push(Name)
    const groups = {
      group,
      cluster: this.props.cluster,
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
            func: (res) => {
              const errorText =[]
              if (res.message.length > 0) {
                res.message.forEach(function(list){
                  errorText.push({
                    name: list.name,
                    text: list.error
                  })
                })
                const content = errorText.map(list => {
                  return (
                    <h3>{list.name} ：{list.text}</h3>
                  )
                })
                Modal.error({
                  title:'删除配置文件失败!',
                  content
                })
              } else {
                message.success('删除配置文件成功')
                self.props.configGroupName(groups)
              }
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
    const { collapseContainer, groupname } = this.props
    const self = this
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 21 } }
    let configFileList
    if (collapseContainer.length === 0) {
      // message.info(this.props.groupname + '未添加配置文件')
      return (
        <div className='li' style={{ lineHeight: '60px', height: '10px' }}>未添加配置文件</div>
      )
    }
    if (!collapseContainer) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }

    configFileList = collapseContainer.map((configFileItem) => {
      let mounts = null
      let volume = null
      let imageName = ''
      if (self.props.appList && self.props.appList.length > 0) {
        imageName = formatLinkContainer(self.props.appList, groupname, configFileItem.name)
        if (imageName.length ==0) {
          volume = (<td style={{ textAlign: 'center' }}>
            <div>暂无挂载</div>
          </td>
          )
        } else {
          mounts = formatVolumeMounts(self.props.appList, groupname, configFileItem.name)
          volume = mounts.slice(0, 2).map((list, index) => {
            return (
              <td key={`key@${index}`}>
                <div className="li">应用：<Link to={`/app_manage/detail/${list.imageName}`}>{list.imageName}</Link>，服务名称：{list.serviceName}</div>
                <div className='lis'>{list.mountPath}</div>
              </td>

            )
          })
        }
      } else {
        volume = (
          <td style={{ textAlign: 'center' }}>
            <div>暂无挂载</div>
          </td>
        )
      }
      return (
        <Timeline.Item key={configFileItem.name}>
          <Row className='file-item'>
            <div className='line'></div>
            <table>
              <tbody>
                <tr>
                  <td style={{ padding: '15px' }}>
                    <div style={{ width: '160px' }} className='textoverflow'><Icon type='file-text' style={{ marginRight: '10px' }} />{configFileItem.name}</div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <Button type='primary' style={{ height: '30px', padding: '0 9px' }}
                      onClick={() => this.editConfigModal(this.props.groupname, configFileItem.name)}>
                      <Icon type='edit' />
                    </Button>
                    <Button type='ghost' onClick={() => this.deleteConfigFile(this.props.groupname, configFileItem.name)} style={{ marginLeft: '10px', height: '30px', padding: '0 9px', backgroundColor: '#fff' }} className='config-cross'>
                      <Icon type='cross' />
                    </Button>
                  </td>
                  <td style={{ width: '130px' }}>
                    <div className='li'>关联服务 <span className='node-number'>{Array.from(new Set(imageName)).length}</span></div>
                    <div className='lis'>挂载路径</div>
                  </td>
                  { volume }

                  {(mounts && mounts.length > 2) ?
                    [<td style={{ textAlign: 'center' }}>
                      <div style={{cursor:'pointer'}} onClick={()=> {this.setState({[this.props.groupname + configFileItem.name]: true})}}>查看更多</div>
                    </td>]
                    :null
                  }
                </tr>
              </tbody>
            </table>
            <Modal
              title={`配置文件 ${configFileItem.name}`}
              wrapClassName="server-check-modal"
              visible={this.state[this.props.groupname + configFileItem.name]}
              onCancel={() => { this.setState({ [this.props.groupname + configFileItem.name]: false }) } }
              >
              <div className="check-config-head">
                <div className="span4">容器名称</div>
                <div className="span6">挂载路径</div>
              </div>
                {/*查看更多-关联容器列表-start*/}
                {mounts && mounts.slice(2).map((list) => {
                  return (
                    <div className="check-config">
                      <div className="span4"><Link to={`/app_manage/detail/${list.imageName}`}>{list.imageName}</Link></div>
                      <div className="span6">{list.mountPath}</div>
                    </div>
                  )
                })}
                {/*查看更多-关联容器列表*-end*/}
            </Modal>
          </Row>
        </Timeline.Item>
      )

    })
    return (
      <Row className='file-list'>
        <Timeline>
          {configFileList}
        </Timeline>
        {/*                     修改配置文件-弹出层-start     */}
        <Modal
          title='修改配置文件'
          wrapClassName='configFile-create-modal'
          visible={this.state.modalConfigFile}
          onOk={() => this.editConfigFile(this.props.groupname)}
          onCancel={() => { this.setState({ modalConfigFile: false }) } }
          width = "800"
          >
          <div className='configFile-inf'>
            <p className='configFile-tip' style={{ color: '#16a3ea', height: '35px', textIndent: '12px' }}>
              &nbsp;&nbsp;&nbsp;<Icon type='info-circle-o' style={{ marginRight: '10px' }} />
              即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置
            </p>
            <Form horizontal>
              <FormItem  {...formItemLayout} label='名称'>
                <Input type='text' className='configName' disabled={true} value={this.state.configName} />
              </FormItem>
              <FormItem {...formItemLayout} label='内容'>
                <Input type='textarea' style={{ minHeight: 300 }} value={this.state.configtextarea} onChange={(e) => this.setInputValue(e)} />
              </FormItem>
            </Form>
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
  const { cluster } = state.entities.current
  const defaultConfigList = {
    isFetching: false,
    cluster: cluster.clusterID,
    configName: '',
  }
  const { configGroupList, loadConfigName} = state.configReducers
  const { configNameList, isFetching} = configGroupList[cluster.clusterID] || defaultConfigList
  const { appItems } = state.apps
  const { appList } = appItems[cluster.clusterID] || []
  return {
    cluster: cluster.clusterID,
    isFetching,
    configNameList,
    appList
  }
}

export default connect(mapStateToProps, {
  loadConfigName,
  updateConfigName,
  deleteConfigName,
  configGroupName,
  loadAppList

})(injectIntl(CollapseContainer, {
  withRef: true,
}))