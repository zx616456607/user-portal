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
import { injectIntl } from 'react-intl'
import './style/ServiceConfig.less'
import QueueAnim from 'rc-queue-anim'
import { validateK8sResource } from '../../common/naming_validation'
import CollapseHeader from './ServiceCollapseHeader'
import CollapseContainer from './ServiceCollapseContainer'
import CreateConfigModal from './CreateConfigModal'
import NotificationHandler from '../../components/Notification'
import CommonSearchInput from '../../components/CommonSearchInput'
import { connect } from 'react-redux'
import remove from 'lodash/remove'
import {
  loadConfigGroup, configGroupName, createConfigGroup,
  deleteConfigGroup, updateConfigAnnotations,
  checkConfigNameExistence
} from '../../actions/configs'
import noConfigGroupImg from '../../assets/img/no_data/no_config.png'
import Title from '../Title'
import includes from 'lodash/includes'
import classNames from 'classnames'
import ResourceBanner from '../../components/TenantManage/ResourceBanner'
import serviceIntl from './intl/serviceIntl'
import indexIntl from './intl/indexIntl.js'

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
    const grandScope = this.props.scope
    const { filterName, noAnnotations, searchConfigName } = grandScope.state
    let filterGroup = groupData.slice(0)
    if (!filterName && !noAnnotations && !searchConfigName) {
      filterGroup = groupData.slice(0)
    }
    if (filterName) {
      let arr = []
      filterGroup.forEach(item => {
        if (includes(item.annotations, filterName)) {
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
    const { groupData, isFetching, intl } = this.props
    const grandScope = this.props.scope
    const scope = this
    const { formatMessage } = intl

    // TODO: Fix loadNumber here, not sure why 'groupData.length' will be undefined -> 0 -> actual length
    if (isFetching && this.loadNumber < 2) {
      this.loadNumber++
      return <div className="loadingBox">
          <Spin size="large" />
        </div>
    }
    if (!Array.isArray(groupData) || groupData.length === 0) {
      return <div className="text-center">
          <img src={noConfigGroupImg} />
          <div>{formatMessage(serviceIntl.noConfigGroupMsg)}<Button type="primary" size="large" onClick={() => this.props.scope.configModal(true, false)}>{formatMessage(indexIntl.create)}</Button></div>
        </div>
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
            loadData={this.props.loadData}
            parentScope={scope}
            collapseContainer={group.configs}
            groupname={group.name} />
        </Collapse.Panel>)
    })
    return <Collapse accordion>
        {groups}
      </Collapse>
  }
}
CollapseList = injectIntl(CollapseList, {
  withRef: true
})
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
    const { labelWithCount } = this.props
    this.loadData()
    this.setState({
      configList: labelWithCount
    })
  }
  componentWillReceiveProps(nextProps) {
    const { cluster, loadConfigGroup, labelWithCount, spaceID } = nextProps
    if (cluster !== this.props.cluster || spaceID !== this.props.spaceID) {
      loadConfigGroup(cluster)
    }
    this.setState({
      configList: labelWithCount
    })
  }
  loadData() {
    const { loadConfigGroup, cluster } = this.props
    loadConfigGroup(cluster)
    this.setState({ configArray: [] })
  }
  configModal(visible, editFlag) {
    this.setState({
      createModal: visible,
      groupEdit: editFlag
    })
    const self = this
    setTimeout(() => {
      const ele = document.getElementById('newConfigName')
      ele && ele.focus()
    }, 100)
    setTimeout(function () {
      if (self.focusInput) {
        self.focusInput.refs.input.focus()
      }
    }, 0)
  }
  btnDeleteGroup() {
    const { intl } = this.props
    const { formatMessage } = intl
    let notification = new NotificationHandler()
    let configArray = this.state.configArray
    let cluster = this.props.cluster
    if (configArray.length <= 0) {
      notification.error(formatMessage(serviceIntl.noConfigGroupNotify))
      return
    }
    const self = this
    let configData = {
      cluster,
      "groups": configArray
    }
    this.setState({ delModal: false })
    self.props.deleteConfigGroup(configData, {
      success: {
        func: res => {
          const errorText = []
          if (res.message.length > 0) {
            res.message.forEach(function (list) {
              errorText.push({
                name: list.name,
                text: list.error
              })
            })
            const content = errorText.map(list => {
              return <h3>{list.name}：{list.text}</h3>
            })
            self.loadData()
            Modal.error({
              title: formatMessage(serviceIntl.deleteConfigGroupFailed),
              content
            })
          } else {
            notification.success(formatMessage(serviceIntl.deleteConfigGroupSucc))
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
    return (e, Name) => {
        let configArray = this.state.configArray
        if (e.target.checked) {
          configArray.push(Name)
        } else {
        remove(configArray, item => {
            return item == Name
          })
        }
        this.setState({
          configArray
        })
      }
  }
  handleSearchInput(value) {
    const searchItem = value && value.trim()
    const { labelWithCount } = this.props
    let last = []
    if (searchItem === "" || searchItem.indexOf(" ") !== -1) {
      last = labelWithCount
    } else {
      for (let i = 0; i < labelWithCount.length; i++) {
        if (labelWithCount[i].labelName.indexOf(searchItem) !== -1) {
          last.push(labelWithCount[i])
        }
      }
    }
    this.setState({
      configList: last,
      searchValue: searchItem
    })
  }
  sortFilter(name, flag) {
    this.setState({
      filterName: name,
      noAnnotations: flag ? true : false
    })
  }
  render() {
    const { cluster, configGroup, isFetching, configName, labelWithCount, updateConfigAnnotations, intl } = this.props
    const { configList, filterName, searchValue, noAnnotations, createModal } = this.state
    const { formatMessage } = intl
    let noAnnotationsLength = 0
    configGroup.length > 0 && configGroup.forEach(item => {
      if (!item.annotations.length) {
        noAnnotationsLength++
      }
    })
    const labelList = configList.map(item => {
      return <li className={classNames("configSort pointer", { 'active': item.labelName === filterName })} onClick={() => this.sortFilter(item.labelName, false)}>
          <Tooltip title={item.labelName}>
            <span className="sortName textoverflow">{item.labelName}</span>
          </Tooltip>
          <i className="fa fa-trash-o fa-lg verticalCenter pointer" aria-hidden="true" />
          <i className="fa fa-pencil-square-o fa-lg verticalCenter pointer" aria-hidden="true" />
          <span className="citeCount verticalCenter">({item.count})</span>
        </li>
    })
    return <QueueAnim className="Service" type="right">
        <div id="Service" key="Service">
          <Title title={formatMessage(serviceIntl.headTitle)} />
          {}
          {createModal && <CreateConfigModal visible={createModal} scope={this} configGroup={configGroup} updateConfigAnnotations={updateConfigAnnotations} labelWithCount={labelWithCount} />}
          {}
          {}
          <Modal title={formatMessage(serviceIntl.serviceConfigGroupDelTitle)} visible={this.state.delModal} onOk={() => this.btnDeleteGroup()} onCancel={() => this.setState({ delModal: false })}>
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
              {formatMessage(serviceIntl.serviceConfigGroupDelContent, { names: this.state.configArray.map(item => item).join('，') })}

            </div>
          </Modal>
          {}
          <ResourceBanner resourceType="configuration" />
          <Row gutter={16}>
            <Col span={4}>
              <div className="title">{formatMessage(serviceIntl.groupClassify)}</div>
              <div className="configSearchAndListBox">
                <CommonSearchInput onSearch={value => {
                this.handleSearchInput(value)
              }} placeholder={formatMessage(serviceIntl.searchClassPlaceHolder)} size="large" style={{ width: '90%' }} />
                <div className={classNames("resultCount clearfix", { 'hidden': !Boolean(searchValue) })}>
                  <span className="clearSearch pointer" onClick={() => this.handleSearchInput('')}>
                    <i className="fa fa-arrow-left" aria-hidden="true" />{formatMessage(serviceIntl.return)}</span>
                  <span className="count">{formatMessage(serviceIntl.groupLength, { length: configList.length })}</span>
                </div>
                <ul className="configSortListBox">
                  {labelWithCount.length > 0 && <li className={classNames("configSort pointer", { active: filterName === '', hidden: Boolean(searchValue) })} onClick={() => this.sortFilter('', false)}>
                      <span className="sortName">{formatMessage(serviceIntl.allGroups)}</span>
                      <i className="fa fa-trash-o fa-lg verticalCenter pointer" aria-hidden="true" />
                      <i className="fa fa-pencil-square-o fa-lg verticalCenter pointer" aria-hidden="true" />
                      <span className="citeCount verticalCenter">({configGroup.length})</span>
                    </li>}
                  {<li className={classNames("configSort pointer", { active: noAnnotations, hidden: Boolean(searchValue) })} onClick={() => this.sortFilter(null, true)}>
                      <Tooltip title={formatMessage(serviceIntl.groupsWithoutClass)}>
                        <span className="sortName textoverflow">{formatMessage(serviceIntl.groupsWithoutClass)}</span>
                      </Tooltip>
                      <i className="fa fa-trash-o fa-lg verticalCenter pointer" aria-hidden="true" />
                      <i className="fa fa-pencil-square-o fa-lg verticalCenter pointer" aria-hidden="true" />
                      <span className="citeCount verticalCenter">({noAnnotationsLength})</span>
                    </li>}
                  {labelList}
                </ul>
              </div>
            </Col>
            <Col span={20}>
              <div className="title">{formatMessage(serviceIntl.configGroup)}</div>
              <Button type="primary" size="large" onClick={e => this.configModal(true, false)}>
                <i className="fa fa-plus" /> {formatMessage(indexIntl.createGroup)}
              </Button>
              <Button size="large" onClick={() => this.setState({ delModal: true })} style={{ marginLeft: "12px" }} disabled={!this.state.configArray || this.state.configArray.length < 1}>
                <i className="fa fa-trash-o" style={{ marginRight: '5px' }} />{formatMessage(serviceIntl.delConfigGroup)}
              </Button>
              <CommonSearchInput onSearch={value => {
              this.setState({ searchConfigName: value && value.trim() })
            }} placeholder={formatMessage(indexIntl.searchPlaceHolder)} size="large" />
              <CollapseList loadData={this.loadData} scope={this} cluster={cluster} loadConfigGroup={this.props.loadConfigGroup} groupData={configGroup} configName={configName} btnDeleteGroup={this.btnDeleteGroup} isFetching={isFetching} handChageProp={this.handChageProp()} configArray={this.state.configArray} configGroupName={obj => this.props.configGroupName(obj)} />
            </Col>
          </Row>
          {}
        </div>
      </QueueAnim>
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

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const { space } = state.entities.current
  const defaultConfigList = {
    isFetching: false,
    cluster: cluster.clusterID,
    configGroup: []
  }
  const {
    configGroupList
  } = state.configReducers
  const { configGroup, isFetching } = configGroupList[cluster.clusterID] || defaultConfigList
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
    loadConfigGroup: cluster => {
      dispatch(loadConfigGroup(cluster))
    },
    createConfigGroup: (obj, callback) => {
      dispatch(createConfigGroup(obj, callback))
    },
    deleteConfigGroup: (obj, callback) => {
      dispatch(deleteConfigGroup(obj, callback))
    },
    configGroupName: obj => dispatch(configGroupName(obj)),
    updateConfigAnnotations: (body, callback) => dispatch(updateConfigAnnotations(body, callback)),
    checkConfigNameExistence: (clusterId, name, callback) => dispatch(checkConfigNameExistence(clusterId, name, callback))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Service, {
  withRef: true
}))

