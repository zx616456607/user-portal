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
import { Button, Input, Card, Alert } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import './style/TenxFlowDetailYaml.less'
import { browserHistory } from 'react-router';
import YamlEditor from '../../../Editor/Yaml'

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
    const { scope, yaml } = this.props;
    return (
    <div id='TenxFlowDetailYaml' key='TenxFlowDetailYaml'>
      <Alert type='info' message={<FormattedMessage {...menusText.tooltips} />} />
      <Card className='yamlCard'>
        <YamlEditor value={yaml} parentId={'TenxFlowDetail'}/>
      </Card>
    </div>
    )
  }
});

function mapStateToProps(state, props) {
  
  return {
    
  }
}

TenxFlowDetailYaml.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  
})(injectIntl(TenxFlowDetailYaml, {
  withRef: true,
}));

