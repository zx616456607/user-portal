
const env = process.env

module.exports = {
  username: env.OPENSTACK_USER || "admin",
  password: env.OPENSTACK_PASSWORD || "Admin@ES20!8",
  project: env.OPENSTACK_PROJECT || "admin",
  host: env.OPENSTACK_HOST || 'keystone.openstack.svc.cluster.local',
  vmPort: env.OPENSTACK_VM_PROT || '8774',
  protocol: env.OPENSTACK_PROTOCOL || 'http',
  authPort: env.OPENSTACK_AUTH_PORT || '80',
  metersPort: env.OPENSTACK_METERS_PORT || '8777',
  imagePort: env.OPENSTACK_IMAGE_PORT || '9292',
  networkPort: env.OPENSTACK_NETWORK_PORT || '9696',
  volumePort: env.OPENSTACK_VOLUME_PORT || '8776',
  webssoURL: env.ES_WEBSSO_URL || "https://101.124.23.97/auth/websso/"
}