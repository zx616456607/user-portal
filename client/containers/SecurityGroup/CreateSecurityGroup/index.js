/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Create SecurityGroup
 *
 * v0.1 - 2018-07-23
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Form, Row, Col, Button } from 'antd'
import './style/index.less'
import CreateNameAndTarget from './components/NameAndTarget'
import IngressAndEgressWhiteList from './components/IngressAndEgressWhiteList'
import { browserHistory } from 'react-router'
import Notification from '../../../../src/components/Notification'
import * as securityActions from '../../../../src/actions/services'

const notifi = new Notification()

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
  colon: false,
}

class CreateSecurityGroup extends React.Component {

  state={
    isCreate: true,
  }

  componentDidMount() {
    const { loadAllServices, cluster, location } = this.props
    const { pathname } = location
    if (pathname !== '/app_manage/security_group/create') {
      this.setState({
        isCreate: false,
      })
    }
    loadAllServices(cluster, {}, {
      failed: {
        func: err => {
          notifi.warn('获取服务列表失败', err.message)
        },
      },
    })
  }

  submit = () => {
    const { form } = this.props
    form.validateFields(errors => {
      // console.log( '////', values )
      if (errors) {
        return
      }
    })
  }
  render() {
    const { form, serverList } = this.props
    const { isCreate } = this.state
    return <QueueAnim className="createSecurityGroup">
      <div className="createSecurityPage" key="security">
        {
          isCreate ?
            <div className="securityGroudHeader">
              <span className="returnBtn">
                <span className="btnLeft"></span>
                <span className="btnRight" onClick={() => browserHistory.goBack()}>返回</span>
              </span>
              <span className="headerTitle">
                <span className="headerLeft"></span>
                <span>创建安全组</span>
              </span>
            </div>
            : null
        }
        <div className="securityGroudContent">
          <CreateNameAndTarget
            form={form}
            isCreate={isCreate}
            formItemLayout={formItemLayout}
            serverList={serverList}
          />
          <p className="whiteList">隔离对象的访问白名单</p>
          <IngressAndEgressWhiteList
            form={form}
            isCreate={isCreate}
          />
          <Row className="submitBtn">
            <Col span={4}></Col>
            <Col span={20}>
              <Button onClick={() => browserHistory.goBack()} style={{ marginRight: 8 }}>取消</Button>
              <Button type="primary" onClick={this.submit}>{ isCreate ? '确定' : '保存' }</Button>
            </Col>
          </Row>
        </div>
      </div>
    </QueueAnim>
  }
}
const mapStateToProps = ({ entities: { current }, services: { serviceList: { services } } }) => {
  const serverList = []
  services && services.length > 0 && services.map(item => serverList.push(item.metadata.name))
  return {
    cluster: current.cluster.clusterID,
    serverList,
  }
}
export default connect(mapStateToProps, {
  loadAllServices: securityActions.loadAllServices,
})(Form.create()(CreateSecurityGroup))
