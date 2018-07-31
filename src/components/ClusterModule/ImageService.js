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
import { setClusterHarbor } from '../../actions/cluster'
import { URL_REGEX } from '../../../constants/index'
import NotificationHandler from '../../components/Notification'

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
    const { form: { validateFields }, setClusterHarbor, cluster: { clusterID } } = this.props

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
              notify.success("编辑镜像服务地址成功")
              this.setState({
                isEdit: false,
                readonly: false,
                lastValue: values.url,
              })
            }
          },
          failed: {
            func: (err) => {
              notify.warn('镜像服务地址不可用')
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
    const { form, cluster } = this.props
    const { getFieldProps } = form
    const {
      isEdit,
      loading,
      readonly,
      value,
    } = this.state
    const cardTitle = <div className="title">
      镜像服务
      <span className="hint"><span className="required">*</span>集群必须配置harbor</span>
    </div>
    return <Card title={cardTitle} className="image_service">
      <div className="imgBox">
        <img src={harborImg}/>
      </div>
      <Form className="harborConfig">
        <Row className="harborTips">
          <span>配置harbor地址</span>
          <span className={'tips'}>管理集群 Docker 镜像，用于镜像仓库、流水线镜像发布等功能，可以使用默认harbor，也可以配置其它harbor</span>
        </Row>
        <Row>
          <Col span={7}>
            <Form.Item>
              <Input readOnly={readonly} {...getFieldProps('url',{
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (!value) {
                        return callback([new Error('请配置镜像服务')])
                      }
                      if (!URL_REGEX.test(value)) {
                        return callback([new Error('请输入正确的IP地址')])
                      }
                      callback()
                    }
                  }
                  ],
                  initialValue: value,
                })} onChange={this.onChange} disabled={!isEdit} placeholder="配置镜像服务" />
            </Form.Item>
          </Col>
          <Col span={12}>
            {
              !isEdit?
                <Button className="btn" onClick={() => this.onEditClick(true)}>编辑</Button>
                :
                [
                  <Button className="btn" onClick={() => this.onEditClick(false)}>取消</Button>
                  ,
                  <Button className="btn" loading={loading} type="primary" onClick={this.onSubmitClick}>保存</Button>
                ]
            }
          </Col>
        </Row>
      </Form>
    </Card>
  }
}

const mapStateToProps = () => ({})

export default connect(mapStateToProps,  {
  setClusterHarbor,
})(Form.create()(ImageService))
