/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * container catalogue Modal component
 *
 * v0.1 - 2017-9-11
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Form, Select, Row, Col, Radio, Input, Tooltip, Icon, InputNumber, Button } from 'antd'
import { connect } from 'react-redux'
import './style/ContainerCatalogueModal.less'
import { isStorageUsed } from '../../common/tools'

const FormItem = Form.Item
const Option = Select.Option

class ContainerCatalogueModal extends Component {
  constructor(props) {
    super(props)
    this.typeChange = this.typeChange.bind(this)
    this.renderDifferentType = this.renderDifferentType.bind(this)
    this.renderHostType = this.renderHostType.bind(this)
    this.renderExclusiveType = this.renderExclusiveType.bind(this)
    this.renderShareType = this.renderShareType.bind(this)
    this.restFormvalue = this.restFormvalue.bind(this)
    this.state = {
      isResetComponent: false,
    }
  }

  restFormvalue(item){
    const { form } = this.props
    let itemKeys = Object.keys(item)
    if(!itemKeys.length){
      form.resetFields([
        'type',
        'mountPath',
        'strategy',
        'readOnly',
      ])
      return
    }
    const { type, mountPath, readOnly } = item
    form.setFieldsValue({
      type,
      mountPath,
      readOnly: readOnly || false,
    })
  }

  componentWillMount() {
    const { item } = this.props
    this.restFormvalue(item)
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = this.props
    if(!visible && nextProps.visible){
      this.restFormvalue(nextProps.item)
    }
  }

  typeChange(type){
    const { form } = this.props
    form.resetFields([
      'mountPath',
      'strategy',
      'readOnly',
    ])
    if(type == 'exclusive' || type === 'share'){
      form.resetFields([
        "type_1",
        "volume"
      ])
    }
    if(type == 'host'){
      form.setFieldsValue({
        'strategy': true
      })
    }
  }

  renderDifferentType(type, volume){
    switch(type){
      case 'host':
        return this.renderHostType()
      case 'exclusive':
        return this.renderExclusiveType(volume)
      case 'share':
        return this.renderShareType(volume)
      default:
        return null
    }
  }

  renderHostType(){
    const bind = false
    return <div>
      <Row className='host_node_row'>
        <Col span="4">绑定节点</Col>
        <Col span="17">
          {
            bind
              ? <span>已绑定  ubuntu-26 | 192.168.1.26</span>
              : <span>未绑定  如需保持数据一致性建议绑定具体节点</span>
          }
        </Col>
      </Row>
    </div>
  }

