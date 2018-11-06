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
import { Form, Radio, Input, Collapse, Row, Col, Switch, Icon, Tooltip, Checkbox } from 'antd'
import { connect } from 'react-redux'
import './style/LogCollection.less'

const Panel = Collapse.Panel
const FormItem = Form.Item
const RadioGroup = Radio.Group
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../containers/Application/ServiceConfigIntl'

class LogCollection extends Component {
  constructor(props) {
    super(props)
    this.directoryTemplate = this.directoryTemplate.bind(this)
    this.state = {
      //
    }
  }

  checkPath = (rule, value, callback) => {
    const { intl } = this.props
    if (!value) {
      return callback()
    }
    if(/\/{2,}/.test(value) || !/^\/(.+)*$/.test(value) || value.length !== 1 && /\/$/.test(value)){
      return callback(intl.formatMessage(IntlMessage.plsEntLogDir))
    }
    const { form } = this.props
    const { getFieldValue } = form
    const storageKeys = getFieldValue('storageKeys') || []
    let error
    storageKeys.every(key => {
      const mountPath = getFieldValue(`mountPath${key}`)
      if (value === mountPath) {
        error = intl.formatMessage(IntlMessage.logDirDiffStorageDir)
        return false
      }
      return true
    })
    callback(error)
  }

  validateRule = (rule, value, callback) => {
    const { intl } = this.props
    if (value === '') {
      callback(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.collectingFileRules),
        end: '',
      }))
      return
    }
    // Check if it's valid regex expression
    try {
      new RegExp(value, "ig")
    } catch (e) {
      callback(intl.formatMessage(IntlMessage.plsEntRegRule))
      return
    }
    callback()
  }

  directoryTemplate(sourceType){
    const { formItemLayout, form, intl } = this.props
    const { getFieldProps, getFieldValue } = form
    let pathProps
    let inregexProps
    let exregexProps
    if(sourceType == 'directory'){
      pathProps = getFieldProps('path',{
        rules: [
          {
            required: true,
            message: intl.formatMessage(IntlMessage.pleaseEnter, {
              item: intl.formatMessage(IntlMessage.logDir),
              end: '',
            })
          },
          { validator: this.checkPath }
        ],
      })
      inregexProps = getFieldProps('inregex',{
        rules: [
          { validator: this.validateRule }
        ],
        //initialValue: '.*.log'
      })
      exregexProps = getFieldProps('exregex',{
        rules: [
          {
            validator: (rule, value, callback) => {
              if(value){
                try {
                  const reg = new RegExp(value)
                } catch(e) {
                  return callback(intl.formatMessage(IntlMessage.plsEntRegRule))
                }
              }
              callback()
            }
          }
        ],
      })
      let directoryRecursive = getFieldValue('directoryRecursive')
      return  <Form horizontal key="directory">
        <FormItem
          {...formItemLayout}
          wrapperCol={{ span: 6 }}
          label={intl.formatMessage(IntlMessage.logDir)}
          key="sourceLogDirectory"
        >
          <Input
            size="large"
            placeholder={intl.formatMessage(IntlMessage.logDirPlaceholder)}
            autoComplete="off"
            className='standard'
            {...pathProps}
          />
          <Tooltip title={intl.formatMessage(IntlMessage.logDirTooltip)}>
            <Icon type="question-circle-o" className='questionIcon'/>
          </Tooltip>
        </FormItem>
        <FormItem
          {...formItemLayout}
          wrapperCol={{ span: 6 }}
          label={intl.formatMessage(IntlMessage.collectionRule)}
          key="collectFieldRules"
        >
          <Input
            size="large"
            placeholder="例如:^access\.log\.[0-9\-]{10}$"
            autoComplete="off"
            className='standard'
            {...inregexProps}
          />
          <Tooltip title={intl.formatMessage(IntlMessage.collectionRuleTooltip)}>
            <Icon type="question-circle-o" className='questionIcon'/>
          </Tooltip>
        </FormItem>
        <FormItem
          {...formItemLayout}
          wrapperCol={{ span: 6 }}
          label={intl.formatMessage(IntlMessage.exclusionRule)}
          key="eliminateFieldRules"
        >
          <Input
            size="large"
            placeholder={intl.formatMessage(IntlMessage.exclusionRulePlaceholder)}
            autoComplete="off"
            className='standard'
            {...exregexProps}
          />
          <Tooltip title={intl.formatMessage(IntlMessage.exclusionRuleTooltip)}>
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

  sourceTypeChange = () => {
    const { form } = this.props
    form.setFieldsValue({
      'inregex': '.*.log'
    })
  }
  sourceTypeCheckboxChange = v => {
    const { form } = this.props
    form.setFieldsValue({
      sourceType: v.target.checked ? 'directory' : 'none'
    })
  }
  render() {
    const { formItemLayout, form, intl } = this.props
    const { getFieldProps, getFieldValue } = form
    getFieldProps('sourceType', {
      rules: [
        { required: true }
      ],
      initialValue: 'none',
      onChange: this.sourceTypeChange
    })
    const sourceTypeCheckboxProps = getFieldProps('sourceTypeCheckbox', {
      onChange: this.sourceTypeCheckboxChange,
      initialValue: false,
      valuePropName: 'checked',
    })

    let sourceType = getFieldValue('sourceType')

    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title" style={{paddingLeft: '8px'}}>{intl.formatMessage(IntlMessage.logCollection)}</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">{intl.formatMessage(IntlMessage.logCollectionTip)}</div>
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
              className="sourceTypeLabel"
              label={intl.formatMessage(IntlMessage.sourceType)}
            >
              {intl.formatMessage(IntlMessage.collectContainerStandardLog)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              className="sourceType"
              label={' '}
            >
              <Checkbox {...sourceTypeCheckboxProps}>{intl.formatMessage(IntlMessage.collectDirLog)}</Checkbox>
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

})(injectIntl(LogCollection, {
  withRef: true,
}))
