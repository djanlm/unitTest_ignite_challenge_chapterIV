import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
describe("Create user", () => {
  beforeEach(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
  });

  it("Should be able to create a new user", async () => {
    const userTest = {
      name: "Test Name",
      email: "email@test.com",
      password: "testePassword",
    };

    const createdUser = await createUserUseCase.execute(userTest);

    expect(createdUser).toHaveProperty("id");
  });

  it("Should NOT be able to create a new user with an existent email", async () => {
    expect(async () => {
      const userTest = {
        name: "Test Name",
        email: "email@test.com",
        password: "testePassword",
      };

      const userTest2WithSameEmail = {
        name: "Test Name2",
        email: "email@test.com",
        password: "testePassword2",
      };
      await createUserUseCase.execute(userTest);
      await createUserUseCase.execute(userTest2WithSameEmail);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
