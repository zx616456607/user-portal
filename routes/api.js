/**
 * API handler for user portal
 *
 * v0.1 - 2016-09-22
 *
 * @author Zhangpc
 */

'use strict';

const middlewares = require('../services/middlewares')
const volumeController = require('../controllers/volume')
const appController = require('../controllers/app_manage')
const serviceController = require('../controllers/service_manage')
const containerController = require('../controllers/container')
const configController = require('../controllers/configs')
const registryController = require('../controllers/registry')
const metricsController = require('../controllers/metrics')
const databaseCacheController = require('../controllers/database_cache')
const appTemplateController = require('../controllers/app_template')
const manageMonitorController = require('../controllers/manage_monitor')
const userController = require('../controllers/user_manage')
const teamController = require('../controllers/team_manage')
const overviewTeamController = require('../controllers/overview_team')
const overviewClusterController = require('../controllers/overview_cluster')
const overviewSpaceController = require('../controllers/overview_space')
const tokenController = require('../controllers/token')
const devopsController = require('../controllers/devops')
const licenseController = require('../controllers/license')
const clusterController = require('../controllers/cluster_manage')
const integrationController = require('../controllers/integration')
const consumptionController = require('../controllers/consumption')
const clusternodesController = require('../controllers/cluster_node')
const versionsController = require('../controllers/versions')
const chargeController = require('../controllers/charge')

