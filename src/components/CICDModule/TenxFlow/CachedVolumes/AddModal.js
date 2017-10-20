import React from 'react'
import { Modal, Form, Input, InputNumber, Select } from 'antd'
import { connect } from 'react-redux'
import find from 'lodash/find'
import { getCachedVolumes } from '../../../../actions/cicd_flow'
import './style/AddModal.less'

const FormItem = Form.Item
const Option = Select.Option

let AddModal = React.createClass({
  componentDidMount() {
    const { index, list, form, getCachedVolumes, flowId } = this.props
    const currentValues = list[index]
    currentValues && form.setFieldsValue(currentValues)
    getCachedVolumes({ flow_id: flowId })
  },
  onOk() {
    const { form, onOk, index, volumes } = this.props
    const { validateFields } = form
    validateFields((error, values) => {
      if (!!error) {
        return
      }
      const targetVolume = find(volumes, v => v.volumeName === values.cachedVolume)
      if (targetVolume) {
        values = Object.assign({}, values, targetVolume)
      }
      onOk && onOk(index, values)
    })
  },
  checkContainerPath(rule, value, callback) {
    if (!value) {
      return callback()
    }
    if (!/^\/[a-zA-Z0-9_\-\/]*$/.test(value)) {
      return callback('请输入正确的路径')
    }
    const list = this.props.list || []
    for (let i = 0; i < list.length; i++) {
      if (i !== this.props.index && list[i].containerPath === value) {
        return callback('该容器目录已填写过')
      }
    }
    callback()
  },
  checkVolumeName(rule, value, callback) {
    if (!value) {
      return callback()
    }
    const volumes = this.props.volumes || []
    for (let i = 0; i < volumes.length; i++) {
      if (volumes[i].volumeName === value) {
        return callback('该缓存卷名称已存在')
      }
    }
    callback()
  },
  render() {
    const { form, volumes, flowId } = this.props
    const { getFieldProps, getFieldValue, resetFields } = form
    const targetVolumes = volumes.filter(v => v.ownerFlowId === flowId)
    const cachedVolumeProps = getFieldProps('cachedVolume', {
      rules: [
        { required: true, message: '请选择缓存卷' },
      ],
      onChange: value => {
        if (value === 'create') {
          resetFields([ 'volumeName', 'volumeSize' ])
        }
      },
    })
    let volumeNameProps
    let volumeSizeProps
    const containerPathProps = getFieldProps('containerPath', {
      rules: [
        { required: true, message: '请填写容器目录' },
        { validator: this.checkContainerPath },
      ],
    })
    const cachedVolume = getFieldValue('cachedVolume')
    if (cachedVolume === 'create') {
      volumeNameProps = getFieldProps('volumeName', {
        rules: [
          { required: true, message: '请填写缓存卷名称' },
          { validator: this.checkVolumeName },
        ],
      })
      volumeSizeProps = getFieldProps('volumeSize', {
        initialValue: 1024,
        rules: [
          { required: true, message: '请填写缓存卷大小' },
        ],
      })
    }
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    }
    return (
      <Modal
        title="添加缓存卷"
        {...this.props}
        onOk={this.onOk}
        wrapClassName="add-cached-volume-modal"
      >
        <Form>
          <FormItem label="选择存储" {...formItemLayout}>
            <Select {...cachedVolumeProps}>
              <Option key="create">动态生成一个缓存卷</Option>
              {
                targetVolumes.map(volume => (
                  <Option key={volume.volumeName}>
                    {volume.volumeName || '-'}
                  </Option>
                ))
              }
            </Select>
          </FormItem>
          {
            volumeNameProps && (
              <FormItem label="缓存卷名称" {...formItemLayout}>
                <Input placeholder="请填写缓存卷名称" {...volumeNameProps} />
              </FormItem>
            )
          }
          {
            volumeNameProps && (
              <FormItem label="缓存卷大小" {...formItemLayout}>
                <InputNumber
                  placeholder="请填写缓存卷大小"
                  {...volumeSizeProps}
                  min={1024}
                  max={20480}
                />
              </FormItem>
            )
          }
          <FormItem label="容器目录" {...formItemLayout}>
            <Input placeholder="请填写容器目录" {...containerPathProps} />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})

function mapStateToProps(state) {
  const { cachedVolumes } = state.cicd_flow
  return {
    volumes: cachedVolumes && cachedVolumes.result && cachedVolumes.result.volumes || [],
  }
}

AddModal = Form.create()(AddModal)

export default connect(mapStateToProps, {
  getCachedVolumes,
})(AddModal)
