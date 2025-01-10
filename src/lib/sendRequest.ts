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
  params?: Record<string, any>
): Promise<any> {
  let paramsString = new URLSearchParams(params).toString();
  if (paramsString) paramsString = `?${paramsString}`;
  const url = "https://" + auth.instance + endpoint + paramsString;

  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${auth.token}` },
  });

  // TODO: error handling

  return response;
}

export { post, postParams, get };
