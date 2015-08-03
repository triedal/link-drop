Users = new Mongo.Collection(null);

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
        "submit .email-sender-form": function (event) {
            event.preventDefault();

            var email = event.target.email.value;
            var link = event.target.url.value;
            var now = new Date();
            if(Users.find().count() === 0) {
                Users.insert({
                    sentAt: now,
                    canSend: now,
                });
            }
            if (email && link && now >= Users.findOne().canSend) {
                Meteor.call('sendEmail',
                    email,
                    email,
                    'Link Drop',
                    link);
                Session.set("sent", true); //used in messageSent helper to make it return true if email was sent.
                Session.set("wait", false);
                event.target.email.value = ""; //makes input boxes empty after sending email
                event.target.url.value = "";
                Users.update(Users.findOne(), { $set: {sentAt: now, canSend: now.setSeconds(now.getSeconds() + 10)}})
            } else if (email && link && now < Users.findOne().canSend) {
                Session.set("wait", true);
            }
        },
        "focus .emailTextBox": function (event) { //Both of these events will remove "status-message" when either text boxes
            Session.set("sent", false);            //are clicked by making messageSent return false
        },
        "focus .urlTextBox": function (event) {
            Session.set("sent", false);
        }
    });

    Template.body.helpers({
        messageSent: function () {
            if (Session.get("sent")) {
                return true;
            }
        },

        cannotSendYet: function () {
            if (Session.get("wait")) {
                return true;
            }
        }
    });
}

