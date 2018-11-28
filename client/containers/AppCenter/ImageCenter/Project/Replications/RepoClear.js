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

class RepoClear extends React.Component {

  render() {
    return <div>
      <RepoVolumes />
    </div>
  }
}

const mapStateToProps = () => ({
})

export default connect(mapStateToProps, {
})(RepoClear)
