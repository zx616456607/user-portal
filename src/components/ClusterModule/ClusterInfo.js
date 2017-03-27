/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster info list component
 *
 * v0.1 - 2017-2-24
 * @author BaiYu
 */
import React from 'react'
import { Icon, Button, Card, Form, Input, Tooltip, Spin, Modal, Dropdown, Menu } from 'antd'
import { updateCluster, loadClusterList, deleteCluster } from '../../actions/cluster'
import NotificationHandler from '../../common/notification_handler'
import { connect } from 'react-redux'
import clusterImg from '../../assets/img/integration/cluster.png'

let saveBtnDisabled = true

let ClusterInfo = React.createClass ({
  getInitialState() {
    return {
      editCluster: false, // edit btn
      saveBtnLoading: false,
      deleteClusterModal: false,
      deleteClusterBtnLoading: false,
    }
  },
  checkValue(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写用户名')])
      return
    }
    if (value.indexOf('@') > -1) {
      if (!EMAIL_REG_EXP.test(value)) {
        callback([new Error('邮箱地址填写错误')])
        return
      }
      callback()
      return
    }
    callback()
  },
  updateCluster(e) {
    e.preventDefault()
    const { form, updateCluster, cluster, loadClusterList } = this.props
    const { validateFields, resetFields } = form
    const notification = new NotificationHandler()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        saveBtnLoading: true,
      })
      updateCluster(cluster.clusterID, values, {
        success: {
          func: result => {
            notification.success(`更新集群信息成功`)
            loadClusterList(null, {
              finally: {
                func: () => {
                  this.setState({
                    saveBtnLoading: false,
                    editCluster: false,
                  })
                }
              }
            })
          },
          isAsync: true
        },
        failed: {
          func: err => {
            notification.error(`更新集群信息失败`)
            this.setState({
              saveBtnLoading: false,
            })
          },
          isAsync: true
        }
      })
    })
  },
  deleteCluster() {
    this.setState({
      deleteClusterModal: true,
    })
  },
  confirmDeleteCluster() {
    const { deleteCluster, cluster, loadClusterList } = this.props
    const notification = new NotificationHandler()
    this.setState({
      deleteClusterBtnLoading: true,
    })
    deleteCluster(cluster.clusterID, {
      success: {
          func: result => {
            notification.success(`删除集群“${cluster.clusterName}”成功`)
            loadClusterList(null, {
              finally: {
                func: () => {
                  this.setState({
                    deleteClusterModal: false,
                    deleteClusterBtnLoading: false,
                  })
                }
              }
            })
          },
          isAsync: true
        },
        failed: {
          func: err => {
            let { message } = err
            if (typeof message !== 'string') {
              message = ''
            }
            notification.error(`删除集群“${cluster.clusterName}”失败`, message)
            this.setState({
              deleteClusterBtnLoading: false,
            })
          },
          isAsync: true
        }
    })
  },
  render () {
    const { cluster, form } = this.props
    const { editCluster, saveBtnLoading } = this.state
    const { getFieldProps } = form
    let {
      clusterName, apiHost, apiProtocol,
      apiVersion, bindingIPs, bindingDomains,
      description, apiToken, isOk,
    } = cluster
    const apiUrl = `${apiProtocol}://${apiHost}`
    bindingIPs = parseArray(bindingIPs).join(', ')
    bindingDomains = parseArray(bindingDomains).join(', ')
    const nameProps = getFieldProps('clusterName',{
      rules: [
        { required: true, message: '输入集群名称' },
      ],
      initialValue: clusterName
    });
    const bindingIPsProps = getFieldProps('bindingIPs',{
      rules: [
        { required: true, message: '输入服务出口列表' },
      ],
      initialValue: bindingIPs
    });
    const bindingDomainsProps = getFieldProps('bindingDomains',{
      rules: [
        { message: '输入域名列表' },
      ],
      initialValue: bindingDomains
    });
    const descProps = getFieldProps('description',{
      rules: [
        { required: false },
      ],
      initialValue: description
    });
    const dropdown = (
      <Menu onClick={this.deleteCluster} style={{ width: "100px" }} >
        <Menu.Item>
          删除集群
        </Menu.Item>
      </Menu>
    );
    return (
      <Card className="ClusterInfo">
        <div className="h3">集群信息
          { !editCluster ?
          <Dropdown.Button overlay={dropdown} type="ghost" style={{float:'right',marginTop:'6px'}} onClick={()=> this.setState({editCluster: true})}>
            编辑集群
          </Dropdown.Button>

          :
          <div style={{float:'right'}}>
            <Button
              onClick={()=> {
                this.setState({editCluster: false, saveBtnLoading: false})
                saveBtnDisabled = true
              }}>
              取消
            </Button>
            <Button
              loading={saveBtnLoading}
              disabled={saveBtnDisabled}
              type="primary" style={{marginLeft:'8px'}}
              onClick={this.updateCluster}>
              保存
            </Button>
          </div>
          }
        </div>
        <div className="imgBox">
          <img src={clusterImg}/>
        </div>
        <Form className="clusterTable" style={{padding:'35px 0'}}>
          <div className="formItem">
            <Form.Item >
              <div className="h4 blod">集群名称：</div>
              { editCluster ?
                <Input {...nameProps} placeholder="输入集群名称" />
                :
                <span className="blod">{clusterName}</span>
              }
            </Form.Item>
            <Form.Item>
              <div className="h4">API Server：</div>
              <span>{apiUrl}</span>
            </Form.Item>
            <Form.Item>
              <div className="h4">API Token：</div>
              <span>{apiToken}</span>
            </Form.Item>

          </div>
          <div className="formItem">
            <Form.Item>
              <div className="h4 blod">&nbsp;</div>
            </Form.Item>
            <Form.Item>
              <div className="h4" style={{width:'90px'}}>服务出口列表：</div>
              { editCluster ?
              <Input {...bindingIPsProps } placeholder="输入服务出口列表，多个出口英文逗号分开" type="textarea" />
              :
              <span>{bindingIPs}</span>
              }
            </Form.Item>
            <Form.Item>
              <div className="h4" style={{width:'90px'}}>域名列表：</div>
              { editCluster ?
              <Input {...bindingDomainsProps} placeholder="输入域名列表，多个域名英文逗号分开" type="textarea" />
              :
              <span>{bindingDomains || '-'}</span>
              }
            </Form.Item>
          </div>
          <div className="formItem">
            <Form.Item>
              <div className="h4 blod">&nbsp;</div>
            </Form.Item>
            <Form.Item>
              <span className="h5" style={{verticalAlign:'top',lineHeight:'30px'}}>状态：&nbsp;&nbsp;</span>
              {
                isOk
                ? <span style={{ color: '#33b867' }}><i className="fa fa-circle"></i> 正常</span>
                : <span style={{ color: '#f23e3f' }}><i className="fa fa-circle"></i> 异常</span>
              }
            </Form.Item>
            <Form.Item>
              <span className="h5" style={{verticalAlign:'top',lineHeight:'30px'}}>描述：&nbsp;&nbsp;</span>
              { editCluster ?
              <Input {...descProps} type="textarea" placeholder="添加描述" defaultValue={description} />
              :
              <Input value={description || '-'} type="textarea" disabled={true}  style={{width:'70%'}}/>
              }
            </Form.Item>
          </div>
        </Form>
        <Modal title={`删除集群`}
          confirmLoading={this.state.deleteClusterBtnLoading}
          className='deleteClusterModal'
          visible={this.state.deleteClusterModal}
          onOk={this.confirmDeleteCluster}
          onCancel={() => this.setState({deleteClusterModal: false})}>
          <div style={{ color: '#00a0ea', height: "50px" }}>
            <Icon type='exclamation-circle-o' />
            &nbsp;&nbsp;&nbsp;确定要删除“{clusterName}”？
          </div>
          <div className="note">注意：请确认执行删除集群操作！
该操作会导致将选中的集群与当前控制台Portal解绑，完全脱离当前控制台的管理，但不影响该集群的容器应用等的运行状态。</div>
        </Modal>
      </Card>
    )
  }
})

function parseArray(array) {
  try {
    array = JSON.parse(array)
  } catch (error) {
    array = []
  }
  return array
}

function formChange(porps, fileds) {
  saveBtnDisabled = false
}

ClusterInfo = Form.create({
  onFieldsChange: formChange
})(ClusterInfo)

function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  updateCluster,
  loadClusterList,
  deleteCluster,
})(ClusterInfo)