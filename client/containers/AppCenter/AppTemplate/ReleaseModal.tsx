/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Template release
 *
 * 2018-03-14
 * @author Zhangxuan
 */

import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Input, Select, Button, Row, Col, Upload, Icon } from 'antd';
import './style/ReleaseModal.less';
import Notification from '../../../../src/components/Notification';

const FormItem = Form.Item;
const Option = Select.Option;
const notify = new Notification();

const wrapTypelist = ['png', 'jpg', 'jpeg'];

interface IProps {
  visible: boolean;
  closeModal();
  callback?();
}
class ReleaseModal extends React.Component<any, IProps> {

  state = {};

  cancelModal = () => {
    const { closeModal } = this.props;
    closeModal();
  }

  confirmModal = () => {
    const { closeModal, callback } = this.props;
    closeModal();
    if (callback) {
      callback();
    }
  }

  render() {
    const { visible } = this.props;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    const props = {
      showUploadList: false,
      name: 'docs',
      accept: 'image/*',
      action: '',
      beforeUpload: file => {
        let isType;

        isType = file.name.toLowerCase().match(/\.(jpg|png|jpeg)$/);

        if (!isType) {
          notify.error('上传文件格式错误', '支持：' + wrapTypelist.join('、') + '文件格式');
          return false;
        }
        if (file.size > 1024 * 1024 * 10) {
          notify.error('请上传10M以内的图片');
          return false;
        }
      },
    };
    return (
      <Modal
        className="releaseModal"
        title="发布应用模板"
        visible={visible}
        maskClosable={false}
        onCancel={this.cancelModal}
        onOk={this.confirmModal}
        okText="发布"
      >
        <FormItem
          label="模板名称"
          {...formItemLayout}
        >
          <Input/>
        </FormItem>
        <FormItem
          label="描述"
          {...formItemLayout}
        >
          <Input type="textarea"/>
        </FormItem>
        <FormItem
          label="应用类型"
          {...formItemLayout}
        >
          <Select
            showSearch
            style={{ width: '100%' }}
          >
            <Option key="web1">Web服务器1</Option>
            <Option key="web2">Web服务器2</Option>
            <Option key="web3">Web服务器3</Option>
          </Select>
        </FormItem>
        <Row>
          <Col span={4} style={{ textAlign: 'right', paddingRight: 10 }}>上传icon</Col>
          <Col span={18}>
            <Row type="flex" align="middle">
              <Col span={10} className="uploadBox">
                <Upload {...props} className="releaseUpload">
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传icon</div>
                </Upload>
              </Col>
              <Col span={4} style={{ textAlign: 'center' }}>预览</Col>
              <Col>
                <div className="preview">
                  <div className="previewBody">123</div>
                  <Row className="previewFooter" type="flex" align="middle" justify="spance-between">
                    <Col span={12}>应用名称</Col>
                    <Col span={12}><Button type="ghost">部署</Button></Col>
                  </Row>
                </div>
              </Col>
            </Row>
            <div className="uploadHint hintColor">上传照片支持（jpg/jpeg/png/bmp 图片格式，大小不超过3M）</div>
          </Col>
        </Row>
      </Modal>
    );
  }
}

ReleaseModal = Form.create()(ReleaseModal);

const mapStateToProps = state => {
  return {};
};

export default connect(mapStateToProps, {

})(ReleaseModal);
