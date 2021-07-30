import { getByTestId, render } from "@testing-library/vue";
import "@testing-library/jest-dom";
import Component from "../../src/views/Map.vue";

const mockGet = jest
  .fn()
  .mockImplementationOnce(() => ({ data: { data: [] } }));

jest.mock("axios", () => ({
  get: () => Promise.resolve(mockGet())
}));

test("Renders map component properly", async () => {
  render(Component);
  expect(mockGet).toHaveBeenCalled();
  expect(getByTestId(document.documentElement, "map")).toBeInTheDocument();
});
