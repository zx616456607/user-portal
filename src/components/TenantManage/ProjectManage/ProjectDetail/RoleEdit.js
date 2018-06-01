/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * AppList component
 *
 * v0.1 - 2018-04-18
 * @author rsw
 */

import React, { Component } from 'react'

import { UpdateRole, CreateRole, ExistenceRole, RemovePermissionRole, AddPermissionRole } from '../../../../actions/role'
import { Row, Col, Button, Input, Modal, Transfer, Tree, Form, Icon, Radio } from 'antd'
import { connect } from 'react-redux'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../constants'
import { Permission } from '../../../../actions/permission'
import NotificationHandler from '../../../../components/Notification'
import './style/roleEdit.less'
import { REG } from '../../../../constants'
import cloneDeep from 'lodash/cloneDeep'

class RoleEditModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      key: [],
      total: 0,
      count: 0,
      isChecked: false,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      checkedCount: [],
      selectedKeys: [],
      allPermission: [],
      permissionCount: 0,
      rowDate: [],
      rowPermissionID: [],
      isCheck: false,
      codeKey: [],
      categoryKey: [],
      permissionType: 1,
    }
  }
  componentWillMount() {
    this.getPermission()
    this.fetchRowDate()
  }
  componentWillUnmount() {
    clearTimeout(this.roleNameTime)
  }
  componentDidMount() {
    // setTimeout(function () {
    //   document.getElementById('roleName').focus()
    // }, 100)
  }

  fetchRowDate() {
    const { scope, roleId } = this.props
    scope.props.GetRole({ roleId }, {
      success: {
        func: res => {
          if (REG.test(res.data.code)) {
            let result = res.data.data.permissions
            let pids = res.data.data.pids
            let aryID = []
            let childrenKeys = []
            let codeKey = []
            this.RowData(result, childrenKeys, codeKey)
            const state = {
              count: res.data.data.total,
              rowDate: res.data.data,
              rowPermissionID: pids,
            }

            if(res.data.data.pids.indexOf(10000) > -1){
              state.permissionType = 2
            }

            this.setState(state)
          }
        }
      }
    })
  }

  onExpand(expandedKeys) {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    })
  }
  onCheck(key, e) {
    let count = []
    const { checkedKeys } = this.state
    const categoryKey = this.fetchNode(e.node.props.category)
    e.checkedNodes.forEach(item => {
      if (item.props.code !== '') {
        count.push(item.key)
      }
    })

    categoryKey.forEach((item, index) => {
      if (checkedKeys.length === 0) {
        key.push(item)
      } else {
        if (checkedKeys.indexOf(item) === -1) {
          key.push(item)
        }
      }
    })

    this.setState({
      checkedKeys: key,
      isChecked: true,
      checkedCount: count
    })
  }
  onSelect(selectedKeys) {
    this.setState({ selectedKeys })
  }
  getPermission() {
    const { Permission } = this.props
    Permission(null, {
      success: {
        func: (res) => {
          if (REG.test(res.data.code)) {
            let result = res.data.data.permissions;
            let tempres = cloneDeep(result);
            // let allPermission = [];
            // allPermission.push(_.filter(tempres, {id:10000, code: "SYSTEM_ALL_PRIVILEGES"})[0])
            // allPermission[0].children = _.filter(tempres, (item) => {
            //   return item.id !== 10000 && item.code !== "SYSTEM_ALL_PRIVILEGES";
            // });
            // 包括所有权限项
            const state = {
              allPermission: tempres,
              total: res.data.data.total
            }
            this.setState(state)
          }
        },
        isAsync: true
      }
    })
  }
  RowData(data, childrenKey, codeKey) {
    if (data) {
      const children = []
      for (let i = 0; i < data.length; i++) {
        let RowData = data[i]
        if (RowData.code !== '') {
          childrenKey.push(RowData.id)
        } else {
          codeKey.push(RowData.id)
        }
        children.push(RowData.id)
      }

      children.forEach((key, index) => {
        if (data[index]["children"] !== undefined) {
          if (data[index].children.length !== 0) {
            return this.RowData(data[index].children, childrenKey, codeKey);
          }
        }
      })
      this.setState({
        checkedKeys: childrenKey,
        codeKey,
      })
    }
  }
  roleName(rule, value, callback) {
    const { ExistenceRole } = this.props
    const { rowDate } = this.state
    if (!value) {
      callback(new Error('请输入名称'))
      return
    }
    if (value === rowDate.name) {
      callback()
    }
    this.roleNameTime = setTimeout(() => {
      ExistenceRole({
        name: encodeURIComponent(value)
      }, {
          success: {
            func: res => {
              if (res.data.data) {
                return callback(new Error('该角色名称已经存在'))
              }
              callback()
            },
            isAsync: true
          },
          failed: {
            func: res => {
              return callback()
            },
            isAsync: true
          }
        })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  cancelModal() {
    const { scope } = this.props;
    scope.setState({ isShowperallEditModal: false })
  }
  okCreateModal() {
    const { isAdd } = this.props
    this.editInfo()
  }
  editInfo() {
    const { UpdateRole, AddPermissionRole, loadData, scope, form, roleId, isDetail } = this.props
    const { rowPermissionID, checkedKeys, isChecked, permissionType } = this.state
    let notification = new NotificationHandler()
    let idKey = []
    let checkedID = []
    if(permissionType === 1){
      if (rowPermissionID && rowPermissionID.length > 0) {
        rowPermissionID.sort()
        if (rowPermissionID[0] === 0) {
          rowPermissionID.splice(0, 1)
        }
        checkedID = checkedKeys.map((item) => {
          return Number(item)
        })
        checkedID.map((item) => {
          if (rowPermissionID.indexOf(item) === -1) {
            idKey.push(item)
          }
        })
      } else {
        idKey = checkedKeys.map((item) => {
          return Number(item)
        })
      }
    }else if(permissionType === 2){
      idKey = [10000] // 所有资源权限
    }
    if (isChecked || permissionType === 2) {
      this.screenInfo()
      if (idKey && idKey.length > 0) {
        let bodys = {
          pids: idKey,
          headers: {
            project: scope.props.location.query.name
          }
        }
        AddPermissionRole({
          id: roleId,
          bodys
        }, {
            success: {
              func: (res) => {
                if (REG.test(res.data.code)) {
                  notification.success(`更新成功`)
                  scope.getCurrentRole(roleId)
                  scope.setState({
                    isShowperallEditModal: false
                  })
                }
              },
              isAsync: true
            },
            failed: {
              func: (err) => {
                if(err.statusCode === 403){
                  notification.warn(`更新失败, 用户没有权限修改角色`)
                }
                else{
                  notification.warn(`更新失败`)
                }
                scope.setState({
                  isShowperallEditModal: false
                })
              },
              isAsync: true
            }
          })
      } else {
        //scope.loadData(roleId) && loadData()
        scope.setState({
          isShowperallEditModal: false
        })
      }
    } else {
      //scope.loadData(roleId) && loadData()
      scope.setState({
        isShowperallEditModal: false
      })
    }
  }
  screenInfo() {
    let notification = new NotificationHandler()
    const { RemovePermissionRole, scope } = this.props
    const { rowPermissionID, isChecked, codeKey, permissionType } = this.state
    let checkedKeys = cloneDeep(this.state.checkedKeys)
    let checkedId = []
    let ary = []
    let arys = []

    if(permissionType === 2){
      checkedKeys = []
    }
    checkedId = checkedKeys.map((item, index) => {
      return Number(item)
    })
    checkedId.sort()
    if (checkedId[0] === 0) {
      checkedId.splice(0, 1)
    }
    checkedId.map((item) => {
      if (rowPermissionID.indexOf(item) !== -1) {
        ary.push(item)
      }
    })
    rowPermissionID.map((item) => {
      if (ary.indexOf(item) === -1) {
        arys.push(item)
      }
    })
    codeKey.forEach((value, index) => {
      arys.forEach(item => {
        if (item === value) {
          arys.splice(arys.indexOf(item), 1)
        }
      })
    })
    if (arys.length <= 0) return
    if (isChecked || permissionType === 2) {
      if (arys.length <= 0) return
      if (arys && arys.length > 0) {
        let bodys = {
          pids: arys,
          headers: {
            project: scope.props.location.query.name
          }
        }
        RemovePermissionRole({
          id: this.props.roleId,
          bodys
        }, {
            success: {
              func: (res) => {
                if (REG.test(res.data.code)) {
                  notification.success('移除权限成功')
                  scope.getCurrentRole(this.props.roleId);
                }
              },
              isAsync: true
            }
          })
      }
    }
  }
  handleChange() {
    this.setState({
      isCheck: true,
    })
  }
  fetchNode(category) {
    const { allPermission } = this.state
    let childrenKey = []
    this.fetchCategory(allPermission, childrenKey, category)
    return childrenKey
  }
  fetchCategory(data, childrenKey, category) {
    const children = []
    for (let i = 0; i < data.length; i++) {
      let RowData = data[i]
      if (RowData.id === category) {
        if (RowData.children) {
          RowData.children.forEach((item, index) => {
            if (item.name.indexOf('查看') !== -1) {
              if (item.children) {
                item.children.forEach((item, index) => {
                  childrenKey.push(item.id)
                })
              } else {
                childrenKey.push(item.id)
              }
            }
          })
        }
      }
      children.push(RowData.id)
    }

    children.forEach((key, index) => {
      if (data[index]["children"] !== undefined) {
        if (data[index].children.length !== 0) {
          return this.fetchCategory(data[index].children, childrenKey, category);
        }
      }
    })
  }

  permissionTypeChange = (e) => {
    const value = e.target.value;
    if(this.state.permissionType === value) return;
    let tempState = {permissionType: e.target.value}
    this.setState(tempState);
  }
  render() {
    const TreeNode = Tree.TreeNode;
    const { allPermission, permissionCount, rowDate, rowPermission, total, isChecked, checkedKeys, permissionType } = this.state
    const { visible, form, isAdd, isTotal } = this.props
    const { getFieldProps, isFieldValidating, getFieldError } = form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 15 },
    }
    let checkedKey = []
    if (checkedKeys) {
      checkedKeys.forEach(item => {
        checkedKey.push(`${item}`)
      })
    }
    const loop = data => data.map((item) => {
      if (item["children"] !== undefined) {
        return (
          <TreeNode key={item.id} code={item.code} title={item.name} category={item.category} >
            {loop(item.children)}
          </TreeNode>
        )
      }
      if(item.name === "所有资源权限" && item.desc === "所有资源权限" && item.code === "SYSTEM_ALL_PRIVILEGES") return <span></span>;
      return <TreeNode key={item.id} code={item.code} title={item.name} category={item.category} />;
    })
    const allPermissionTreeNode = _.filter(allPermission, {name: "所有资源权限", desc: "所有资源权限", category: 0, code: "SYSTEM_ALL_PRIVILEGES"})[0];
    return (
      <Modal title='管理权限' wrapClassName="createCharacterModal" visible={visible} width={570}
        onCancel={() => this.cancelModal()}
        onOk={() => this.okCreateModal()}
      >
        {/*<Form className="createRoleForm" form={this.props.form}>
          <Form.Item label="名称"
            {...formItemLayout}
            hasFeedback
            help={isFieldValidating('roleName') ? '校验中...' : (getFieldError('roleName') || []).join(', ')}
          >
            <Input placeholder="请输入名称" {...getFieldProps(`roleName`, {
              rules: [
                { validator: (rules, value, callback) => this.roleName(rules, value, callback) }
              ],
              initialValue: isAdd ? undefined : rowDate.name
            }) }
            />
          </Form.Item>
          <Form.Item label="描述" {...formItemLayout}>
            <Input type="textarea" {...getFieldProps(`roleDesc`, {
              initialValue: isAdd ? undefined : rowDate.comment
            }) } />
          </Form.Item>
        </Form>
        */}
        <div>
        <Form.Item label="权限选择" {...formItemLayout}>
          <Radio.Group
            onChange={this.permissionTypeChange}
            value={permissionType}
          >
            <Radio key="b" value={1}>选择权限</Radio>
            <Radio key="a" value={2}>所有权限</Radio>
          </Radio.Group>
        </Form.Item>
        <div>
          {
            permissionType === 1 ?
              <Row>
                <Col span={4}></Col>
                <Col span={20}>
                  <div className="authChoose">
                    <div className="authBox">
                      <div className="authTitle">共<span style={{ color: '#59c3f5' }}>{total}</span>个<div className="pull-right">已选<span style={{ color: '#59c3f5' }}>
                        {this.state.checkedCount.length <= 0 ? isChecked ? 0 : isTotal ? this.props.totalSelected : isAdd : this.state.checkedCount.length}
                      </span> 个</div>
                      </div>
                      <div className="treeBox">
                        {
                          (allPermission.length > 0) &&
                          <Tree
                            checkable
                            onExpand={this.onExpand.bind(this)} expandedKeys={this.state.expandedKeys}
                            autoExpandParent={this.state.autoExpandParent}
                            onCheck={this.onCheck.bind(this)} checkedKeys={checkedKey}
                            onSelect={this.onSelect.bind(this)} selectedKeys={this.state.selectedKeys}
                          >
                            {loop(allPermission)}
                          </Tree>
                        }
                      </div>
                    </div>
                    <span className="notes"><Icon type="exclamation-circle-o" className='tips_icon' />  注：查看作为基本操作权限，无查看权限时其他相关操作权限不生效</span>
                  </div>
                </Col>
              </Row>
              :
              <Row>
                <Col span={4}></Col>
                <Col span={20} className="bottomDesc">
                  <Row>
                    <Col className="gutter-row" span={24}>包含权限: </Col>
                  </Row>
                  <Row>
                    <Col className="gutter-row" span={24}>1. 所有已知功能权限</Col>
                  </Row>
                  <Row>
                    <Col className="gutter-row" span={24}>2. 所有后续添加功能权限</Col>
                  </Row>
                  <div style={{clear: "both"}}></div>
                </Col>
              </Row>
            }
          </div>
        </div>
      </Modal>
    )
  }
}

//RoleEditModal = Form.create()(RoleEditModal)
function mapStateToSecondProp(state, props) {
  return {}
}
export default RoleEditModal = connect(mapStateToSecondProp, {
  UpdateRole,
  CreateRole,
  Permission,
  ExistenceRole,
  AddPermissionRole,
  RemovePermissionRole,
})(RoleEditModal)