/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Project Detail
 *
 * v0.1 - 2018-04-18
 * @author rensiwei
 */

import React, { Component } from 'react'
import { Modal, Button, Row, Col, Radio, Transfer, Input, Checkbox, Tree } from 'antd'
import { connect } from 'react-redux'
import { PermissionResource } from '../../../../actions/permission'
import { loadAppList } from '../../../../actions/app_manage'
import { loadAllServices } from '../../../../actions/services'
import { loadContainerList } from '../../../../actions/app_manage'
import { DEFAULT_IMAGE_POOL } from '../../../../constants'
import { loadStorageList } from '../../../../actions/storage'
import { loadConfigGroup } from '../../../../actions/configs'
import xor from 'lodash/xor'
import intersection from 'lodash/intersection'
import './style/ResourceModal.less'
import CommonSearchInput from '../../../CommonSearchInput'
import _ from 'lodash'

const RadioGroup = Radio.Group;
const TreeNode = Tree.TreeNode;
let isGetpr = true, currType = "";

class ResourceModal extends Component {
  state={
    currentStep: 0,
    confirmLoading: false,
    RadioValue: 1,
    mockData: [],
    targetKeys: [],
    checkedKeys: [],
    outPermissionInfo: [],
    alreadyCheckedKeys: [],
    permissionInfo: [],
    disableCheckArr:[],
    alreadyAllChecked: false,
    originalMembers: [],
    deleteMembers: [],
    treeNames: [],
    selNames: [],
    leftValue: '',
    rightValue: '',
    sourceData: [],
    currPRO: [],
  }
  nextStep = () => {
    this.setState({
      currentStep: 1
    })
  }
  returnStep = () => {
    this.setState({
      currentStep: 0
    })
  }
  formSubmit = () => {
    this.setState({
      confirmLoading: true,
    })
  }
  modalCancel = () => {
    this.props.onCancel();
    this.setState({
      currentStep: 0,
      confirmLoading: false,
    })
  }
  onRadioChange = (e) => {
    this.setState({
      RadioValue: e.target.value
    })
  }
  getMock = () => {
    const targetKeys = [];
    const mockData = [];
    for (let i = 0; i < 20; i++) {
      const data = {
        key: i,
        title: `内容${i + 1}`,
        description: `内容${i + 1}的描述`,
        chosen: Math.random() * 2 > 1,
      };
      if (data.chosen) {
        targetKeys.push(data.key);
      }
      mockData.push(data);
    }
    this.setState({ mockData, targetKeys });
  }
  handleChange(targetKeys, direction, moveKeys) {
    console.log(targetKeys, direction, moveKeys);
    this.setState({ targetKeys });
  }
  selectAll = () => {
    if(e.target.checked){
      this.setState({
        checkedKeys: arr,
      })
    }
    if(!e.target.checked){
      this.setState({
        checkedKeys: [],
      })
    }
  }
  getSelected = () => {

  }
  onExpand = () => {

  }
  onTreeCheck = (keys) => {
    this.setState({
      checkedKeys:keys,
    });
  }
  removePerssion = () => {

  }
  alreadySelectAll = () => {

  }
  filterPermission = () => {

  }
  transformMultiArrayToLinearArray = data => {
    let LinearArray = []
    for (let i = 0; i < data.length; i++) {
      LinearArray.push(data[i])
      if (data[i].children) {
        for (let j = 0; j < data[i].children.length; j++) {
          LinearArray.push(data[i].children[j])
        }
      }
    }
    return LinearArray
  }
  findParentNode(permissList,checkedKeys) {
    let parentKey = []
    let addKey = []
    for (let j = 0; j < checkedKeys.length; j++) {
      for (let i = 0; i < permissList.length; i++) {
        if ((checkedKeys[j] === `${permissList[i].id}`) && permissList[i].parent) {
          parentKey.push(permissList[i].parent)
        }
      }
    }
    for (let i = 0; i < parentKey.length; i++) {
      let flag = false
      for (let j = 0; j < permissList.length; j++) {
        if (permissList[j].id === parentKey[i]) {
          let branch = permissList[j].children
          flag = branch.every(item => {
            return checkedKeys.indexOf(`${item.id}`) > -1
          })
        }
      }
      if (flag) {
        addKey.push(parentKey[i])
      }
    }
    return addKey
  }
  deleteRepeatPermission = data => {
    let arr = []
    for(let i = 0; i < data.length; i++){
      let repeat = false
      for(let j = 0; j < arr.length; j++){
        if(data[i].id === arr[j].id){
          repeat = true
          break
        }
      }
      if(!repeat){
        arr.push(data[i])
      }
    }
    return arr
  }
  stringToNumber(arr) {
    let newArr = []
    arr.forEach(item => {
      newArr.push(Number(item))
    })
    return newArr
  }
  isReadyCheck = () => {
    const { permissionInfo, alreadyCheckedKeys} = this.state;
    if ((permissionInfo.length > 0) && (alreadyCheckedKeys.length > 0) && (permissionInfo.length === alreadyCheckedKeys.length)) {
      this.setState({
        alreadyAllChecked: true
      })
    } else {
      this.setState({
        alreadyAllChecked: false
      })
    }
  }
  addPermission = () => {
    const { checkedKeys, outPermissionInfo,selNames, originalMembers, permissionInfo, treeNames, sourceData } = this.state
    let newOutPermissionInfo = _.cloneDeep(selNames)
    let uniqCheckedKeys = Array.from(new Set(checkedKeys))
    let diff = xor(uniqCheckedKeys,originalMembers);
    let newCheck = intersection(uniqCheckedKeys,diff)
    if(!checkedKeys.length) return
    let permissList = this.transformMultiArrayToLinearArray(newOutPermissionInfo)
    let arr = []
    let per = treeNames.slice(0)
    let alreadyCheck = []
    let rightCheck = []
    let addKey = this.findParentNode(permissList,uniqCheckedKeys)
    //左侧穿梭框选中状态
    for(let i = 0; i < uniqCheckedKeys.length; i++){
      for(let j = 0; j < permissList.length; j++){
        let id = typeof permissList[j].id === 'number' ? `${permissList[j].id}` : permissList[j].id
        if(id === uniqCheckedKeys[i]){
          if (typeof permissList[j].id === 'number') {
            per.unshift(permissList[j])
            rightCheck.push(id)
          }
          arr.push(id)
        }
      }
    }
    //右侧穿梭框状态
    for(let i = 0; i < newCheck.length; i++){
      for(let j = 0; j < sourceData.length; j++){
        let id = typeof sourceData[j].id === 'number' ? `${sourceData[j].id}` : sourceData[j].id
        if(id === newCheck[i]){
          if (typeof sourceData[j].id === 'number') {
            // per.unshift(permissList[j])
            alreadyCheck.push(id)
          }
        }
      }
    }
    let withParent = Array.from(new Set(arr.concat(addKey)))
    per = this.deleteRepeatPermission(per)
    let alreadySet = new Set(alreadyCheck);
    alreadyCheck = Array.from(alreadySet)
    let toNumber = this.stringToNumber(Array.from(new Set(rightCheck.concat(originalMembers))))
    this.setState({
      checkedKeys:withParent,
      disableCheckArr:withParent,
      permissionInfo:per,
      treeNames: per,
      alreadyCheckedKeys:alreadyCheck
    },()=>{
      this.isReadyCheck()
    })

  }

