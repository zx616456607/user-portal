/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetailSetting component
 *
 * v0.1 - 2016-10-21
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Card, Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { deleteTenxFlowSingle } from '../../../../actions/cicd_flow'
import './style/TenxFlowDetailSetting.less'
import { browserHistory } from 'react-router';

const confirm = Modal.confirm;

const menusText = defineMessages({
  tooltips: {
    id: 'CICD.Tenxflow.TenxFlowDetailSetting.tooltips',
    defaultMessage: '请注意，删除TenxFlow，将清除项目的所有历史数据以及相关的镜像，且该操作不能被恢复，您确定要删除吗？',
  },
  delete: {
    id: 'CICD.Tenxflow.TenxFlowDetailSetting.delete',
    defaultMessage: '删除该TenxFlow',
  },
  deleteConfirm: {
    id: 'CICD.Tenxflow.TenxFlowDetailSetting.deleteConfirm',
    defaultMessage: '您是否确认要删除这项内容',
  },
})

let TenxFlowDetailSetting = React.createClass ({
  getInitialState: function () {
    return {
    }
  },
  componentWillMount () {
    document.title = 'TenxFlow | 时速云';
  },
  deleteConfirm: function () {
    const { deleteTenxFlowSingle, flowId } = this.props;
    const { formatMessage } = this.props.intl;
    confirm({
      title: formatMessage(menusText.deleteConfirm),
      onOk() {
        deleteTenxFlowSingle(flowId, {
          success: {
            func: () => browserHistory.push('/ci_cd/tenx_flow'),
            isAsync: true
          }
        })
      },
      onCancel() {},
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope, flowId } = this.props;
    return (
    <Card id='TenxFlowDetailSetting' key='TenxFlowDetailSetting'>
      <p>
        <i className='fa fa-exclamation-triangle' />&nbsp;
        <FormattedMessage {...menusText.tooltips} />
      </p>
      <Button className='deleteBtn' size='large' type='ghost' onClick={this.deleteConfirm}>
        <FormattedMessage {...menusText.delete} />
      </Button>
    </Card>
    )
  }
});

function mapStateToProps(state, props) {
  
  return {
    
  }
}

TenxFlowDetailSetting.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  deleteTenxFlowSingle
})(injectIntl(TenxFlowDetailSetting, {
  withRef: true,
}));

