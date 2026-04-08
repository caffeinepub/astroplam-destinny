import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Bool "mo:core/Bool";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import Storage "mo:caffeineai-object-storage/Storage";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import AccessControl "mo:caffeineai-authorization/access-control";

actor {
  // COMPONENTS
  let accessControlState = AccessControl.initState();
  include MixinObjectStorage();
  include MixinAuthorization(accessControlState);

  // CONSTANTS
  let ADMIN_USER = "vikaskharb00007@admin";
  let ADMIN_PASS = "Vikas00007@admin";
  let VISITOR_ADMIN_EMAIL = "vikaskharb00007@gmail.com";
  let VISITOR_ADMIN_PASS = "miku@03love";

  let NANOS_PER_DAY : Int = 86_400_000_000_000;

  // TYPES
  public type Timestamp = Time.Time;

  public type NumerologyUser = {
    username : Text;
    passwordHash : Text;
    sectionLevel : Nat;
  };

  public type UserProfile = {
    id : Principal;
    name : Text;
    email : Text;
    createdAt : Timestamp;
  };

  public type Service = {
    id : Nat;
    name : Text;
    price : Nat;
  };

  public type Person = {
    name : Text;
    dob : ?Text;
    tob : ?Text;
  };

  public type Inquiry = {
    id : Text;
    serviceId : Nat;
    visitorName : Text;
    dob : ?Text;
    tob : ?Text;
    question : Text;
    pastLifeNotes : Text;
    handPicture : ?Storage.ExternalBlob;
    palmPhotos : [?Storage.ExternalBlob];
    relationshipPerson2 : ?Person;
    birthCountry : ?Text;
    city : ?Text;
    state : ?Text;
    seedNumber : ?Nat;
    submittedAt : Timestamp;
    authorId : ?Principal;
  };

  public type BlogPost = {
    id : Text;
    title : Text;
    content : Text;
    author : Text;
    createdAt : Timestamp;
    published : Bool;
  };

  public type VisitorID = {
    username : Text;
    password : Text;
    service : Text;
    visitorName : Text;
    createdAt : Timestamp;
    expiresAt : Timestamp;
  };

  public type Notice = {
    id : Text;
    title : Text;
    message : Text;
    createdAt : Timestamp;
    active : Bool;
  };

  public type VisitorQuery = {
    name : Text;
    contactInfo : Text;
    message : Text;
    submittedAt : Timestamp;
  };

  module BlogPost {
    public func compareByCreatedAt(b1 : BlogPost, b2 : BlogPost) : Order.Order {
      Int.compare(b2.createdAt, b1.createdAt);
    };
  };

  // STATE
  let numerologyUsers = Map.empty<Text, NumerologyUser>();
  var nextInquiryId = 1;
  var nextBlogPostId = 1;
  var nextNoticeId = 1;
  var nextVisitorQueryId = 1;

  let predefinedServices = [
    { id = 1; name = "One Question"; price = 500 },
    { id = 2; name = "Matchmaking"; price = 1500 },
    { id = 3; name = "Muhurat"; price = 1500 },
    { id = 4; name = "Professional Advice"; price = 1100 },
    { id = 5; name = "Personal Phone Consultation"; price = 2500 },
    { id = 6; name = "Daily Pooja Muhurat"; price = 1100 },
  ];

  let inquiries = Map.empty<Text, Inquiry>();
  let blogPosts = Map.empty<Text, BlogPost>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let visitorIDs = Map.empty<Text, VisitorID>();
  let notices = Map.empty<Text, Notice>();
  let visitorQueries = Map.empty<Text, VisitorQuery>();
  let serviceAccess = Map.empty<Text, Bool>();

  func getNextInquiryId() : Text {
    let id = nextInquiryId;
    nextInquiryId += 1;
    id.toText();
  };

  func getNextBlogPostId() : Text {
    let id = nextBlogPostId;
    nextBlogPostId += 1;
    id.toText();
  };

  func getNextNoticeId() : Text {
    let id = nextNoticeId;
    nextNoticeId += 1;
    id.toText();
  };

  func getNextVisitorQueryId() : Text {
    let id = nextVisitorQueryId;
    nextVisitorQueryId += 1;
    id.toText();
  };

  func isValidAdminCreds(email : Text, pass : Text) : Bool {
    email == VISITOR_ADMIN_EMAIL and pass == VISITOR_ADMIN_PASS;
  };

  func serviceInList(serviceKey : Text, serviceList : Text) : Bool {
    let parts = serviceList.split(#char ',');
    for (part in parts) {
      if (part.trim(#char ' ') == serviceKey) {
        return true;
      };
    };
    false;
  };

  // SERVICE ACCESS CONTROL
  public shared func serviceSetPublic(adminEmail : Text, adminPassword : Text, service : Text, isPublic : Bool) : async () {
    if (not isValidAdminCreds(adminEmail, adminPassword)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    serviceAccess.add(service, isPublic);
  };

  public query func serviceIsPublic(service : Text) : async Bool {
    switch (serviceAccess.get(service)) {
      case (null) { false };
      case (?v) { v };
    };
  };

  public query func serviceGetAllAccess(adminEmail : Text, adminPassword : Text) : async [(Text, Bool)] {
    if (not isValidAdminCreds(adminEmail, adminPassword)) {
      Runtime.trap("Unauthorized");
    };
    serviceAccess.entries().toArray();
  };

  // VISITOR ID MANAGEMENT (email/password auth)
  public shared func adminCreateVisitorId(adminEmail : Text, adminPassword : Text, service : Text, visitorName : Text, username : Text, password : Text, expiryDays : Nat) : async () {
    if (not isValidAdminCreds(adminEmail, adminPassword)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let now = Time.now();
    let expiresAt = now + (Int.fromNat(expiryDays) * NANOS_PER_DAY);
    let newID : VisitorID = { username; password; service; visitorName; createdAt = now; expiresAt };
    visitorIDs.add(username, newID);
  };

  public query func adminListVisitorIds(adminEmail : Text, adminPassword : Text) : async [VisitorID] {
    if (not isValidAdminCreds(adminEmail, adminPassword)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    visitorIDs.values().toArray();
  };

  public shared func adminDeleteVisitorId(adminEmail : Text, adminPassword : Text, username : Text) : async () {
    if (not isValidAdminCreds(adminEmail, adminPassword)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    visitorIDs.remove(username);
  };

  // OPEN ADMIN FUNCTIONS
  public shared func openCreateVisitorId(service : Text, visitorName : Text, username : Text, password : Text, expiryDays : Nat) : async () {
    if (expiryDays == 0) { Runtime.trap("Invalid expiry days") };
    let now = Time.now();
    let expiresAt = now + (Int.fromNat(expiryDays) * NANOS_PER_DAY);
    let newID : VisitorID = { username; password; service; visitorName; createdAt = now; expiresAt };
    visitorIDs.add(username, newID);
  };

  public query func openListVisitorIds() : async [VisitorID] {
    visitorIDs.values().toArray();
  };

  public shared func openDeleteVisitorId(username : Text) : async () {
    visitorIDs.remove(username);
  };

  // II-BASED VISITOR ID (compat)
  public shared ({ caller }) func visitorCreateId(adminEmail : Text, adminPassword : Text, service : Text, visitorName : Text, username : Text, password : Text, expiryDays : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    if (adminEmail != VISITOR_ADMIN_EMAIL or adminPassword != VISITOR_ADMIN_PASS) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let now = Time.now();
    let expiresAt = now + (Int.fromNat(expiryDays) * NANOS_PER_DAY);
    let newID : VisitorID = { username; password; service; visitorName; createdAt = now; expiresAt };
    visitorIDs.add(username, newID);
  };

  public query func visitorValidateId(service : Text, username : Text, password : Text) : async Bool {
    switch (visitorIDs.get(username)) {
      case (null) { false };
      case (?vid) {
        if (not serviceInList(service, vid.service)) { return false };
        if (vid.password != password) { return false };
        if (Time.now() > vid.expiresAt) { return false };
        true;
      };
    };
  };

  public query func visitorLoginByEmail(email : Text, password : Text) : async ?{ service : Text; visitorName : Text } {
    switch (visitorIDs.get(email)) {
      case (null) { null };
      case (?vid) {
        if (vid.password != password) { return null };
        if (Time.now() > vid.expiresAt) { return null };
        ?{ service = vid.service; visitorName = vid.visitorName };
      };
    };
  };

  public query ({ caller }) func visitorListIds(adminEmail : Text, adminPassword : Text) : async [VisitorID] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    if (adminEmail != VISITOR_ADMIN_EMAIL or adminPassword != VISITOR_ADMIN_PASS) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    visitorIDs.values().toArray();
  };

  public shared ({ caller = _ }) func visitorDeleteId(adminEmail : Text, adminPassword : Text, username : Text) : async () {
    if (adminEmail != VISITOR_ADMIN_EMAIL or adminPassword != VISITOR_ADMIN_PASS) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    visitorIDs.remove(username);
  };

  // NUMEROLOGY USER MANAGEMENT
  public func numerologyLogin(username : Text, password : Text) : async Nat {
    switch (numerologyUsers.get(username)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (user.passwordHash == password) { user.sectionLevel }
        else { Runtime.trap("Wrong password") };
      };
    };
  };

  public shared ({ caller }) func numerologyCreateUser(adminUsername : Text, adminPassword : Text, username : Text, password : Text, sectionLevel : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    if (adminUsername != ADMIN_USER or adminPassword != ADMIN_PASS) {
      Runtime.trap("Unauthorized: Invalid numerology admin credentials");
    };
    if (sectionLevel < 1 or sectionLevel > 9) { Runtime.trap("Section level must be 1-9") };
    numerologyUsers.add(username, { username; passwordHash = password; sectionLevel });
  };

  public query ({ caller }) func numerologyListUsers(adminUsername : Text, adminPassword : Text) : async [NumerologyUser] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    if (adminUsername != ADMIN_USER or adminPassword != ADMIN_PASS) {
      Runtime.trap("Unauthorized");
    };
    numerologyUsers.values().toArray();
  };

  public shared ({ caller }) func numerologyDeleteUser(adminUsername : Text, adminPassword : Text, username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    if (adminUsername != ADMIN_USER or adminPassword != ADMIN_PASS) {
      Runtime.trap("Unauthorized");
    };
    numerologyUsers.remove(username);
  };

  // USER PROFILES
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (profile.id != caller) { Runtime.trap("Unauthorized") };
    let updatedProfile : UserProfile = switch (userProfiles.get(profile.id)) {
      case (null) { { profile with createdAt = Time.now() } : UserProfile };
      case (?existing) { { profile with createdAt = existing.createdAt } : UserProfile };
    };
    userProfiles.add(profile.id, updatedProfile);
  };

  // SERVICES
  public query func getServices() : async [Service] { predefinedServices };

  // BLOG POSTS
  public query func getAllPosts() : async [BlogPost] {
    blogPosts.values().toArray().filter(func(post) { post.published }).sort(BlogPost.compareByCreatedAt);
  };

  public query ({ caller }) func getAllPostsAdmin() : async [BlogPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    blogPosts.values().toArray().sort(BlogPost.compareByCreatedAt);
  };

  public shared ({ caller }) func createPost(title : Text, content : Text, author : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    let id = getNextBlogPostId();
    blogPosts.add(id, { id; title; content; author; createdAt = Time.now(); published = false });
    id;
  };

  public shared ({ caller }) func updatePost(id : Text, title : Text, content : Text, author : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    let post = switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };
    blogPosts.add(id, { post with title; content; author });
  };

  public shared ({ caller }) func deletePost(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    blogPosts.remove(id);
  };

  public shared ({ caller }) func publishPost(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    let post = switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };
    blogPosts.add(id, { post with published = true });
  };

  // ADMIN EMAIL/PASS BLOG FUNCTIONS
  public query func adminGetAllPosts(adminEmail : Text, adminPassword : Text) : async [BlogPost] {
    if (not isValidAdminCreds(adminEmail, adminPassword)) { Runtime.trap("Unauthorized") };
    blogPosts.values().toArray().sort(BlogPost.compareByCreatedAt);
  };

  public shared func adminCreatePost(adminEmail : Text, adminPassword : Text, title : Text, content : Text, author : Text) : async Text {
    if (not isValidAdminCreds(adminEmail, adminPassword)) { Runtime.trap("Unauthorized") };
    let id = getNextBlogPostId();
    blogPosts.add(id, { id; title; content; author; createdAt = Time.now(); published = false });
    id;
  };

  public shared func adminUpdatePost(adminEmail : Text, adminPassword : Text, id : Text, title : Text, content : Text, author : Text) : async () {
    if (not isValidAdminCreds(adminEmail, adminPassword)) { Runtime.trap("Unauthorized") };
    let post = switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };
    blogPosts.add(id, { post with title; content; author });
  };

  public shared func adminDeletePost(adminEmail : Text, adminPassword : Text, id : Text) : async () {
    if (not isValidAdminCreds(adminEmail, adminPassword)) { Runtime.trap("Unauthorized") };
    blogPosts.remove(id);
  };

  public shared func adminPublishPost(adminEmail : Text, adminPassword : Text, id : Text) : async () {
    if (not isValidAdminCreds(adminEmail, adminPassword)) { Runtime.trap("Unauthorized") };
    let post = switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };
    blogPosts.add(id, { post with published = not post.published });
  };

  // INQUIRIES
  public shared ({ caller = _ }) func submitInquiry(inquiry : Inquiry) : async Text {
    let newId = getNextInquiryId();
    let newInquiry : Inquiry = { inquiry with id = newId; submittedAt = Time.now() };
    inquiries.add(newId, newInquiry);
    newId;
  };

  public query ({ caller }) func getAllInquiries() : async [Inquiry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    inquiries.values().toArray().sort(func(i1, i2) { Int.compare(i2.submittedAt, i1.submittedAt) });
  };

  public shared ({ caller }) func deleteInquiry(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    inquiries.remove(id);
  };

  // VISITOR QUERIES
  public shared func submitVisitorQuery(name : Text, contactInfo : Text, message : Text) : async () {
    visitorQueries.add(getNextVisitorQueryId(), { name; contactInfo; message; submittedAt = Time.now() });
  };

  public query func adminGetVisitorQueries(adminEmail : Text, adminPassword : Text) : async [VisitorQuery] {
    if (not isValidAdminCreds(adminEmail, adminPassword)) { Runtime.trap("Unauthorized") };
    visitorQueries.values().toArray().sort(func(q1, q2) { Int.compare(q2.submittedAt, q1.submittedAt) });
  };

  public query ({ caller }) func getVisitorQueries() : async [VisitorQuery] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    visitorQueries.values().toArray().sort(func(q1, q2) { Int.compare(q2.submittedAt, q1.submittedAt) });
  };

  // NOTICE BOARD (email/pass)
  public shared func adminCreateNotice(adminEmail : Text, adminPassword : Text, title : Text, message : Text) : async Text {
    if (not isValidAdminCreds(adminEmail, adminPassword)) { Runtime.trap("Unauthorized") };
    let id = getNextNoticeId();
    notices.add(id, { id; title; message; createdAt = Time.now(); active = true });
    id;
  };

  public query func adminListNotices(adminEmail : Text, adminPassword : Text) : async [Notice] {
    if (not isValidAdminCreds(adminEmail, adminPassword)) { Runtime.trap("Unauthorized") };
    notices.values().toArray().sort(func(n1, n2) { Int.compare(n2.createdAt, n1.createdAt) });
  };

  public shared func adminDeleteNotice(adminEmail : Text, adminPassword : Text, id : Text) : async () {
    if (not isValidAdminCreds(adminEmail, adminPassword)) { Runtime.trap("Unauthorized") };
    notices.remove(id);
  };

  public shared func adminToggleNotice(adminEmail : Text, adminPassword : Text, id : Text) : async () {
    if (not isValidAdminCreds(adminEmail, adminPassword)) { Runtime.trap("Unauthorized") };
    let notice = switch (notices.get(id)) {
      case (null) { Runtime.trap("Notice not found") };
      case (?n) { n };
    };
    notices.add(id, { notice with active = not notice.active });
  };

  // NOTICE BOARD (II-based compat)
  public shared ({ caller }) func noticeCreate(adminEmail : Text, adminPassword : Text, title : Text, message : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    if (adminEmail != VISITOR_ADMIN_EMAIL or adminPassword != VISITOR_ADMIN_PASS) {
      Runtime.trap("Unauthorized");
    };
    let id = getNextNoticeId();
    notices.add(id, { id; title; message; createdAt = Time.now(); active = true });
    id;
  };

  public query func noticeList() : async [Notice] {
    notices.values().toArray().filter(func(n) { n.active }).sort(func(n1, n2) { Int.compare(n2.createdAt, n1.createdAt) });
  };

  public query ({ caller }) func noticeListAll(adminEmail : Text, adminPassword : Text) : async [Notice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    if (adminEmail != VISITOR_ADMIN_EMAIL or adminPassword != VISITOR_ADMIN_PASS) {
      Runtime.trap("Unauthorized");
    };
    notices.values().toArray().sort(func(n1, n2) { Int.compare(n2.createdAt, n1.createdAt) });
  };

  public shared ({ caller }) func noticeDelete(adminEmail : Text, adminPassword : Text, id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    if (adminEmail != VISITOR_ADMIN_EMAIL or adminPassword != VISITOR_ADMIN_PASS) {
      Runtime.trap("Unauthorized");
    };
    notices.remove(id);
  };

  public shared ({ caller }) func noticeToggleActive(adminEmail : Text, adminPassword : Text, id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    if (adminEmail != VISITOR_ADMIN_EMAIL or adminPassword != VISITOR_ADMIN_PASS) {
      Runtime.trap("Unauthorized");
    };
    let notice = switch (notices.get(id)) {
      case (null) { Runtime.trap("Notice not found") };
      case (?n) { n };
    };
    notices.add(id, { notice with active = not notice.active });
  };
};
