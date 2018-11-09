
const openstackConfig = require('../../configs/3rd_account/openstack')
const common = require('./common')


exports.redirect = common.wrapHandler(function*() {
  token = this.session.loginUser.openstack.withoutProject.keystoneToken
  this.type = "html"
  this.body = `<html>
  <body>
  </body>
  <script>
    window.onload = function() {
      let form = document.createElement("form")
      form.method="post"
      form.action="${openstackConfig.webssoURL}"
      let input = document.createElement("input")
      input.type="hidden"
      input.name="token"
      input.value = "${token}"
      form.appendChild(input)
      document.body.appendChild(form)
      form.submit()
    }
  </script>
  </html> 
  `
}, true)
