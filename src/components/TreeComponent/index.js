/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Access Method component
 *
 * v0.1 - 2017-7-10
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Tree, Button, Checkbox, Row, Col } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import './style/TreeComponent.less'

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
    this.setState({
      checkedKeys,
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
    const func = data => data.forEach(item => {
      LinearArray.push(item)
      if(item.children){
        func(item.children)
      }
    })
    if(data){
      func(data)
    }
    return LinearArray
  }

  getAllid = data => {
    let arr = []
    let eachFunc = data => data.forEach(item => {
      if(item.children){
        eachFunc(item.children)
      }
      return arr.push(item.id)
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
    if(item.parent == ''){
      arrItem.push(item)
      return arrItem
    }
    if(item.parent !== ''){
      arrItem.push(item)
      for(let i = 0; i < permissionListLinear.length; i++){
        if(permissionListLinear[i].id == item.parent){
          return this.getAllBranchPermisson(permissionListLinear[i], arrItem, permissionList)
        }
      }
    }
  }

  deleteChildrenAttr = data => {
    data.forEach(item => {
      delete item.children
    })
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

  formatLastData = (data, id) => {
    let arrLast = []
    for(let i = 0 ; i < data.length; i++){
      if(data[i].parent == id){
        arrLast.push(data[i])
      }
    }
    for(let i = 0; i < arrLast.length; i++){
      let arr = this.formatLastData(data, arrLast[i].id)
      if(arr.length){
        arrLast[i].children = arr
      }
    }
    return arrLast
  }

  removeSelectedPermission = (checkedKeys, permission) => {
    let permissList = this.transformMultiArrayToLinearArray(permission)
    let arr = []
    permissList.forEach(item => {
      item.checked = false
    })
    for(let i = 0; i < checkedKeys.length; i++){
      for(let j = 0; j < permissList.length; j++){
        if(permissList[j].id == checkedKeys[i]){
          permissList[j].checked = true
        }
      }
    }
    for(let i = 0; i < permissList.length; i++){
      if(!permissList[i].checked){
        arr.push(permissList[i])
      }
    }
    let arr2 = this.deleteRepeatPermission(arr)
    let lastArray = this.addPermissionFormat(arr2)
    return lastArray
  }

  addPermissionFormat = data => {
    // 移除所有权限的 children
    let newArray = this.deleteChildrenAttr(data)
    // 将数组转换成标准结构
    let lastArray = this.formatLastData(newArray, '')
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
      if(item.id == id){
        array.push(item)
      } else if(item.children){
        func(item.children, id, array)
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
    this.setState({
      outPermissionInfo: outPermission
    })
    // 获取每个选中权限的所有父权限, 并存入一个数组中
    let allBranchPermisson = []
    arr.forEach(item => {
      let arrItem = this.getAllBranchPermisson(item, [], branchPermission)
      allBranchPermisson.push(arrItem)
    })
    let havePermission = this.transformMultiArrayToLinearArray(newPermissonInfo)
    // 将目前的所有选中的权限都放入一个数组中
    console.log(allBranchPermisson)
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
      permissonInfo: lastArray,
      checkedKeys: [],
      alreadyCheckedKeys: [],
    })
  }

  removePerssion = () => {
    const { alreadyCheckedKeys, permissonInfo, outPermissionInfo } = this.state
    const { getTreeLeftData, getTreeRightData } = this.props
    let newPermissonInfo = cloneDeep(permissonInfo)
    let branchPerminssion = cloneDeep(permissonInfo)
    let newOutPermissionInfo = cloneDeep(outPermissionInfo)
    if(!alreadyCheckedKeys.length) return
    let arr = []
    const func = (data, id, array) => data.forEach((item) => {
      if(item.id == id){
        array.push(item)
      } else if(item.children){
        func(item.children, id, array)
      }
    })
    // 获取当前选中权限的信息，放入一个数组
    alreadyCheckedKeys.forEach(item => {
      func(newPermissonInfo, item, arr)
    })
    let permission = this.removeSelectedPermission(alreadyCheckedKeys, newPermissonInfo)
    if(getTreeRightData){
      getTreeRightData(permission)
    }
    this.setState({
      permissonInfo: permission
    })
    // 获取每个选中权限的所有父权限, 并存入一个数组中
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

  render() {
    const { outPermissionInfo, permissonInfo } = this.state
    const { loopFunc } = this.props
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.id} title={item.desc}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} title={item.desc} />;
    });
    return(
      <div id='TreeComponent'>
        <Row>
          <Col span="10">
            <div className='leftBox'>
              <div className='header'>
                <Checkbox onClick={this.selectAll}>可选权限</Checkbox>
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
                    : <span className='noPermission'>暂无权限</span>
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
                <Checkbox onClick={this.alreadySelectAll}>已选权限</Checkbox>
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
                      {loopFunc(permissonInfo)}
                    </Tree>
                    : <span className='noPermission'>暂无权限</span>
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