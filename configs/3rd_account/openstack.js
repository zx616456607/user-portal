
const env = process.env

module.exports = {
  username: env.OPENSTACK_USER || "admin",
  password: env.OPENSTACK_PASSWORD || "teamsun",
  project: env.OPENSTACK_PROJECT || "admin",
  host: env.OPENSTACK_HOST || '192.168.2.22',
  vmPort: env.OPENSTACK_VM_PROT || '8774',
  protocol: env.OPENSTACK_PROTOCOL || 'http',
  authPort: env.OPENSTACK_AUTH_PORT || '5000',
  metersPort: env.OPENSTACK_METERS_PORT || '8777',
  imagePort: env.OPENSTACK_IMAGE_PORT || '9292',
  networkPort: env.OPENSTACK_NETWORK_PORT || '9696',
  volumePort: env.OPENSTACK_VOLUME_PORT || '8776'
}