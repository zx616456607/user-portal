/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * ImageService of cluster
 *
 * 2018-07-03
 * @author rensiwei
 */

import React from 'react'
import { Button, Card, Input, Form, Row, Col } from 'antd'
import ReactEcharts from 'echarts-for-react'
import './style/ImageService.less'
import harborImg from '../../assets/img/integration/harbor.png'
import { connect } from 'react-redux'
import { setClusterHarbor, loadClusterList } from '../../actions/cluster'
import { getProjectVisibleClusters } from '../../actions/project'
import { setCurrent } from '../../actions/entities'
import { URL_REGEX } from '../../../constants/index'
import NotificationHandler from '../../components/Notification'
import filter from 'lodash/filter'
import intlMsg from './ImageServiceIntl'
import { injectIntl, FormattedMessage } from 'react-intl'

const notify = new NotificationHandler()

class ImageService extends React.Component {
  state = {
    loading: false,
    isEdit: false,
    readonly: false,
    value: this.props.cluster.harbor ? this.props.cluster.harbor[0] || "" : "",
    lastValue: this.props.cluster.harbor ? this.props.cluster.harbor[0] || "" : "",
  }
  onEditClick = isEdit => {
    const { value, lastValue } = this.state
    this.setState({
      isEdit,
      value: isEdit ? value : lastValue,
    }, () => {
      const { form: { setFieldsValue } } = this.props
      setFieldsValue({ url: isEdit ? value : lastValue })
    })
  }
  onSubmitClick = () => {
    const { form: { validateFields }, setClusterHarbor, cluster, currClusterID,
    loadClusterList, setCurrent, projectName, getProjectVisibleClusters, intl: { formatMessage } } = this.props
    let clusterID = typeof cluster === 'string' ? cluster : cluster.clusterID

    validateFields(['url'], (error, values) => {
      if(error) return
      this.setState({
        loading: true,
        readonly: true,
      }, () => {
        setClusterHarbor(clusterID, {
          url: values.url,
        }, {
          success: {
            func: (res) => {
              // succ
              notify.success(formatMessage(intlMsg.editImageServiceSuccess))
              this.setState({
                isEdit: false,
                readonly: false,
                lastValue: values.url,
              })
              loadClusterList({size: 100}, {
                success: {
                  func: res => {
                    if(currClusterID === clusterID){
                      setCurrent({ cluster: filter(res.data, { clusterID })[0] || cluster })
                    }
                    getProjectVisibleClusters(projectName)
                  },
                  isAsync: true,
                }
              })
            },
            isAsync: true,
          },
          failed: {
            func: (err) => {
              notify.warn(formatMessage(intlMsg.imageServiceAddressUnavailable))
              this.setState({
                readonly: false,
              })
            }
          },
          finally: {
            func: () => {
              this.setState({
                loading: false,
              })
            }
          }
        })
      })
    })
  }
  onChange = e => {
    const value = e.target.value
    this.setState({
      value,
    })
    const { form: { setFieldsValue } } = this.props
    setFieldsValue({ url: value })
  }
  render() {
    const { form, cluster, intl: { formatMessage } } = this.props
    const { getFieldProps } = form
    const {
      isEdit,
      loading,
      readonly,
      value,
    } = this.state
    const cardTitle = <div className="title" id={'imageServiceIdForAnchor'}>
      <FormattedMessage {...intlMsg.imageService}/>
      <span className="hint"><span className="required">*</span><FormattedMessage {...intlMsg.clusterShouldHasHarbor}/></span>
    </div>
    return <Card title={cardTitle} className="image_service">
      <div className="imgBox">
        <img src={harborImg}/>
      </div>
      <Form className="harborConfig">
        <Row className="harborTips">
          <span><FormattedMessage {...intlMsg.configHarborAddress}/></span>
          <span className={'tips'}><FormattedMessage {...intlMsg.harborAddressUseFor}/></span>
        </Row>
        <Row>
          <Col span={7}>
            <Form.Item>
              <Input readOnly={readonly} {...getFieldProps('url',{
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (!value) {
                        return callback([new Error(formatMessage(intlMsg.plsConfigImageService))])
                      }
                      if (!URL_REGEX.test(value)) {
                        return callback([new Error(formatMessage(intlMsg.plsInputRightIp))])
                      }
                      callback()
                    }
                  }
                  ],
                  initialValue: value,
                })} onChange={this.onChange} disabled={!isEdit} placeholder={formatMessage(intlMsg.configImageService)} />
            </Form.Item>
          </Col>
          <Col span={12}>
            {
              !isEdit?
                <Button className="btn" onClick={() => this.onEditClick(true)}><FormattedMessage {...intlMsg.edit}/></Button>
                :
                [
                  <Button className="btn" onClick={() => this.onEditClick(false)}><FormattedMessage {...intlMsg.cancel}/></Button>
                  ,
                  <Button className="btn" loading={loading} type="primary" onClick={this.onSubmitClick}><FormattedMessage {...intlMsg.save}/></Button>
                ]
            }
          </Col>
        </Row>
      </Form>
    </Card>
  }
}

function mapStateToProps(state, props) {
  const { projectName } = state.entities.current.space
  const { clusterID } = state.entities.current.cluster
  return {
    projectName,
    currClusterID: clusterID,
  }
}

export default connect(mapStateToProps,  {
  setClusterHarbor,
  loadClusterList,
  setCurrent,
  getProjectVisibleClusters,
})(Form.create()(injectIntl(ImageService, {
  withRef: true,
})))
