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
import { Modal, Button, Row, Col, Radio, Transfer, Input, Checkbox, Tree, Spin } from 'antd'
import { connect } from 'react-redux'
import { PermissionResource, setPermission } from '../../../../actions/permission'
import { loadAppList } from '../../../../actions/app_manage'
import { loadAllServices } from '../../../../actions/services'
import { loadContainerList } from '../../../../actions/app_manage'
import { DEFAULT_IMAGE_POOL } from '../../../../constants'
import { loadStorageList } from '../../../../actions/storage'
import { loadConfigGroup } from '../../../../actions/configs'
import Notification from '../../../../components/Notification'
import xor from 'lodash/xor'
import intersection from 'lodash/intersection'
import './style/ResourceModal.less'
import CommonSearchInput from '../../../CommonSearchInput'
import _ from 'lodash'

const notify = new Notification()
const RadioGroup = Radio.Group;
const TreeNode = Tree.TreeNode;
let currType = "";

class ResourceModal extends Component {
  state={
    currentStep: 0,
    confirmLoading: false,
    RadioValue: 'fixed',
    regex: "",
    checkedKeys: [],
    outPermissionInfo: [],
    alreadyCheckedKeys: [],
    permissionInfo: [],
    disableCheckArr:[],
    alreadyAllChecked: false,
    originalMembers: [],
    deleteMembers: [],
    leftSelableNames: [],
    leftShowNames: [],
    rightSeledNames: [],
    rightShowNames: [],
    leftValue: '',
    rightValue: '',
    sourceData: [],
    currPRO: [],
    permissionKeys: [],
    spinning: true,
  }
  resetState = () =>{
    this.setState({
      currentStep: 0,
      confirmLoading: false,
      RadioValue: 'regex',
      regex: "",
      checkedKeys: [],
      outPermissionInfo: [],
      alreadyCheckedKeys: [],
      permissionInfo: [],
      disableCheckArr:[],
      alreadyAllChecked: false,
      originalMembers: [],
      deleteMembers: [],
      leftSelableNames: [],
      leftShowNames: [],
      rightSeledNames: [],
      rightShowNames: [],
      leftValue: '',
      rightValue: '',
      sourceData: [],
      permissionKeys: [],
      spinning: true,
    });
    currType = "";
  }
  nextStep = () => {
    let b = false;
    const { RadioValue, regex, rightSeledNames } = this.state
    if(RadioValue === "regex") {
      if(regex !== ""){
        let regex = this.props.permissionOverview[this.props.currResourceType].acls.regex;
        let temp = _.filter(regex, {filter: this.state.regex, filterType: "regex"})[0];
        if(!!temp){
          document.getElementById("permissionRegex").focus();
          notify.info('已存在该正则表达式, 请重新输入');
        }else{
          b = true;
        }
      }else{
        notify.info('请输入表达式');
      }
    }else if( RadioValue === "fixed" ){
      if(rightSeledNames.toString() === ""){
        notify.info('请选择资源');
      } else{
        b = true;
      }
    }
    if(b){
      this.setState({
        currentStep: 1
      })
    }
  }
  returnStep = () => {
    this.setState({
      currentStep: 0
    })
  }
  formSubmit = () => {
    if(this.state.permissionKeys.length < 1)
    {notify.info('请选择权限');return;}
    this.setState({
      confirmLoading: true,
    }, () => {
      const params = this.getParams();
      // console.log(params);
      // this.setState({
      //   confirmLoading: false,
      // })
      // return;
      this.props.setPermission(params, {
        success: {
          func: (res) => {
            //console.log(res);
            this.setState({
              confirmLoading: false
            })
            notify.success('授权成功');
            !!this.props.onOk && this.props.onOk();
            !!this.props.onCancel && this.props.onCancel();
            this.resetState();
          },
          isAsync: true
        },
        failed: {
          func: res => {
            notify.error('授权失败');
            this.setState({
              confirmLoading: false
            })
          },
          isAsync: true
        }
      })
    });
  }
  getParams = () => {
    const obj = {
      permissionId: 0,
      roleId: this.props.scope.state.currentRoleInfo.id,
      clusterId: this.props.scope.state.selectedCluster,
      filterType: "",  // regex - 正则匹配
      policyType: "white",
      filter: ""  // 由于 filterType == "regex"，所以这个字段是个正则表达式，前端需要验证一下正则表达式是否是符合语法的正则表达式
    };
    let res = [], _that = this;
    this.state.permissionKeys.map((item) => {
      let temp = _.cloneDeep(obj);
      temp.permissionId = Number(item);
      temp.filterType = _that.state.RadioValue;
      temp.filter = _that.state.RadioValue === "regex" ? _that.state.regex : "";
      res.push(temp);
    });
    if(this.state.RadioValue === "fixed"){
      let tempRes = _.cloneDeep(res);
      res = [];
      this.state.rightSeledNames.map( (name) => {
        let tempRes1 = _.cloneDeep(tempRes);
        for(let i = 0; i < tempRes1.length; i++){
          tempRes1[i].filter = name;
          res.push(tempRes1[i]);
        }
      })
    }
    //console.log(res);
    return res;
  }
  modalCancel = () => {
    this.props.onCancel();
    this.resetState();
  }
  onRadioChange = (e) => {
    this.setState({
      RadioValue: e.target.value
    })
  }

