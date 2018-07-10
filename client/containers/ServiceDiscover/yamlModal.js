import React from 'react'
import { Modal } from 'antd'
import YamlEditor from '../../../src/components/Editor/Yaml'
export default class YamlModal extends React.Component {
  state = {
    appDescYaml: '',
    EditOpts: { readOnly: true },
  }

  componentDidMount() {
    console.log( this.props.self.name )
    const { isWrite } = this.props
    isWrite && this.setState({
      EditOpts: { readOnly: false },
    })
  }

  editYamlSetState = val => {
    // this function for yaml edit callback function
    this.setState({
      appDescYaml: val,
    })
  }
  render() {
    const { appDescYaml, EditOpts } = this.state
    const { visible, editItem } = this.props
    return <Modal
      title="编辑 Yaml"
      visible={visible}
      onOk={this.handleOk}
      confirmLoading={this.state.confirmLoading}
      onCancel={editItem}
    >
      <YamlEditor value={appDescYaml} options={EditOpts} callback={this.editYamlSetState} />
    </Modal>
  }
}
