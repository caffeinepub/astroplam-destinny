/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const _BlogPost = IDL.Record({
  id: IDL.Text,
  title: IDL.Text,
  content: IDL.Text,
  author: IDL.Text,
  createdAt: IDL.Int,
  published: IDL.Bool,
});

const _UserProfile = IDL.Record({
  id: IDL.Principal,
  name: IDL.Text,
  email: IDL.Text,
  createdAt: IDL.Int,
});

const _Service = IDL.Record({
  id: IDL.Nat,
  name: IDL.Text,
  price: IDL.Nat,
});

const _Notice = IDL.Record({
  id: IDL.Text,
  title: IDL.Text,
  message: IDL.Text,
  createdAt: IDL.Int,
  active: IDL.Bool,
});

const _Person = IDL.Record({
  name: IDL.Text,
  dob: IDL.Opt(IDL.Text),
  tob: IDL.Opt(IDL.Text),
});

const _Inquiry = IDL.Record({
  id: IDL.Text,
  serviceId: IDL.Nat,
  visitorName: IDL.Text,
  dob: IDL.Opt(IDL.Text),
  tob: IDL.Opt(IDL.Text),
  question: IDL.Text,
  pastLifeNotes: IDL.Text,
  handPicture: IDL.Opt(IDL.Vec(IDL.Nat8)),
  palmPhotos: IDL.Vec(IDL.Opt(IDL.Vec(IDL.Nat8))),
  relationshipPerson2: IDL.Opt(_Person),
  birthCountry: IDL.Opt(IDL.Text),
  city: IDL.Opt(IDL.Text),
  state: IDL.Opt(IDL.Text),
  seedNumber: IDL.Opt(IDL.Nat),
  submittedAt: IDL.Int,
  authorId: IDL.Opt(IDL.Principal),
});

const _VisitorID = IDL.Record({
  service: IDL.Text,
  expiresAt: IDL.Int,
  username: IDL.Text,
  password: IDL.Text,
  createdAt: IDL.Int,
  visitorName: IDL.Text,
});

const _NumerologyUser = IDL.Record({
  username: IDL.Text,
  passwordHash: IDL.Text,
  sectionLevel: IDL.Nat,
});

const _VisitorQuery = IDL.Record({
  name: IDL.Text,
  contactInfo: IDL.Text,
  message: IDL.Text,
  submittedAt: IDL.Int,
});

const _UserRole = IDL.Variant({
  admin: IDL.Null,
  user: IDL.Null,
  guest: IDL.Null,
});

const _VisitorLoginResult = IDL.Record({
  service: IDL.Text,
  visitorName: IDL.Text,
});

const _ServiceAccess = IDL.Tuple(IDL.Text, IDL.Bool);

