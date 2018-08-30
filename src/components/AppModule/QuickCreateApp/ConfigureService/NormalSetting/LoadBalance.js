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
    const protocol = getFieldValue('protocol')
    const lowerProtocol = protocol.toLowerCase()
    const { editKey } = this.state
    const currentKeys = getFieldValue(`${lowerProtocol}Keys`)
    let count = udpUidd
    if (lowerProtocol === 'tcp') {
      count = tcpUidd
    }
    const copyKey = editKey || count
    const { monitorPort, containerPort } = configs
    setFieldsValue({
      [`${lowerProtocol}-container-port-${copyKey}`]: containerPort[0],
      [`${lowerProtocol}-monitor-port-${copyKey}`]: monitorPort,
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

  removeTcpUdpKey = key => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const protocol = getFieldValue('protocol')
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
  openIngressModal = key => {
    const { getFieldValue } = this.props.form
    const lbKeys = getFieldValue('lbKeys')
    const protocolType = getFieldValue('protocol')
    const lowerProtocol = protocolType.toLowerCase()
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
          monitorPort: getFieldValue(`${lowerProtocol}-monitor-port-${key}`),
          containerPort: getFieldValue(`${lowerProtocol}-container-port-${key}`),
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
    const { getFieldValue } = this.props.form
    const protocol = getFieldValue('protocol')
    if (protocol === 'HTTP') {
      this.addItem(configs)
      return
    }
    this.addTcpUdpItem(protocol)
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

  renderIngressHeader = () => {
    const { location, isTemplate, form, intl } = this.props
    const { getFieldValue } = form
    const protocolValue = getFieldValue('protocol')
    const templateDeploy = location.query.template && !isTemplate
    return <Row className="monitorConfigHeader">
      {
        protocolValue === 'HTTP' &&
        [
          <Col key="name" span={4}>{intl.formatMessage(IntlMessage.name)}</Col>,
          <Col key="algorithm" span={4}>{intl.formatMessage(IntlMessage.schedulingAlgorithm)}</Col>,
          <Col key="weight" span={2}>{intl.formatMessage(IntlMessage.weights)}</Col>,
          <Col key="sessionSticky" span={4}>{intl.formatMessage(IntlMessage.sessionSticky)}</Col>,
          <Col key="host" span={4}>{intl.formatMessage(IntlMessage.serviceLocation)}</Col>,
        ]
      }
      <Col span={protocolValue === 'HTTP' ? 2 : 4}>{intl.formatMessage(IntlMessage.containerPort)}</Col>
      {
        protocolValue !== 'HTTP' &&
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

  renderIngress = () => {
    const { form } = this.props
    const { getFieldValue } = form
    const protocolValue = getFieldValue('protocol')
    switch (protocolValue) {
      case 'TCP':
      case 'UDP':
        return this.tcpUdpIngress(protocolValue)
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
                      className="editServiceBtn" onClick={() => this.openIngressModal(item)}>
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
              {...getFieldProps(`${lowerProtocol}-container-port-${key}`)}
            />
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem>
            <Input
              disabled
              {...getFieldProps(`${lowerProtocol}-monitor-port-${key}`)}
            />
          </FormItem>
        </Col>
        <Col span={4} className={templateDeploy ? 'hidden' : ''}>
          <Button
            type="dashed" key={`${lowerProtocol}-edit-${key}`}
            className="editServiceBtn"
            onClick={() => this.openIngressModal(key)}
          >
            <i className="fa fa-pencil-square-o" aria-hidden="true"/>
          </Button>
          <Button
            type="dashed" icon="delete" key={`${lowerProtocol}-delete-${key}`}
            onClick={() => this.removeTcpUdpKey(key)}
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
  render() {
    const { ingressVisible, currentIngress, lbLoading, tcpUdpVisible } = this.state
    const { form, loadBalanceList, checkIngressNameAndHost, clusterID, location, isTemplate } = this.props
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
      initialValue: 'outside'
    })
    const protocolProps = getFieldProps('protocol', {
      initialValue: 'HTTP',
    })
    const protocolValue = getFieldValue('protocol')
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
              type={protocolValue}
              visible={tcpUdpVisible}
              currentIngress={currentIngress}
              callback={this.addTcpUdpItem}
              closeModal={this.closeTcpUdpModal}
            />
        }
        <Col span={20} offset={4}>
          <FormItem
            wrapperCol={{ span: 22 }}
          >
            <RadioGroup {...agentTypeProps}>
              <Radio value="inside" disabled>{intl.formatMessage(IntlMessage.innerClusterLB)}</Radio>
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
                    (loadBalanceList || []).map(item =>
                      <Option key={item.metadata.name}>{item.metadata.annotations.displayName}</Option>
                    )
                  }
                </Select>
              </FormItem>
            </Col>
            <Col span={2}><Button type="ghost" size="large" onClick={this.reloadLB}>
              {lbLoading ? <Icon type="loading" /> : <Icon type="reload" />}</Button></Col>
            <Col span={3}>
              <Button type="primary" size="large" onClick={() => window.open('/app_manage/load_balance') }>
                {intl.formatMessage(IntlMessage.createLB)}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>{intl.formatMessage(IntlMessage.listeningRule)}</Col>
          </Row>
          <FormItem
            wrapperCol={{ span: 22 }}
          >
            <RadioGroup {...protocolProps}>
              <Radio value="TCP" disabled>TCP</Radio>
              <Radio value="UDP" disabled>UDP</Radio>
              <Radio value="HTTP">HTTP</Radio>
            </RadioGroup>
          </FormItem>
          {
            !templateDeploy && getFieldValue('loadBalance') &&
              <Button className="addConfig" type="ghost" icon="plus" onClick={() => this.openIngressModal()}>
                {intl.formatMessage(IntlMessage.addIngress, {
                  item: protocolValue,
                })}
              </Button>
          }
          {
            (getFieldValue('loadBalance') || templateDeploy) && this.renderIngressHeader()
          }
          {(getFieldValue('loadBalance') || templateDeploy) && this.renderIngress()}
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
