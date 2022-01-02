import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to get balance", async () => {
    const userTest = {
      name: "Test Name",
      email: "email@test.com",
      password: "testePassword",
    };

    const user = await createUserUseCase.execute(userTest);

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("balance");
  });

  it("Should NOT be able to get balance if user does not exist", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "fakeId",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
