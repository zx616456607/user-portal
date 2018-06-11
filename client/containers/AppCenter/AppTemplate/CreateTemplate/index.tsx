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
import { browserHistory } from 'react-router';
import { Button, Row, Col, Modal, Spin } from 'antd';
import isEmpty from 'lodash/isEmpty';
import Title from '../../../../../src/components/Title';
import ConfigPart from './ConfigPart';
import TemplateInfo from './TemplateInfo';
import { genRandomString, toQuerystring, formatServiceToArrry, getWrapFileType } from '../../../../../src/common/tools';
import * as QuickCreateAppActions from '../../../../../src/actions/quick_create_app';
import * as templateActions from '../../../../actions/template';
import * as appCenterActions from '../../../../../src/actions/app_center';
import { DEFAULT_REGISTRY } from '../../../../../src/constants';
import NotificationHandler from '../../../../../src/components/Notification';
import './style/index.less';
import { parseToFields } from './parseToFields';

const TEMPLATE_EDIT_HASH = '#edit-template';

interface IState {
  currentStep: number;
}

interface IProps {
  setFormFields(id: string, fields: object, callback?: any);
  getAppTemplateDetail(name: string, callback?: any): any;
}

class AppTemplate extends React.Component<IProps, IState> {
  constructor(props) {
    this.state = {
      currentStep: 0,
    };
    this.templateSum = 0;
    this.configureMode = 'create';
    const { location } = props;
    const { query } = location;
    if (query && !query.name) {
      this.configureServiceKey = this.genConfigureServiceKey();
    }
  }

