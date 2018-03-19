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
import { Button, Input, Icon, Form, Row, Col } from 'antd';
import classNames from 'classnames';
import './style/index.less';

const FormItem = Form.Item;

class TemplateInfo extends React.Component<any> {

  renderServices = () => {
    const { fields } = this.props;
    let serviceList: Array<string> = [];
    for (let [key, value] of Object.entries(fields)) {
      const { serviceName } = value;
      if (serviceName && serviceName.value) {
        serviceList.push(serviceName);
      }
    }
    const serviceArr: Array<string> = ['服务1', '服务2'];
    return serviceList.map(item => {
      const rowClass = classNames({
        'serviceRow': true,
        // 'active': isRowActive,
      });
      return (
        <Row key={item.value} className={rowClass}>
          <Col span={22}>{item.value}</Col>
          <Col span={2}><Icon type="delete" /></Col>
        </Row>
      );
    });
  }

  renderResourcePrice = () => {
    const { current, billingEnabled } = this.props;
    const { unit } = current;
    function renderTotalPrice() {
      if (unit === '￥') {
        return (
          <div className="price">
            合计：
            <span className="hourPrice"><font>¥</font> 1/小时</span>
            <span className="monthPrice">（合 <font>¥</font> 2/月）</span>
          </div>
        );
      }
      return (
        <div className="price">
          合计：
          <span className="hourPrice">1 T/小时</span>
          <span className="monthPrice">（合 1 T/月）</span>
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
          <span>1</span>
        </div>
        {renderTotalPrice()}
      </div>
    );
  }

  cancelTemplate = () => {
    const { stepChange } = this.props;
    stepChange(0);
  }

  confirmTemplate = () => {
    const { stepChange } = this.props;
    stepChange(0);
  }

  getTemplateInfo = (key: string) => {
    const { fields } = this.props;
    const firstConfig = Object.values(fields)[0];
    if (!firstConfig || !firstConfig[key]) {
      return;
    }
    return firstConfig[key].value;
  }

  render() {
    const { genConfigureServiceKey, saveService } = this.props;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16 },
    };
    return (
      <div className="templateInfo">
        <div className="tempInfoHeader">信息总览</div>
        <div className="tempInfoBody">
          <FormItem
            label="模板名称"
            {...formItemLayout}
          >
            <Input disabled value={this.getTemplateInfo('templateName')}/>
          </FormItem>
          <FormItem
            label="模板描述"
            {...formItemLayout}
          >
            <Input disabled value={this.getTemplateInfo('templateDesc')} type="textarea"/>
          </FormItem>
          <div className="serviceBox">
            <Row className="serviceHeader" type="flex" justify="space-between">
              <Col>服务</Col>
              <Col>操作</Col>
            </Row>
            {this.renderServices()}
            <Button type="ghost" size="large" className="addServiceBtn" onClick={saveService}>
              <i className="fa fa-plus" /> 继续添加服务
            </Button>
          </div>
          {this.renderResourcePrice()}
        </div>
        <Row className="tempInfoFooter" type="flex" align="middle" justify="center">
          <Col><Button type="ghost" size="large" onClick={this.cancelTemplate}>取消</Button></Col>
          <Col><Button type="primary" size="large" onClick={this.confirmTemplate}>创建</Button></Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { entities, quickCreateApp } = state;
  const { current, loginUser } = entities;
  const { billingConfig } = loginUser.info;
  const { enabled: billingEnabled } = billingConfig;
  const { fields } = quickCreateApp;
  return {
    current,
    billingEnabled,
    fields,
  };
};

export default connect(mapStateToProps, {

})(TemplateInfo);