  addCheckNames = () => {
    const { checkedKeys, rightSeledNames, leftShowNames, leftSelableNames } = this.state
    let res = _.cloneDeep(leftSelableNames);//左侧剩余 (总 names)
    checkedKeys.map(item => res = _.without(res, item));
    this.setState({
      rightSeledNames: [].concat(rightSeledNames, checkedKeys),
      rightShowNames: [].concat(rightSeledNames, checkedKeys),
      leftSelableNames: res,
      leftShowNames: res,
      alreadyCheckedKeys: [],
      leftValue: "",
      rightValue: "",
      checkedKeys: [],
    })
  }

  removeCheckNames = () => {
    const { alreadyCheckedKeys, rightSeledNames, leftSelableNames, rightShowNames } = this.state
    let res = _.cloneDeep(rightSeledNames);
    alreadyCheckedKeys.map(item => res = _.without(res, item));
    this.setState({
      leftSelableNames: [].concat(leftSelableNames, alreadyCheckedKeys),
      leftShowNames: [].concat(leftSelableNames, alreadyCheckedKeys),
      rightSeledNames: res,
      rightShowNames: res,
      alreadyCheckedKeys: [],
      leftValue: "",
      rightValue: "",
      checkedKeys: [],
    })
  }

  selectAllSel = (e) => {
    if(e.target.checked){
      this.setState({
        alreadyCheckedKeys: this.state.rightShowNames,
      })
    }
    if(!e.target.checked){
      this.setState({
        alreadyCheckedKeys: [],
      })
    }
  }
  selectAll = (e) => {
    if(e.target.checked){
      this.setState({
        checkedKeys: this.state.leftShowNames,
      })
    }
    if(!e.target.checked){
      this.setState({
        checkedKeys: [],
      })
    }
  }

