const jwt = require("jsonwebtoken");
const { SECRET } = require("../configs/env.config");
/**
 * private function generateToken
 * @param user 
 * @param secretSignature 
 * @param tokenLife 
 */
let generateToken = (user, tokenLife) => {
    // Thực hiện ký và tạo token
    return new Promise((resolve, reject) => {
      jwt.sign(
        {
          email: user.email,
          name: user.name,
          picture: user.picture.split('=')[0]
        },
        SECRET,
        {
          algorithm: "HS256",
          expiresIn: tokenLife,
        },
        (error, token) => {
          if (error) {
            return reject(error);
          }
          resolve(token);
      });
    })
    
}
/**
 * This module used for verify jwt token
 * @param {*} token 
 * @param {*} secretKey 
 */
let verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
}
module.exports = {
  generateToken: generateToken,
  verifyToken: verifyToken,
};