/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.*/

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
import { Button, Icon, Pagination, Modal, Spin, Popover, Tooltip } from 'antd';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import SearchInput from '../../../components/SearchInput';
import Title from '../../../../src/components/Title';
import {
  calcuDate, genRandomString, toQuerystring, formatServiceToArrry,
  getWrapFileType,
} from '../../../../src/common/tools';
import ReleaseModal from './ReleaseModal';
import * as TemplateActions from '../../../actions/template';
import * as QuickCreateAppActions from '../../../../src/actions/quick_create_app';
import * as globalActions from '../../../../src/actions/global_config';
import defaultApp from '../../../assets/img/AppCenter/app_template.png';
import './style/index.less';
import NotificationHandler from '../../../../src/components/Notification';
import { parseToFields } from './CreateTemplate/parseToFields';
import { injectIntl, FormattedMessage } from 'react-intl'
import AppCenterMessage from '../../../../src/containers/AppCenter/intl'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import Ellipsis from '@tenx-ui/ellipsis/lib/index'
import '@tenx-ui/ellipsis/assets/index.css'
import { OTHER_IMAGE } from '../../../../src/constants'

const notify = new NotificationHandler();

const DEFAULT_SIZE = 12;
const SERVICE_CONFIG_HASH = '#configure-service';

class TemplateList extends React.Component<any> {

  state = {
  };

  serviceSum = 0;

  componentWillMount() {
    const { checkChartRepoIsPrepare } = this.props
    this.loadTemplateList();
    checkChartRepoIsPrepare()
  }

  loadTemplateList = (query: any) => {
    const { getAppTemplateList, intl } = this.props;
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
    getAppTemplateList(newQuery, {
      failed: {
        func: res => {
          if (res.statusCode === 500) {
            notify.warn(intl.formatMessage(AppCenterMessage.chartRepoConnectFailure));
          }
        },
      },
    });
  }

  createTemplate = () => {
    browserHistory.push('/app_center/template/create');
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
    const { deleteAppTemplate, intl } = this.props;
    const { selectedTemp } = this.state;
    this.setState({
      deleteLoading: true,
    });
    notify.spin(intl.formatMessage(AppCenterMessage.deleting));
    const result = await deleteAppTemplate(selectedTemp.name, selectedTemp.versions[0].version);
    if (result.error) {
      notify.close(intl.formatMessage(AppCenterMessage.deleteFailure));
      notify.warn(intl, result.error.message.message || result.error.message);
      this.setState({
        deleteLoading: false,
      });
      return;
    }
    this.loadTemplateList();
    notify.close();
    notify.success(intl.formatMessage(AppCenterMessage.deleteSuccess));
    this.setState({
      deleteVisible: false,
      deleteLoading: false,
    });
  }

  handleEdit = (temp: object) => {
    if (this.chartRepoIsEmpty()) {
      return
    }
    browserHistory.push(`/app_center/template/create?name=${temp.name}&version=${temp.versions[0].version}`);
  }
  cancelRelease = () => {
    this.setState({
      releaseVisible: false,
    });
  }

  genConfigureServiceKey() {
    this.serviceSum ++;
    return `${this.serviceSum}-${genRandomString('0123456789')}`;
  }

  handleDeploy = async record => {
    const { getAppTemplateDetail, setFormFields } = this.props;
    const { name } = record;
    const version = record.versions[0].version;
    const result = await getAppTemplateDetail(name, version);
    if (result.error) {
      return;
    }
    const { detail, chart } = result.response.result.data;
    const templateArray = [];
    formatServiceToArrry(detail, templateArray);
    templateArray.reverse();
    const setArray = [];
    templateArray.forEach((temp) => {
      const id = this.genConfigureServiceKey();
      const values = parseToFields(temp, chart);
      setArray.push(setFormFields(id, values));
    });
    await Promise.all(setArray);
    const { fields } = this.props;
    const firstID = Object.keys(fields)[0];
    const currentFields = fields[firstID];
    const { imageUrl, imageTag, appPkgID } = currentFields;
    const [registryServer, ...imageArray] = imageUrl.value.split('/');
    const imageName = imageArray.join('/');
    const query = {
      imageName,
      registryServer,
      tag: imageTag.value,
      key: firstID,
      from: 'appcenter',
      template: 'true',
    };
    if (currentFields[OTHER_IMAGE]) {
      Object.assign(query, {
        other: currentFields[OTHER_IMAGE].value,
      })
    }
    if (appPkgID) {
      const type = imageName.split('/')[1];
      const fileType = getWrapFileType(type);
      Object.assign(query, { appPkgID: appPkgID.value, isWrap: true, fileType });
    }
    browserHistory.push(`/app_manage/app_create/quick_create?${toQuerystring(query)}${SERVICE_CONFIG_HASH}`);
  }

