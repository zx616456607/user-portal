/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * App template component
 *
 * 2018-03-09
 * @author Zhangxuan
 */

import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { Form, Button, Row, Col } from 'antd';
import Title from '../../../../src/components/Title';
import ConfigPart from './ConfigPart';
import TemplateInfo from './TemplateInfo';

import './style/index.less';

interface IState {
  currentStep: 0;
}

class AppTemplate extends React.Component<any, IState> {
  state = {
    currentStep: 0,
  };

  stepChange = (step: number) => {
    this.setState({
      currentStep: step,
    });
  }

  render() {
    const { currentStep } = this.state;
    const { form } = this.props;
    const parentProps = {
      stepChange: this.stepChange,
      form,
    };
    return (
      <QueueAnim>
        <Row className="appTemplate" key="appTemplate" gutter={16}>
          <Title title="应用模板"/>
          <Col span={18}>
            <ConfigPart
              {...this.state}
              {...parentProps}
            />
            </Col>
          <Col span={6}>
            <TemplateInfo
              {...this.state}
              {...parentProps}
            />
          </Col>
        </Row>
      </QueueAnim>
    );
  }
}

const AppTemplate = Form.create()(AppTemplate);

const mapStateToProps = (state, props) => {
  return {};
};

export default connect(mapStateToProps, {
})(AppTemplate);