  removePerssion = () => {
    const { alreadyCheckedKeys, permissionInfo, outPermissionInfo,selNames,treeNames, disableCheckArr, checkedKeys } = this.state
    let oldPermissonInfo = _.cloneDeep(permissionInfo)
    let newPermissonInfo = _.cloneDeep(treeNames)
    let newOutPermissionInfo = this.transformMultiArrayToLinearArray(_.cloneDeep(selNames))
    if(!alreadyCheckedKeys.length) return
    let oldArr = []
    let backArr = []
    let oldStayKey = []
    let newArr = []
    let newStayKey = []
    for(let i = 0; i < newOutPermissionInfo.length; i++) {
      for(let j = 0; j < alreadyCheckedKeys.length; j++) {
        if(`${newOutPermissionInfo[i].id}` === alreadyCheckedKeys[j]) {
          backArr.push(`${newOutPermissionInfo[i].id}`)
          if (newOutPermissionInfo[i].parent) {
            backArr.push(newOutPermissionInfo[i].parent)
          }
        }
      }
    }
    for (let i = 0; i < oldPermissonInfo.length; i++) {
      let flag = false;
      for (let j = 0; j < alreadyCheckedKeys.length; j++) {
        if (`${oldPermissonInfo[i].id}` === alreadyCheckedKeys[j]) {
          flag = true
        }
      }
      if (!flag) {
        oldArr.push(oldPermissonInfo[i])
        oldStayKey.push(oldPermissonInfo[i].id)
      }
    }
    for (let i = 0; i < newPermissonInfo.length; i++) {
      let flag = false;
      for (let j = 0; j < alreadyCheckedKeys.length; j++) {
        if (`${newPermissonInfo[i].id}` === alreadyCheckedKeys[j]) {
          flag = true
        }
      }
      if (!flag) {
        newArr.push(newPermissonInfo[i])
        newStayKey.push(newPermissonInfo[i].id)
      }
    }
    this.setState({
      permissionInfo: oldArr,
      treeNames: newArr,
      alreadyCheckedKeys: [],
      disableCheckArr:difference(disableCheckArr,backArr),
      checkedKeys:difference(checkedKeys,backArr)
    },()=>{
      this.isReadyCheck()
    })
  }
  render(){
    const footer = (() => {
      return (
        <div>
          <Button onClick={() => {this.modalCancel()}}>取消</Button>
          {
            this.state.currentStep === 0 ?
              <Button type="primary" onClick={this.nextStep}>下一步</Button>
              :
              [
              <Button type="primary" onClick={this.returnStep}>上一步</Button>,
              <Button type="primary" onClick={this.formSubmit} loading={this.props.confirmLoading}>保存</Button>
              ]
          }
        </div>
      )
    })();
    const selectProps = {
      defaultValue: '成员',
      selectOptions : [{
        key: 'user',
        value: '成员'
      }, {
        key: 'team',
        value: '团队'
      }]
    }
    const filterUser = "";
    const { disableCheckArr, alreadyAllChecked, treeNames, leftValue, rightValue, selNames } = this.state;

    const loopFunc = data => data.length >0 && data.map((name, i) => {
      return <TreeNode key={i} title={name} disableCheckbox={disableCheckArr.indexOf(`${name}`) > -1}/>;
    });
    const loop = data => data.map((name, i) => {
      return <TreeNode key={i} title={name}/>;
    });
    return (
      <Modal
        visible={this.props.visible}
        footer={footer}
        title="编辑权限"
        width="700"
      >
        <ul className="stepBox">
          <li className={"active"}>
            <span>1</span>
            选择资源
          </li>
          <li className={this.state.currentStep == 1 ? "active" : ""}>
            <span>2</span>
            选择权限
          </li>
        </ul>
        {
          this.state.currentStep === 0 ?
          <div className="step1">
            <Row id="TreeForResource">
              <Col span={3}><div className="title">选择资源</div></Col>
              <Col span={21}>
                <div className="">
                <RadioGroup onChange={this.onRadioChange} value={this.state.RadioValue}>
                  <Radio key="a" value="regux">通过表达式选择资源( 可包含后续新建的资源 )</Radio>
                  <div className="panel"><Input placeholder="填写正则表达式, 筛选资源" /></div>
                  <Radio key="b" value="fixed">直接选择资源</Radio>
                  <div className="panel">
                    <Row>
                      <Col span="10">
                        <div className='leftBox'>
                          <div className='header'>
                            <Checkbox onClick={this.selectAll}>可选</Checkbox>
                            <div className='numberBox'>共 <span className='number'>{treeNames.length}</span> 条</div>
                          </div>
                          <CommonSearchInput
                            getOption={this.getSelected}
                            onSearch={filterUser}
                            placeholder='请输入搜索内容'
                            selectProps={selectProps}
                            value={leftValue}
                            onChange={(leftValue) => this.setState({leftValue})}
                            style={{width: '90%', margin: '10px auto', display: 'block'}}/>
                          <hr className="underline"/>
                          <div className='body'>
                            <div>
                              {
                                treeNames.length
                                  ? <Tree
                                  checkable
                                  onExpand={this.onExpand}
                                  onCheck={this.onTreeCheck}
                                  checkedKeys={this.state.checkedKeys}
                                  key="tree"
                                >
                                  {loopFunc(treeNames)}
                                </Tree>
                                  : <span className='noPermission'>暂无</span>
                              }
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col span="4">
                        <div className='middleBox'>
                          <Button size='small' onClick={this.removePerssion}>
                            <i className="fa fa-angle-left" aria-hidden="true" style={{ marginRight: '8px'}}/>
                            移除
                          </Button>
                          <Button size='small' className='add' onClick={this.addPermission}>
                            添加
                            <i className="fa fa-angle-right" aria-hidden="true" style={{ marginLeft: '8px'}}/>
                          </Button>
                        </div>
                      </Col>
                      <Col span="10">
                        <div className='rightBox'>
                          <div className='header'>
                            <Checkbox onClick={this.alreadySelectAll} checked={alreadyAllChecked}>已选</Checkbox>
                            <div className='numberBox'>共 <span className='number'>{selNames.length}</span> 条</div>
                          </div>
                          <CommonSearchInput
                            placeholder="请输入搜索内容"
                            style={{width: '90%', margin: '10px auto', display: 'block'}}
                            onSearch={this.filterPermission}
                            value={rightValue}
                            onChange={(rightValue) => this.setState({rightValue})}
                          />
                          <hr className="underline"/>
                          <div className='body'>
                            <div>
                              {
                                selNames.length
                                  ? <Tree
                                  checkable multiple
                                  onCheck={this.onAlreadyCheck}
                                  checkedKeys={this.state.alreadyCheckedKeys}
                                  key={this.state.rightTreeKey}
                                >
                                  {loop(selNames)}
                                </Tree>
                                  : <span className='noPermission'>暂无</span>
                              }
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </RadioGroup>
                </div>
              </Col>
            </Row>
          </div>
          :
          <div className="step2">
            <Transfer
              dataSource={this.state.mockData}
              targetKeys={this.state.targetKeys}
              onChange={this.handleChange}
              render={item => item.title}
            />
          </div>
        }
      </Modal>
    )
  }
  componentWillReceiveProps = (next) => {
    if(next.currResourceType !== currType){
      currType = next.currResourceType;
      switch (currType){
        case "application":
          console.log("application");
          this.loadApplist();
          break;
        case "service":
          this.loadAllServices();
          console.log("service");
          break;
        case "container":
          this.loadContainerList();
          console.log("container");
          break;
        case "volume":
          this.loadStorageList();
          console.log("volume");
          break;
        case "configuration":
          this.loadConfigGroup();
          console.log("configuration");
          break;
      }
    }
  }
  loadApplist = () => {
    const query = { page : 1, size : 9999, sortOrder:"desc", sortBy: "create_time" }
    const scope = this.props.scope;
    //scope.props.projectClusters
    this.props.loadAppList(scope.props.projectClusters[0].clusterID, query, {
      success: {
        func: (res) => {
          console.log(res)
          let arr = [];
          res.data.map( item => arr.push(item.name));
          this.setState({
            treeNames: arr,
          })
        },
        isAsync: true
      }
    })
  }

