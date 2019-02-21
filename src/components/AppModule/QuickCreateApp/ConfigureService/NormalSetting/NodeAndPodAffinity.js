/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: normal configure for nodeScheduler ( NodeAffinity + PodAffinity )
 *
 * v0.1 - 2018-05-06
 * @author lvjunfeng
 */
import React, { PropTypes, Component } from 'react'
import { Row, Col, Form, InputNumber, Tooltip, Icon, Switch, Select, Radio, Tag,
     Button, Input, Checkbox, Collapse } from 'antd'
import Notification from '../../../../../components/Notification'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import { KubernetesValidator } from '../../../../../common/naming_validation'
import * as nodeActions from '../../../../../actions/cluster_node'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
const FormItem = Form.Item
const Panel = Collapse.Panel
const RadioGroup = Radio.Group
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'
import { connect } from 'react-redux'

class NodeAffinity extends Component {
  constructor(props) {
    super(props)
    this.handleChangeServiceKeyShowValue = this.handleChangeServiceKeyShowValue.bind(this)
    this.handleChangeServiceContent = this.handleChangeServiceContent.bind(this)
    this.changeServiceSelectShow = this.changeServiceSelectShow.bind(this)
    this.showSelectServiceNodeValue = this.showSelectServiceNodeValue.bind(this)
    this.handleChangeMoreSelect = this.handleChangeMoreSelect.bind(this)
    this.handleAddLabel = this.handleAddLabel.bind(this)
    this.formTagContainer = this.formTagContainer.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.state = {
      showService: 'single',
      showNodeValue: '',
    }
  }

  componentDidMount() {
    const { getClusterLabel, clusterID } = this.props
    getClusterLabel(clusterID)
  }

  handleChangeServiceKeyShowValue(value) {
    const { form } = this.props
    const { setFieldsValue, resetFields } = form
    setFieldsValue({serverKey: value})
    this.setState({
      showNodeValue: value
    })
    resetFields(['serverTagKey'])
  }

  handleChangeServiceContent(value) {
    const { form } = this.props
    const { setFieldsValue, resetFields } = form
    setFieldsValue({serverMark: value})
    resetFields(['serverTagKey'])
    switch (value) {
      case 'In':
      case 'NotIn':
        return this.setState({
          showService: 'more'
        })
      case 'Gt':
      case 'Lt':
        return this.setState({
          showService: 'single'
        })
      case 'Exists':
      case 'DoesNotExist':
        return this.setState({
          showService: 'no'
        })
    }
  }

  changeServiceSelectShow() {
    const { showService } = this.state
    const { form, intl } = this.props
    const { getFieldProps } = form
    switch (showService) {
      case 'single':
        return <FormItem id="select" wrapperCol={{ span: 2 }}>
        <Select id="select" size="large"
            style={{ width: 120 }}
            placeholder = {intl.formatMessage(IntlMessage.hostTagValue)}
          {...getFieldProps('serverTagKey',{
            rules: [
              {
                required: true,
                message: `${intl.formatMessage(IntlMessage.requiredInfo)}`
              }
            ]
          })}
        >
        {
          this.props.allTag.length>0?
          this.showSelectServiceNodeValue()
          :null
        }
        </Select>
      </FormItem>
      case 'more':
        return <FormItem id="select" wrapperCol={{ span: 2 }}>
          <Select
            multiple
            style={{ width: 260 ,height:30 }}
            placeholder = {intl.formatMessage(IntlMessage.hostTagValue)}
            {...getFieldProps('serverTagKey',{
              rules: [
                {
                  required: true,
                  message: `${intl.formatMessage(IntlMessage.requiredInfo)}`
                }
              ]
            })}
            onChange={this.handleChangeMoreSelect}
          >
            {
              this.props.allTag.length>0?
              this.showSelectServiceNodeValue()
              :null
            }
          </Select>
        </FormItem>
      case 'no':
        return null
      default:
        return null
    }
  }

