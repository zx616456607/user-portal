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
import { Button, Row, Col } from 'antd';
import Title from '../../../../../src/components/Title';
import ConfigPart from './ConfigPart';
import TemplateInfo from './TemplateInfo';
import { genRandomString } from '../../../../../src/common/tools';
import * as QuickCreateAppActions from '../../../../../src/actions/quick_create_app';
import './style/index.less';

const TEMPLATE_EDIT_HASH = '#edit-template';

interface IState {
  currentStep: number;
}

class AppTemplate extends React.Component<any, IState> {
  constructor(props) {
    this.state = {
      currentStep: 0,
    };
    this.templateSum = 0;
    this.configureMode = 'create';
    this.configureServiceKey = this.genConfigureServiceKey();
  }

  componentWillMount() {
    this.setConfig(this.props);
  }

  componentWillUnmount() {
    this.removeAllFormFieldsAsync(this.props);
  }

  removeAllFormFieldsAsync = props => {
    // 异步清除 fields，即等 QuickCreateApp 组件卸载后再清除，否者会出错
    const { removeAllFormFields } = props;
    setTimeout(removeAllFormFields);
  }

  genConfigureServiceKey = () => {
    this.templateSum ++;
    this.configureServiceKey = `${this.templateSum}-${genRandomString('0123456789')}`;
    return `${this.templateSum}-${genRandomString('0123456789')}`;
  }

  setConfig = props => {
    const { location } = props;
    const { hash, query } = location;
    const { key } = query;
    const configureMode = hash === TEMPLATE_EDIT_HASH ? 'edit' : 'create';
    if (configureMode === 'edit') {
      // this.configureServiceKey = key
      this.editServiceKey = key;
    }
  }

  stepChange = (step: number) => {
    this.setState({
      currentStep: step,
    });
  }

  getFormAndConfig = (form, imageConfig) => {
    this.form = form;
    this.imageConfig = imageConfig;
  }

  saveService = () => {
    const { fields } = this.props;
    const { validateFieldsAndScroll } = this.form;
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        return;
      }
      const fieldsKeys = Object.keys(fields) || [];
      if (fieldsKeys.length === 1) {
        this.setState({
          templateName: values.templateName,
          templateDesc: values.templateDesc,
        });
      }
      // if create service, update the configure service key
      // use timeout: when history change generate a new configure serivce key
      if (this.configureMode === 'create') {
        // setTimeout(() => {
          this.genConfigureServiceKey();
        // }, 50);
      }
      browserHistory.push('/app_center/template/create');
      this.stepChange(0);
    });
  }

  render() {
    const { currentStep, templateName, templateDesc } = this.state;
    const { location, removeFormFields, removeAllFormFields, setFormFields, fields } = this.props;
    const parentProps = {
      stepChange: this.stepChange,
      currentStep,
      location,
      removeFormFields,
      removeAllFormFields,
      setFormFields,
      id: this.configureServiceKey,
      configureMode: this.configureMode,
      saveService: this.saveService,
      templateName,
      templateDesc,
    };
    return (
      <QueueAnim>
        <Row className="appTemplate" key="appTemplate" gutter={16}>
          <Title title="应用模板"/>
          <Col span={18}>
            <ConfigPart
              fields={fields}
              {...this.state}
              {...parentProps}
              getFormAndConfig={this.getFormAndConfig}
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

const mapStateToProps = (state, props) => {
  const { quickCreateApp, entities } = state;
  return {
    fields: quickCreateApp.fields,
  };
};

export default connect(mapStateToProps, {
  removeFormFields: QuickCreateAppActions.removeFormFields,
  removeAllFormFields: QuickCreateAppActions.removeAllFormFields,
  setFormFields: QuickCreateAppActions.setFormFields,
})(AppTemplate);
