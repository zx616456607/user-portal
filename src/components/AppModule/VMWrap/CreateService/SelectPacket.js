/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: create service
 *
 * v0.1 - 2017-07-18
 * @author ZhangXuan
 */

import React,{ Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Card, Row, Col, Form, Input, Button, Checkbox, Collapse, Icon, Table, Tooltip, Pagination } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/selectPacket.less'
import { wrapManageList } from '../../../../actions/app_center'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../constants'
const FormItem = Form.Item;
const ButtonGroup = Button.Group;
import NotificationHandler from '../../../../components/Notification'

class SelectPacket extends Component{
  constructor(props) {
    super(props)
    this.state = {
      sortedInfo: {},
      selectedRowKeys: [],
      packageInfo: {},
      loading: false
    }
  }
  componentWillMount() {
    this.pageAndSerch(null)
  }
  handleChange(pagination, filters, sorter) {
    console.log('各类参数是', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  }
  remove(value) {
    const { form, scope } = this.props
    const { setFieldsValue, getFieldValue } = form
    let envKeys = getFieldValue('envKeys') || []
    let index = envKeys.indexOf(value)
    envKeys.splice(index,1)
    let env = scope.state.env;
    env.splice(index,1)
    scope.setState({env})
    setFieldsValue({
      envKeys: envKeys
    });
  }
  addEnvList() {
    const { form, scope } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    let notify = new NotificationHandler()
    // can use data-binding to get
    let envKeys = getFieldValue('envKeys');
    if (envKeys === undefined) {
      envKeys = []
    }
    if (envKeys && envKeys.length > 0) {
      let newKey = getFieldValue(`newKey${envKeys[envKeys.length-1]}`)
      let newValue = getFieldValue(`newValue${envKeys[envKeys.length-1]}`)
      if (!newKey) {
        return notify.info('请输入环境变量')
      }
      if (!newValue) {
        return notify.info('请输入环境变量值')
      }
    }
    let last = envKeys[envKeys && envKeys.length - 1]
    let uid = last || 0
    uid ++
    let envObj = {}
    let env = scope.state.env && scope.state.env.slice(0) || []
    env.push(envObj)
    scope.setState({env})
    envKeys = envKeys.concat(uid)
    setFieldsValue({
      envKeys,
    })
  }
  rowClick(record) {
    const { selectedRowKeys } = this.state;
    const { scope } = this.props;
    let newKeys = selectedRowKeys.slice(0)
    if (newKeys.indexOf(record.key) > -1) {
      newKeys.splice(newKeys.indexOf(record.key),1)
    }else {
      newKeys.push(record.key)
    }
    this.setState({
      selectedRowKeys:newKeys
    })
    scope.setState({
      packages: newKeys
    })
  }
  selectAll(selectedRows) {
    let arr = []
    for (let i = 0; i < selectedRows.length; i++) {
      arr.push(selectedRows[i].key)
    }
    this.setState({
      selectedRowKeys: arr
    })
  }
  addKey(arr) {
    for (let i = 0; i < arr.length; i++) {
      Object.assign(arr[i],{key:arr[i].id})
    }
  }
  pageAndSerch(value,n) {
    const { wrapManageList } = this.props;
    this.setState({
      loading: true
    })
    const query = {
      filter: value === null || value === '' || value === undefined ? '' : `fileName contains ${value}`,
      from: (n - 1) * 5 || 0,
      size: 5,
    }
    wrapManageList(query,{
      success: {
        func: res => {
          if (res.data.pkgs) {
            this.addKey(res.data.pkgs)
          }
          this.setState({
            packageInfo: res.data,
            loading: false
          })
        },
        isAsync: true
      },
      failed: {
        func: res => {

        },
        isAsync: true
      }
    })
  }
  envKeyCheck(rules,value,callback) {
    const { scope, form } = this.props;
    if (!value) {
      callback()
    }
    let env = scope.state.env;
    let envKeys = form.getFieldValue('envKeys')
    if (!envKeys) { return }
    clearTimeout(this.newKeyTimeout)
    this.newKeyTimeout = setTimeout(()=>{
      env[env.length - 1][value] = form.getFieldValue(`newValue${envKeys[envKeys && envKeys.length - 1]}`) || undefined
      scope.setState({
        env
      })
      callback()
    },ASYNC_VALIDATOR_TIMEOUT)
  }
  envValueCheck(rules,value,callback) {
    const { scope, form } = this.props;
    if (!value) {
      callback()
    }
    let env = scope.state.env;
    let envKeys = form.getFieldValue('envKeys')
    if (!envKeys) { return}
    let key = form.getFieldValue(`newKey${envKeys[envKeys &&envKeys.length - 1]}`)
    clearTimeout(this.newValueTimeout)
    this.newValueTimeout = setTimeout(()=>{
      let obj = {}
      env[env.length - 1][key] = value
      scope.setState({
        env
      })
      callback()
    },ASYNC_VALIDATOR_TIMEOUT)

  }
  render() {
    let { sortedInfo, selectedRowKeys, packageInfo, loading } = this.state;
    sortedInfo = sortedInfo || {};
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = this.props.form;
    getFieldProps('envKeys', {
    });
    const pageOption = {
      defaultCurrent: 1,
      defaultPageSize: 5,
      total: packageInfo.total,
      onChange: (n)=>this.pageAndSerch(null,n)
    }
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 9 },
    };
    const formLabel = {
      wrapperCol: { span: 20, offset: 1}
    }

