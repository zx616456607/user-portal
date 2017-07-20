/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: vm list
 *
 * v0.1 - 2017-07-18
 * @author ZhaoYanbei
 */

import React from 'react'
import {Button, Table, Row, Card, Modal, Icon, Form, FormItem, Input} from 'antd'
import './style/VMList.less'
import CommonSearchInput from '../../../components/CommonSearchInput'
import Title from '../../Title'

export default class VMServiceList extends React.Component {
  constructor(){
    super()
    this.state = {
      projectList: [],
      visible: false
    }
  }

  /**
   * 添加传统环境
   * @param res
   */
  handleAdd(res){

  }

  /**
   * 刷新信息
   */
  handleRefresh(){

  }

  /**
   * 删除信息
   */
  handleDel(){

  }

  /**
   * 编辑信息
   */
  handleE =()=> {
    this.setState({
      visible:true
    })
  }

  /**
   * 关闭
   */
  handleClose =()=>{
    this.setState({
      visible:false
    })
  }

  render() {
    const pagination = {
      simple: true,
      total:  this.state.projectList && this.state.projectList.length,
      showSizeChanger: true,
      defaultPageSize: 10,
      defaultCurrent: 1,
      pageSizeOptions: ['5', '10', '15', '20'],
    };
    const formItemLayout ={
      labelCol: { span: 5 },
      wrapperCol: { span: 17 }
    }
    const columns = [
      {
        title: (
          <div onClick="">
            虚拟机IP
            <div className="ant-table-column-sorter">
             {/* <span className={true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>*/}
            </div>
          </div>
        ),
        dataIndex: 'IP',
        key: 'IP',
        className: 'IP',
      },
      {
        title: (
          <div onClick="">
            登录账号
            <div className="ant-table-column-sorter">
            </div>
          </div>
        ),
        dataIndex: 'userName',
        key: 'userName',
      },
      {
        title: (
          <div onClick="">
            登录密码
            <div className="ant-table-column-sorter">
            </div>
          </div>
        ),
        dataIndex: 'passWord',
        key: 'passWord',
      },
      {
        title: (
          <div onClick="">
            服务数量
            <div className="ant-table-column-sorter">
              <span className={true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
               <i className="anticon anticon-caret-up" />
              </span>
              <span className={false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
               <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'serverNum',
        key: 'serverNum',
      },
      {
        title: (
          <div onClick={this.handleSortCreateTime}>
            创建时间
            <div className="ant-table-column-sorter">
            </div>
          </div>
        ),
        dataIndex: 'creationTime',
        key: 'creationTime',
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) =>{
          let style = {
            fontSize:2
          }
          let fStyle = {
            marginRight:6+'%'
          }
          return (
            <div className="addusers">
              <div className="Deleterechargea">
                <Button type="primary" className="addBtn" onClick={this.handleE}>编辑信息</Button>
                <Button size="large" onClick="">删除</Button>
              </div>
              <Modal
                title="添加传统环境"
                visible={this.state.visible}
                onOk={this.handleClose}
                onCancel={this.handleClose}
                okText="保存"
              >
                <Form>
                  <Form.Item
                    label="传统环境 IP"
                    {...formItemLayout}
                  >
                    <Input placeholder="请输入已开通 SSH 登录的传递环境 IP" />
                    <span style={style}>@传统环境一般指非容器环境（Linux的虚拟机、物理机等）</span>
                  </Form.Item>
                  <Form.Item

                    label="环境登录账号"
                    {...formItemLayout}
                  >
                    <Input placeholder="请输入传统环境登录账号" />
                  </Form.Item>
                  <Form.Item
                    label="环境登录密码"
                    {...formItemLayout}
                  >
                    <Input placeholder="请输入传统环境登录密码" />
                  </Form.Item>
                </Form>
              </Modal>
            </div>
          )
        }
      },
    ]

    const data = [{
      key: '1',
      IP: 'John Brown',
      userName: 32,
      passWord: 'New York No. 1 Lake Park',
      serverNum: 12,
    }, {
      key: '2',
      IP: 'John Brown',
      userName: 32,
      passWord: 'New York No. 1 Lake Park',
      serverNum: 12,
    }, {
      key: '3',
      IP: 'John Brown',
      userName: 32,
      passWord: 'New York No. 1 Lake Park',
      serverNum: 12,
    }];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User',    // Column configuration not to be checked
      }),
    };
    let style = {
     }
    return (
      <div id="VMList">
        {/*<Title title="环境" />*/}
        <Row>
          <Button type='primary' size='large'  className='addBtn' onClick=''>
            <i className='fa fa-plus' /> 创建项目
          </Button>
          <Button type="ghost" icon={ this.state.loading ? 'loading' : "reload"}  size="large" className="manageBtn" onClick={()=> this.handRefresh()}>刷新</Button>
          <Button type="ghost" icon="delete" size="large" className="manageBtn" onClick={()=> this.delProject()}>删除</Button>
          <CommonSearchInput placeholder="请输入虚拟机IP搜索" size="large" onSearch=''/>
          <div className="total">共{this.state.projectList.length}个</div>
        </Row>
        <Row>
          <Card>
            <Table
              rowSelection={rowSelection}
              loading={false}
              pagination={pagination}
              columns={columns}
              dataSource={data}
            />
          </Card>
        </Row>
      </div>
    )
  }
}