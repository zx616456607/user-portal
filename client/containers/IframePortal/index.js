/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * Iframe Portal
 *
 * v1.0 - 2019-02-21
 * @author zhangpc
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Spin } from 'antd'
import { browserHistory } from 'react-router'
import * as openApiActions from '../../../src/actions/open_api'
import './style/index.less'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { toQuerystring } from '../../../src/common/tools'
import { HEADER_HEIGHT } from '../../../src/constants'

// replace hash when build, for clear cache
const hash = process.env.IFRAME_PORTAL_HASH

class IframePortal extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    iframe: PropTypes.shape({
      id: PropTypes.string.isRequired,
      src: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired,
  }

  state = {
    windowHeight: window.innerHeight,
    pathname: this.props.location.pathname,
    query: this.props.location.query,
  }

  componentDidMount() {
    window.iframeCallBack = (action, data) => {
      switch (action) {
        case 'redirect':
          browserHistory.push(data.pathname)
          break
        case 'history':
          this.iframeHistory = data
          window.iframeHistory = this.iframeHistory
          break
        case 'getParentHistory':
          return browserHistory
        default:
          break
      }
    }
    window.addEventListener('resize', this.handleWindowResize)
    const { loadApiInfo } = this.props
    loadApiInfo()
  }

  componentWillReceiveProps(newProps) {
    const { pathname: newPathname, search: newSearch, hash: newHash } = newProps.location
    const { pathname: oldPathname, search: oldSearch, hash: oldHash } = this.props.location
    const newUrl = newPathname + newSearch + newHash
    const oldUrl = oldPathname + oldSearch + oldHash
    if (newUrl !== oldUrl) {
      this.iframeHistory && this.iframeHistory.replace(newUrl)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize)
  }

  handleWindowResize = () => {
    this.setState({
      windowHeight: window.innerHeight,
    })
  }

  render() {
    const {
      project, token, cluster, watchToken,
      username, iframe: { id, title, src, queryConfig = {} },
    } = this.props

    if (!token) {
      return <div className="loading">
        <Spin size="large" />
      </div>
    }
    const { windowHeight, pathname, query: initQuery } = this.state
    const query = {
      ...initQuery,
      token, username, project, cluster, watchToken, ...queryConfig,
    }
    const style = {
      height: windowHeight - HEADER_HEIGHT,
    }

    return <div className="iframe-portal" style={style}>
      <div
        className="iframe-portal-wrapper"
      >
        <iframe
          allowFullScreen
          id={id}
          title={title}
          src={`${src}?hash=${hash}#${pathname}?${toQuerystring(query)}`}
        />
      </div>
    </div>
  }
}

const mapStateToProps = state => {
  const { space = {}, cluster = {} } = state.entities.current
  const { username, token } = state.openApi.result || {}

  return {
    project: space.namespace,
    cluster: cluster.clusterID,
    username,
    token,
    watchToken: encodeURIComponent(
      getDeepValue(state, [ 'entities', 'loginUser', 'info', 'watchToken' ])
    ),
  }
}

export default connect(mapStateToProps, {
  loadApiInfo: openApiActions.loadApiInfo,
})(IframePortal)
