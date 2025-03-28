require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.PASSWORD, // Your email password or app password
    },
});

// Email sending function
const sendEmail = (email, status) => {
    const messages = {
        "Order Taken": "Your order has been successfully taken.",
        "Shipped": "Your product has been shipped successfully.",
        "Out for Delivery": "Your product is out for delivery.",
        "Delivered": "Your product has been delivered.",
        "Completed": "Your order is completed. Thank you!",
    };

    const mailOptions = {
        from: "Insight Delivered",
        to: email,
        subject: `Product Status Update: ${status}`,
        text: messages[status] || "Status updated.",
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending email:", error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
};

// API Route to update status and send email
// app.post("/update-status", (req, res) => {
//     const { email, status } = req.body;

//     if (!email || !status) {
//         return res.status(400).json({ message: "Email and status are required." });
//     }

//     sendEmail(email, status);
//     res.json({ message: `Email sent successfully for status: ${status}` });
// });
app.post("/update-status", async (req, res) => {
    const { email, status, note } = req.body;

    if (!email || !status) {
        return res.status(400).json({ message: "Missing email or status" });
    }

    try {
        // Email content
        const mailOptions = {
            from: `"Order Updates" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Order Status Updated: ${status}`,
            html: `
                <p>Hello,</p>
                <p>Your order status has been updated to: <strong>${status}</strong>.</p>
                <p><strong>Note:</strong> ${note || "No additional notes."}</p>
                <p>Thank you for your order!</p>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: `Email sent to ${email}` });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});
app.post("/send", async (req, res) => {
    const { email, subject, text } = req.body;

    if (!email || !subject || !text) {
        return res.status(400).json({ message: "Missing email, subject or text" });
        
    }

    try {
        // Email content
        const mailOptions = {
            from: `<${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
           html: `
    <p>Hello,</p>
    <p>${text.replace(/\n/g, '<br>')}</p>
    <p>Thank you for your order!</p>
`

   
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: `Email sent to ${email}` });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});




// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
