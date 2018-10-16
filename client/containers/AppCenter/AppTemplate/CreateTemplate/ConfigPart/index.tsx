/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Config component
 *
 * 2018-03-09
 * @author Zhangxuan
 */

import * as React from 'react';
import { browserHistory } from 'react-router';
import { Button, Steps } from 'antd';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import './style/index.less';
import SelectImage from '../../../../../../src/components/AppModule/QuickCreateApp/SelectImage'
import WrapsPart from './SelectPacket/WrapsPart';
import { toQuerystring, encodeImageFullname } from '../../../../../../src/common/tools';
import ConfigureTemplate from '../../../../../../src/components/AppModule/QuickCreateApp/ConfigureService';
import { DEFAULT_REGISTRY } from '../../../../../../src/constants';
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../../../../src/containers/Application/intl'

const Step = Steps.Step;

interface IState {
  activeKey: string;
  templateSum: number;
}

const tabsOpts = [{
  key: 'image',
  text: <FormattedMessage {...IntlMessage.imageWarehouse}/>,
}, {
  key: 'wrap',
  text: <FormattedMessage {...IntlMessage.wrapManage}/>,
}];

class ConfigPart extends React.Component<any, IState> {
  constructor(props) {
    this.state = {
      activeKey: 'image',
    };
  }

  tabChange = (activeKey: string) => {
    this.setState({
      activeKey,
    });
  }

  renderTabs = () => {
    const { activeKey } = this.state;
    return tabsOpts.map(item =>
      (
        <li
          onClick={() => this.tabChange(item.key)}
          key={item.key}
          className={classNames('tabs_item_style', { 'tabs_item_selected_style': activeKey === item.key })}
        >
          {item.text}
        </li>
      ),
    );
  }

  onSelectOtherImage = query => {
    const { stepChange, location } = this.props
    const { registryServer, imageName, other } = query
    const imageQuery = {
      imageName,
      registryServer,
      template: true,
      other,
    };
    this.setState({
      imageName,
      registryServer,
    });
    if (location.query.action) {
      Object.assign(imageQuery, { action: location.query.action });
    }
    browserHistory.push(`/app_center/template/create?${toQuerystring(imageQuery)}`);
    setTimeout(() => {
      stepChange(1);
    });
  }

  selectPacket = (image: object, registryServer: string, isWrap?: boolean) => {
    const { stepChange, getImageTemplate, template, getNewImageName, location } = this.props;
    let finallyName = ''
    if (isWrap) {
      finallyName = image.fileName
    } else {
      finallyName = encodeImageFullname(image);
    }
    this.setState({
      imageName: finallyName,
      registryServer,
    });
    if (isWrap) {
      const pkgQuery = {
        imageName: image.fileName,
        registryServer,
        appPkgID: image.id,
        fileType: image.fileType,
        isWrap,
        template: true,
      };
      if (location.query.action) {
        Object.assign(pkgQuery, { action: location.query.action });
      }
      let newTemplateList = template;
      let currentTemplate: string;
      let newImageName: string;
      if (isEmpty(template)) {
        getImageTemplate(DEFAULT_REGISTRY).then(res => {
          newTemplateList = res.response.result.template;
          currentTemplate = newTemplateList.filter(item => item.type === image.fileType)[0];
          newImageName = currentTemplate.name;
          getNewImageName(newImageName);
        });
      } else {
        currentTemplate = newTemplateList.filter(item => item.type === image.fileType)[0];
        newImageName = currentTemplate.name;
        getNewImageName(newImageName);
      }
      browserHistory.push(`/app_center/template/create?${toQuerystring(pkgQuery)}`);
      setTimeout(() => {
        stepChange(1);
      });
      return;
    }
    const imageQuery = {
      imageName: finallyName,
      registryServer,
      template: true,
    };
    if (location.query.action) {
      Object.assign(imageQuery, { action: location.query.action });
    }
    browserHistory.push(`/app_center/template/create?${toQuerystring(imageQuery)}`);
    setTimeout(() => {
      stepChange(1);
    });
  }

  renderStep = () => {
    const { activeKey, imageName, registryServer } = this.state;
    const {
      currentStep, stepChange, location, getFormAndConfig,
      id, configureMode, templateName, templateDesc,
     } = this.props;
    if (currentStep === 0) {
      return (
        <div>
          <ul className="tabs_header_style configTabs">
            {this.renderTabs()}
          </ul>
            {
              activeKey === 'image' &&
              <SelectImage
                location={location}
                onChange={this.selectPacket}
                onOtherChange={this.onSelectOtherImage}
              />
            }
            {activeKey === 'wrap' && <WrapsPart selectPacket={this.selectPacket}/>}
        </div>
      );
    }
    return (
      <ConfigureTemplate
        mode={configureMode}
        id={id}
        {...{ imageName, registryServer }}
        callback={getFormAndConfig}
        isTemplate
        {...this.props}
      />
    );
  }
  render() {
    const { currentStep, intl } = this.props;
    return (
      <div className="configPart">
        <Steps className="configStep" size="small" current={currentStep}>
          <Step title={intl.formatMessage(IntlMessage.addService)} />
          <Step title={intl.formatMessage(IntlMessage.serviceConfig)} />
        </Steps>
        <div className="configWrapper">
          {this.renderStep()}
        </div>
      </div>
    );
  }
}

export default injectIntl(ConfigPart, { withRef: true })
