import { auth } from "../stores/authStore";

async function post(
  endpoint: string,
  body?: Record<string, string>
): Promise<any> {
  const response = await fetch(`https://${auth.instance}${endpoint}`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body) || undefined,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return response;
}

async function postParams(endpoint: string, body?: Record<string, string>) {
  const searchParams = new URLSearchParams(body).toString();
  const url = `https://${auth.instance}${endpoint}?${searchParams}`;

  const response = await fetch(url, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return response;
}

async function get(
  endpoint: string,
  params?: Record<string, any> | string
): Promise<any> {
  let paramsString;
  if (!params) {
    paramsString = "";
  } else if (typeof params === "string") {
    paramsString = `?${params}`;
  } else {
    paramsString = new URLSearchParams(params).toString();
    paramsString = `?${paramsString}`;
  }

  const url = "https://" + auth.instance + endpoint + paramsString;

  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${auth.token}` },
  });

  // TODO: error handling

  return response;
}

function getNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  const links = linkHeader.split(",").map((link) => link.trim());

  for (const link of links) {
    const [urlPart, relPart] = link.split(";").map((part) => part.trim());
    if (relPart === 'rel="next"') {
      return urlPart.slice(1, -1);
    }
  }

  return null;
}

export { post, postParams, get, getNextPageUrl };
