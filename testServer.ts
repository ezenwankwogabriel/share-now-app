import "whatwg-fetch";
import { rest } from "msw";
import { setupServer } from "msw/node";

const api = "https://web-chapter-coding-challenge-api-eu-central-1.dev.architecture.ridedev.io/api/architecture/web-chapter-coding-challenge-api";

const locationResponse = [
  {
    id: 1,
    name: "Hamburg",
    mapSection: {
      center: { latitude: 53.55454, longitude: 9.99185 },
      lowerRight: { latitude: 53.434236, longitude: 10.356674 },
      upperLeft: { latitude: 53.709866, longitude: 9.767532 }
    }
  },
  {
    id: 1,
    name: "Berlin",
    mapSection: {
      center: { latitude: 52.51856, longitude: 13.404581 },
      lowerRight: { latitude: 52.35647, longitude: 13.798141 },
      upperLeft: { latitude: 52.699846, longitude: 12.84645 }
    }
  }
];

const carResponse = [
  {
    fuel: 0.8,
    id: 1,
    locationId: 2,
    model: "SMART_42_CABRIO",
    numberPlate: "B-HT2942",
    position: {
      latitude: 52.52203543972956,
      longitude: 13.408582236171169
    },
    vin: "3VWRA71K491GSL0JW"
  },
  {
    fuel: 0.5,
    id: 2,
    locationId: 2,
    model: "DELOREAN",
    numberPlate: "B-KK8241",
    position: {
      latitude: 52.50539194710388,
      longitude: 13.48875828005415
    }
  }
];

const server = setupServer(
  rest.get(`${api}/locations`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: locationResponse }));
  }),
  rest.get(`${api}/*`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: carResponse }));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

export { server, rest };
