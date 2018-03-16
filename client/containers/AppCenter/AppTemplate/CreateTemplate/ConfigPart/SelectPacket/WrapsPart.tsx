/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Pkgs Table
 *
 * 2018-03-09
 * @author Zhangxuan
 */

import * as React from 'react';
import { Input } from 'antd';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Button, Radio, Table } from 'antd';
import CommonSearchInput from '../../../../../../components/SearchInput';
import { DEFAULT_PAGE_SIZE } from '../../../../../../../constants';
import { formatDate } from '../../../../../../../src/common/tools';
import * as appCenterActions from '../../../../../../../src/actions/app_center';
import './style/WrapsPart.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const TRID_TYPE = 'trid';
const STORE_TYPE = 'store';

interface IState {
  currentType: string;
}

interface IQuery {
  current: number;
  value: string;
}
class WrapsPart extends React.Component<any, IState> {

  state = {
    currentType: TRID_TYPE,
  };

  getStoreList = (query: IQuery) => {
    const { getWrapStoreList } = this.props;
    const current = query && query.current || this.state.page;
    const newQuery = {
      from: (current - 1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE,
    };
    if (query && query.value) {
      Object.assign(newQuery, { file_name: query.value });
    }
    getWrapStoreList(newQuery);
  }

  getWrapList = (query: IQuery) => {
    const current = query && query.current || this.state.page;
    this.setState({ page: current });
    const newQuery = {
      from: (current - 1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE,
    };
    if (query && query.value) {
      Object.assign(newQuery, { filter: `fileName contains ${query.value}` });
    }
    this.props.wrapManageList(newQuery);
  }

  changeType = e => {
    const type = e.target.value;
    this.setState({
      currentType: type,
      selectedRowKeys: [],
      id: [],
      defaultTemplate: null, // not selected
      version: 'none', // not selected
      fileType: 'none', // not selected
    });
    switch (type) {
      case TRID_TYPE:
        this.getWrapList();
        break;
      case STORE_TYPE:
        this.getStoreList();
        break;
      default:
        break;
    }
  }

  searchData = () => {
    const { currentType, searchValue } = this.state;
    switch (currentType) {
      case TRID_TYPE:
        return this.getWrapList({ value: searchValue });
      case STORE_TYPE:
        return this.getStoreList({ value: searchValue });
      default:
        return;
    }
  }

  addWrap = record => {
    const { stepChange } = this.props;
    stepChange(1);
  }

  renderTable = () => {
    const { currentType } = this.state;
    const { wrapList, wrapStoreList } = this.props;
    let isFetching: boolean;
    let dataSource: { isFetching: boolean,  pkgs: Array };
    if (currentType === TRID_TYPE) {
      dataSource = wrapList;
      isFetching = wrapList.isFetching;
    } else {
      dataSource = wrapStoreList;
      isFetching = wrapStoreList.isFetching;
    }
    const columns = [
      {
        title: '包名称',
        dataIndex: 'fileName',
        width: '20%',
      },
      {
        title: '版本标签',
        dataIndex: 'fileTag',
        width: '20%',
      },
      {
        title: '包类型',
        dataIndex: 'fileType',
        width: '20%',
      },
      {
        'title': '上传时间',
        dataIndex: 'creationTime',
        width: '20%',
        render: text => formatDate(text),
      },
      {
        title: '操作',
        width: '20%',
        render: (_, record) => <Button type="primary" onClick={() => this.addWrap(record)}>添加</Button>,
      },
    ];
    const paginationOpts = {
      simple: true,
      pageSize: DEFAULT_PAGE_SIZE,
      current: this.state.page || 1,
      total: dataSource && dataSource.total,
      onChange: current => currentType === TRID_TYPE ? this.getWrapList({ current }) : this.getStoreList({ current }),
    };
    return (
      <Table
        className="wrapTable reset_antd_table_header"
        loading={isFetching}
        dataSource={dataSource && dataSource.pkgs}
        columns={columns}
        pagination={paginationOpts}
      />
    );
  }
  render() {
    const { currentType, searchValue } = this.state;
    const { wrapList, wrapStoreList } = this.props;
    let total: number = currentType === TRID_TYPE ? wrapList.total : wrapStoreList.total;
    return(
      <div className="wrapPart layout-content">
        <div className="wrapHeader layout-content-btns">
          <span>选择应用包</span>
          <span >
            <RadioGroup onChange={this.changeType} size="large" value={currentType}>
              <RadioButton value={TRID_TYPE}>应用包</RadioButton>
              <RadioButton value={STORE_TYPE}>应用包商店</RadioButton>
            </RadioGroup>
          </span>
          <span >
            <CommonSearchInput
              value={searchValue}
              onChange={value => this.setState({ searchValue: value })}
              placeholder="请输入包名称或者标签搜索"
              size="large"
              style={{ width: 200 }}
              onSearch={this.searchData}
            />
          </span>
          <Button
            type="primary"
            size="large"
            onClick={() => browserHistory.push('/app_center/wrap_manage')}
          >
            去上传部署包
          </Button>
          <div className="page-box pageBox">
            <span className="total">共 {total} 条</span>
          </div>
        </div>
        {this.renderTable()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { wrapList, wrapStoreList } = state.images;
  const { result: storeList } = wrapStoreList || { result: {} };
  const { data: storeData } = storeList || { data: [] };
  const list = wrapList || {};
  let datalist = { pkgs: [], total: 0 };
  if (list.result) {
    datalist = list.result.data;
  }
  return {
    wrapList: datalist,
    wrapStoreList: storeData,
  };
};

export default connect(mapStateToProps, {
  wrapManageList: appCenterActions.wrapManageList,
  getWrapStoreList: appCenterActions.getWrapStoreList,
  getImageTempate: appCenterActions.getImageTempate,
})(WrapsPart);
