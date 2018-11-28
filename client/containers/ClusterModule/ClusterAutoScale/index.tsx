/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2018-04-08
 * @author rensiwei
 */
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Menu, Button, Card, Input, Dropdown, Spin, Modal,
  message, Icon, Checkbox, Tooltip,  Row, Col } from 'antd';
import QueueAnim from 'rc-queue-anim';
import classNames from 'classnames';
import * as autoScalerActions from '../../../actions/clusterAutoScaler';
import { connect } from 'react-redux';
import './style/clusterAutoScale.less';
// import Tab2 from './tabs/IaasTab';
import Tab1 from './tabs/StrategyTab';
import Title from '../../../../src/components/Title'

class ClusterAutoScale extends React.Component {
  state = {
    activeKey: 'pane1',
    isTab2ModalShow: false,
    isTab2Deleted: false,
  };

  tabChange = () => {
    this.setState({ activeKey: this.state.activeKey === 'pane1' ? 'pane2' : 'pane1' });
  }

  getTitle = (name) => {
    return (
      <div className="tabTitle"><span className="common-style"> {name} </span></div>
    );
  }
  openTab2Modal = (tab) => {
    const obj = {};
    obj['isTab2ModalShowFrom' + tab] = true;
    this.setState(obj);
  }
  closeTab2Modal = (tab) => {
    const obj = {};
    obj['isTab2ModalShowFrom' + tab] = true;
    this.setState(obj);
  }
  delCallBack = () => {
    this.setState({
      isTab2Deleted: true,
    }, () => {
      this.setState({
        isTab2Deleted: false,
      });
    });
  }
  render() {
    const { children, location } = this.props;
    const tabTitle1 = this.getTitle('伸缩策略');
    const tabTitle2 = this.getTitle('资源池配置');
    return (
      <QueueAnim className="clusterAutoScaleBox" type="right">
        <Title title="集群伸缩策略" />
        {/* <div className="bline" />
        <Tabs className="autoScalerTab" activeKey={this.state.activeKey}
          onChange={this.tabChange} type="card" key="1">
          <TabPane className="tabTitle" tab={tabTitle1} key="pane1"> */}
            <QueueAnim type="right">
              <div className="tabContent" key="3">
                <Tab1
                  openTab2Modal={this.openTab2Modal}
                  closeTab2Modal={this.closeTab2Modal}
                  isTab2ModalShow={this.state.isTab2ModalShowFromTab1}
                  isTab2Deleted={this.state.isTab2Deleted}
                  scope={this}
                />
              </div>
            </QueueAnim>
          {/* </TabPane> */}
          {/* <TabPane className="tabTitle" tab={tabTitle2} key="pane2">
            <QueueAnim type="right">
              <div className="tabContent" key="5">
                <Tab2
                  openTab2Modal={this.openTab2Modal}
                  closeTab2Modal={this.closeTab2Modal}
                  isTab2ModalShow={this.state.isTab2ModalShowFromTab2}
                  scope={this}
                  delCallBack={this.delCallBack}
                />
              </div>
            </QueueAnim>
          </TabPane> */}
        {/* </Tabs> */}
      </QueueAnim>
    );
  }
  componentDidMount() {
  }
}

export default ClusterAutoScale;
