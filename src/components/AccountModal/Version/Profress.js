/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * profress index component
 *
 * v0.1 - 2016-12-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input ,Modal} from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import "./style/Profress.less"

class VersionProfress extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentWillMount() {
    document.title = '版本 | 时速云'
  }

  render() {
    return (
      <div id = 'VersionProfress'>
      </div>
    )
  }
}

VersionProfress.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  return {
  }
}

export default connect(mapStateToProps, {
})(injectIntl(VersionProfress, {
  withRef: true,
}))