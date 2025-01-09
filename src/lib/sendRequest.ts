import { auth } from "../stores/authStore";

async function sendPostRequest(
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

async function sendGetRequest(
  endpoint: string,
  query?: Record<string, any>
): Promise<any> {
  const searchParams = new URLSearchParams(query).toString();

  const response = await fetch(
    `https://${auth.instance}${endpoint}?${searchParams}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${auth.token}` },
    }
  );

  // TODO: error handling

  return response;
}

export { sendPostRequest, sendGetRequest };
