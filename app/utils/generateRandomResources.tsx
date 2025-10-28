import { faker } from "@faker-js/faker";

export function generateRandomResources(count: number = 15) {
  const resources = [];
  for (let i = 0; i < count; i++) {
    resources.push({
      id: i + 1,
      name: faker.person.fullName(),
      color: faker.color.human(),
    });
  }
  return resources;
}
