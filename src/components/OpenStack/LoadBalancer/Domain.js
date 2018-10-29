/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balancer Domain
 *
 * v0.1 - 2018-2-24
 * @author baiyu
 */

import React, { Component } from 'react'
import { Button, Table, Form, Input, Select, Modal, Card } from 'antd'
import { connect } from 'react-redux'
// import './style/LoadBalancerDetail.less'
import newworkImg from '../../../../static/img/cluster/networksolutions.svg'
import { browserHistory } from 'react-router'
import { IP_REGEX, HOST_REGEX } from '../../../../constants'
import { loadLbDomain, createLbDomain, deleteLbDomain } from '../../../actions/openstack/lb_real'
import NotificationHandler from '../../../common/notification_handler'
const notification = new NotificationHandler

class Domains extends Component {
  constructor(props) {
    super(props)
    this.openCreateDNSModal = this.openCreateDNSModal.bind(this)
    this.confirmCreate = this.confirmCreate.bind(this)
    this.confirmDelete = this.confirmDelete.bind(this)
    this.state = {
      selectedRowKeys: [],
      createDNSVisible: false,
      confirmLoading: false,
      currentItem: {},
      dnsListeners: []
    }
    this.uuid = 0
    this.template = {
      "domain": {
        "domain": "www.a.com",
        "virtualServerPools": [{
          "poolName": "pool1",
          "dataCenters": [{
            "dataCneterName": "dns2",
            "servers": [{
              "serverName": "dns2",
              "vips": [
                "1.2.3.5",
                "2.2.3.6"
              ]
            }]
          },
          {
            "dataCneterName": "dns31",
            "servers": [{
              "serverName": "dns31",
              "vips": [
                "1.2.3.6",
                "2.2.3.7"
              ]
            }]
          }
          ]
        }]
      }
    }

  }
  componentWillMount() {
    this.loadData()
  }
  formatStatus() {
    let { status } = this.props.location.query
    switch (status.toUpperCase()) {
      case 'ERROR':
        return <span className='stop'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 错误</span>
      case 'ACTIVE':
        return <span className='running'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 已启动</span>
      case 'CONNECTED':
        return <span className='running'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 已连接</span>
      case 'BUILDING': {
        return <span className='padding'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 创建中</span>
      }
      case 'SHUTOFF':
        return <span className='padding'><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 停止</span>
      case 'UNKNOWN':
      default:
        return <span style={{ color: '#999' }}><i className="fa fa-circle circleIcon" aria-hidden="true"></i> 未知</span>
    }
  }
  loadData() {
    let { name } = this.props.params
    this.setState({ isFetching: true })
    this.props.loadLbDomain(name, {
      success: {
        func: (res) => {
          this.setState({
            domains: res.domains || [],
            isFetching: false
          })
        }
      },
      finally:{
        func:()=> {
          this.setState({isFetching: false})
        }
      }
    })
  }

