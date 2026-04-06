exports.handler = async (event) => {
  const { query, location, radius } = JSON.parse(event.body || '{}');
  const GOOGLE_API_KEY = 'AIzaSyBLf0yO5huNKB20JN2U1w4bgPxipPlE-Fo';

  try {
    const radiusMeters = parseInt(radius) * 1609;

    const geoRes = await fetch(
      'https://maps.googleapis.com/maps/api/geocode/json?address=' +
      encodeURIComponent(location) + '&key=' + GOOGLE_API_KEY
    );
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      return { statusCode: 200, body: JSON.stringify([]) };
    }

    const lat = geoData.results[0].geometry.location.lat;
    const lng = geoData.results[0].geometry.location.lng;

    const placesRes = await fetch(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' +
      lat + ',' + lng + '&radius=' + radiusMeters +
      '&keyword=' + encodeURIComponent(query) + '&key=' + GOOGLE_API_KEY
    );
    const placesData = await placesRes.json();
    if (!placesData.results) return { statusCode: 200, body: JSON.stringify([]) };

    const leads = await Promise.all(
      placesData.results.slice(0, 20).map(async (place) => {
        const detailRes = await fetch(
          'https://maps.googleapis.com/maps/api/place/details/json?place_id=' +
          place.place_id + '&fields=name,formatted_phone_number,formatted_address,website&key=' +
          GOOGLE_API_KEY
        );
        const detailData = await detailRes.json();
        const d = detailData.result || {};
        return {
          name: place.name || '',
          contact: place.name || '',
          email: '',
          phone: d.formatted_phone_number || '',
          type: query,
          source: 'Google Maps',
          score: Math.floor(Math.random() * 20) + 75,
          status: 'New',
          location: d.formatted_address || place.vicinity || location,
          website: d.website || '',
        };
      })
    );

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(leads.filter(l => l.name)),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};