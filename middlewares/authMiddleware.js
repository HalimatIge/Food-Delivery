// const jwt = require("jsonwebtoken");

// const protect = (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token)
//     // return res.status(401).json({ message: "No token, access denied" });
//     return res
//       .status(401)
//       .json({ status: false, message: "No token, access denied" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach to request
//     next();
//   } catch {
//     return res.status(401).json({ status: false, message: "Invalid token" });
//   }

//   // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//   //   if (err)
//   //     return res.status(403).json({ message: "Invalid or expired token" });

//   //   req.user = decoded;
//   //   next();
//   // });
// };

// module.exports = { protect };
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ status: false, message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ status: false, message: "Invalid token" });
  }
};

module.exports = { protect };
