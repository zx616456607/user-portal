/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Log Collection component
 *
 * v0.1 - 2017-6-20
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Form, Radio, Input, Collapse, Row, Col, Switch, Icon, Tooltip } from 'antd'
import { connect } from 'react-redux'
import './style/LogCollection.less'

const Panel = Collapse.Panel
const FormItem = Form.Item
const RadioGroup = Radio.Group

class LogCollection extends Component {
	constructor(props){
    super(props)
    this.directoryTemplate = this.directoryTemplate.bind(this)
    this.state = {

    }
  }

  directoryTemplate(sourceType){
    const { formItemLayout, form } = this.props
    const { getFieldProps, getFieldValue } = form
    let pathProps
    let inregexProps
    let exregexProps
    if(sourceType == 'directory'){
      pathProps = getFieldProps('path',{
        rules: [
          { required: true, message: '请填写日志目录' }
        ],
      })
      inregexProps = getFieldProps('inregex',{
        rules: [
          { required: true, message: '请填写采集文件规则' }
        ],
      })
      exregexProps = getFieldProps('exregex',{
        rules: [
          { required: false, message: '请填写排除文件规则' }
        ],
      })
      let directoryRecursive = getFieldValue('directoryRecursive')
      return  <Form horizontal key="directory">
        <FormItem
          {...formItemLayout}
          wrapperCol={{ span: 6 }}
          label="日志目录"
          key="sourceLogDirectory"
        >
          <Input
            size="large"
            placeholder="例如:/var/log"
            autoComplete="off"
            className='standard'
            {...pathProps}
          />
          <Tooltip title='输入要采集日志的目录，请避免特殊无效字符'>
            <Icon type="question-circle-o" className='questionIcon'/>
          </Tooltip>
        </FormItem>
        <FormItem
          {...formItemLayout}
          wrapperCol={{ span: 6 }}
          label="采集规则"
          key="collectFieldRules"
        >
          <Input
            size="large"
            placeholder="例如:^access\.log\.[0-9\-]{10}$"
            autoComplete="off"
            className='standard'
            {...inregexProps}
          />
          <Tooltip title="匹配正则表达式的文件将会被监控，请避免正在写入的文件被匹配到">
            <Icon type="question-circle-o" className='questionIcon'/>
          </Tooltip>
        </FormItem>
        <FormItem
          {...formItemLayout}
          wrapperCol={{ span: 6 }}
          label="排除规则"
          key="eliminateFieldRules"
        >
          <Input
            size="large"
            placeholder="例如:^access\.log\.[0-9\-]{10}$"
            autoComplete="off"
            className='standard'
            {...exregexProps}
            disabled
          />
          <Tooltip title="匹配正则表达式的文件将不会被监控，请排除正在写入的文件">
            <Icon type="question-circle-o" className='questionIcon'/>
          </Tooltip>
        </FormItem>
        {/*<div>
         <FormItem
         {...formItemLayout}
         wrapperCol={{ span: 6 }}
         label="目录递归"
         key="directoryRecursive"
         >
         <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={true} {...directoryRecursiveProps} className='switchStandard'/>
         {
         directoryRecursive
         ? <div className='switchTips'>采集指定目录下所有符合规则的文件，包括子目录</div>
         : <div className='switchTips'>采集指定目录下符合规则文件，不包含子目录</div>
         }
         </FormItem>
        </div>*/}
      </Form>
    }
	  return <span></span>
  }

  render(){
	  const { formItemLayout, form } = this.props
    const { getFieldProps, getFieldValue } = form
    const sourceTypeProps = getFieldProps('sourceType',{
      rules: [
        { required: true }
      ],
      initialValue: 'none'
    })
    let sourceType = getFieldValue('sourceType')

    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">日志采集</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">采集应用的运行日志，结合平台的日志查询功能提供托管式、一站式日志采集、查询服务</div>
          </Col>
        </Row>
      </div>
    )
    return(
      <div id='logCollection'>
        <Collapse>
          <Panel header={header}>
            <FormItem
              {...formItemLayout}
              className="sourceType"
              label="来源类型"
              key="type"
            >
              <RadioGroup {...sourceTypeProps}>
                <Radio value="none" key="none">不采集</Radio>
                <Radio value="directory" key="directory">目录</Radio>
              </RadioGroup>
            </FormItem>
            <div className='logCollectionConfig'>
              { this.directoryTemplate(sourceType) }
            </div>
          </Panel>
        </Collapse>
      </div>
    )
  }
}

function mapStateToProp(state, props) {

  return {

  }
}

export default connect(mapStateToProp, {

})(LogCollection)