import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { company, name, phone, email, interest, message } = req.body;
    
    console.log(`New Inquiry Received:`);
    console.log(`Company: ${company}`);
    console.log(`Name: ${name}`);
    console.log(`Phone: ${phone}`);
    console.log(`Email: ${email}`);
    console.log(`Interest: ${interest}`);
    console.log(`Message: ${message}`);

    // Google Form Submission
    const formId = process.env.GOOGLE_FORM_ID || '1-nPngmP3vrVCMCbrWUb_vW9QIfk1Z3ynzYxSeC2nVm4';
    const googleFormUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

    const formData = new URLSearchParams();
    formData.append(process.env.ENTRY_COMPANY || 'entry.123456789', company);
    formData.append(process.env.ENTRY_NAME || 'entry.987654321', name);
    formData.append(process.env.ENTRY_PHONE || 'entry.111222333', phone);
    formData.append(process.env.ENTRY_EMAIL || 'entry.444555666', email);
    formData.append(process.env.ENTRY_INTEREST || 'entry.777888999', interest || '');
    formData.append(process.env.ENTRY_MESSAGE || 'entry.000111222', message || '');

    try {
      const googleResponse = await fetch(googleFormUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!googleResponse.ok) {
        console.error('Google Form submission failed:', googleResponse.statusText);
      } else {
        console.log('Successfully submitted to Google Form');
      }
    } catch (error) {
      console.error('Error submitting to Google Form:', error);
    }

    res.status(200).json({ message: "Inquiry received successfully" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
