/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Add hosts
 *
 * @author zhangxuan
 * @date 2018-12-03
 */
import React from 'react'
import QueueAnim from 'rc-queue-anim'
import { Form, Row, Col, Button } from 'antd'
import { browserHistory } from 'react-router'
import Title from '../../../../src/components/Title'
import TenxIcon from '@tenx-ui/icon/lib/_old'
import '@tenx-ui/icon/assets/index.css'
import ReturnButton from '@tenx-ui/return-button/lib'
import '@tenx-ui/return-button/assets/index.css'
import TenxPage from '@tenx-ui/page/lib'
import '@tenx-ui/page/assets/index.css'
import './style/AddHosts.less'
import DiyHost from './ServiceProviders/DiyHost'
import { formatIpRangeToArray } from './ServiceProviders/utils';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20 },
}
const FormItem = Form.Item

class AddHosts extends React.PureComponent {

  state = {
    diyData: {},
    rightCloudData: {},
  }

  back = () => {
    browserHistory.push('/cluster')
  }

  addDiyFields = data => {
    const { diyData } = this.state
    const { form } = this.props
    const { setFieldsValue } = form
    const copyData = cloneDeep(diyData)
    let lastKey = 0
    if (!isEmpty(copyData.keys)) {
      lastKey = copyData.keys[copyData.keys.length - 1]
    } else {
      copyData.keys = []
    }
    if (data.addType === 'diff') {
      data.newKeys.forEach(key => {
        lastKey++
        copyData.keys.push(lastKey)
        Object.assign(copyData, {
          [`host-${lastKey}`]: data[`host-${key}`],
          [`username-${lastKey}`]: data[`username-${key}`],
          [`password-${lastKey}`]: data[`password-${key}`],
        })
      })
    } else {
      const { editor, username, password } = data
      const hostArray = formatIpRangeToArray(editor)
      hostArray.forEach(item => {
        lastKey++
        copyData.keys.push(lastKey)
        Object.assign(copyData, {
          [`host-${lastKey}`]: item,
          [`username-${lastKey}`]: username,
          [`password-${lastKey}`]: password,
        })
      })
    }
    setFieldsValue(copyData)
    this.setState({
      diyData: Object.assign({}, copyData, {
        addType: data.addType,
      }),
    })
  }

  addRightCloudFields = data => {
    const { rightCloudData } = this.state
    const { form } = this.props
    const { setFieldsValue } = form
    const copyData = cloneDeep(rightCloudData)
    if (isEmpty(copyData.rcKeys)) {
      copyData.rcKeys = []
    }
    data.forEach(item => {
      copyData.rcKeys.push(item.instanceName)
      Object.assign(copyData, {
        [`host-${item.instanceName}`]: item.innerIp,
        [`hostName-${item.instanceName}`]: item.instanceName,
        [`password-${item.instanceName}`]: item.password,
        [`cloudEnvName-${item.instanceName}`]: item.cloudEnvName,
      })
    })
    setFieldsValue(copyData)
    this.setState({
      rightCloudData: copyData,
    })
  }

  removeRcField = key => {
    const { rightCloudData } = this.state
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const rcKeys = getFieldValue('rcKeys')
    setFieldsValue({
      rcKeys: rcKeys.filter(_key => _key !== key),
    })
    const finalData = Object.assign({}, rightCloudData, {
      rcKeys: rightCloudData.rcKeys.filter(_key => _key !== key),
    })
    this.setState({
      rightCloudData: finalData,
    })
  }

  removeDiyField = key => {
    const { diyData } = this.state
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const keys = getFieldValue('keys')
    setFieldsValue({
      keys: keys.filter(_key => _key !== key),
    })
    const finalData = Object.assign({}, diyData, {
      keys: diyData.keys.filter(_key => _key !== key),
    })
    this.setState({
      diyData: finalData,
    })
  }

  updateState = (key, data) => {
    switch (key) {
      case 'diyData':
        return this.addDiyFields(data)
      case 'rightCloud':
        return this.addRightCloudFields(data)
      default:
        break
    }
  }

  removeDiyField = key => {
    const { diyData } = this.state
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const keys = getFieldValue('keys')
    setFieldsValue({
      keys: keys.filter(_key => _key !== key),
    })
    const finalData = Object.assign({}, diyData, {
      keys: diyData.keys.filter(_key => _key !== key),
    })
    this.setState({
      diyData: finalData,
    })
  }

  handleConfirm = () => {
    const { form } = this.props
    const { validateFields } = form
    validateFields(errors => {
      if (errors) {
        return
      }
    })
  }
  render() {
    const { diyData } = this.state
    const { form } = this.props
    return (
      <QueueAnim className="add-hosts">
        <Title title={'添加节点'}/>
        <ReturnButton onClick={this.back}>返回集群管理</ReturnButton>
        <span className="first-title">添加节点</span>
        <TenxPage inner className="add-hosts-body">
          <FormItem
            label={'集群节点来源'}
            {...formItemLayout}
          >
            <div><TenxIcon type="server"/> 自定义添加主机</div>
          </FormItem>
          <DiyHost
            {...{
              form,
              formItemLayout,
              updateState: data => this.updateState('diyData', data),
              removeDiyField: this.removeDiyField,
              dataSource: diyData,
            }}
          />
          <div className="dividing-line"/>
          <Row className={'create-cluster-footer'}>
            <Col offset={3}>
              <Button type={'ghost'} onClick={this.back}>取消</Button>
              <Button type={'primary'} onClick={this.handleConfirm}>确定</Button>
            </Col>
          </Row>
        </TenxPage>
      </QueueAnim>
    )
  }
}

export default Form.create()(AddHosts)
