export const ParentValueListenerGroup = Symbol("ParentValueListenerGroup");
export const ChildrenValueListenerGroup = Symbol("ChildrenValueListenerGroup");
export const ThisValueListenerGroup = Symbol("ThisValueListenerGroup");
export const UserListenerGroup = Symbol("UserListenerGroup");

export const defaultGroups = [
  ThisValueListenerGroup,
  ParentValueListenerGroup,
  ChildrenValueListenerGroup,
];
