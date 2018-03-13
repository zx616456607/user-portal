/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Template configs
 *
 * 2018-03-13
 * @author Zhangxuan
 */

import * as React from 'react';
import QueueAnim from 'rc-queue-anim';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Form, Input, Icon, Select } from 'antd';
import './style/index.less';

const FormItem = Form.Item;
const Option = Select.Option;

class TemplateConfigs extends React.Component<any> {
  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 8 },
    };
    return (
      <div className="templateConfigs">
        <FormItem
          label="服务名称"
          {...formItemLayout}
        >
          <Input placeholder="请输入服务名称"/>
        </FormItem>
        <FormItem
          label="镜像"
          {...formItemLayout}
        >
          <Input/>
        </FormItem>
        <FormItem
          label="应用包"
          {...formItemLayout}
        >
          <Input/>
        </FormItem>
        <FormItem
          label="镜像版本"
          {...formItemLayout}
        >
          <Select
            size="large"
            placeholder="请输入镜像版本"
            {...formItemLayout}
            style={{ width: '100%' }}
            showSearch
          >
            <Option key="latest">latest</Option>
            <Option key="v1">v1</Option>
          </Select>
        </FormItem>
        <FormItem
          label="性能管理APM"
          {...formItemLayout}
        >
          <div className="ant-form-text"><Icon type="info-circle-o" />&nbsp;
            当前平台未配置微服务治理套件，前往设置 <Link to="/setting/globalConfig">全局配置</Link>
          </div>
        </FormItem>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

export default connect(mapStateToProps, {

})(TemplateConfigs);
