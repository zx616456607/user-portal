/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Template table
 *
 * 2018-04-08
 * @author Zhangxuan
 */

import * as React from 'react';
import { connect } from 'react-redux';
import { Table, Button, Pagination } from 'antd';
import classNames from 'classnames';
import * as TemplateActions from '../../../actions/template';
import { DEFAULT_PAGE_SIZE } from '../../../../constants';
import SearchInput from '../../../components/SearchInput';
import { formatDate } from '../../../../src/common/tools';
import defaultApp from '../../../../static/img/appstore/defaultapp.png';
import './style/SelectTemplate.less';
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../../src/containers/Application/intl'

interface IState {

}

interface IProps {

}

class TemplateTable extends React.Component<IState, IProps> {

  state = {};

  componentWillMount() {
    this.loadTemplateList();
  }

  loadTemplateList = (query: any) => {
    const { getAppTemplateList } = this.props;
    const newQuery = {
      size: DEFAULT_PAGE_SIZE,
      from: 0,
    };
    if (query && query.from) {
      Object.assign(newQuery, { from: (query.from - 1) * DEFAULT_PAGE_SIZE });
    }
    if (query && query.search) {
      Object.assign(newQuery, { search: query.search });
    }
    this.setState({
      current: newQuery.from / DEFAULT_PAGE_SIZE + 1,
    });
    getAppTemplateList(newQuery);
  }

  selectTemplate = record => {
    const { onChange } = this.props;
    onChange(record);
  }

  render() {
    const { current, searchValue } = this.state;
    const { total, templateList, isFetching, intl } = this.props;
    const pagination = {
      simple: true,
      current,
      total,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: page => this.loadTemplateList({ from: page }),
    };

    const columns = [
      {
        width: '50px',
        render: () => <img src={defaultApp}/>,
      },
      {
        dataIndex: 'name',
        width: '40%',
      },
      {
        dataIndex: 'versions[0].lastUpdate',
        width: '40%',
        render: text => <div><FormattedMessage {...IntlMessage.lastModified}/>：{formatDate(text)}</div>,
      },
      {
        render: (_, record) =>
          <Button type="primary" size="large" onClick={() => this.selectTemplate(record)}>
              <FormattedMessage {...IntlMessage.select}/>
          </Button>,
      },
    ];
    return(
      <div className="tamplateBox layout-content">
        <div className="layout-content-btns">
          <span><FormattedMessage {...IntlMessage.selectAppTemplate}/></span>
          <SearchInput
            size="large"
            placeholder={intl.formatMessage(IntlMessage.appTemplatePlaceholder)}
            value={searchValue}
            style={{ width: 180 }}
            onChange={value => this.setState({ searchValue: value })}
            onSearch={() => this.loadTemplateList({ search: searchValue })}
          />
          <div className={classNames('page-box', { 'hidden': !total })}>
            <span className="total"><FormattedMessage {...IntlMessage.total} values={{ total }}/></span>
            <Pagination {...pagination}/>
          </div>
        </div>
        <Table
          className="templateTable"
          showHeader={false}
          columns={columns}
          dataSource={templateList}
          loading={isFetching}
          pagination={false}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { appTemplates } = state;
  const { templates } = appTemplates;
  const { data: templateData, isFetching } = templates || { data: {} };
  const { data: templateList, total } = templateData || { data: [], total: 1 };
  return {
    templateList,
    total,
    isFetching,
  };
};

export default connect(mapStateToProps, {
  getAppTemplateList: TemplateActions.getTemplateList,
})(injectIntl(TemplateTable, {
  withRef: true,
}));
