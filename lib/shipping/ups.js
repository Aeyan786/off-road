/**
 * UPS Rating API client. Everything here runs on the server: the client id,
 * secret and access token must never reach the browser.
 *
 * Configuration (all server-side env vars):
 *   UPS_ENV               "cie" (test, default) or "production"
 *   UPS_CLIENT_ID         OAuth client id from the UPS Developer Portal
 *   UPS_CLIENT_SECRET     OAuth client secret
 *   UPS_ACCOUNT_NUMBER    UPS shipper number (optional; needed for negotiated rates)
 *   UPS_RATING_VERSION    Rating API version, default "v1"
 *   UPS_SERVICE_CODES     optional allow-list, e.g. "11,65,07" (blank = all UPS returns)
 *   UPS_ORIGIN_NAME/LINE1/CITY/REGION/POSTCODE/COUNTRY   where we ship from
 */

const HOSTS = {
  cie: "https://wwwcie.ups.com",
  production: "https://onlinetools.ups.com",
};

/**
 * UPS returns a service code, not always a name. These are UPS's own service
 * names per origin country — not prices, and nothing here is invented.
 */
const SERVICE_NAMES = {
  GB: {
    "07": "UPS Express",
    "08": "UPS Expedited",
    11: "UPS Standard",
    54: "UPS Express Plus",
    65: "UPS Express Saver",
    70: "UPS Access Point Economy",
  },
  US: {
    "01": "UPS Next Day Air",
    "02": "UPS 2nd Day Air",
    "03": "UPS Ground",
    12: "UPS 3 Day Select",
    13: "UPS Next Day Air Saver",
    14: "UPS Next Day Air Early",
    59: "UPS 2nd Day Air A.M.",
    "07": "UPS Worldwide Express",
    "08": "UPS Worldwide Expedited",
    11: "UPS Standard",
    54: "UPS Worldwide Express Plus",
    65: "UPS Worldwide Saver",
  },
};

export function upsEnvironment() {
  return process.env.UPS_ENV === "production" ? "production" : "cie";
}

const host = () => HOSTS[upsEnvironment()];

/** The address we ship from, or null when it hasn't been configured. */
export function originAddress() {
  const line1 = process.env.UPS_ORIGIN_LINE1;
  const city = process.env.UPS_ORIGIN_CITY;
  const postcode = process.env.UPS_ORIGIN_POSTCODE;
  const country = process.env.UPS_ORIGIN_COUNTRY;
  if (!line1 || !city || !postcode || !country) return null;
  return {
    name: process.env.UPS_ORIGIN_NAME || "Off Road Performance",
    line1,
    city,
    region: process.env.UPS_ORIGIN_REGION || "",
    postcode,
    country: country.toUpperCase(),
  };
}

/** Whether UPS rating can run at all. */
export function isUpsConfigured() {
  return Boolean(process.env.UPS_CLIENT_ID && process.env.UPS_CLIENT_SECRET && originAddress());
}

// OAuth tokens last ~4 hours; cache in module memory and refresh a minute early.
let cachedToken = null;

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const credentials = Buffer.from(
    `${process.env.UPS_CLIENT_ID}:${process.env.UPS_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${host()}/security/v1/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `UPS authentication failed (${response.status}): ${body.error_description ?? body.error ?? "unknown error"}`
    );
  }

  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (Number(body.expires_in ?? 3600) - 60) * 1000,
  };
  return cachedToken.value;
}

const upsAddress = (a) => ({
  AddressLine: [a.line1, a.line2].filter(Boolean),
  City: a.city,
  ...(a.region || a.county ? { StateProvinceCode: (a.region ?? a.county).slice(0, 5) } : {}),
  PostalCode: String(a.postcode ?? "").replace(/\s+/g, ""),
  CountryCode: String(a.country ?? "").toUpperCase(),
});

const serviceName = (code, originCountry) =>
  SERVICE_NAMES[originCountry]?.[code] ?? `UPS service ${code}`;

/**
 * Asks UPS to "Shop" — every service available for this destination and
 * these packages, with its price.
 *
 * @param {{destination: object, packages: {weightKg: number}[]}} input
 * @returns {Promise<{code: string, name: string, cost: number, currency: string}[]>}
 *   sorted cheapest first.
 */
export async function shopRates({ destination, packages }) {
  const origin = originAddress();
  if (!origin) throw new Error("The shipping origin address hasn't been configured.");
  if (!packages?.length) throw new Error("Nothing to rate.");

  const shipper = {
    Name: origin.name,
    ...(process.env.UPS_ACCOUNT_NUMBER ? { ShipperNumber: process.env.UPS_ACCOUNT_NUMBER } : {}),
    Address: upsAddress(origin),
  };

  const payload = {
    RateRequest: {
      Request: { RequestOption: "Shop" },
      Shipment: {
        Shipper: shipper,
        ShipFrom: { Name: origin.name, Address: upsAddress(origin) },
        ShipTo: { Name: destination.name || "Customer", Address: upsAddress(destination) },
        NumOfPieces: String(packages.length),
        Package: packages.map((pkg) => ({
          // "02" = customer supplied packaging. Dimensions are deliberately
          // omitted: package sizing comes with the future packing logic.
          PackagingType: { Code: "02" },
          PackageWeight: {
            UnitOfMeasurement: { Code: "KGS" },
            Weight: pkg.weightKg.toFixed(1),
          },
        })),
      },
    },
  };

  const version = process.env.UPS_RATING_VERSION || "v1";
  const response = await fetch(`${host()}/api/rating/${version}/Shop`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
      transId: `rate-${Date.now()}`,
      transactionSrc: "offroad-checkout",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body?.response?.errors?.[0];
    throw new Error(
      `UPS rating failed (${response.status}): ${detail ? `${detail.code} ${detail.message}` : "unknown error"}`
    );
  }

  const rated = [].concat(body?.RateResponse?.RatedShipment ?? []);
  const allowed = (process.env.UPS_SERVICE_CODES ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);

  return rated
    .map((shipment) => {
      const charges = shipment.NegotiatedRateCharges?.TotalCharge ?? shipment.TotalCharges;
      const code = String(shipment.Service?.Code ?? "");
      return {
        code,
        name: shipment.Service?.Description?.trim() || serviceName(code, origin.country),
        cost: Math.round(Number(charges?.MonetaryValue ?? 0) * 100) / 100,
        currency: String(charges?.CurrencyCode ?? "").toUpperCase(),
      };
    })
    .filter((rate) => rate.code && rate.cost > 0 && (!allowed.length || allowed.includes(rate.code)))
    .sort((a, b) => a.cost - b.cost);
}
