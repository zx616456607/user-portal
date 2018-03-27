/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Template info component
 *
 * 2018-03-09
 * @author Zhangxuan
 */

import * as React from 'react';
import { connect } from 'react-redux';
import { browserHistory, Link } from 'react-router';
import yaml from 'js-yaml';
import { Button, Input, Icon, Form, Row, Col } from 'antd';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { buildJson, getFieldsValues } from '../../../../../../src/components/AppModule/QuickCreateApp/utils';
import { parseAmount, getResourceByMemory } from '../../../../../../src/common/tools';
import * as templateActions from '../../../../../actions/template';
import './style/index.less';
import NotificationHandler from '../../../../../../src/components/Notification';

const FormItem = Form.Item;

const TEMPLATE_EDIT_HASH = '#edit-template';
const notify = new NotificationHandler();

class TemplateInfo extends React.Component<any> {

  state = {};

  renderServices = () => {
    const { fields, id, editServiceKey, configureMode, saveService, deleteService } = this.props;
    let serviceList: Array = [];
    for (let [key, value] of Object.entries(fields)) {
      const { serviceName, appPkgID } = value;
      let isWrap = false;
      if (serviceName && serviceName.value) {
        const isActive = false;
        if (configureMode === 'create') {
          isActive = key === id;
        } else {
          isActive = key === editServiceKey;
      }
        if (appPkgID) {
          isWrap = true;
        }
        const rowClass = classNames({
          'serviceRow': true,
          'active': isActive,
        });
        const classOpt = classNames('newText', {
          'hidden': id !== key || configureMode === 'edit',
        });
        serviceList.push(
          <Row key={serviceName.value} className={rowClass}>
            <Col span={22} className="serviceName" onClick={() => saveService(key, isWrap)}>
              <div className={classNames('newService', { 'successColor':  id === key && configureMode === 'create' })}>
                {serviceName.value}
                <span className={classOpt}>new</span>
              </div>
            </Col>
            <Col span={2} className="deleteBtn" onClick={() => deleteService(key)}><Icon type="delete" /></Col>
          </Row>,
      );
      }
    }
    return serviceList;
  }

  getAppResources() {
    const { current } = this.props;
    const fields = this.props.fields || {};
    let newCpuTotal = 0; // unit: C
    let newMemoryTotal = 0; // unit: G
    let newPriceHour = 0; // unit: T/￥
    for (let key in fields) {
      if (fields.hasOwnProperty(key) && fields[key].serviceName) {
        const { resourceType, DIYMemory, DIYCPU, replicas } = getFieldsValues(fields[key]);
        const { memoryShow, cpuShow, config } = getResourceByMemory(resourceType, DIYMemory, DIYCPU);
        newCpuTotal += cpuShow * replicas;
        newMemoryTotal += memoryShow * replicas;
        let price = current.cluster.resourcePrice[config];
        if (price) {
          newPriceHour += price * replicas;
        } else {
          // @Todo: need diy resource price
        }
      }
    }
    newCpuTotal = Math.ceil(newCpuTotal * 100) / 100;
    newMemoryTotal = Math.ceil(newMemoryTotal * 100) / 100;
    const priceMonth = parseAmount(newPriceHour * 24 * 30, 4).amount;
    newPriceHour = parseAmount(newPriceHour, 4).amount;
    return {
      resource: `${newCpuTotal}C ${newMemoryTotal}G`,
      priceHour: newPriceHour,
      priceMonth,
    };
  }

  renderResourcePrice = () => {
    const { current, billingEnabled } = this.props;
    const { unit } = current;
    const { resource, priceHour, priceMonth } = this.getAppResources();
    function renderTotalPrice() {
      if (unit === '￥') {
        return (
          <div className="price">
            合计：
            <span className="hourPrice"><font>¥</font> {priceHour}/小时</span>
            <span className="monthPrice">（合 <font>¥</font> {priceMonth}/月）</span>
          </div>
        );
      }
      return (
        <div className="price">
          合计：
          <span className="hourPrice">{priceHour} {unit}/小时</span>
          <span className="monthPrice">（合 {priceMonth} {unit}/月）</span>
        </div>
      );
    }
    if (!billingEnabled) {
      return;
    }
    return (
      <div className="resourcePrice">
        <div className="resource">
          计算资源：
          <span>{resource}</span>
        </div>
        {renderTotalPrice()}
      </div>
    );
  }

  formatTemplateInfo = (serviceArray: Array): Array => {
    let copyArr = [];
    copyArr.push(serviceArray[0]);
    serviceArray.forEach((item, index) => {
      if (index > 0) {
        copyArr[index - 1].dependencies = [item];
      }
    });
    return copyArr;
  }

