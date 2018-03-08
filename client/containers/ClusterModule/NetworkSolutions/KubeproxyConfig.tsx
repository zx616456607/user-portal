/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Kubeproxy config component
 *
 * 2018-03-07
 * @author Zhangpc
 */

import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Modal, Button, Form, Select } from 'antd';
import { connect } from 'react-redux';
import * as clusterActions from '../../../../src/actions/cluster';
import NotificationHandler from '../../../../src/components/Notification';
import './style/KubeproxyConfig.less';

const FormItem = Form.Item;
const Option = Select.Option;
const SCHEDULERS = [
  {
    key: 'default',
    text: '默认调度',
  },
  {
    key: 'rr',
    text: '轮询调度（Round-Robin Scheduling）',
  },
  {
    key: 'wrr',
    text: '加权轮询调度（Weighted Round-Robin Scheduling）',
  },
  {
    key: 'dh',
    text: '目标地址散列调度（Destination Hashing Scheduling）',
  },
  {
    key: 'sh',
    text: '源地址散列调度（Source Hashing Scheduling）',
  },
  {
    key: 'lc',
    text: '最小连接调度（Least-Connection Scheduling）',
  },
  {
    key: 'wlc',
    text: '加权最小连接调度（Weighted Least-Connection Scheduling）',
  },
  {
    key: 'lblc',
    text: '基于本地的最少连接（Locality-Based Least Connections Scheduling）',
  },
  {
    key: 'lblcr',
    text: '带复制的基于局部性最少连接（Locality-Based Least Connections with Replication Scheduling）',
  },
];

interface IKubeproxy {
  enabled: boolean;
  scheduler: string;
}
interface IProps {
  clusterID?: string;
  kubeproxy: IKubeproxy;
  form: any;
  getKubeproxy(cluster: string, callback?: any): any;
  updateKubeproxy(cluster: string, body: IKubeproxy, callback?: any): any;
}
interface IState {
  isEdit: boolean;
  confirmModalVisible: boolean;
  confirmLoading: boolean;
}

class KubeproxyConfig extends React.Component<IProps, IState> {
  static propTypes = {
    clusterID: PropTypes.string,
    getKubeproxy: PropTypes.func,
    updateKubeproxy: PropTypes.func,
  };

  state = {
    isEdit: false,
    confirmModalVisible: false,
    confirmLoading: false,
  };

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const { getKubeproxy, clusterID } = this.props;
    getKubeproxy(clusterID).then(res => {
      if (res.error) {
        return;
      }
      this.setState({
        isEdit: false,
        confirmLoading: false,
        confirmModalVisible: false,
      });
    });
  }

  cancelEdit = () => {
    this.setState({
      isEdit: false,
    });
    this.props.form.resetFields();
  }

  confirmUpdate = () => {
    this.setState({ confirmLoading: true });
    const { clusterID, updateKubeproxy, form } = this.props;
    const { kubeproxyMode, scheduler } = form.getFieldsValue();

    // Default scheduler should be empty string
    let updatedScheduler = scheduler;
    if (updatedScheduler === 'default') {
      updatedScheduler = '';
    }
    const body = {
      enabled: kubeproxyMode === 'ipvs',
      scheduler: updatedScheduler,
    };
    const notification = new NotificationHandler();
    updateKubeproxy(clusterID, body).then(res => {
      if (res.error) {
        this.setState({ confirmLoading: false });
        notification.warn('更新失败');
        return;
      }
      notification.success('更新成功');
      this.loadData();
    });
  }

  renderBtns = () => {
    const { isEdit } = this.state;
    if (isEdit) {
      return [
        <Button key="cancel" onClick={this.cancelEdit}>取消</Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => this.setState({ confirmModalVisible: true })}
        >
        保存
        </Button>,
      ];
    }
    return <Button type="primary" onClick={() => this.setState({ isEdit: true })}>
    编辑
    </Button>;
  }

  render() {
    const { form, kubeproxy } = this.props;
    const { enabled, scheduler } = kubeproxy;
    const { getFieldProps, getFieldValue } = form;
    const formItemLayout = {
      labelCol: { span: 4, offset: 0 },
      wrapperCol: { span: 10, offset: 0 },
    };
    const { isEdit, confirmModalVisible } = this.state;
    const kubeproxyModeProps = getFieldProps('kubeproxyMode', {
      initialValue: enabled ? 'ipvs' : 'iptables',
      rules: [
        { required: true, message: '请选择负载均衡模式' },
      ],
    });
    const kubeproxyMode = getFieldValue('kubeproxyMode');
    let schedulerFormItem;
    if (kubeproxyMode === 'ipvs') {
      const schedulerProps = getFieldProps('scheduler', {
        initialValue: scheduler || 'default',
        rules: [
          { required: true, message: '请选择调度规则' },
        ],
      });
      schedulerFormItem = <FormItem
        label="调度规则"
        {...formItemLayout}
      >
        <Select disabled={!isEdit} {...schedulerProps} placeholder="请选择负载均衡模式">
          {SCHEDULERS.map(({ key, text }) => <Option key={key} value={key}>{text}</Option>)}
        </Select>
      </FormItem>;
    }
    return (
      <div className="kubeproxy-config">
        <div className="header">
        负载均衡模式（集群内网络）
        </div>
        <div className="body">
          <div className="btns">
            {this.renderBtns()}
          </div>
          <Form>
            <FormItem
              label="负载均衡模式"
              {...formItemLayout}
            >
              <Select disabled={!isEdit} {...kubeproxyModeProps} placeholder="请选择负载均衡模式">
                <Option value="ipvs">ipvs</Option>
                <Option value="iptables">iptables</Option>
              </Select>
            </FormItem>
            {schedulerFormItem}
          </Form>
          <Modal
            title="确认保存更改"
            visible={confirmModalVisible}
            onCancel={() => this.setState({ confirmModalVisible: false })}
            onOk={this.confirmUpdate}
            okText="确认保存"
            confirmLoading={this.state.confirmLoading}
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
              <span>
              网络将重启，过程大约 1min
              </span>
            </div>
            <div className="themeColor" style={{ marginBottom: '15px' }}>
              <i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}/>
              确认变更集群内网络负载均衡模式？
            </div>
          </Modal>
        </div>
      </div>
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
const KubeproxyConfigForm = Form.create()(KubeproxyConfig);

export default connect(mapStateToProps, {
  getKubeproxy: clusterActions.getKubeproxy,
  updateKubeproxy: clusterActions.updateKubeproxy,
})(KubeproxyConfigForm);
