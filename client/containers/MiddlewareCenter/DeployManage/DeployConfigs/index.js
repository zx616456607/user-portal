/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * App configuration
 *
 * @author zhangxuan
 * @date 2018-09-07
 */
import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { Form, Button, Row, Col, Tooltip } from 'antd'
import yaml from 'js-yaml'
import TenxPage from '@tenx-ui/page'
import './style/index.less'
import BasicInfo from './BasicInfo'
import BpmNode from './BpmNode'
import MysqlNode from './MysqlNode'
import { injectIntl } from 'react-intl'
import * as middlewareActions from '../../../../actions/middlewareCenter'
import * as mcActions from '../../../../actions/middlewareCenter'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { buildJson } from './utils'
import Title from '../../../../../src/components/Title'
import IntlMessage from '../../Intl'
import Notification from '../../../../../src/components/Notification'

const nofify = new Notification()

class AppConfiguration extends React.PureComponent {

  state = {
    pluginMsg: false,
  }
  componentDidMount() {
    const { clusterID, loadAppClusterList } = this.props
    this.setState({
      pluginMsg: '校验插件中...',
    })
    loadAppClusterList(clusterID, null, {
      failed: {
        func: () => {
          this.setState({
            pluginMsg: 'bpm-operator插件未安装, 请联系基础设施管理员安装',
          })
        },
      },
      success: {
        func: () => {
          this.setState({
            pluginMsg: false,
          })
        },
      },
    })
  }
  componentWillUnmount() {
    const { clearBpmFormFields } = this.props
    clearBpmFormFields()
  }
  cancelCreate = () => {
    browserHistory.push('/middleware_center/app')
  }

  confirmCreate = async () => {
    const {
      form, registryConfig, loginUser,
      space, fields, currentApp, intl,
      createMiddlewareApp, clusterID,
    } = this.props
    const { validateFields } = form
    validateFields(async errors => {
      if (errors) {
        return
      }
      this.setState({
        confirmLoading: true,
      })
      nofify.spin(intl.formatMessage(IntlMessage.deploying))
      let namespace = ''
      if (space.namespace === 'default') {
        if (namespace.username) {
          namespace = space.username
        } else {
          namespace = loginUser.namespace
        }
      } else {
        namespace = space.namespace
      }
      const imageHost = registryConfig.split('//')[1]
      const json = buildJson(fields, namespace, imageHost, currentApp)
      const template = yaml.dump(json)
      const result = await createMiddlewareApp(clusterID, template)
      if (result.error) {
        this.setState({
          confirmLoading: false,
        })
        nofify.close()
        nofify.warn(intl.formatMessage(IntlMessage.deployFailed))
        return
      }
      this.setState({
        confirmLoading: false,
      })
      nofify.close()
      nofify.success(intl.formatMessage(IntlMessage.deploySuccess))
      browserHistory.push({
        pathname: '/middleware_center/deploy',
        state: {
          active: 'BPM',
        },
      })
    })
  }

  render() {
    const { form, intl, clusterID, currentApp } = this.props
    const { confirmLoading } = this.state
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10 },
    }
    return (
      <TenxPage className="middleware-configs-wrapper">
        <Title title={intl.formatMessage(IntlMessage.deployManage)}/>
        <QueueAnim className="middleware-configs">
          <BasicInfo
            key={'basicInfo'}
            {...{
              intl, form, formItemLayout,
              currentApp, clusterID,
            }}
          />
          <BpmNode
            key={'bpmNode'}
            {...{
              intl, form, formItemLayout,
              clusterID,
            }}
          />
          <MysqlNode
            key={'mysqlNode'}
            {...{
              intl, form, formItemLayout,
              clusterID,
            }}
          />
          <Row className="footer">
            <Col offset={3}>
              <Button
                type={'ghost'} size={'large'}
                onClick={this.cancelCreate}
              >
                {intl.formatMessage(IntlMessage.cancel)}
              </Button>
              <Tooltip title={this.state.pluginMsg}>
                <Button
                  type={'primary'} size={'large'}
                  onClick={this.confirmCreate}
                  loading={confirmLoading}
                  disabled={this.state.pluginMsg}
                >
                  {intl.formatMessage(IntlMessage.create)}
                </Button>
              </Tooltip>
            </Col>
          </Row>
        </QueueAnim>
      </TenxPage>
    )
  }
}

const createFormOpts = {
  mapPropsToFields(props) {
    return props.fields
  },
  onFieldsChange(props, fields) {
    const { setBpmFormFields } = props
    setBpmFormFields(fields)
  },
}

const mapStateToProps = state => {
  const fields = getDeepValue(state, [ 'middlewareCenter', 'appConfigs' ])
  const clusterID = getDeepValue(state, [ 'entities', 'current', 'cluster', 'clusterID' ])
  const registryConfig = getDeepValue(state, [ 'entities', 'loginUser', 'info', 'registryConfig', 'server' ])
  const loginUser = getDeepValue(state, [ 'entities', 'loginUser', 'info' ])
  const space = getDeepValue(state, [ 'entities', 'current', 'space' ])
  const currentApp = getDeepValue(state, [ 'middlewareCenter', 'currentApp', 'app' ])
  return {
    fields,
    clusterID,
    registryConfig,
    loginUser,
    space,
    currentApp,
  }
}

const newAppConfiguration = injectIntl(Form.create(createFormOpts)(AppConfiguration), {
  withRef: true,
})
export default connect(mapStateToProps, {
  setBpmFormFields: middlewareActions.setBpmFormFields,
  clearBpmFormFields: middlewareActions.clearBpmFormFields,
  createMiddlewareApp: middlewareActions.createMiddlewareApp,
  loadAppClusterList: mcActions.loadAppClusterList,
})(newAppConfiguration)

