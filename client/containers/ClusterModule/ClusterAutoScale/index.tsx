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
    activeTab: 1,
    state2: false,
    state3: false,
  };

  tabChange = () => {
    // console.log(arguments);
  }

  render() {
    const { children, location } = this.props;
    return (
      <QueueAnim className="clusterAutoScaleBox" type="right">
        <Tabs onChange={this.tabChange} type="card">
          <TabPane tab="伸缩策略" key="1">
            <div className="tabContent">
              <Tab1
               />
            </div>
          </TabPane>
          <TabPane tab="资源池配置" key="2">
            <div className="tabContent">
              <Tab2
               />
            </div>
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
