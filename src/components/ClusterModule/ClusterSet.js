/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * ClusterSet.js page
 *
 * @author zhangtao
 * @date Tuesday November 13th 2018
 */
import * as React from 'react'
import ContainerSecurityPolicy from './ContainerSecurityPolicy'
import ImageService from './ImageService'

export default class ClusterSet extends React.Component {
  render() {
    return( <div>
         <ContainerSecurityPolicy cluster={this.props.cluster}/>
         <ImageService cluster={this.props.cluster}/>
    </div>)
  }
}