/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance config base info
 *
 * v0.1 - 2018-01-15
 * @author zhangxuan
 */

import React from 'react'
import { browserHistory } from 'react-router'
import { Card, Icon, Input, Form, Tooltip, Row, Col } from 'antd'
import { formatDate, cpuFormat, memoryFormat } from "../../../common/tools"
import Notification from '../../Notification'
import './style/BaseInfo.less'
import loadBalanceIcon from '../../../assets/img/appmanage/loadBalance.png'
import {lbNameCheck} from "../../../common/naming_validation";
import { getDeepValue } from "../../../../client/util/util";

const FormItem = Form.Item

const notify = new Notification()

class BaseInfo extends React.Component {
  state = {

  }

  editLoadBalance = async body => {
    const { editLB, clusterID, lbDetail, getLBDetail } = this.props
    const { name } = lbDetail.deployment.metadata
    let { displayName, description, usegzip } = lbDetail.deployment.metadata.annotations
    const { agentType } = lbDetail.deployment.metadata.labels
    const newBody = Object.assign({}, { displayName, description, usegzip }, body)
    const editRes = await editLB(clusterID, name, displayName, agentType, newBody)
    if (editRes.error) {
      notify.warn('修改失败', editRes.error.message.message || editRes.error.message)
      notify.close()
      return false
    }
    // 修改 displayName 应该使用新的 displayName
    displayName = newBody.displayName
    const detailRes = await getLBDetail(clusterID, name, displayName)
    if (detailRes.error) {
      notify.warn('获取详情失败', detailRes.error.message.message || detailRes.error.message)
      notify.close()
      return false
    }
    return true
  }

  nameCheck = (rule, value, callback) => {
    let message = lbNameCheck(value)
    if (message !== 'success') {
      return callback(message)
    }
    callback()
  }

  editName = () => {
    this.setState({
      nameEdit: true
    })
  }

  cancelEditName = () => {
    this.setState({
      nameEdit: false
    })
  }

  saveName = async () => {
    const { form, location } = this.props
    const { getFieldValue } = form
    const { query, pathname } = location
    const { name } = query
    const displayName = getFieldValue('name')
    notify.spin('名称修改中')
    const res = await this.editLoadBalance({ displayName })
    if (!res) {
      notify.close()
      return
    }
    browserHistory.replace(`${pathname}?name=${name}&displayName=${displayName}`)
    notify.close()
    notify.success('名称修改成功')
    this.setState({
      nameEdit: false
    })
  }

  editDesc = () => {
    this.setState({
      descEdit: true
    })
  }

  cancelEditDesc = () => {
    this.setState({
      descEdit: false
    })
  }

  saveDesc = async () => {
    const { form } = this.props
    const { getFieldValue } = form
    const description = getFieldValue('description')
    notify.spin('备注修改中')
    const res = await this.editLoadBalance({ description })
    if (!res) {
      notify.close()
      return
    }
    notify.close()
    notify.success('备注修改成功')
    this.setState({
      descEdit: false
    })
  }

  render() {
    const { nameEdit, descEdit } = this.state
    const { form, lbDetail } = this.props
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const { deployment } = lbDetail || { deployment: {} }
    const nameProps = getFieldProps('name', {
      rules: [{
        validator: this.nameCheck
      }],
      initialValue: deployment && deployment.metadata &&
      deployment.metadata.annotations && deployment.metadata.annotations.displayName
    })

    const descProps = getFieldProps('description', {
      initialValue: deployment && deployment.metadata &&
      deployment.metadata.annotations && deployment.metadata.annotations.description
    })
    return (
      <Card className="baseInfo">
        <img className="balanceIcon" src={loadBalanceIcon} />
        <div className="baseInfoRightPart">
          <div className="balanceNameBox">
            <span className="nameLabel">
              名称：
            </span>
            <div className="balanceName">
              {deployment && deployment.metadata && deployment.metadata.labels && deployment.metadata.labels.ingressLb}
            </div>
          </div>
          <Row style={{ marginBottom: 15 }}>
            <Col span={10} className="displayNameBox">
              <span className="nameLabel">备注名：</span>
              <div className="displayName">
                {
                  nameEdit ?
                    <FormItem
                      hasFeedback
                      help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                      style={{ width: 170 }}
                    >
                      <Input {...nameProps}/>
                    </FormItem>
                    :
                    <span>{deployment && deployment.metadata && deployment.metadata.annotations.displayName}</span>
                }
                {
                  nameEdit ?
                    [
                      <Tooltip title="取消">
                        <i key="cancelName" className="cancel anticon anticon-minus-circle-o pointer" onClick={this.cancelEditName} />
                      </Tooltip>,
                      <Tooltip title="保存">
                        <i key="saveName" className="confirm anticon anticon-save pointer" onClick={this.saveName} />
                      </Tooltip>
                    ] :
                    <Tooltip title="编辑">
                      <i key="editName" className="edit anticon anticon-edit pointer" onClick={this.editName} />
                    </Tooltip>
                }
              </div>
            </Col>
            <Col span={14}>
              创建时间：{formatDate(deployment && deployment.metadata && deployment.metadata.creationTimestamp)}
            </Col>
          </Row>
          <Row style={{ marginBottom: 15 }}>
            <Col span={10}>
              地址IP：<span className="successColor">
              {getDeepValue(deployment, ['metadata', 'annotations', 'podIP'])}
              </span>
            </Col>
            <Col span={14}>
              配置：
              {cpuFormat(
                deployment &&
                deployment.spec &&
                deployment.spec.template &&
                deployment.spec.template.spec &&
                deployment.spec.template.spec.containers[0] &&
                deployment.spec.template.spec.containers[0].resources &&
                deployment.spec.template.spec.containers[0].resources.requests &&
                deployment.spec.template.spec.containers[0].resources.requests.memory,
                deployment &&
                deployment.spec &&
                deployment.spec.template &&
                deployment.spec.template.spec &&
                deployment.spec.template.spec.containers[0] &&
                deployment.spec.template.spec.containers[0].resources)}
              &nbsp;&nbsp;&nbsp;
              {
                memoryFormat(
                  deployment &&
                  deployment.spec &&
                  deployment.spec.template &&
                  deployment.spec.template.spec &&
                  deployment.spec.template.spec.containers[0] &&
                  deployment.spec.template.spec.containers[0].resources
                )
              } 内存
            </Col>
          </Row>
          <Row>
            <Col span={10}>
              代理类型：
              {getDeepValue(deployment, ['metadata', 'labels', 'agentType']) === 'outside' ? '集群外' : '集群内'}
            </Col>
            <Col span={14} className="balanceDescBox">
              <span className="nameLabel">
                备注：
              </span>
              <div className="balanceDesc">
                {
                  descEdit ?
                    <FormItem>
                      <Input type="textarea" {...descProps} style={{ width: 250 }}/>
                    </FormItem>
                    :
                    <span>{deployment && deployment.metadata && deployment.metadata.annotations && deployment.metadata.annotations.description}</span>
                }
                {
                  descEdit ?
                    [
                      <Tooltip title="取消">
                        <i key="cancelDesc" className="cancel anticon anticon-minus-circle-o pointer" onClick={this.cancelEditDesc} />
                      </Tooltip>,
                      <Tooltip title="保存">
                        <i key="saveDesc" className="confirm anticon anticon-save pointer" onClick={this.saveDesc} />
                      </Tooltip>
                    ] :
                    <Tooltip title="编辑">
                      <i key="editDesc" className="edit anticon anticon-edit pointer" onClick={this.editDesc} />
                    </Tooltip>
                }
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    )
  }
}

export default Form.create()(BaseInfo)
