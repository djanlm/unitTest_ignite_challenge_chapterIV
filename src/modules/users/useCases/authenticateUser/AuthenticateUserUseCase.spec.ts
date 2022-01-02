import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let userRepositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticates User", () => {
  beforeEach(async () => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      userRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
  });

  it("Should be able to authenticate an user", async () => {
    const subscribedUserTest = {
      name: "Test Name",
      email: "email@test.com",
      password: "testePassword",
    };

    const { email, password } = subscribedUserTest;

    await createUserUseCase.execute(subscribedUserTest);
    const response = await authenticateUserUseCase.execute({ email, password });

    expect(response).toHaveProperty("token");
    expect(response.user.name).toBe("Test Name");
  });

  it("Should NOT be able to authenticate an user using an nonexistent email", async () => {
    const subscribedUserTest = {
      name: "Test Name",
      email: "email@test.com",
      password: "testePassword",
    };

    const { email, password } = subscribedUserTest;

    expect(async () => {
      await authenticateUserUseCase.execute({ email, password });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should NOT be able to authenticate an user using wrong password", async () => {
    const subscribedUserTest = {
      name: "Test Name",
      email: "email@test.com",
      password: "testePassword",
    };

    await createUserUseCase.execute(subscribedUserTest);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: subscribedUserTest.email,
        password: "wrongPassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
