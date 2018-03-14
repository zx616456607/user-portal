/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * App template list
 *
 * 2018-03-14
 * @author Zhangxuan
 */

import * as React from 'react';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { browserHistory } from 'react-router';
import { Table, Button, Icon, Pagination, Dropdown, Menu, Modal } from 'antd';
import SearchInput from '../../../components/SearchInput';
import Title from '../../../../src/components/Title';
import { formatDate } from '../../../../src/common/tools';
import ReleaseModal from './ReleaseModal';
import './style/index.less';

class TemplateList extends React.Component<any> {

  state = {
  };

  createTemplate = () => {
    browserHistory.push('/app_center/template/create');
  }

  handleDeploy = () => {

  }

  handleMenuClick = (e, record) => {
    switch (e.key) {
      case 'edit':
        break;
      case 'release':
        this.setState({
          releaseVisible: true,
          selectedTemp: record,
        });
        break;
      case 'delete':
        this.setState({
          deleteVisible: true,
          selectedTemp: record,
        });
        break;
      default:
        break;
    }
  }

  tableChange = (pagination, _, sorter) => {
    this.setState({
      sortedInfo: sorter,
    });
  }

  tableRowClick = (record, index) => {
    const { selectedRowKeys } = this.state;
    const keysSet = new Set(selectedRowKeys);
    if (keysSet.has(record.name)) {
      keysSet.delete(record.name);
    } else {
      keysSet.add(record.name);
    }
    this.setState({
      selectedRowKeys: Array.from(keysSet),
    });
  }

  cancelDelModal = () => {
    this.setState({
      deleteVisible: false,
    });
  }

  confirmDelModal = () => {
    this.setState({
      deleteVisible: false,
    });
  }

  cancelRelease = () => {
    this.setState({
      releaseVisible: false,
    });
  }

  render() {
    let { sortedInfo, selectedRowKeys, deleteVisible, releaseVisible } = this.state;
    sortedInfo = sortedInfo || {};
    const columns = [
      { title: '模板名称', dataIndex: 'name' },
      { title: '模板版本', dataIndex: 'version' },
      { title: '服务数量', dataIndex: 'count' },
      {
        title: '创建时间',
        dataIndex: 'updateTime',
        sorter: (a, b) => a.updateTime - b.updateTime,
        sortOrder: sortedInfo.columnKey === 'updateTime' && sortedInfo.order,
      },
      {
        title: '操作',
        render: (_, record) => {
          const menu = (
            <Menu onClick={e => this.handleMenuClick(e, record)} style={{ width: 100 }}>
              <Menu.Item key="edit">修改</Menu.Item>
              <Menu.Item key="release">发布</Menu.Item>
              <Menu.Item key="delete">删除</Menu.Item>
            </Menu>
          );
          return (
            <Dropdown.Button onClick={this.handleDeploy} overlay={menu} type="ghost">
              <Icon type="appstore-o" /> 部署
            </Dropdown.Button>
          );
        },
      },
    ];
    const data = [];
    for (let i = 0; i < 3; i ++) {
      data.push({
        name: `模板${i}`,
        version: `version${i}`,
        count: `1${i}`,
        updateTime: formatDate(new Date(new Date().setDate(new Date().getDate() - i))),
      });
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: selectedKeys => this.setState({ selectedRowKeys: selectedKeys }),
    };
    return (
      <QueueAnim className="templateList layout-content">
        <Title title="应用模板"/>
        <div className="layout-content-btns" key="btns">
          <Button type="primary" size="large" onClick={this.createTemplate}><i className="fa fa-plus" /> 创建模板</Button>
          <Button type="ghost" size="large"><Icon type="appstore-o" /> 部署</Button>
          <Button type="ghost" size="large"><i className="fa fa-refresh"/> 刷新</Button>
          <Button type="ghost" size="large"><Icon type="delete" /> 删除</Button>
          <SearchInput
            size="large"
            placeholder="请输入模板名称搜索"
            style={{ width: 200 }}
          />
          <div className="page-box">
            <span className="total">共 4 条</span>
            <Pagination simple/>
          </div>
        </div>
        <Table
          className="templateTable reset_antd_table_header"
          key="templateTable"
          columns={columns}
          pagination={false}
          dataSource={data}
          onChange={this.tableChange}
          rowSelection={rowSelection}
          onRowClick={this.tableRowClick}
          rowKey={record => record.name}
        />
        <Modal
          title="删除应用模板"
          visible={deleteVisible}
          onCancel={this.cancelDelModal}
          onOk={this.confirmDelModal}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
            删除模板后，基于此模板创建的应用不受影响，但删除后无法恢复，是否确定删除？
          </div>
        </Modal>
        <ReleaseModal
          visible={releaseVisible}
          closeModal={this.cancelRelease}
        />
      </QueueAnim>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

export default connect(mapStateToProps, {

})(TemplateList);
