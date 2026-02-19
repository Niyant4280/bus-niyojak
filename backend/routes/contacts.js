const express = require("express");
const router = express.Router();

// @route   POST /api/contacts
// @desc    Submit a contact message (forwards to Formspree)
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, subject, and message",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Forward to Formspree
    const formspreeResponse = await fetch('https://formspree.io/f/xnnbyqkr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        _replyto: email.trim().toLowerCase(),
        _subject: `New Contact Form: ${subject.trim()}`,
      }),
    });

    if (formspreeResponse.ok) {
      res.status(201).json({
        success: true,
        message: "Your message has been sent successfully. We'll get back to you soon!",
      });
    } else {
      throw new Error('Formspree submission failed');
    }
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit your message. Please try again later.",
    });
  }
});

module.exports = router;