/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Isolated object
 *
 * v0.1 - 2018-07-25
 * @author lvjunfeng
 */

import React from 'react'
import './style/index.less'
import { connect } from 'react-redux'
import { Collapse, Row, Col, Form, Select, Button } from 'antd'
import * as securityActions from '../../../actions/securityGroup'
import Notification from '../../../../src/components/Notification'
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../src/containers/Application/ServiceConfigIntl'

const notification = new Notification()
const FormItem = Form.Item
const Option = Select.Option
const Panel = Collapse.Panel

class SecyrityCollapse extends React.Component {

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    const { getSecurityGroupList, cluster, intl } = this.props
    getSecurityGroupList(cluster, {
      failed: {
        func: error => {
          const { message, statusCode } = error
          notification.close()
          if (statusCode !== 403) {
            notification.warn(intl.formatMessage(IntlMessage.loadDataFailed), message.message)
          }
        },
      },
    })
  }

  render() {
    const { formItemLayout, form, listData, intl } = this.props
    const { getFieldProps } = form
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="securityHeader">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="securityLeft">
            <div className="line"></div>
            <span className="title" style={{ paddingLeft: 8 }}>{intl.formatMessage(IntlMessage.securityGroup)}</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="securityRight">
            <div className="desc">{intl.formatMessage(IntlMessage.securityGroupTip)}</div>
          </Col>
        </Row>
      </div>
    )
    return <div id="securityGroupModule" key="securityGroup">
      <Collapse onChange={this.handleColl}>
        <Panel header={header}>
          <Row className="securityLine">
            <Col span={4}></Col>
            <Col span={20} className="lineRight">
              <Button
                type="ghost"
                size="large"
                onClick={this.loadData}>
                <i className="fa fa-refresh"/>
                {intl.formatMessage(IntlMessage.refresh)}
              </Button>
              <a
                href="/app_manage/security_group/create"
                target="_blank"
                rel="noopener noreferrer"
                className="ant-btn ant-btn-primary ant-btn-lg"
              >
                {intl.formatMessage(IntlMessage.createSecurityGroup)}
              </a>
            </Col>
          </Row>
          <Row>
            <Col span={4}></Col>
            <Col span={10}>
              <FormItem className="antdItem">
                <Select
                  multiple
                  size="large"
                  placeholder={intl.formatMessage(IntlMessage.pleaseSelect, {
                    item: intl.formatMessage(IntlMessage.securityGroup),
                  })}
                  {...getFieldProps('securityGroup')}
                >
                  {
                    listData.map(item => {
                      return <Option value={item.metaName}>{item.name}</Option>
                    })
                  }
                </Select>
              </FormItem>
            </Col>
          </Row>
        </Panel>
      </Collapse>
    </div>
  }
}

const mapStateToProps = ({
  entities: { current },
  securityGroup: { getSecurityGroupList: { data } },
}) => {
  const listData = []
  data && data.map(item => listData.push({
    name: item.metadata && item.metadata.annotations['policy-name'],
    metaName: item.metadata.name,
  }))
  return {
    cluster: current.cluster.clusterID,
    listData,
  }
}

export default connect(mapStateToProps, {
  getSecurityGroupList: securityActions.getSecurityGroupList,
})(injectIntl(SecyrityCollapse, {
  withRef: true,
}))
