import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

actor {
  type ContactFormSubmission = {
    fullName : Text;
    email : Text;
    subject : Text;
    message : Text;
    timestamp : Int;
  };

  module ContactFormSubmission {
    public func compare(s1 : ContactFormSubmission, s2 : ContactFormSubmission) : Order.Order {
      Int.compare(s1.timestamp, s2.timestamp);
    };
  };

  let contacts = Map.empty<Int, ContactFormSubmission>();

  public shared ({ caller }) func submitContact(fullName : Text, email : Text, subject : Text, message : Text) : async () {
    let timestamp = Time.now() / 1_000_000;
    let contact : ContactFormSubmission = {
      fullName;
      email;
      subject;
      message;
      timestamp;
    };
    contacts.add(timestamp, contact);
  };

  public query ({ caller }) func getContacts() : async [ContactFormSubmission] {
    contacts.values().toArray().sort();
  };
};
