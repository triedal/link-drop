if (Meteor.isServer) {
  Meteor.methods({
    sendEmail: function (to, from, subject, text) {
      check([to, from, subject, text], [String]);

      // Let other method calls from the same client start running,
      // without waiting for the email sending to complete.
      this.unblock();

      Email.send({
        to: to,
        from: from,
        subject: subject,
        text: text
      });
    }
  });
}

if (Meteor.isClient) {
  Template.body.events({
    "submit .email-sender-form": function(event) {
      event.preventDefault();
      var email = event.target.email.value;
      var link = event.target.url.value;

      Meteor.call('sendEmail',
            email,
            email,
            'Link Drop',
            link);
      event.target.email.value = "";
      event.target.url.value = "";

    }
  });
}