export const idlService = IDL.Service({
  // Authorization
  _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
  isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
  assignCallerUserRole: IDL.Func([IDL.Principal, _UserRole], [], []),
  getCallerUserRole: IDL.Func([], [_UserRole], ['query']),
  // Services
  getServices: IDL.Func([], [IDL.Vec(_Service)], ['query']),
  // Blog Posts
  getAllPosts: IDL.Func([], [IDL.Vec(_BlogPost)], ['query']),
  getAllPostsAdmin: IDL.Func([], [IDL.Vec(_BlogPost)], ['query']),
  createPost: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []),
  updatePost: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [], []),
  deletePost: IDL.Func([IDL.Text], [], []),
  publishPost: IDL.Func([IDL.Text], [], []),
  adminGetAllPosts: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(_BlogPost)], ['query']),
  adminCreatePost: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []),
  adminUpdatePost: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [], []),
  adminDeletePost: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  adminPublishPost: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  // Notices
  noticeList: IDL.Func([], [IDL.Vec(_Notice)], ['query']),
  noticeListAll: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(_Notice)], ['query']),
  noticeCreate: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []),
  noticeDelete: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  noticeToggleActive: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  adminCreateNotice: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []),
  adminListNotices: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(_Notice)], ['query']),
  adminDeleteNotice: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  adminToggleNotice: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  // Inquiries
  submitInquiry: IDL.Func([_Inquiry], [IDL.Text], []),
  getAllInquiries: IDL.Func([], [IDL.Vec(_Inquiry)], ['query']),
  deleteInquiry: IDL.Func([IDL.Text], [], []),
  // User Profiles
  getCallerUserProfile: IDL.Func([], [IDL.Opt(_UserProfile)], ['query']),
  getUserProfile: IDL.Func([IDL.Principal], [IDL.Opt(_UserProfile)], ['query']),
  saveCallerUserProfile: IDL.Func([_UserProfile], [], []),
  // Visitor IDs
  visitorValidateId: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], ['query']),
  visitorLoginByEmail: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(_VisitorLoginResult)], ['query']),
  visitorCreateId: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [], []),
  visitorListIds: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(_VisitorID)], ['query']),
  visitorDeleteId: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  adminCreateVisitorId: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [], []),
  adminListVisitorIds: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(_VisitorID)], ['query']),
  adminDeleteVisitorId: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  openCreateVisitorId: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [], []),
  openListVisitorIds: IDL.Func([], [IDL.Vec(_VisitorID)], ['query']),
  openDeleteVisitorId: IDL.Func([IDL.Text], [], []),
  // Numerology
  numerologyLogin: IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
  numerologyCreateUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [], []),
  numerologyListUsers: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(_NumerologyUser)], ['query']),
  numerologyDeleteUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  // Visitor Queries
  submitVisitorQuery: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  getVisitorQueries: IDL.Func([], [IDL.Vec(_VisitorQuery)], ['query']),
  adminGetVisitorQueries: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(_VisitorQuery)], ['query']),
  // Service Access
  serviceSetPublic: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Bool], [], []),
  serviceIsPublic: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const BlogPost = IDL.Record({
    id: IDL.Text,
    title: IDL.Text,
    content: IDL.Text,
    author: IDL.Text,
    createdAt: IDL.Int,
    published: IDL.Bool,
  });
  const UserProfile = IDL.Record({
    id: IDL.Principal,
    name: IDL.Text,
    email: IDL.Text,
    createdAt: IDL.Int,
  });
  const Service = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    price: IDL.Nat,
  });
  const Notice = IDL.Record({
    id: IDL.Text,
    title: IDL.Text,
    message: IDL.Text,
    createdAt: IDL.Int,
    active: IDL.Bool,
  });
  const Person = IDL.Record({
    name: IDL.Text,
    dob: IDL.Opt(IDL.Text),
    tob: IDL.Opt(IDL.Text),
  });
  const Inquiry = IDL.Record({
    id: IDL.Text,
    serviceId: IDL.Nat,
    visitorName: IDL.Text,
    dob: IDL.Opt(IDL.Text),
    tob: IDL.Opt(IDL.Text),
    question: IDL.Text,
    pastLifeNotes: IDL.Text,
    handPicture: IDL.Opt(IDL.Vec(IDL.Nat8)),
    palmPhotos: IDL.Vec(IDL.Opt(IDL.Vec(IDL.Nat8))),
    relationshipPerson2: IDL.Opt(Person),
    birthCountry: IDL.Opt(IDL.Text),
    city: IDL.Opt(IDL.Text),
    state: IDL.Opt(IDL.Text),
    seedNumber: IDL.Opt(IDL.Nat),
    submittedAt: IDL.Int,
    authorId: IDL.Opt(IDL.Principal),
  });
  const VisitorID = IDL.Record({
    service: IDL.Text,
    expiresAt: IDL.Int,
    username: IDL.Text,
    password: IDL.Text,
    createdAt: IDL.Int,
    visitorName: IDL.Text,
  });
  const NumerologyUser = IDL.Record({
    username: IDL.Text,
    passwordHash: IDL.Text,
    sectionLevel: IDL.Nat,
  });
  const VisitorQuery = IDL.Record({
    name: IDL.Text,
    contactInfo: IDL.Text,
    message: IDL.Text,
    submittedAt: IDL.Int,
  });
  const UserRole = IDL.Variant({
    admin: IDL.Null,
    user: IDL.Null,
    guest: IDL.Null,
  });
  const VisitorLoginResult = IDL.Record({
    service: IDL.Text,
    visitorName: IDL.Text,
  });
  return IDL.Service({
    _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
    isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
    assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
    getCallerUserRole: IDL.Func([], [UserRole], ['query']),
    getServices: IDL.Func([], [IDL.Vec(Service)], ['query']),
    getAllPosts: IDL.Func([], [IDL.Vec(BlogPost)], ['query']),
    getAllPostsAdmin: IDL.Func([], [IDL.Vec(BlogPost)], ['query']),
    createPost: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []),
    updatePost: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [], []),
    deletePost: IDL.Func([IDL.Text], [], []),
    publishPost: IDL.Func([IDL.Text], [], []),
    adminGetAllPosts: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(BlogPost)], ['query']),
    adminCreatePost: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []),
    adminUpdatePost: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [], []),
    adminDeletePost: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    adminPublishPost: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    noticeList: IDL.Func([], [IDL.Vec(Notice)], ['query']),
    noticeListAll: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(Notice)], ['query']),
    noticeCreate: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []),
    noticeDelete: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    noticeToggleActive: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    adminCreateNotice: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []),
    adminListNotices: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(Notice)], ['query']),
    adminDeleteNotice: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    adminToggleNotice: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    submitInquiry: IDL.Func([Inquiry], [IDL.Text], []),
    getAllInquiries: IDL.Func([], [IDL.Vec(Inquiry)], ['query']),
    deleteInquiry: IDL.Func([IDL.Text], [], []),
    getCallerUserProfile: IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    getUserProfile: IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    saveCallerUserProfile: IDL.Func([UserProfile], [], []),
    visitorValidateId: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], ['query']),
    visitorLoginByEmail: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(VisitorLoginResult)], ['query']),
    visitorCreateId: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [], []),
    visitorListIds: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(VisitorID)], ['query']),
    visitorDeleteId: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    adminCreateVisitorId: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [], []),
    adminListVisitorIds: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(VisitorID)], ['query']),
    adminDeleteVisitorId: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    openCreateVisitorId: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [], []),
    openListVisitorIds: IDL.Func([], [IDL.Vec(VisitorID)], ['query']),
    openDeleteVisitorId: IDL.Func([IDL.Text], [], []),
    numerologyLogin: IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    numerologyCreateUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [], []),
    numerologyListUsers: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(NumerologyUser)], ['query']),
    numerologyDeleteUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    submitVisitorQuery: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    getVisitorQueries: IDL.Func([], [IDL.Vec(VisitorQuery)], ['query']),
    adminGetVisitorQueries: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(VisitorQuery)], ['query']),
    serviceSetPublic: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Bool], [], []),
    serviceIsPublic: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
