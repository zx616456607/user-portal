/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Access Method component
 *
 * v0.1 - 2017-7-3
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Form, Radio, Select, Row, Col, Icon, Tooltip, Modal } from 'antd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import './style/AccessMethod.less'
import { getProxy } from '../../../../../actions/cluster'
import { camelize } from 'humps'
import { genRandomString } from '../../../../../common/tools'
import LoadBalance from './LoadBalance'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'

const Option = Select.Option

class AccessMethod extends Component {
  constructor(props) {
    super(props)
    this.state = {
      copyCMDSuccess: false,
      lbgroup: '暂无',
      openInputId: `lbgroup${genRandomString('0123456789',4)}`,
      activeKey: 'netExport'
    }
  }

  componentWillMount() {
    const { getProxy, currentCluster, form, location } = this.props
    const clusterID = currentCluster.clusterID
    const { accessType: activeKey, accessMethod } = form.getFieldsValue(['accessType', 'accessMethod'])
    if (activeKey) {
      this.setState({ activeKey })
    }
    let clusterId = camelize(currentCluster.clusterID)
    getProxy(clusterID, {
      success: {
        func: (res) => {
          let data = res[clusterId].data
          for (let i = 0; i < data.length; i++) {
            if (location.query.template) {
              this.setState({
                lbgroup: data[i].id || '暂无',
              })
              if (data[i].type === 'public' || accessMethod === 'PublicNetwork') {
                form.setFieldsValue({
                  accessMethod: 'PublicNetwork',
                  publicNetwork: data[i].id
                })
                break
              }
              if (data[i].type === 'private' || accessMethod === 'InternalNetwork') {
                form.setFieldsValue({
                  accessMethod: 'InternalNetwork',
                  internaletwork: data[i].id
                })
                break
              }
            } else {
              if (data[i].isDefault) {
                this.setState({
                  lbgroup: data[i].id || '暂无',
                })
                if(data[i].type == 'public'){
                  setTimeout(() => {
                    form.setFieldsValue({
                      accessMethod: 'PublicNetwork',
                      publicNetwork: data[i].id
                    }, 200)
                  })
                  return
                }
                if(data[i].type == 'private'){
                  setTimeout(() => {
                    form.setFieldsValue({
                      accessMethod: 'InternalNetwork',
                      internaletwork: data[i].id
                    }, 200)
                  })
                }
                break
              }
            }
          }
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          setTimeout(() => {
            form.setFieldsValue({
              'publicNetwork': undefined
            })
          }, 100)
        }
      }
    })
  }

  accessMethodTips = type => {
    const { intl } = this.props
    if (type == 'PublicNetwork') {
      return <span>{intl.formatMessage(IntlMessage.publicNetTip)}</span>
    }
    if (type == 'InternalNetwork') {
      return <span>{intl.formatMessage(IntlMessage.interNetTip)}</span>
    }
    return <span>{intl.formatMessage(IntlMessage.clusterTip)}</span>
  }

  selectOption = nodeType => {
    const { intl } = this.props
    let OptionArray = this.formatGroupArray(nodeType)
    let OptionList = OptionArray.map((item, index) => {
      return <Option value={item.id} key={'node' + index}>{item.name}</Option>
    })
    if (!OptionList.length) {
      OptionList = <Option value="none" key="noAddress" disabled={true}>
        <span>{intl.formatMessage(IntlMessage.noNexportTip)}</span>
      </Option>
    }
    return OptionList
  }

  formatGroupArray = type => {
    const { clusterProxy, currentCluster } = this.props
    let clusterID = camelize(currentCluster.clusterID)
    let nodeArray = []
    let OptionArray = []
    if (Object.keys(clusterProxy).length && clusterProxy[clusterID] && clusterProxy[clusterID].data) {
      nodeArray = clusterProxy[clusterID].data
    }
    let accessType = 'public'
    if (type == 'Cluster') {
      return OptionArray
    }
    if (type == 'PublicNetwork') {
      accessType = 'public'
    } else {
      accessType = 'private'
    }
    if (nodeArray.length) {
      nodeArray.forEach(item => {
        if (item.type == accessType) {
          OptionArray.push(item)
        }
      })
    }
    return OptionArray
  }