  //  key select content
  showSelectServiceNodeValue() {
    const { showNodeValue } = this.state
    const { form, allTag} = this.props
    const { setFieldsValue } = form
    const options = []
    allTag.map( item=>{
      if (item.hasOwnProperty(showNodeValue)) {
        item[showNodeValue].map( ele=>{
          options.push(<Select.Option value={ele} key={item.index + ele}>{ele}</Select.Option>)
        })
      }
    })
    return options
  }

  // more onchange
  handleChangeMoreSelect(value) {
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({serverTagKey: value})
  }

  handleAddLabel() {
    const { fields, form, intl } = this.props
    const { validateFields, setFieldsValue, getFieldProps, resetFields, getFieldsValue } = form
    const  notificat = new Notification()
    let serviceTag = []
    if (fields.serviceTag && fields.serviceTag.value && fields.serviceTag.value.length>0) {
      serviceTag = fields.serviceTag.value
    }
    let cloneTag = cloneDeep(serviceTag)
    let flag = true
    let fieldsArr = []
    let resetArr = []
    const mark = getFieldsValue(['serverMark'])
    if (mark.serverMark=='Exists' || mark.serverMark=='DoesNotExist') {
      fieldsArr = ['serverKey','serverPoint','serverMark']
    }else {
      fieldsArr = ['serverKey','serverPoint','serverTagKey','serverMark']
    }
    validateFields( fieldsArr,(errors, values) => {
      if (errors) {
        return
      }
      let newlabel = {}
      if ( values.serverMark == 'Exists' ||  values.serverMark=='DoesNotExist'  ) {
        newlabel = {
          key: values.serverKey,
          mark: values.serverMark,
          point: values.serverPoint,
        }
      }else if (values.serverMark=='In' ||  values.serverMark=='NotIn') {
        let str = ''
        values.serverTagKey.map( item=>{
          str += item +','
        })
        str = str.substr(0, str.length-1);
        newlabel = {
          key: values.serverKey,
          value: str,
          mark: values.serverMark,
          point: values.serverPoint,
        }
      }else{
        newlabel = {
          key: values.serverKey,
          value: values.serverTagKey,
          mark: values.serverMark,
          point: values.serverPoint,
        }
      }
      if (!cloneTag.length) {
        cloneTag.push(newlabel)
      }else if (cloneTag.length) {
        cloneTag.map( item => {
          if (isEqual(item, newlabel)) {
            flag = false
            notificat.info(intl.formatMessage(IntlMessage.added))
          }
        })
        if (flag) {
          cloneTag.push(newlabel)
        }
      }
      this.props.parentsForm.setFieldsValue({
        serviceTag: cloneTag
      })
      resetFields()
    })
  }

  formTagContainer(){
    const { fields } = this.props
    let serviceTag = []
    if (fields.serviceTag && fields.serviceTag.value) {
      serviceTag = fields.serviceTag.value
    }
    const arr = serviceTag.map((_item, index) => {
      const item = cloneDeep(_item)
      if ( item.point === '必须' ) {
        item.color = "#2db7f5"
        item.class = 'tag-font-white'
      }else if (item.point === '最好') {
        item.color = '#f3fbfe'
        item.class = "tag-font-blue"
      }
      return (
        <Tag
          closable
          onClose={() => this.handleClose(item)}
          className={ item.class }
          color={item.color}
          key={item.point + item.key + item.mark + item.value}
        >
          <span>{item.point}</span>
          <span> | </span>
          <span>{item.key} </span>
          {item.mark== 'Gt' ? '>' :null}
          {item.mark== 'Lt' ? '<' :null}
          {item.mark!= 'Gt' && item.mark!= 'Lt'? <span> {item.mark} </span> :null}
          {
            item.value ?
            <span> {item.value} </span>
            : null
          }
        </Tag>
      )
    })
    return arr
  }

