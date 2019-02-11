/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create template: operation env
 *
 * v0.1 - 2018-03-20
 * @author Zhangpxuan
 */

import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Icon, Switch, Select, Button, Form } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import Weblogic from '../../AppCreate/WeblogicConfig';
import classNames from 'classnames';
import './style/OperationEnv.less';
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessage from '../../../../containers/Application/ServiceConfigIntl'

const FormItem = Form.Item;
const Option = Select.Option;

class OperationEnv extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      templateIndex: 0,
      configShow: true
    }
  }

  componentWillMount() {
    const { template, fileType } = this.props;
    template.every((item, index) => {
      if (item.type === fileType) {
        this.setState({
          templateIndex: index,
          version: item.version[0]
        })
        return false;
      }
      return true;
    })
  }

  handleClick = (item, index) => {
    const { currentFields, setFormFields, id, registryServer } = this.props;
    this.setState({
      templateIndex: index,
      version: item.version[0]
    })
    if (currentFields.imageUrl.value.includes(item.name)) {
      return;
    }
    // 修改应用包imageUrl
    const cloneFields = cloneDeep(currentFields);
    cloneFields.imageUrl.value = `${registryServer}/${item.name}`
    setFormFields(id, cloneFields)
  }

  renderTemplate = () => {
    const { templateIndex } = this.state;
    const { template, fileType } = this.props;
    let tempList;
    tempList = (template || []).map((item, index) => {
      let name = item.name.split('/')[1]
      return (
        <Button type="ghost" key={index} className="templateButton"
          disabled={item.type !== fileType}
          onClick={() => this.handleClick(item, index)}
        >
          <div className="template">
            <img src={`${item.imageUrl}`}/>
            {
              templateIndex === index &&
              [
                <span className="triangle" key={`triagle${index}`}/>,
                <Icon type="check" key={`icon${index}`}/>
              ]
            }
            <span className="textoverflow">
            {
              name === 'weblogic' ?
                name.replace('w', 'W').replace('l', 'L'):
                name.substring(0, 1).toUpperCase() + name.substring(1)
            }
            </span>
          </div>
          <div className="template_version">
            <FormattedMessage {...IntlMessage.theLatestVersion}/>：{item.version && item.version[0]}</div>
        </Button>
      )
    })
    return tempList;
  }

  highLevelConfig = () => {
    const { templateIndex, weblogicChecked, configShow } = this.state;
    const { form, intl } = this.props;
    if (templateIndex < 2 || !configShow) {
      return
    }
    return (
      <div className="reset_form_item_label_style weblogicBox">
        <div className="oracleBox">
          <span className="wrap_key">{intl.formatMessage(IntlMessage.connectToOracle)} </span>
          <Switch
            checked={weblogicChecked}
            onChange={(e)=> this.setState({weblogicChecked: e})}
            checkedChildren={intl.formatMessage(IntlMessage.open)}
            unCheckedChildren={intl.formatMessage(IntlMessage.close)}
          />
        </div>
        {
          weblogicChecked &&
          <Weblogic form={form}/>
        }
      </div>
    )
  }

  toggleConfig = () => {
    this.setState(prevState => {
      return {
        configShow: !prevState.configShow
      }
    })
  }
  render() {
    const { templateIndex, version, configShow } = this.state;
    const { formItemLayout, template, fileType, currentFields, intl } = this.props;
    return (
      <div className="operationEnv">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">{intl.formatMessage(IntlMessage.operatingEnv)}</span>
          </Col>
        </Row>
        <Row className="operationEnvBody">
          <Col offset={formItemLayout.labelCol.span}>
            <div className="templateBox">
              {this.renderTemplate()}
            </div>
            <div className="wrap_hint"><Icon type="exclamation-circle-o"/> {intl.formatMessage(IntlMessage.operatingEnvTip)}</div>
            <div className="configBtnBox">
              <Icon type={configShow ? "plus-square" : "minus-square"} className="configBtn themeColor pointer" onClick={this.toggleConfig}/>
              <FormattedMessage {...IntlMessage.advancedSettings}/>
            </div>
            <div className={classNames("selectBox", { 'hidden': !configShow})}>
              <span className="selectLabel"><FormattedMessage {...IntlMessage.selectVersion}/></span>
              <Select style={{ width: 180 }} size="large" value={version}
                onChange={e => this.setState({ version: e })}
              >
                {
                  template[templateIndex].version.map(item => {
                    return <Option key={item}>{item}</Option>
                  })
                }
              </Select>
            </div>
            {this.highLevelConfig()}
          </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {}
}

export default connect(mapStateToProps, {

})(injectIntl(OperationEnv, {
  withRef: true,
}))
