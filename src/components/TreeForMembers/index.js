/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Tree for members
 *
 * v0.1 - 2017-7-19
 * @author ZhangXuan
 */

import React, { Component } from 'react'
import { Tree, Button, Checkbox, Row, Col } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import './style/TreeForMembers.less'
import difference from 'lodash/difference'
import xor from 'lodash/xor'
import intersection from 'lodash/intersection'
const TreeNode = Tree.TreeNode
import CommonSearchInput from '../CommonSearchInput'

class TreeComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      expandedKeys: [],
      checkedKeys: [],
      autoExpandParent: true,
      outPermissionInfo: [],
      alreadyCheckedKeys: [],
      alreadyExpanedKeys: [],
      permissionInfo: [],
      alreadyAutoExpandParent: true,
      disableCheckArr:[],
      alreadyAllChecked: false,
      originalMembers: [],
      deleteMembers: []
    }
  }
  
  componentDidMount() {
    const { outPermissionInfo, existMember } = this.props
    this.getExistMember(outPermissionInfo,existMember)
  }
  componentWillReceiveProps(nextProps) {
    const { connectModal, existMember, outPermissionInfo, memberType } = nextProps;
    if ((!this.props.connectModal && connectModal) || (memberType !== this.props.memberType)) {
      this.getExistMember(outPermissionInfo,existMember)
    }
    if (this.props.connectModal && !connectModal) {
      this.setState({
        expandedKeys: [],
        checkedKeys: [],
        alreadyCheckedKeys: [],
        alreadyExpanedKeys: [],
        permissionInfo: [],
        disableCheckArr:[],
        alreadyAllChecked: false
      })
    }
  }
  getExistMember(outPermissionInfo,existMember) {
    let outPermission = this.transformMultiArrayToLinearArray(cloneDeep(outPermissionInfo))
    let leftInfo = outPermissionInfo || []
    let rightInfo = []
    let checkedKeys = []
    let originalMembers = []
    
    for (let i = 0; i < existMember.length; i++) {
      for (let j = 0; j < outPermission.length; j++) {
        if (outPermission[j].id === existMember[i]) {
          rightInfo.push(outPermission[j])
          checkedKeys.push(`${existMember[i]}`)
          originalMembers.push(existMember[i])
        }
      }
    }
    rightInfo = this.deleteRepeatPermission(rightInfo)
    let copyExist = this.numberToString(existMember)
    let addKey = this.findParentNode(outPermission,copyExist)
    this.setState({
      checkedKeys:Array.from(new Set(checkedKeys)),
      originalMembers: Array.from(new Set(checkedKeys)),
      disableCheckArr:Array.from(new Set(checkedKeys.concat(addKey))),
      permissionInfo: rightInfo,
      outPermissionInfo: leftInfo
    })
  }
  onExpand  = expandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck = (keys) => {
    this.setState({
      checkedKeys:keys,
      autoExpandParent: false,
    });
  }
  
  onAlreadyExpand  = expandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
    this.setState({
      alreadyExpanedKeys: expandedKeys,
      alreadyAutoExpandParent: false,
    });
  }
  
  onAlreadyCheck = (checkedKeys, e) => {
    this.setState({
      alreadyCheckedKeys: checkedKeys,
      alreadyAutoExpandParent: false,
    },()=>{
      this.isReadyCheck()
    });
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
  
  getAllid = data => {
    let arr = []
    let eachFunc = data => data.forEach(item => {
      if(item.children){
        eachFunc(item.children)
      }
      return arr.push(`${item.id}`)
    })
    if(data){
      eachFunc(data)
    }
    return arr
  }
  
  selectAll = e => {
    const { outPermissionInfo } = this.state
    let arr = this.getAllid(outPermissionInfo)
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
  
  alreadySelectAll = e => {
    const { permissionInfo } = this.state
    let removeSame = this.deleteRepeatPermission(permissionInfo.slice(0))
    let arr = this.getAllid(removeSame)
    if(e.target.checked){
      this.setState({
        alreadyCheckedKeys: arr,
      },()=>{
        this.isReadyCheck()
      })
    }
    if(!e.target.checked){
      this.setState({
        alreadyCheckedKeys: [],
      },()=>{
        this.isReadyCheck()
      })
    }
  }
  
  getAllBranchPermisson = (item, arr, permissionList) => {
    let permissionListLinear = this.transformMultiArrayToLinearArray(permissionList)
    let arrItem = arr
    if(item.id == ''){
      arrItem.push(item)
      return arrItem
    }
    if(item.id !== ''){
      arrItem.push(item)
      for(let i = 0; i < permissionListLinear.length; i++){
        if(permissionListLinear[i].id == item.id){
          return this.getAllBranchPermisson(permissionListLinear[i], arrItem, permissionList)
        }
      }
    }
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
  numberToString(arr) {
    let newArr = []
    arr.forEach(item => {
      newArr.push(`${item}`)
    })
    return newArr
  }
  stringToNumber(arr) {
    let newArr = []
    arr.forEach(item => {
      newArr.push(Number(item))
    })
    return newArr
  }
  addPermission = () => {
    const { checkedKeys, outPermissionInfo, originalMembers, permissionInfo } = this.state
    const { getTreeRightData } = this.props
    let newOutPermissionInfo = cloneDeep(outPermissionInfo)
    let uniqCheckedKeys = Array.from(new Set(checkedKeys))
    let diff = xor(uniqCheckedKeys,originalMembers);
    let newCheck = intersection(uniqCheckedKeys,diff)
    if(!checkedKeys.length) return
    let permissList = this.transformMultiArrayToLinearArray(newOutPermissionInfo)
    let arr = []
    let per = permissionInfo.slice(0)
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
      for(let j = 0; j < permissList.length; j++){
        let id = typeof permissList[j].id === 'number' ? `${permissList[j].id}` : permissList[j].id
        if(id === newCheck[i]){
          if (typeof permissList[j].id === 'number') {
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
    let toNumber = this.stringToNumber(Array.from(new Set(rightCheck)))
    if(getTreeRightData){
      getTreeRightData(toNumber,per)
    }
    this.setState({
      checkedKeys:withParent,
      disableCheckArr:withParent,
      permissionInfo:per,
      alreadyCheckedKeys:alreadyCheck
    },()=>{
      this.isReadyCheck()
    })
    
  }
  
  removePerssion = () => {
    const { alreadyCheckedKeys, permissionInfo, outPermissionInfo, disableCheckArr, checkedKeys } = this.state
    const { getTreeRightData } = this.props
    let newPermissonInfo = cloneDeep(permissionInfo)
    let newOutPermissionInfo = this.transformMultiArrayToLinearArray(cloneDeep(outPermissionInfo))
    if(!alreadyCheckedKeys.length) return
    let arr = []
    let backArr = []
    let stayKey = []
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
    for (let i = 0; i < newPermissonInfo.length; i++) {
      let flag = false;
      for (let j = 0; j < alreadyCheckedKeys.length; j++) {
        if (`${newPermissonInfo[i].id}` === alreadyCheckedKeys[j]) {
          flag = true
        }
      }
      if (!flag) {
        arr.push(newPermissonInfo[i])
        stayKey.push(newPermissonInfo[i].id)
      }
    }
    if(getTreeRightData){
      getTreeRightData(stayKey,arr)
    }
    this.setState({
      permissionInfo: arr,
      alreadyCheckedKeys: [],
      disableCheckArr:difference(disableCheckArr,backArr),
      checkedKeys:difference(checkedKeys,backArr)
    },()=>{
      this.isReadyCheck()
    })
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
  getSelected = value => {
    const { changeSelected } = this.props
    if (changeSelected) {
      changeSelected(value)
    }
  }
  render() {
    const { outPermissionInfo, permissionInfo, disableCheckArr, alreadyAllChecked } = this.state
    const { text, memberCount, roleMember, modalStatus, clearInput, filterUser } = this.props
    const loopFunc = data => data.length >0 && data.map((item) => {
      if (item.users) {
        return (
          <TreeNode key={item.id} title={item.teamName} disableCheckbox={disableCheckArr.indexOf(item.id) > -1}>
            {loopFunc(item.users)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} title={item.userName} disableCheckbox={disableCheckArr.indexOf(`${item.id}`) > -1}/>;
    });
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.id} title={item.userName}/>
        );
      }
      return <TreeNode key={item.id} title={item.userName}/>;
    });
    const selectProps = {
      defaultValue: '个人',
      selectOptions : [{
        key: 'user',
        value: '个人'
      }, {
        key: 'team',
        value: '团队'
      }]
    }
    return(
      <div id='TreeForMember'>
        <div className="alertRow">可为项目中的角色关联对象，则被关联的对象在该项目中拥有此角色的权限。注：可通过添加团队的方式批量添加成员，也可单独添加某个成员参加项目。</div>
        <Row>
          <Col span="10">
            <div className='leftBox'>
              <div className='header'>
                <Checkbox onClick={this.selectAll}>可选{text}</Checkbox>
                <div className='numberBox'>共 <span className='number'>{memberCount}</span> 条</div>
              </div>
              <CommonSearchInput
                getOption={this.getSelected}
                onSearch={filterUser}
                placeholder='请输入搜索内容'
                selectProps={selectProps}
                modalStatus={modalStatus}
                clearInput={clearInput}
                style={{width: '90%', margin: '10px auto', display: 'block'}}/>
              {/*<Row className="treeTitle">*/}
                {/*<Col span={12}>对象名称</Col>*/}
                {/*<Col span={12}>类型</Col>*/}
              {/*</Row>*/}
              <div className='body'>
                <div >
                  {
                    outPermissionInfo.length
                      ? <Tree
                      checkable
                      // checkStrictly={true}
                      onExpand={this.onExpand}
                      onCheck={this.onCheck}
                      expandedKeys={this.state.expandedKeys}
                      checkedKeys={this.state.checkedKeys}
                      autoExpandParent={this.state.autoExpandParent}
                      key="tree"
                    >
                      {loopFunc(outPermissionInfo)}
                    </Tree>
                      : <span className='noPermission'>暂无{text}</span>
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
                <Checkbox onClick={this.alreadySelectAll} checked={alreadyAllChecked}>已选{text}</Checkbox>
                <div className='numberBox'>共 <span className='number'>{roleMember}</span> 条</div>
              </div>
              <div className='body'>
                <div>
                  {
                    permissionInfo.length
                      ? <Tree
                      checkable multiple
                      onExpand={this.onAlreadyExpand}
                      expandedKeys={this.state.alreadyExpanedKeys}
                      autoExpandParent={this.state.alreadyAutoExpandParent}
                      onCheck={this.onAlreadyCheck}
                      checkedKeys={this.state.alreadyCheckedKeys}
                    >
                      {loop(permissionInfo)}
                    </Tree>
                      : <span className='noPermission'>暂无{text}</span>
                  }
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default TreeComponent