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
const TreeNode = Tree.TreeNode

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
      disableCheckArr:[]
    }
  }
  
  componentDidMount() {
    const { permissionInfo, outPermissionInfo, existMember } = this.props
    let rightInfo = this.getExistMember(outPermissionInfo,existMember)
    
    rightInfo = permissionInfo || rightInfo
    let leftInfo = outPermissionInfo || []
    this.setState({
      permissionInfo: rightInfo,
      outPermissionInfo: leftInfo,
    })
  }
  componentWillReceiveProps(nextProps) {
    const { connectModal, existMember, outPermissionInfo, permissionInfo } = nextProps;
    
    
    if (!this.props.connectModal && connectModal) {
      let rightInfo = this.getExistMember(outPermissionInfo,existMember)
      let leftInfo = outPermissionInfo || []
      rightInfo = rightInfo || permissionInfo
      this.setState({
        permissionInfo: rightInfo,
        outPermissionInfo: leftInfo
      })
    }
    if (this.props.connectModal && !connectModal) {
      this.setState({
        expandedKeys: [],
        checkedKeys: [],
        alreadyCheckedKeys: [],
        alreadyExpanedKeys: [],
        permissionInfo: [],
        disableCheckArr:[]
      })
    }
  }
  getExistMember(outPermissionInfo,existMember) {
    let outPermission = this.transformMultiArrayToLinearArray(cloneDeep(outPermissionInfo))
    let rightInfo = []
    for (let i = 0; i < existMember.length; i++) {
      for (let j = 0; j < outPermission.length; j++) {
        if (outPermission[j].id === existMember[i]) {
          rightInfo.push(outPermission[j])
        }
      }
      
    }
    return rightInfo
  }
  onExpand  = expandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  findParent() {
  
  }
  onCheck = keys => {
    console.log(keys)
    const { outPermissionInfo } = this.state
    let outPermission = this.transformMultiArrayToLinearArray(cloneDeep(outPermissionInfo))
    let parentKey = []
    let addKey = []
    for (let j = 0; j < keys.length; j++) {
      // if (Number(keys[j]).toString() === 'NaN') {
      //   break
      // }
      for (let i = 0; i < outPermission.length; i++) {
        if ((keys[j] === `${outPermission[i].id}`) && outPermission[i].parent) {
          parentKey.push(outPermission[i].parent)
        }
      }
    }
    for (let i = 0; i < parentKey.length; i++) {
      let flag = false
      for (let j = 0; j < outPermission.length; j++) {
        if (outPermission[j].id === parentKey[i]) {
          let branch = outPermission[j].children
          flag = branch.every(item => {
            return keys.indexOf(`${item.id}`) > -1
          })
        }
      }
      if (flag) {
        addKey.push(parentKey[i])
      }
    }
    console.log(addKey)
    let k = Array.from(new Set(keys.concat(addKey)))
    console.log(k)
    this.setState({
      checkedKeys:k,
      //expandedKeys: checkedKeys,
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
    let arr = this.getAllid(permissionInfo)
    if(e.target.checked){
      this.setState({
        alreadyCheckedKeys: arr,
      })
    }
    if(!e.target.checked){
      this.setState({
        alreadyCheckedKeys: [],
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
  
  deleteChildrenAttr = data => {
    // data.forEach(item => {
    //   item.children = null
    //   delete item.children
    // })
    for (let i = 0; i < data.length; i++) {
      data[i].children = null
      delete data[i].children
    }
    return data
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
  
  formatLastData = (data) => {
    let arrLast = []
    for(let i = 0 ; i < data.length; i++){
      if(data[i].teamId){
        arrLast.push(data[i])
      }
    }
    for(let i = 0; i < arrLast.length; i++){
      // let arr = this.formatLastData(data, arrLast[i].id)
      let a = []
      for (let j = 0; j < data.length; j++) {
        if (arrLast[i].id === data[j].parent) {
          a.push(data[j])
        }
      }
      if(a.length){
        arrLast[i].children = a
      }
    }
    return arrLast
  }
  
  removeSelectedPermission = (checkedKeys, permission) => {
    const { updateCurrentMember } = this.props;
    let permissList = this.transformMultiArrayToLinearArray(permission)
    let arr = []
    let disCheckArr = []
    let per = []
    let alreadyCheck = []
    for (let i = 0; i < permissList.length; i++) {
      permissList[i].checked = false
    }
    for(let i = 0; i < checkedKeys.length; i++){
      for(let j = 0; j < permissList.length; j++){
        let id = typeof permissList[j].id === 'number' ? `${permissList[j].id}` : permissList[j].id
        if(id === checkedKeys[i]){
          if (typeof permissList[j].id === 'number') {
            per.unshift(permissList[j])
            alreadyCheck.push(id)
          }
          arr.push(id)
          disCheckArr.push(id)
        }
      }
    }
    arr = Array.from(new Set(arr))
    per = this.deleteRepeatPermission(per)
    let alreadySet = new Set(alreadyCheck);
    alreadyCheck = Array.from(alreadySet)
    let toNumber = []
    alreadyCheck.forEach(item => {
      toNumber.push(Number(item))
    })
    updateCurrentMember(toNumber)
    this.setState({
      checkedKeys:arr,
      disableCheckArr:disCheckArr,
      permissionInfo:per,
      alreadyCheckedKeys:alreadyCheck
    })
  }
  
  addPermissionFormat = data => {
    // 移除所有权限的 children
    let newArray = this.deleteChildrenAttr(data)
    // 将数组转换成标准结构
    let lastArray = this.formatLastData(newArray)
    return lastArray
  }
  
  addPermission = () => {
    const { checkedKeys, outPermissionInfo } = this.state
    const { getTreeRightData } = this.props
    let newOutPermissionInfo = cloneDeep(outPermissionInfo)
    if(!checkedKeys.length) return
    let permissList = this.transformMultiArrayToLinearArray(newOutPermissionInfo)
    let arr = []
    let disCheckArr = []
    let per = []
    let alreadyCheck = []
    for (let i = 0; i < permissList.length; i++) {
      permissList[i].checked = false
    }
    for(let i = 0; i < checkedKeys.length; i++){
      for(let j = 0; j < permissList.length; j++){
        let id = typeof permissList[j].id === 'number' ? `${permissList[j].id}` : permissList[j].id
        if(id === checkedKeys[i]){
          if (typeof permissList[j].id === 'number') {
            per.unshift(permissList[j])
            alreadyCheck.push(id)
          }
          arr.push(id)
          disCheckArr.push(id)
        }
      }
    }
    arr = Array.from(new Set(arr))
    per = this.deleteRepeatPermission(per)
    let alreadySet = new Set(alreadyCheck);
    alreadyCheck = Array.from(alreadySet)
    let toNumber = []
    alreadyCheck.forEach(item => {
      toNumber.push(Number(item))
    })
    if(getTreeRightData){
      getTreeRightData(toNumber)
    }
    this.setState({
      checkedKeys:arr,
      disableCheckArr:disCheckArr,
      permissionInfo:per,
      alreadyCheckedKeys:alreadyCheck
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
      getTreeRightData(stayKey)
    }
    this.setState({
      permissionInfo: arr,
      alreadyCheckedKeys: [],
      disableCheckArr:difference(disableCheckArr.slice(0),backArr),
      checkedKeys:difference(checkedKeys.slice(0),backArr)
    })
  }
  
  returnTotalNum = data => {
    let totalNum = 0
    if(data){
      let totalArray = this.transformMultiArrayToLinearArray(data)
      totalNum = totalArray.length
    }
    return totalNum
  }
  isReadyCheck = () => {
    const { permissionInfo, alreadyCheckedKeys} = this.state;
    if ((permissionInfo.length > 0) && (alreadyCheckedKeys.length > 0) && (permissionInfo.length === alreadyCheckedKeys.length)) {
      return true
    } else {
      return false
    }
  }
  render() {
    const { outPermissionInfo, permissionInfo, disableCheckArr } = this.state
    const { text } = this.props
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
    return(
      <div id='TreeComponent'>
        <div className="alertRow">可为项目中的角色关联对象，则被关联的对象在该项目中拥有此角色的权限。注：可通过添加团队的方式批量添加成员，也可单独添加某个成员参加项目。</div>
        <Row>
          <Col span="10">
            <div className='leftBox'>
              <div className='header'>
                <Checkbox onClick={this.selectAll}>可选{text}</Checkbox>
                <div className='numberBox'>共 <span className='number'>{this.returnTotalNum(outPermissionInfo)}</span> 条</div>
              </div>
              <div className='body'>
                <div >
                  {
                    outPermissionInfo.length
                      ? <Tree
                      checkable
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
                <i className="fa fa-angle-left" aria-hidden="true" style={{ marginRight: '8px'}}></i>
                移除
              </Button>
              <Button size='small' className='add' onClick={this.addPermission}>
                添加
                <i className="fa fa-angle-right" aria-hidden="true" style={{ marginLeft: '8px'}}></i>
              </Button>
            </div>
          </Col>
          <Col span="10">
            <div className='rightBox'>
              <div className='header'>
                <Checkbox onClick={this.alreadySelectAll} checked={this.isReadyCheck()}>已选{text}</Checkbox>
                <div className='numberBox'>共 <span className='number'>{this.returnTotalNum(permissionInfo)}</span> 条</div>
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