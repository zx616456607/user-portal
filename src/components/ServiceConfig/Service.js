/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/22
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { Row, Col, Modal, Button, Icon, Collapse, Input, Spin } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/ServiceConfig.less'
import QueueAnim from 'rc-queue-anim'
import { validateK8sResource } from '../../common/naming_validation'
import CollapseHeader from './ServiceCollapseHeader'
import CollapseContainer from './ServiceCollapseContainer'
import NotificationHandler from '../../common/notification_handler'
import { connect } from 'react-redux'
import remove from 'lodash/remove'
import { loadConfigGroup, configGroupName, createConfigGroup, deleteConfigGroup } from '../../actions/configs'
import noConfigGroupImg from '../../assets/img/no_data/no_config.png'

class CollapseList extends Component {
  constructor(props) {
    super(props)
  }
  loadData(props) {
    const { loadConfigGroup, cluster} = props
    const self = this
    loadConfigGroup(cluster)
  }
  componentWillMount() {
    document.title = '服务配置 | 时速云'
    this.loadData(this.props)
  }
  // componentWillReceiveProps(nextProps) {
  //   console.log('nextProps',nextProps)
  //   this.setState({
  //     configNameList: nextProps.configNameList,
  //     sizeNumber: nextProps.sizeNumber
  //   })
  // }
  loadConfigGroupname(Name) {
    if (Name) {
      const groupName = {
        cluster: this.props.cluster,
        group: Name
      }
      this.props.configGroupName(groupName)
    }
  }

  render() {
    const {groupData, isFetching} = this.props
    const scope = this
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (groupData.length === 0) {
      return (
        <div className="text-center">
          <img src={noConfigGroupImg} />
          <div>您还没有配置组，创建一个吧！<Button type="primary" size="large" onClick={() => this.props.scope.configModal(true)}>创建</Button></div>
        </div>
      )
    }
    let groups = groupData.map((group) => {
      return (
        <Collapse.Panel
          header={
            <CollapseHeader
              parentScope={scope}
              btnDeleteGroup={this.props.btnDeleteGroup}
              handChageProp={this.props.handChageProp}
              collapseHeader={group}
              sizeNumber={group.size}
              />
          }
          handChageProp={this.handChageProp}
          configChecnkBox={this.props.configChecnkBox}
          key={group.name}
          >
          <CollapseContainer
            parentScope={scope}
            collapseContainer={group.configs}
            groupname={group.name} />
        </Collapse.Panel>
      )
    })
    return (
      <Collapse accordion>
        {groups}
      </Collapse>
    )
  }
}

CollapseList.propTypes = {
  groupData: PropTypes.array.isRequired
}

class Service extends Component {
  constructor(props) {
    super(props)
    this.state = {
      createModal: false,
      myTextInput: '',
      configArray: []
    }
  }

