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
import { Form, Button, Row, Col, Tooltip, Card } from 'antd'
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
import { parseAmount } from '../../../../../src/common/tools';

const nofify = new Notification()

class AppConfiguration extends React.PureComponent {

  state = {
    pluginMsg: false,
    storageNumber: 1,
    replicasNum: 1,
    blockStorageSize: 0.5,
    composeType: 512,
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
  getReplicasNum = val => {
    this.setState({
      replicasNum: val,
    })
  }
  getBlockStorage = val => {
    this.setState({
      blockStorageSize: val,
    })
  }
  resourceTypeChange = type => {
    this.setState({ composeType: type })
  }
  render() {
    const { form, intl, clusterID, currentApp, billingConfig, storageClassType } = this.props
    const { confirmLoading, replicasNum, blockStorageSize, composeType } = this.state
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 14 },
    }
    const configParam = '2x'

    const hourPrice = composeType === 'DIY' ? 0 : this.props.resourcePrice && parseAmount(
      (blockStorageSize * this.props.resourcePrice.storage * replicasNum +
        (replicasNum * this.props.resourcePrice[configParam])) *
      this.props.resourcePrice.dbRatio, 4)
    const countPrice = composeType === 'DIY' ? 0 : this.props.resourcePrice && parseAmount(
      (blockStorageSize * this.props.resourcePrice.storage * replicasNum +
        (replicasNum * this.props.resourcePrice[configParam])) *
      this.props.resourcePrice.dbRatio * 24 * 30, 4)
    const storageUnConfigMsg = !storageClassType.private ? '尚未配置块存储集群，暂不能创建' : ''
    return (
      <TenxPage className="middleware-configs-wrapper">
        <Title title={intl.formatMessage(IntlMessage.deployManage)}/>
        <QueueAnim className="middleware-configs">
          <Row gutter={24}>
            <Col span={17} className="configs-content">
              <BasicInfo
                key={'basicInfo'}
                {...{
                  intl, form, formItemLayout,
                  currentApp, clusterID,
                }}
              />
              <BpmNode
                key={'bpmNode'}
                resourceTypeChange={this.resourceTypeChange}
                replicasChange={this.getReplicasNum}
                {...{
                  intl, form, formItemLayout,
                  clusterID,
                }}
              />
              <MysqlNode
                key={'mysqlNode'}
                blockStorageChange={this.getBlockStorage}
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
                  <Tooltip title={this.state.pluginMsg || storageUnConfigMsg}>
                    <Button
                      type={'primary'} size={'large'}
                      onClick={this.confirmCreate}
                      loading={confirmLoading}
                      disabled={this.state.pluginMsg || !storageClassType.private}
                    >
                      {intl.formatMessage(IntlMessage.create)}
                    </Button>
                  </Tooltip>
                </Col>
              </Row>
            </Col>
            {
              billingConfig.enabled &&
              <Col span={7}>
                <Card>
                  <div className="modal-price">
                    <div className="price-top">
                      <div className="keys">BPM实例：{ parseAmount(this.props.resourcePrice && this.props.resourcePrice['2x'] * this.props.resourcePrice.dbRatio, 4).fullAmount}/（个*小时）* { replicasNum } 个</div>
                      <div className="keys">MySQL实例：{ parseAmount(this.props.resourcePrice && this.props.resourcePrice['2x'] * this.props.resourcePrice.dbRatio, 4).fullAmount}/（个*小时）* 1 个</div>
                      <div className="keys">共享存储：按具体使用量计费</div>
                      <div className="keys">块存储：{ parseAmount(this.props.resourcePrice && this.props.resourcePrice.storage * this.props.resourcePrice.dbRatio, 4).fullAmount}/（GB*小时）* 1 个</div>
                    </div>
                    <div className="price-unit">
                      <div className="price-unit-inner">
                        <p>合计：<span className="unit">{countPrice && countPrice.unit === '￥' ? ' ￥' : ''}</span><span className="unit blod">{ hourPrice && hourPrice.amount }{countPrice && countPrice.unit === '￥' ? '' : ' T'}/小时</span></p>
                        <p className="unit">（约：{ countPrice && countPrice.fullAmount }/月）</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            }
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
  const cluster = getDeepValue(state, [ 'entities', 'current', 'cluster' ])
  const resourcePrice = getDeepValue(state, [ 'entities', 'current', 'cluster', 'resourcePrice' ])
  const registryConfig = getDeepValue(state, [ 'entities', 'loginUser', 'info', 'registryConfig', 'server' ])
  const loginUser = getDeepValue(state, [ 'entities', 'loginUser', 'info' ])
  const space = getDeepValue(state, [ 'entities', 'current', 'space' ])
  const currentApp = getDeepValue(state, [ 'middlewareCenter', 'currentApp', 'app' ])
  const { billingConfig } = state.entities.loginUser.info
  let defaultStorageClassType = {
    private: false,
    share: false,
    host: false,
  }
  if (cluster.storageClassType) {
    defaultStorageClassType = cluster.storageClassType
  }

  return {
    fields,
    clusterID,
    registryConfig,
    loginUser,
    space,
    currentApp,
    billingConfig,
    storageClassType: defaultStorageClassType,
    resourcePrice,
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

