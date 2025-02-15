// server.ts
const PORT = 3000;

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const filePath = `./build${url.pathname}`;

  try {
    const file = await Deno.readFile(filePath);
    const headers = new Headers();

    if (filePath.endsWith(".html")) headers.set("content-type", "text/html");
    else if (filePath.endsWith(".js")) {
      headers.set("content-type", "application/javascript");
    } else if (filePath.endsWith(".css")) {
      headers.set("content-type", "text/css"); // ✅ Serve all CSS files
    } else if (filePath.endsWith(".png")) {
      headers.set("content-type", "image/png");
    } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
      headers.set("content-type", "image/jpeg");
    }

    return new Response(file, { headers });
  } catch {
    // Serve index.html for SPA routing
    try {
      const file = await Deno.readFile("./build/index.html");
      return new Response(file, { headers: { "content-type": "text/html" } });
    } catch {
      return new Response("404 Not Found", { status: 404 });
    }
  }
};

console.log(`Server is running on http://localhost:${PORT}`);
await Deno.serve({ port: PORT }, handler);
