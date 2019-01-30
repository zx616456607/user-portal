
import yaml from 'js-yaml';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { buildJson, getFieldsValues } from '../../../../../../src/components/AppModule/QuickCreateApp/utils';

const formatTemplateInfo = (serviceArray: Array): Array => {
  // 模板拼数组拼 2 层 【ser1, ser2, ser3】=> [ser3.dependencies: [ser2, ser1]]
  const copyArr = cloneDeep(serviceArray);
  copyArr.reverse();
  const dependencies = []
  copyArr.forEach((item, index) => {
    if (index > 0) {
      dependencies.push(item)
    }
  })
  copyArr[0].dependencies = dependencies
  return [copyArr[0]];
};

const formatChartName = name => {
  if (!name.includes('-')) {
    return name
  }
  name = name.split('-')[0]
  return name
}

export const formatTemplateBody = (props, imageConfig, isDeploy) => {
  const { fields, current, loginUser, loadBalanceList, location } = props;
  const serviceArray: Array = [];
  let accessType: string = '';
  const chart: object = {};
  let info: Array;
  let count = 0;
  const fieldsLength = Object.keys(fields).length;
  for (const [key, value] of Object.entries(fields)) {
    count ++;
    const serviceOption = {};
    let content: Array = [];
    let loadBalanceName: string = '';
    if (fields.hasOwnProperty(key)) {
      const json = buildJson(value, current.cluster, loginUser, imageConfig, true, isDeploy, location);
      content.push(yaml.dump(json.deployment));
      content.push(yaml.dump(json.service));
      json.storage.forEach(item => {
        content.push(yaml.dump(item));
      });
      Object.assign(serviceOption, {
        chart: {
          name: isDeploy ? value.chartName.value : // 部署模板
              value.chartName && value.chartName.value ? formatChartName(value.chartName.value) + `-${count}` : // 编辑模板
            count === fieldsLength ? value.templateName.value : value.templateName.value + `-${count}`, // 创建模板
          // version: value.templateVersion.value,
          version: 'v1',
          description: value.templateDesc ? value.templateDesc.value : '',
        },
      });
      if (value.accessType && value.accessType.value === 'loadBalance') {
        accessType = value.accessType.value;
        const lbKeys = value.lbKeys && value.lbKeys.value;
        const ingresses: Array<object> = [];
        lbKeys && lbKeys.forEach(item => {
          const items = [];
          const { host, protocolPort } = value[`ingress-${item}`].value;
          const [hostname, ...path] = host.split('/');
          items.push({
            serviceName: value.serviceName.value,
            servicePort: parseInt(value[`port-${item}`].value, 10),
            weight: 1,
          });
          const body = {
            host: hostname,
            path: path ? '/' + path.join('/') : '/',
            items,
            port: protocolPort,
          };
          delete value[`ingress-${item}`].value.protocolPort
          if (!loadBalanceName) {
            loadBalanceName = getFieldsValues(value).loadBalance;
          }
          const currentLB = loadBalanceList.filter(lb => loadBalanceName === lb.metadata.name)[0];
          if (loadBalanceName && currentLB) {
            const { displayName, className } = currentLB.metadata.annotations;
            const lbObj = {
              lbName: loadBalanceName,
              displayName,
              className,
            };
            Object.assign(serviceOption, { loadbalance: lbObj });
          }
          ingresses.push(Object.assign(value[`ingress-${item}`].value, body));
        });
        if (!isEmpty(ingresses)) {
            Object.assign(serviceOption, { ingresses });
        }
      }
      content = content.join('---\n');
      Object.assign(serviceOption, { content });
      // 部署的时候需要加服务的原始名称 originalName
      if (isDeploy) {
        Object.assign(serviceOption, {
          originalName: getFieldsValues(value).originalName,
        });
        const configMapKeys = getFieldsValues(value).configMapKeys;
        const configMaps = {};
        if (configMapKeys) {
          configMapKeys.map(_key => {
            const originalName = value[`configGroupOriginalName${_key.value}`].value[1];
            let newName = value[`configGroupName${_key.value}`].value
            if (Array.isArray(newName)) { // 如果配置组名称没有重复，就用旧配置组名称作为value值
              newName = newName[1]
            }
            Object.assign(configMaps, {
              [originalName]: newName,
            });
          });
        }
        if (!isEmpty(configMaps)) {
          Object.assign(serviceOption, { configMaps });
        }
      }
      if (!chart.name) {
        chart.name = getFieldsValues(value).templateName;
      }
      if (!chart.version) {
        // chart.version = getFieldsValues(value).templateVersion;
        chart.version = 'v1';
      }
      if (!chart.description) {
        chart.description = getFieldsValues(value).templateDesc;
      }
    }
    serviceArray.push(serviceOption);
  }
  info = formatTemplateInfo(serviceArray);
  return { chart, info };
};
