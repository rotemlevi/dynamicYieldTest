const nodemailer = require("nodemailer");
module.exports = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "dynamicyeilds",
        pass: "Pkpknkj12+"
    }
});