/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: apm configure
 *
 * v0.1 - 2017-09-12
 * @author Zhangpc
 */

import React from 'react'
import { Form, Checkbox, Modal, Button, Spin } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { loadApms } from '../../../../actions/apm'
import { ROLE_SYS_ADMIN } from '../../../../../constants'
import { API_URL_PREFIX } from '../../../../constants'
import { toQuerystring } from '../../../../common/tools'
import './style/ApmSetting.less'

const FormItem = Form.Item

const ApmSetting = React.createClass({
  getInitialState() {
    return {
      midSupportModal: false,
      isOnlyShowSubmitBtn: false,
      confirmApmChecked: false,
    }
  },

  componentWillMount() {
    const { current, loadApms } = this.props
    loadApms(current.cluster.clusterID)
  },

  onApmChange(e) {
    const value = e.target.checked
    if (value) {
      this.setState({ midSupportModal: true, isOnlyShowSubmitBtn: false })
    }
  },

  cancelApm() {
    this.setState({ midSupportModal: false })
    this.props.form.setFieldsValue({ apm: false })
  },

  renderApm() {
    const { form, formItemLayout, loginUser, apmList, openApi } = this.props
    const { apms, isFetching } = apmList
    // msa-portal url not configure
    const msaUrl = loginUser.msaConfig.url
    if (!msaUrl) {
      return (
        <span>
          当前平台未配置微服务治理套件，
          {
            loginUser.role === ROLE_SYS_ADMIN
            ? <span>前往设置<Link to="/setting/globalConfig">全局配置</Link></span>
            : '请联系管理员进行配置'
          }
        </span>
      )
    }
    if (isFetching) {
      return <div><Spin /> 加载 apm 中 ...</div>
    }
    // apm not install
    if (!apms || apms.length === 0) {
      return (
        <span>
          当前空间未安装 APM Agent，前往安装 <a target="_blank" href={`${API_URL_PREFIX}/jwt-auth?${toQuerystring({ redirect: `${msaUrl}/setting/apms` })}`}>微服务平台</a>
        </span>
      )
    }
    const { getFieldProps } = form
    const apmProps = getFieldProps('apm', {
      valuePropName: 'checked',
      onChange: this.onApmChange
    })
    return [
      <Checkbox {...apmProps} key="apm-check">立即开通</Checkbox>,
      <span
        key="apm-support"
        className="supportSpan"
        onClick={
          () => this.setState({ midSupportModal: true, isOnlyShowSubmitBtn: true })
        }
      >
        查看支持的中间件
      </span>
    ]
  },

  render() {
    const { formItemLayout } = this.props
    const {
      midSupportModal,
      isOnlyShowSubmitBtn,
      confirmApmChecked,
    } = this.state
    const midSupportModalProps = {}
    const POD_IP = "{POD_IP}"
    if (isOnlyShowSubmitBtn) {
      midSupportModalProps.footer = [
        <Button
          key="submit"
          type="primary"
          size="large"
          onClick={
            () => this.setState({ midSupportModal: false })
          }
        >
          确 定
        </Button>
      ]
    } else {
      midSupportModalProps.footer = [
        <Button
          key="cancel"
          size="large"
          onClick={this.cancelApm}
        >
        暂不开通
        </Button>,
        <Button
          key="submit"
          type="primary"
          size="large"
          onClick={
            () => this.setState({ midSupportModal: false })
          }
          disabled={!confirmApmChecked}
        >
        我知道了，开通 APM
        </Button>
      ]
    }
    return (
      <FormItem
        {...formItemLayout}
        label="性能管理"
        key="apm"
        className="apmSetting"
      >
        {this.renderApm()}
        <Modal
          title="应用性能管理（APM）- 须知"
          visible={midSupportModal}
          {...midSupportModalProps}
          className="midSupportModal"
          onCancel={() => this.setState({midSupportModal: false})}
          closable
        >
        需要如下 JVM 配置：
          <ul>
            <li>
              支持通过 JAVA_OPTS 传递 JVM 参数
            </li>
            <li>
              设置 Pinpoint agent id, 需要提前在镜像中添加 JVM 参数：-Dpinpoint.agentId=${POD_IP}
            </li>
            <li>
              Dockerfile CMD 示例：
              <br/><strong>CMD java $JAVA_OPTS -Dpinpoint.agentId=${POD_IP} -jar /app/app.jar</strong>
            </li>
          </ul>
        支持的中间件如下：
          <ul>
            <li>
              JDK 6+
            </li>
            <li>
              Tomcat 6/7/8, Jetty 8/9, JBoss EAP 6, Resin 3/4
            </li>
            <li>
              Spring, Spring Boot
            </li>
            <li>
              Apache HTTP Client 3.x/4.x, JDK HttpConnector, GoogleHttpClient, OkHttpClient, NingAsyncHttpClient
            </li>
            <li>
              Thrift Client, Thrift Service, DUBBO PROVIDER, DUBBO CONSUMER
            </li>
            <li>
              MySQL, Oracle, MSSQL, CUBRID, DBCP, POSTGRESQL, MARIA
            </li>
            <li>
              Arcus, Memcached, Redis, CASSANDRA
            </li>
            <li>
              iBATIS, MyBatis
            </li>
            <li>
              gson, Jackson, Json Lib
            </li>
            <li>
              log4j, Logback
            </li>
          </ul>
          {
            !isOnlyShowSubmitBtn && (
              <Checkbox
                onChange={e => this.setState({ confirmApmChecked: e.target.checked })}
                checked={confirmApmChecked}
              >
              确认镜像所用中间件在上述列表内，且满足 JVM 配置
              </Checkbox>
            )
          }
        </Modal>
      </FormItem>
    )
  }
})

function mapStateToProps(state) {
  const { entities, apmList, openApi } = state
  const { current, loginUser } = entities
  return {
    current,
    loginUser: loginUser.info,
    apmList: apmList[current.cluster.clusterID] || {},
    openApi,
  }
}

export default connect(mapStateToProps, {
  loadApms,
})(ApmSetting)
