exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" }, body: "" };
  }

  try {
    const { query, location, industry } = JSON.parse(event.body || "{}");
    const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

    if (!META_ACCESS_TOKEN) {
      return { statusCode: 500, body: JSON.stringify({ error: "Meta access token not configured" }) };
    }
    if (!query) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing query" }) };
    }

    const searchTerm = location ? query + " " + location : query;
    const fields = "id,name,location,phone,website,link,category,fan_count,about,single_line_address";
    const searchUrl = "https://graph.facebook.com/v19.0/pages/search?q=" + encodeURIComponent(searchTerm) + "&fields=" + fields + "&limit=25&access_token=" + META_ACCESS_TOKEN;

    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.error) {
      console.error("Meta API error:", data.error);
      return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: data.error.message || "Meta API error" }) };
    }

    if (!data.data || data.data.length === 0) {
      return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify([]) };
    }

    const leads = data.data.map(page => {
      let pageLocation = "";
      if (page.single_line_address) {
        pageLocation = page.single_line_address;
      } else if (page.location) {
        const loc = page.location;
        const parts = [loc.street, loc.city, loc.state, loc.zip, loc.country].filter(Boolean);
        pageLocation = parts.join(", ");
      }
      if (!pageLocation && location) pageLocation = location;

      let score = 55;
      if (page.phone) score += 12;
      if (page.website) score += 10;
      if (page.fan_count && page.fan_count > 100) score += 5;
      if (page.fan_count && page.fan_count > 1000) score += 5;
      if (page.about) score += 3;
      if (page.category) score += 5;
      if (pageLocation) score += 5;

      return {
        name: page.name || "",
        contact: page.name || "",
        email: "",
        phone: page.phone || "",
        type: industry || query,
        source: "Facebook",
        score: Math.min(score, 99),
        status: "New",
        location: pageLocation,
        website: page.website || page.link || "",
      };
    }).filter(lead => lead.name);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(leads),
    };
  } catch (err) {
    console.error("Facebook function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
