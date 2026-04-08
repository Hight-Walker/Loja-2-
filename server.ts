import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference } from 'mercadopago';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mercado Pago Integration
  app.post("/api/create-preference", async (req, res) => {
    try {
      const { items, customer, accessToken: clientAccessToken } = req.body;
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || clientAccessToken;

      if (!accessToken) {
        return res.status(500).json({ error: "Mercado Pago Access Token not configured. Please set it in the Dev Console or Environment Variables." });
      }

      const client = new MercadoPagoConfig({ accessToken });
      const preference = new Preference(client);

      const body = {
        items: items.map((item: any) => ({
          id: item.id,
          title: item.name,
          unit_price: Number(item.price),
          quantity: Number(item.quantity),
          currency_id: 'BRL'
        })),
        payer: {
          name: customer.name,
          email: customer.email,
        },
        back_urls: {
          success: `${process.env.APP_URL}/checkout?status=success`,
          failure: `${process.env.APP_URL}/checkout?status=failure`,
          pending: `${process.env.APP_URL}/checkout?status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.APP_URL}/api/webhooks/mercadopago`,
      };

      const result = await preference.create({ body });
      res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
      console.error("Error creating Mercado Pago preference:", error);
      res.status(500).json({ error: "Failed to create payment preference" });
    }
  });

  app.post("/api/webhooks/mercadopago", (req, res) => {
    // In a real app, you would handle the payment notification here
    // and update the order status in your database.
    console.log("Mercado Pago Webhook received:", req.body);
    res.status(200).send("OK");
  });

  // API routes placeholder for future SQLite integration
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Chronos API is running" });
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
