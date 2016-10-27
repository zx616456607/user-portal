/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetailYaml component
 *
 * v0.1 - 2016-10-21
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Card, Alert } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import './style/TenxFlowDetailYaml.less'
import { browserHistory } from 'react-router';

const createForm = Form.create;
const FormItem = Form.Item;

const menusText = defineMessages({
  tooltips: {
    id: 'CICD.Tenxflow.TenxFlowDetailYaml.tooltips',
    defaultMessage: '当前TenxFlow对应的，TenxFlow Yaml文件，您可以保存以使后续快速创建工作流，实现TenxFlow复用。',
  },
})

let TenxFlowDetailYaml = React.createClass({
  getInitialState: function() {
    return {
    }
  },
  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    return (
    <div id='TenxFlowDetailYaml' key='TenxFlowDetailYaml'>
      <Alert type='info' message={<FormattedMessage {...menusText.tooltips} />} />
      <Card className='yamlCard'>
        <Input disabled={true} type='textarea' autosize={{ minRows: 20, maxRows: 20 }} />
      </Card>
    </div>
    )
  }
});

function mapStateToProps(state, props) {
  
  return {
    
  }
}

TenxFlowDetailYaml = createForm()(TenxFlowDetailYaml);

TenxFlowDetailYaml.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  
})(injectIntl(TenxFlowDetailYaml, {
  withRef: true,
}));

