import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Menu, Button, Card, Input, Dropdown, Spin, Modal,
  message, Icon, Checkbox, Tooltip,  Row, Col, Tabs } from 'antd';
import QueueAnim from 'rc-queue-anim';
import classNames from 'classnames';
import * as autoScalerActions from '../../../actions/clusterAutoScaler';
import { connect } from 'react-redux';
import './style/clusterAutoScale.less';
import Tab1 from './tabs/tab1';
import Tab2 from './tabs/tab2';
const TabPane = Tabs.TabPane;

class ClusterAutoScale extends React.Component {
  state = {
    activeKey: 'pane1',
    state2: false,
    state3: false,
  };

  componentDidMount() {
    const { getAutoScalerList } = this.props;
    getAutoScalerList();
  }

  tabChange = () => {
    // console.log(arguments);
    this.setState({ activeKey: this.state.activeKey === 'pane1' ? 'pane2' : 'pane1' });
  }
  getTitle = (name) => {
    return (
      <div className="tabTitle"><span className="common-style"> {name} </span></div>
    );
  }
  render() {
    const { getAutoScalerList, isFetching } = this.props;
    if (isFetching) {
      return (
        <div className="loadingBox">
          <Spin size="large"/>
        </div>
      );
    }

    const { children, location } = this.props;
    const tabTitle1 = this.getTitle('伸缩策略');
    const tabTitle2 = this.getTitle('资源池配置');
    return (
      <QueueAnim className="clusterAutoScaleBox" type="right">
        <Tabs activeKey={this.state.activeKey} onChange={this.tabChange} type="card" key="1">
          <TabPane className="tabTitle" tab={tabTitle1} key="pane1">
            <QueueAnim type="right">
              <div className="tabContent" key="3">
                <Tab1
                />
              </div>
            </QueueAnim>
          </TabPane>
          <TabPane className="tabTitle" tab={tabTitle2} key="pane2">
            <QueueAnim type="right">
              <div className="tabContent" key="5">
                <Tab2
                />
              </div>
            </QueueAnim>
          </TabPane>
        </Tabs>
      </QueueAnim>
    );
  }
}

const mapStateToProps = state => {
  const { appAutoScaler } = state;
  const { services } = appAutoScaler;
  const { data: data, isFetching } = services || { data: {} };
  const { data: servicesList, total } = data || { data: [], total: 1 };
  return {
    servicesList,
    total,
    isFetching,
  };
};

export default connect(mapStateToProps, {
  getAutoScalerList: autoScalerActions.getAutoScalerList,
  addAutoScaler: autoScalerActions.createAutoScaler,
  updateAutoScaler: autoScalerActions.updateAutoScaler,
  deleteAutoScaler: autoScalerActions.deleteAutoScaler,
})(ClusterAutoScale);
