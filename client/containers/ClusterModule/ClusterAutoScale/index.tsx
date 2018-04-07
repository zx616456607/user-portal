import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Menu, Button, Card, Input, Dropdown, Spin, Modal,
  message, Icon, Checkbox, Tooltip,  Row, Col, Tabs } from 'antd';
import QueueAnim from 'rc-queue-anim';
import classNames from 'classnames';
import * as clusterActions from '../../../../src/actions/cluster';
import { connect } from 'react-redux';
import * as templateActions from '../../../actions/template';
import './style/clusterAutoScale.less';
import Tab1 from './tabs/tab1';
import Tab2 from './tabs/tab2';
const TabPane = Tabs.TabPane;

class ClusterAutoScale extends React.Component {
  state = {
    activeKey: "pane1",
    state2: false,
    state3: false,
  };

  tabChange = () => {
    // console.log(arguments);
    this.setState({activeKey: this.state.activeKey == "pane1"? "pane2" : "pane1" });
  }
  getTitle = (name) => {
    return (
      <div className="tabTitle"><span className="common-style"> {name} </span></div>
    );
  }
  render() {
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

const mapStateToProps = (state, props) => {
  const { clusterID } = props;
  const { kubeproxy } = state.cluster;
  return {
    kubeproxy: kubeproxy && kubeproxy[clusterID] && kubeproxy[clusterID].data || {},
  };
};
export default ClusterAutoScale;
