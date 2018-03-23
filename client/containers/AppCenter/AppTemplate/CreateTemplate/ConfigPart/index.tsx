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
import * as PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { Button, Steps } from 'antd';
import classNames from 'classnames';
import './style/index.less';
import ImagesPart from './SelectPacket/ImagesPart';
import WrapsPart from './SelectPacket/WrapsPart';
import TemplateConfigs from './TemplateConfig';
import { toQuerystring, encodeImageFullname, genRandomString } from '../../../../../../src/common/tools';
import ConfigureTemplate from '../../../../../../src/components/AppModule/QuickCreateApp/ConfigureService';

const Step = Steps.Step;

interface IState {
  activeKey: string;
  templateSum: number;
}

const tabsOpts = [{
  key: 'image',
  text: '镜像仓库',
}, {
  key: 'wrap',
  text: '应用包管理',
}];

export default class ConfigPart extends React.Component<any, IState> {
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

  selectPacket = (image: object, registryServer: string, isWrap?: boolean) => {
    const { stepChange } = this.props;
    this.setState({
      imageName: image.fileName || encodeImageFullname(image.repositoryName),
      registryServer,
    });
    if (isWrap) {
      const pkgQuery = {
        imageName: image.fileName,
        registryServer,
        appPkgID: image.id,
        fileType: image.fileType,
        isWrap,
      };
      browserHistory.push(`/app_center/template/create?${toQuerystring(pkgQuery)}`);
      setTimeout(() => {
        stepChange(1);
      });
      return;
    }
    const imageQuery = {
      imageName: encodeImageFullname(image.repositoryName),
      registryServer,
    };
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
            {activeKey === 'image' && <ImagesPart selectPacket={this.selectPacket}/>}
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
        action={'createTemplate'}
        {...this.props}
      />
    );
  }
  render() {
    const { currentStep } = this.props;
    return (
      <div className="configPart">
        <Steps className="configStep" size="small" current={currentStep}>
          <Step title="添加服务" />
          <Step title="服务配置" />
        </Steps>
        <div className="configWrapper">
          {this.renderStep()}
        </div>
      </div>
    );
  }
}
