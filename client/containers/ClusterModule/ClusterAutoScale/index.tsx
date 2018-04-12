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

let _that;

class ClusterAutoScale extends React.Component {
  state = {
    activeKey: 'pane1',
    isTab2ModalShow: false,
  };

  componentDidMount() {
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
  openTab2Modal(tab) {
    let obj = {};
    obj['isTab2ModalShowFrom' + tab] = true;
    _that.setState(obj);
  }
  closeTab2Modal(tab) {
    let obj = {};
    obj['isTab2ModalShowFrom' + tab] = true;
    _that.setState(obj);
  }
  render() {
    const { children, location } = this.props;
    const tabTitle1 = this.getTitle('伸缩策略');
    const tabTitle2 = this.getTitle('资源池配置');
    _that = this;
    return (
      <QueueAnim className="clusterAutoScaleBox" type="right">
        <div className="bline" />
        <Tabs className="autoScalerTab" activeKey={this.state.activeKey} onChange={this.tabChange} type="card" key="1">
          <TabPane className="tabTitle" tab={tabTitle1} key="pane1">
            <QueueAnim type="right">
              <div className="tabContent" key="3">
                <Tab1
                  openTab2Modal={this.openTab2Modal}
                  closeTab2Modal={this.closeTab2Modal}
                  isTab2ModalShow={this.state.isTab2ModalShowFromTab1}
                />
              </div>
            </QueueAnim>
          </TabPane>
          <TabPane className="tabTitle" tab={tabTitle2} key="pane2">
            <QueueAnim type="right">
              <div className="tabContent" key="5">
                <Tab2
                  openTab2Modal={this.openTab2Modal}
                  closeTab2Modal={this.closeTab2Modal}
                  isTab2ModalShow={this.state.isTab2ModalShowFromTab2}
                />
              </div>
            </QueueAnim>
          </TabPane>
        </Tabs>
      </QueueAnim>
    );
  }
  componentDidMount() {
    // tslint:disable-next-line:no-unused-expression
    // const div = document.createElement('div');
    // div.setAttribute('class', 'bline');
    // document.querySelector('.autoScalerTab .ant-tabs-bar').appendChild(div);
  }
}

const mapStateToProps = state => {
  const { appAutoScaler } = state;
  const { autoScalerList } = appAutoScaler;
  const isFetching = false;
  const serverList = [];
  const total = 0;
  return {
    // serverList,
    // total,
    // isFetching,
  };
};

export default connect(mapStateToProps, {

})(ClusterAutoScale);
