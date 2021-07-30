import { render } from "@testing-library/vue";

// import { setupServer } from "msw/node";
import Component from "../../src/views/Map.vue";

test("Renders map component properly", async () => {
  render(Component);
});
