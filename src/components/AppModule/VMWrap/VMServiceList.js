/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: service list
 *
 * v0.1 - 2017-07-18
 * @author ZhangXuan
 */

import React from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Button, Table, Menu, Dropdown, Pagination, Modal, Row, Col, Input, Form } from 'antd'
import QueueAnim from 'rc-queue-anim'
import CommonSearchInput from '../../CommonSearchInput'
import './style/VMServiceList.less'
import { getVMserviceList, vmServiceDelete, serviceDeploy, updateVMService } from '../../../actions/vm_wrap'
import { UPDATE_INTERVAL } from '../../../constants'
import NotificationHandler from '../../../components/Notification'
import TenxStatus from '../../TenxStatus/index'
import Title from '../../Title'

const notify = new NotificationHandler()

class VMServiceList extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      selectedRowKeys: [],
      service: [],
      current: 1,
      name: '',
      loading: false,
      searchValue: "",
      isShowRePublishModal: false,
      currApp: {},
      reConfirmLoading: false,
      total: 0,
      tomcat_name: '',
      prune: false, // true 删除 false 移除
      isShowUpdateAddrModal: false,
      updateAddrConfirmLoading: false,
      temp_addr1: '',
    }
  }
  componentWillMount() {
    const { searchValue } = this.state
    this.pageAndSerch(searchValue,1,true)
  }
  componentDidMount() {
    this.updateServiceStatus = setInterval(()=>{
      this.pageAndSerch(null,1,false)
    },UPDATE_INTERVAL)
  }
  componentWillUnmount() {
    clearInterval(this.updateServiceStatus)
  }
  addKey(arr) {
    for (let i = 0; i < arr.length; i++) {
      Object.assign(arr[i],{key:arr[i].serviceId})
    }
  }
  handleButtonClick(record) {
    this.setState({
      reConfirmLoading: true,
    }, () => {
      const { serviceDeploy } = this.props;
      const { searchValue } = this.state;
      serviceDeploy(record.serviceId,{
        success: {
          func: res => {
            this.pageAndSerch(searchValue,1,true)
            notify.success('重新部署成功')
            this.setState({
              isShowRePublishModal: false,
              currApp: {},
            })
          },
          isAsync: true
        },
        failed:{
          func: res => {
            if (res.statusCode === 400){
              this.pageAndSerch(searchValue,1,true)
              notify.warn('传统应用环境已被删除（或无法连接），请重新添加部署环境\n')
              return
            }
            this.pageAndSerch(searchValue,1,true)
            notify.error('重新部署失败')
          },
          isAsync: true
        },
        finally: {
          func: () => {
            this.setState({
              reConfirmLoading: false,
            })
          }
        }
      })
    })
  }

  handleMenuClick(e,record) {
    if (e.key === 'delete') {
      this.setState({
        currApp: record,
        deleteVisible: true,
        prune: true,
      })
      return
    }
    if (e.key === 'prune') {
      this.setState({
        currApp: record,
        deleteVisible: true,
        prune: false,
      })
      return
    }
    if (e.key === 'update') {
      const healthCheck = record.healthCheck || ''
      let temp_addr1 = '',
        temp_addr2 = ''
      if (healthCheck) {
        healthCheck.split('/').forEach((item, index) => {
          if (index === 0) {
            temp_addr1 = item
            return
          }
          if (index <= 3) {
            temp_addr1 += '/' + item
            return
          }
          if (index > 3) {
            temp_addr2 += '/' + item
            return
          }
        })
      }
      this.setState({ isShowUpdateAddrModal: true, currApp: record, temp_addr1 })
      this.props.form.setFieldsValue({
        checkAddr: temp_addr2,
      })
      return
    }
  }

  cancelModal = () => {
    this.setState({
      deleteVisible: false,
    })
  }

  confirmModal = () => {
    const { vmServiceDelete } = this.props;
    const { currApp, searchValue, prune } = this.state
    notify.spin('删除中')
    this.setState({
      confirmLoading: true
    })
    vmServiceDelete({
      serviceId: currApp.serviceId,
      prune,
    },{
      success: {
        func: () => {
          notify.close()
          this.pageAndSerch(searchValue,1,true)
          notify.success('删除应用成功')
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          notify.close()
          notify.error('删除应用失败')
        },
      },
      finally: {
        func: () => {
          this.setState({
            deleteVisible: false,
            confirmLoading: false,
          })
        },
      },
    })
  }
  rowClick(record) {
    const { selectedRowKeys } = this.state;
    let newKeys = selectedRowKeys.slice(0)
    if (newKeys.indexOf(record.key) > -1) {
      newKeys.splice(newKeys.indexOf(record.key),1)
    }else {
      newKeys.push(record.key)
    }
    this.setState({
      selectedRowKeys:newKeys
    })
  }

  pageAndSerch(name, n, flag) {
    const { getVMserviceList } = this.props;
    const { current, tomcat_name } = this.state
    if (flag) {
      this.setState({
        loading: true
      })
    }
    getVMserviceList({
      page: current,
      size: 10,
      name,
      tomcat_name,
    },{
      success: {
        func: (res) => {
          this.addKey(res.results)
          this.setState({
            service:res.results,
            total:res.count,
            name,
            loading: false
          })
        },
        isAsync:true
      },
      failed: {
        func: res => {
          this.setState({
            service: [],
            loading: false
          })
          if (res.statusCode >= 500) {
            notify.warn('传统应用环境服务端异常', '请联系管理员检查后端相关服务')
          }
        }
      }
    })
  }
  getServiceStatus(status) {
    let phase,progress = {status: false};
    if (status === 0) {
      phase = 'Deploying'
      progress = {status: true}
    } else if (status === 1) {
      phase = 'UploadPkgAndEnvFailed'
    } else if (status === 2) {
      phase = 'UploadPkgAndEnvSuccess'
    } else if (status === 3) {
      phase = 'ServiceInitFailed'
    } else if (status === 4) {
      phase = 'ServiceNormalFailed'
    } else {
      phase = 'Running'
    }
    return <TenxStatus phase={phase} progress={progress}/>
  }
  onPublishOk = () => {
    this.handleButtonClick(this.state.currApp)
  }

  onUpdateAddrOk = () => {
    const { form: { validateFields } } = this.props
    validateFields([ 'checkAddr' ], (err, values) => {
      if (err) return
      const { checkAddr } = values
      const { temp_addr1, currApp } = this.state
      const check_address = temp_addr1 + checkAddr
      if (check_address && check_address.length > 128) {
        // notify.close()
        // return notify.warn('前后完整地址不超过 128 个字符')
        return
      }
      const query = {
        healthcheck: {
          check_address,
        },
      }
      this.setState({
        updateAddrConfirmLoading: true,
      }, () => {
        this.props.updateVMService(currApp.serviceId, query, {
          success: {
            func: () => {
              this.setState({
                currApp: {},
                isShowUpdateAddrModal: false,
              })
              notify.success('修改服务地址成功')
            },
          },
          finally: {
            func: () => {
              this.setState({
                updateAddrConfirmLoading: false,
              })
            },
          },
        })
      })
    })
  }
  render() {
    const { service, total, loading, deleteVisible, prune,
      confirmLoading, searchValue, isShowRePublishModal,
      isShowUpdateAddrModal, updateAddrConfirmLoading, temp_addr1,
      currApp, reConfirmLoading } = this.state

    const columns = [{
      title: '应用名',
      dataIndex: 'serviceName',
      key: 'serviceName'
    }, {
      title: '描述',
      width: '15%',
      dataIndex: 'description',
      key: 'description',
      render:text => text || '-',
    }, {
      title: '状态',
      width: '15%',
      dataIndex: 'serviceStatus',
      key: 'serviceStatus',
      render:(text,record) => this.getServiceStatus(text)
    }, {
      title: '部署包（版本标签）',
      width: '10%',
      dataIndex: 'packages',
      key: 'packages',
      render:text => text&&text.length ? text : '-',
    },{
      title: '部署环境IP',
      dataIndex: 'host',
      key: 'host',
      width: '10%'
    },{
      title: '环境实例',
      dataIndex: 'tomcatInstance',
      key: 'tomcatInstance',
      width: '10%',
      // render: tomcats => <div>{tomcats.map(item => item.name).join('<br />')}</div>
    },{
      title: '服务地址',
      dataIndex: 'healthCheck',
      width: '15%',
      render: text => <a href={text} target="_blank">{text}</a>
    },{
      title: '最后修改人',
      dataIndex: 'updateUserName',
      key: 'updateUserName'
    },{
      title: '操作',
      render: (text,record)=>{
        const menu = (
          <Menu onClick={(e)=>this.handleMenuClick(e,record)}>
            <Menu.Item key="update">&nbsp;修改服务地址&nbsp;&nbsp;</Menu.Item>
            <Menu.Item key="prune">&nbsp;移除应用&nbsp;&nbsp;</Menu.Item>
            <Menu.Item key="delete">&nbsp;删除应用&nbsp;&nbsp;</Menu.Item>
          </Menu>
        )
        return (
          <Dropdown.Button onClick={() => this.setState({ isShowRePublishModal: true, currApp: record })} overlay={menu} type="ghost">
            重新部署
          </Dropdown.Button>
        )
      }
    }];

    const pageOption = {
      simple: true,
      defaultCurrent: 1,
      defaultPageSize: 10,
      total,
      onChange: current => this.setState({
        current,
      }, () => {
        this.pageAndSerch(null, current, true)
      })
    }
    const { form: { getFieldProps } } = this.props
    return (
      <QueueAnim>
        <div key='vmServiceList' className="vmServiceList">
          <Modal
            title={(prune ? '删除' : '移除') + '传统应用'}
            visible={deleteVisible}
            confirmLoading={confirmLoading}
            onCancel={this.cancelModal}
            onOk={this.confirmModal}
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle"/>
              {
                !prune ? '将传统应用从平台移出，不影响应用运行，是否确定移除？' : '确定删除该传统应用？'
              }
            </div>
          </Modal>
          {
            isShowRePublishModal ?
              <Modal
                title="重新部署"
                visible={isShowRePublishModal}
                confirmLoading={reConfirmLoading}
                onOk={this.onPublishOk}
                onCancel={() => this.setState({ isShowRePublishModal: false, currApp: {} })}
              >
                <div className="deleteRow">
                  <i className="fa fa-exclamation-triangle"/>
                  确定重新部署应用 {currApp.serviceName} ？
                </div>
              </Modal>
              :
              null
          }
          {
            isShowUpdateAddrModal ?
              <Modal
                title="修改服务地址"
                visible={isShowUpdateAddrModal}
                confirmLoading={updateAddrConfirmLoading}
                onOk={this.onUpdateAddrOk}
                onCancel={() => this.setState({ isShowUpdateAddrModal: false, currApp: {} })}
                width={600}
              >
                <Form>
                  <Col span={3}><div style={{ textAlign: 'right', lineHeight: '30px' }}>检查路径 :</div></Col>
                  <Col span={10}><Input style={{ width: '95%' }} disabled={true} value={temp_addr1} /></Col>
                  <Col span={10}><Form.Item><Input {...getFieldProps('checkAddr', {
                    rules: [
                      { validator: (rules, value, callback) => {
                        if (!!value && temp_addr1 && (temp_addr1.length + value.length) > 128) {
                          return callback(new Error('前后完整地址不超过 128 个字符'))
                        }
                        callback()
                      } },
                    ],
                  })} placeholder="例如: /index.html"/></Form.Item></Col>
                </Form>
              </Modal>
              :
              null
          }
          <Title title="传统应用"/>
          <div className="serviceListBtnBox">
            <Button type="primary" size="large" onClick={()=>browserHistory.push('/app_manage/vm_wrap/create')}><i className="fa fa-plus" /> 创建传统应用</Button>
            <Button type="ghost" size="large" onClick={()=>browserHistory.push('/app_manage/vm_wrap/import')}>导入传统应用</Button>
            <Button size="large" className="refreshBtn" onClick={()=>this.pageAndSerch(searchValue,1,true)}><i className='fa fa-refresh'/> 刷 新</Button>
            {/*<Button size="large" icon="delete" className="deleteBtn">删除</Button>*/}
            <CommonSearchInput onChange={searchValue => this.setState({searchValue})} onSearch={(value)=>{this.pageAndSerch(value,1,true)}} size="large" placeholder="请输入应用名搜索"/>
            <CommonSearchInput style={{ width: 150 }} onChange={tomcat_name => this.setState({ tomcat_name })} onSearch={() => this.pageAndSerch(searchValue, 1, true)} size="large" placeholder="请输入环境实例搜索"/>
            { total >0 &&
              <div style={{position:'absolute',right:'20px',top:'30px'}}>
              <Pagination {...pageOption}/>
              <span className="pull-right totalNum">共计 {total} 条</span>
              </div>
            }
          </div>
          <Table loading={loading} pagination={false} columns={columns} dataSource={service} onRowClick={(record)=>this.rowClick(record)}/>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, {
  getVMserviceList,
  vmServiceDelete,
  serviceDeploy,
  updateVMService,
})(Form.create()(VMServiceList))
