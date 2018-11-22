/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * ContainerSecurityPolicy.js page
 *
 * @author zhangtao
 * @date Tuesday November 6th 2018
 */
import * as React from 'react'
import { Table, Modal,  Row, Col, Button, Card, Popover, notification, Icon, Tooltip } from 'antd'
import './style/ContainerSecurityPolicy.less'
import {toQuerystring} from '../../../src/common/tools'
import { browserHistory } from 'react-router'
import shieldsrc from '../../../static/img/container/shield.png'
import * as PSP from '../../actions/container_security_policy'
import { connect } from 'react-redux'

// 用于过滤非用户填写的 annotations
const userAReg = /^users\/annotations$/
const getColumns = (self) =>  {
  const cluster = self.props.cluster.clusterID
  const columns = [{
    title: '策略名称',
    dataIndex: 'policy',
    key: 'policy',
    width: 300
  }, {
    title: <span>
            <span style={{ padding: '0 8px' }}>注释</span>
            <Tooltip title={'注释只需在 annotations 中添加 users/annotations 字段即可'}>
            <Icon type="question-circle-o" />
            </Tooltip>
          </span>,
    dataIndex: 'annotation',
    key: 'annotation',
    width: 300,
    render: (annotation = []) => {
      const userAnnotation =  Object.entries(annotation)
      .filter(([key]) => userAReg.test(key))
      if (userAnnotation.length === 0) return <span>-</span>
      return  <Popover
        content={
          <div>
            {
              userAnnotation
              .map(([key, value]) => <div>
                <span>{JSON.stringify(value)}</span>
              </div>)
            }
          </div>
        }>
      <span className="annotation">查看注释</span>
    </Popover>
    }
  }, {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 300,
    render: (_, record) => {
      const query = toQuerystring({edit: true, type: 'PodSecurityPolicy', name: record.policy, cluster })
      return (
        <div className="buttons">
        <Button type="primary" onClick={() =>
          {
            window.location.hash = `${cluster}/cluster_set`
            browserHistory.push(`/cluster/createWorkLoad/?${query}`)}
          }>
          查看/编辑Yaml
        </Button>
        <Button className="delete" onClick={() => self.showDelete(record.policy)}>删除</Button>
        </div>
      )
    }
  }];
  return columns
}

class ContainerSecurityPolicy extends React.Component {
  state={
    showDelete: false,
    dataList: undefined,
    willDeleteName: undefined,
    loading: false,
  }
  async componentDidMount() {
    await this.reload()
    browserHistory.replace(window.location.href.split("#")[0])
  }
  reload = async () => {
    const res = await this.props.listPSP(this.props.cluster.clusterID, )
    const { result: { data = [] } = {} } = res.response
    const dataList = data.map(({ metadata: { name, annotations } = {} }) =>
     ({ policy: name, annotation: annotations }))
    this.setState({ dataList })
  }
  delete = async () => {
    if (this.state.willDeleteName !== undefined) {
      this.setState({ loading: true })
      await this.props.deletePSP(this.props.cluster.clusterID, this.state.willDeleteName)
    }
    notification.success({ message: '删除成功'})
    this.setState({ loading: false, showDelete: false })
    this.reload()
  }
  showDelete = (name) => {
    this.setState({ showDelete: true, willDeleteName: name})
  }
  render() {
    const self = this
    const cluster = this.props.cluster.clusterID
    return(
      <div className="containerSecurityPolicy">
      <Card title={<div className='title'>容器安全策略</div>}>
        <div className="content">
        <Row>
          <Col span={4}>
            <img src={shieldsrc}/>
          </Col>
          <Col span={20}>
            <Button icon="plus" type="primary"
            onClick={ () => {
              window.location.hash = `${this.props.cluster.clusterID}/cluster_set`
              browserHistory.push(`/cluster/createWorkLoad/?cluster=${cluster}&type=PodSecurityPolicy`) }
             }
            >
              添加 PSP 策略
            </Button>
            <Table className="Table"
              columns={getColumns(self)}
              dataSource={this.state.dataList}
              pagination={false}
              loading={this.state.dataList === undefined}
              />
        </Col>
        </Row>
        <Modal title="确认删除"
          visible={this.state.showDelete}
          onOk={this.delete}
          confirmLoading={this.state.loading}
          onCancel={() => { this.setState({ showDelete: false }) }}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
            确认要删除这一条PSP?
          </div>
        </Modal>
        </div>
      </Card>
      </div>
    )
  }
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, {
  listPSP: PSP.listPSP,
  deletePSP: PSP.deletePSP
})(ContainerSecurityPolicy)