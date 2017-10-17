/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  config group list
 *
 * v0.1 - 2016/9/22
 * @author BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Row, Col, Modal, Button, Icon, Collapse, Input, Spin, Tooltip } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/ServiceConfig.less'
import QueueAnim from 'rc-queue-anim'
import { validateK8sResource } from '../../common/naming_validation'
import CollapseHeader from './ServiceCollapseHeader'
import CollapseContainer from './ServiceCollapseContainer'
// import CreateConfigModal from './CreateConfigModal'
import CreateConfigModal from './CreateConfigModal'
import NotificationHandler from '../../components/Notification'
import CommonSearchInput from '../../components/CommonSearchInput'
import { connect } from 'react-redux'
import remove from 'lodash/remove'
import { loadConfigGroup, configGroupName, createConfigGroup, deleteConfigGroup, updateConfigAnnotations } from '../../actions/configs'
import noConfigGroupImg from '../../assets/img/no_data/no_config.png'
import Title from '../Title'
import includes from 'lodash/includes'
import classNames from 'classnames'

class CollapseList extends Component {
  constructor(props) {
    super(props)
    this.loadNumber = 0
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
  filterConfig() {
    const { groupData } = this.props
    const grandScope = this.props.scope;
    const { filterName, noAnnotations, searchConfigName } = grandScope.state
    let filterGroup = groupData.slice(0)
    if (!filterName && !noAnnotations && !searchConfigName) {
      filterGroup = groupData.slice(0)
    }
    if (filterName){
      let arr = []
      filterGroup.forEach(item => {
        if (includes(item.annotations,filterName)) {
          arr.push(item)
        }
      })
      filterGroup = arr.slice(0)
    }
    if (noAnnotations) {
      let arr = []
      filterGroup.forEach(item => {
        if (item.annotations.length === 0) {
          arr.push(item)
        }
      })
      filterGroup = arr.slice(0)
    }
    if (searchConfigName) {
      let arr = []
      filterGroup.forEach(item => {
        if (item.name.indexOf(searchConfigName) > -1) {
          arr.push(item)
        }
      })
      filterGroup = arr.slice(0)
    }
    return filterGroup
  }
  render() {
    const {groupData, isFetching } = this.props
    const grandScope = this.props.scope;
    const scope = this
    // TODO: Fix loadNumber here, not sure why 'groupData.length' will be undefined -> 0 -> actual length
    if (isFetching && this.loadNumber < 2) {
      this.loadNumber++
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!Array.isArray(groupData) || groupData.length === 0) {
      return (
        <div className="text-center">
          <img src={noConfigGroupImg} />
          <div>您还没有配置组，创建一个吧！<Button type="primary" size="large" onClick={() => this.props.scope.configModal(true,false)}>创建</Button></div>
        </div>
      )
    }
    let filterGroup = this.filterConfig()
    let groups = filterGroup.map((group) => {
      return (
        <Collapse.Panel
          header={
            <CollapseHeader
              parentScope={scope}
              grandScope={grandScope}
              btnDeleteGroup={this.props.btnDeleteGroup}
              handChageProp={this.props.handChageProp}
              configArray={this.props.configArray}
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
  // groupData: PropTypes.array.isRequired
}

class Service extends Component {
  constructor(props) {
    super(props)
    this.loadData = this.loadData.bind(this)
    this.state = {
      createModal: false,
      configArray: [],
      configList: [],
      groupEdit: false,
      currentGroup: '',
      filterName: '',
      searchValue: '',
      noAnnotations: false,
      searchConfigName: ''
    }
  }
  componentWillMount() {
    const { labelWithCount } = this.props;
    this.loadData()
    this.setState({
      configList: labelWithCount
    })
  }
  componentWillReceiveProps(nextProps) {
    const { cluster, loadConfigGroup, labelWithCount, spaceID } = nextProps
    if ((cluster !== this.props.cluster) || (spaceID !== this.props.spaceID)) {
      loadConfigGroup(cluster)
    }
    this.setState({
      configList: labelWithCount
    })
  }
  loadData() {
    const { loadConfigGroup, cluster} = this.props
    loadConfigGroup(cluster)
    this.setState({configArray:[]})
  }
  configModal(visible,editFlag) {
    this.setState({
      createModal: visible,
      groupEdit: editFlag,
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
            self.loadData()
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
  handleSearchInput(value) {
    const searchItem = value && value.trim()
    const { labelWithCount } = this.props
    let last = [];
    if(searchItem === "" || (searchItem.indexOf(" ") !== -1)){
      last = labelWithCount
    }else {
      for(let i = 0;i < labelWithCount.length;i++){
        if((labelWithCount[i].labelName).indexOf(searchItem) !== -1) {
          last.push(labelWithCount[i])
        }
      }
    }
    this.setState({
      configList:last,
      searchValue: searchItem
    })
  }
  sortFilter(name,flag) {
    this.setState({
      filterName:name,
      noAnnotations: flag ? true : false
    })
  }
  render() {
    const {cluster, configGroup, isFetching, configName, labelWithCount, updateConfigAnnotations} = this.props
    const { configList, filterName, searchValue, noAnnotations } = this.state;
    let noAnnotationsLength = 0
    configGroup.length > 0 && configGroup.forEach(item => {
      if (!item.annotations.length) {
        noAnnotationsLength++
      }
    })
    const labelList = configList.map(item => {
      return (
        <li className={classNames("configSort pointer",{'active': item.labelName === filterName})} onClick={()=>this.sortFilter(item.labelName,false)}>
          <Tooltip title={item.labelName}>
            <span className="sortName textoverflow">{item.labelName}</span>
          </Tooltip>
          <i className="fa fa-trash-o fa-lg verticalCenter pointer" aria-hidden="true"/>
          <i className="fa fa-pencil-square-o fa-lg verticalCenter pointer" aria-hidden="true"/>
          <span className="citeCount verticalCenter">({item.count})</span>
        </li>
      )
    })
    return (
      <QueueAnim className="Service" type="right">
        <div id="Service" key="Service">
          <Title title="服务配置" />
          {/*创建配置组-弹出层-start*/}
          <CreateConfigModal scope={this} configGroup={configGroup} updateConfigAnnotations={updateConfigAnnotations} labelWithCount={labelWithCount}/>
          {/*创建配置组-弹出层-end*/}
          {/* 删除配置组-弹出层-*/}
          <Modal title="删除配置组操作" visible={this.state.delModal}
          onOk={()=> this.btnDeleteGroup()} onCancel={()=> this.setState({delModal: false})}
          >
            <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}/>您是否确定要删除配置组 {this.state.configArray.map(item => item).join('，')} ?</div>
          </Modal>
          {/*折叠面板-start*/}
          <Row gutter={16}>
            <Col span={4}>
              <div className="title">配置分类</div>
              <div className="configSearchAndListBox">
                <CommonSearchInput onSearch={(value)=>{this.handleSearchInput(value)}} placeholder="请输入分类名搜索" size="large" style={{width: '90%'}}/>
                <div className={classNames("resultCount clearfix",{'hidden': !Boolean(searchValue)})}>
                  <span className="clearSearch pointer" onClick={()=>this.handleSearchInput('')}>
                    <i className="fa fa-arrow-left" aria-hidden="true"/>返回
                  </span>
                  <span className="count">共找到 {configList.length} 个分类</span>
                </div>
                <ul className="configSortListBox">
                  {
                    labelWithCount.length > 0 &&
                    <li className={classNames("configSort pointer",{active: filterName === '',hidden:Boolean(searchValue)})} onClick={()=> this.sortFilter('',false)}>
                      <span className="sortName">全部配置组</span>
                      <i className="fa fa-trash-o fa-lg verticalCenter pointer" aria-hidden="true"/>
                      <i className="fa fa-pencil-square-o fa-lg verticalCenter pointer" aria-hidden="true"/>
                      <span className="citeCount verticalCenter">({configGroup.length})</span>
                    </li>
                  }
                  {
                    <li className={classNames("configSort pointer",{active: noAnnotations,hidden:Boolean(searchValue)})} onClick={()=> this.sortFilter(null,true)}>
                      <span className="sortName">未分类配置组</span>
                      <i className="fa fa-trash-o fa-lg verticalCenter pointer" aria-hidden="true"/>
                      <i className="fa fa-pencil-square-o fa-lg verticalCenter pointer" aria-hidden="true"/>
                      <span className="citeCount verticalCenter">({noAnnotationsLength})</span>
                    </li>
                  }
                  {labelList}
                </ul>
              </div>
            </Col>
            <Col span={20}>
              <div className="title">配置组</div>
              <Button type="primary" size="large" onClick={(e) => this.configModal(true,false)}>
                <i className="fa fa-plus" /> 创建配置组
              </Button>
              <Button size="large" onClick={() => this.setState({delModal: true})} style={{ marginLeft: "12px",marginRight:"12px" }}
                      disabled={!this.state.configArray || this.state.configArray.length < 1}>
                <i className="fa fa-trash-o" style={{marginRight: '5px'}} />删除
              </Button>
              <CommonSearchInput onSearch={(value)=>{this.setState({searchConfigName:value && value.trim()})}} placeholder="按配置组名称搜索" size="large"/>
              <CollapseList
                scope={this}
                cluster={cluster}
                loadConfigGroup={this.props.loadConfigGroup}
                groupData={configGroup}
                configName={configName}
                btnDeleteGroup={this.btnDeleteGroup}
                isFetching={isFetching}
                handChageProp={this.handChageProp()}
                configArray={this.state.configArray}
                configGroupName={(obj) => this.props.configGroupName(obj)} />
            </Col>
          </Row>
          {/*折叠面板-end*/}
        </div>
      </QueueAnim>
    )
  }
}

Service.propTypes = {
  // intl: PropTypes.object.isRequired,
  cluster: PropTypes.string.isRequired,
  // configGroup: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadConfigGroup: PropTypes.func.isRequired,
  createConfigGroup: PropTypes.func.isRequired,
  deleteConfigGroup: PropTypes.func.isRequired,
  configGroupName: PropTypes.func.isRequired,
  updateConfigAnnotations: PropTypes.func.isRequired
}

/*export default injectIntl(Service,{
  withRef: true
})*/
function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const { space } = state.entities.current
  const defaultConfigList = {
    isFetching: false,
    cluster: cluster.clusterID,
    configGroup: [],
  }
  const {
    configGroupList
  } = state.configReducers
  const {configGroup, isFetching } = configGroupList[cluster.clusterID] || defaultConfigList
  let labels = []
  configGroup.length > 0 && configGroup.forEach(item => {
    if (item.annotations.length) {
      labels = labels.concat(item.annotations)
    }
  })
  let labelWithCount = []
  for (let i = 0; i < labels.length; i++) {
    let count = 0
    let temp = labels[i]
    for (let j = 0; j < labels.length; j++) {
      if (temp === labels[j]) {
        count++
        labels[j] = -1
      }
    }
    if (temp !== -1) {
      labelWithCount.push({
        labelName: temp,
        count: count
      })
    }
  }
  return {
    cluster: cluster.clusterID,
    spaceID: space.spaceID,
    configGroup,
    isFetching,
    labelWithCount
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
    configGroupName: (obj) => dispatch(configGroupName(obj)),
    updateConfigAnnotations: (body,callback) => dispatch(updateConfigAnnotations(body,callback))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Service, {
  withRef: true,
}))



