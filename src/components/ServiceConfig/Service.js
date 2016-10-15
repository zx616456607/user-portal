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
import { Row, Col, Modal, Button, Icon, Collapse, Input, message } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/ServiceConfig.less'
import QueueAnim from 'rc-queue-anim'
import CollapseHeader from './ServiceCollapseHeader'
import CollapseContainer from './ServiceCollapseContainer'
import { connect } from 'react-redux'
import { remove } from 'lodash'
import { loadConfigGroup, configGroupName, createConfigGroup, deleteConfigGroup } from '../../actions/configs'
import { DEFAULT_CLUSTER } from '../../constants'

function loadData(props) {
  const { master, loadConfigGroup } = props
  loadConfigGroup()
}

const Panel = Collapse.Panel
class CollapseList extends Component {
  constructor() {
    super()
  }
  loadConfigGroupname(Name) {
    console.log('names ', Name)
    // @ to do
    // this.props.loadConfigName(Name)
    if (Name) {
      const groupName = {
        cluster: DEFAULT_CLUSTER,
        group: Name
      }
      this.props.configGroupName(groupName)
    }
  }

  render() {
    const {groupData, configName} = this.props
    console.log('server list ', this.props)
    if (!groupData) return (<div>还没有创建过配置项</div>)
    let groups = groupData.map((group) => {
      return (
        <Panel handChageProp={this.props.handChageProp} header={<CollapseHeader handChageProp={this.props.handChageProp} collapseHeader={group} />} key={group.native.metadata.name} >
          <CollapseContainer configName={configName} configGroupName={(obj) => this.props.configGroupName(obj)} collapseContainer={group.extended.configs} groupname={group.native.metadata.name} />
        </Panel>
      )
    })
    return (
      <Collapse onChange={(groups) => this.loadConfigGroupname(groups)} accordion>
        {groups}
      </Collapse>
    )
  }
}

CollapseList.propTypes = {
  groupData: PropTypes.array.isRequired,
  // loadConfigName: PropTypes.func.isRequired
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
  componentWillMount() {
    loadData(this.props)
  }
  configModal(visible) {
    if (visible) {
      this.setState({
        createModal: visible,
        myTextInput: '',
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
    // this.setState({ createConfigGroup });
    let groupName = this.state.myTextInput
    if (!groupName) {
      message.error('请输入配置组名称')
      return
    }
    let self = this
    let configs = {
      groupName,
      cluster: DEFAULT_CLUSTER
    }
    this.props.createConfigGroup(configs, {
      success: {
        func: () => {
          message.success('创建成功')
          self.setState({
            createModal: false,
            myTextInput: ''
          })
          self.props.loadConfigGroup()
        },
        isAsync: true
      },
    })

  }
  btnDeleteGroup() {
    // console.log('props',this.props)
    let configArray = this.state.configArray
    let cluster = this.props.cluster
    let self = this
    if (configArray.length <= 0) {
      message.error('未选择要操作配置组')
      return;
    }
    let configData = {
      cluster: DEFAULT_CLUSTER,
      "groups": configArray
    }
    console.log('to delete', configData)
    Modal.confirm({
      title: '您是否确认要删除这些配置组',
      content: configArray,
      onOk() {
        self.props.deleteConfigGroup(configData, {
          success: {
            func: () => {
              message.success('删除成功')
              self.props.loadConfigGroup()
            },
            isAsync: true
          }
        })
      }
    })
  }
  handChageProp() {
    return (
      (e, Name) => {
        let configArray = this.state.configArray
        // console.log(e,Id)
        if (e.target.checked) {
          configArray.push(Name)
        } else {
          // configArray.splice(Id,1)
          remove(configArray, (item) => {
            return item == Name
          })
        }
        this.setState({
          configArray
        })
        console.log(this.state.configArray)
      }
    )
  }
  render() {
    const {cluster, configGroup, isFetching, configName} = this.props
    console.log('server in', this.props)
    return (
      <QueueAnim className="Service" type="right">
        <div id="Service" key="Service">
          <Button type="primary" onClick={(e) => this.configModal(true)} size="large">
            <Icon type="plus" />
            创建配置组
          </Button>
          <Button size="large" style={{ marginLeft: "12px" }} onClick={(e) => this.btnDeleteGroup(e)}>
            <Icon type="delete" /> 删除
          </Button>
          {/*创建配置组-弹出层-start*/}
          <Modal
            title="创建配置组"
            wrapClassName="server-create-modal"
            visible={this.state.createModal}
            onOk={() => this.btnCreateConfigGroup()}
            onCancel={(e) => this.configModal(false)}
            >
            <div className="create-conf-g">
              <div style={{ height: 25 }}>名称 : </div>
              <Input type="text" value={this.state.myTextInput} onPressEnter={() => this.btnCreateConfigGroup()} onChange={(e) => this.createModalInput(e)} />
            </div>
          </Modal>
          {/*创建配置组-弹出层-end*/}
          {/*折叠面板-start*/}
          <CollapseList groupData={configGroup} configName={configName} loading={isFetching} handChageProp={this.handChageProp()} configGroupName={(obj) => this.props.configGroupName(obj)} />
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
  const defaultConfigList = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    configGroup: [],
  }
  const {
    configGroupList,
    configGroupName
  } = state.configReducers
  const {cluster, configGroup, isFetching } = configGroupList[DEFAULT_CLUSTER] || defaultConfigList
  const { configName } = configGroupName[DEFAULT_CLUSTER] || defaultConfigList
  console.log('get configName', configName)
  return {
    cluster,
    configGroup,
    isFetching,
    configName
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