  renderExclusiveType(volume){
    if(volume === 'float'){
      const { form, isEdit } = this.props
      const { getFieldProps } = form
      return <div>
        <FormItem
          label="存储卷设置"
          labelCol= {{span: 4}}
          wrapperCol= {{span: 20}}
          className='volume_setting'
        >
          <FormItem className='name'>
            <Input
              placeholder="请输入存储名称"
              disabled={isEdit}
              {...getFieldProps('name', {
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('存储名称不能为空')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem className='size'>
            <InputNumber
              min={512}
              max={20480}
              disabled={isEdit}
              {...getFieldProps('size', {
                initialValue: 512,
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value){
                      return callback('不能为空')
                    }
                    return callback()
                  }
                }]
              })}
            />
          </FormItem>
          <FormItem className='type'>
            <Select
              disabled={isEdit}
              {...getFieldProps('volume_type', {
                initialValue: 'ext4',
                required: true,
                message: '不能为空'
              })}
            >
              <Option value="ext4" key="ext4">ext4</Option>
              <Option value="xfs" key="xfs">xfs</Option>
            </Select>
          </FormItem>
        </FormItem>
      </div>
    }
    return null
  }

  renderShareType(volume){
    const { isEdit } = this.props
    if(volume === 'float'){
      const { form } = this.props
      const { getFieldProps } = form
      const formItemLayout = {
        labelCol: {span: 4},
        wrapperCol: {span: 17}
      }
      return <FormItem
        label="存储设置"
        {...formItemLayout}
      >
        <Input
          placeholder="请输入存储名称"
          disabled={isEdit}
          {...getFieldProps('setting', {
            rules: [{
              validator: (rule, value, callback) => {
                if(!value){
                  return callback('存储设置不能为空')
                }
                return callback()
              }
            }]
          })}
        />
      </FormItem>
    }
    return null
  }

  addOrEditResult(type){
    const { getFieldInfo, form } = this.props
    this.setState({
      isResetComponent: true
    })
    if(type === 'cancel'){
      const obj = {
        type: 'cancel'
      }
      return getFieldInfo(obj)
    }
    if(type === 'confirm'){
      const validateArray = [
        'type',
        'mountPath',
        'strategy',
        'readOnly',
      ]
      let array = []
      const type = form.getFieldValue("type")
      if(type === 'exclusive'){
        array = [
          'type_1',
          'volume'
        ]
        const volume = form.getFieldValue('volume')
        if(volume === "float"){
          array = [
            'type_1',
            'url',
            'volume',
            'name',
            'size',
            'volume_type',
          ]
        }

      }
      if(type === 'share'){
        array = [
          'type_1',
          'volume'
        ]
        const volume = form.getFieldValue('volume')
        if(volume === "float"){
          array = [
            'type_1',
            'url',
            'volume',
            'setting'
          ]
        }
      }
      array.forEach(item => {
        validateArray.push(item)
      })
      form.validateFields(validateArray, (errors, values) => {
        if(!!errors){
          return
        }
        const obj = {
          type: 'confirm',
          values,
        }
        return getFieldInfo(obj)
      })
    }
    return null
  }

  render() {
    const { form, isEdit, containerList, volumes, from } = this.props
    const { getFieldProps, getFieldValue } = form
    const formItemLayout = {
    	labelCol: {span: 4},
    	wrapperCol: {span: 17}
    }
    const typeProps = getFieldProps('type', {
      rules: [{
        required: true,
        message: '存储类型不能为空'
      }],
      onChange: this.typeChange
    })
    let type = getFieldValue('type')
    let volumeProps
    let volume = undefined
    let typeWidth = "100%"
    if(type === 'exclusive' || type === "share"){
      typeWidth = 175
      volumeProps = getFieldProps('volume', {
        rules: [{
          required: true,
          message: '存储卷不能为空'
        }]
      })
      volume = form.getFieldValue('volume')
    }
    let unableToChangeType = false
    // 如果有多个容器，或者当前服务已开启弹性伸缩，不可以再选择 host 和 独享型
    if((containerList && containerList.length > 1) || isStorageUsed(volumes)){
      unableToChangeType = true
    }
    let volumeWidth = '100%'
    if(volume === 'float'){
      volumeWidth = 175
    }
    return(
      <div id='container_catalogue'>
        <div className="body">
          {
            from !== 'createApp' &&  <div className='alertRow'>
              服务中含有以下设置不能添加 <span style={{fontWeight: 'bold'}}>独享型或host存储：</span><br/>
              1.服务中的容器数量大于1个（不含1）；<br/>
              2.开启自动伸缩的服务；
            </div>
          }
          <Form>
            <FormItem
              label="存储类型"
              {...formItemLayout}
            >
              <FormItem style={{width: typeWidth, float: 'left'}}>
                <Select
                  placeholder="请选择存储类型"
                  disabled={isEdit}
                  {...typeProps}
                >
                  <Option key="host" value="host" disabled={unableToChangeType}>host</Option>
                  <Option key="exclusive" value="exclusive" disabled={unableToChangeType}>独享型</Option>
                  <Option key="share" value="share">共享型</Option>
                </Select>
              </FormItem>
              {
                type === 'exclusive' || type === "share"
                ? <FormItem className='not_host_type'>
                  <Select
                    placeholder="请选择"
                    disabled={isEdit}
                    {...getFieldProps('type_1', {
                      rules: [{
                        required: true,
                        message: '不能为空'
                      }]
                    })}
                  >
                    {
                      type === 'exclusive'
                      ? <Option type="RBD" value="RBD">RBD</Option>
                      : <Option type="nfs" value="nfs">nfs</Option>
                    }
                  </Select>
                </FormItem>
                : null
              }
            </FormItem>
            {
              type === 'exclusive' || type === "share"
                ? <FormItem
                    label="选择存储"
                    {...formItemLayout}
                  >
                    <FormItem style={{width: volumeWidth, float: 'left'}}>
                       <Select
                         placeholder="请选择存储卷"
                         disabled={isEdit}
                         {...volumeProps}
                       >
                      <Option key="float" value="float">动态生成一个存储卷</Option>
                      <Option key="11" value="11">存储卷1</Option>
                      <Option key="22" value="22">存储卷2</Option>
                    </Select>
                    </FormItem>
                    {
                      volume === 'float' && <FormItem className='not_host_type'>
                        <Select
                          placeholder="请选择一个server"
                          {...getFieldProps('url', {
                            rules: [{
                              validator: (rule, value, callback) => {
                                if(!value){
                                  return callback('地址不能为空')
                                }
                                return callback()
                              }
                            }]
                          })}
                        >
                          <Option key="123" value="123">123</Option>
                        </Select>
                      </FormItem>
                    }
                  </FormItem>
                : null
            }
            { this.renderDifferentType(type, volume)}
            <FormItem
              label="容器目录"
              {...formItemLayout}
            >
              <Input
                placeholder="请输入容器目录"
                {...getFieldProps('mountPath', {
                  rules: [{
                    validator: (rule, value, callback) => {
                      if(!value){
                        return callback('容器目录不能为空')
                      }
                      return callback()
                    }
                  }]
                })}
              />
            </FormItem>
            <FormItem
              label={<span>回收策略
            <Tooltip title={<div>
              <div>保留：服务删除时删除存储</div>
              <div>删除：删除服务时删除存储</div>
            </div>}>
              <Icon type="question-circle-o" className='question_icon'/>
            </Tooltip></span>}
              {...formItemLayout}
              className='strategy form_item_bottom'
            >
              <Radio.Group
                disabled={isEdit || type == 'host'}
                {...getFieldProps('strategy', {
                  initialValue: true,
                })}
              >
                <Radio key="yes" value={true}>保留</Radio>
                <Radio key="no" value={false} className='delete'>删除</Radio>
              </Radio.Group>
            </FormItem>
            <FormItem
              label="读写权限"
              {...formItemLayout}
              className='form_item_bottom'
            >
              <Radio.Group
                {...getFieldProps('readOnly', {
                  initialValue: false,
                })}
              >
                <Radio key="yes" value={false}>可读可写</Radio>
                <Radio key="no" value={true}>只读</Radio>
              </Radio.Group>
            </FormItem>
          </Form>
        </div>
        <div className="footer">
          <Button
            size="large"
            style={{ marginRight: 12}}
            onClick={this.addOrEditResult.bind(this, 'cancel')}
          >
            取消
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={this.addOrEditResult.bind(this, 'confirm')}
          >
            确定
          </Button>
        </div>
      </div>
    )
  }
}

function mapStateToProp(state, props) {

  return {

  }
}

ContainerCatalogueModal = Form.create()(ContainerCatalogueModal)

export default connect(mapStateToProp, {

})(ContainerCatalogueModal)