Shortly.LogoutView = Backbone.View.extend({
  model: Shortly.Logout,
  render: function () {
      console.log("rendering logoutView");
         jQuery.ajax({
            method: 'GET',
            url: '/logout',
         });
     }
});