  configModal(visible) {
    if (visible) {
      this.setState({
        createModal: visible,
        myTextInput: '',
      })
      setTimeout(() => {
        this.nameInput.refs.input.focus()
      })
    } else {
      this.setState({
        createModal: false,
        myTextInput: '',
      })
    }
  }
  createModalInput(e) {
    this.setState({
      myTextInput: e.target.value
    })
  }
  btnCreateConfigGroup() {
    let notification = new NotificationHandler()
    let groupName = this.state.myTextInput
    if (!groupName) {
      notification.error('请输入配置组名称')
      return
    }
    if (!validateK8sResource(groupName)) {
      notification.error('名称须以字母开头，由小写英文字母、数字和连字符（-）组成，长度为 3-63 个字符')
      return
    }
    let self = this
    const { cluster } = this.props
    let configs = {
      groupName,
      cluster
    }
    this.props.createConfigGroup(configs, {
      success: {
        func: () => {
          notification.success('创建成功')
          self.setState({
            createModal: false,
            myTextInput: ''
          })
          self.props.loadConfigGroup(cluster)
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let errorText
          switch (res.message.code) {
            case 403: errorText = '添加的配置过多'; break
            case 409: errorText = '配置组已存在'; break
            case 500: errorText = '网络异常'; break
            default: errorText = '缺少参数或格式错误'
          }
          Modal.error({
            title: '创建配置组',
            content: (<h3>{errorText}</h3>),
          });
        }
      }
    })

  }
  btnDeleteGroup() {
    let notification = new NotificationHandler()
    let configArray = this.state.configArray
    let cluster = this.props.cluster
    if (configArray.length <= 0) {
      notification.error('未选择要操作配置组')
      return;
    }
    const self = this
    let configData = {
      cluster,
      "groups": configArray
    }
    this.setState({delModal: false})
    self.props.deleteConfigGroup(configData, {
      success: {
        func: (res) => {
          const errorText = []
          if (res.message.length > 0) {
            res.message.forEach(function (list) {
              errorText.push({
                name: list.name,
                text: list.error
              })
            })
            const content = errorText.map(list => {
              return (
                <h3>{list.name}：{list.text}</h3>
              )
            })
            Modal.error({
              title: '删除配置组失败!',
              content
            })
          } else {
            notification.success('删除成功')
          }
          self.setState({
            configArray: []
          })
        },
        isAsync: true
      }
    })

  }
  handChageProp() {
    return (
      (e, Name) => {
        let configArray = this.state.configArray
        if (e.target.checked) {
          configArray.push(Name)
        } else {
          remove(configArray, (item) => {
            return item == Name
          })
        }
        this.setState({
          configArray
        })
      }
    )
  }
  render() {
    const {cluster, configGroup, isFetching, configName} = this.props
    return (
      <QueueAnim className="Service" type="right">
        <div id="Service" key="Service">
          <Button type="primary" size="large" onClick={(e) => this.configModal(true)}>
            <i className="fa fa-plus" /> 创建配置组
          </Button>
          <Button size="large" onClick={() => this.setState({delModal: true})} style={{ marginLeft: "12px" }}
            disabled={!this.state.configArray || this.state.configArray.length < 1}>
            <i className="fa fa-trash-o" /> 删除
          </Button>
          {/*创建配置组-弹出层-start*/}
          <Modal
            title="创建配置组"
            wrapClassName="server-create-modal"
            maskClosable={false}
            visible={this.state.createModal}
            onOk={() => this.btnCreateConfigGroup()}
            onCancel={(e) => this.configModal(false)}
            >
            <div className="create-conf-g" style={{ padding: '20px 0' }}>
              <div style={{ height: 25 }}>
                <span style={{ width: '50px', display: 'inline-block', fontSize: '14px' }}> 名称 : </span>
                <Input type="text" size="large" ref={(ref) => { this.nameInput = ref; } } style={{ width: '80%' }} value={this.state.myTextInput} onPressEnter={() => this.btnCreateConfigGroup()} onChange={(e) => this.createModalInput(e)} />
              </div>
            </div>
          </Modal>
          {/*创建配置组-弹出层-end*/}
          <Modal title="删除配置操作" visible={this.state.delModal}
          onOk={()=> this.btnDeleteGroup()} onCancel={()=> this.setState({delModal: false})}
          >
            <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除配置组 {this.state.configArray.map(item => item).join('，')} ?</div>
          </Modal>
          {/*折叠面板-start*/}
          <CollapseList
            scope={this}
            cluster={cluster}
            loadConfigGroup={this.props.loadConfigGroup}
            groupData={configGroup}
            configName={configName}
            btnDeleteGroup={this.btnDeleteGroup}
            loading={isFetching}
            handChageProp={this.handChageProp()}
            configGroupName={(obj) => this.props.configGroupName(obj)} />
          {/*折叠面板-end*/}
        </div>
      </QueueAnim>
    )
  }
}

Service.propTypes = {
  // intl: PropTypes.object.isRequired,
  cluster: PropTypes.string.isRequired,
  configGroup: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadConfigGroup: PropTypes.func.isRequired,
  createConfigGroup: PropTypes.func.isRequired,
  deleteConfigGroup: PropTypes.func.isRequired,
  configGroupName: PropTypes.func.isRequired
}

/*export default injectIntl(Service,{
  withRef: true
})*/
function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultConfigList = {
    isFetching: false,
    cluster: cluster.clusterID,
    configGroup: [],
  }
  const {
    configGroupList
  } = state.configReducers
  const {configGroup, isFetching } = configGroupList[cluster.clusterID] || defaultConfigList
  return {
    cluster: cluster.clusterID,
    configGroup,
    isFetching
  }
}
function mapDispatchToProps(dispatch) {
  return {
    loadConfigGroup: (cluster) => {
      dispatch(loadConfigGroup(cluster))
    },
    createConfigGroup: (obj, callback) => {
      dispatch(createConfigGroup(obj, callback))
    },
    deleteConfigGroup: (obj, callback) => {
      dispatch(deleteConfigGroup(obj, callback))
    },
    configGroupName: (obj) => dispatch(configGroupName(obj))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Service, {
  withRef: true,
}))



