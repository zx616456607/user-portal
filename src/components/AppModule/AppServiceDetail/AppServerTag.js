/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * server tag component
 *
 * v0.1 - 2018-04-10
 * @author Lvjunfeng
 */

import React, { Component } from 'react'
//import { getSettingList, deleteSetting, batchEnable, batchDisable, ignoreSetting, deleteRecords } from '../../actions/alert'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
//import { calcuTime, formatDate } from '../../common/tools'
//import CreateAlarm from '../AppModule/AlarmModal'
//import CreateGroup from '../AppModule/AlarmModal/CreateGroup'
import {
  Icon, Table, Button, Input, Modal, Select,  Dropdown, Form,
  Menu, Pagination
} from 'antd'
//import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import './style/AppServerTag.less'
import NotificationHandler from '../../../components/Notification'
//import cloneDeep from 'lodash/cloneDeep'
// const Option = Select.Option
const FormItem = Form.Item;

class AppServerTag extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleManageTag = this.handleManageTag.bind(this)
    this.handleSelectEnter = this.handleSelectEnter.bind(this)
    this.handleSelectCancel = this.handleSelectCancel.bind(this)
    this.state = {
      manageTagVisible: false,
      //isEditTag: false,

    }
  }

  getInitialState() {
    return {
      sortedInfo: null,
    }
  }


  handleChange(pagination, filters, sorter) {
    console.log('各类参数是', pagination, filters, sorter);
    this.setState({
      sortedInfo: sorter
    })
  }

  setAgeSort(e) {
    e.preventDefault();
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'val',
      },
    });
  }

  handleManageTag() {
    this.setState({
      manageTagVisible: true
    })
  }

  handleSelectEnter() {

    this.setState({
      manageTagVisible: false
    })
  }

  handleSelectCancel() {

    this.setState({
      manageTagVisible: false
    })
  }

  render() {
    let { sortedInfo, manageTagVisible,  } = this.state;
   const { getFieldProps } = this.props.form;
    sortedInfo = sortedInfo || {};
    const columns = [
      {
        title: '类型',
        dataIndex: 'types',
        key: 'types',
        width: '20%',
        sorter: (a, b) => a.types.charCodeAt(0) - b.types.charCodeAt(0),
        sortOrder: sortedInfo.columnKey === 'types' && sortedInfo.order
      },
      {
        title: '键',
        dataIndex: 'keys',
        key: 'keys',
        width: '40%',
        sorter: (a, b) => a.keys.charCodeAt(0) - b.keys.charCodeAt(0),
        sortOrder: sortedInfo.columnKey === 'keys' && sortedInfo.order
      },
      {
        title: '值',
        dataIndex: 'val',
        key: 'val',
        width: '40%',
        sorter: (a, b) => a.val.charCodeAt(0) - b.val.charCodeAt(0),
        sortOrder: sortedInfo.columnKey === 'val' && sortedInfo.order
      },
    ];
    const data = [
      {
      key: '1',
      types: 'zSystem',
      keys: 'aio.111.dadaaaaa',
      val: 'zconflunce1',
    },{
      key: '2',
      types: 'gSystem',
      keys: 'rio.222.dadaa',
      val: 'aconflunce2',
    },{
      key: '3',
      types: 'ySystem',
      keys: 'cio.333.dadaaaa',
      val: 'fconflunce3',
    },{
      key: '4',
      types: 'dSystem',
      keys: 'sio.444.dada',
      val: 'bconflunce4',
    }]
    //const { total } = this.props.data
    return (
      <div className="appServerTag">
        <div className="topModual">
          <div className="topRow">
            <Button size="large" type="primary" onClick={this.handleManageTag}><Icon type="setting" /> 管理标签 </Button>
            <Modal title="服务标签管理" className="serverTagModal"
              visible={ manageTagVisible }
              onOk={this.handleSelectEnter} onCancel={this.handleSelectCancel}
            >
              <div className="manageTagContent">
                <div className="manageTagContTop">
                  <div className="serverTagKey">
                    <p>标签键</p>
                    <FormItem
                      id="control-input"
                    >
                      <Input id="control-input"
                        {...getFieldProps('tagKey',{
                          rules: [],
                          initialValue: "aaa"
                        })}
                      />
                      <Input id="control-input" placeholder="输入标签键" />
                    </FormItem>
                  </div>
                  <div className="serverTagVal">
                    <p>标签值</p>
                    <FormItem
                      id="control-input"
                    >
                      <Input id="control-input"
                      {...getFieldProps('tagVal',{
                          rules: [],
                          initialValue: "bbb"
                        })}/>
                      <Input id="control-input" placeholder="输入标签值" />
                    </FormItem>
                  </div>
                  <div className="serverTagOperate">
                    <p>操作</p>
                    <p className="operateDel"><Icon type="delete" /></p>
                    <p className="operateDel"><Icon type="delete" /></p>
                  </div>
                </div>
                <div className="manageTagDown">
                  <p> <Icon type="plus-circle-o" /> 添加一组标签 </p>
                </div>
              </div>

            </Modal>
          </div>
          <div className='pageBox'>
            <span className='totalPage'>共计 "total 条</span>
            <Pagination
              simple
              className='inlineBlock'
            //onChange={(page)=> this.onPageChange(page)}
              current={ 1 }  // currentPage
              //pageSize={ size }     // size
                />  {/*total={ total }*/}
          </div>
        </div>
        <div className="tableModual">
          <Table
            className="serverTagTable"
            columns={columns}
            dataSource={data}
            onChange={this.handleChange}
            pagination={false}
          />
        </div>
      </div>
    )
  }
}

AppServerTag = Form.create()(AppServerTag)

//total
// data  获取
export default AppServerTag