module.exports = function (Router) {
  const router = new Router({
    prefix: '/api/v2'
  })
  router.use(middlewares.auth)

  // Storage
  router.get('/storage-pools/:pool/:cluster/volumes', volumeController.getVolumeListByPool)
  router.post('/storage-pools/:pool/:cluster/volumes/batch-delete', volumeController.deleteVolume)
  router.post('/storage-pools/:cluster/volumes', volumeController.createVolume)
  router.put('/storage-pools/:pool/:cluster/volumes/format', volumeController.formateVolume)
  router.put('/storage-pools/:pool/:cluster/volumes/size', volumeController.resizeVolume)
  router.get('/storage-pools/:pool/:cluster/volumes/:name', volumeController.getVolumeDetail)
  //router.post('/storage-pools/:pool/:cluster/volumes/:name/beforeimport', volumeController.beforeUploadFile)
  //router.post('/storage-pools/:pool/:cluster/volumes/:name/import', volumeController.uploadFile)
  router.get('/storage-pools/:pool/:cluster/volumes/:name/filehistory', volumeController.getFileHistory)
  router.get('/storage-pools/:pool/:cluster/volumes/:name/bindinfo', volumeController.getBindInfo)
  // router.get('/storage-pools/:pool/:cluster/volumes/:name/exportfile', volumeController.exportFile)
  router.get('/storage-pools/:cluster/volumes/available', volumeController.getAvailableVolume)

  // Clusters
  router.get('/clusters', clusterController.getClusters)
  // Apps
  router.post('/clusters/:cluster/apps', appController.createApp)
  router.put('/clusters/:cluster/apps/:app_name/desc', appController.updateAppDesc)
  router.get('/clusters/:cluster/apps', appController.getApps)
  router.post('/clusters/:cluster/apps/batch-delete', appController.deleteApps)
  router.put('/clusters/:cluster/apps/batch-stop', appController.stopApps)
  router.put('/clusters/:cluster/apps/batch-start', appController.startApps)
  router.put('/clusters/:cluster/apps/batch-restart', appController.restartApps)
  router.put('/clusters/:cluster/apps/batch-status', appController.getAppsStatus)
  router.get('/clusters/:cluster/apps/:app_name/services', appController.getAppServices)
  router.post('/clusters/:cluster/apps/:app_name/services', appController.addService)
  router.get('/clusters/:cluster/apps/:app_name/orchfile', appController.getAppOrchfile)
  router.get('/clusters/:cluster/apps/:app_name/detail', appController.getAppDetail)
  // spi
  router.get('/clusters/:cluster/apps/:app_name/logs', appController.getAppLogs)
  router.get('/clusters/:cluster/apps/:app_name/existence', appController.checkAppName)
  router.get('/clusters/:cluster/services/:service/existence', serviceController.checkServiceName)

  // AppTemplates
  router.get('/templates', appTemplateController.listTemplates)
  router.get('/templates/:templateid', appTemplateController.getTemplate)
  router.post('/templates', appTemplateController.createTemplate)
  router.delete('/templates/:templateid', appTemplateController.deleteTemplate)
  router.put('/templates/:templateid', appTemplateController.updateTemplate)

  // Services
  router.put('/clusters/:cluster/services/batch-start', serviceController.startServices)
  router.put('/clusters/:cluster/services/batch-stop', serviceController.stopServices)
  router.put('/clusters/:cluster/services/batch-restart', serviceController.restartServices)
  router.put('/clusters/:cluster/services/batch-quickrestart', serviceController.quickRestartServices)
  router.post('/clusters/:cluster/services/batch-delete', serviceController.deleteServices)
  router.get('/clusters/:cluster/services/batch-status', serviceController.getServicesStatus)
  router.get('/clusters/:cluster/services/:service_name/detail', serviceController.getServiceDetail)
  router.get('/clusters/:cluster/services/:service_name/containers', serviceController.getServiceContainers)
  router.put('/clusters/:cluster/services/:service_name/manualscale', serviceController.manualScaleService)
  router.get('/clusters/:cluster/services/:service_name/autoscale', serviceController.getServiceAutoScale)
  router.put('/clusters/:cluster/services/:service_name/autoscale', serviceController.autoScaleService)
  router.del('/clusters/:cluster/services/:service_name/autoscale', serviceController.delServiceAutoScale)
  router.put('/clusters/:cluster/services/:service_name/quota', serviceController.changeServiceQuota)
  router.put('/clusters/:cluster/services/:service_name/ha', serviceController.changeServiceHa)
  router.put('/clusters/:cluster/services/:service_name/rollingupdate', serviceController.rollingUpdateService)
  router.get('/clusters/:cluster/replicaset/:service_name/events', serviceController.getReplicasetDetailEvents)
  router.get('/clusters/:cluster/dbservice/:service_name/events', serviceController.getDbServiceDetailEvents)
  router.post('/clusters/:cluster/services/:service_name/logs', serviceController.getServiceLogs)
  router.get('/clusters/:cluster/services/:service_name/k8s-service', serviceController.getK8sService)
  router.get('/clusters/:cluster/services', serviceController.getAllService)
  router.put('/clusters/:cluster/services/:service_name/portinfo', serviceController.updateServicePortInfo)
  router.get('/clusters/:cluster/services/:service_name/certificates', serviceController.getCertificate)
  router.put('/clusters/:cluster/services/:service_name/certificates', serviceController.updateCertificate)
  router.delete('/clusters/:cluster/services/:service_name/certificates', serviceController.deleteCertificate)
  router.put('/clusters/:cluster/services/:service_name/tls', serviceController.toggleHTTPs)

  // Users
  router.get('/users/:user_id', userController.getUserDetail)
  router.get('/users/:user_id/app_info', userController.getUserAppInfo)
  router.get('/users', userController.getUsers)
  router.get('/users/:user_id/teams', userController.getUserTeams)
  router.get('/users/:user_id/teamspaces', userController.getUserTeamspaces)
  router.get('/users/:user_id/teamspaces/detail', userController.getUserTeamspacesWithDetail)
  router.post('/users', userController.createUser)
  router.delete('/users/:user_id', userController.deleteUser)
  router.patch('/users/:user_id', userController.updateUser)
  router.get('/users/:user_name/existence', userController.checkUserName)

  // Teams
  router.get('/teams/:team_id/spaces', teamController.getTeamspaces)
  router.get('/teams/:team_id/clusters', teamController.getTeamClusters)
  router.get('/teams/:team_id/clusters/all', teamController.getAllClusters)
  router.get('/teams/:team_id/users', teamController.getTeamUsers)
  router.get('/teams/:team_id', teamController.getTeamDetail)
  router.post('/teams', teamController.createTeam)
  router.delete('/teams/:team_id', teamController.deleteTeam)
  router.post('/teams/:team_id/spaces', teamController.createTeamspace)
  router.post('/teams/:team_id/users', teamController.addTeamusers)
  //To remove multiple users, seperate the user ids with ",".
  router.delete('/teams/:team_id/users/:user_ids', teamController.removeTeamusers)
  router.delete('/teams/:team_id/spaces/:space_id', teamController.deleteTeamspace)
  router.put('/teams/:team_id/clusters/:cluster_id/request', teamController.requestTeamCluster)
  router.get('/teams/:team_name/existence', teamController.checkTeamName)
  router.get('/teams/:team_id/spaces/:space_name/existence', teamController.checkSpaceName)

  //Overview Team
  router.get('/overview/teaminfo', overviewTeamController.getTeamOverview)
  router.get('/overview/teamdetail', overviewTeamController.getTeamDetail)
  router.get('/overview/teamoperations', overviewTeamController.getTeamOperations)

  //Overview Cluster
  router.get('/overview/clusterinfo/clusters/:cluster_id', overviewClusterController.getClusterOverview)
  router.get('/overview/clusterinfo-std/clusters/:cluster_id', overviewClusterController.getStdClusterOverview)
  router.get('/overview/clusters/:cluster_id/operations', overviewClusterController.getClusterOperations)
  router.get('/overview/clusters/:cluster_id/sysinfo', overviewClusterController.getClusterSysinfo)
  router.get('/overview/clusters/:cluster_id/storage', overviewClusterController.getClusterStorage)
  router.get('/overview/clusters/:cluster_id/appstatus', overviewClusterController.getClusterAppStatus)
  router.get('/overview/clusters/:cluster_id/dbservices', overviewClusterController.getClusterDbServices)
  router.get('/overview/clusters/:cluster_id/nodesummary', overviewClusterController.getClusterNodeSummary)

  //Overview Space
  router.get('/overview/spaceinfo', overviewSpaceController.getSpaceOverview)
  router.get('/overview/operations', overviewSpaceController.getSpaceOperations)
  router.get('/overview/templates', overviewSpaceController.getSpaceTemplateStats)
  router.get('/overview/warnings', overviewSpaceController.getSpaceWarnings)

  // spi
  router.post('/clusters/:cluster/services/:service_name/binddomain', serviceController.bindServiceDomain)
  router.put('/clusters/:cluster/services/:service_name/binddomain', serviceController.deleteServiceDomain)
  // Containers
  router.get('/clusters/:cluster/containers', containerController.getContainers)
  router.get('/clusters/:cluster/containers/:container_name/detail', containerController.getContainerDetail)
  router.get('/clusters/:cluster/containers/:container_name/events', containerController.getContainerDetailEvents)
  router.post('/clusters/:cluster/containers/:name/logs', containerController.getContainerLogs)
  router.post('/clusters/:cluster/containers/batch-delete', containerController.deleteContainers)
  router.get('/clusters/:cluster/containers/:name/process', containerController.getProcess)

  // Configs
  router.get('/clusters/:cluster/configgroups', configController.listConfigGroups)
  router.get('/clusters/:cluster/configgroups/:name', configController.getConfigGroupName)
  router.get('/clusters/:cluster/configgroups/:group/configs/:name', configController.loadConfigFiles)
  router.post('/clusters/:cluster/configs', configController.createConfigGroup)
  router.post('/clusters/:cluster/configgroups/:group/configs/:name', configController.createConfigFiles)
  router.put('/clusters/:cluster/configgroups/:group/configs/:name', configController.updateConfigFile)
  router.post('/clusters/:cluster/configs/delete', configController.deleteConfigGroup)
  router.post('/clusters/:cluster/configgroups/:group/configs-batch-delete', configController.deleteConfigFiles)

  // Registries of TenxCloud
  router.get('/registries/:registry', registryController.getImages)
  router.get('/registries/:registry/:user/:name/detailInfo', registryController.getImageInfo)
  router.get('/registries/:registry/:user/:name', registryController.checkImage)
  router.get('/registries/:registry/:user/:name/tags', registryController.getImageTags)
  router.get('/registries/:registry/:user/:name/tags/:tag/configs', registryController.getImageConfigs)
  router.get('/registries/:registry/private', registryController.getPrivateImages)
  router.get('/registries/:registry/favourite', registryController.getFavouriteImages)
  router.put('/registries/:registry/:image*', registryController.updateImageInfo)
  router.delete('/registries/:registry/:image*', registryController.deleteImage)
  router.get('/registries/:registry/stats', registryController.queryServerStats)

  // Private docker registry integration
  router.get('/docker-registry', registryController.getPrivateRegistries)
  router.post('/docker-registry/:name', registryController.addPrivateRegistry)
  router.del('/docker-registry/:id', registryController.deletePrivateRegistry)
  // Docker registry spec API
  router.get('/docker-registry/:id/images', registryController.specListRepositories)
  router.get('/docker-registry/:id/images/:image*/tags', registryController.specGetImageTags)
  router.get('/docker-registry/:id/images/:image*/tags/:tag', registryController.specGetImageTagInfo)
  // spi for tenxcloud hub
  router.get('/tenx-hubs', registryController.isTenxCloudHubConfigured)
  router.post('/tenx-hubs', registryController.addTenxCloudHub)
  router.delete('/tenx-hubs', registryController.removeTenxCloudHub)
  // Tag size is merged to specGetImageTagConfig
  //router.get('/docker-registry/:id/images/:image*/tags/:tag/size', registryController.specGetImageTagSize)

  // Metrics
  router.get('/clusters/:cluster/containers/:container_name/metrics', metricsController.getContainerMetrics)
  router.get('/clusters/:cluster/containers/:container_name/getAllmetrics', metricsController.getAllContainerMetrics)
  router.get('/clusters/:cluster/services/:service_name/metrics', metricsController.getServiceMetrics)
  router.get('/clusters/:cluster/services/:service_name/getAllMetrics', metricsController.getAllServiceMetrics)
  router.get('/clusters/:cluster/apps/:app_name/metrics', metricsController.getAppMetrics)
  router.get('/clusters/:cluster/apps/:app_name/getAllMetrics', metricsController.getAllAppMetrics)
  // router.get('/clusters/:cluster/apps/:app_name/getAllMetrics', metricsController.getAppAllMetrics)

  // Manage Monitor
  router.post('/manage-monitor/getOperationAuditLog', manageMonitorController.getOperationAuditLog)
  router.get('/manage-monitor/:team_id/:namespace/getClusterOfQueryLog', manageMonitorController.getClusterOfQueryLog)
  router.get('/manage-monitor/:cluster_id/:namespace/getServiceOfQueryLog', manageMonitorController.getServiceOfQueryLog)
  router.post('/clusters/:cluster/instances/:instances/getSearchLog', manageMonitorController.getSearchLog)
  router.post('/clusters/:cluster/services/:services/getSearchLog', manageMonitorController.getServiceSearchLog)

  // DevOps service: CI/CD
  router.get('/devops/stats', devopsController.getStats)
  // Repos
  router.get('/devops/repos/supported', devopsController.getSupportedRepository)
  router.post('/devops/repos/:type', devopsController.registerRepo)
  router.get('/devops/repos/:type', devopsController.listRepository)
  router.put('/devops/repos/:type', devopsController.syncRepository)
  router.delete('/devops/repos/:type', devopsController.removeRepository)
  router.get('/devops/repos/:type/branches', devopsController.listBranches)
  router.get('/devops/repos/:type/user', devopsController.getUserInfo)
  // Auth with 3rdparty SCM and callback
  router.get('/devops/repos/:type/auth', devopsController.getAuthRedirectUrl);
  router.get('/devops/repos/:type/auth-callback', devopsController.doUserAuthorization)

  // Managed projects
  router.post('/devops/managed-projects', devopsController.addManagedProject)
  router.get('/devops/managed-projects', devopsController.listManagedProject)
  router.delete('/devops/managed-projects/:project_id', devopsController.removeManagedProject)
  // CI flows
  router.post('/devops/ci-flows', devopsController.createCIFlows)
  router.get('/devops/ci-flows', devopsController.listCIFlows)
  router.get('/devops/ci-flows/:flow_id', devopsController.getCIFlow)
  router.get('/devops/ci-flows/:flow_id/yaml', devopsController.getCIFlowYAML)
  router.put('/devops/ci-flows/:flow_id', devopsController.updateCIFlow)
  router.delete('/devops/ci-flows/:flow_id', devopsController.removeCIFlow)
  router.get('/devops/ci-flows/:flow_id/images', devopsController.getImagesOfFlow)
  router.get('/devops/ci-flows/:flow_id/deployment-logs', devopsController.listDeploymentLogsOfFlow)
  // CI flow stages
  router.get('/devops/ci-flows/:flow_id/stages', devopsController.listFlowStages)
  router.post('/devops/ci-flows/:flow_id/stages', devopsController.createFlowStages)
  router.delete('/devops/ci-flows/:flow_id/stages/:stage_id', devopsController.deleteFlowStage)
  router.put('/devops/ci-flows/:flow_id/stages/:stage_id', devopsController.updateFlowStage)
  router.get('/ci-flows/:flow_id/stages/:stage_id', devopsController.getStage)
  router.get('/devops/ci-flows/:flow_id/stages/:stage_id/getStageBuildLogs', devopsController.getStageBuildLogList)
  router.put('/devops/ci-flows/:flow_id/stages/:stage_id/link/:target_id', devopsController.updateStageLink)

  // CD rules
  router.post('/devops/ci-flows/:flow_id/cd-rules', devopsController.createCDRule)
  router.get('/devops/ci-flows/:flow_id/cd-rules', devopsController.listCDRules)
  router.delete('/devops/ci-flows/:flow_id/cd-rules/:rule_id', devopsController.removeCDRule)
  router.put('/devops/ci-flows/:flow_id/cd-rules/:rule_id', devopsController.updateCDRule)

  // CI rules
  router.get('/devops/ci-flows/:flow_id/ci-rules', devopsController.getCIRule)
  router.put('/devops/ci-flows/:flow_id/ci-rules', devopsController.updateCIRule)

  // Flow build
  router.post('/devops/ci-flows/:flow_id/builds', devopsController.createFlowBuild)
  router.get('/devops/ci-flows/:flow_id/builds', devopsController.listBuilds)
  router.get('/devops/ci-flows/:flow_id/builds/:flow_build_id', devopsController.getFlowBuild)
  router.put('/devops/ci-flows/:flow_id/stages/:stage_id/builds/:build_id/stop', devopsController.stopBuild)
  router.get('/devops/ci-flows/:flow_id/getBuildLogs', devopsController.getBuildLog)
  router.get('/devops/ci-flows/:flow_id/getLastBuildLogs', devopsController.getLastBuildLog)
  router.get('/devops/ci-flows/:flow_id/stages/:stage_id/builds/:stage_build_id', devopsController.getFlowStageBuildLog)
  router.get('/devops/ci-flows/:flow_id/stages/:stage_id/builds/:stage_build_id/events', devopsController.getFlowStageBuildEvents)

  // CI Dockerfile
  router.get('/devops/dockerfiles', devopsController.listDockerfiles)
  router.post('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.addDockerfile)
  router.get('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.getDockerfile)
  router.delete('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.removeDockerfile)
  router.put('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.updateDockerfile)
  // Available CI images
  router.get('/devops/ci/images', devopsController.getAvailableImages)

  // Petsets - DB service APIs
  router.post('/clusters/:cluster/dbservices', databaseCacheController.createNewDBService)
  router.delete('/clusters/:cluster/dbservices/:name', databaseCacheController.deleteDBService)
  // Filter by type
  router.get('/clusters/:cluster/dbservices', databaseCacheController.listDBService)
  router.get('/clusters/:cluster/dbservices/:name', databaseCacheController.getDBService)
  router.patch('/clusters/:cluster/dbservices/:name', databaseCacheController.scaleDBService)

  // Integration
  router.get('/integrations/getAllIntegration', integrationController.getAllIntegrations)
  router.post('/integrations/createIntegration', integrationController.createIntegrations)
  router.delete('/integrations/deleteIntegrations/:id', integrationController.deleteIntegrations)
  router.get('/integrations/getIntegrationDateCenter/:id', integrationController.getIntegrationDateCenter)
  router.get('/integrations/getIntegrationVmList/:id', integrationController.getIntegrationVmList)
  router.post('/integrations/manageIntegrationsVmDetail/:id', integrationController.manageIntegrationsVmDetail)
  router.get('/integrations/getCreateVmConfig/:id', integrationController.getCreateVmConfig)
  router.post('/integrations/createIntegrationVm/:id', integrationController.createIntegrationVm)
  router.get('/integrations/getIntegrationPods/:id', integrationController.getIntegrationPods)
  router.get('/integrations/getIntegrationConfig/:id', integrationController.getIntegrationConfig)
  router.put('/integrations/updateIntegrationConfig/:id', integrationController.updateIntegrationConfig)

  // Cluster pod
  router.get('/cluster-nodes/:cluster', clusternodesController.getClusterNodes)
  router.post('/cluster-nodes/:cluster/node/:node', clusternodesController.changeNodeSchedule)
  router.delete('/cluster-nodes/:cluster/node/:node', clusternodesController.deleteNode)
  router.get('/cluster-nodes/:cluster/add-node-cmd', clusternodesController.getAddNodeCMD)
  // Get kubectl pods names
  router.get('/cluster-nodes/:cluster/kubectls', clusternodesController.getKubectls)
  // For bind node when create service(lite only)
  router.get('/clusters/:cluster/nodes', clusternodesController.getNodes)

  // Token info
  router.get('/token', tokenController.getTokenInfo)

  // Licenses
  router.get('/licenses', licenseController.getLicenses)

  // consumption and charge
  router.get('/consumptions/detail', consumptionController.getDetail)
  router.get('/consumptions/trend', consumptionController.getTrend)
  router.get('/consumptions/summary', consumptionController.getSummaryInDay)
  router.get('/consumptions/charge-history', consumptionController.getChargeRecord)
  router.get('/consumptions/notify-rule', consumptionController.getNotifyRule)
  router.put('/consumptions/notify-rule', consumptionController.setNotifyRule)

  // Versions
  router.get('/versions/check', versionsController.checkVersion)

  // Charge
  router.post('/charge/user', chargeController.chargeUser)
  router.post('/charge/teamspace', chargeController.chargeTeamspace)

  return router.routes()
}