  selectTableRow(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    })
  }

  openCreateDNSModal() {
    const { form } = this.props
    form.resetFields()
    this.setState({
      confirmLoading: false,
      createDNSVisible: true,
    })
    setTimeout(() => {
      this.refs.names.refs.input.focus()
    }, 400)
  }
  isJSON(str) {
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }

      } catch (e) {
        return false;
      }
    }
  }

  confirmCreate() {
    const { form, params } = this.props

    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      let isjson = this.isJSON(values.domains);
      if (!isjson) {
        notification.info('JSON 格式错误')
        return
      }
      this.setState({
        confirmLoading: true
      })
      this.props.createLbDomain(params.name, values.domains, {
        success: {
          func: () => {
            this.setState({
              createDNSVisible: false,
            })
            notification.success('创建成功')
            this.loadData()
          },
          isAsync: true
        },
        finally: {
          func: () => {
            this.setState({
              confirmLoading: false,
            })

          }
        }
      })
    })
  }

  deleteDNS(record) {
    this.setState({
      confirmLoading: false,
      deleteVisible: true,
      currentItem: record,
    })
  }

  confirmDelete() {
    const { currentItem } = this.state

    const body = {
      name: this.props.params.name,
      domain: currentItem.domain
    }
    this.setState({
      confirmLoading: true,
    })
    this.props.deleteLbDomain(body, {
      success: {
        func: () => {
          notification.success('删除成功')
          this.setState({ deleteVisible: false })
          this.loadData()
        },
        isAsync: true
      },
      finally: {
        func: () => {
          this.setState({ confirmLoading: false })
        }
      }
    })
  }

  checkOrg(rule, value, callback) {
    if (!value) {
      return callback('请输入域名')
    }
    if (!HOST_REGEX.test(value)) {
      return callback('域名输入有误')
    }
    callback()
  }

  addRows() {
    const { form } = this.props
    let keys = form.getFieldValue('keys')
    // let memberItem = form.getFieldValue('memberItem');
    const ruleMembers = []
    keys.map(item => {
      ruleMembers.push(`domain${item}`)
    })
    form.validateFields(ruleMembers, (error, values) => {
      if (error) return
      let repeat = false
      keys.every(key => {
        if (key !== this.uuid) {
          if (values[`domain${key}`] == values[`domain${this.uuid}`]) {
            repeat = true
            return false
          }
          return true
        }
        return true
      })
      if (repeat) {
        form.setFields({
          [`domain${this.uuid}`]: { errors: ['重复'], value: values[`domain${this.uuid}`] },
        })
        return
      }
      this.uuid++
      keys = keys.concat(this.uuid)
      form.setFieldsValue({
        keys,
      });
    })
  }

  render() {
    const { selectedRowKeys, domains } = this.state
    const { form, params } = this.props
    const { getFieldProps, getFieldValue } = form

    getFieldProps('keys', {
      initialValue: [],
    })
    let column = [
      {
        title: '域名',
        dataIndex: 'domain',
        width: '35%',
      }, {
        title: '操作',
        width: '23%',
        render: (text, record, index) => <div>
          {/* <Button type="primary" style={{marginRight:'8px'}} onClick={this.editDNS.bind(this, record)}>修改</Button>
          <Button onClick={this.deleteDNS.bind(this, record)}>释放</Button> */}
          <Button onClick={() => this.setState({ currentItem: record, deleteVisible: true })}>删除</Button>
        </div>
      },
    ]

    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 20 }
    }
    const domainsProps = getFieldProps('domains', {
      rules: [{ required: true, message:'请输入域名及参数'}]
    })

    const formItems = getFieldValue('keys').map((k) => {
      return (
        <div className="ant-row-flex ant-row-flex-end">
          <Form.Item key={k} className="ant-col-19">
            <Input placeholder='请输入域名' {...getFieldProps(`domain${k}`, {
              rules: [
                { validator: this.checkOrg }
              ],
            })} />
            <Select tags
              placeholder="请输入IP，输完回车"
              style={{ marginTop: 10 }}
              onSelect={(v) => this.checkIP(v)}
            >
            </Select>
          </Form.Item>
        </div>
      );
    });
    return (
      <div id='load_balancer_detail'>
        <div className='detail_header'>
          <span className="back" onClick={() => { browserHistory.push(`/base_station/load_balancer?activeKey=global`) }}>
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </span>
        </div>
        <div className='detailHeaderBox'>
          <div className='leftBox'>
            <img src={newworkImg} className='imgBox' />
          </div>
          <div className='rightBox'>
            <div className='name'>{params.name}</div>
            <div className='status'>运行状态: {this.formatStatus()} </div>
            <div className='type'>类型: <span>全局负载均衡</span></div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className="detailBodyBox wrap-page">
          <div className='page-header'>
            <Button type="primary" className='buttonMarign' size="large" onClick={this.openCreateDNSModal}>
              <i className="fa fa-plus buttonIcon" aria-hidden="true"></i>添加域名
            </Button>
            <Button size="large" onClick={() => this.setState({ template: true })}>
              <i className="fa fa-file-text buttonIcon" aria-hidden="true" />域名模板
            </Button>
            <Button className='buttonMarign' size="large" onClick={() => this.loadData()}>
              <i className="fa fa-refresh buttonIcon" aria-hidden="true"></i>刷新
            </Button>
            {/* <Button className='buttonMarign' size="large" onClick={this.deleteLoadBalancer}
              disabled={!selectedRowKeys.length}>
              <i className="fa fa-trash-o buttonIcon" aria-hidden="true"></i>删除
            </Button> */}
          </div>
          {domains && domains.length > 0 ?
            <div className='table-pagination'>
              共计 {domains.length} 条
            </div>
            : null
          }
          <Table
            dataSource={domains}
            columns={column}
            pagination={{ simple: true }}
            className="reset-ant-table"
            loading={this.state.isFetching}
          />
        </div>
        {
          this.state.createDNSVisible &&
          <Modal
            title="添加域名"
            visible={true}
            onOk={this.confirmCreate}
            onCancel={() => this.setState({ createDNSVisible: false })}
            maskClosable={false}
            confirmLoading={this.state.confirmLoading}
            wrapClassName="reset_form_item_label_style"
          >
            <Form>
              <Form.Item
                {...formItemLayout}
                label="域名"
              >
                <Input type="textarea" style={{ minWidth: '100%' }} autosize={{ minRows: 10, maxRows: 20 }} placeholder='请输入域名数据' {...domainsProps} ref="names" />
              </Form.Item>
            </Form>

          </Modal>

        }
        <Modal visible={this.state.template} title="域名模板"
          onCancel={() => this.setState({ template: false })}
          maskClosable={false}
          footer={<Button onClick={() => this.setState({ template: false })} size="large" type="ghost">关闭</Button>}
        >
          <Input type="textarea"
            value={JSON.stringify(this.template, '', 4)}
            style={{ minWidth: '100%' }}
            autosize={{ minRows: 10, maxRows: 20 }}
          />
        </Modal>
        <Modal
          title="释放域名"
          visible={this.state.deleteVisible}

          onOk={this.confirmDelete}
          onCancel={() => this.setState({ deleteVisible: false })}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
        >
          <div className="alertRow">
            您确定释放 <span style={{ color: '#58c2f6' }}>{this.state.currentItem.domain}</span> 这个域名吗？
          </div>
        </Modal>

      </div>
    )
  }
}

Domains = Form.create()(Domains)

function mapStateToProp(state, props) {

  return {}
}

export default connect(mapStateToProp, {
  loadLbDomain,
  createLbDomain,
  deleteLbDomain
})(Domains)