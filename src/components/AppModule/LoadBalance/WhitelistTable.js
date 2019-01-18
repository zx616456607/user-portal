/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Whitelist table
 *
 * @author zhangxuan
 * @date 2018-09-09
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Row, Col, Form, Input, Icon } from 'antd'
import isEmpty from 'lodash/isEmpty'
import TenxPage from '@tenx-ui/page'
import './style/WhiteListTable.less'
import Notification from '../../Notification'
import * as lbActions from '../../../actions/load_balance'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'

const FormItem = Form.Item
const notify = new Notification()

let uidd = 0

@connect(null, {
  updateLBWhiteList: lbActions.updateLBWhiteList,
  getLBDetail: lbActions.getLBDetail,
})

class WhitelistTable extends React.PureComponent {
  state = {}

  componentDidMount() {
    this.initFields()
  }

  initFields = () => {
    const { form, lbDetail } = this.props
    const { setFieldsValue, resetFields } = form
    const { whitelistSourceRange } = lbDetail.deployment.metadata.annotations
    resetFields()
    if (!isEmpty(whitelistSourceRange)) {
      const dataArray = whitelistSourceRange.split(',')
      const keys = []
      const fieldObj = {}
      dataArray.forEach((item, index) => {
        keys.push(index)
        uidd = index
        Object.assign(fieldObj, {
          [`ip-${index}`]: item,
        })
      })
      setFieldsValue({
        keys,
        ...fieldObj,
      })
    }
  }

  renderTableHeader = () => {
    return (
      <Row className="white-list-table-header" type={'flex'} align="middle">
        <Col span={18}>IP</Col>
        <Col span={6}>操作</Col>
      </Row>
    )
  }

  renderWhiteList = () => {
    const { isEdit } = this.state
    const { form } = this.props
    const { getFieldValue, getFieldProps } = form
    const keys = getFieldValue('keys')
    if (isEmpty(keys)) {
      return <div className="white-list-no-data">暂无数据</div>
    }
    return keys.map(item => {
      return <Row key={item} className="white-list-table-row" type={'flex'} align="middle">
        <Col span={6}>
          <FormItem>
            <Input
              disabled={!isEdit}
              style={{ width: '100%' }}
              {...getFieldProps(`ip-${item}`, {
                rules: [{
                  isRequired: true,
                  whitespace: true,
                  message: '请输入地址'
                }, {
                  validator: (rules, value, callback) => {
                    if (!value) {
                      return callback('请输入地址')
                    }
                    callback()
                  }
                }]
              })}
            />
          </FormItem>
        </Col>
        <Col span={6} offset={12}>
          <Button disabled={!isEdit} type={'ghost'} onClick={() => this.removeItem(item)}>删除</Button>
        </Col>
      </Row>
    })
  }

  renderBtns = () => {
    const { isEdit, confirmLoading } = this.state
    if (isEdit) {
      return [
        <Button key={'cancel'} type={'ghost'} onClick={this.cancelEdit} size={'large'}>取消</Button>,
        <Button
          key={'save'} type={'primary'} onClick={this.confirmEdit} size={'large'}
          loading={confirmLoading}
        >
          保存
        </Button>
      ]
    }

    return <Button
      type="primary" size="large"
      onClick={() => this.editHandle(true)}
    >
      编辑
    </Button>
  }

  removeItem = key => {
    const { getFieldValue, setFieldsValue } = this.props.form
    const keys = getFieldValue('keys')
    const keysSet = new Set(keys)
    keysSet.delete(key)
    setFieldsValue({
      keys: [...keysSet],
    })
  }

  addItem = () => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue, validateFields } = form
    const keys = getFieldValue('keys')
    validateFields((errors) => {
      if (!!errors) {
        return
      }
      setFieldsValue({
        keys: keys.concat(++ uidd)
      })
    })
  }

  cancelEdit = () => {
    this.initFields()
    this.editHandle(false)
  }

  confirmEdit = async () => {
    const { form, updateLBWhiteList, clusterID, name, getLBDetail, location, lbDetail } = this.props
    form.validateFields(async (errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        confirmLoading: true,
      })
      const { keys } = values
      let whiteList = []
      keys.forEach(key => {
        const ip = values[`ip-${key}`]
        whiteList.push(ip)
      })
      const { displayName } = location.query
      const { agentType } = getDeepValue(lbDetail.deployment, ['metadata', 'labels'])
      whiteList = whiteList.join(',')
      const result = await updateLBWhiteList(clusterID, name, { whiteList }, displayName, agentType)
      if (result.error) {
        this.setState({
          confirmLoading: false,
        })
        return notify.warn('编辑失败')
      }
      getLBDetail(clusterID, name, displayName)
      notify.success('编辑成功')
      this.setState({
        confirmLoading: false,
        isEdit: false,
      })
    })
  }

  editHandle = isEdit => {
    this.setState({
      isEdit,
    })
  }

  render() {
    const { isEdit } = this.state
    const { form } = this.props
    form.getFieldProps('keys', {
      initialValue: [],
    })

    return (
      <TenxPage inner className="lb-white-list">
        <div className="layout-content-btns">
          {this.renderBtns()}
        </div>
        {this.renderTableHeader()}
        {this.renderWhiteList()}
        {
          isEdit && <Button
            type="ghost"
            className="bundleBtn"
            icon={'plus'}
            onClick={this.addItem}
          >
            添加白名单
          </Button>
        }
      </TenxPage>
    )
  }
}

export default Form.create()(WhitelistTable)
