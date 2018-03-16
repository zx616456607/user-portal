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
import { Button, Steps } from 'antd';
import classNames from 'classnames';
import './style/index.less';
import ImagesPart from './SelectPacket/ImagesPart';
import WrapsPart from './SelectPacket/WrapsPart';
import TemplateConfigs from './TemplateConfig';

const Step = Steps.Step;

interface IState {
  activeKey: string;
}

const tabsOpts = [{
  key: 'image',
  text: '镜像仓库',
}, {
  key: 'wrap',
  text: '应用包管理',
}];

export default class ConfigPart extends React.Component<any, IState> {
  state = {
    activeKey: 'image',
  };

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

  renderStep = () => {
    const { activeKey } = this.state;
    const { currentStep, stepChange } = this.props;
    if (currentStep === 0) {
      return (
        <div>
          <ul className="tabs_header_style configTabs">
            {this.renderTabs()}
          </ul>
            {activeKey === 'image' && <ImagesPart stepChange={stepChange}/>}
            {activeKey === 'wrap' && <WrapsPart stepChange={stepChange}/>}
        </div>
      );
    }
    return <TemplateConfigs stepChange={this.stepChange}/>;
  }
  render() {
    const { currentStep } = this.props;
    return (
      <div className="configPart">
        <Steps className="configStep" size="small" current={currentStep}>
          <Step title="添加服务" />
          <Step title="服务配置" />
        </Steps>
        <div className="configBody">
          {this.renderStep()}
        </div>
      </div>
    );
  }
}