  componentWillMount() {
    const { location, getAppTemplateDetail } = this.props;
    const { query } = location;
    if (query && query.name && query.version) {
      const { name, version } = query;
      this.setState({
        loading: true,
      });
      getAppTemplateDetail(name, version).then(res => {
        if (res.error) {
          this.setState({
            loading: false,
          });
          return;
        }
        this.parseTempDetail(res.response.result.data);
      });
    }
    this.setConfig(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { location: oldLocation } = this.props;
    const { location: newLocation } = nextProps;
    const { hash, query } = newLocation;
    if (hash !== oldLocation.hash || query.key !== oldLocation.query.key) {
      this.setConfig(nextProps);
    }
    if (!oldLocation.query && newLocation.query) {
      this.stepChange(1);
    }
    if (oldLocation.query && !newLocation.query) {
      this.stepChange(0);
    }
  }

  componentWillUnmount() {
    this.removeAllFormFieldsAsync(this.props);
  }

  parseTempDetail = data => {
    const { setFormFields } = this.props;
    const { detail, chart } = data;
    const templateArray = [];
    formatServiceToArrry(detail, templateArray);
    templateArray.reverse();
    templateArray.forEach(temp => {
      const id = this.genConfigureServiceKey();
      const values = parseToFields(temp, chart);
      setFormFields(id, values);
    });
    setTimeout(() => {
      this.toConfigPart();
      this.setState({
        loading: false,
      });
    }, 100);
  }

  toConfigPart = () => {
    const { fields, template, getImageTemplate } = this.props;
    const firstID = Object.keys(fields)[0];
    this.configureMode = 'edit';
    this.editServiceKey = firstID;
    const currentFields = fields[firstID];
    const { imageUrl, imageTag, appPkgID } = currentFields;
    const [registryServer, ...imageArray] = imageUrl.value.split('/');
    const imageName = imageArray.join('/');
    const query = {
      imageName,
      registryServer,
      tag: imageTag.value,
      key: firstID,
      template: true,
    };
    if (appPkgID) {
      const type = imageName.split('/')[1];
      const fileType: string = getWrapFileType(type);

      Object.assign(query, { isWrap: true, fileType });

      let newTemplateList = template;
      if (isEmpty(template)) {
        getImageTemplate(DEFAULT_REGISTRY).then(res => {
          newTemplateList = res.response.result.template;
          let currentTemplate = newTemplateList.filter(item => item.type === fileType)[0];
          let newImageName = currentTemplate.name;
          this.setState({
            newImageName,
          });
        });
      } else {
        let currentTemplate = newTemplateList.filter(item => item.type === fileType)[0];
        let newImageName = currentTemplate.name;
        this.setState({
          newImageName,
        });
      }
    }
    browserHistory.push(`/app_center/template/create?${toQuerystring(query)}${TEMPLATE_EDIT_HASH}`);
    this.stepChange(1);
  }

  removeAllFormFieldsAsync = props => {
    // 异步清除 fields，即等 QuickCreateApp 组件卸载后再清除，否者会出错
    const { removeAllFormFields } = props;
    setTimeout(removeAllFormFields);
  }

  genConfigureServiceKey = (): string => {
    this.templateSum ++;
    return `${this.templateSum}-${genRandomString('0123456789')}`;
  }

  setConfig = props => {
    const { location } = props;
    const { hash, query } = location;
    const { key } = query;
    const configureMode = hash === TEMPLATE_EDIT_HASH ? 'edit' : 'create';
    this.configureMode = configureMode;
    if (configureMode === 'edit') {
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

  saveService = (key: string, isWrap: boolean) => {
    const { currentStep } = this.state;
    const { fields, template, getImageTemplate } = this.props;
    const { validateFieldsAndScroll } = this.form;
    let notify = new NotificationHandler();
    const query = {
      key,
      isWrap,
      template: true,
    };
    let url = `/app_center/template/create`;
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        notify.warn('请先修改错误的表单');
        return;
      }
      // if query has key that mean edit template
      if (key) {
        if (this.configureMode === 'create' && key === this.configureServiceKey) {
          return;
        }
        if (currentStep === 0) {
          this.stepChange(1);
        }
        const currentFields = fields[key];
        const { appPkgID, imageUrl } = currentFields;
        const [registryServer, ...imageArray] = imageUrl.value.split('/');
        const imageName = imageArray.join('/');
        let newTemplateList = template;
        const type = imageName.split('/')[1];
        const fileType: string = getWrapFileType(type);
        if (appPkgID) {
          if (isEmpty(template)) {
            getImageTemplate(DEFAULT_REGISTRY).then(res => {
              newTemplateList = res.response.result.template;
              let currentTemplate = newTemplateList.filter(item => item.type === fileType)[0];
              let newImageName = currentTemplate.name;
              this.setState({
                newImageName,
              });
            });
          } else {
            let currentTemplate = newTemplateList.filter(item => item.type === fileType)[0];
            let newImageName = currentTemplate.name;
            this.setState({
              newImageName,
            });
          }

          Object.assign(query, { isWrap: true, fileType, imageName, registryServer, appPkgID: appPkgID.value });
        }
        url += `?${toQuerystring(query)}${TEMPLATE_EDIT_HASH}`;
        this.setState({
          loading: true,
        }, () => {
          browserHistory.push(url);
          this.setState({
            loading: false,
          });
        });
        return;
      }
      const fieldsKeys = Object.keys(fields) || [];
      if (fieldsKeys.length >= 1) {
        this.setState({
          templateName: values.templateName,
          templateDesc: values.templateDesc,
          templateVersion: values.templateVersion,
        });
      }
      // if create service, update the configure service key
      // use timeout: when history change generate a new configure serivce key
      browserHistory.push(url + '?action=addTemplate');
      this.configureServiceKey = this.genConfigureServiceKey();
      this.stepChange(0);
    });
  }

  deleteService = (key) => {
    this.setState({
      deleteVisible: true,
      deleteKey: key,
    });
  }

  cancelDelete = () => {
    this.setState({
      deleteVisible: false,
    });
  }

