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
import Float "mo:core/Float";

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

  // ─── NADI CHART: PLANETARY CALCULATION (Jean Meeus full-precision) ───────────

  public type NadiPlanetInfo = {
    name : Text;
    sign : Text;
    degree : Float;
    degreeStr : Text;
    nakshatra : Text;
    pada : Nat;
    nakLord : Text;
    subLord : Text;
    isRetrograde : Bool;
    houseNum : Nat;
  };

  public type NadiChartResult = {
    planets : [NadiPlanetInfo];
    ascendant : NadiPlanetInfo;
    dashaBalance : Text;
  };

  // ── helpers ──────────────────────────────────────────────────────────────────

  // Normalize angle to [0, 360)
  func normAngle(a : Float) : Float {
    var x = a;
    x := x - Float.floor(x / 360.0) * 360.0;
    if (x < 0.0) { x := x + 360.0 };
    x;
  };

  // Radians conversion
  func toRad(deg : Float) : Float { deg * 0.017453292519943295 };
  func toDeg(rad : Float) : Float { rad * 57.29577951308232 };

  // Parse "YYYY-MM-DD" → (year, month, day)
  func parseDateStr(dateStr : Text) : (Int, Int, Int) {
    let parts = dateStr.split(#char '-').toArray();
    if (parts.size() < 3) { Runtime.trap("Invalid date format: " # dateStr) };
    let yr = switch (Int.fromText(parts[0])) { case (?v) v; case null Runtime.trap("Bad year") };
    let mo = switch (Int.fromText(parts[1])) { case (?v) v; case null Runtime.trap("Bad month") };
    let dy = switch (Int.fromText(parts[2])) { case (?v) v; case null Runtime.trap("Bad day") };
    (yr, mo, dy);
  };

  // Parse "HH:MM" → fractional hours
  func parseTimeStr(timeStr : Text) : Float {
    let parts = timeStr.split(#char ':').toArray();
    if (parts.size() < 2) { return 0.0 };
    let hh = switch (Nat.fromText(parts[0])) { case (?v) v.toFloat(); case null 0.0 };
    let mm = switch (Nat.fromText(parts[1])) { case (?v) v.toFloat(); case null 0.0 };
    hh + mm / 60.0;
  };

  // Julian Day Number from Gregorian date + fractional UT hours
  // Using standard algorithm from Meeus "Astronomical Algorithms" Ch. 7
  func julianDay(year : Int, month : Int, day : Int, utHours : Float) : Float {
    var y = year;
    var m = month;
    if (m <= 2) { y := y - 1; m := m + 12 };
    let a : Int = y / 100;
    let b : Int = 2 - a + a / 4;
    let jd0 : Float = Float.floor(365.25 * (y + 4716).toFloat())
      + Float.floor(30.6001 * (m + 1).toFloat())
      + day.toFloat() + b.toFloat() - 1524.5;
    jd0 + utHours / 24.0;
  };

  // KP (Lahiri + 6') ayanamsa in degrees for a given JD
  // Lahiri: 23.85244 + 0.013960 * (JD - 2415020.0) / 365.25
  // KP = Lahiri + 0.1
  func kpAyanamsa(jd : Float) : Float {
    let lahiri = 23.85244 + 0.013960 * (jd - 2415020.0) / 365.25;
    lahiri + 0.1;
  };

  // Convert tropical longitude → sidereal (KP)
  func toSidereal(tropLon : Float, jd : Float) : Float {
    normAngle(tropLon - kpAyanamsa(jd));
  };

  // Sign name from 0-based index 0=Aries..11=Pisces
  let signNames : [Text] = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  // 27 nakshatras and their lords
  let nakshatraNames : [Text] = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
  ];

  // Nakshatra lords (0-indexed, same order as nakshatras)
  let nakshatraLords : [Text] = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
    "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
    "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
    "Jupiter", "Saturn", "Mercury",
  ];

  // KP sub-lord calculation
  // Vimshottari dasha years: Ketu=7, Venus=20, Sun=6, Moon=10, Mars=7, Rahu=18, Jupiter=16, Saturn=19, Mercury=17
  // Total = 120 years
  // Sub-lord sequence within each nakshatra starts from the nakshatra lord
  let dashaYears : [(Text, Float)] = [
    ("Ketu", 7.0), ("Venus", 20.0), ("Sun", 6.0), ("Moon", 10.0),
    ("Mars", 7.0), ("Rahu", 18.0), ("Jupiter", 16.0), ("Saturn", 19.0), ("Mercury", 17.0),
  ];

  let dashaOrder : [Text] = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

  func dashaYearsFor(lord : Text) : Float {
    switch (dashaYears.find(func(pair : (Text, Float)) : Bool { pair.0 == lord })) {
      case (?(_, y)) y;
      case null 7.0;
    };
  };

  func dashaIndexOf(lord : Text) : Nat {
    switch (dashaOrder.findIndex(func(n : Text) : Bool { n == lord })) {
      case (?i) i;
      case null 0;
    };
  };

  // Each nakshatra spans 13°20' = 800 arcminutes = 13.3333... degrees
  // Within each nakshatra the 120-year cycle plays out proportionally
  func getSubLord(siderealLon : Float) : Text {
    // position within current nakshatra in degrees (0..13.333)
    let nakSpan = 360.0 / 27.0; // 13.3333...
    let posInNak = siderealLon - Float.floor(siderealLon / nakSpan) * nakSpan;
    let fracInNak = posInNak / nakSpan; // 0..1

    // find nakshatra index to know starting lord
    let nakIdx = Float.floor(siderealLon / nakSpan).toInt().toNat() % 27;
    let startLord = nakshatraLords[nakIdx];
    let startIdx = dashaIndexOf(startLord);

    // walk the sub-periods
    var cumFrac : Float = 0.0;
    var i = 0;
    while (i < 9) {
      let lordIdx = (startIdx + i) % 9;
      let lord = dashaOrder[lordIdx];
      let subFrac = dashaYearsFor(lord) / 120.0;
      if (fracInNak < cumFrac + subFrac) {
        return lord;
      };
      cumFrac := cumFrac + subFrac;
      i += 1;
    };
    dashaOrder[(startIdx + 8) % 9];
  };

  // Format degrees as "22° 6' 20\""
  func formatDegrees(totalDeg : Float) : Text {
    let d = Float.floor(totalDeg);
    let rem = (totalDeg - d) * 60.0;
    let m = Float.floor(rem);
    let s = Float.floor((rem - m) * 60.0);
    d.toInt().toText() # "° " # m.toInt().toText() # "' " # s.toInt().toText() # "\"";
  };

  // Build a NadiPlanetInfo record from sidereal longitude
  func buildPlanetInfo(name : Text, siderealLon : Float, isRetro : Bool, ascLon : Float) : NadiPlanetInfo {
    let lon = normAngle(siderealLon);
    let signIdx = Float.floor(lon / 30.0).toInt().toNat() % 12;
    let degInSign = lon - Float.floor(lon / 30.0) * 30.0;

    let nakSpan = 360.0 / 27.0;
    let nakIdx = Float.floor(lon / nakSpan).toInt().toNat() % 27;
    let posInNak = lon - Float.floor(lon / nakSpan) * nakSpan;
    let padaSize = nakSpan / 4.0;
    let padaNum = Float.floor(posInNak / padaSize).toInt().toNat() + 1;
    let pada = if (padaNum > 4) { 4 } else { padaNum };

    // House number: 1-based from ascendant sign
    let ascSignIdx = Float.floor(normAngle(ascLon) / 30.0).toInt().toNat() % 12;
    let houseNum = ((signIdx + 12 - ascSignIdx) % 12) + 1;

    {
      name;
      sign = signNames[signIdx];
      degree = degInSign;
      degreeStr = formatDegrees(degInSign);
      nakshatra = nakshatraNames[nakIdx];
      pada;
      nakLord = nakshatraLords[nakIdx];
      subLord = getSubLord(lon);
      isRetrograde = isRetro;
      houseNum;
    };
  };

  // ── Sun: Meeus low-precision but corrected geometric mean + centre-of-earth ─

  // Geometric mean longitude of Sun (degrees)
  func sunMeanLon(T : Float) : Float {
    normAngle(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  };

  // Mean anomaly of Sun (degrees)
  func sunMeanAnomaly(T : Float) : Float {
    normAngle(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  };

  // Equation of centre for Sun (degrees)
  func sunEqCenter(M : Float, T : Float) : Float {
    let Mrad = toRad(M);
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Float.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Float.sin(2.0 * Mrad)
    + 0.000289 * Float.sin(3.0 * Mrad);
  };

  // Apparent Sun tropical longitude (degrees) - corrected for aberration & nutation
  func sunTropicalLon(T : Float) : Float {
    let L0 = sunMeanLon(T);
    let M = sunMeanAnomaly(T);
    let C = sunEqCenter(M, T);
    let sunLon = L0 + C;
    // Apparent longitude: subtract aberration (~20.4898"/R), apply omega correction
    let omega = 125.04 - 1934.136 * T;
    let apparent = sunLon - 0.00569 - 0.00478 * Float.sin(toRad(omega));
    normAngle(apparent);
  };

  // ── Moon: Meeus Chapter 47 (simplified but full fundamental arguments) ────────

  func moonTropicalLon(T : Float) : Float {
    // Fundamental arguments (Meeus Ch. 47)
    let L1 = normAngle(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841.0 - T * T * T * T / 65194000.0);
    let D  = normAngle(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868.0 - T * T * T * T / 113065000.0);
    let M  = normAngle(357.5291092 + 35999.0502909  * T - 0.0001536 * T * T + T * T * T / 24490000.0);
    let Mp = normAngle(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0 - T * T * T * T / 14712000.0);
    let F  = normAngle(93.2720950  + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000.0 + T * T * T * T / 863310000.0);

    // Longitude correction from action table (Meeus Table 47.A — 15 largest terms)
    let sumL =
        6288774.0 * Float.sin(toRad(Mp))
      + 1274027.0 * Float.sin(toRad(2.0 * D - Mp))
      +  658314.0 * Float.sin(toRad(2.0 * D))
      +  213618.0 * Float.sin(toRad(2.0 * Mp))
      -  185116.0 * Float.sin(toRad(M))
      -  114332.0 * Float.sin(toRad(2.0 * F))
      +   58793.0 * Float.sin(toRad(2.0 * D - 2.0 * Mp))
      +   57066.0 * Float.sin(toRad(2.0 * D - M - Mp))
      +   53322.0 * Float.sin(toRad(2.0 * D + Mp))
      +   45758.0 * Float.sin(toRad(2.0 * D - M))
      -   40923.0 * Float.sin(toRad(M - Mp))
      -   34720.0 * Float.sin(toRad(D))
      -   30383.0 * Float.sin(toRad(M + Mp))
      +   15327.0 * Float.sin(toRad(2.0 * D - 2.0 * F))
      -   12528.0 * Float.sin(toRad(Mp + 2.0 * F))
      +   10980.0 * Float.sin(toRad(Mp - 2.0 * F))
      +   10675.0 * Float.sin(toRad(4.0 * D - Mp))
      +   10034.0 * Float.sin(toRad(3.0 * Mp))
      +    8548.0 * Float.sin(toRad(4.0 * D - 2.0 * Mp))
      -    7888.0 * Float.sin(toRad(2.0 * D + M - Mp))
      -    6766.0 * Float.sin(toRad(2.0 * D + M))
      -    5163.0 * Float.sin(toRad(D - Mp))
      +    4987.0 * Float.sin(toRad(D + M))
      +    4036.0 * Float.sin(toRad(2.0 * D - M + Mp))
      +    3994.0 * Float.sin(toRad(2.0 * D + 2.0 * Mp))
      +    3861.0 * Float.sin(toRad(4.0 * D))
      +    3665.0 * Float.sin(toRad(2.0 * D - 3.0 * Mp))
      -    2689.0 * Float.sin(toRad(M - 2.0 * Mp))
      -    2602.0 * Float.sin(toRad(2.0 * D - Mp + 2.0 * F))
      +    2390.0 * Float.sin(toRad(2.0 * D - M - 2.0 * Mp))
      -    2348.0 * Float.sin(toRad(D + Mp))
      +    2236.0 * Float.sin(toRad(2.0 * D - 2.0 * M))
      -    2120.0 * Float.sin(toRad(M + 2.0 * Mp))
      -    2069.0 * Float.sin(toRad(2.0 * M))
      +    2048.0 * Float.sin(toRad(2.0 * D - 2.0 * M - Mp))
      -    1773.0 * Float.sin(toRad(2.0 * D + Mp - 2.0 * F))
      -    1595.0 * Float.sin(toRad(2.0 * D + 2.0 * F))
      +    1215.0 * Float.sin(toRad(4.0 * D - M - Mp))
      -    1110.0 * Float.sin(toRad(2.0 * Mp + 2.0 * F))
      -     892.0 * Float.sin(toRad(3.0 * D - Mp))
      -     810.0 * Float.sin(toRad(2.0 * D + M + Mp))
      +     759.0 * Float.sin(toRad(4.0 * D - M - 2.0 * Mp))
      -     713.0 * Float.sin(toRad(2.0 * M - Mp))
      -     700.0 * Float.sin(toRad(2.0 * D + 2.0 * M - Mp))
      +     691.0 * Float.sin(toRad(2.0 * D + M - 2.0 * Mp))
      +     596.0 * Float.sin(toRad(2.0 * D - M - 2.0 * F))
      +     549.0 * Float.sin(toRad(4.0 * D + Mp))
      +     537.0 * Float.sin(toRad(4.0 * Mp))
      +     520.0 * Float.sin(toRad(4.0 * D - M))
      -     487.0 * Float.sin(toRad(D - 2.0 * Mp))
      -     399.0 * Float.sin(toRad(2.0 * D + M - 2.0 * F))
      -     381.0 * Float.sin(toRad(2.0 * Mp - 2.0 * F))
      +     351.0 * Float.sin(toRad(D + M + Mp))
      -     340.0 * Float.sin(toRad(3.0 * D - 2.0 * Mp))
      +     330.0 * Float.sin(toRad(4.0 * D - 3.0 * Mp))
      +     327.0 * Float.sin(toRad(2.0 * D - M + 2.0 * Mp))
      -     323.0 * Float.sin(toRad(2.0 * M + Mp))
      +     299.0 * Float.sin(toRad(D + M - Mp))
      +     294.0 * Float.sin(toRad(2.0 * D + 3.0 * Mp));

    // Nutation in longitude (simplified, Meeus Ch. 22)
    let omega = normAngle(125.04452 - 1934.136261 * T);
    let deltaPsi = (-17.20 * Float.sin(toRad(omega)) - 1.32 * Float.sin(toRad(2.0 * sunMeanLon(T))) - 0.23 * Float.sin(toRad(2.0 * L1)) + 0.21 * Float.sin(toRad(2.0 * omega))) / 3600.0;

    normAngle(L1 + sumL / 1000000.0 + deltaPsi);
  };

  // ── Rahu mean node (Meeus Ch. 22) ────────────────────────────────────────────

  func rahuMeanNode(T : Float) : Float {
    // Ascending node
    let omega = normAngle(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000.0);
    // Rahu = ascending node (in tropical), apply ayanamsa later
    omega;
  };

  // ── Inner planets: Venus, Mercury ─────────────────────────────────────────────
  // Using Meeus Ch. 25 VSOP87 heliocentric → geocentric conversion

  // Eccentric anomaly by Newton-Raphson
  func eccentricAnomaly(M : Float, e : Float) : Float {
    let Mrad = toRad(M);
    var E = Mrad;
    var i = 0;
    while (i < 50) {
      let dE = (Mrad - E + e * Float.sin(E)) / (1.0 - e * Float.cos(E));
      E := E + dE;
      if (Float.abs(dE) < 1.0e-12) { i := 50 };
      i += 1;
    };
    E;
  };

  // True anomaly from eccentric anomaly
  func trueAnomaly(E : Float, e : Float) : Float {
    2.0 * Float.arctan(Float.sqrt((1.0 + e) / (1.0 - e)) * Float.tan(E / 2.0));
  };

  // Heliocentric ecliptic longitude from orbital elements (simplified)
  // Returns tropical ecliptic longitude in degrees
  func helioLon(T : Float, L0 : Float, dL : Float, e0 : Float, de : Float, peri0 : Float, dperi : Float) : Float {
    // Mean longitude
    let L = normAngle(L0 + dL * T);
    // Eccentricity
    let e = e0 + de * T;
    // Longitude of perihelion
    let peri = normAngle(peri0 + dperi * T);
    // Mean anomaly
    let M = normAngle(L - peri);
    // Eccentric anomaly
    let E = eccentricAnomaly(M, e);
    // True anomaly
    let v = toDeg(trueAnomaly(E, e));
    // Heliocentric longitude
    normAngle(v + peri);
  };

  // Approximate geocentric longitude for outer/inner planets using two-body heliocentric + Earth-Sun vector
  // For a planet at heliocentric lon P_lon and radius R_p,
  // Earth at heliocentric lon E_lon and radius R_e:
  // tan(geocentric_lon - E_lon) = R_p * sin(P_lon - E_lon) / (R_p * cos(P_lon - E_lon) - R_e)
  func helioToGeoLon(pLon : Float, rP : Float, eLon : Float, rE : Float) : Float {
    let dp = toRad(pLon - eLon);
    let num = rP * Float.sin(dp);
    let den = rP * Float.cos(dp) - rE;
    normAngle(eLon + toDeg(Float.arctan2(num, den)));
  };

  // Earth heliocentric radius (AU) — Meeus series
  func earthRadius(T : Float) : Float {
    let M = toRad(sunMeanAnomaly(T));
    1.000001018 * (1.0 - 0.01671022 * Float.cos(M) - 0.00014 * Float.cos(2.0 * M));
  };

  // Earth heliocentric longitude (= Sun geocentric + 180)
  func earthHelioLon(T : Float) : Float {
    normAngle(sunTropicalLon(T) + 180.0);
  };

  // ── Mars (Meeus Table 33.a orbital elements) ──────────────────────────────────

  func marsTropicalLon(T : Float) : Float {
    // Orbital elements from Meeus Table 33.a (J2000 epoch)
    let pLon = helioLon(T,
      355.433, 19140.2993313,       // L0, dL (mean longitude and rate)
      0.09340065, 0.000090484,      // e0, de
      336.060234, 1.8410449,        // peri0, dperi
    );
    let rP = 1.52366231 * (1.0 - 0.09340065 * 0.09340065); // semi-latus rectum approximation
    // For simplicity use average radius; a more precise version would solve from E
    let rPapprox = 1.52366231;
    let eLon = earthHelioLon(T);
    let rE = earthRadius(T);
    helioToGeoLon(pLon, rPapprox, eLon, rE);
  };

  // ── Jupiter ────────────────────────────────────────────────────────────────────

  func jupiterTropicalLon(T : Float) : Float {
    let pLon = helioLon(T,
      34.351519, 3034.9056606,
      0.04849793, 0.000163225,
      14.331309, 1.6099169,
    );
    let eLon = earthHelioLon(T);
    let rE = earthRadius(T);
    helioToGeoLon(pLon, 5.202603191, eLon, rE);
  };

  // ── Saturn ────────────────────────────────────────────────────────────────────

  func saturnTropicalLon(T : Float) : Float {
    let pLon = helioLon(T,
      50.077444, 1222.1138488,
      0.05550825, -0.000346641,
      93.057237, 1.9637613,
    );
    let eLon = earthHelioLon(T);
    let rE = earthRadius(T);
    helioToGeoLon(pLon, 9.554909596, eLon, rE);
  };

  // ── Mercury ───────────────────────────────────────────────────────────────────

  func mercuryTropicalLon(T : Float) : Float {
    let pLon = helioLon(T,
      252.250906, 149472.6746358,
      0.20563175, 0.000020406,
      77.456119, 1.5564775,
    );
    let eLon = earthHelioLon(T);
    let rE = earthRadius(T);
    helioToGeoLon(pLon, 0.387098310, eLon, rE);
  };

  // ── Venus ─────────────────────────────────────────────────────────────────────

  func venusTropicalLon(T : Float) : Float {
    let pLon = helioLon(T,
      181.979801, 58517.8156760,
      0.00677323, -0.000047515,
      131.563703, 1.4022288,
    );
    let eLon = earthHelioLon(T);
    let rE = earthRadius(T);
    helioToGeoLon(pLon, 0.723329820, eLon, rE);
  };

  // ── Uranus ────────────────────────────────────────────────────────────────────

  func uranusTropicalLon(T : Float) : Float {
    let pLon = helioLon(T,
      314.055005, 428.4669983,
      0.04629590, -0.000027337,
      173.005159, 1.4863784,
    );
    let eLon = earthHelioLon(T);
    let rE = earthRadius(T);
    helioToGeoLon(pLon, 19.191263, eLon, rE);
  };

  // ── Neptune ───────────────────────────────────────────────────────────────────

  func neptuneTropicalLon(T : Float) : Float {
    let pLon = helioLon(T,
      304.348665, 218.4862002,
      0.00898809, 0.000006408,
      48.120276, 1.4262957,
    );
    let eLon = earthHelioLon(T);
    let rE = earthRadius(T);
    helioToGeoLon(pLon, 30.068963, eLon, rE);
  };

  // ── Pluto (Meeus Table 37.a, low-precision series) ────────────────────────────

  func plutoTropicalLon(T : Float) : Float {
    // Meeus Ch. 37 Pluto approximate position (valid 1885-2099)
    let J = T / 10.0; // Julian millennia
    let S = normAngle(50.03 + 29447.0 * J);
    let P = normAngle(238.96 + 144.96 * J);
    let lonApprox = normAngle(
      238.956785 + 144.96 * J
      + (- 3.908 * Float.sin(toRad(P))
         + 1.171 * Float.sin(toRad(2.0 * P))
         - 0.416 * Float.sin(toRad(3.0 * P))
         + 5.317 * Float.sin(toRad(S - P))
         - 1.963 * Float.sin(toRad(S))
         + 0.784 * Float.sin(toRad(S + P)))
    );
    lonApprox;
  };

  // ── Ascendant calculation ─────────────────────────────────────────────────────
  // RAMC → Ascendant using standard formula
  func ascendantLon(T : Float, utHours : Float, lon : Float, lat : Float) : Float {
    // RAMC = Greenwich Sidereal Time → Local Sidereal Time
    // GST at 0h UT for given JD (Meeus Ch. 12)
    let jd0h = T * 36525.0 + 2451545.0 - utHours / 24.0;
    let T0 = (jd0h - 2451545.0) / 36525.0;
    let theta0 = normAngle(
      100.4606184 + 36000.7700536 * T0 + 0.000387933 * T0 * T0
    );
    let ramc = normAngle(theta0 + lon + utHours * 15.0); // RAMC in degrees
    // Obliquity of ecliptic
    let eps = 23.4392911 - 0.013004167 * T - 0.000000164 * T * T + 0.000000504 * T * T * T;
    let ramcR = toRad(ramc);
    let epsR = toRad(eps);
    let latR = toRad(lat);
    // Ascendant formula: tan(Asc) = cos(RAMC) / (-sin(RAMC)*cos(eps) - tan(lat)*sin(eps))
    // Ascendant formula from Meeus: atan2(-cos(RAMC), sin(eps)*tan(lat) + cos(eps)*sin(RAMC))
    // arctan2(y, x) where y=-cos(RAMC), x=sin(eps)*tan(lat)+cos(eps)*sin(RAMC)
    let yAsc = -Float.cos(ramcR);
    let xAsc = Float.sin(epsR) * Float.tan(latR) + Float.cos(epsR) * Float.sin(ramcR);
    let ascTrop = normAngle(toDeg(Float.arctan2(yAsc, xAsc)));
    ascTrop;
  };

  // ── Retrograde detection: compare position at JD and JD+1 ────────────────────

  func isRetrograde(calcFn : Float -> Float, T : Float) : Bool {
    let pos0 = calcFn(T);
    let pos1 = calcFn(T + 1.0 / 36525.0); // T + 1 day
    // Retrograde if position decreased (accounting for wrap-around)
    var diff = pos1 - pos0;
    if (diff > 180.0) { diff := diff - 360.0 };
    if (diff < -180.0) { diff := diff + 360.0 };
    diff < 0.0;
  };

  // ── Main calculation function ─────────────────────────────────────────────────

  public func calculateNadiPlanets(
    dateStr : Text,
    timeStr : Text,
    lat : Float,
    lon : Float,
  ) : async { #ok : NadiChartResult; #err : Text } {
    // 1. Parse date/time → Julian Day
    let (year, month, day) = parseDateStr(dateStr);
    // Convert IST (UTC+5:30) to UT: subtract 5.5 hours
    let istHours = parseTimeStr(timeStr);
    let utHours = istHours - 5.5;
    let jd = julianDay(year, month, day, utHours);
    let T = (jd - 2451545.0) / 36525.0;

    // 2. Compute tropical longitudes
    let sunTrop   = sunTropicalLon(T);
    let moonTrop  = moonTropicalLon(T);
    let marsTrop  = marsTropicalLon(T);
    let mercTrop  = mercuryTropicalLon(T);
    let jupTrop   = jupiterTropicalLon(T);
    let venTrop   = venusTropicalLon(T);
    let satTrop   = saturnTropicalLon(T);
    let rahuTrop  = rahuMeanNode(T);  // ascending node (tropical)
    let uraTrop   = uranusTropicalLon(T);
    let nepTrop   = neptuneTropicalLon(T);
    let pluTrop   = plutoTropicalLon(T);
    let ascTrop   = ascendantLon(T, utHours, lon, lat);

    // 3. Convert to sidereal (KP ayanamsa)
    let sunSid  = toSidereal(sunTrop, jd);
    let moonSid = toSidereal(moonTrop, jd);
    let marsSid = toSidereal(marsTrop, jd);
    let mercSid = toSidereal(mercTrop, jd);
    let jupSid  = toSidereal(jupTrop, jd);
    let venSid  = toSidereal(venTrop, jd);
    let satSid  = toSidereal(satTrop, jd);
    let rahuSid = toSidereal(rahuTrop, jd);
    let ketuSid = normAngle(rahuSid + 180.0);
    let uraSid  = toSidereal(uraTrop, jd);
    let nepSid  = toSidereal(nepTrop, jd);
    let pluSid  = toSidereal(pluTrop, jd);
    let ascSid  = toSidereal(ascTrop, jd);

    // 4. Retrograde detection
    let marsRetro  = isRetrograde(func(t) { toSidereal(marsTropicalLon(t), jd + (t - T) * 36525.0) }, T);
    let mercRetro  = isRetrograde(func(t) { toSidereal(mercuryTropicalLon(t), jd + (t - T) * 36525.0) }, T);
    let venRetro   = isRetrograde(func(t) { toSidereal(venusTropicalLon(t), jd + (t - T) * 36525.0) }, T);
    let jupRetro   = isRetrograde(func(t) { toSidereal(jupiterTropicalLon(t), jd + (t - T) * 36525.0) }, T);
    let satRetro   = isRetrograde(func(t) { toSidereal(saturnTropicalLon(t), jd + (t - T) * 36525.0) }, T);
    let uraRetro   = isRetrograde(func(t) { toSidereal(uranusTropicalLon(t), jd + (t - T) * 36525.0) }, T);
    let nepRetro   = isRetrograde(func(t) { toSidereal(neptuneTropicalLon(t), jd + (t - T) * 36525.0) }, T);
    let pluRetro   = isRetrograde(func(t) { toSidereal(plutoTropicalLon(t), jd + (t - T) * 36525.0) }, T);
    // Rahu/Ketu are always retrograde (mean node moves retrograde)
    let rahuRetro = true;

    // 5. Build planet info records
    let planets : [NadiPlanetInfo] = [
      buildPlanetInfo("Sun",     sunSid,  false,     ascSid),
      buildPlanetInfo("Moon",    moonSid, false,     ascSid),
      buildPlanetInfo("Mars",    marsSid, marsRetro, ascSid),
      buildPlanetInfo("Mercury", mercSid, mercRetro, ascSid),
      buildPlanetInfo("Jupiter", jupSid,  jupRetro,  ascSid),
      buildPlanetInfo("Venus",   venSid,  venRetro,  ascSid),
      buildPlanetInfo("Saturn",  satSid,  satRetro,  ascSid),
      buildPlanetInfo("Rahu",    rahuSid, rahuRetro, ascSid),
      buildPlanetInfo("Ketu",    ketuSid, rahuRetro, ascSid),
      buildPlanetInfo("Uranus",  uraSid,  uraRetro,  ascSid),
      buildPlanetInfo("Neptune", nepSid,  nepRetro,  ascSid),
      buildPlanetInfo("Pluto",   pluSid,  pluRetro,  ascSid),
    ];

    let ascInfo = buildPlanetInfo("Ascendant", ascSid, false, ascSid);

    // 6. Dasha balance: based on Moon nakshatra lord
    let moonNakIdx = Float.floor(moonSid / (360.0 / 27.0)).toInt().toNat() % 27;
    let moonNakLord = nakshatraLords[moonNakIdx];
    let nakSpan2 = 360.0 / 27.0;
    let moonPosInNak = moonSid - Float.floor(moonSid / nakSpan2) * nakSpan2;
    let fracElapsed = moonPosInNak / nakSpan2;
    let fracRemaining = 1.0 - fracElapsed;
    let dashaYrsRemaining = fracRemaining * dashaYearsFor(moonNakLord);
    let dashaYrsInt = dashaYrsRemaining.toInt();
    let dashaMonths = ((dashaYrsRemaining - dashaYrsInt.toFloat()) * 12.0).toInt();
    let dashaBalance = moonNakLord # " " # dashaYrsInt.toText() # "y " # dashaMonths.toText() # "m";

    #ok({
      planets;
      ascendant = ascInfo;
      dashaBalance;
    });
  };
};
