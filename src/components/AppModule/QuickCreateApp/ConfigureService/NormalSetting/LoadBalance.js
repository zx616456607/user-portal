/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance
 *
 * v0.1 - 2018-01-17
 * @author Zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Select, Radio, Form,
  Button, Input, Row, Col, Icon
} from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'

import './style/LoadBalance.less'
import IngressModal from './IngressModal'
import TcpUdpModal from './TcpUdpModal'
import { getLBList, checkIngressNameAndHost } from '../../../../../actions/load_balance'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

let uidd = 0
let tcpUidd = 0
let udpUidd = 0

class LoadBalance extends React.Component {

  state = {

  }

  componentWillMount() {
    const { clusterID, getLBList, form } = this.props
    getLBList(clusterID)
    const lbKeys = form.getFieldValue('lbKeys');
    if (lbKeys) {
      lbKeys.forEach(key => {
        const sourceOptons = form.getFieldValue(`ingress-${key}`)
        const targetOptions = cloneDeep(sourceOptons)
        delete targetOptions.healthCheck
        delete targetOptions.displayName
        targetOptions.monitorName = sourceOptons.displayName
        targetOptions.healthOptions = sourceOptons.healthCheck
        targetOptions.sessionPersistent = parseInt(targetOptions.sessionPersistent, 10)
        this.setState({
          [`config-${key}`]: targetOptions
        })
      })
    }
  }

  checkLoadBalance = (rule, value, callback) => {
    const { intl } = this.props
    const { getFieldValue, setFieldsValue } = this.props.form
    if (getFieldValue('loadBalance') !== value) {
      setFieldsValue({
        lbKeys: []
      })
    }
    if (!value) {
      return callback(intl.formatMessage(IntlMessage.pleaseSelect, {
        item: intl.formatMessage(IntlMessage.loadBalance)
      }))
    }
    callback()
  }

  agentTypeChange = async e => {
    const { value } = e.target
    const { loadBalanceList, form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const originalAgentType = getFieldValue('originalAgentType')
    if (!originalAgentType) { // 用于编辑模板和部署模板
      setFieldsValue({
        loadBalance: '',
      })
      return
    }
    if (isEmpty(loadBalanceList)) {
      return
    }
    if (value !== originalAgentType) {
      const filterLb = loadBalanceList.filter(item => item.metadata.labels.agentType === value)
      if (isEmpty(filterLb)) {
        setFieldsValue({
          loadBalance: '',
        })
        return
      }
      await setFieldsValue({
        loadBalance: filterLb[0].metadata.name,
      })
      return
    }
    await setFieldsValue({
      loadBalance: getFieldValue('originalLoadBalance')
    })
  }

  addItem = configs => {
    const { editKey } = this.state
    const { form, intl } = this.props
    const { getFieldValue, setFieldsValue } = form
    const currentKeys = getFieldValue('lbKeys')
    const copyKey = editKey || uidd
    this.setState({
      [`config-${copyKey}`]: configs
    })
    const {
      healthCheck, healthOptions, host, context, lbAlgorithm, monitorName, port,
      sessionSticky, sessionPersistent, weight,
    } = configs
    let body = {
      host,
      context,
      lbAlgorithm,
      displayName: monitorName,
      port
    }
    if (sessionSticky) {
      body = Object.assign({}, body, {
        sessionSticky,
        sessionPersistent: `${sessionPersistent}s`
      })
    }
    if (healthCheck) {
      body = Object.assign({}, body, { healthCheck: healthOptions })
    }
    if (lbAlgorithm !== 'ip_hash') {
      body = Object.assign({}, body, { weight })
    }
    setFieldsValue({
      [`ingress-${copyKey}`]: body,
      [`displayName-${copyKey}`]: configs.monitorName,
      [`lbAlgorithm-${copyKey}`]: configs.lbAlgorithm,
      [`weight-${copyKey}`]: configs.weight ? configs.weight : intl.formatMessage(IntlMessage.notEnabled),
      [`sessionPersistent-${copyKey}`]: configs.sessionSticky ?
        `${intl.formatMessage(IntlMessage.activated)}（${configs.sessionPersistent}s）` :
        intl.formatMessage(IntlMessage.notEnabled),
      [`host-${copyKey}`]: configs.host || intl.formatMessage(IntlMessage.notEnabled),
      [`port-${copyKey}`]: configs.port
    })
    if (!editKey && (editKey !== 0)) {
      setFieldsValue({
        lbKeys: currentKeys.concat(uidd ++)
      })
    } else if (!currentKeys.includes(editKey)){
      setFieldsValue({
        lbKeys: currentKeys.concat(editKey)
      })
    }
    this.setState({
      editKey: ''
    })
  }

  addTcpUdpItem = configs => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const { protocol } = this.state
    const lowerProtocol = protocol.toLowerCase()
    const { editKey } = this.state
    const currentKeys = getFieldValue(`${lowerProtocol}Keys`)
    let count = udpUidd
    if (lowerProtocol === 'tcp') {
      count = tcpUidd
    }
    const copyKey = editKey || count
    const { modalExportPort, modalServicePort } = configs
    setFieldsValue({
      [`${lowerProtocol}-servicePort-${copyKey}`]: modalServicePort,
      [`${lowerProtocol}-exportPort-${copyKey}`]: modalExportPort,
    })
    if (!editKey && (editKey !== 0)) {
      if (lowerProtocol === 'tcp') {
        tcpUidd ++
      } else {
        udpUidd ++
      }
      setFieldsValue({
        [`${lowerProtocol}Keys`]: currentKeys.concat(count),
      })
    } else if (!currentKeys.includes(editKey)) {
      setFieldsValue({
        [`${lowerProtocol}Keys`]: currentKeys.concat(editKey)
      })
    }
    this.setState({
      editKey: '',
    })
  }