  confirmDelete = () => {
    const { removeFormFields, fields } = this.props;
    const { deleteKey, currentStep } = this.state;
    const serviceLength = Object.keys(fields).length;
    const id = this.configureMode === 'create' ? this.configureServiceKey : this.editServiceKey;
    let notify = new NotificationHandler();
    if (serviceLength === 1) {
      notify.warn('删除错误', '至少保留一个服务');
      return;
    }
    // 删除的是当前的服务
    if (deleteKey === id) {
      this.configureMode = 'edit';
      this.editServiceKey = Object.keys(fields)[0];
    }
    // 如果在选择镜像页则生成一个新的id
    if (currentStep === 0) {
      this.configureServiceKey = this.genConfigureServiceKey();
    }
    setTimeout(() => {
      removeFormFields(deleteKey);
    });
    this.setState({
      deleteVisible: false,
    });
  }

  cancelTemplate = () => {
    const { currentStep } = this.state;
    if (this.configureMode === 'create') {
      if (currentStep === 1) {
        this.setState({
          goBackVisible: true,
        });
        return;
      }
    }
    browserHistory.push('/app_center/template');
  }

  cancelGoBack = () => {
    this.setState({
      goBackVisible: false,
    });
  }

  confirmGoBack = () => {
    const { removeFormFields } = this.props;
    const id = this.configureServiceKey;
    browserHistory.push('/app_center/template/create');
    this.stepChange(0);
    setTimeout(() => {
      removeFormFields(id);
    });
    this.setState({
      goBackVisible: false,
    });
  }

  getNewImageName = name => {
    this.setState({
      newImageName: name,
    });
  }

  render() {
    const {
      currentStep, templateName, templateDesc, templateVersion,
      deleteVisible, goBackVisible, loading, newImageName,
    } = this.state;
    const {
      location, removeFormFields, removeAllFormFields, setFormFields, fields,
      getImageTemplate, template,
     } = this.props;
    const id = this.configureMode === 'create' ? this.configureServiceKey : this.editServiceKey;
    const parentProps = {
      stepChange: this.stepChange,
      currentStep,
      location,
      removeFormFields,
      removeAllFormFields,
      setFormFields,
      id,
      configureMode: this.configureMode,
      editServiceKey: this.editServiceKey,
      saveService: this.saveService,
      templateName,
      templateDesc,
      templateVersion,
    };
    if (loading) {
      return <div className="loadingBox"><Spin size="large" /></div>;
    }
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
              getNewImageName={this.getNewImageName}
              getImageTemplate={getImageTemplate}
              template={template}
            />
            </Col>
          <Col span={6}>
            <TemplateInfo
              {...this.state}
              {...parentProps}
              deleteService={this.deleteService}
              cancelTemplate={this.cancelTemplate}
              imageConfig={this.imageConfig}
              form={this.form}
            />
          </Col>
        </Row>
        <Modal
          title="删除服务"
          visible={deleteVisible}
          onCancel={this.cancelDelete}
          onOk={this.confirmDelete}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
            删除服务无法恢复，是否确认删除？
          </div>
        </Modal>
        <Modal
          title="返回上一步"
          visible={goBackVisible}
          onCancel={this.cancelGoBack}
          onOk={this.confirmGoBack}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
            返回上一步，将会放弃当前正在编辑的配置信息，本次编辑的信息将不会保留，是否返回上一步？
          </div>
        </Modal>
      </QueueAnim>
    );
  }
}

const mapStateToProps = (state, props) => {
  const { quickCreateApp, entities, images } = state;
  const { wrapTemplate } = images;
  const { template } = wrapTemplate || { template: [] };
  return {
    fields: quickCreateApp.fields,
    template,
  };
};

export default connect(mapStateToProps, {
  removeFormFields: QuickCreateAppActions.removeFormFields,
  removeAllFormFields: QuickCreateAppActions.removeAllFormFields,
  setFormFields: QuickCreateAppActions.setFormFields,
  getAppTemplateDetail: templateActions.getAppTemplateDetail,
  getImageTemplate: appCenterActions.getImageTemplate,
})(AppTemplate);
