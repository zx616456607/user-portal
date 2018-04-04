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
import { Button, Icon, Pagination, Dropdown, Menu, Modal, Spin, Popover } from 'antd';
import classNames from 'classnames';
import SearchInput from '../../../components/SearchInput';
import Title from '../../../../src/components/Title';
import { formatDate } from '../../../../src/common/tools';
import ReleaseModal from './ReleaseModal';
import * as templateActions from '../../../actions/template';
import defaultApp from '../../../../static/img/appstore/defaultapp.png';
import './style/index.less';
import NotificationHandler from '../../../../src/components/Notification';

const notify = new NotificationHandler();

const DEFAULT_SIZE = 12;

class TemplateList extends React.Component<any> {

  state = {
  };

  componentWillMount() {
    this.loadTemplateList();
  }

  loadTemplateList = (query: any) => {
    const { getAppTemplateList } = this.props;
    const newQuery = {
      size: DEFAULT_SIZE,
      from: 0,
    };
    if (query && query.from) {
      Object.assign(newQuery, { from: (query.from - 1) * DEFAULT_SIZE });
    }
    if (query && query.search) {
      Object.assign(newQuery, { search: query.search });
    }
    this.setState({
      current: newQuery.from / DEFAULT_SIZE + 1,
    });
    getAppTemplateList(newQuery);
  }

  createTemplate = () => {
    browserHistory.push('/app_center/template/create');
  }

  handleDeploy = () => {

  }

  handleDelete = (temp: object) => {
    this.setState({
      deleteVisible: true,
      selectedTemp: temp,
    });
  }

  cancelDelModal = () => {
    this.setState({
      deleteVisible: false,
    });
  }

  confirmDelModal = async () => {
    const { deleteAppTemplate } = this.props;
    const { selectedTemp } = this.state;
    this.setState({
      deleteLoading: true,
    });
    notify.spin('模板删除中');
    const result = await deleteAppTemplate(selectedTemp.name, selectedTemp.versions[0].version);
    if (result.error) {
      notify.close();
      notify.warn('删除失败', result.error.message.message || result.error.message);
      this.setState({
        deleteLoading: false,
      });
    }
    this.loadTemplateList();
    notify.close();
    notify.success('删除成功');
    this.setState({
      deleteVisible: false,
      deleteLoading: false,
    });
  }

  handleEdit = (temp: object) => {
    browserHistory.push(`/app_center/template/create?name=${temp.name}&version=${temp.versions[0].version}`);
  }
  cancelRelease = () => {
    this.setState({
      releaseVisible: false,
    });
  }

  renderTemplateList = () => {
    const { templateList, isFetching } = this.props;
    if (isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"/>
        </div>
      );
    }
    return (templateList || []).map(temp => {
      const content = (
        <div>
          <div key="delete" className="pointer" onClick={() => this.handleDelete(temp)}>删除</div>
          <div key="edit" className="pointer" onClick={() => this.handleEdit(temp)}>修改</div>
          <div key="clone" className="pointer">克隆</div>
        </div>
      );
      return (
        <div key={temp.name} className="templateList">
          <span className="version">{temp.versions[0].apiVersion}</span>
          <Popover placement="right" content={content}>
            <Icon className="operation" type="bars" />
          </Popover>
          <img className="tempLogo" src={defaultApp}/>
          <div className="templateFooter">
            <div>{temp.name}</div>
            <div className="descAndDeploy">
              <div className="tempDesc">{formatDate(temp.versions[0].lastUpdate)}</div>
              <Button className="deploy" type="primary" onClick={() => this.handleDeploy()}>部署</Button>
            </div>
          </div>
        </div>
      );
    });
  }
  render() {
    const { deleteVisible, releaseVisible, deleteLoading, searchValue, current } = this.state;
    const { total } = this.props;
    const pagination = {
      simple: true,
      current,
      total,
      pageSize: DEFAULT_SIZE,
      onChange: page => this.loadTemplateList({ from: page }),
    };
    return (
      <QueueAnim className="templateWrapper layout-content">
        <Title title="应用模板"/>
        <div className="layout-content-btns" key="btns">
          <Button type="primary" size="large" onClick={this.createTemplate}><i className="fa fa-plus" /> 创建模板</Button>
          <Button type="ghost" size="large" onClick={this.loadTemplateList}><i className="fa fa-refresh"/> 刷新</Button>
          <SearchInput
            size="large"
            placeholder="请输入模板名称搜索"
            style={{ width: 200 }}
            value={searchValue}
            onChange={value => this.setState({ searchValue: value })}
            onSearch={() => this.loadTemplateList({ search: searchValue })}
          />
          <div className={classNames('page-box', { 'hidden': !total })}>
            <span className="total">共 {total} 条</span>
            <Pagination {...pagination}/>
          </div>
        </div>
        <div className="templateBody">
          {this.renderTemplateList()}
        </div>
        <Modal
          title="删除应用模板"
          visible={deleteVisible}
          confirmLoading={deleteLoading}
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
  getAppTemplateList: templateActions.getTemplateList,
  deleteAppTemplate: templateActions.deleteAppTemplate,
})(TemplateList);
