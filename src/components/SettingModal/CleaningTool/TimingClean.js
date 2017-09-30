/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Timing Clean component
 *
 * v0.1 - 2017-9-1
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Row, Col, Switch, Form, Select, TimePicker } from 'antd'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/TimingClean.less'
import {
  startClean, getCleanSettings, cleanSystemLogs
} from '../../../actions/clean'
import isEmpty from 'lodash/isEmpty'
import { formatDate } from "../../../common/tools";

const FormItem = Form.Item
const Option = Select.Option

class TimingClean extends Component {
  constructor(props) {
    super(props)
    this.systemChange = this.systemChange.bind(this)
    this.CICDcacheChange = this.CICDcacheChange.bind(this)
    this.mirrorImageChange = this.mirrorImageChange.bind(this)
    this.stopContainerChange = this.stopContainerChange.bind(this)
    this.state = {
      systemChecked: true,
      systemEdit: true,
      CICDcache: true,
      CICDcacheEdit: true,
      mirrorImage: true,
      mirrorImageEdit: true,
      stopContainer: true,
      stopContainerEdit: true,
      cicdSetting: {}
    }
  }
  componentWillMount() {
    this.getSettings()
  }
  getSettings() {
    const { getCleanSettings } = this.props
    getCleanSettings({
      success: {
        func: res => {
          if (!isEmpty(res.data.cicdClean)) {
            this.setState({
              cicdSetting: res.data.cicdClean
            })
          }
        },
        isAsync: true
      }
    })
  }
  systemChange(systemCheckedValue){
    const { systemChecked } = this.state
    if(systemChecked){
      this.setState({
        systemChecked: systemCheckedValue,
        systemEdit: systemCheckedValue,
      })
      return
    }
    const { form, cleanSystemLogs } = this.props
    const { getFieldValue } = form
    const validateArray = [
      'systemCleaningScope',
      'systemCleaningCycle',
      'systemCleaningTime',
    ]
    const systemCleaningCycleValue = getFieldValue('systemCleaningCycle')
    if(systemCleaningCycleValue !== 'day'){
      validateArray.push('systemCleaningDate')
    }
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      const { systemCleaningScope, systemCleaningCycle, systemCleaningTime, systemCleaningDate } = values
      cleanSystemLogs({
        type: 1,
        time_range: parseInt(systemCleaningScope),
        scheduled_time: this.getCronString(systemCleaningCycle, systemCleaningDate, systemCleaningTime)
      })
      this.setState({
        systemChecked: systemCheckedValue,
        systemEdit: systemCheckedValue,
      })
    })
  }

  renderCleaningDateOption(cleaningCycle){
    if(cleaningCycle === 'week'){
      let weekArray = ['一', '二', '三', '四', '五', '六', '日']
      return weekArray.map((item, index) => {
        return <Option key={`week${index}`} value={`${index + 1}`}>{`每周${item}`}</Option>
      })
    }
    const monthArray = []
    for(let i = 0; i <= 31; i++){
      monthArray.push(i)
    }
    return monthArray.map(item => {
      return <Option value={`${item + 1}`} key={`month${item}`}>{`每月${item + 1}号`}</Option>
    })
  }

  CICDcacheChange(CICDcacheValue){
    const { CICDcache } = this.state
    if(CICDcache){
      this.setState({
        CICDcache: CICDcacheValue,
        CICDcacheEdit: CICDcacheValue,
      })
      return
    }
    const { form, startClean } = this.props
    const validateArray = [
      'CICDcacheScope',
      'CICDcacheCycle',
      'CICDcacheTime'
    ]
    const CICDcacheCycleValue = form.getFieldValue('CICDcacheCycle')
    if(CICDcacheCycleValue !== 'day'){
      validateArray.push('CICDcacheDate')
    }
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      const { CICDcacheScope, CICDcacheCycle, CICDcacheTime, CICDcacheDate } = values
      
      startClean('cicd_clean', 'auto', {
        cron: this.getCronString(CICDcacheCycle,CICDcacheDate, CICDcacheTime),
        scope: parseInt(CICDcacheScope)
      }, {
        success: {
          func: () => {
            this.setState({
              CICDcache: CICDcacheValue,
              CICDcacheEdit: CICDcacheValue,
            })
            this.getSettings()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            this.setState({
              CICDcache,
              CICDcacheEdit: CICDcache
            })
          }
        }
      })
    })
  }
  getCronString(CICDcacheCycle,CICDcacheDate, CICDcacheTime) {
    let time = String(formatDate(CICDcacheTime, 'HH mm')).split(' ')
    time = time.map(item => {
      return item.indexOf(0) === 0 ? item.substring(1) : item
    })
    time = time.reverse().join(' ')
    switch(CICDcacheCycle) {
      case 'day':
        return `${time} 1/1 * ?`
        break;
      case 'week':
        return `${time} 0 0 ${CICDcacheDate}/7`
        break;
      case 'month':
        return `${time} 0 ${CICDcacheDate}/1 ?`
    }
  }
  mirrorImageChange(mirrorImageValue){
    const { mirrorImage } = this.state 
    if(mirrorImage){
      this.setState({
        mirrorImage: mirrorImageValue,
        mirrorImageEdit: mirrorImageValue,
      })
      return
    }
    const { form } = this.props
    const validateArray = [
      'mirrorImageCycle',
      'mirrorImageTime'
    ]
    const mirrorImageCycleValue = form.getFieldValue('mirrorImageCycle')
    if(mirrorImageCycleValue !== "day"){
      validateArray.push('mirrorImageDate')
    }
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      //console.log('values=',values)
      this.setState({
        mirrorImage: mirrorImageValue,
        mirrorImageEdit: mirrorImageValue,
      })
    })
  }

  stopContainerChange(stopContainerValue){
    const { stopContainer } = this.state
    if(stopContainer){
      this.setState({
        stopContainer: stopContainerValue,
        stopContainerEdit: stopContainerValue,
      })
      return
    }
    const { form } = this.props
    const validateArray = [
      'stopContainerCycle',
      'stopContainerTime'
    ]
    const stopContainerCycleValue = form.getFieldValue('stopContainerCycle')
    if(stopContainerCycleValue !== "day"){
      validateArray.push('stopContainerDate')
    }
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      //console.log('values=',values)
      this.setState({
        stopContainer: stopContainerValue,
        stopContainerEdit: stopContainerValue,
      })
    })
  }

  renderCleaningTimeOption(){
    const timeArray = []
    for(let i = 0; i <= 24; i++){
      timeArray.push(i)
    }
    return timeArray.map(item => {
      if(item/2 < 5){
        return <Option value={`${item}`} key={`time${item}`}>{`0${item} : 00 : 00`}</Option>
      }
      return <Option value={`${item}`} key={`time${item}`}>{`${item} : 00 : 00`}</Option>
    })
  }

  render() {
    const { form } = this.props
    const {
      systemChecked, systemEdit,
      CICDcache, CICDcacheEdit,
      mirrorImage, mirrorImageEdit,
      stopContainer, stopContainerEdit
    } = this.state
    const { getFieldProps, getFieldValue } = form
    const formItemLayout = {
    	labelCol: {span: 6},
    	wrapperCol: {span: 18}
    }
    const systemCleaningScopeProps = getFieldProps('systemCleaningScope', {
      initialValue: '1',
      rules: [{required: true, message: '请选择清理范围'}],
    })
    const systemCleaningCycleProps = getFieldProps('systemCleaningCycle', {
      initialValue: 'day',
      rules: [{required: true, message: '请选择清理周期'}],
    })
    const systemCleaningCycleValue = getFieldValue('systemCleaningCycle')
    let systemCleaningDateProps
    if(systemCleaningCycleValue !== 'day'){
      systemCleaningDateProps = getFieldProps('systemCleaningDate', {
        initialValue: '1',
        rules: [{required: true, message: '请选择清理日期'}]
      })
    }
    const systemCleaningTimeProps = getFieldProps('systemCleaningTime', {
      initialValue: '00:00:00',
      rules: [{required: true, message: '请选择清理时间'}]
    })
    const CICDcacheScopeProps = getFieldProps('CICDcacheScope', {
      initialValue: '1',
      rules: [{required: true, message: '请选择清理范围'}],
    })
    const CICDcacheCycleProps = getFieldProps('CICDcacheCycle',{
      initialValue: 'day',
      rules: [{required: true, message: '请选择清理周期'}],
    })
    const CICDcacheCycleValue = getFieldValue('CICDcacheCycle')
    let CICDcacheDateProps
    if(CICDcacheCycleValue !== 'day'){
      CICDcacheDateProps = getFieldProps('CICDcacheDate', {
        initialValue: '1',
        rules: [{required: true, message: '请选择清理日期'}]
      })
    }
    const CICDcacheTimeProps = getFieldProps('CICDcacheTime', {
      initialValue: '00:00:00',
      rules: [{required: true, message: '请选择清理时间'}]
    })
    const mirrorImageCycleProps = getFieldProps('mirrorImageCycle',{
      initialValue: 'day',
      rules: [{required: true, message: '请选择清理周期'}],
    })
    let mirrorImageDateProps
    const mirrorImageCycleValue = getFieldValue('mirrorImageCycle')
    if(mirrorImageCycleValue !== 'day'){
      mirrorImageDateProps = getFieldProps('mirrorImageDate', {
        initialValue: '0',
        rules: [{required: true, message: '请选择清理日期'}]
      })
    }
    const mirrorImageTimeProps = getFieldProps('mirrorImageTime', {
      initialValue: '0',
      rules: [{required: true, message: '请选择清理时间'}]
    })
    const stopContainerCycleProps = getFieldProps('stopContainerCycle',{
      initialValue: 'day',
      rules: [{required: true, message: '请选择清理周期'}],
    })
    let stopContainerDateProps
    const stopContainerCycleValue = getFieldValue('stopContainerCycle')
    if(stopContainerCycleValue !== 'day'){
      stopContainerDateProps = getFieldProps('stopContainerDate', {
        initialValue: '0',
        rules: [{required: true, message: '请选择清理日期'}]
      })
    }
    const stopContainerTimeProps = getFieldProps('stopContainerTime', {
      initialValue: '0',
      rules: [{required: true, message: '请选择清理时间'}]
    })
    return(
      <QueueAnim className='timingClean' type="right">
        <div id='timing_clean' key="timingClean">
          <div className='header'>
            <span
              className="back"
              onClick={() => {browserHistory.push(`/setting/cleaningTool`)}}
            >
              <span className="backjia"/>
              <span className="btn-back">返回</span>
            </span>
            <span className='title'>定时清理</span>
          </div>
          <div className='body'>
            <Row gutter={16}>
              <Col span={6} className='gutter-row'>
                <div className='gutter-box'>
                  <div className='header'>
                    系统日志
                    <Switch
                      checkedChildren="开"
                      unCheckedChildren="关"
                      className='switch_style'
                      checked={systemChecked}
                      onChange={this.systemChange}
                    />
                  </div>
                  <div className="body">
                    <FormItem
                      {...formItemLayout}
                      label="清理范围"
                      className='reset_formItem_style'
                    >
                      <Select
                        placeholder='请选择'
                        className='select_style'
                        disabled={systemEdit}
                        {...systemCleaningScopeProps}
                      >
                        <Option key="system_0" value="1">一天前数据</Option>
                        <Option key="system_3" value="3">一周前数据</Option>
                        <Option key="system_5" value="5">一个月前数据</Option>
                        <Option key="system_6" value="6">三个月前数据</Option>
                      </Select>
                    </FormItem>
                    <FormItem
                      {...formItemLayout}
                      label="清理周期"
                      className='reset_formItem_style'
                    >
                      <Select
                        placeholder='请选择'
                        className='select_style'
                        disabled={systemEdit}
                        {...systemCleaningCycleProps}
                      >
                        <Option key="system_day" value="day">每天</Option>
                        <Option key="system_week" value="week">每周</Option>
                        <Option key="system_month" value="month">每月</Option>
                      </Select>
                    </FormItem>
                    {
                      systemCleaningCycleValue === "day"
                      ? null
                      : <FormItem
                          {...formItemLayout}
                          label="清理日期"
                          className='reset_formItem_style'
                        >
                          <Select
                            placeholder='请选择'
                            className='select_style'
                            disabled={systemEdit}
                            {...systemCleaningDateProps}
                          >
                            {this.renderCleaningDateOption(systemCleaningCycleValue)}
                          </Select>
                        </FormItem>
                    }
                    <FormItem
                      {...formItemLayout}
                      label="清理时间"
                      className='reset_formItem_style'
                    >
                      <TimePicker
                        format="HH:mm"
                        disabled={systemEdit}
                        {...systemCleaningTimeProps}
                      />
                    </FormItem>
                  </div>
                </div>
              </Col>
              <Col span={6} className='gutter-row'>
                <div className='gutter-box'>
                  <div className='header'>
                    CI/CD缓存
                    <Switch
                      checkedChildren="开"
                      unCheckedChildren="关"
                      className='switch_style'
                      checked={CICDcache}
                      onChange={this.CICDcacheChange}
                    />
                  </div>
                  <div className="body">
                    <FormItem
                      {...formItemLayout}
                      label="清理范围"
                      className='reset_formItem_style'
                    >
                      <Select
                        placeholder='请选择'
                        className='select_style'
                        disabled={CICDcacheEdit}
                        {...CICDcacheScopeProps}
                      >
                        <Option key="cicd_scope_1" value="1">一天前数据</Option>
                        <Option key="cicd_scope_7" value="7">一周前数据</Option>
                        <Option key="cicd_scope_30" value="30">一个月前数据</Option>
                        <Option key="cicd_scope_90" value="90">三个月前数据</Option>
                      </Select>
                    </FormItem>
                    <FormItem
                      {...formItemLayout}
                      label="清理周期"
                      className='reset_formItem_style'
                    >
                      <Select
                        placeholder='请选择'
                        className='select_style'
                        disabled={CICDcacheEdit}
                        {...CICDcacheCycleProps}
                      >
                        <Option key="cicd_cycle_day" value="day">每天</Option>
                        <Option key="cicd_cycle_week" value="week">每周</Option>
                        <Option key="cicd_cycle_month" value="month">每月</Option>
                      </Select>
                    </FormItem>
                    {
                      CICDcacheCycleValue === 'day'
                      ? null
                      : <FormItem
                          {...formItemLayout}
                          label="清理日期"
                          className='reset_formItem_style'
                        >
                          <Select
                            placeholder='请选择'
                            className='select_style'
                            disabled={CICDcacheEdit}
                            {...CICDcacheDateProps}
                          >
                            {this.renderCleaningDateOption(CICDcacheCycleValue)}
                          </Select>
                        </FormItem>
                    }
                    <FormItem
                      {...formItemLayout}
                      label="清理时间"
                      className='reset_formItem_style'
                    >
                      <TimePicker
                        format="HH:mm"
                        {...CICDcacheTimeProps}
                        disabled={CICDcacheEdit}
                      />
                    </FormItem>
                  </div>
                </div>
              </Col>
              {/*<Col span={6} className='gutter-row'>
                <div className='gutter-box'>
                  <div className='header'>
                    镜像
                    <Switch
                      checkedChildren="开"
                      unCheckedChildren="关"
                      className='switch_style'
                      checked={mirrorImage}
                      onChange={this.mirrorImageChange}
                    />
                  </div>
                  <div className="body">
                    <FormItem
                      {...formItemLayout}
                      label="清理周期"
                      className='reset_formItem_style'
                    >
                      <Select
                        placeholder='请选择'
                        className='select_style'
                        disabled={mirrorImageEdit}
                        {...mirrorImageCycleProps}
                      >
                        <Option key="0" value="day">每天</Option>
                        <Option key="1" value="week">每周</Option>
                        <Option key="2" value="month">每月</Option>
                      </Select>
                    </FormItem>
                    {
                      mirrorImageCycleValue === "day"
                        ? null
                        : <FormItem
                          {...formItemLayout}
                          label="清理日期"
                          className='reset_formItem_style'
                        >
                          <Select
                            placeholder='请选择'
                            className='select_style'
                            disabled={mirrorImageEdit}
                            {...mirrorImageDateProps}
                          >
                            {this.renderCleaningDateOption(mirrorImageCycleValue)}
                          </Select>
                        </FormItem>
                    }
                    <FormItem
                      {...formItemLayout}
                      label="清理时间"
                      className='reset_formItem_style'
                    >
                      <Select
                        placeholder='请选择'
                        className='select_style'
                        disabled={mirrorImageEdit}
                        {...mirrorImageTimeProps}
                      >
                        { this.renderCleaningTimeOption() }
                      </Select>
                    </FormItem>
                  </div>
                </div>
              </Col>
              <Col span={6} className='gutter-row'>
                <div className='gutter-box'>
                  <div className='header'>
                    停止容器
                    <Switch
                      checkedChildren="开"
                      unCheckedChildren="关"
                      className='switch_style'
                      checked={stopContainer}
                      onChange={this.stopContainerChange}
                    />
                  </div>
                  <div className="body">
                    <FormItem
                      {...formItemLayout}
                      label="清理周期"
                      className='reset_formItem_style'
                    >
                      <Select
                        placeholder='请选择'
                        className='select_style'
                        disabled={stopContainerEdit}
                        {...stopContainerCycleProps}
                      >
                        <Option key="0" value="day">每天</Option>
                        <Option key="1" value="week">每周</Option>
                        <Option key="2" value="month">每月</Option>
                      </Select>
                    </FormItem>
                    {
                      stopContainerCycleValue === "day"
                        ? null
                        : <FormItem
                          {...formItemLayout}
                          label="清理日期"
                          className='reset_formItem_style'
                        >
                          <Select
                            placeholder='请选择'
                            className='select_style'
                            disabled={stopContainerEdit}
                            {...stopContainerDateProps}
                          >
                            {this.renderCleaningDateOption(stopContainerCycleValue)}
                          </Select>
                        </FormItem>
                    }
                    <FormItem
                      {...formItemLayout}
                      label="清理时间"
                      className='reset_formItem_style'
                    >
                      <Select
                        placeholder='请选择'
                        className='select_style'
                        disabled={stopContainerEdit}
                        {...stopContainerTimeProps}
                      >
                        { this.renderCleaningTimeOption() }
                      </Select>
                    </FormItem>
                  </div>
                </div>
              </Col>*/}
            </Row>
          </div>
        </div>
      </QueueAnim>
    )
  }
}

TimingClean = Form.create()(TimingClean)

function mapStateToProp(state, props) {

  return {

  }
}

export default connect(mapStateToProp, {
  startClean,
  getCleanSettings,
  cleanSystemLogs
})(TimingClean)