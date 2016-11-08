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
import { Row, Icon, Input,Form, Modal, Timeline, Spin, message, Button } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
// import ConfigFile from './ServiceConfigFile'
import { loadConfigName, updateConfigName, configGroupName, deleteConfigName ,changeConfigFile} from '../../actions/configs'
import { connect } from 'react-redux'
import { DEFAULT_CLUSTER } from '../../constants'

const FormItem= Form.Item

class CollapseContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalConfigFile: false,
      configName: '',
      configtextarea: '',
      // collapseContainer: this.props.collapseContainer

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
    if (escape(configtextarea).indexOf( '%u' ) > 0) {
      message.error('内容格式输入有误，请重新输入')
      return
    }
    const groups = { 
      group, name: this.state.configName,
      cluster: DEFAULT_CLUSTER,
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
              self.props.configGroupName(groups)
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
    const formItemLayout = {labelCol: { span: 3 },wrapperCol: { span: 21 }}
    let configFileList
    if ( collapseContainer.length === 0) {
      // message.info(this.props.groupname + '未添加配置文件')
      return (
        <div className='li' style={{lineHeight:'60px', height:'10px'}}>未添加配置文件</div>
      )
    }
    if (!collapseContainer) {
      return(
        <div className='loadingBox'>
          <Spin size='large'/>
        </div>
      )
    }

    configFileList = collapseContainer.map((configFileItem) => {
      return (
        <Timeline.Item key={configFileItem.name}>
          <Row className='file-item'>
            <div className='line'></div>
            <table>
              <tbody>
                <tr>
                  <td style={{ padding: '15px' }}>
                    <div style={{width:'180px'}} className='textoverflow'><Icon type='file-text' style={{ marginRight: '10px' }} />{configFileItem.name}</div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <Button type='primary' style={{ height: '30px', padding: '0 9px'}}
                      onClick={() => this.editConfigModal(this.props.groupname, configFileItem.name)}>
                      <Icon type='edit' />
                    </Button>
                    <Button type='ghost' onClick={() => this.deleteConfigFile(this.props.groupname, configFileItem.name)} style={{marginLeft:'10px', height: '30px', padding: '0 9px', backgroundColor: '#fff' }} className='config-cross'>
                      <Icon type='cross' />
                    </Button>
                  </td>
                  <td style={{width:'130px'}}>
                    <div className='li'>关联容器 <span className='node-number'>0</span></div>
                    <div className='lis'>挂载路径</div>
                  </td>
                  <td style={{ textAlign:'center' }}>
                    <div>暂无挂载</div>
                  </td>
                </tr>
              </tbody>
            </table>
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
          >
          <div className='configFile-inf'>
            <p className='configFile-tip' style={{ color: '#16a3ea',height:'35px', textIndent:'12px' }}>
              <Icon type='info-circle-o' style={{ marginRight: '10px' }} />
              即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置
            </p>
            <Form horizontal>
              <FormItem  {...formItemLayout} label='名称'>
                <Input type='text' className='configName' disabled={true} value={this.state.configName} />
              </FormItem>
              <FormItem {...formItemLayout} label='内容'>
                <Input type='textarea' style={{ minHeight: 100 }} value={this.state.configtextarea} onChange={(e)=> this.setInputValue(e)} />
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
  const defaultConfigList = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    configName: '',
  }
  const { configGroupList ,loadConfigName} = state.configReducers
  const { configNameList, isFetching} = configGroupList[DEFAULT_CLUSTER] || defaultConfigList
  return {
    isFetching,
    configNameList,
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
    configGroupName: (obj) => {
      dispatch(configGroupName(obj))
    },
    changeConfigFile: (configFile) => dispatch(changeConfigFile(configFile))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CollapseContainer, {
  withRef: true,
}))