  handleClose(item) {
    const { form, fields, serviceTag } = this.props
    const { setFieldsValue } = form
    const tag = cloneDeep(serviceTag)
    tag.map( (ele,index)=>{
      if( ele.key == item.key
          && ele.value == item.value
          && ele.point == item.point
          && ele.mark == item.mark){
        tag.splice(index, 1)
        this.props.parentsForm.setFieldsValue({
          serviceTag: tag
        })
      }
    })
  }

  render() {
    const { form, serviceTag, intl } = this.props
    const { getFieldProps } = form
    return <div>
      <div className="serverAndPoint">
        <div className="serverAnd">
          <FormItem
          id="select"
          label={intl.formatMessage(IntlMessage.currentService)}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 2 }}
          >
            <Select id="select" size="large" style={{ width: 80 }}
              {...getFieldProps('serverPoint',{
                rules: [
                  {
                    required: true,
                    message: `${intl.formatMessage(IntlMessage.requiredInfo)}`
                  }
                ],
                initialValue: '最好',
              })} >
              <Select.Option value="最好" key="maybe">
                {intl.formatMessage(IntlMessage.theBest)}
              </Select.Option>
              <Select.Option value="必须" key="must">
                {intl.formatMessage(IntlMessage.must)}
              </Select.Option>
            </Select>
          </FormItem>
            <span className="serverText"> {intl.formatMessage(IntlMessage.schedulingToHost)}（ </span>
          <FormItem
            className="nodeSelect"
            wrapperCol={{ span: 2 }}
          >
            <Select id="select" size="large" style={{ width: 200 }}
              placeholder = {intl.formatMessage(IntlMessage.hostLabelKey)}
              {...getFieldProps('serverKey',{
                rules: [
                  {
                    required: true,
                    message: `${intl.formatMessage(IntlMessage.requiredInfo)}`
                  }
                ],
              })}
              onChange={this.handleChangeServiceKeyShowValue}
            >
            {
              this.props.allTag.length >0 ?
              this.props.allTag.map( (item,index)=>{
                const itemKey = Object.keys(item)[0]
                return <Select.Option value={itemKey} key={item.index + itemKey}>{itemKey}</Select.Option>
              })
              : null
            }
            </Select>
          </FormItem>
          <FormItem
            id="select"
            wrapperCol={{ span: 2 }}
          >
            <Select id="select" size="large" placeholder={intl.formatMessage(IntlMessage.operator)} style={{ width: 120 }}
              {...getFieldProps('serverMark',{
                rules: [
                  {
                    required: true,
                    message: `${intl.formatMessage(IntlMessage.requiredInfo)}`
                  }
                ]
              })}
              onChange={this.handleChangeServiceContent}
            >
              <Select.Option value="In" key="in">In</Select.Option>
              <Select.Option value="NotIn" key="not">NotIn</Select.Option>
              <Select.Option value="Gt" key="big"> > </Select.Option>
              <Select.Option value="Lt" key="small">	&lt;</Select.Option>
              <Select.Option value="Exists" key="exists">	Exists </Select.Option>
              <Select.Option value="DoesNotExist" key="does">	DoesNotExist </Select.Option>
            </Select>
          </FormItem>
          {
            this.changeServiceSelectShow()
          }
          <span> ） </span>
          <Button type="primary" onClick = { this.handleAddLabel } className="handleBtn" >
            {intl.formatMessage(IntlMessage.add)}
            </Button>
        </div>
        <div className='pointTag'>
          {
            !isEmpty(serviceTag) &&
            <Form.Item >
              { this.formTagContainer() }
            </Form.Item>
          }
        </div>
      </div>
    </div>
  }
}

