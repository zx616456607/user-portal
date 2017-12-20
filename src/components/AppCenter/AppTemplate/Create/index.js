/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App Template list component
 *
 * v0.1 - 2017-11-7
 * @author Baiyu
 */


import React from 'react'
import { Button, Steps, Tabs, Row, Col, Card, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { browserHistory } from 'react-router'
import '../style/Create.less'
import { genRandomString } from '../../../../common/tools'
import SelectImage from '../../../AppModule/QuickCreateApp/SelectImage'
import DepolyWrap from '../../../AppModule/AppCreate/DeployWrap'
import ConfigureService from '../../../AppModule/QuickCreateApp/ConfigureService'
import TemplateName from './TemplateName'
import { removeFormFields, removeAllFormFields } from '../../../../actions/quick_create_app'
import { connect } from 'react-redux'

const SERVICE_CONFIG_HASH = '#configure-service'
const SERVICE_EDIT_HASH = '#edit-service'

class Create extends React.Component {
  constructor(props) {
    super()
    this.setConfig = this.setConfig.bind(this)
    const { location, fields } = props
    const { query } = location
    const { imageName, registryServer, appName, action } = query
    let appNameInit = this.getAppName(fields)
    if (appName && action) {
      appNameInit = appName
      this.action = action
    }
    this.state = {
      currentStep:1,
      saveBtn: true
    }
    this.serviceSum = 0
    this.configureServiceKey = this.genConfigureServiceKey()
  }
  // componentWillMount() {
  //   const { location } = this.props
  //   const { imageName,appPkgID,registryServer } = location.query
  //   if (imageName) {
  //     this.setState({imageName})
  //   }
  // }
  componentWillUnmount() {
    this.removeAllFormFieldsAsync()
    window.WrapListTable = null
  }
  removeAllFormFieldsAsync() {
    // 异步清除 fields，即等 QuickCreateApp 组件卸载后再清除，否者会出错
    console.log('poropssss',this.props)
    const { removeAllFormFields } = this.props
    setTimeout(removeAllFormFields)
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps
    const { hash, query } = location
    if (hash !== this.props.location.hash || query.key !== this.props.location.query.key) {
      this.setConfig(nextProps)
    }
    const { imageName,registryServer } = query
    if (imageName) {
      this.setState({
        imageName,
        registryServer,
        saveBtn: false
      })

    }
  }

  getAppName(fields) {
    let appName
    // get app name from fields
    if (fields) {
      for (let key in fields) {
        if (fields.hasOwnProperty(key)) {
          const currentFields = fields[key]
          if (currentFields.appName && currentFields.appName.value) {
            appName = currentFields.appName.value
          }
        }
      }
    }
    return appName
  }
  genConfigureServiceKey() {
    this.serviceSum ++
    return `${this.serviceSum}-${genRandomString('0123456789')}`
  }
  onSelectImage= (imageName, registryServer) =>{
    this.setState({
      imageName,
      registryServer,
      saveBtn: false
    })
    // if(fromDetail){
    //   browserHistory.push(`/app_manage/app_create/quick_create${SERVICE_CONFIG_HASH}?appName=${appName}&fromDetail=${fromDetail}`)
    //   return;
    // }
    browserHistory.push(`/app_center/app_template/create${SERVICE_CONFIG_HASH}`)
  }
  goDeploy = ()=> {
    console.log('goDeploy')
  }
  setConfig(props) {
    const { location } = props
    const { hash, query } = location
    const { key } = query
    const configureMode = hash === SERVICE_EDIT_HASH ? 'edit' : 'create'
    this.configureMode = configureMode
    if (configureMode === 'edit') {
      // this.configureServiceKey = key
      this.editServiceKey = key
    }
  }
  renderBody() {
    const { location } = this.props
    const { hash, query } = location
    const { key, addWrap } = query
    const { imageName, registryServer, appName, editServiceLoading, AdvancedSettingKey } = this.state
    if ((hash === SERVICE_CONFIG_HASH && imageName) || (hash === SERVICE_EDIT_HASH && key)) {
       this.id = this.configureMode === 'create' ? this.configureServiceKey : this.editServiceKey
      if (editServiceLoading) {
        return <div className="loadingBox"><Spin size="large" /></div>
      }
      return (
        <ConfigureService
          ref="ConfigureService"
          mode={this.configureMode}
          id={this.id}
          action={this.action}
          callback={(form, configs) => {
            console.log('form,',form,configs)
              this.form = form
              this.imageConfigs = configs
            }
          }
          {...{imageName, registryServer, appName}}
          {...this.props}
        />
      )
    }
    return (
      <Tabs
        defaultActiveKey="hub"
        type="card"
        >
        <Tabs.TabPane tab="镜像仓库" key="hub">
          <SelectImage {...this.props} onChange={this.onSelectImage}/>
        </Tabs.TabPane>
        <Tabs.TabPane tab="应用包管理" key="wrap">
          <DepolyWrap location={location} childrenSteps={true}/>
        </Tabs.TabPane>
      </Tabs>
    )
  }
  templateCreate(template) {
    this.form.validateFieldsAndScroll((errors,values)=> {
      if (errors) return
      if (!template) {
        browserHistory.push('/app_center/app_template/create')
        return
      }
      values.templateName = template.templateName
      // this.form.setFieldsValue({templateName})
    })
  }
  render() {
    const { currentStep} = this.state
    const funcCallback = {
      goDeploy: this.goDeploy,
      scope: this
    }
    const func = {
      scope: this
    }
    return (
      <QueueAnim >
        <div key="templates" id="AppTemplate">
          <Row gutter={30}>
            <Col span="18" className="leftBody">
              <div className="steps-bar">
                <Steps current={currentStep}>
                  <Steps.Step title="添加服务" />
                  <Steps.Step title="配置服务" />
                </Steps>
              </div>
              { this.renderBody() }
            </Col>
            <Col span="6">
              <TemplateName func={func} id={this.id} />
            </Col>
          </Row>
        </div>
      </QueueAnim>
    )
  }
}

export default connect(null,{
  removeFormFields,
  removeAllFormFields
})(Create)