  formatTemplateBody = () => {
    const { fields, imageConfig, current, loginUser, loadBalanceList } = this.props;
    const serviceArray: Array = [];
    let accessType: string = '';
    let loadBalanceName: string = '';
    let chart: object = {};
    let info: Array = [];
    for (let [key, value] of Object.entries(fields)) {
      let serviceOption = {};
      let content: Array = [];
      if (fields.hasOwnProperty(key)) {
        let json = buildJson(value, current.cluster, loginUser, imageConfig, true);
        content.push(yaml.dump(json.deployment));
        content.push(yaml.dump(json.service));
        json.storage.forEach(item => {
          content.push(yaml.dump(item));
        });
        if (value.accessType && value.accessType.value === 'loadBalance') {
          accessType = value.accessType.value;
          let lbKeys = value.lbKeys.value;
          lbKeys.forEach(item => {
            const items = [];
            const { host } = value[`ingress-${item}`].value;
            const [hostname, ...path] = host.split('/');
            items.push({
              serviceName: value.serviceName.value,
              servicePort: parseInt(value[`port-${item}`].value, 10),
              weight: 1,
            });
            const body = {
              host: hostname,
              path: path ? '/' + path.join('/') : '',
              items,
            };
            let ingress: Array = [];
            if (!loadBalanceName) {
              loadBalanceName = getFieldsValues(value).loadBalance;
            }
            if (loadBalanceName) {
              const currentLB = loadBalanceList.filter(lb => loadBalanceName === lb.metadata.name)[0];
              const { displayName, className } = currentLB.metadata.annotations;
              const lbObj = {
                lbName: loadBalanceName,
                displayName,
                className,
              };
              Object.assign(serviceOption, { loadbalance: lbObj });
            }
            ingress.push(Object.assign(value[`ingress-${item}`].value, body));
            if (!isEmpty(ingress)) {
              Object.assign(serviceOption, { ingress });
            }
          });
        }
        content = content.join('---\n');
        Object.assign(serviceOption, { content });
        if (!chart.name) {
          chart.name = getFieldsValues(value).templateName;
        }
        if (!chart.version) {
          chart.version = getFieldsValues(value).templateVersion;
        }
        if (!chart.description) {
          chart.description = getFieldsValues(value).templateDesc;
        }
      }
      serviceArray.push(serviceOption);
    }
    info = this.formatTemplateInfo(serviceArray);
    return { chart, info };
  }

  confirmTemplate = async () => {
    const { loginUser, createTemplate  } = this.props;
    const body = this.formatTemplateBody();
    notify.spin('模板创建中');
    this.setState({
      confirmLoading: true,
    });
    const result = await createTemplate(body);
    if (result.error) {
      notify.close();
      this.setState({
        confirmLoading: false,
      });
      return notify.warn('创建失败', result.error.message.message || result.error.message);
    }
    notify.close();
    notify.success('模板创建成功');
    this.setState({
      confirmLoading: false,
    });
    browserHistory.push('/app_center/template');
  }

  getTemplateInfo = (key: string) => {
    const { fields } = this.props;
    const firstConfig = Object.values(fields)[0];
    if (!firstConfig || !firstConfig[key]) {
      return;
    }
    return firstConfig[key].value;
  }

  renderCancelBtn = () => {
    const { currentStep, location, cancelTemplate } = this.props;
    const { query } = location;
    const { hash } = query;
    return (
      <Button
        type="ghost"
        size="large"
        onClick={cancelTemplate}
        disabled={currentStep === 1 && hash === TEMPLATE_EDIT_HASH}
      >
        {currentStep === 0 ? '取消' : '上一步'}
      </Button>
    );
  }
  render() {
    const { saveService, fields, currentStep } = this.props;
    const { confirmLoading } = this.state;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16 },
    };
    let showAddBtn = false;
    if (Object.keys(fields) && Object.keys(fields).length) {
      showAddBtn = true;
    }
    return (
      <div className="templateInfo">
        <div className="tempInfoHeader">信息总览</div>
        <div className="tempInfoBody">
          <div className="customizeItem">
            <div className="label">模板名称</div>
            <Input size="large" readOnly value={this.getTemplateInfo('templateName')}/>
          </div>
          <div className="customizeItem">
            <div className="label">模板版本</div>
            <Input size="large" readOnly value={this.getTemplateInfo('templateVersion')}/>
          </div>
          <div className="customizeItem">
            <div className="label">模板描述</div>
            <Input size="large" type="textarea" readOnly value={this.getTemplateInfo('templateDesc')}/>
          </div>
          <div className="serviceBox">
            <Row className={classNames('serviceHeader', { 'hidden': !showAddBtn })} type="flex" justify="space-between">
              <Col>服务</Col>
              <Col>操作</Col>
            </Row>
            {this.renderServices()}
            <Button
              type="ghost"
              size="large"
              className={classNames('addServiceBtn', { 'hidden': !showAddBtn || currentStep === 0 })}
              onClick={() => saveService()}
            >
              <i className="fa fa-plus" /> 继续添加服务
            </Button>
          </div>
          {this.renderResourcePrice()}
        </div>
        <Row className="tempInfoFooter" type="flex" align="middle" justify="center">
          <Col>{this.renderCancelBtn()}</Col>
          <Col>
            <Button type="primary" loading={confirmLoading} size="large" onClick={this.confirmTemplate}>创建</Button
          ></Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { entities, quickCreateApp, loadBalance } = state;
  const { current, loginUser } = entities;
  const { billingConfig } = loginUser.info;
  const { enabled: billingEnabled } = billingConfig;
  const { fields } = quickCreateApp;
  const { loadBalanceList } = loadBalance || { loadBalanceList: {} };
  const { data: loadBalanceList } = loadBalanceList || { data: [] };
  return {
    current,
    loginUser,
    billingEnabled,
    fields,
    loadBalanceList,
  };
};

export default connect(mapStateToProps, {
  createTemplate: templateActions.createTemplate,
})(TemplateInfo);