  copyOrder = () => {
    const code = document.getElementById(this.state.openInputId)
    code.select()
    document.execCommand('Copy',false)
    this.setState({
      copyCMDSuccess: true,
    })
  }

  renderID = () => {
    const { intl } = this.props
    const { lbgroup } = this.state
    return <span>
      {intl.formatMessage(IntlMessage.exportID)}
      <Tooltip title={intl.formatMessage(IntlMessage.exportIDTip)}>
        <Icon type="question-circle-o" className='lbgroup_icon'/>
      </Tooltip>
      ：{lbgroup}
      {
        lbgroup == '暂无'
        ? null
        : <span>
            <Tooltip title={
              this.state.copyCMDSuccess ?
                intl.formatMessage(IntlMessage.copySuccess):
                intl.formatMessage(IntlMessage.clickToCopy)}
            >
            <a
              className={this.state.copyCMDSuccess ? "actions copyBtn": "copyBtn"}
              onClick={this.copyOrder}
              onMouseLeave={() => setTimeout(() => this.setState({ copyCMDSuccess: false }),500)}
            >
              <Icon type="copy" style={{ marginLeft: 8 }}/>
            </a>
          </Tooltip>
          <input
            id={this.state.openInputId}
            style={{ position: "absolute",opacity: "0",top: '0' }}
            value={lbgroup}
          />
        </span>
      }
    </span>
  }

  lbgroupChange = lbgroup => {
    this.setState({
      lbgroup,
    })
  }