const mapStateToProps = ({
  entities: { current: { cluster: { clusterID } } },
  cluster_nodes: { clusterLabel }
}) => {
  const summary = getDeepValue(clusterLabel, [ clusterID, 'result', 'summary' ]) || []
  const labels = summary.filter(label => label.targets && label.targets.length && label.targets.length > 0)
  let tagArg = {}
  labels.forEach(item => {
    if (tagArg.hasOwnProperty(item.key)) {
      tagArg[item.key].push(item.value)
      tagArg[item.key] = Array.from(new Set(tagArg[item.key]))
    } else {
      tagArg[item.key] = []
      tagArg[item.key].push(item.value)
    }
  })
  const allTag = []
  for (let key in tagArg) {
    allTag.push({
      [key]: tagArg[key]
    })
  }
  return {
    clusterID,
    allTag,
  }
}

NodeAffinity = connect(mapStateToProps, {
  getClusterLabel: nodeActions.getClusterLabel,
})(
  Form.create({})(injectIntl(NodeAffinity, {
    withRef: true,
  }))
)

class PodAffinity extends Component {
  constructor(props) {
    super(props)
    this.handleChangeServicerBetweenContent = this.handleChangeServicerBetweenContent.bind(this)
    this.changeServiceBetweenSelectShow = this.changeServiceBetweenSelectShow.bind(this)

    this.handleAddBottomLabel = this.handleAddBottomLabel.bind(this)
    this.formTagBottomContainer = this.formTagBottomContainer.bind(this)
    this.handleBottomClose = this.handleBottomClose.bind(this)
    this.handleAdvance = this.handleAdvance.bind(this)
    this.state = {
      showServiceBetween: 'single',
    }
  }

