/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Add Cluster Or Node Modal
 *
 * v0.1 - 2017-03-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Tooltip, Icon, Spin } from 'antd'
import { genRandomString } from '../../../common/tools'
import './style/Content.less'
import intlMsg from './Intl'
import { injectIntl, FormattedMessage } from 'react-intl'

class AddClusterOrNodeModalContent extends Component {
  constructor(props) {
    super(props)
    this.copyCMD = this.copyCMD.bind(this)
    this.state = {
      copyCMDSuccess: false,
      inputId: `addClusterOrNodeCMDInput${genRandomString('0123456789', 4)}`
    }
  }

  copyCMD() {
    //this function for user click the copy btn and copy the download code
    const code = document.getElementById(this.state.inputId)
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyCMDSuccess: true,
    })
  }

  render() {
    const { CMD, bottomContent, intl: { formatMessage } } = this.props
    const { copyCMDSuccess } = this.state
    return (
      <div id="AddClusterOrNodeModalContent">
        <div style={{paddingBottom: '15px'}}>
          <FormattedMessage {...intlMsg.installDockerVersion}/>
          （<a target="_blank" href="https://docs.docker.com/engine/installation/"><FormattedMessage {...intlMsg.installDockerOnLinux}/></a>）
        </div>
        <div>
          <FormattedMessage {...intlMsg.exeCommand}/>
          <div className="alertRow">
            {CMD ? CMD : <div className="loadingBox"><Spin /></div>}&nbsp;&nbsp;
            {
              CMD &&
              [<Tooltip title={copyCMDSuccess ? formatMessage(intlMsg.copySuccess) : formatMessage(intlMsg.clickCopy)}>
                <a className={copyCMDSuccess ? "actions copyBtn" : "copyBtn"}
                  onClick={this.copyCMD}
                  onMouseLeave={() => setTimeout(() => this.setState({copyCMDSuccess: false}), 500) }>
                  <Icon type="copy" />
                </a>
              </Tooltip>,
              <input id={this.state.inputId} style={{ position: "absolute", opacity: "0", top:'0'}} value={CMD} />]
            }
          </div>
        </div>
        {bottomContent}
      </div>
    )
  }
}

AddClusterOrNodeModalContent.propTypes = {
  CMD: PropTypes.string,
  bottomContent: PropTypes.element,
}

AddClusterOrNodeModalContent.defaultProps = {
  //
}

export default injectIntl(AddClusterOrNodeModalContent, {
  withRef: true,
})
