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
import { Button, Radio, Table, Pagination } from 'antd';
import CommonSearchInput from '../../../../../../components/SearchInput';
import { DEFAULT_PAGE_SIZE } from '../../../../../../../constants';
import { DEFAULT_REGISTRY } from '../../../../../../../src/constants';
import { formatDate } from '../../../../../../../src/common/tools';
import * as appCenterActions from '../../../../../../../src/actions/app_center';
import isEmpty from 'lodash/isEmpty';
import './style/WrapsPart.less';
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../../../../../src/containers/Application/intl'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const TRID_TYPE = 'trid';
const STORE_TYPE = 'store';

interface IState {
  currentType: string;
  page: number;
}

interface IQuery {
  current: number;
  value: string;
}
class WrapsPart extends React.Component<any, IState> {

  state = {
    currentType: TRID_TYPE,
    page: 1,
  };

  componentDidMount() {
    const { getImageTemplate, template } = this.props;
    this.getWrapList();
    if (isEmpty(template)) {
      getImageTemplate(DEFAULT_REGISTRY);
    }
  }

  getStoreList = (query: IQuery) => {
    const { getWrapStoreList } = this.props;
    const current = query && query.current || this.state.page;
    const newQuery = {
      from: (current - 1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE,
      sort_by: 'publish_time',
      sort_order: 'desc',
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

  addWrap = (record, registry) => {
    const { selectPacket } = this.props;
    window.WrapListTable = record;
    selectPacket(record, registry, true);
  }

  renderTable = () => {
    const { currentType } = this.state;
    const { wrapList, wrapStoreList } = this.props;
    let isFetching: boolean;
    let dataSource: { isFetching: boolean,  pkgs: Array, server: string };
    if (currentType === TRID_TYPE) {
      dataSource = wrapList;
      isFetching = wrapList.isFetching;
    } else {
      dataSource = wrapStoreList;
      isFetching = wrapStoreList.isFetching;
    }
    const { registry } = dataSource;
    const columns = [
      {
        title: <FormattedMessage {...IntlMessage.wrapName}/>,
        dataIndex: 'fileName',
        width: '20%',
      },
      {
        title: <FormattedMessage {...IntlMessage.publishName}/>,
        dataIndex: 'fileNickName',
        width: '15%',
        render: text => text || '-',
      },
      {
        title: <FormattedMessage {...IntlMessage.tag}/>,
        dataIndex: 'fileTag',
        width: '20%',
      },
      {
        title: <FormattedMessage {...IntlMessage.wrapType}/>,
        dataIndex: 'fileType',
        width: '20%',
      },
      {
        'title': <FormattedMessage {...IntlMessage.uploadTime}/>,
        dataIndex: 'creationTime',
        width: '20%',
        render: text => formatDate(text),
      },
      {
        title: <FormattedMessage {...IntlMessage.operation}/>,
        width: '20%',
        render: (_, record) => <Button type="primary" onClick={() => this.addWrap(record, registry)}>
            <FormattedMessage {...IntlMessage.add}/>
        </Button>,
      },
    ];
    return (
      <Table
        className="wrapTable reset_antd_table_header"
        loading={isFetching}
        dataSource={dataSource && dataSource.pkgs}
        columns={columns}
        pagination={false}
      />
    );
  }
  render() {
    const { currentType, searchValue } = this.state;
    const { wrapList, wrapStoreList, intl } = this.props;
    const total: number = currentType === TRID_TYPE ? wrapList.total : wrapStoreList.total;
    const paginationOpts = {
      simple: true,
      pageSize: DEFAULT_PAGE_SIZE,
      current: this.state.page || 1,
      total,
      onChange: current => {
        this.setState({
          page: current,
        });
        currentType === TRID_TYPE ? this.getWrapList({ current }) : this.getStoreList({ current });
      },
    };
    return(
      <div className="wrapPart layout-content">
        <div className="wrapHeader layout-content-btns">
          <span><FormattedMessage {...IntlMessage.selectWrap}/></span>
          <span >
            <RadioGroup onChange={this.changeType} size="large" value={currentType}>
              <RadioButton value={TRID_TYPE}><FormattedMessage {...IntlMessage.wrap}/></RadioButton>
              <RadioButton value={STORE_TYPE}><FormattedMessage {...IntlMessage.wrapStore}/></RadioButton>
            </RadioGroup>
          </span>
          <span >
            <CommonSearchInput
              value={searchValue}
              onChange={value => this.setState({ searchValue: value })}
              placeholder={
                currentType === STORE_TYPE ?
                    intl.formatMessage(IntlMessage.wrapStorePlaceholder) :
                    intl.formatMessage(IntlMessage.wrapPlaceholder)
              }
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
              <FormattedMessage {...IntlMessage.uploadWrap}/>
          </Button>
          <div className="page-box pageBox">
            <span className="total"><FormattedMessage {...IntlMessage.total} values={{ total }}/></span>
            <Pagination {...paginationOpts}/>
          </div>
        </div>
        <div style={{ clear: 'both' }}/>
        {this.renderTable()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { wrapList, wrapStoreList, wrapTemplate } = state.images;
  const { result: storeList } = wrapStoreList || { result: {} };
  const { data: storeData } = storeList || { data: [] };
  const list = wrapList || {};
  let datalist = { pkgs: [], total: 0 };
  if (list.result) {
    datalist = list.result.data;
  }
  const { template } = wrapTemplate || { template: [] };
  return {
    wrapList: datalist,
    wrapStoreList: storeData,
    template,
  };
};

export default connect(mapStateToProps, {
  wrapManageList: appCenterActions.wrapManageList,
  getWrapStoreList: appCenterActions.getWrapStoreList,
  getImageTemplate: appCenterActions.getImageTemplate,
})(injectIntl(WrapsPart, { withRef: true }));