  loadAllServices = () => {
    const query = { page : 1, size : 9999, sortOrder:"desc", sortBy: "create_time" }
    const scope = this.props.scope;
    //scope.props.projectClusters
    this.props.loadAllServices(scope.props.projectClusters[0].clusterID, query, {
      success: {
        func: (res) => {
          console.log(res)
          let arr = [];
          res.data.services.map( item => arr.push(item.service.metadata.name));
          this.setState({
            treeNames: arr,
          })
        },
        isAsync: true
      }
    })
  }

  loadContainerList = () => {
    const query = { page : 1, size : 9999, sortOrder:"desc", sortBy: "create_time" }
    const scope = this.props.scope;
    //scope.props.projectClusters
    this.props.loadContainerList(scope.props.projectClusters[0].clusterID, query, {
      success: {
        func: (res) => {
          console.log(res)
          let arr = [];
          res.data.map( item => arr.push(item.metadata.generateName));
          this.setState({
            treeNames: arr,
          })
        },
        isAsync: true
      }
    })
  }
  loadStorageList = () => {
    const query = { page : 1, size : 9999, sortOrder:"desc", sortBy: "create_time",storagetype: "ceph", srtype: "private" }
    const scope = this.props.scope;
    this.props.loadStorageList(DEFAULT_IMAGE_POOL, scope.props.projectClusters[0].clusterID, query, {
      success: {
        func: (res) => {
          let arr = [];
          res.data.map( item => arr.push(item.name));
          this.setState({
            treeNames: arr,
          })
        },
        isAsync: true,
      }
    })
  }
  loadConfigGroup() {
    const scope = this.props.scope;
    this.props.loadConfigGroup(scope.props.projectClusters[0].clusterID, {
      success: {
        func: (res) => {
          let arr = [];
          res.data.map( item => arr.push(item.name));
          this.setState({
            treeNames: arr,
          })
        },
        isAsync: true,
      }
    })
  }

  componentDidMount = () => {
    this.props.PermissionResource({
      success: {
        func: res => {
          this.setState({
            currPRO: res.data
          })
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notification.error(`获取资源列表失败`)
          this.setState({
            currPRO: []
          })
        },
        isAsync: true
      },
    })
  }
}

function mapStateToSecondProp(state, props) {
  const { role } = state
  const { permissionOverview } = role
  return {
    permissionOverview
  }
}
export default ResourceModal = connect(mapStateToSecondProp, {
  PermissionResource,
  loadAppList,
  loadAllServices,
  loadContainerList,
  loadStorageList,
  loadConfigGroup,
})(ResourceModal)
