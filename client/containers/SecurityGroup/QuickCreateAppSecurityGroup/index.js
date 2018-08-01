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
import { browserHistory } from 'react-router'

const notification = new Notification()
const FormItem = Form.Item
const Option = Select.Option
const Panel = Collapse.Panel

class SecyrityCollapse extends React.Component {

  state={
    show: false,
  }
  componentDidMount() {
    const { getSecurityGroupList, cluster } = this.props
    getSecurityGroupList(cluster, {
      failed: {
        func: error => {
          const { message } = error
          notification.close()
          notification.warn('获取列表数据出错', message.message)
        },
      },
    })
  }

  handleColl = val => {
    val.length && this.setState({
      show: true,
    })
  }

  render() {
    const { formItemLayout, form, listData } = this.props
    const { getFieldProps } = form
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="securityHeader">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="securityLeft">
            <div className="line"></div>
            <span className="title" style={{ paddingLeft: 8 }}>安全组</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="securityRight">
            <div className="desc">安全组 prompt </div>
          </Col>
        </Row>
      </div>
    )
    return <div id="securityGroup" key="securityGroup">
      <Collapse onChange={this.handleColl}>
        <Panel header={header}>
          <Row className="securityLine">
            <Col span={4}></Col>
            <Col span={20} className="lineRight">
              <Button
                type="ghost"
                onClick={this.loadData}>
                <i className="fa fa-refresh"/>
                刷新
              </Button>
              <Button type="primary" onClick={() => browserHistory.push('/app_manage/security_group/create')}>
                新建安全组
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={4}></Col>
            <Col span={10}>
              {
                this.state.show ?
                  <FormItem className="antdItem">
                    <Select
                      multiple
                      size="large"
                      placeholder="选择安全组"
                      {...getFieldProps('securityGroup', {
                        rules: [{
                          required: true,
                          message: '请选择安全组',
                        }],
                      }
                      )}
                    >
                      {
                        listData.map(item => {
                          return <Option value={item.metaName}>{item.name}</Option>
                        })
                      }
                    </Select>
                  </FormItem>
                  : null
              }
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
    name: item.metadata.annotations['policy-name'],
    metaName: item.metadata.name,
  }))
  return {
    cluster: current.cluster.clusterID,
    listData,
  }
}

export default connect(mapStateToProps, {
  getSecurityGroupList: securityActions.getSecurityGroupList,
})(SecyrityCollapse)
