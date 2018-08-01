/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Ingress White List
 *
 * v0.1 - 2018-07-23
 * @author lvjunfeng
 */

import React from 'react'
import { Row, Col } from 'antd'
import './style/index.less'
import AddWhiteList from '../AddWhiteList'

export default class IngressWhiteList extends React.Component {
  render() {
    const { form, isEdit, ingLn, egLn } = this.props
    return <div className="whiteListPage">
      <Row className="ingress">
        <Col span={4} className="firstCol">ingress 来源白名单</Col>
        <Col span={20} className="ingressTit">
          无论项目是否设置了『项目内或项目间』隔离，隔离对象接受 ingress 白名单的对象访问
        </Col>
      </Row>
      {
        !isEdit || !ingLn ?
          <AddWhiteList
            type="ingress"
            form={form}
          /> : null
      }
      {
        isEdit && ingLn ?
          <AddWhiteList
            type="ingress"
            form={form}
            ln={ingLn}
          /> : null
      }
      <div className="egressBorder"></div>
      <Row className="ingress">
        <Col span={4} className="firstCol"> &nbsp;&nbsp;egress 目标白名单</Col>
        <Col span={20} className="ingressTit">
          无论项目是否设置了『项目内或项目间』隔离，隔离对象访问 egress 白名单的对象
        </Col>
      </Row>
      {
        !isEdit || !egLn ?
          <AddWhiteList
            type="egress"
            form={form}
          /> : null
      }
      {
        isEdit && egLn ?
          <AddWhiteList
            type="egress"
            form={form}
            ln={egLn}
          /> : null
      }
    </div>
  }
}