  renderTemplateList = () => {
    const { templateList, isFetching, intl } = this.props;
    if (isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"/>
        </div>
      );
    }
    if (isEmpty(templateList)) {
      return [
        <div className="noTemplateData" key="noTemplateData"/>,
        <div className="noTemplateText" key="noTemplateText">
          <FormattedMessage {...AppCenterMessage.emptyTip} />
          <Tooltip title={this.chartRepoIsEmpty() ? intl.formatMessage(AppCenterMessage.noChartRepoTip) : ''}>
            <Button type="primary" size="large" onClick={this.createTemplate} disabled={this.chartRepoIsEmpty()}>
              <FormattedMessage {...AppCenterMessage.create} />
            </Button>
          </Tooltip>
        </div>,
      ];
    }
    return (templateList || []).map(temp => {
      const content = (
        <div className="templateInnerPopover">
          {/* <div key="clone" className="pointer">克隆</div> */}
          <Tooltip title={this.chartRepoIsEmpty() ? intl.formatMessage(AppCenterMessage.noChartRepoTip) : ''}>
            <div key="edit" className="pointer" onClick={() => this.handleEdit(temp)}>
              <FormattedMessage {...AppCenterMessage.edit} />
            </div>
          </Tooltip>
          <div key="delete" className="pointer" onClick={() => this.handleDelete(temp)}>
            <FormattedMessage {...AppCenterMessage.delete} />
          </div>
        </div>
      );
      return (
        <div key={temp.name} className="templateList">
          <div className="templateHeader">
            {/* <span className="version">{temp.versions[0].apiVersion}</span> */}
            <Popover
              placement="bottomLeft"
              arrowPointAtCenter
              content={content}
              overlayClassName="templatePopover"
              overlayStyle={{ width: 100 }}
            >
              <Icon className="operation" type="setting" />
            </Popover>
            <div className="templateContent">
              <img className="tempLogo" src={defaultApp}/>
              <div className="nameAndDescBox">
                <div className="templateName">
                  <Ellipsis>
                    <span>{temp.name}</span>
                  </Ellipsis>
                </div>
                <div className="templateDesc hintColor">
                  <Ellipsis lines={2}>
                    <span>{temp.versions[0].description}</span>
                  </Ellipsis>
                </div>
              </div>
            </div>
          </div>
          <div className="templateFooter">
            <div className="templateCreated">
              <Icon type="clock-circle-o" />
              <Tooltip
                  title={
                    intl.formatMessage(AppCenterMessage.updateOn, { date: calcuDate(temp.versions[0].created) })}
              >
                <span>{calcuDate(temp.versions[0].created)}</span>
              </Tooltip>
            </div>
            <Tooltip title={this.chartRepoIsEmpty() ? intl.formatMessage(AppCenterMessage.noChartRepoTip) : ''}>
              <Button
                className="deploy"
                disabled={this.chartRepoIsEmpty()}
                onClick={() => this.handleDeploy(temp)}
              >
                <FormattedMessage {...AppCenterMessage.deploy}/>
              </Button>
            </Tooltip>
          </div>
        </div>
      );
    });
  }

  chartRepoIsEmpty = () => {
    const { chartConfig } = this.props
    if (isEmpty(chartConfig)) {
      return true
    }
    const { ready } = chartConfig
    if (!ready) {
      return true
    }
    return false
  }

  render() {
    const { deleteVisible, releaseVisible, deleteLoading, searchValue, current } = this.state;
    const { total, intl } = this.props;
    const { formatMessage } = intl
    const pagination = {
      simple: true,
      current,
      total,
      pageSize: DEFAULT_SIZE,
      onChange: page => this.loadTemplateList({ from: page }),
    };
    return (
      <QueueAnim className="templateWrapper layout-content">
        <Title title={formatMessage(AppCenterMessage.appTemplate)}/>
        <div className="layout-content-btns" key="btns">
          <Tooltip title={this.chartRepoIsEmpty() ? intl.formatMessage(AppCenterMessage.noChartRepoTip) : ''}>
            <Button type="primary" size="large" disabled={this.chartRepoIsEmpty()} onClick={this.createTemplate}>
              <i className="fa fa-plus" /> <FormattedMessage {...AppCenterMessage.create} />
            </Button>
          </Tooltip>
          <Button type="ghost" size="large" onClick={this.loadTemplateList}>
              <i className="fa fa-refresh"/> <FormattedMessage {...AppCenterMessage.refresh} />
          </Button>
          <SearchInput
            size="large"
            placeholder={formatMessage(AppCenterMessage.placeholder)}
            style={{ width: 200 }}
            value={searchValue}
            onChange={value => this.setState({ searchValue: value })}
            onSearch={() => this.loadTemplateList({ search: searchValue })}
          />
          <div className={classNames('page-box', { 'hidden': !total })}>
            <span className="total">{<FormattedMessage {...AppCenterMessage.total} values={{ total }} />}</span>
            <Pagination {...pagination}/>
          </div>
        </div>
        <div className="templateBody">
          {this.renderTemplateList()}
        </div>
        <Modal
          title={formatMessage(AppCenterMessage.deleteTemplate)}
          visible={deleteVisible}
          confirmLoading={deleteLoading}
          onCancel={this.cancelDelModal}
          onOk={this.confirmDelModal}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
              <FormattedMessage {...AppCenterMessage.deleteTip} />
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
  const { appTemplates, quickCreateApp } = state;
  const { templates } = appTemplates;
  const { data: templateData, isFetching } = templates || { data: {} };
  const { data: templateList, total } = templateData || { data: [], total: 0 };
  const chartConfig = getDeepValue(state, ['appTemplates', 'chartRepoConfig', 'data'])
  return {
    templateList,
    total,
    isFetching,
    fields: quickCreateApp.fields,
    chartConfig,
  };
};

export default connect(mapStateToProps, {
  getAppTemplateList: TemplateActions.getTemplateList,
  deleteAppTemplate: TemplateActions.deleteAppTemplate,
  getAppTemplateDetail: TemplateActions.getAppTemplateDetail,
  setFormFields: QuickCreateAppActions.setFormFields,
  checkChartRepoIsPrepare: TemplateActions.checkChartRepoIsPrepare,
})(injectIntl(TemplateList, { withRef: true }));
