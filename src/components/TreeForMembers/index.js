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
      disableCheckArr:[],
      halfChecked:[],
      alreadyAllChecked: false
    }
  }
  
  componentDidMount() {
    const { outPermissionInfo, existMember } = this.props
    this.getExistMember(outPermissionInfo,existMember)
  }
  componentWillReceiveProps(nextProps) {
    const { connectModal, existMember, outPermissionInfo } = nextProps;
    if (!this.props.connectModal && connectModal) {
      this.getExistMember(outPermissionInfo,existMember)
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
    let leftInfo = outPermissionInfo || []
    let rightInfo = []
    let checkedKeys = []
    for (let i = 0; i < existMember.length; i++) {
      for (let j = 0; j < outPermission.length; j++) {
        if (outPermission[j].id === existMember[i]) {
          rightInfo.push(outPermission[j])
          checkedKeys.push(`${existMember[i]}`)
        }
      }
    }
    rightInfo = this.deleteRepeatPermission(rightInfo)
    let copyExist = []
    for (let i = 0; i < existMember.length; i++) {
      copyExist.push(`${existMember[i]}`)
    }
    let addKey = this.findParentNode(outPermission,existMember)
    this.setState({
      checkedKeys,
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
  onCheck = (keys,e) => {
    const { outPermissionInfo, checkedKeys } = this.state
    let outPermission = this.transformMultiArrayToLinearArray(cloneDeep(outPermissionInfo))
    let parentKey = []
    let addKey = []
    // key 
    // let checkArr = new Set(checkedKeys.slice(0));
    // for (let i = 0; i < keys.length; i++) {
    //   if(checkArr.has(keys[i])) {
    //     checkArr.delete(keys[i])
    //   } else {
    //     checkArr.add(keys[i])
    //   }
    // }
    // checkArr = Array.from(checkArr)
    //
    // let checkArr = keys.checked;
    // let harfKeys = []
    // for (let j = 0; j < checkArr.length; j++) {
    //   for (let i = 0; i < outPermission.length; i++) {
    //     if ((checkArr[j] === `${outPermission[i].id}`) && outPermission[i].parent) {
    //       parentKey.push(outPermission[i].parent)
    //     }
    //   }
    // }
    // for (let i = 0; i < parentKey.length; i++) {
    //   let flag = false
    //   for (let j = 0; j < outPermission.length; j++) {
    //     if (outPermission[j].id === parentKey[i]) {
    //       let branch = outPermission[j].children
    //       flag = branch.every(item => {
    //         return checkArr.indexOf(`${item.id}`) > -1
    //       })
    //     }
    //   }
    //   if (flag && e.checked) {
    //     console.log('true')
    //     addKey.push(parentKey[i])
    //   } else {
    //     harfKeys.push(parentKey[i])
    //   }
    // }
    // checkArr = Array.from(new Set(checkArr.concat(addKey)))
    // addKey = Array.from(new Set(addKey.concat(keys.checked)))
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
        if ((checkedKeys[j] === permissList[i].id) && permissList[i].parent) {
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
            return checkedKeys.indexOf(item.id) > -1
          })
        }
      }
      if (flag) {
        addKey.push(parentKey[i])
      }
    }
    return addKey
  }
  addPermission = () => {
    const { checkedKeys, outPermissionInfo } = this.state
    const { getTreeRightData } = this.props
    let newOutPermissionInfo = cloneDeep(outPermissionInfo)
    if(!checkedKeys.length) return
    let permissList = this.transformMultiArrayToLinearArray(newOutPermissionInfo)
    let arr = []
    let per = []
    let alreadyCheck = []
    let addKey = this.findParentNode(permissList,checkedKeys)
    for(let i = 0; i < checkedKeys.length; i++){
      for(let j = 0; j < permissList.length; j++){
        let id = typeof permissList[j].id === 'number' ? `${permissList[j].id}` : permissList[j].id
        if(id === checkedKeys[i]){
          if (typeof permissList[j].id === 'number') {
            per.unshift(permissList[j])
            alreadyCheck.push(id)
          }
          arr.push(id)
        }
      }
    }
    arr = Array.from(new Set(arr.concat(addKey)))
    per = this.deleteRepeatPermission(per)
    let alreadySet = new Set(alreadyCheck);
    alreadyCheck = Array.from(alreadySet)
    let toNumber = []
    alreadyCheck.forEach(item => {
      toNumber.push(Number(item))
    })
    if(getTreeRightData){
      getTreeRightData(toNumber,per)
    }
    this.setState({
      checkedKeys:arr,
      disableCheckArr:arr,
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
      disableCheckArr:difference(disableCheckArr.slice(0),backArr),
      checkedKeys:difference(checkedKeys.slice(0),backArr)
    },()=>{
      this.isReadyCheck()
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
      this.setState({
        alreadyAllChecked: true
      })
    } else {
      this.setState({
        alreadyAllChecked: false
      })
    }
  }
  render() {
    const { outPermissionInfo, permissionInfo, disableCheckArr, alreadyAllChecked } = this.state
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
      <div id='TreeForMember'>
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