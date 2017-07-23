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
      addTreeData: [],
      autoExpandParent: true,
      outPermissionInfo: [],
      alreadyCheckedKeys: [],
      alreadyExpanedKeys: [],
      permissonInfo: [],
      alreadyAutoExpandParent: true,
      disableCheckArr:[]
    }
  }
  
  componentDidMount() {
    const { permissonInfo, outPermissionInfo } = this.props
    let leftInfo = outPermissionInfo || []
    let rightInfo = permissonInfo || []
    this.setState({
      permissonInfo: rightInfo,
      outPermissionInfo: leftInfo,
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
  
  onCheck = checkedKeys => {
    let arr = new Set(checkedKeys);
    arr = Array.from(arr)
    this.setState({
      checkedKeys:arr,
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
    const { permissonInfo } = this.state
    let arr = this.getAllid(permissonInfo)
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
        if(data[i].id == arr[j].id){
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
            per.push(permissList[j])
            alreadyCheck.push(id)
          }
          arr.push(id)
          disCheckArr.push(id)
        }
      }
    }
    per = this.deleteRepeatPermission(per)
    let alreadySet = new Set(alreadyCheck);
    alreadyCheck = Array.from(alreadySet)
    this.setState({
      checkedKeys:arr,
      disableCheckArr:disCheckArr,
      permissonInfo:per,
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
    const { checkedKeys, permissonInfo, outPermissionInfo } = this.state
    const { getTreeRightData, getTreeLeftData } = this.props
    let newPermissonInfo = cloneDeep(permissonInfo)
    let branchPermission = cloneDeep(outPermissionInfo)
    let newOutPermissionInfo = cloneDeep(outPermissionInfo)
    if(!checkedKeys.length) return
    let arr = []
    const func = (data, id, array) => data.forEach((item) => {
      if(item.id === id){
        array.push(item)
      }
    })
    // 获取当前选中权限的信息，放入一个数组
    checkedKeys.forEach(item => {
      func(outPermissionInfo, item, arr)
    })
    let outPermission = this.removeSelectedPermission(checkedKeys, newOutPermissionInfo)
    if(getTreeRightData){
      getTreeRightData(outPermission)
    }
  }
  
  removePerssion = () => {
    const { alreadyCheckedKeys, permissonInfo, outPermissionInfo, disableCheckArr, checkedKeys } = this.state
    const { getTreeLeftData, getTreeRightData } = this.props
    let newPermissonInfo = cloneDeep(permissonInfo)
    let branchPerminssion = cloneDeep(permissonInfo)
    let newOutPermissionInfo = cloneDeep(outPermissionInfo)
    // if(!alreadyCheckedKeys.length) return
    let arr = []
    let backArr = []
    for(let i = 0; i < newPermissonInfo.length; i++) {
      let flag = false;
      for(let j = 0; j < alreadyCheckedKeys.length; j++) {
        if(`${newPermissonInfo[i].id}` == alreadyCheckedKeys[j]) {
          flag = true;
          backArr.push(`${newPermissonInfo[i].id}`)
        }
      }
      if (!flag) {
        arr.push(newPermissonInfo[i])
      }
    }
    // let permission = this.removeSelectedPermission(alreadyCheckedKeys, newPermissonInfo)
    if(getTreeRightData){
      getTreeRightData(permission)
    }
    this.setState({
      permissonInfo: arr,
      alreadyCheckedKeys: [],
      disableCheckArr:difference(disableCheckArr,backArr),
      checkedKeys:difference(checkedKeys.slice(0),backArr)
    })
    // 获取每个选中权限的所有父权限, 并存入一个数组中
    return
    let allBranchPermisson = []
    arr.forEach(item => {
      let arrItem = this.getAllBranchPermisson(item, [], branchPerminssion)
      allBranchPermisson.push(arrItem)
    })
    let havePermission = this.transformMultiArrayToLinearArray(newOutPermissionInfo)
    // 将目前的所有选中的权限都放入一个数组中
    allBranchPermisson.forEach(item => {
      item.forEach( itemson => {
        havePermission.push(itemson)
      })
    })
    // 删除重复的权限
    let standrandArray = this.deleteRepeatPermission(havePermission)
    let lastArray = this.addPermissionFormat(standrandArray)
    if(getTreeLeftData){
      getTreeLeftData(lastArray)
    }
    this.setState({
      outPermissionInfo: lastArray,
      checkedKeys: [],
      alreadyCheckedKeys: [],
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
    const { permissonInfo, alreadyCheckedKeys} = this.state;
    if ((permissonInfo.length > 0) && (alreadyCheckedKeys.length > 0) && (permissonInfo.length === alreadyCheckedKeys.length)) {
      return true
    } else {
      return false
    }
  }
  render() {
    const { outPermissionInfo, permissonInfo, disableCheckArr } = this.state
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
                <div className='numberBox'>共 <span className='number'>{this.returnTotalNum(permissonInfo)}</span> 条</div>
              </div>
              <div className='body'>
                <div>
                  {
                    permissonInfo.length
                      ? <Tree
                      checkable multiple
                      onExpand={this.onAlreadyExpand}
                      expandedKeys={this.state.alreadyExpanedKeys}
                      autoExpandParent={this.state.alreadyAutoExpandParent}
                      onCheck={this.onAlreadyCheck}
                      checkedKeys={this.state.alreadyCheckedKeys}
                    >
                      {loop(permissonInfo)}
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