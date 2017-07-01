/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Wrap Manage list component
 *
 * v0.1 - 2017-6-30
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Modal, Table, Icon, Form, Radio, Button, Tabs, Card, Input, Upload, Select } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link, browserHistory } from 'react-router'
import Title from '../Title'
import './style/AppWrapManage.less'
import NotificationHandler from '../../components/Notification'
const RadioGroup = Radio.Group
const Dragger = Upload.Dragger
const TabPane = Tabs.TabPane

class UploadModal extends Component {
  constructor(props) {
    super()
    this.state = {
      protocol: 'ftp',
      type: 'local'
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible) {
      this.props.form.resetFields()
    }
  }
  handleSubmit() {
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!');
        return;
      }
      console.log('Submit!!!');
      console.log(values);
    });
  }
  changeprotocol = (e) => {
    this.setState({protocol: e.target.value})
  }
  changeTabs = (type)=> {
    this.setState({type})
  }
  render() {
    const { form, func} = this.props
    const { type } = this.state
    const isReq = type =='local' ? false : true
    const versionLabel = form.getFieldProps('versionLabel',{
      rules: [{required: true,whitespace: true, message: '请输入版本'}]
    })
    const protocolUrl = form.getFieldProps('protocolUrl',{
      rules: [{required: isReq,whitespace: true, message: '请输入远程地址'}]
    })
    const formItemLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 20 },
    }
    const selfProps = {
      name: 'file',
      showUploadList: false,
      action: '/upload.do',
      beforeUpload(file) {
        console.log('file', file)
        const notificat = new NotificationHandler()
        if (file.size > 5 * 1024 * 1024) {
          notificat.error('文件大小应小于5M！')
          return false
        }
        return true
      }
    }
    return (
      <Modal title="上传包文件" visible={this.props.visible}
        onCancel={() => func.uploadModal(false)}
        onOk={()=> this.handleSubmit()}
        maskClosable={false}
        okText="立即提交"
        className="uploadModal"
        >
        <Form>
            <Form.Item {...formItemLayout} label="上传方式">
            <Select defaultValue="jar" style={{ width: '300px' }}>
              <Select.Option key="jar">Jar</Select.Option>
              <Select.Option key="war">War</Select.Option>
            </Select>
            </Form.Item>
            <Form.Item {...formItemLayout} label="版本标签">
              <Input {...versionLabel} placeholder="请输入版本标签来标记此次上传文件" style={{ width: '300px' }} />
            </Form.Item>
          <br />
          <Tabs defaultActiveKey="local" onChange={this.changeTabs} size="small">
            <TabPane tab="本地上传" key="local">
              <div className="dragger">
                <Dragger {...selfProps}>
                  拖动文件到这里以上传，或点击 <a>选择文件</a>
                </Dragger>
              </div>
            </TabPane>
            <TabPane tab="远程上传" key="remote">
              <Form.Item {...formItemLayout} label="协议">
              <RadioGroup onChange={this.changeprotocol} value={this.state.protocol}>
                <Radio key="ftp" value="ftp">ftp</Radio>
                <Radio key="http|https" value="http|https">http | https</Radio>
              </RadioGroup>
              </Form.Item>
              <Form.Item {...formItemLayout} label="地址">
                <Input {...protocolUrl} style={{ width: '300px' }} placeholder="请输入远程文件地址，如 ftp://server.helloworld.jar" />
              </Form.Item>
              <Form.Item {...formItemLayout} label="用户名">
                <Input style={{ width: '200px' }} placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item {...formItemLayout} label="密码">
                <Input style={{ width: '200px' }} placeholder="请输入密码" />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    )
  }
}

const UploadForm = Form.create()(UploadModal)

class WrapManage extends Component {
  constructor(props) {
    super()
    this.state = {
      selectedRowKeys: []
    }
  }
  uploadModal = (modal) => {
    this.setState({ uploadModal: modal })
  }
  deleteAction(status) {
    this.setState({delAll: status})
  }
  deleteVersion = ()=> {
    const notificat = new NotificationHandler()
    notificat.success('删除成功')
    this.deleteAction(false)
  }
  render() {
    const dataSource = [
      {
        version: 'demo-2.1',
        name: 'app-hello.jar',
        type: 'Jar',
        uploadTime: '2017-04-16:09:12:09'
      }, {
        version: 'demo-2.2',
        name: 'app-hello.war',
        type: 'War',
        uploadTime: '2017-08-11:09:12:09'
      }
    ]
    const columns = [
      {
        title: '版本标签',
        dataIndex: 'version',
        key: 'version',
        render: (text) => <Link>{text}</Link>
      }, {
        title: '包名称',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '包类型',
        dataIndex: 'type',
        key: 'type',
      }, {
        title: '上传时间',
        dataIndex: 'uploadTime',
        key: 'uploadTime',
      }, {
        title: '操作',
        dataIndex: 'actions',
        key: 'actions',
        render: () => [
          <Button type="primary" key="1">部署</Button>,
          <Button key="2" style={{ marginLeft: 10 }} onClick={()=> this.deleteAction(true)}>删除</Button>
         ]
      }
    ]
    const paginationOpts = {
      size: "small",
      pageSize: 10,
      total: dataSource.length,
      // onChange: current => func.loadData({ page: current }),
      showTotal: total => `共计： ${total} 条 `,
    }
    const funcCallback = {
      uploadModal: this.uploadModal
    }
    const _this = this
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys, // 控制checkbox是否选中
      onChange(selectedRowKeys, selectedRows) {
        // const strategyID = selectedRows.map((list)=> {
        //   return list.strategyID
        // })
        _this.setState({ selectedRowKeys })
      }
    }

    return (
      <QueueAnim>
        <Title title="应用包管理" />
        <div key="wrap_list" id="app_wrap_manage">
          <div className="btnRow">
            <Button size="large" type="primary" icon="plus" onClick={() => this.uploadModal(true)}>上传包文件</Button>
            <Button size="large" style={{ margin: '0 10px' }}><i className='fa fa-refresh' />&nbsp;刷 新</Button>
            <Button size="large" onClick={()=> this.deleteAction(true)} icon="delete" style={{ marginRight: '10px' }} disabled={this.state.selectedRowKeys.length == 0}>删 除</Button>
            <Input size="large" style={{ width: 180 }} placeholder="请输入包名称或标签搜索" />
          </div>
          <Card className="wrap_content">
            <Table className="strategyTable" rowSelection={rowSelection} dataSource={dataSource} columns={columns} pagination={paginationOpts} />
          </Card>
        </div>

        <UploadForm func={funcCallback} visible={this.state.uploadModal}/>
        <Modal title="删除操作" visible={this.state.delAll}
          onCancel={()=> this.deleteAction(false)}
          onOk={this.deleteVersion}
          >
          <div className="confirmText">确定要删除所选版本？</div>
        </Modal>
      </QueueAnim>
    )
  }
}

export default WrapManage