/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * version index component
 *
 * v0.1 - 2016-12-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input ,Modal} from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import VersionNoraml from './Normal.js'
import VersionProfress from './Profress.js'
import UpgradeModal from './UpgradeModal.js'
import "./style/Version.less"

class Version extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalShow: true
    }
  }

  componentWillMount() {
    document.title = '版本 | 时速云'
  }

  render() {
    let version = 'profress';
    return (
      <div id = 'Version'>
        {
          version == 'normal' ? [
            <VersionNoraml key='VersionNoraml' />
          ] : [
            <VersionProfress key='VersionProfress' />
          ]
        }
        <UpgradeModal currentType={'app'} modalShow={this.state.modalShow} />
      </div>
    )
  }
}

Version.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  return {
  }
}

export default connect(mapStateToProps, {
})(injectIntl(Version, {
  withRef: true,
}))