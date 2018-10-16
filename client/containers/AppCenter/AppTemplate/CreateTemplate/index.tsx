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
import { DEFAULT_REGISTRY, OTHER_IMAGE } from '../../../../../src/constants';
import NotificationHandler from '../../../../../src/components/Notification';
import './style/index.less';
import { parseToFields } from './parseToFields';
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../../../src/containers/Application/intl'

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
    if (currentFields[OTHER_IMAGE]) {
      Object.assign(query, {
        other: currentFields[OTHER_IMAGE].value,
      })
    }
    if (appPkgID) {
      const type = imageName.split('/')[1];
      const fileType: string = getWrapFileType(type);

      Object.assign(query, { isWrap: true, fileType });

      let newTemplateList = template;
      if (isEmpty(template)) {
        getImageTemplate(DEFAULT_REGISTRY).then(res => {
          newTemplateList = res.response.result.template;
          const currentTemplate = newTemplateList.filter(item => item.type === fileType)[0];
          const newImageName = currentTemplate.name;
          this.setState({
            newImageName,
          });
        });
      } else {
        const currentTemplate = newTemplateList.filter(item => item.type === fileType)[0];
        const newImageName = currentTemplate.name;
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
    window._fieldId = key
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
    const { fields, template, getImageTemplate, intl } = this.props;
    const { validateFieldsAndScroll } = this.form;
    const notify = new NotificationHandler();
    const query = {
      key,
      isWrap,
      template: true,
    };
    let url = `/app_center/template/create`;
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        notify.warn(intl.formatMessage(IntlMessage.formsError));
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
              const currentTemplate = newTemplateList.filter(item => item.type === fileType)[0];
              const newImageName = currentTemplate.name;
              this.setState({
                newImageName,
              });
            });
          } else {
            const currentTemplate = newTemplateList.filter(item => item.type === fileType)[0];
            const newImageName = currentTemplate.name;
            this.setState({
              newImageName,
            });
          }

          Object.assign(query, { isWrap: true, fileType, imageName, registryServer, appPkgID: appPkgID.value });
        }
        if (currentFields[OTHER_IMAGE]) {
          Object.assign(query, {
            other: currentFields[OTHER_IMAGE].value,
          })
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
    const { removeFormFields, fields, intl } = this.props;
    const { deleteKey, currentStep } = this.state;
    const serviceLength = Object.keys(fields).length;
    const id = this.configureMode === 'create' ? this.configureServiceKey : this.editServiceKey;
    const notify = new NotificationHandler();
    if (serviceLength === 1) {
      notify.warn(intl.formatMessage(IntlMessage.deleteFailure), intl.formatMessage(IntlMessage.deleteTooltip));
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
    const allKeys = Object.keys(fields)
    const filterKeys = allKeys.filter(_key => _key !== deleteKey)[0]
    this.saveService(filterKeys)
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
      getImageTemplate, template, intl,
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
          <Title title={intl.formatMessage(IntlMessage.appTemplate)}/>
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
          title={<FormattedMessage {...IntlMessage.deleteService}/>}
          visible={deleteVisible}
          onCancel={this.cancelDelete}
          onOk={this.confirmDelete}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
              <FormattedMessage {...IntlMessage.deleteServiceTip}/>
          </div>
        </Modal>
        <Modal
          title={<FormattedMessage {...IntlMessage.returnToPrevious}/>}
          visible={goBackVisible}
          onCancel={this.cancelGoBack}
          onOk={this.confirmGoBack}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
              <FormattedMessage {...IntlMessage.returnToPreviousTip}/>
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
})(injectIntl(AppTemplate, { withRef: true }));
