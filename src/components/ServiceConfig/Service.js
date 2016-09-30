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
import { Row,Col,Modal,Button,Icon,Collapse,Input, message } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/ServiceConfig.less'
import QueueAnim from 'rc-queue-anim'
import CollapseHeader from './ServiceCollapseHeader'
import CollapseContainer from  './ServiceCollapseContainer'
import {groupData} from '../../constants'
import { connect } from 'react-redux'
import { remove } from 'lodash'
import {loadConfigGroup, createConfigGroup , deleteConfigGroup} from '../../actions/configs'

function loadData(props) {
  const { master, loadConfigGroup } = props
  loadConfigGroup('default')
}

const Panel = Collapse.Panel
class CollapseList extends Component{
  constructor(){
    super()
  }
  
  render() {
    let {groupData} = this.props
    if(!groupData) return (<div>还没有创建过配置项</div>)
    let groups = groupData.map((group) => {
      return (
        <Panel handChageProp={ this.props.handChageProp}  header={ <CollapseHeader handChageProp={ this.props.handChageProp} collapseHeader={group}/> }  key={group.groupId} >
          <CollapseContainer collapseContainer={group.configFile}/>
        </Panel>
      )
    })
    return (
      <Collapse defaultActiveKey={['1']}>
        {groups}
      </Collapse>
    )
  }
}

CollapseList.propTypes = {
  groupData: PropTypes.array.isRequired
}

class Service extends Component{
  constructor(props){
    super(props)
    this.state = {
      createModal: false,
      myTextInput:'',
      configArray:[]
    }
  }
  componentWillMount() {
    loadData(this.props)
  }
  configModal(visible) {
    if (visible) {
      this.setState({
        createModal: visible,
        myTextInput:'',
        focus:true
      })
    } else {
      this.setState({
        createModal:false,
        myTextInput:'',
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
    // console.log(this.props.form.getFieldsValue());
    let groupName =this.state.myTextInput
    console.log('start create group name',groupName)
    if (!groupName) {
      message.error('请输入配置组名称')
      return
    }
    let self = this
    let configs = {
      groupName,
      cluster: 'default'
    }
    this.props.createConfigGroup(configs, {
      success: {
         func: () => {
           message.info('创建成功')
           self.setState({
             createModal: false,
             myTextInput: ''
           })
           self.props.loadConfigGroup('default')
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
    let configData ={
      cluster,
      groupId:configArray
    }
    this.props.deleteConfigGroup(configData, {
      success: {
        func: () => {
           message.info('删除成功')
           self.props.loadConfigGroup('default')
          },
          isAsync: true
      }
    })

  }
  handChageProp() {
    return (
      (e,Id) => {
      let configArray = this.state.configArray
      // console.log(e,Id)
      if (e.target.checked) {
        configArray.push(Id)
      } else {
        // configArray.splice(Id,1)
        remove(configArray, (item) => {
          return item == Id
        })
      }
      this.setState({
          configArray
      })
      console.log(this.state.configArray)
      }
    )
  }
  render(){
    const {cluster, configGroup, isFetching } = this.props
    return (
      <QueueAnim className ="Service" type = "right">
        <div id="Service" key="Service">
          <Button type="primary" onClick={(e) => this.configModal(true)} size="large">
            <Icon type="plus" />
            创建配置组
          </Button>
          <Button size="large" style={{marginLeft:"12px"}} onClick={(e)=>this.btnDeleteGroup(e)}>
            <Icon type="delete" /> 删除
          </Button>
          {/*创建配置组-弹出层-start*/}
          <Modal
            title="创建配置组"
            wrapClassName="server-create-modal"
            visible={this.state.createModal}
            onOk={(e) => this.btnCreateConfigGroup()}
            onCancel={(e) => this.configModal(false)}
          >
            <div className="create-conf-g">
              <span style={{marginRight: "16px"}}>名称 : </span>
              <Input type="text" value={this.state.myTextInput} onChange={()=>this.createModalInput()}/>
            </div>
          </Modal>
          {/*创建配置组-弹出层-end*/}
          {/*折叠面板-start*/}
          <CollapseList groupData={configGroup} loading={isFetching} handChageProp={ this.handChageProp()}/>
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
  deleteConfigGroup: PropTypes.func.isRequired
}

/*export default injectIntl(Service,{
  withRef: true
})*/
function mapStateToProps(state, props) {
  const defaultConfigList = {
    isFetching: false,
    cluster: 'default',
    configGroup: []
  }
  const {
    configGroupList
  } = state.configReducers
  const {cluster, configGroup, isFetching } = configGroupList['default'] || defaultConfigList
  return {
    cluster,
    configGroup,
    isFetching,
    createConfigGroup: state.configReducers.createConfigGroup,
    deleteConfigGroup: state.configReducers.deleteConfigGroup
  }
}
function mapDispatchToProps(dispatch) {
  return {
    loadConfigGroup: (cluster) => {
      dispatch(loadConfigGroup(cluster))
    },
    createConfigGroup: (obj,callback) => {
      dispatch(createConfigGroup(obj, callback))
    },
    deleteConfigGroup: (obj, callback) => {
      dispatch(deleteConfigGroup(obj, callback))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Service, {
  withRef: true,
}))



