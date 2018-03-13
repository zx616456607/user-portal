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
import './style/index.less';

const FormItem = Form.Item;

class TemplateInfo extends React.Component<any> {

  renderServices = () => {
    const serviceArr: Array<string> = ['服务1', '服务2'];
    return serviceArr.map(item =>
      <Row key={item} className="serviceRow">
        <Col span={22}>{item}</Col>
        <Col span={2}><Icon type="delete" /></Col>
      </Row>,
    );
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
  render() {
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
            <Input/>
          </FormItem>
          <FormItem
            label="模板描述"
            {...formItemLayout}
          >
            <Input type="textarea"/>
          </FormItem>
          <div className="serviceBox">
            <Row className="serviceHeader" type="flex" justify="space-between">
              <Col>服务</Col>
              <Col>操作</Col>
            </Row>
            {this.renderServices()}
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
  const { current, loginUser } = state.entities;
  const { billingConfig } = loginUser.info;
  const { enabled: billingEnabled } = billingConfig;
  return {
    current,
    billingEnabled,
  };
};

export default connect(mapStateToProps, {

})(TemplateInfo);
