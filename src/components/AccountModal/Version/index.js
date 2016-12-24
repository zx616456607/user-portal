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
import VersionNoraml from './Normal'
import VersionProfress from './Profress'
import "./style/Version.less"
import { loadLoginUserDetail } from '../../../actions/entities'

class Version extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalShow: false
    }
  }

  componentWillMount() {
    document.title = '版本 | 时速云'
    loadLoginUserDetail()
  }

  render() {
    const { loginUser } = this.props
    const { envEdition } = loginUser
    return (
      <div id = 'Version'>
        {
          envEdition == 0 ? [
            <VersionNoraml key='VersionNoraml' {...this.props}/>
          ] : [
            <VersionProfress key='VersionProfress' {...this.props} />
          ]
        }
      </div>
    )
  }
}

Version.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  const { loginUser } = state.entities
  return {
    loginUser: loginUser.info,
  }
}

export default connect(mapStateToProps, {
})(injectIntl(Version, {
  withRef: true,
}))