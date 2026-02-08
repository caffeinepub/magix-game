import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Nat32 "mo:core/Nat32";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Position = {
    x : Nat32;
    y : Nat32;
  };

  type Community = {
    name : Text;
    description : ?Text;
    members : Set.Set<Principal>;
  };

  // Immutable, serializable view type for persistent events
  type PersistentEventView = {
    id : Text;
    name : Text;
    committee : [Principal];
    startTime : Nat64;
    endTime : Nat64;
    isActive : Bool;
    community : Text;
  };

  type PersistentEvent = {
    id : Text;
    name : Text;
    committee : Set.Set<Principal>;
    startTime : Nat64;
    endTime : Nat64;
    isActive : Bool;
    community : Text;
  };

  type UserProfile = {
    displayName : Text;
    bio : Text;
    links : [Text];
  };

  type CommunityScopedUserProfile = {
    name : Text;
    services : [Text];
    activities : [Text];
    socialNetworkLinks : [Text];
  };

  type Construction = {
    size : Nat;
    parts : List.List<Position>;
    originalMembers : Set.Set<Principal>;
  };

  type BuildEligibility = {
    hasOptedIn : Bool;
    hasBuilt : Bool;
  };

  type BuildEligibilityMap = Map.Map<Principal, BuildEligibility>;

  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let communities = Map.empty<Text, Community>();
  let communityMaps = Map.empty<Text, Map.Map<Principal, Position>>();
  let persistentEvents = Map.empty<Text, PersistentEvent>();
  let activeConstructions = Map.empty<Text, Construction>();
  let completedConstructions = Map.empty<Text, List.List<Position>>();
  let communityScopedUserProfiles = Map.empty<Text, Map.Map<Principal, CommunityScopedUserProfile>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let eventBuildEligibility = Map.empty<Text, BuildEligibilityMap>();

  func isPersistentEventCommitteeMember(event : PersistentEvent, caller : Principal) : Bool {
    event.committee.contains(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (profile.displayName == "") {
      Runtime.trap("Display name cannot be empty");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveCommunityScopedUserProfile(
    communityName : Text,
    profile : CommunityScopedUserProfile,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save community-scoped profiles");
    };
    if (profile.name == "") {
      Runtime.trap("Name cannot be empty");
    };

    switch (communities.get(communityName)) {
      case (null) { Runtime.trap("Community does not exist") };
      case (?community) {
        if (not community.members.contains(caller)) {
          Runtime.trap("Unauthorized: Must be a member of the community to create/update profile");
        };
        switch (communityScopedUserProfiles.get(communityName)) {
          case (null) {
            let newMap = Map.empty<Principal, CommunityScopedUserProfile>();
            newMap.add(caller, profile);
            communityScopedUserProfiles.add(communityName, newMap);
          };
          case (?profiles) {
            profiles.add(caller, profile);
          };
        };
      };
    };
  };

  public query ({ caller }) func getCommunityScopedUserProfile(
    communityName : Text,
    user : Principal,
  ) : async ?CommunityScopedUserProfile {
    switch (communities.get(communityName)) {
      case (null) { Runtime.trap("Community does not exist") };
      case (?community) {
        if (not community.members.contains(caller)) {
          Runtime.trap("Must be a member of the community to view profiles");
        };
        switch (communityScopedUserProfiles.get(communityName)) {
          case (null) { null };
          case (?profiles) { profiles.get(user) };
        };
      };
    };
  };

  public shared ({ caller }) func createOrUpdateProfile(displayName : Text, bio : Text, links : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (displayName == "") {
      Runtime.trap("Display name cannot be empty");
    };
    let profile : UserProfile = {
      displayName;
      bio;
      links;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func createCommunity(name : Text, description : ?Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create a new community");
    };

    if (name == "") {
      Runtime.trap("Community name cannot be empty");
    };

    let newCommunity : Community = {
      name;
      description;
      members = Set.singleton<Principal>(caller);
    };
    communities.add(name, newCommunity);
    communityMaps.add(name, Map.singleton<Principal, Position>(caller, { x = 0 : Nat32; y = 0 : Nat32 }));

    name;
  };

  public query ({ caller }) func listCommunities() : async [(Text, ?Text)] {
    communities.values().toArray().map(func(community) { (community.name, community.description) });
  };

  public shared ({ caller }) func joinCommunity(communityName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join communities");
    };

    switch (communities.get(communityName)) {
      case (null) { Runtime.trap("Community does not exist") };
      case (?community) {
        if (community.members.contains(caller)) {
          Runtime.trap("Already a member of community");
        };

        community.members.add(caller);

        switch (communityMaps.get(communityName)) {
          case (null) { Runtime.trap("Community map does not exist") };
          case (?map) {
            map.add(caller, { x = 0 : Nat32; y = 0 : Nat32 });
          };
        };
      };
    };
  };

  public query ({ caller }) func listCommunityMembers(communityName : Text) : async [Principal] {
    switch (communities.get(communityName)) {
      case (null) { Runtime.trap("Community does not exist") };
      case (?community) {
        community.members.toArray();
      };
    };
  };

  public query ({ caller }) func getCommunityMap(communityName : Text) : async [(Principal, Position)] {
    switch (communityMaps.get(communityName)) {
      case (null) { Runtime.trap("Community map does not exist") };
      case (?map) {
        map.toArray();
      };
    };
  };

  public query ({ caller }) func getActiveConstruction(communityName : Text) : async ?[Position] {
    switch (activeConstructions.get(communityName)) {
      case (null) { null };
      case (?construction) {
        ?construction.parts.toArray();
      };
    };
  };

  public query ({ caller }) func getCompletedConstructions(communityName : Text) : async [Position] {
    switch (completedConstructions.get(communityName)) {
      case (null) { [] };
      case (?constructions) { constructions.toArray() };
    };
  };

  public shared ({ caller }) func createEvent(
    id : Text,
    name : Text,
    committee : [Principal],
    startTime : Nat64,
    endTime : Nat64,
    isActive : Bool,
    community : Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create events");
    };

    let newEvent : PersistentEvent = {
      id;
      name;
      committee = Set.fromArray<Principal>(committee);
      startTime;
      endTime;
      isActive;
      community;
    };
    persistentEvents.add(id, newEvent);
  };

  public shared ({ caller }) func updateEventStatus(eventId : Text, isActive : Bool) : async () {
    switch (persistentEvents.get(eventId)) {
      case (null) { Runtime.trap("Event does not exist") };
      case (?event) {
        if (not AccessControl.isAdmin(accessControlState, caller) and not isPersistentEventCommitteeMember(event, caller)) {
          Runtime.trap("Unauthorized: Only admins or event committee members can update event status");
        };

        let updatedEvent = { event with isActive };
        persistentEvents.add(eventId, updatedEvent);
      };
    };
  };

  public shared ({ caller }) func setBuildEligibility(eventId : Text, user : Principal, wantsToBuild : Bool) : async () {
    switch (persistentEvents.get(eventId)) {
      case (null) { Runtime.trap("Event does not exist") };
      case (?event) {
        let isAuthorized = caller == user or 
                          AccessControl.isAdmin(accessControlState, caller) or 
                          isPersistentEventCommitteeMember(event, caller);
        
        if (not isAuthorized) {
          Runtime.trap("Unauthorized: Can only set your own build eligibility");
        };

        let newEligibility : BuildEligibility = {
          hasOptedIn = wantsToBuild;
          hasBuilt = false;
        };
        updateEligibilityForUser(eventId, user, newEligibility);
      };
    };
  };

  public shared ({ caller }) func contributeToConstruction(eventId : Text, part : Position) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can contribute to construction");
    };

    switch (persistentEvents.get(eventId), activeConstructions.get(eventId)) {
      case (null, _) { Runtime.trap("Event does not exist") };
      case (_, null) { Runtime.trap("No active construction") };
      case (?event, ?construction) {
        if (not event.isActive) {
          Runtime.trap("Event is not active");
        };

        switch (getEligibilityForUser(eventId, caller)) {
          case (null) { Runtime.trap("User not eligible to build") };
          case (?eligibility) {
            if (not eligibility.hasOptedIn) {
              Runtime.trap("User has not opted in to build");
            };
            if (eligibility.hasBuilt) {
              Runtime.trap("User has already built in this event");
            };
          };
        };

        construction.parts.add(part);
        setUserBuiltEligibility(eventId, caller, part);
      };
    };
  };

  public query ({ caller }) func getPersistentActiveEvent(communityName : Text) : async ?PersistentEventView {
    for ((eventId, event) in persistentEvents.entries()) {
      if (event.community == communityName and event.isActive) {
        return ?(
          {
            event with committee = event.committee.toArray()
          }
        );
      };
    };
    null;
  };

  public query ({ caller }) func isUserEligibleForEvent(eventId : Text, user : Principal) : async Bool {
    switch (persistentEvents.get(eventId)) {
      case (null) { Runtime.trap("Event does not exist") };
      case (?event) {
        let isAuthorized = caller == user or 
                          AccessControl.isAdmin(accessControlState, caller) or 
                          isPersistentEventCommitteeMember(event, caller);
        
        if (not isAuthorized) {
          Runtime.trap("Unauthorized: Can only check your own eligibility");
        };

        switch (getEligibilityForUser(eventId, user)) {
          case (null) { false };
          case (?eligibility) { eligibility.hasOptedIn and not eligibility.hasBuilt };
        };
      };
    };
  };

  func updateEligibilityForUser(eventId : Text, user : Principal, eligibility : BuildEligibility) {
    let eligibilityMap = switch (eventBuildEligibility.get(eventId)) {
      case (null) { Map.empty<Principal, BuildEligibility>() };
      case (?map) { map };
    };

    eligibilityMap.add(user, eligibility);
    eventBuildEligibility.add(eventId, eligibilityMap);
  };

  func getEligibilityForUser(eventId : Text, user : Principal) : ?BuildEligibility {
    switch (eventBuildEligibility.get(eventId)) {
      case (null) { null };
      case (?map) { map.get(user) };
    };
  };

  func setUserBuiltEligibility(eventId : Text, user : Principal, _position : Position) {
    switch (getEligibilityForUser(eventId, user)) {
      case (null) {};
      case (?currentEligibility) {
        let updatedEligibility = {
          currentEligibility with
          hasBuilt = true;
        };
        updateEligibilityForUser(eventId, user, updatedEligibility);
      };
    };
  };
};
