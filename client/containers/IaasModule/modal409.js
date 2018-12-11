import React from 'react'
import { notification, Button } from 'antd'
export default function modal409() {
  const key = `open${Date.now()}`;
  const btnClick = () => {
    notification.close(key);
  };
  const btn = (
    <Button type="primary" onClick={btnClick}>
      知道了
    </Button>
  );
  notification.open({
    description: <div>
      <i style={{ top: '33%' }} className="ant-notification-notice-icon ant-notification-notice-icon-warning anticon anticon-exclamation-circle-o"></i>
      <div style={{ fontSize: 14, color: '#666', paddingLeft: 50 }}>该资源池已被集群伸缩策略使用，不支持删除。</div>
      <div style={{ paddingLeft: 50 }}>请在「集群伸缩策略」页面删除相应的策略后，方可删除该资源池</div>
    </div>,
    btn,
    key,
    duration: null,
  });
}
