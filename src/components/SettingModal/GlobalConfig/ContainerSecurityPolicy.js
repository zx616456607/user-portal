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
import { Table, Modal,  Row, Col, Button } from 'antd'
import './style/ContainerSecurityPolicy.less'
import {toQuerystring} from '../../../../src/common/tools'
import { browserHistory } from 'react-router'

const getColumns = (self) =>  {
  const columns = [{
    title: '策略名称',
    dataIndex: 'policy',
    key: 'policy',
    width: 300
  }, {
    title: '注释',
    dataIndex: 'annotation',
    key: 'annotation',
    width: 300
  }, {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 300,
    render: () => {
      const query = toQuerystring({edit: true, type: 'containerSecurityPolicy', name: 'null' })
      return (
        <div className="buttons">
        <Button type="primary" onClick={() => browserHistory.push(`/app-stack/createWorkLoad/?${query}`)}>
          查看/编辑Yaml
        </Button>
        <Button className="delete" onClick={self.showDelete}>删除</Button>
        </div>
      )
    }
  }];
  return columns
}

const dataSource = [{
  key: '1',
  policy: 'hehe',
  annotation: 32,
}, {
  key: '2',
  policy: 'hehe',
  annotation: 32,
}];

export default class ContainerSecurityPolicy extends React.Component {
  state={
    showDelete: false
  }
  delete = () => {
  }
  showDelete = () => {
    this.setState({ showDelete: true})
  }
  render() {
    const self = this
    return(
      <div className="containerSecurityPolicy">
        <div className='title'>容器安全策略</div>
        <div className="content">
        <Row>
          <Col span={4}>
            <img></img>
          </Col>
          <Col span={20}>
            <Button icon="plus" type="primary"
            onClick={ () => browserHistory.push(`/app-stack/createWorkLoad/`) }
            >
              添加 PSP 策略
            </Button>
            <Table className="Table" columns={getColumns(self)} dataSource={dataSource} pagination={false}/>
        </Col>
        </Row>
        <Modal title="确认删除"
          visible={this.state.showDelete}
          onOk={() => {}}
          confirmLoading={true}
          onCancel={() => { this.setState({ showDelete: false }) }}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
            确认要删除?
          </div>
        </Modal>
        </div>
      </div>
    )
  }
}