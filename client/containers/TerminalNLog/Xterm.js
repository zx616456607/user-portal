/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 *
 * xterm
 *
 * @author Songsz
 * @date 2018-11-12
 *
 */

import React from 'react'
import { XTerm } from '@tenx-ui/xterm'
import { WebSocket } from '@tenx-ui/webSocket'
import { b64_to_utf8, utf8_to_b64 } from './funcs'
import PropTypes from 'prop-types'

class Xterms extends React.Component {
  static propTypes = {
    setTermMsg: PropTypes.func.isRequired,
    consts: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired,
  }
  state = {
    connected: false,
  }
  componentDidMount() {
    this.wsTimeout = setTimeout(() => {
      this.props.setTermMsg(this.props.consts.timeout)
    }, 10 * 1000)
  }
  componentWillUnmount() {
    this.exitTerminal()
  }
  exitTerminal = exitMsg => {
    this.wsTimeout && clearTimeout(this.wsTimeout)
    const { consts, setTermMsg } = this.props
    const term = this.xterm.xterm
    setTermMsg(exitMsg || consts.connectStop)
    term.destroy()
    delete this.xterm
  }
  componentDidUpdate(prevProps) {
    if (prevProps.rows !== this.props.rows) {
      this.xterm.xterm.resize(this.props.cols, this.props.rows > 0 ? this.props.rows : 1)// 不能为负数
    }
  }

  onSetupSocket = ws => {
    const { user, consts, password, setTermMsg } = this.props
    setTermMsg(consts.isConnecting)
    const that = this
    const term = this.xterm.xterm
    ws.send(`3auth:${utf8_to_b64(`${user}:${password}`)}`)// cmVuc2l3ZWk6cmVuc2l3ZWk=
    ws.onmessage = message => {
      this.wsTimeout && clearTimeout(this.wsTimeout)
      const msg = b64_to_utf8(message.data)
      // 权限
      if (msg === '[403 resource permission error] This operation has no permissions') {
        this.props.setTermMsg('[403 resource permission error]')
        return
      }
      // 正常返回数据时, 不显示提示信息
      if (JSON.stringify(message.data[0]) !== '3' && encodeURI(msg) !== '%0D%0Aexit%0D%0A' && encodeURI(msg) !== '%0D%0Alogout%0D%0A') {
        setTermMsg('')
        return
      }
      // 处理服务端返回给客户端的错误信息, wiki: http://wiki.tenxcloud.com/pages/viewpage.action?pageId=13699233
      if (JSON.stringify(message.data[0]) === '3') {
        setTermMsg(message.data.substring(1))
        return
      }
      // 终端 exit
      if (encodeURI(msg) === '%0D%0Aexit%0D%0A') {
        setTermMsg(consts.connectStop)
      }
    }
    ws.addEventListener('close', () => {
      that.props.setTermMsg(that.props.consts.connectStop)
    })
    term.attach(ws)
    term.setOption('fontFamily', '"Monospace Regular", "DejaVu Sans Mono", Menlo, Monaco, Consolas, monospace')
    term.setOption('fontSize', 12)
    term.refresh(term.x, term.y)
    term.focus()
    term.on('data', function(_data) {
      if (ws && ws.readyState === 1) {
        ws.send('0' + utf8_to_b64(_data));
      }
    })
  }

  render() {
    const { url, cols, rows } = this.props
    if (!url) {
      return null
    }
    return (
      <div>
        <XTerm
          ref={xterm => (this.xterm = xterm)}
          // 只有k8s的xterm才需要使用thirdAddons, 现在只有'attach'可用
          thirdAddons={[ 'attach' ]}
          options={{
            cursorBlink: true,
            cols,
            rows: parseInt(rows) >= 0 ? parseInt(rows) : 1,
          }}
        />
        <WebSocket
          url={url}
          protocol={'base64.channel.k8s.io'}
          onSetup={this.onSetupSocket}
          reconnect={false}
        />
      </div>
    )
  }
}

export default Xterms