    const envList = getFieldValue('envKeys') && getFieldValue('envKeys').map((item,index)=>{
      return(
        <Row className="envList" key={item}>
          <Col span={10}>
            <FormItem
              {...formLabel}
            >
              <Input autoComplete="off" size="large" {...getFieldProps(`newKey${item}`,{
                rules: [
                  {required: true, message: '请输入环境变量'},
                  { validator: this.envKeyCheck.bind(this)}
                ]
              })}/>
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              {...formLabel}
            >
              <Input size="large" autoComplete="off" {...getFieldProps(`newValue${item}`,{
                rules: [
                  {required: true, message: '请输入环境变量值'},
                  { validator: this.envValueCheck.bind(this)}
                ]
              })}/>
            </FormItem>
          </Col>
          <Col span={4}>
            <Tooltip title="删除">
              <Button
                className="deleteBtn"
                type="dashed"
                size="small"
                onClick={()=>this.remove(item)}
              >
                <Icon type="delete" />
              </Button>
            </Tooltip>
          </Col>
        </Row>
      )
    })
    const newKey = getFieldProps('newKey',{
      rules: [
        { validator: this.envKeyCheck.bind(this)}
      ]
    })
    const newValue = getFieldProps('newValue',{
      rules: [
        { validator: this.envValueCheck.bind(this)}
      ]
    })
    const columns = [{
      title: '版本标签',
      dataIndex: 'fileTag',
      key: 'fileTag',
    }, {
      title: '包名称',
      dataIndex: 'fileName',
      key: 'fileName'
    }, {
      title: '包类型',
      dataIndex: 'fileType',
      key: 'fileType',
    },{
      title: '上传时间',
      dataIndex: 'creationTime',
      key: 'creationTime'
    }];
    const rowSelection = {
      selectedRowKeys,
      onSelect:(record)=> this.rowClick(record),
      onSelectAll: (selected, selectedRows)=>this.selectAll(selectedRows),
    };
    return(
      <div className="selectPacket">
      <Row className="searchInputBox">
        <Col span={3} className="searchLabel">
          选择应用包 : &nbsp;&nbsp;
        </Col>
        <Col span={13}>
          <Row>
            <Col span={17} className="inputBox">
              <input onChange={(e)=>this.pageAndSerch(e.target.value)} placeholder="请输入包名称或标签搜索"/>
            </Col>
            <Col span={6} offset={1}>
              <Link to="/app_center/wrap_manage">
                <Button type="primary" className="toUploadBtn" size="large">去上传部署包</Button>
              </Link>
            </Col>
          </Row>

        </Col>
      </Row>

        <Form id="selectPacketForm">
          <Row>
            <Col offset={3} className="tableBox">
              <Table
                loading={loading}
                rowSelection={rowSelection}
                columns={columns}
                dataSource={packageInfo.pkgs}
                onChange={this.handleChange.bind(this)}
                pagination={false}
                onRowClick={(record)=>this.rowClick(record)}
              />
              <Pagination {...pageOption} />
            </Col>
          </Row>
          <Row>
            <Col span={3} className='formLabel'>
              环境变量 :
            </Col>
            <Col span={21}>
              <div className="envHeader">
                <Row>
                  <Col span={10}>键</Col>
                  <Col span={10}>值</Col>
                  <Col span={4}>操作</Col>
                </Row>
              </div>
              <div className="envBody">
                {envList}
              </div>
              <span className="addEnv">
              <Icon type="plus-circle-o" />
              <span onClick={()=>this.addEnvList()}>添加一个系统环境变量</span>
            </span>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}


function mapStateToProps(state, props) {

  return {

  }
}
export default connect(mapStateToProps, {
  wrapManageList
})(SelectPacket)