  removeTcpUdpKey = (protocol, key) => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const lowerProtocol = protocol.toLowerCase()
    setFieldsValue({
      [`${lowerProtocol}Keys`]: getFieldValue(`${lowerProtocol}Keys`).filter(item => item !== key)
    })
  }

  removeKey = key => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const cloneState = cloneDeep(this.state)
    delete cloneState[`config-key`]
    this.setState(cloneState)
    setFieldsValue({
      lbKeys: getFieldValue('lbKeys').filter(item => item !== key)
    })
  }
  openIngressModal = (protocol, key) => {
    const { getFieldValue } = this.props.form
    const lbKeys = getFieldValue('lbKeys')
    const lowerProtocol = protocol.toLowerCase()
    this.setState({
      protocol,
    })
    const protocolKeys = getFieldValue(`${lowerProtocol}Keys`)
    let modalKey = 'ingressVisible'
    if (lowerProtocol !== 'http') {
      modalKey = 'tcpUdpVisible'
    }
    if (key || key === 0) {
      this.setState({
        editKey: key,
        [modalKey]: true
      })
      let currentIngress = Object.assign({}, this.state[`config-${key}`])
      if (lowerProtocol !== 'http') {
        currentIngress = {
          exportPort: getFieldValue(`${lowerProtocol}-exportPort-${key}`),
          servicePort: getFieldValue(`${lowerProtocol}-servicePort-${key}`),
        }
      }
      this.setState({
        currentIngress,
      })
    } else {
      let editKey = 0
      let lastKey
      let keysLength
      if (lowerProtocol === 'http' && !isEmpty(lbKeys)) {
        keysLength = lbKeys.length
        lastKey = lbKeys[keysLength - 1]
        editKey = ++ lastKey
      } else if (lowerProtocol !== 'http' && !isEmpty(protocolKeys)) {
        keysLength = protocolKeys.length
        lastKey = protocolKeys[keysLength - 1]
        editKey = ++ lastKey
      }
      this.setState({
        editKey,
        currentIngress: null,
        [modalKey]: true
      })
    }
  }

  closeIngressModal = () => {
    this.setState({
      ingressVisible: false
    })
  }

  getIngressConfig = configs => {
    const { protocol } = this.state
    if (protocol === 'HTTP') {
      this.addItem(configs)
      return
    }
  }

  reloadLB = async () => {
    const { clusterID, getLBList } = this.props
    this.setState({
      lbLoading: true
    })
    const result = await getLBList(clusterID)
    if (result.error) {
      this.setState({
        lbLoading: false
      })
      return
    }
    this.setState({
      lbLoading: false
    })
  }

  renderIngressHeader = protocol => {
    const { location, isTemplate, intl } = this.props
    const templateDeploy = location.query.template && !isTemplate
    return <Row className="monitorConfigHeader">
      {
        protocol === 'HTTP' &&
        [
          <Col key="name" span={4}>{intl.formatMessage(IntlMessage.name)}</Col>,
          <Col key="algorithm" span={4}>{intl.formatMessage(IntlMessage.schedulingAlgorithm)}</Col>,
          <Col key="weight" span={2}>{intl.formatMessage(IntlMessage.weights)}</Col>,
          <Col key="sessionSticky" span={4}>{intl.formatMessage(IntlMessage.sessionSticky)}</Col>,
          <Col key="host" span={4}>{intl.formatMessage(IntlMessage.serviceLocation)}</Col>,
        ]
      }
      <Col span={protocol === 'HTTP' ? 2 : 4}>{intl.formatMessage(IntlMessage.containerPort)}</Col>
      {
        protocol !== 'HTTP' &&
        <Col span={4}>
          {intl.formatMessage(IntlMessage.listeningPort)}
        </Col>
      }
      {
        !templateDeploy &&
        <Col span={4}>{intl.formatMessage(IntlMessage.operate)}</Col>
      }
    </Row>
  }

  renderIngress = protocol => {
    switch (protocol) {
      case 'TCP':
      case 'UDP':
        return this.tcpUdpIngress(protocol)
      case 'HTTP':
        return this.httpIngress()
      default:
        return
    }
  }

  httpIngress = () => {
    const { form, location, isTemplate } = this.props
    const { getFieldValue, getFieldProps } = form
    const templateDeploy = location.query.template && !isTemplate
    return getFieldValue('lbKeys').length ? getFieldValue('lbKeys').map((item) => {
        return (
          <Row className="serviceList" type="flex" align="middle" key={`service${item}`}>
            <Col span={4}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`displayName-${item}`)} >
                </Input>
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`lbAlgorithm-${item}`)}>
                </Input>
              </FormItem>
            </Col>
            <Col span={2}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`weight-${item}`)}>
                </Input>
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`sessionPersistent-${item}`)}>
                </Input>
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`host-${item}`)}>
                </Input>
              </FormItem>
            </Col>
            <Col span={2}>
              <FormItem>
                <Input
                  disabled
                  {...getFieldProps(`port-${item}`)}>
                </Input>
              </FormItem>
            </Col>
            <Col span={4} className={templateDeploy ? 'hidden' : ''}>
              <Button type="dashed" key={`edit${item}`}
                      className="editServiceBtn" onClick={() => this.openIngressModal('HTTP', item)}>
                <i className="fa fa-pencil-square-o" aria-hidden="true"/></Button>
              <Button type="dashed" icon="delete" key={`delete${item}`} onClick={() => this.removeKey(item)}/>
            </Col>
          </Row>
        )
      }): this.noneIngress()
  }

  tcpUdpIngress = protocol => {
    const { form, location, isTemplate } = this.props
    const { getFieldValue, getFieldProps } = form
    const templateDeploy = location.query.template && !isTemplate
    const lowerProtocol = protocol.toLowerCase()
    const keys = getFieldValue(`${lowerProtocol}Keys`)
    if (isEmpty(keys)) {
      return this.noneIngress()
    }
    return keys.map(key =>
      <Row className="serviceList" type="flex" align="middle" key={`${lowerProtocol}${key}`}>
        <Col span={4}>
          <FormItem>
            <Input
              disabled
              {...getFieldProps(`${lowerProtocol}-servicePort-${key}`)}
            />
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem>
            <Input
              disabled
              {...getFieldProps(`${lowerProtocol}-exportPort-${key}`)}
            />
          </FormItem>
        </Col>
        <Col span={4} className={templateDeploy ? 'hidden' : ''}>
          <Button
            type="dashed" key={`${lowerProtocol}-edit-${key}`}
            className="editServiceBtn"
            onClick={() => this.openIngressModal(protocol, key)}
          >
            <i className="fa fa-pencil-square-o" aria-hidden="true"/>
          </Button>
          <Button
            type="dashed" icon="delete" key={`${lowerProtocol}-delete-${key}`}
            onClick={() => this.removeTcpUdpKey(protocol, key)}
          />
        </Col>
      </Row>
    )
  }

  noneIngress = () => {
    const { intl } = this.props
    return <Row className="serviceList hintColor noneService" type="flex" align="middle" justify="center">
      {intl.formatMessage(IntlMessage.noListenConfig)}
    </Row>
  }

  closeTcpUdpModal = () => {
    this.setState({
      tcpUdpVisible: false,
    })
  }

  renderIngressWrapper = protocol => {
    const { location, isTemplate, form, intl } = this.props
    const { getFieldValue } = form
    const templateDeploy = location.query.template && !isTemplate
    const loadBalance = getFieldValue('loadBalance')
    return <div style={{ marginBottom: 20 }}>
      {
        !templateDeploy && loadBalance &&
          <Button className="addConfig" type="ghost" icon="plus" onClick={() => this.openIngressModal(protocol)}>
            {intl.formatMessage(IntlMessage.addIngress, {
              item: protocol,
            })}
          </Button>
      }
      {
        (loadBalance || templateDeploy) && this.renderIngressHeader(protocol)
      }
      {
        (loadBalance || templateDeploy) && this.renderIngress(protocol)
      }
    </div>
  }

  render() {
    const { form, loadBalanceList, checkIngressNameAndHost, clusterID, location, isTemplate, intl } = this.props
    const { ingressVisible, currentIngress, lbLoading, tcpUdpVisible, protocol } = this.state
    const { getFieldProps, getFieldValue } = form

    const templateDeploy = location.query.template && !isTemplate

    getFieldProps('lbKeys', {
      initialValue: [],
    });
    getFieldProps('tcpKeys', {
      initialValue: [],
    });
    getFieldProps('udpKeys', {
      initialValue: [],
    });
    const lbSelectProps = getFieldProps('loadBalance', {
      rules: [
        {
          validator: this.checkLoadBalance
        }
      ]
    })
    const agentTypeProps = getFieldProps('agentType', {
      initialValue: 'inside',
      onChange: this.agentTypeChange,
    })
    const agentType = getFieldValue('agentType')
    return (
      <Row className="serviceCreateLb">
        {
          ingressVisible &&
          <IngressModal
            visible={ingressVisible}
            currentIngress={currentIngress}
            closeModal={this.closeIngressModal}
            callback={this.getIngressConfig}
            clusterID={clusterID}
            lbname={getFieldValue('loadBalance')}
            checkIngressNameAndHost={checkIngressNameAndHost}
          />
        }
        {
          tcpUdpVisible &&
            <TcpUdpModal
              type={protocol}
              visible={tcpUdpVisible}
              currentIngress={currentIngress}
              callback={this.addTcpUdpItem}
              closeModal={this.closeTcpUdpModal}
              clusterID={clusterID}
              lbname={getFieldValue('loadBalance')}
              form={form}
            />
        }
        <Col span={20} offset={4}>
          <FormItem
            wrapperCol={{ span: 22 }}
          >
            <RadioGroup {...agentTypeProps}>
              <Radio value="inside">{intl.formatMessage(IntlMessage.innerClusterLB)}</Radio>
              <Radio value="outside">{intl.formatMessage(IntlMessage.outerClusterLB)}</Radio>
            </RadioGroup>
          </FormItem>
          <Row>
            <Col span={8}>
              <FormItem
                wrapperCol={{ span: 22 }}
              >
                <Select
                  placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                    item: intl.formatMessage(IntlMessage.loadBalance)
                  })}
                  {...lbSelectProps}
                >
                  {
                    (loadBalanceList || [])
                      .filter(item => {
                          const filterKey = item.metadata.labels.agentType
                          if (agentType === 'inside') {
                            return filterKey === 'inside' || filterKey === 'HAInside'
                          } else if (agentType === 'outside') {
                            return filterKey === 'outside' || filterKey === 'HAOutside'
                          }
                        })
                      .map(item =>
                      <Option key={item.metadata.name}>{item.metadata.annotations.displayName}</Option>
                    )
                  }
                </Select>
              </FormItem>
            </Col>
            <Col span={2}><Button type="ghost" size="large" onClick={this.reloadLB}>
              {lbLoading ? <Icon type="loading" /> : <Icon type="reload" />}</Button></Col>
            <Col span={3}>
              <Button type="primary" size="large" onClick={() => window.open('/net-management/appLoadBalance/createLoadBalance') }>
                {intl.formatMessage(IntlMessage.createLB)}
              </Button>
            </Col>
          </Row>
          {
            (!templateDeploy || getFieldValue('loadBalance')) && this.renderIngressWrapper('TCP')
          }
          {
            (!templateDeploy || getFieldValue('loadBalance')) && this.renderIngressWrapper('UDP')
          }
          {
            (!templateDeploy || getFieldValue('loadBalance')) && this.renderIngressWrapper('HTTP')
          }
        </Col>
      </Row>
    )
  }
}

const mapStateToProps = state => {
  const { entities, loadBalance } = state
  const { clusterID } = entities.current.cluster
  const { loadBalanceList } = loadBalance
  const { data } = loadBalanceList || { data: [] }
  return {
    clusterID,
    loadBalanceList: data
  }
}

export default connect(mapStateToProps, {
  getLBList,
  checkIngressNameAndHost
})(injectIntl(LoadBalance, {
  withRef: true,
}))