  accessMethodContent = type => {
    const { form, intl } = this.props
    const { getFieldProps } = form
    let OptionArray = this.formatGroupArray(type)
    let defaultGroup = ''
    OptionArray.forEach(item => {
      if (item.isDefault) {
        defaultGroup = item.id
      }
    })
    let PublicNetworkProps
    let internaletworkProps
    let clusterProps
    if (type == 'PublicNetwork') {
      PublicNetworkProps = getFieldProps('publicNetwork', {
        initialValue: defaultGroup || undefined,
        rules: [{ required: true, message: intl.formatMessage(IntlMessage.plsSltNexport) }],
        onChange: this.lbgroupChange,
      })
      return <Row>
        <Col span="4">&nbsp;</Col>
        <Col span="6">
          <Form.Item>
            <Select
              {...PublicNetworkProps}
              placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                item: intl.formatMessage(IntlMessage.nexport)
              })}
            >
              {this.selectOption('PublicNetwork')}
            </Select>
          </Form.Item>
        </Col>
        <Col span="14" className='lbgroup_container'>
          { this.renderID() }
        </Col>
      </Row>
    }
    if (type == 'InternalNetwork') {
      internaletworkProps = getFieldProps('internaletwork', {
        initialValue: defaultGroup || undefined,
        rules: [{ required: true, message: intl.formatMessage(IntlMessage.plsSltNexport) }],
        onChange: this.lbgroupChange,
      })
      return <Row>
        <Col span="4">&nbsp;</Col>
        <Col span="6">
          <Form.Item>
          <Select
            {...internaletworkProps}
            placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
              item: intl.formatMessage(IntlMessage.nexport)
            })}
          >
            {this.selectOption('InternalNetwork')}
          </Select>
          </Form.Item>
        </Col>
        <Col span="10" className='lbgroup_container'>
          { this.renderID() }
        </Col>
      </Row>
    } else {
      clusterProps = getFieldProps('cluster')
    }
  }

  accessTypeChange = e => {
    const { form } = this.props
    let type = e.target.value
    let optionArray = this.formatGroupArray(type)
    let defaultGroup = undefined
    optionArray.forEach(item => {
      if (item.isDefault) {
        defaultGroup = item.id
      }
    })
    if (!defaultGroup && optionArray.length > 0) {
      defaultGroup = optionArray[0].id
    }
    this.setState({
      lbgroup: defaultGroup || '暂无'
    })
    if (type == 'PublicNetwork') {
      form.setFieldsValue({
        'publicNetwork': defaultGroup
      })
      return
    }
    if (type == 'InternalNetwork') {
      form.setFieldsValue({
        'internaletwork': defaultGroup
      })
      return
    }
  }

  getDefaultAccessMethod = () => {
    const { clusterProxy, currentCluster } = this.props
    let clusterID = camelize(currentCluster.clusterID)
    let defaultValue = 'Cluster'
    if(Object.keys(clusterProxy).length && clusterProxy[clusterID] && clusterProxy[clusterID].data){
      let arr = clusterProxy[clusterID].data
      for(let i = 0; i < arr.length; i++){
        if(arr[i].isDefault){
          switch(arr[i].type){
            case "private":
              return defaultValue = "InternalNetwork"
            case "public":
              return defaultValue = 'PublicNetwork'
            default:
              return defaultValue = 'Cluster'
          }
        }
      }
    }
    return defaultValue
  }
  tabChange = activeKey => {
    const { form, isTemplate, location, intl } = this.props
    if (!isTemplate && location.query.template) {
      Modal.info({
        title: intl.formatMessage(IntlMessage.accessMethodTabTip)
      })
      return
    }
    this.setState({
      activeKey
    })
    form.setFieldsValue({
      accessType: activeKey
    })
  }
  render() {
    const { activeKey } = this.state
    const { formItemLayout, form, clusterID, isTemplate, location, intl } = this.props
    const { getFieldProps, getFieldValue } = form
    const imageComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_bg_white_style': activeKey === "netExport"
    })
    const appComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_bg_white_style': activeKey === "loadBalance"
    })
    const accessMethodProps = getFieldProps('accessMethod', {
      initialValue: this.getDefaultAccessMethod(),
      onChange: this.accessTypeChange
    })
    const accessMethodValue = getFieldValue('accessMethod')
    return (
      <div>
      {
        this.props.flag &&
      <div id='accessMethod'>
        <Form.Item
        {...formItemLayout}
        label={intl.formatMessage(IntlMessage.accessMethod)}
        className='radioBox'>
        <div style={{ color: '#ccc' }}>已开启服务网格, 服务的访问方式在【治理-服务网格】-【路由管理】的路由规则中设置</div>
        </Form.Item>
      </div>
      }
      {  !this.props.flag &&
      <div id='accessMethod'>
        <Form.Item
          {...formItemLayout}
          label={intl.formatMessage(IntlMessage.accessMethod)}
          className='radioBox'
        >
          <ul className='tabs_header_style'>
            <li className={imageComposeStyle}
                onClick={this.tabChange.bind(this, "netExport")}
            >
              {intl.formatMessage(IntlMessage.clusterNexport)}
            </li>
            <li className={appComposeStyle}
                onClick={this.tabChange.bind(this, "loadBalance")}
            >
              {intl.formatMessage(IntlMessage.loadBalance)}
            </li>
          </ul>
          {
            activeKey === 'netExport' &&
            <Radio.Group {...accessMethodProps}>
              <Radio value="PublicNetwork" key="PublicNetwork">
                {intl.formatMessage(IntlMessage.publicNetAccess)}
                </Radio>
              <Radio value="InternalNetwork" key="InternalNetwork">
                {intl.formatMessage(IntlMessage.intranetAccess)}
                </Radio>
              <Radio value="Cluster" key="Cluster">
                {intl.formatMessage(IntlMessage.clusterAccess)}
              </Radio>
            </Radio.Group>
          }
        </Form.Item>
        {
          activeKey === 'netExport' &&
          <Row className='tipsRow'>
            <Col span="4" />
            <Col span="20">
            {
              !isTemplate
                ? this.accessMethodTips(accessMethodValue)
                :
                <div className="themeColor">
                  <Icon type="info-circle-o" />&nbsp;
                  {intl.formatMessage(IntlMessage.loadBalanceTip)}
                </div>
            }
            </Col>
          </Row>
        }
        {activeKey === 'netExport' && !isTemplate && this.accessMethodContent(accessMethodValue)}
        {
          activeKey === 'loadBalance' &&
          <LoadBalance
            form={form}
            {...{isTemplate, location}}
          />
        }
      </div>
            }
    </div>
    )
  }
}

function mapStateToProp(state, props) {
  let clusterProxy = state.cluster.proxy.result || {}
  // const {toggleCreateAppMeshFlag: { flag = false } = {}} = state.serviceMesh
  return {
    clusterProxy,
    // flag,
  }
}

export default connect(mapStateToProp, {
  getProxy,
})(injectIntl(AccessMethod, {
  withRef: true,
}))
