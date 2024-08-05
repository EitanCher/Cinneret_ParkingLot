module.exports = {
  getUsers: `SELECT * FROM Users;`,

  getUserById: `SELECT * FROM Users WHERE idUsers = ?;`,

  insertUser: `INSERT INTO Users (persId, FirstName, LastName, Phone, Email, SubscriptStart, SubscriptEnd, Active)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,

  updateUser: `UPDATE Users
                  SET persId = ?, FirstName = ?, LastName = ?, Phone = ?, Email = ?, SubscriptStart = ?, SubscriptEnd = ?, Active = ?
                  WHERE idUsers = ?;`,

  deleteUser: `DELETE FROM Users WHERE idUsers = ?;`,
};
