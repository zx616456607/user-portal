/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Wrap Manage list component
 *
 * v0.1 - 2017-12-05
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Modal, Form, Input, Button, Dropdown, Menu, Icon, Row, Col, Select } from 'antd'
import defaultApp from '../../../../static/img/appstore/defaultapp.png'
import './style/WrapDetailModal.less'

const FormItem = Form.Item
const Option = Select.Option;

class WrapDetailModal extends React.Component {
  constructor(props) {
    super(props)
    this.cancelModal = this.cancelModal.bind(this)
    this.cancelEdit = this.cancelEdit.bind(this)
    this.saveEdit = this.saveEdit.bind(this)
    this.state = {
      visible: false
    }
  }
  componentWillReceiveProps(nextProps) {
    const { visible: oldVisible } = this.props
    const { visible: newVisible } = nextProps
    if (!oldVisible && newVisible) {
      this.setState({
        visible: newVisible
      })
    }
  }
  
  cancelModal() {
    const { closeDetailModal } = this.props
    closeDetailModal()
    this.setState({
      visible: false
    })
  }
  
  cancelEdit() {
    this.setState({
      isEdit: false
    })
  }
  
  saveEdit() {
    this.setState({
      isEdit: false
    })
  } 
  
  render() {
    const { form } = this.props 
    const { visible, isEdit } = this.state
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const menu = (
      <Menu>
        <Menu.Item key="1">第一个菜单项</Menu.Item>
        <Menu.Item key="2">第二个菜单项</Menu.Item>
        <Menu.Item key="3">第三个菜单项</Menu.Item>
      </Menu>
    );
    const formItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 10},
    }
    let children = [];
    for (let i = 1; i < 6; i++) {
      children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }
    return(
      <Modal
        className="wrapDetail AppServiceDetail"
        transitionName="move-right"
        visible={visible}
        onCancel={this.cancelModal}
      >
        <div className="wrapDetailHeader">
          <img className="appLogo" src={defaultApp}/>
          <div className="nameAndTag">
            <div className="name">carrot/test-build</div>
            <div className="tag">版本：v1.0.1</div>
          </div>
          <div className="dropDown">
            <Dropdown.Button overlay={menu} type="ghost">
              某功能按钮
            </Dropdown.Button>
          </div>
        </div>
        <div className="wrapDetailBody">
          <div className="btnBox">
            {
              isEdit ? 
                [
                  <Button className="cancelBtn" key="cancel" size="large" onClick={this.cancelEdit}>取消</Button>,
                  <Button key="save" size="large" type="primary" onClick={this.saveEdit}>保存</Button>
                ] :
                <Button type="primary" size="large" onClick={() => this.setState({isEdit: true})}>编辑</Button>
            }
          </div>
          <div className="dataBox">
            <Row className="rowLabel">
              <Col span={3}>
                版本标签
              </Col>
              <Col span={10}>
                v1.0.1
              </Col>
            </Row>
            <FormItem
              label="分类名称"
              {...formItemLayout}
            >
              <Select
                showSearch={true}
                tags
                searchPlaceholder="标签模式"
                style={{ width: '100%' }}
              >
                {children}
              </Select>
            </FormItem>
            <FormItem
              label="发布名称"
              {...formItemLayout}
            >
              <Input/>
            </FormItem>
            <Row className="rowLabel">
              <Col span={3}>
                应用商店
              </Col>
              <Col span={10} className="successColor">
                已发布
              </Col>
            </Row>
            <Row className="rowLabel">
              <Col span={3}>
                包类型
              </Col>
              <Col span={10}>
                war
              </Col>
            </Row>
            <FormItem
              label="描述"
              {...formItemLayout}
            >
              <Input type="textarea"/>
            </FormItem>
            <Row className="rowLabel">
              <Col span={3}>
                上传时间
              </Col>
              <Col span={10}>
                2017.12.04 20:20:28
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    
  }
}

export default connect(mapStateToProps, {
  
})(Form.create()(WrapDetailModal))