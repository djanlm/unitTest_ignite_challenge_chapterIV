import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Shows user profile", () => {
  beforeEach(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(userRepositoryInMemory);
  });

  it("Should be able to fetch user data", async () => {
    const userTest = {
      name: "Test Name",
      email: "email@test.com",
      password: "testePassword",
    };

    const user = await createUserUseCase.execute(userTest);

    const user_id = user.id as string;
    const response = await showUserProfileUseCase.execute(user_id);

    expect(response).toHaveProperty("email");
    expect(response.name).toBe("Test Name");
  });

  it("Should NOT be able to fetch profile of nonexistent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("wrongID");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
