//default model access
/*
   authentication: {
    item?: {};
    listKey?: string;
  };
  listKey?: string;
  operation?: string;
  originalInput?: {};
  gqlName?: string;
  itemId?: string;
  itemIds?: [string];
  */

const userIsAdmin = ({authentication: {item: user}}) => Boolean(user && user.isAdmin);

const isAuthenticated = ({authentication: {item: user}}) => Boolean(user);


const isOwner = ({authentication: {item: user}}) => {
    if (!user) {
        return false;
    }
    return {createdBy: user.id}
}

module.exports.defaultAccessList = {
    create: userIsAdmin,
    read: true,
    update: userIsAdmin,
    delete: userIsAdmin,
}
