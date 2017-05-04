/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Websocket
 *
 * v0.1 - 2016-11-23
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
const PING_NUMBER = 0

class Websocket extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ws: new WebSocket(this.props.url, this.props.protocol),
      attempts: 1,
    };
  }

  logging(logline) {
    if (this.props.debug === true) {
      console.log(logline)
    }
  }

  generateInterval(k) {
    return Math.min(30, (Math.pow(2, k) - 1)) * 1000
  }

  setupWebsocket() {
    let websocket = this.state.ws
    const { url, protocol, onSetup, pingInterval, heartBeat } = this.props

    websocket.onopen = () => {
      this.logging('Websocket connected')
      this.logging(new Date())
      // Return a websocket
      onSetup(websocket)
      // Heart beats for keep connect
      if (heartBeat) {
        this.pingInterval = setInterval(() => {
          this.logging('Heart beats')
          websocket.send(PING_NUMBER)
        }, pingInterval)
      }
    }

    websocket.onmessage = (evt) => {
      // this.props.onMessage(evt.data)
      this.logging('Websocket onmessage')
      this.logging(evt.data)
    }

    websocket.onerror = err => {
      this.logging(`Websocket onerror`)
      this.logging(err)
    }

    this.shouldReconnect = this.props.reconnect

    websocket.onclose = (err) => {
      this.logging('Websocket disconnected')
      this.logging(this.shouldReconnect)
      this.logging(new Date())
      this.pingInterval && clearInterval(this.pingInterval)
      if (this.shouldReconnect) {
        let time = this.generateInterval(this.state.attempts)
        this.logging(time)
        setTimeout(() => {
          let attempts = this.state.attempts
          attempts++
          this.setState({
            ws: new WebSocket(url, protocol),
            attempts,
          })
          this.setupWebsocket()
        }, time)
      }
    }
  }

  componentDidMount() {
    this.setupWebsocket()
  }

  componentWillUnmount() {
    this.shouldReconnect = false
    let websocket = this.state.ws
    websocket.close()
    this.pingInterval && clearInterval(this.pingInterval)
  }

  render() {
    return (
      <div></div>
    )
  }
}

Websocket.propTypes = {
  url: PropTypes.string.isRequired,
  onSetup: PropTypes.func.isRequired, // Return a websocket
  debug: PropTypes.bool,
  heartBeat: PropTypes.bool,
  reconnect: PropTypes.bool,
  protocol: PropTypes.string,
  pingInterval: PropTypes.number,
}

Websocket.defaultProps = {
  debug: false,
  heartBeat: false,
  reconnect: true,
  pingInterval: 25000,
}

export default Websocket