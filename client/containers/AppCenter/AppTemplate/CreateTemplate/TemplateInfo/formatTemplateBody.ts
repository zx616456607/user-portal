
import yaml from 'js-yaml';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { buildJson, getFieldsValues } from '../../../../../../src/components/AppModule/QuickCreateApp/utils';

const formatTemplateInfo = (serviceArray: Array): Array => {
  const copyArr = cloneDeep(serviceArray);
  copyArr.reverse();
  copyArr.forEach((item, index, arr) => {
    if (index < arr.length - 1) {
      item.dependencies = [copyArr[index + 1]];
    }
  });
  return [copyArr[0]];
};

export const formatTemplateBody = (props, imageConfig, isDeploy) => {
  const { fields, current, loginUser, loadBalanceList } = props;
  const serviceArray: Array = [];
  let accessType: string = '';
  let loadBalanceName: string = '';
  const chart: object = {};
  let info: Array;
  let count = 0;
  const fieldsLength = Object.keys(fields).length;
  for (const [key, value] of Object.entries(fields)) {
    count ++;
    const serviceOption = {};
    let content: Array = [];
    if (fields.hasOwnProperty(key)) {
      const json = buildJson(value, current.cluster, loginUser, imageConfig, true, isDeploy);
      content.push(yaml.dump(json.deployment));
      content.push(yaml.dump(json.service));
      json.storage.forEach(item => {
        content.push(yaml.dump(item));
      });
      Object.assign(serviceOption, {
        chart: {
          name: isDeploy ? value.chartName.value :
            count === fieldsLength ? value.templateName.value : value.serviceName.value,
          // version: value.templateVersion.value,
          version: 'v1',
          description: value.templateDesc ? value.templateDesc.value : '',
        },
      });
      if (value.accessType && value.accessType.value === 'loadBalance') {
        accessType = value.accessType.value;
        const lbKeys = value.lbKeys.value;
        const ingresses: Array = [];
        lbKeys.forEach(item => {
          const items = [];
          const { host } = value[`ingress-${item}`].value;
          const [hostname, ...path] = host.split('/');
          items.push({
            serviceName: value.serviceName.value,
            servicePort: parseInt(value[`port-${item}`].value, 10),
            weight: 1,
          });
          const body = {
            host: hostname,
            path: path ? '/' + path.join('/') : '',
            items,
          };
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
            Object.assign(configMaps, {
              [originalName]: value[`configGroupName${_key.value}`].value,
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
