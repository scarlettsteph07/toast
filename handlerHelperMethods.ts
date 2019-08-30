export type Headers = {
  Host: string,
  'X-User-Key'?: string | null | '',
  'x-user-key'?: string | null | '',
};

export const getEventData = (eventData: string | object | null) => {
  return eventData === "string" ? JSON.parse(eventData) : eventData;
};

export const getUserKey = (headers: Headers) => {
  return headers["X-User-Key"] || headers["x-user-key"] || "demo";
};
