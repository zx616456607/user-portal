/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * AppList component
 *
 * v0.1 - 2017-07-29
 * @author ZhaoYanBei
 */

import React, { Component } from 'react'
import { Row, Col, Button, Input, Modal, Transfer, Tree, Form } from 'antd'
import { connect } from 'react-redux'
import { UpdateRole, CreateRole, ExistenceRole, RemovePermissionRole, AddPermissionRole } from '../../../../actions/role'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../constants'
import { Permission } from '../../../../actions/permission'
import NotificationHandler from '../../../../components/Notification'
import './style/index.less'
import { REG } from '../../../../constants'

class CreateRoleModal extends React.Component {
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
      childrenKey: [],
      codeKey: [],
      categoryKey: [],
    }
  }
  componentWillMount() {
    this.getPermission()
    this.fetchRowDate()
  }
  componentWillUnmount() {
    clearTimeout(this.roleNameTime)
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
            this.setState({
              count: res.data.data.total,
              rowDate: res.data.data,
              rowPermissionID: pids,
            })
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
  onCheck(checkedKeys, e) {
    let count = []
    const categoryKey = this.fetchNode(e.node.props.category)
    e.checkedNodes.forEach(item => {
      if (item.props.code !== '') {
        count.push(item.key)
      }
    })
    categoryKey.forEach((item, index) => {
      if(checkedKeys.indexOf(item) === -1){
        checkedKeys.push(item)
      }
    })

    this.setState({
      checkedKeys,
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
            let result = res.data.data.permissions
            this.setState({
              allPermission: result,
              total: res.data.data.total
            })
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
    scope.setState({ characterModal: false })
  }
  okCreateModal() {
    const { isAdd } = this.props
    isAdd ? this.addInfo() : this.editInfo()
  }
  addInfo() {
    const { CreateRole, loadData, scope, form } = this.props
    const { getFieldValue, validateFields } = form
    const { checkedKeys } = this.state;
    let notify = new NotificationHandler()
    let ary = checkedKeys.map((item, index) => {
      return Number(item)
    })
    if (ary.length === 0) {
      notify.error('权限不能为空')
      return
    }
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      let roleDesc = values.roleDesc
      let roleName = values.roleName
      CreateRole({
        name: roleName,
        comment: roleDesc,
        pids: ary
      }, {
          success: {
            func: (res) => {
              if (REG.test(res.data.statusCode)) {
                notify.success('创建角色成功')
                loadData && loadData()
                scope.setState({ characterModal: false })
              }
            },
            isAsync: true
          },
          failed: {
            func: (res) => {
              notify.error('创建角色失败')
              scope.setState({ characterModal: false })
            }
          }
        })
    })
  }
  editInfo() {
    const { UpdateRole, AddPermissionRole, loadData, scope, form, roleId, isDetail } = this.props
    const { getFieldValue, validateFields } = form
    const { rowPermissionID, checkedKeys, isChecked } = this.state
    let notification = new NotificationHandler()
    let idKey = []
    let checkedID = []
    validateFields((error, values) => {
      if (!!error) return
      let body = {
        name: values.roleName,
        comment: values.roleDesc
      }
      UpdateRole({
        id: roleId,
        body
      }, {
          success: {
            func: (res) => {
              if (REG.test(res.data.code)) {
                loadData && loadData()
                scope.setState({ characterModal: false })
              }
            }
          },
          failed: {
            func: (err) => {
              notification.close()
              notification.error(err)
            },
            isAsync: true
          }
        })
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
      if (isChecked) {
        this.screenInfo()
        if (idKey && idKey.length > 0) {
          let bodys = {
            pids: idKey
          }
          AddPermissionRole({
            id: roleId,
            bodys
          }, {
              success: {
                func: (res) => {
                  if (REG.test(res.data.code)) {
                    notification.success(`更新成功`)
                    isDetail ? scope.loadData(roleId) : loadData && loadData()
                    scope.setState({
                      characterModal: false
                    })
                  }
                },
                isAsync: true
              },
              failed: {
                func: (err) => {
                  notification.error(`更新失败`)
                  scope.setState({
                    characterModal: false
                  })
                },
                isAsync: true
              }
            })
        } else {
          scope.loadData(roleId) && loadData()
          scope.setState({
            characterModal: false
          })
        }
      } else {
        scope.loadData(roleId) && loadData()
        scope.setState({
          characterModal: false
        })
      }
    })
  }
  screenInfo() {
    let notification = new NotificationHandler()
    const { RemovePermissionRole } = this.props
    const { rowPermissionID, checkedKeys, isChecked, codeKey } = this.state
    let checkedId = []
    let ary = []
    let arys = []
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
    if (isChecked) {
      if (arys.length <= 0) return
      if (arys && arys.length > 0) {
        let bodys = {
          pids: arys
        }
        RemovePermissionRole({
          id: this.props.roleId,
          bodys
        }, {
            success: {
              func: (res) => {
                if (REG.test(res.data.code)) {
                  notification.success('移除权限成功')
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
  fetchNode(category){
    const { allPermission } = this.state
    let childrenKey = []
    this.fetchCategory(allPermission, childrenKey, category)
    return childrenKey
  }
  fetchCategory(data, childrenKey, category){
    const children = []
    for (let i = 0; i < data.length; i++) {
      let RowData = data[i]
      if (RowData.id === category) {
        if(RowData.children){
          RowData.children.forEach((item, index) => {
            if(item.name.indexOf('查看') !== -1){
              childrenKey.push(item.id)
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

  render() {
    const TreeNode = Tree.TreeNode;
    const { allPermission, permissionCount, rowDate, rowPermission, total, isChecked, checkedKeys } = this.state
    const { characterModal, form, isAdd, isTotal } = this.props
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
      return <TreeNode key={item.id} code={item.code} title={item.name} category={item.category} />;
    })
    return (
      <Modal title={this.props.title} wrapClassName="createCharacterModal" visible={characterModal} width={570}
        onCancel={() => this.cancelModal()}
        onOk={() => this.okCreateModal()}
      >
        <Form className="createRoleForm" form={this.props.form}>
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
        <div className="authChoose">
          <span className="desc">权限选择 :</span>
          <div className="authBox">
            <div className="authTitle">共<span style={{ color: '#59c3f5' }}>{total}</span>个<div className="pull-right">已选<span style={{ color: '#59c3f5' }}>
              {this.state.checkedCount.length <= 0 ? isChecked ? 0 : isTotal ? this.props.scope.state.total : isAdd : this.state.checkedCount.length}
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
          <span className="notes">注：查看作为基本操作权限，无查看权限时其他相关操作权限不生效</span>
        </div>
      </Modal>
    )
  }
}

CreateRoleModal = Form.create()(CreateRoleModal)
function mapStateToSecondProp(state, props) {
  return {}
}
export default CreateRoleModal = connect(mapStateToSecondProp, {
  UpdateRole,
  CreateRole,
  Permission,
  ExistenceRole,
  AddPermissionRole,
  RemovePermissionRole,
})(CreateRoleModal)