  selectPermissionAll = (e) => {
    if(e.target.checked){
      this.setState({
        permissionKeys: this.state.currPRO[this.props.currResourceType].map( item => item.permissionId.toString() ),
      })
    }
    if(!e.target.checked){
      this.setState({
        permissionKeys: [],
      })
    }
  }
  onReguxChange = (e) => {
    let b = true;
    try{
      new RegExp(e.target.value)
    }catch(e){
     //console.log('无效正则')
     b = false;
    }
    this.setState({
      regex: e.target.value,
    });
    if(!b){ e.target.focus();
      notify.info('表达式输入有误, 请验证后输入表达式');
    }
  }
  onTreeCheck = (keys) => {
    this.setState({
      checkedKeys:keys,
    });
  }
  onPermissionCheck = (keys) => {
    this.setState({
      permissionKeys:keys,
    });
  }
  onAlreadyCheck = (keys) => {
    this.setState({
      alreadyCheckedKeys:keys,
    });
  }
  onRightSearchChange = (rightValue) => {
    this.setState({rightValue}, () => {
      let temp = _.cloneDeep(this.state.rightSeledNames);
      let resNames = [];
      if(rightValue === ""){
        resNames = temp;
      }else{
        temp.map((item) => {
          if(item.indexOf(rightValue) > -1){
            resNames.push(item);
          }
        });
      }
      //console.log(resNames);
      this.setState({
        rightShowNames: resNames
      });
    });
  }
  onLeftSearchChange = (leftValue) => {
    this.setState({leftValue}, () => {
      let temp = _.cloneDeep(this.state.leftSelableNames);
      let resNames = [];
      if(leftValue === ""){
        resNames = temp;
      }else{
        temp.map((item) => {
          if(item.indexOf(leftValue) > -1){
            resNames.push(item);
          }
        });
      }
      //console.log(resNames);
      this.setState({
        leftShowNames: resNames
      });
    });
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
              <Button type="primary" onClick={this.formSubmit} loading={this.state.confirmLoading}>保存</Button>
              ]
          }
        </div>
      )
    })();
    const filterUser = "";
    const { disableCheckArr, alreadyAllChecked, leftSelableNames, leftValue, rightValue, rightSeledNames,
      checkedKeys, alreadyCheckedKeys, currPRO, permissionKeys, leftShowNames, rightShowNames } = this.state;

    const loopFunc = data => data.length >0 && data.map((name, i) => {
      return <TreeNode key={name} title={name} disableCheckbox={disableCheckArr.indexOf(`${name}`) > -1}/>;
    });
    const loop = data => data.map((name, i) => {
      return <TreeNode key={name} title={name}/>;
    });
    const loopPermission = data => data.map((item, i) => {
      return <TreeNode key={item.permissionId} title={item.name}/>;
    });

    let permission = [];
    if(currPRO.toString() !== "{}" && !!currPRO[this.props.currResourceType]){
      permission = currPRO[this.props.currResourceType];
    }
    return (
      <Modal
        visible={this.props.visible}
        footer={footer}
        title="编辑权限"
        width="700"
        onClose={() => {this.modalCancel()}}
        className="ResourceModalWrapper"
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
                  <Radio key="a" value="regex">通过表达式选择资源( 可包含后续新建的资源 )</Radio>
                  <div className="panel"><Input id="permissionRegex" onChange={this.onReguxChange} placeholder="填写正则表达式, 筛选资源" value={this.state.regex} /></div>
                  <Radio key="b" value="fixed">直接选择资源</Radio>
                  <Spin spinning={this.state.spinning} className="panel">
                    <Row>
                      <Col span="10">
                        <div className='leftBox'>
                          <div className='header'>
                            <Checkbox checked={checkedKeys.toString() === leftShowNames.toString() && leftShowNames.toString() !== ""} onClick={this.selectAll}>可选</Checkbox>
                            <div className='numberBox'>共 <span className='number'>{leftShowNames.length}</span> 条</div>
                          </div>
                          <CommonSearchInput
                            getOption={this.getSelected}
                            onSearch={filterUser}
                            placeholder='请输入搜索内容'
                            value={leftValue}
                            onChange={(leftValue) => this.onLeftSearchChange(leftValue)}
                            style={{width: '90%', margin: '10px auto', display: 'block'}}/>
                          <hr className="underline"/>
                          <div className='body'>
                            <div>
                              {
                                leftShowNames.length
                                  ? <Tree
                                  checkable
                                  onExpand={this.onExpand}
                                  onCheck={this.onTreeCheck}
                                  checkedKeys={this.state.checkedKeys}
                                  key="tree"
                                >
                                  {loopFunc(leftShowNames)}
                                </Tree>
                                  : <span className='noPermission'>暂无</span>
                              }
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col span="4">
                        <div className='middleBox'>
                          <Button size='small' onClick={this.removeCheckNames}>
                            <i className="fa fa-angle-left" aria-hidden="true" style={{ marginRight: '8px'}}/>
                            移除
                          </Button>
                          <Button size='small' className='add' onClick={this.addCheckNames}>
                            添加
                            <i className="fa fa-angle-right" aria-hidden="true" style={{ marginLeft: '8px'}}/>
                          </Button>
                        </div>
                      </Col>
                      <Col span="10">
                        <div className='rightBox'>
                          <div className='header'>
                            <Checkbox onClick={this.selectAllSel} checked={alreadyCheckedKeys.toString() === rightShowNames.toString() && rightShowNames.toString() !== ""}>已选</Checkbox>
                            <div className='numberBox'>共 <span className='number'>{rightShowNames.length}</span> 条</div>
                          </div>
                          <CommonSearchInput
                            placeholder="请输入搜索内容"
                            style={{width: '90%', margin: '10px auto', display: 'block'}}
                            onSearch={this.filterPermission}
                            value={rightValue}
                            onChange={(rightValue) => this.onRightSearchChange(rightValue)}
                          />
                          <hr className="underline"/>
                          <div className='body'>
                            <div>
                              {
                                rightShowNames.length
                                  ? <Tree
                                  checkable multiple
                                  onCheck={this.onAlreadyCheck}
                                  checkedKeys={this.state.alreadyCheckedKeys}
                                  key={this.state.rightTreeKey}
                                >
                                  {loop(rightShowNames)}
                                </Tree>
                                  : <span className='noPermission'>暂无</span>
                              }
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Spin>
                </RadioGroup>
                </div>
              </Col>
            </Row>
          </div>
          :
          <div className="step2">
            <Row id="TreeForPermission">
              <Col span={3}><div className="title">选择权限</div></Col>
              <Col span={21}>
                <div className='leftBox'>
                  <div className='header'>
                    <Checkbox onClick={this.selectPermissionAll}><div className='numberBox'>共 <span className='number'>{permission.length}</span> 条</div></Checkbox>
                    <div className='numberBox floatRight'>已选 <span className='number'>{permissionKeys.length}</span> 条</div>
                  </div>
                  <div className='body'>
                    <div>
                    <Tree
                      checkable multiple
                      onCheck={this.onPermissionCheck}
                      checkedKeys={permissionKeys}
                      key="permissionTree"
                    >
                      {loopPermission(permission)}
                    </Tree>
                    </div>
                  </div>
                </div>

              </Col>
            </Row>
          </div>
        }
      </Modal>
    )
  }
  // componentWillReceiveProps = (next) => {
  //   if(next.currResourceType !== currType){
  //     currType = next.currResourceType;
  //     switch (currType){
  //       case "application":
  //         //console.log("application");
  //         this.loadApplist();
  //         break;
  //       case "service":
  //         this.loadAllServices();
  //         //console.log("service");
  //         break;
  //       case "container":
  //         this.loadContainerList();
  //         //console.log("container");
  //         break;
  //       case "volume":
  //         this.loadStorageList();
  //         //console.log("volume");
  //         break;
  //       case "configuration":
  //         this.loadConfigGroup();
  //         //console.log("configuration");
  //         break;
  //     }
  //   }
  // }
  setleftTree = (arr) => {
    this.setState({
      leftSelableNames: arr,
      leftShowNames: arr,
      spinning: false,
    });
  }
  loadApplist = () => {
    const scope = this.props.scope;
    const { name } = scope.props.location.query
    const headers = { project: name }
    const query = { page : 1, size : 9999, sortOrder:"desc", sortBy: "create_time", headers }
    //scope.props.projectClusters
    this.props.loadAppList(scope.state.selectedCluster, query, {
      success: {
        func: (res) => {
          //console.log(res)
          let arr = [];
          res.data.map( (item) => {
            let fixed = this.props.permissionOverview[this.props.currResourceType].acls.fixed;
            if(fixed[item.name]) return;
            arr.push(item.name)
          });
          this.setleftTree(arr);
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setleftTree([]);
        }
      }
    })
  }

  loadAllServices = () => {
    const scope = this.props.scope;
    const { name } = scope.props.location.query
    const headers = { project: name }
    const query = { page : 1, size : 9999, sortOrder:"desc", sortBy: "create_time", headers }
    //scope.props.projectClusters
    this.props.loadAllServices(scope.state.selectedCluster, query, {
      success: {
        func: (res) => {
          //console.log(res)
          let arr = [];
          res.data.services.map( (item) => {
            let fixed = this.props.permissionOverview[this.props.currResourceType].acls.fixed;
            if(fixed[item.service.metadata.name]) return;
            arr.push(item.service.metadata.name)
          });
          this.setleftTree(arr);
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setleftTree([]);
        }
      }
    })
  }

  loadContainerList = () => {
    const { name } = this.props.scope.props.location.query
    const headers = { project: name }
    const query = { page : 1, size : 9999, sortOrder:"desc", sortBy: "create_time", headers }
    //scope.props.projectClusters
    this.props.loadContainerList(this.props.scope.state.selectedCluster, query, {
      success: {
        func: (res) => {
          //console.log(res)
          let arr = [];
          res.data.map( (item) => {
            let fixed = this.props.permissionOverview[this.props.currResourceType].acls.fixed;
            if(fixed[item.metadata.generateName]) return;
            arr.push(item.metadata.generateName)
          });
          this.setleftTree(arr);
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setleftTree([]);
        }
      }
    })
  }

  loadStorageList = () => {
    const scope = this.props.scope;
    const { name } = scope.props.location.query
    const headers = {project: name};
    const query = { page : 1, size : 9999, sortOrder:"desc", sortBy: "create_time" , headers};
    const PRIVATE_QUERY = {
      storagetype: 'ceph',
      srtype: 'private',
    };
    const SHARE_QUERY = {
      storagetype: 'nfs',
      srtype: 'share',
    };
    const HOST_QUERY = {
      storagetype: 'host',
      srtype: 'host'
    };

    const storageReqArr = [
      this.props.loadStorageList(DEFAULT_IMAGE_POOL, scope.state.selectedCluster, Object.assign({}, query, PRIVATE_QUERY)),
      this.props.loadStorageList(DEFAULT_IMAGE_POOL, scope.state.selectedCluster, Object.assign({}, query, SHARE_QUERY)),
      this.props.loadStorageList(DEFAULT_IMAGE_POOL, scope.state.selectedCluster, Object.assign({}, query, HOST_QUERY)),
    ];
    let arr = [];
    Promise.all(storageReqArr).then(storageResult => {
      storageResult.forEach(res => {
        if (!!res.response.result.data) {
          res.response.result.data.map( (item) => {
            let fixed = this.props.permissionOverview[this.props.currResourceType].acls.fixed;
            if(fixed[item.name]) return;
            arr.push(item.name)
          });
        }
      })
      this.setleftTree(arr);
    })
  }
  loadConfigGroup() {
    const scope = this.props.scope;
    const { name } = scope.props.location.query
    const headers = { project: name }
    this.props.loadConfigGroup(scope.state.selectedCluster, headers,{
      success: {
        func: (res) => {
          let arr = [];
          res.data.map( (item) => {
            let fixed = this.props.permissionOverview[this.props.currResourceType].acls.fixed;
            if(fixed[item.name]) return;
            arr.push(item.name)
          });
          this.setleftTree(arr);
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          this.setleftTree([]);
        }
      }
    })
  }

  componentDidMount = () => {
    const { scope } = this.props
    const { location } = scope.props
    const headers = { project: location.query.name }
    this.props.PermissionResource(headers ,{
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
            currPRO: {}
          })
        },
        isAsync: true
      },
    })
    switch (this.props.currResourceType){
      case "application":
        //console.log("application");
        this.loadApplist();
        break;
      case "service":
        this.loadAllServices();
        //console.log("service");
        break;
      case "container":
        this.loadContainerList();
        //console.log("container");
        break;
      case "volume":
        this.loadStorageList();
        //console.log("volume");
        break;
      case "configuration":
        this.loadConfigGroup();
        //console.log("configuration");
        break;
    }
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
  setPermission,
  loadAppList,
  loadAllServices,
  loadContainerList,
  loadStorageList,
  loadConfigGroup,
})(ResourceModal)
