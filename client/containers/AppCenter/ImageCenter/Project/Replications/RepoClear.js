/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/* RepoClear(tab) for RepoManager
 *
 * v0.1 - 2018-11-26
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import RepoVolumes from './RepoVolumes'
import { genRandomString } from '../../../../../../src/common/tools'
import { Button, Modal, Tooltip, Icon } from 'antd';
import './style/repoClear.less'

class RepoClear extends React.Component {
  state = {
    clearVisible: false,
    copySuccess: false,
    inputId: `addClusterOrNodeCMDInput${genRandomString('0123456789', 4)}`,
  }

  toggleClearVisible = () => {
    this.setState({
      clearVisible: !this.state.clearVisible,
    })
  }

  copyCommand = () => {
    const code = document.getElementById(this.state.inputId)
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copySuccess: true,
    })
  }

  render() {
    const { clearVisible, copySuccess, inputId } = this.state
    const isReadOnly = false
    const CMD = 'docker exec registry registry garbage-collect /etc/registry/config.yml'
    return <div className="repoClear">
      <Modal
        title="仓库清理"
        className="repoClearModal"
        visible={clearVisible}
        onOk={this.toggleClearVisible}
        onCancel={this.toggleClearVisible}
      >
        <div>
          <p>请镜像仓库管理员在 Harbor 所在机器操作以下命令进行 GC：</p>
          <div className="alertRow">
            <p>
              {CMD}&nbsp;&nbsp;
              <Tooltip
                title={copySuccess ? '复制成功' : '点击复制'}>
                <a
                  onClick={this.copyCommand}
                  onMouseLeave={
                    () => setTimeout(() => this.setState({ copySuccess: false }), 500)
                  }
                >
                  <Icon type="copy" />
                </a>
              </Tooltip>
              <input
                id={inputId}
                style={{ position: 'absolute', opacity: 0, top: 0 }}
                value={CMD}
              />
            </p>
          </div>
          <p>注意：操作完成之后，存储容量可能会发生变化，可以观察清理效果</p>
        </div>
      </Modal>

      <div className="opeatorBtn">
        <Button
          size="large"
          type="ghost"
          disabled={isReadOnly}
          onClick={this.toggleClearVisible}
        >
          清理仓库
        </Button>
      </div>
      <RepoVolumes />
    </div>
  }
}

const mapStateToProps = () => ({
})

export default connect(mapStateToProps, {
})(RepoClear)
