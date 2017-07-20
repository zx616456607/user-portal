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
import { Card, Row, Col, Form, Input, Button, Checkbox, Collapse, Icon, Table, Tooltip } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/selectPacket.less'
const FormItem = Form.Item;
const ButtonGroup = Button.Group;

class SelectPacket extends Component{
  constructor(props) {
    super(props)
    this.state = {
      sortedInfo: {}
    }
  }
  handleChange(pagination, filters, sorter) {
    console.log('各类参数是', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  }
  remove(value) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    let envKeys = getFieldValue('envKeys') || []
    setFieldsValue({
      envKeys: envKeys.filter((key) => {
        return key !== value;
      })
    });
  }
  addEnvList() {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    // can use data-binding to get
    let envKeys = getFieldValue('envKeys');
    if (envKeys === undefined) {
      envKeys = []
    }
    const validateFieldsKeys = []
    envKeys.forEach(key => {
      if (key.deleted) {
        return
      }
    })
    
    validateFields(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      let last = envKeys[envKeys.length - 1]
      let uid = last || 0
      uid ++
      envKeys = envKeys.concat(uid)
      setFieldsValue({
        envKeys,
      })
    })
  }
  render() {
    let { sortedInfo } = this.state;
    sortedInfo = sortedInfo || {};
    const { getFieldProps, getFieldValue } = this.props.form;
    getFieldProps('envKeys', {
    });
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 9 },
    };
    const formLabel = {
      wrapperCol: { span: 20, offset: 1}
    }
  
    const envList = getFieldValue('envKeys') && getFieldValue('envKeys').map((item,index)=>{
      return(
        <Row className="envList" key={index}>
          <Col span={10}>
            <FormItem
              {...formLabel}
            >
              <Input size="large" {...newKey}/>
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              {...formLabel}
            >
              <Input size="large" {...newValue}/>
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
    
    })
    const newValue = getFieldProps('newValue',{
    
    })
    const data = [{
      key: '1',
      label: '胡斌',
      name: 32,
      type: '南湖区湖底公园1号',
      time: '2017'
    },{
      key: '2',
      label: '胡斌',
      name: 32,
      type: '南湖区湖底公园1号',
      time: '2017'
    }];
    const columns = [{
      title: '版本标签',
      dataIndex: 'label',
      key: 'label',
    }, {
      title: '包名称',
      dataIndex: 'name',
      key: 'name'
    }, {
      title: '包类型',
      dataIndex: 'type',
      key: 'type',
    },{
      title: '上传时间',
      dataIndex: 'time',
      key: 'time',
      sorter: (a, b) => a.time - b.time,
      sortOrder: sortedInfo.columnKey === 'time' && sortedInfo.order,
    },{
      title: '操作',
      render: () => <Button type="primary" size="large">部署</Button>
    }];
    const searchValue = getFieldProps('searchValue', {
    
    });
    return(
      <div className="selectPacket">
        <Form id="selectPacketForm">
          <FormItem
            label="选择部署包"
            {...formItemLayout}
          >
            <Input placeholder="请输入包名称或标签搜索" size="large" {...searchValue}/>
            <Button type="primary" className="toUploadBtn" size="large">去上传部署包</Button>
          </FormItem>
          <Row>
            <Col offset={3}>
              <Table columns={columns} dataSource={data} onChange={this.handleChange.bind(this)} pagination={false} />
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

})(Form.create()(SelectPacket))