  handleChangeServicerBetweenContent(value) {
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({serverBottomMark: value})
    switch (value) {
      case 'In':
      case 'NotIn':
        return this.setState({
          showServiceBetween: 'single'
        })
      case 'Exists':
      case 'DoesNotExist':
        return this.setState({
          showServiceBetween: 'no'
        })
    }
  }
  checkServiceValue = (rule, value, callback) => {
    const { intl } = this.props
    if (!Boolean(value)){
      callback(new Error(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.serviceTagValue),
        end: '',
      })))
      return
    }
    const last = value.substr(value.length-1)
    if ( last === ',' ) {
      value = value.substr(0,value.length-1)
    }
    const everyVal = value.split(',')
    const Kubernetes = new KubernetesValidator()
    everyVal.map( item=>{
      if (item.length < 3 || item.length > 63) {
        callback(new Error(intl.formatMessage(IntlMessage.labelValueLengthLimit)))
        return
      }
      if (Kubernetes.IsQualifiedName(item).length >0) {
        callback(new Error(intl.formatMessage(IntlMessage.labelValueRegMessage)))
        return
      }
    })
    callback()
  }
  changeServiceBetweenSelectShow() {
    const { showServiceBetween } = this.state
    const { form, intl } = this.props
    const { getFieldProps } = form
    switch (showServiceBetween) {
      case 'single':
        return <FormItem
          className="serverInput"
          wrapperCol={{ span: 14 }}
        >
          <Input
            id="control-input"
            placeholder={intl.formatMessage(IntlMessage.serviceLabelValuePlaceholder)}
            style={{ width: 155 }}
            {...getFieldProps('serverBottomValue',{
              rules: [
                {
                  required: true,
                  message: `${intl.formatMessage(IntlMessage.requiredInfo)}`
                },{
                  validator: this.checkServiceValue
                }
              ]
            })}
          />
        </FormItem>
      case 'no':
        return null
    }
  }

  handleAddBottomLabel() {
    const { fields, form, intl } = this.props
    const { validateFields, setFieldsValue, resetFields, getFieldsValue, } = form
    const  notificat = new Notification()
    let serviceBottomTag = []
    if (fields.serviceBottomTag && fields.serviceBottomTag.value && fields.serviceBottomTag.value.length>0) {
      serviceBottomTag = fields.serviceBottomTag.value
    }
    let cloneTag = cloneDeep(serviceBottomTag)
    let flag = true
    let fieldsArr = []
    let resetArr = []
    const mark = getFieldsValue(['serverBottomMark'])
    if (mark.serverBottomMark=='Exists' || mark.serverBottomMark=='DoesNotExist') {
      fieldsArr = ['serverBottomKey','serverBottomMark','serverBottomPoint']
    }else {
      fieldsArr = ['serverBottomKey','serverBottomValue','serverBottomMark','serverBottomPoint']
    }
    validateFields( fieldsArr ,(errors,values)=>{
      if (errors) {
        return
      }
      let newlabel = {}
      if (values.serverBottomMark == 'Exists' ||  values.serverBottomMark== 'DoesNotExist') {
        newlabel = {
          key: values.serverBottomKey,
          mark: values.serverBottomMark,
          point: values.serverBottomPoint,
        }
      }else{
        newlabel = {
          key: values.serverBottomKey,
          value: values.serverBottomValue,
          mark: values.serverBottomMark,
          point: values.serverBottomPoint,
        }
      }
      if (!cloneTag.length) {
        cloneTag.push(newlabel)
      }else if (cloneTag.length) {
        cloneTag.map( item => {
          if (isEqual(item, newlabel)) {
            flag = false
            notificat.info(intl.formatMessage(IntlMessage.added))
          }
        })
        if (flag) {
          cloneTag.push(newlabel)
        }
      }
      this.props.parentsForm.setFieldsValue({
        serviceBottomTag: cloneTag
      })
      resetFields()
    })
  }

  formTagBottomContainer(){
    const { fields } = this.props
    let serviceBottomTag = []
    if (fields.serviceBottomTag && fields.serviceBottomTag.value) {
      serviceBottomTag = fields.serviceBottomTag.value
    }
    const cloneLabel = cloneDeep(serviceBottomTag)
    const arr = cloneLabel.map((item, index) => {
      if ( item.point === '必须' ) {
        item.color = "#2db7f5"
        item.class = 'tag-font-white'
      }else if (item.point === '最好') {
        item.color = '#f3fbfe'
        item.class = "tag-font-blue"
      }else if (item.point === '必须不') {
        item.color = '#f85a59'
        item.class = "tag-font-white"
      }else if (item.point === '最好不') {
        item.color = '#fef2f2'
        item.class = "tag-font-orign"
      }
      return (
        <Tag
          closable
          onClose={() => this.handleBottomClose(item)}
          className = { item.class }
          color={item.color}
          key={item.point + item.key + item.mark + item.value}
        >
          <span> {item.point} </span>
          <span> | </span>
          <span> {item.key} </span>
          <span> {item.mark} </span>
          {
           item.value ?
           <span> {item.value} </span>
           : null
          }
        </Tag>
      )
    })
    return arr
  }

  handleBottomClose(item){
    const { form, fields, serviceBottomTag } = this.props
    const { setFieldsValue } = form
    const tag = cloneDeep(serviceBottomTag)
    tag.map( (ele,index)=>{
      if( ele.key == item.key
          && ele.value == item.value
          && ele.point == item.point
          && ele.mark == item.mark) {
        tag.splice(index, 1)
        this.props.parentsForm.setFieldsValue({
          serviceBottomTag: tag
        })
      }
    })
  }
  checkServiceKey = (rule, value, callback) => {
    const { intl } = this.props
    if (!Boolean(value)){
      callback(new Error(intl.formatMessage(IntlMessage.pleaseEnter, {
        item: intl.formatMessage(IntlMessage.serviceLabelKey),
        end: '',
      })))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 63) {
      callback(new Error(intl.formatMessage(IntlMessage.labelKeyLengthLimit)))
      return
    }
    if (Kubernetes.IsQualifiedName(value).length >0) {
      callback(new Error(intl.formatMessage(IntlMessage.labelKeyRegMessage)))
      return
    }
    callback()
  }
  handleAdvance(e) {
    const { setFieldsValue } = this.props.parentsForm
    setFieldsValue({
      advanceSet: e.target.checked
    })
    return e
  }
  render() {
    const { form, serviceBottomTag, intl } = this.props
    const { getFieldProps } = form
    return <div>
      <div className="serverAndServer">
        <div className="serverAnd">
        <FormItem
        id="select"
        label={intl.formatMessage(IntlMessage.currentService)}
        className="serverLabel"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 2 }}
        >
          <Select id="select" size="large" style={{ width: 80 }}
            {...getFieldProps('serverBottomPoint',{
              rules: [
                {
                  required: true,
                  message: `${intl.formatMessage(IntlMessage.requiredInfo)}`
                }
              ],
              initialValue: '最好',
            })}
          >
            <Select.Option value="最好" key="maybedo">
              {intl.formatMessage(IntlMessage.theBest)}
            </Select.Option>
            <Select.Option value="最好不" key="donotmust">
              {intl.formatMessage(IntlMessage.bestNot)}
            </Select.Option>
            <Select.Option value="必须" key="maybedo">
              {intl.formatMessage(IntlMessage.must)}
            </Select.Option>
            <Select.Option value="必须不" key="mustnot">
              {intl.formatMessage(IntlMessage.mustNot)}
            </Select.Option>
          </Select>
        </FormItem>
          <span className="serverText"> {intl.formatMessage(IntlMessage.withService)}（  </span>
          <FormItem
              id="control-input"
              wrapperCol={{ span: 14 }}
            >
              <Input id="control-input" placeholder={intl.formatMessage(IntlMessage.serviceLabelKey)} style={{ width: 120 }}
                {...getFieldProps('serverBottomKey',{
                  rules: [
                    {
                      required: true,
                      message: `${intl.formatMessage(IntlMessage.requiredInfo)}`
                    },{
                      validator: this.checkServiceKey
                    }
                  ]
                })}
              />
            </FormItem>
        <FormItem
          id="select"
          wrapperCol={{ span: 2 }}
        >
          <Select id="select" size="large" style={{ width: 120 }}
              placeholder = {intl.formatMessage(IntlMessage.operator)}
            {...getFieldProps('serverBottomMark',{
              rules: [
                {
                  required: true,
                  message: `${intl.formatMessage(IntlMessage.requiredInfo)}`
                }
              ]
            })}
            onChange={this.handleChangeServicerBetweenContent}
          >
            <Select.Option value="In" key="in">In</Select.Option>
            <Select.Option value="NotIn" key="not">notin</Select.Option>
            <Select.Option value="Exists" key="exists">	exists </Select.Option>
            <Select.Option value="DoesNotExist" key="does">	DoesNotExist </Select.Option>
          </Select>
        </FormItem>
        {
          this.changeServiceBetweenSelectShow()
        }
        <span className="serverText">)</span>
        <span className="serverText"> {intl.formatMessage(IntlMessage.sameTopologyDomain)}</span>
        <span className="serverText"> ({intl.formatMessage(IntlMessage.sameHostLabelKey)}) </span>
        <Button type="primary"  onClick = { this.handleAddBottomLabel } className="handleBtn">
          {intl.formatMessage(IntlMessage.add)}
        </Button>
        </div>
        <div className="serverTag">
          {
          !isEmpty(serviceBottomTag) &&
          <Form.Item >
            { this.formTagBottomContainer() }
          </Form.Item>
          }
        </div>
        <FormItem>
        <Checkbox
          {...getFieldProps('agreement', {
            initialValue: false,
            valuePropName: 'checked',
            onChange: this.handleAdvance
          })}
          >
          {intl.formatMessage(IntlMessage.advancedSettings)}：{intl.formatMessage(IntlMessage.affinityAdvancedSettingsTip)}
        </Checkbox>
      </FormItem>
      </div>
    </div>
  }
}
PodAffinity = Form.create({})(injectIntl(PodAffinity, {
  withRef: true,
}));

export { NodeAffinity, PodAffinity }

