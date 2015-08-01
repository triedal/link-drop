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

      if (email && link) {
        Meteor.call('sendEmail',
          email,
          email,
          'Link Drop',
          link);
        Session.set("sent", true); //used in messageSent helper to make it return true if email was sent.
        event.target.email.value = ""; //makes input boxes empty after sending email
        event.target.url.value = "";
      }
    },
    "focus .emailTextBox": function(event) { //Both of these events will remove "status-message" when either text boxes
      Session.set("sent", false);            //are clicked by making messageSent return false
    },
    "focus .urlTextBox": function(event) {
      Session.set("sent", false);
    }
  });

  Template.body.helpers({
    messageSent: function() {
      if(Session.get("sent")) {
        return true;
      }
    }
  })
}