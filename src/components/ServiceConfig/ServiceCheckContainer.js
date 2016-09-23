/**
 *
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/23
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import {Button,Icon,Table } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

let RendContainerName = React.createClass({
  render: function () {
    return (
      <span>
        <i className="fa fa-tasks" style={{marginRight: "5px"}}></i>
        容器名称
      </span>
    )
  }
})
let RendPoint = React.createClass({
  render: function () {
    return (
      <span>
        <Icon type="link" style={{marginRight: "5px"}}/>
        挂载点
      </span>
    )
  }
})

const containerCol = [
  {
    title: (<RendContainerName/>),
    dataIndex: 'name',
  },
  {
    title: (<RendPoint/>),
    dataIndex: 'point',
  },

];

const containerData = [];
for (let i = 0; i < 46; i++) {
  containerData.push({
    key: i,
    name: `my_container${i}`,
    point: `var/log/test/${i}log`,
  });
}

class CheckContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedContainers: [],  // 这里配置默认勾选列
      loading: false,
    }
  }
  start() {
    this.setState({ loading: true });
    // 模拟 ajax 请求，完成后清空
    setTimeout(() => {
      this.setState({
        selectedContainers: [],
        loading: false,
      });
    }, 1000);
  }
  onSelectChange(selectedContainers) {
    console.log('selectedContainers changed: ', selectedContainers);
    this.setState({ selectedContainers });
  }
  render () {
    const { loading, selectedContainers } = this.state;
    const containerSelection = {
      selectedContainers,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedContainers.length > 0;
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>{ `关联容器 ( ${containerData.length} )` }</span>
          <Button type="primary" onClick={this.start}
                  disabled={!hasSelected} loading={loading}
          >操作</Button>
          <span style={{ marginLeft: 8 }}>{ hasSelected ? `选择了 ${selectedContainers.length} 个容器` : '' }</span>
        </div>
        <Table rowSelection={containerSelection} columns={containerCol} dataSource={containerData} pagination={{ pageSize: 5 }}/>
      </div>
    )
  }
}

CheckContainer.propTypes = {
  intl: PropTypes.object.isRequired
}

export default injectIntl(CheckContainer, {
  withRef: true,
})

