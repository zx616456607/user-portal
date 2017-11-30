import React from 'react'
import ImageUpdate from '../../../ImageItem/ImageUpdate'
import { DEFAULT_REGISTRY } from '../../../../../../constants'

export default class Rules extends React.Component {
  render() {
    return <ImageUpdate registry={DEFAULT_REGISTRY}/>
  }
}
